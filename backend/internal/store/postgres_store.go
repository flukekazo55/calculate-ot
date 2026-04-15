package store

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"regexp"
	"sync"

	_ "github.com/lib/pq"
)

var tableNamePattern = regexp.MustCompile(`[^a-zA-Z0-9_]`)

// PostgresStore persists OT payloads in PostgreSQL.
type PostgresStore struct {
	db        *sql.DB
	tableName string
	rowID     string

	initOnce sync.Once
	initErr  error
}

// NewPostgresStore creates a PostgreSQL-backed OT repository.
func NewPostgresStore(ctx context.Context, databaseURL, tableName, rowID string) (*PostgresStore, error) {
	safeTableName := tableNamePattern.ReplaceAllString(tableName, "")
	if safeTableName == "" {
		return nil, fmt.Errorf("invalid OT_TABLE_NAME")
	}

	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("open postgres: %w", err)
	}
	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	store := &PostgresStore{
		db:        db,
		tableName: safeTableName,
		rowID:     rowID,
	}
	if err := store.ensureSchema(ctx); err != nil {
		_ = db.Close()
		return nil, err
	}
	return store, nil
}

// Close releases database connections.
func (p *PostgresStore) Close() error {
	return p.db.Close()
}

// Load reads OT data from PostgreSQL.
func (p *PostgresStore) Load(ctx context.Context) (OTData, error) {
	if err := p.ensureSchema(ctx); err != nil {
		return OTData{}, err
	}

	query := fmt.Sprintf("SELECT payload FROM %s WHERE id = $1 LIMIT 1", p.tableName)
	var raw []byte
	err := p.db.QueryRowContext(ctx, query, p.rowID).Scan(&raw)
	if err != nil {
		if err == sql.ErrNoRows {
			return DefaultOTData(), nil
		}
		return OTData{}, fmt.Errorf("select OT data: %w", err)
	}

	var payload OTData
	if err := json.Unmarshal(raw, &payload); err != nil {
		return OTData{}, fmt.Errorf("parse OT payload JSON: %w", err)
	}
	return NormalizeOTData(payload), nil
}

// Save upserts OT data into PostgreSQL.
func (p *PostgresStore) Save(ctx context.Context, data OTData) (OTData, error) {
	if err := p.ensureSchema(ctx); err != nil {
		return OTData{}, err
	}

	normalized := NormalizeOTData(data)
	payload, err := json.Marshal(normalized)
	if err != nil {
		return OTData{}, fmt.Errorf("encode OT payload JSON: %w", err)
	}

	query := fmt.Sprintf(`
		INSERT INTO %s (id, payload, updated_at)
		VALUES ($1, $2::jsonb, NOW())
		ON CONFLICT (id)
		DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
	`, p.tableName)
	if _, err := p.db.ExecContext(ctx, query, p.rowID, string(payload)); err != nil {
		return OTData{}, fmt.Errorf("upsert OT payload: %w", err)
	}

	return normalized, nil
}

// Reset replaces current OT data with an empty payload.
func (p *PostgresStore) Reset(ctx context.Context) (OTData, error) {
	return p.Save(ctx, DefaultOTData())
}

func (p *PostgresStore) ensureSchema(ctx context.Context) error {
	p.initOnce.Do(func() {
		query := fmt.Sprintf(`
			CREATE TABLE IF NOT EXISTS %s (
				id TEXT PRIMARY KEY,
				payload JSONB NOT NULL,
				updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)
		`, p.tableName)
		if _, err := p.db.ExecContext(ctx, query); err != nil {
			p.initErr = fmt.Errorf("create table %s: %w", p.tableName, err)
		}
	})
	return p.initErr
}
