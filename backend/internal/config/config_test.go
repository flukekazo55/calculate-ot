package config

import "testing"

func TestFromEnvMongoDefaults(t *testing.T) {
	t.Setenv("PORT", "")
	t.Setenv("MONGODB_URI", "")
	t.Setenv("MONGODB_DB", "")
	t.Setenv("OT_TABLE_NAME", "")
	t.Setenv("OT_ROW_ID", "")
	t.Setenv("USERS_TABLE_NAME", "")
	t.Setenv("CORS_ORIGINS", "")

	cfg := FromEnv()

	if cfg.Port != "3000" {
		t.Fatalf("Port = %q, want %q", cfg.Port, "3000")
	}
	if cfg.MongoURI != "" {
		t.Fatalf("MongoURI = %q, want empty", cfg.MongoURI)
	}
	if cfg.MongoDatabase != "calculate_ot" {
		t.Fatalf("MongoDatabase = %q, want %q", cfg.MongoDatabase, "calculate_ot")
	}
	if cfg.TableName != "ot_data" {
		t.Fatalf("TableName = %q, want %q", cfg.TableName, "ot_data")
	}
	if cfg.RowID != "singleton" {
		t.Fatalf("RowID = %q, want %q", cfg.RowID, "singleton")
	}
	if cfg.UserTableName != "users" {
		t.Fatalf("UserTableName = %q, want %q", cfg.UserTableName, "users")
	}
}

func TestFromEnvMongoOverrides(t *testing.T) {
	t.Setenv("PORT", "4000")
	t.Setenv("MONGODB_URI", "mongodb://localhost:27017")
	t.Setenv("MONGODB_DB", "ot_prod")
	t.Setenv("OT_TABLE_NAME", "ot_collection")
	t.Setenv("OT_ROW_ID", "primary")
	t.Setenv("USERS_TABLE_NAME", "user_collection")
	t.Setenv("CORS_ORIGINS", "http://localhost:4200,https://example.com")

	cfg := FromEnv()

	if cfg.Port != "4000" {
		t.Fatalf("Port = %q, want %q", cfg.Port, "4000")
	}
	if cfg.MongoURI != "mongodb://localhost:27017" {
		t.Fatalf("MongoURI = %q, want %q", cfg.MongoURI, "mongodb://localhost:27017")
	}
	if cfg.MongoDatabase != "ot_prod" {
		t.Fatalf("MongoDatabase = %q, want %q", cfg.MongoDatabase, "ot_prod")
	}
	if cfg.TableName != "ot_collection" {
		t.Fatalf("TableName = %q, want %q", cfg.TableName, "ot_collection")
	}
	if cfg.RowID != "primary" {
		t.Fatalf("RowID = %q, want %q", cfg.RowID, "primary")
	}
	if cfg.UserTableName != "user_collection" {
		t.Fatalf("UserTableName = %q, want %q", cfg.UserTableName, "user_collection")
	}
	if len(cfg.CORSOrigins) != 2 {
		t.Fatalf("CORSOrigins length = %d, want 2", len(cfg.CORSOrigins))
	}
}
