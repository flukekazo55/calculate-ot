package config

import (
	"path/filepath"
	"testing"
)

const customDataFilePath = "/custom/path/data.json"

func TestFromEnvDefaultDataFileLocal(t *testing.T) {
	t.Setenv("DATA_FILE", "")
	t.Setenv("VERCEL", "")
	t.Setenv("VERCEL_ENV", "")

	cfg := FromEnv()
	if cfg.DataFile != "data.json" {
		t.Fatalf("DataFile = %q, want %q", cfg.DataFile, "data.json")
	}
}

func TestFromEnvDefaultDataFileVercel(t *testing.T) {
	t.Setenv("DATA_FILE", "")
	t.Setenv("VERCEL", "1")
	t.Setenv("VERCEL_ENV", "production")

	cfg := FromEnv()
	if filepath.Base(cfg.DataFile) != "calculate-ot-data.json" {
		t.Fatalf("DataFile = %q, expected temp file name %q", cfg.DataFile, "calculate-ot-data.json")
	}
}

func TestFromEnvDataFileOverride(t *testing.T) {
	t.Setenv("DATA_FILE", customDataFilePath)
	t.Setenv("VERCEL", "1")
	t.Setenv("VERCEL_ENV", "production")

	cfg := FromEnv()
	if cfg.DataFile != customDataFilePath {
		t.Fatalf("DataFile = %q, want %q", cfg.DataFile, customDataFilePath)
	}
}
