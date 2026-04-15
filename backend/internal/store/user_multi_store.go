package store

import (
	"context"
	"fmt"
)

// MultiUserStore composes two repositories to support mirrored persistence.
//
// The primary repository is authoritative. Reads fall back to secondary when
// user is missing and then hydrate primary.
type MultiUserStore struct {
	primary   UserRepository
	secondary UserRepository
}

// NewMultiUserStore creates a dual-persistence user repository.
func NewMultiUserStore(primary UserRepository, secondary UserRepository) *MultiUserStore {
	return &MultiUserStore{primary: primary, secondary: secondary}
}

// Create persists user into both repositories.
func (m *MultiUserStore) Create(ctx context.Context, user User) (User, error) {
	primaryUser, err := m.primary.Create(ctx, user)
	if err != nil {
		return User{}, fmt.Errorf("create user in primary store: %w", err)
	}

	if _, err := m.secondary.Create(ctx, primaryUser); err != nil && !isUserExists(err) {
		return User{}, fmt.Errorf("create user in secondary store: %w", err)
	}

	return primaryUser, nil
}

// FindByIdentity reads from primary and falls back to secondary if missing.
func (m *MultiUserStore) FindByIdentity(ctx context.Context, identity string) (User, error) {
	primaryUser, err := m.primary.FindByIdentity(ctx, identity)
	if err == nil {
		return primaryUser, nil
	}
	if !isUserNotFound(err) {
		return User{}, fmt.Errorf("find user in primary store: %w", err)
	}

	fallbackUser, err := m.secondary.FindByIdentity(ctx, identity)
	if err != nil {
		if isUserNotFound(err) {
			return User{}, ErrUserNotFound
		}
		return User{}, fmt.Errorf("find user in secondary store: %w", err)
	}

	if _, saveErr := m.primary.Create(ctx, fallbackUser); saveErr != nil && !isUserExists(saveErr) {
		return User{}, fmt.Errorf("hydrate primary user store: %w", saveErr)
	}

	return fallbackUser, nil
}

var _ UserRepository = (*MultiUserStore)(nil)
