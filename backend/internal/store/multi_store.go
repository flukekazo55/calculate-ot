package store

import (
	"context"
	"fmt"
)

// MultiStore composes two repositories to support mirrored persistence.
//
// The primary repository is authoritative for reads. Writes are executed on
// both primary and secondary repositories.
type MultiStore struct {
	primary   Repository
	secondary Repository
}

// NewMultiStore creates a dual-persistence repository.
func NewMultiStore(primary Repository, secondary Repository) *MultiStore {
	return &MultiStore{primary: primary, secondary: secondary}
}

// Load reads from primary and falls back to secondary when primary has no data.
func (m *MultiStore) Load(ctx context.Context) (OTData, error) {
	primaryData, err := m.primary.Load(ctx)
	if err != nil {
		return OTData{}, fmt.Errorf("load primary store: %w", err)
	}
	if HasData(primaryData) {
		return NormalizeOTData(primaryData), nil
	}

	fallbackData, err := m.secondary.Load(ctx)
	if err != nil {
		return OTData{}, fmt.Errorf("load secondary store: %w", err)
	}

	normalizedFallback := NormalizeOTData(fallbackData)
	if HasData(normalizedFallback) {
		if _, saveErr := m.primary.Save(ctx, normalizedFallback); saveErr != nil {
			return OTData{}, fmt.Errorf("hydrate primary from secondary: %w", saveErr)
		}
	}

	return normalizedFallback, nil
}

// Save persists data into both repositories.
func (m *MultiStore) Save(ctx context.Context, data OTData) (OTData, error) {
	normalized := NormalizeOTData(data)

	primarySaved, err := m.primary.Save(ctx, normalized)
	if err != nil {
		return OTData{}, fmt.Errorf("save primary store: %w", err)
	}

	if _, err := m.secondary.Save(ctx, normalized); err != nil {
		return OTData{}, fmt.Errorf("save secondary store: %w", err)
	}

	return NormalizeOTData(primarySaved), nil
}

// Reset clears both repositories.
func (m *MultiStore) Reset(ctx context.Context) (OTData, error) {
	resetData, err := m.primary.Reset(ctx)
	if err != nil {
		return OTData{}, fmt.Errorf("reset primary store: %w", err)
	}

	if _, err := m.secondary.Reset(ctx); err != nil {
		return OTData{}, fmt.Errorf("reset secondary store: %w", err)
	}

	return NormalizeOTData(resetData), nil
}
