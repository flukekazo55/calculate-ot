package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/lib/pq"
)

// PostgresUserStore persists users in PostgreSQL.
type PostgresUserStore struct {
	db        *sql.DB
	tableName string

	initOnce sync.Once
	initErr  error
}

// NewPostgresUserStore creates a PostgreSQL-backed user repository.
func NewPostgresUserStore(ctx context.Context, databaseURL, tableName string) (*PostgresUserStore, error) {
	safeTableName := tableNamePattern.ReplaceAllString(strings.TrimSpace(tableName), "")
	if safeTableName == "" {
		return nil, fmt.Errorf("invalid USERS_TABLE_NAME")
	}

	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("open postgres: %w", err)
	}
	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	store := &PostgresUserStore{
		db:        db,
		tableName: safeTableName,
	}
	if err := store.ensureSchema(ctx); err != nil {
		_ = db.Close()
		return nil, err
	}
	return store, nil
}

// Close releases database connections.
func (p *PostgresUserStore) Close() error {
	return p.db.Close()
}

// Create inserts a new user row.
func (p *PostgresUserStore) Create(ctx context.Context, user User) (User, error) {
	if err := p.ensureSchema(ctx); err != nil {
		return User{}, err
	}

	query := fmt.Sprintf(`
		INSERT INTO %s (id, username, email, password_hash)
		VALUES ($1, $2, $3, $4)
		RETURNING created_at
	`, p.tableName)

	var createdAt time.Time
	err := p.db.QueryRowContext(ctx, query, user.ID, user.Username, user.Email, user.PasswordHash).Scan(&createdAt)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			return User{}, ErrUserExists
		}
		return User{}, fmt.Errorf("insert user: %w", err)
	}

	user.CreatedAt = createdAt.UTC().Format(time.RFC3339)
	return user, nil
}

// FindByIdentity finds by username or email (case-insensitive).
func (p *PostgresUserStore) FindByIdentity(ctx context.Context, identity string) (User, error) {
	if err := p.ensureSchema(ctx); err != nil {
		return User{}, err
	}

	query := fmt.Sprintf(`
		SELECT id, username, email, password_hash, created_at
		FROM %s
		WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
		ORDER BY created_at ASC
		LIMIT 1
	`, p.tableName)

	var user User
	var createdAt time.Time
	err := p.db.QueryRowContext(ctx, query, strings.TrimSpace(identity)).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&createdAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return User{}, ErrUserNotFound
		}
		return User{}, fmt.Errorf("select user by identity: %w", err)
	}

	user.CreatedAt = createdAt.UTC().Format(time.RFC3339)
	return user, nil
}

func (p *PostgresUserStore) ensureSchema(ctx context.Context) error {
	p.initOnce.Do(func() {
		createTableQuery := fmt.Sprintf(`
			CREATE TABLE IF NOT EXISTS %s (
				id TEXT PRIMARY KEY,
				username TEXT NOT NULL,
				email TEXT NOT NULL,
				password_hash TEXT NOT NULL,
				created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
			)
		`, p.tableName)
		if _, err := p.db.ExecContext(ctx, createTableQuery); err != nil {
			p.initErr = fmt.Errorf("create users table %s: %w", p.tableName, err)
			return
		}

		usernameIdx := fmt.Sprintf(`
			CREATE UNIQUE INDEX IF NOT EXISTS idx_%s_username_lower
			ON %s ((LOWER(username)))
		`, p.tableName, p.tableName)
		if _, err := p.db.ExecContext(ctx, usernameIdx); err != nil {
			p.initErr = fmt.Errorf("create username index for %s: %w", p.tableName, err)
			return
		}

		emailIdx := fmt.Sprintf(`
			CREATE UNIQUE INDEX IF NOT EXISTS idx_%s_email_lower
			ON %s ((LOWER(email)))
		`, p.tableName, p.tableName)
		if _, err := p.db.ExecContext(ctx, emailIdx); err != nil {
			p.initErr = fmt.Errorf("create email index for %s: %w", p.tableName, err)
			return
		}
	})
	return p.initErr
}

var _ UserRepository = (*PostgresUserStore)(nil)
