package store

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sync"
)

// FileStore persists OT payloads into a local JSON file.
type FileStore struct {
	path string
	mu   sync.Mutex
}

// NewFileStore creates a file-backed OT repository.
func NewFileStore(path string) *FileStore {
	return &FileStore{path: path}
}

// Load reads OT data from the configured JSON file.
func (f *FileStore) Load(ctx context.Context) (OTData, error) {
	if err := ctx.Err(); err != nil {
		return OTData{}, err
	}

	f.mu.Lock()
	defer f.mu.Unlock()

	if err := f.ensureFile(); err != nil {
		return OTData{}, err
	}

	raw, err := os.ReadFile(f.path)
	if err != nil {
		return OTData{}, fmt.Errorf("read data file: %w", err)
	}

	var payload OTData
	if len(raw) == 0 {
		return DefaultOTData(), nil
	}
	if err := json.Unmarshal(raw, &payload); err != nil {
		return OTData{}, fmt.Errorf("parse data file JSON: %w", err)
	}

	return NormalizeOTData(payload), nil
}

// Save writes OT data into the configured JSON file.
func (f *FileStore) Save(ctx context.Context, data OTData) (OTData, error) {
	if err := ctx.Err(); err != nil {
		return OTData{}, err
	}

	normalized := NormalizeOTData(data)

	f.mu.Lock()
	defer f.mu.Unlock()

	if err := f.ensureFile(); err != nil {
		return OTData{}, err
	}

	encoded, err := json.MarshalIndent(normalized, "", "  ")
	if err != nil {
		return OTData{}, fmt.Errorf("encode OT data: %w", err)
	}

	if err := os.WriteFile(f.path, encoded, 0o644); err != nil {
		return OTData{}, fmt.Errorf("write data file: %w", err)
	}

	return normalized, nil
}

// Reset replaces current OT data with an empty payload.
func (f *FileStore) Reset(ctx context.Context) (OTData, error) {
	return f.Save(ctx, DefaultOTData())
}

func (f *FileStore) ensureFile() error {
	if _, err := os.Stat(f.path); err == nil {
		return nil
	} else if !os.IsNotExist(err) {
		return fmt.Errorf("stat data file: %w", err)
	}

	encoded, err := json.MarshalIndent(DefaultOTData(), "", "  ")
	if err != nil {
		return fmt.Errorf("encode default data: %w", err)
	}
	if err := os.WriteFile(f.path, encoded, 0o644); err != nil {
		return fmt.Errorf("create default data file: %w", err)
	}
	return nil
}
