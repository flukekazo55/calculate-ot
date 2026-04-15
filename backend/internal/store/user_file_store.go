package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

// FileUserStore persists users to a local JSON file.
type FileUserStore struct {
	path string
	mu   sync.Mutex
}

// NewFileUserStore creates a file-backed user repository.
func NewFileUserStore(path string) *FileUserStore {
	return &FileUserStore{path: path}
}

// Create writes a new user, enforcing unique username/email (case-insensitive).
func (f *FileUserStore) Create(ctx context.Context, user User) (User, error) {
	if err := ctx.Err(); err != nil {
		return User{}, err
	}

	f.mu.Lock()
	defer f.mu.Unlock()

	if err := f.ensureFile(); err != nil {
		return User{}, err
	}

	users, err := f.readUsersLocked()
	if err != nil {
		return User{}, err
	}

	for _, existing := range users {
		if strings.EqualFold(existing.Username, user.Username) || strings.EqualFold(existing.Email, user.Email) {
			return User{}, ErrUserExists
		}
	}

	users = append(users, user)
	if err := f.writeUsersLocked(users); err != nil {
		return User{}, err
	}

	return user, nil
}

// FindByIdentity finds by username or email (case-insensitive).
func (f *FileUserStore) FindByIdentity(ctx context.Context, identity string) (User, error) {
	if err := ctx.Err(); err != nil {
		return User{}, err
	}

	needle := strings.TrimSpace(identity)
	if needle == "" {
		return User{}, ErrUserNotFound
	}

	f.mu.Lock()
	defer f.mu.Unlock()

	if err := f.ensureFile(); err != nil {
		return User{}, err
	}

	users, err := f.readUsersLocked()
	if err != nil {
		return User{}, err
	}

	for _, existing := range users {
		if strings.EqualFold(existing.Username, needle) || strings.EqualFold(existing.Email, needle) {
			return existing, nil
		}
	}

	return User{}, ErrUserNotFound
}

func (f *FileUserStore) ensureFile() error {
	if _, err := os.Stat(f.path); err == nil {
		return nil
	} else if !os.IsNotExist(err) {
		return fmt.Errorf("stat user data file: %w", err)
	}

	dir := filepath.Dir(f.path)
	if dir != "." {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return fmt.Errorf("create user data directory: %w", err)
		}
	}

	if err := os.WriteFile(f.path, []byte("[]\n"), 0o644); err != nil {
		return fmt.Errorf("create user data file: %w", err)
	}
	return nil
}

func (f *FileUserStore) readUsersLocked() ([]User, error) {
	raw, err := os.ReadFile(f.path)
	if err != nil {
		return nil, fmt.Errorf("read user data file: %w", err)
	}
	if len(raw) == 0 {
		return make([]User, 0), nil
	}

	var users []User
	if err := json.Unmarshal(raw, &users); err != nil {
		return nil, fmt.Errorf("parse user data JSON: %w", err)
	}
	if users == nil {
		users = make([]User, 0)
	}
	return users, nil
}

func (f *FileUserStore) writeUsersLocked(users []User) error {
	encoded, err := json.MarshalIndent(users, "", "  ")
	if err != nil {
		return fmt.Errorf("encode user data JSON: %w", err)
	}

	if err := os.WriteFile(f.path, encoded, 0o644); err != nil {
		return fmt.Errorf("write user data file: %w", err)
	}
	return nil
}

var _ UserRepository = (*FileUserStore)(nil)

// Ensure sentinel compatibility across wrappers.
func isUserNotFound(err error) bool {
	return errors.Is(err, ErrUserNotFound)
}

func isUserExists(err error) bool {
	return errors.Is(err, ErrUserExists)
}
