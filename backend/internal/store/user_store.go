package store

import (
	"context"
	"errors"
)

var (
	// ErrUserNotFound is returned when user lookup fails.
	ErrUserNotFound = errors.New("user not found")
	// ErrUserExists is returned when username or email already exists.
	ErrUserExists = errors.New("user already exists")
)

// User stores login identity fields.
type User struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	PasswordHash string `json:"passwordHash,omitempty"`
	CreatedAt    string `json:"createdAt"`
}

// UserRepository defines persistence operations for users.
type UserRepository interface {
	Create(ctx context.Context, user User) (User, error)
	FindByIdentity(ctx context.Context, identity string) (User, error)
}
