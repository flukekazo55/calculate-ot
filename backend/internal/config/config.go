package config

import (
	"os"
	"strings"
)

// Config represents runtime settings for the OT backend service.
type Config struct {
	Port            string
	MongoURI        string
	MongoDatabase   string
	TableName       string
	RowID           string
	UserTableName   string
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

	userTableName := strings.TrimSpace(os.Getenv("USERS_TABLE_NAME"))
	if userTableName == "" {
		userTableName = "users"
	}

	rowID := strings.TrimSpace(os.Getenv("OT_ROW_ID"))
	if rowID == "" {
		rowID = "singleton"
	}

	origins, allowAll := parseOrigins(os.Getenv("CORS_ORIGINS"))

	return Config{
		Port:            port,
		MongoURI:        strings.TrimSpace(os.Getenv("MONGODB_URI")),
		MongoDatabase:   resolveMongoDatabase(),
		TableName:       tableName,
		RowID:           rowID,
		UserTableName:   userTableName,
		CORSOrigins:     origins,
		AllowAllOrigins: allowAll,
	}
}

func resolveMongoDatabase() string {
	database := strings.TrimSpace(os.Getenv("MONGODB_DB"))
	if database != "" {
		return database
	}
	return "calculate_ot"
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
