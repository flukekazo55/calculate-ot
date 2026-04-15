package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"calculate-ot/backend/internal/config"
	"calculate-ot/backend/internal/httpapi"
	"calculate-ot/backend/internal/store"
)

func main() {
	cfg := config.FromEnv()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	repo, cleanup, err := buildRepository(ctx, cfg)
	if err != nil {
		log.Fatalf("failed to initialize repository: %v", err)
	}
	defer cleanup()

	handler := httpapi.NewHandler(repo, cfg.CORSOrigins, cfg.AllowAllOrigins)
	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
	}

	log.Printf("Go backend running at http://localhost:%s", cfg.Port)
	if cfg.DatabaseURL != "" {
		log.Printf("storage backend: postgres + file mirror (%s/%s, file=%s)", cfg.TableName, cfg.RowID, cfg.DataFile)
	} else {
		log.Printf("storage backend: file (%s)", cfg.DataFile)
	}

	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("server stopped with error: %v", err)
	}
}

func buildRepository(ctx context.Context, cfg config.Config) (store.Repository, func(), error) {
	fileStore := store.NewFileStore(cfg.DataFile)
	if cfg.DatabaseURL == "" {
		return fileStore, func() {}, nil
	}

	postgresStore, err := store.NewPostgresStore(ctx, cfg.DatabaseURL, cfg.TableName, cfg.RowID)
	if err != nil {
		return nil, nil, err
	}

	cleanup := func() {
		if closeErr := postgresStore.Close(); closeErr != nil {
			log.Printf("failed to close postgres connection: %v", closeErr)
		}
	}

	return store.NewMultiStore(postgresStore, fileStore), cleanup, nil
}
