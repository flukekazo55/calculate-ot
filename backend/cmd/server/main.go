package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"calculate-ot/backend/internal/config"
	"calculate-ot/backend/internal/httpapi"
	"calculate-ot/backend/internal/store"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

func main() {
	loadEnvFiles()
	cfg := config.FromEnv()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	repo, userRepo, cleanup, err := buildRepositories(ctx, cfg)
	if err != nil {
		log.Fatalf("failed to initialize repositories: %v", err)
	}
	defer cleanup()

	handler := httpapi.NewHandler(repo, userRepo, cfg.CORSOrigins, cfg.AllowAllOrigins)
	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("Go backend running at http://localhost:%s", cfg.Port)
	log.Printf("storage backend: mongodb only (db=%s, ot=%s/%s, users=%s)", cfg.MongoDatabase, cfg.TableName, cfg.RowID, cfg.UserTableName)

	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("server stopped with error: %v", err)
	}
}

func loadEnvFiles() {
	// Local dev convenience: load whichever env files exist.
	for _, file := range []string{".env", ".env.local", ".env.vercel"} {
		if err := godotenv.Load(file); err != nil && !os.IsNotExist(err) {
			log.Printf("warning: failed to load %s: %v", file, err)
		}
	}
}

func buildRepositories(ctx context.Context, cfg config.Config) (store.Repository, store.UserRepository, func(), error) {
	if cfg.MongoURI == "" {
		return nil, nil, nil, fmt.Errorf("MONGODB_URI is required")
	}

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		return nil, nil, nil, err
	}
	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		_ = client.Disconnect(ctx)
		return nil, nil, nil, err
	}

	db := client.Database(cfg.MongoDatabase)
	mongoStore := store.NewMongoStore(db.Collection(cfg.TableName), cfg.RowID)
	mongoUserStore, err := store.NewMongoUserStore(ctx, db.Collection(cfg.UserTableName))
	if err != nil {
		_ = client.Disconnect(ctx)
		return nil, nil, nil, err
	}

	cleanup := func() {
		if closeErr := client.Disconnect(context.Background()); closeErr != nil {
			log.Printf("failed to close mongo connection: %v", closeErr)
		}
	}

	return mongoStore, mongoUserStore, cleanup, nil
}
