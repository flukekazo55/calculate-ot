package config

import (
	"os"
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

	dataFile := strings.TrimSpace(os.Getenv("DATA_FILE"))
	if dataFile == "" {
		dataFile = "data.json"
	}

	originsRaw := strings.TrimSpace(os.Getenv("CORS_ORIGINS"))
	origins := make([]string, 0)
	allowAll := false
	if originsRaw != "" {
		for _, origin := range strings.Split(originsRaw, ",") {
			trimmed := strings.TrimSpace(origin)
			if trimmed == "" {
				continue
			}
			if trimmed == "*" {
				allowAll = true
			}
			origins = append(origins, trimmed)
		}
	}

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
