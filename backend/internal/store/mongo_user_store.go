package store

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoUserStore persists users in MongoDB.
type MongoUserStore struct {
	collection *mongo.Collection
}

// NewMongoUserStore creates a MongoDB-backed user repository.
func NewMongoUserStore(ctx context.Context, collection *mongo.Collection) (*MongoUserStore, error) {
	store := &MongoUserStore{collection: collection}
	if err := store.ensureIndexes(ctx); err != nil {
		return nil, err
	}
	return store, nil
}

type mongoUserDocument struct {
	ID            string    `bson:"_id"`
	Username      string    `bson:"username"`
	Email         string    `bson:"email"`
	UsernameLower string    `bson:"usernameLower"`
	EmailLower    string    `bson:"emailLower"`
	PasswordHash  string    `bson:"passwordHash"`
	CreatedAt     time.Time `bson:"createdAt"`
}

// Create inserts a new user, enforcing unique username/email (case-insensitive).
func (m *MongoUserStore) Create(ctx context.Context, user User) (User, error) {
	createdAt := time.Now().UTC()
	if parsed, err := time.Parse(time.RFC3339, user.CreatedAt); err == nil {
		createdAt = parsed.UTC()
	}

	doc := mongoUserDocument{
		ID:            user.ID,
		Username:      user.Username,
		Email:         user.Email,
		UsernameLower: strings.ToLower(strings.TrimSpace(user.Username)),
		EmailLower:    strings.ToLower(strings.TrimSpace(user.Email)),
		PasswordHash:  user.PasswordHash,
		CreatedAt:     createdAt,
	}

	_, err := m.collection.InsertOne(ctx, doc)
	if err != nil {
		if isMongoDuplicateKey(err) {
			return User{}, ErrUserExists
		}
		return User{}, fmt.Errorf("insert user: %w", err)
	}

	user.CreatedAt = createdAt.Format(time.RFC3339)
	return user, nil
}

// FindByIdentity finds by username or email (case-insensitive).
func (m *MongoUserStore) FindByIdentity(ctx context.Context, identity string) (User, error) {
	needle := strings.ToLower(strings.TrimSpace(identity))
	if needle == "" {
		return User{}, ErrUserNotFound
	}

	filter := bson.M{
		"$or": []bson.M{
			{"usernameLower": needle},
			{"emailLower": needle},
		},
	}

	var doc mongoUserDocument
	err := m.collection.FindOne(ctx, filter).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return User{}, ErrUserNotFound
		}
		return User{}, fmt.Errorf("find user by identity: %w", err)
	}

	return User{
		ID:           doc.ID,
		Username:     doc.Username,
		Email:        doc.Email,
		PasswordHash: doc.PasswordHash,
		CreatedAt:    doc.CreatedAt.UTC().Format(time.RFC3339),
	}, nil
}

func (m *MongoUserStore) ensureIndexes(ctx context.Context) error {
	models := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "usernameLower", Value: 1}},
			Options: options.Index().SetName("idx_users_username_lower").SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "emailLower", Value: 1}},
			Options: options.Index().SetName("idx_users_email_lower").SetUnique(true),
		},
	}

	_, err := m.collection.Indexes().CreateMany(ctx, models)
	if err != nil {
		return fmt.Errorf("create user indexes: %w", err)
	}
	return nil
}

func isMongoDuplicateKey(err error) bool {
	var writeException mongo.WriteException
	if errors.As(err, &writeException) {
		for _, writeErr := range writeException.WriteErrors {
			if writeErr.Code == 11000 {
				return true
			}
		}
	}

	var bulkWriteException mongo.BulkWriteException
	if errors.As(err, &bulkWriteException) {
		for _, writeErr := range bulkWriteException.WriteErrors {
			if writeErr.Code == 11000 {
				return true
			}
		}
	}

	return false
}

var _ UserRepository = (*MongoUserStore)(nil)
