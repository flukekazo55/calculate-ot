package store

import (
	"context"
	"testing"
)

type fakeUserRepo struct {
	users     map[string]User
	createErr error
	findErr   error
	creates   int
}

func (f *fakeUserRepo) Create(_ context.Context, user User) (User, error) {
	if f.createErr != nil {
		return User{}, f.createErr
	}
	if f.users == nil {
		f.users = make(map[string]User)
	}
	f.users[user.ID] = user
	f.creates++
	return user, nil
}

func (f *fakeUserRepo) FindByIdentity(_ context.Context, identity string) (User, error) {
	if f.findErr != nil {
		return User{}, f.findErr
	}
	for _, user := range f.users {
		if user.Username == identity || user.Email == identity {
			return user, nil
		}
	}
	return User{}, ErrUserNotFound
}

func TestMultiUserStoreCreateWritesBothRepositories(t *testing.T) {
	primary := &fakeUserRepo{users: map[string]User{}}
	secondary := &fakeUserRepo{users: map[string]User{}}
	store := NewMultiUserStore(primary, secondary)

	user := User{ID: "u1", Username: "john", Email: "john@example.com", PasswordHash: "hash", CreatedAt: "2026-04-15T00:00:00Z"}
	got, err := store.Create(context.Background(), user)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if got.ID != user.ID {
		t.Fatalf("Create() id = %q, want %q", got.ID, user.ID)
	}
	if primary.creates != 1 {
		t.Fatalf("primary creates = %d, want 1", primary.creates)
	}
	if secondary.creates != 1 {
		t.Fatalf("secondary creates = %d, want 1", secondary.creates)
	}
}

func TestMultiUserStoreFindByIdentityFallsBack(t *testing.T) {
	primary := &fakeUserRepo{users: map[string]User{}}
	secondary := &fakeUserRepo{users: map[string]User{
		"u1": {ID: "u1", Username: "john", Email: "john@example.com", PasswordHash: "hash", CreatedAt: "2026-04-15T00:00:00Z"},
	}}
	store := NewMultiUserStore(primary, secondary)

	got, err := store.FindByIdentity(context.Background(), "john@example.com")
	if err != nil {
		t.Fatalf("FindByIdentity() error = %v", err)
	}
	if got.ID != "u1" {
		t.Fatalf("FindByIdentity() id = %q, want u1", got.ID)
	}
	if primary.creates != 1 {
		t.Fatalf("expected primary hydration create, got %d", primary.creates)
	}
}
