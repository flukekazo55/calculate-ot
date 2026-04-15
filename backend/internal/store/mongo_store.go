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

// MongoStore persists OT payloads in MongoDB.
type MongoStore struct {
	collection *mongo.Collection
	rowID      string
}

// NewMongoStore creates a MongoDB-backed OT repository.
func NewMongoStore(collection *mongo.Collection, rowID string) *MongoStore {
	return &MongoStore{
		collection: collection,
		rowID:      rowID,
	}
}

type mongoOTDocument struct {
	ID        string    `bson:"_id"`
	Payload   OTData    `bson:"payload"`
	UpdatedAt time.Time `bson:"updatedAt"`
}

// Load reads OT data from MongoDB.
func (m *MongoStore) Load(ctx context.Context) (OTData, error) {
	var doc mongoOTDocument
	err := m.collection.FindOne(ctx, bson.M{"_id": m.rowID}).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return DefaultOTData(), nil
		}
		return OTData{}, fmt.Errorf("find OT payload: %w", err)
	}

	return NormalizeOTData(doc.Payload), nil
}

// Save upserts OT data into MongoDB.
func (m *MongoStore) Save(ctx context.Context, data OTData) (OTData, error) {
	normalized := NormalizeOTData(data)

	update := bson.M{
		"$set": bson.M{
			"payload":   normalized,
			"updatedAt": time.Now().UTC(),
		},
	}

	_, err := m.collection.UpdateByID(ctx, m.rowID, update, options.Update().SetUpsert(true))
	if err != nil {
		return OTData{}, fmt.Errorf("upsert OT payload: %w", err)
	}

	return normalized, nil
}

// Reset replaces current OT data with an empty payload.
func (m *MongoStore) Reset(ctx context.Context) (OTData, error) {
	return m.Save(ctx, DefaultOTData())
}

var _ Repository = (*MongoStore)(nil)
var _ OwnerScopedRepository = (*MongoStore)(nil)

// ForOwner returns a repository instance that reads/writes OT data for owner.
func (m *MongoStore) ForOwner(owner string) Repository {
	normalizedOwner := strings.TrimSpace(owner)
	if normalizedOwner == "" {
		normalizedOwner = m.rowID
	}
	if normalizedOwner == m.rowID {
		return m
	}

	return &MongoStore{
		collection: m.collection,
		rowID:      normalizedOwner,
	}
}
