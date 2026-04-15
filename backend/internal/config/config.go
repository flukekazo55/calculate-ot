package config

import (
	"os"
	"path/filepath"
	"strings"
)

// Config represents runtime settings for the OT backend service.
type Config struct {
	Port            string
	DatabaseURL     string
	TableName       string
	RowID           string
	DataFile        string
	CORSOrigins     []string
	AllowAllOrigins bool
}

// FromEnv loads backend configuration from environment variables.
func FromEnv() Config {
	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = "3000"
	}

	tableName := strings.TrimSpace(os.Getenv("OT_TABLE_NAME"))
	if tableName == "" {
		tableName = "ot_data"
	}

	rowID := strings.TrimSpace(os.Getenv("OT_ROW_ID"))
	if rowID == "" {
		rowID = "singleton"
	}

	dataFile := resolveDataFile()
	origins, allowAll := parseOrigins(os.Getenv("CORS_ORIGINS"))

	return Config{
		Port:            port,
		DatabaseURL:     strings.TrimSpace(os.Getenv("DATABASE_URL")),
		TableName:       tableName,
		RowID:           rowID,
		DataFile:        dataFile,
		CORSOrigins:     origins,
		AllowAllOrigins: allowAll,
	}
}

func resolveDataFile() string {
	dataFile := strings.TrimSpace(os.Getenv("DATA_FILE"))
	if dataFile != "" {
		return dataFile
	}

	if os.Getenv("VERCEL") == "1" || strings.TrimSpace(os.Getenv("VERCEL_ENV")) != "" {
		return filepath.Join(os.TempDir(), "calculate-ot-data.json")
	}

	return "data.json"
}

func parseOrigins(originsRaw string) ([]string, bool) {
	origins := make([]string, 0)
	allowAll := false
	for _, origin := range strings.Split(strings.TrimSpace(originsRaw), ",") {
		trimmed := strings.TrimSpace(origin)
		if trimmed == "" {
			continue
		}
		if trimmed == "*" {
			allowAll = true
		}
		origins = append(origins, trimmed)
	}

	return origins, allowAll
}
