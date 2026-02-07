package config

import (
	"os"
	"testing"
	"time"
)

func TestConfig_Load_Defaults(t *testing.T) {
	// Set minimal required env vars
	os.Setenv("ADSERVER_DB_PASSWORD", "testpass")
	defer os.Unsetenv("ADSERVER_DB_PASSWORD")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	// Check defaults are applied
	if cfg.Server.Port != 8080 {
		t.Errorf("Expected default port 8080, got %d", cfg.Server.Port)
	}

	if cfg.Database.Password != "testpass" {
		t.Errorf("Expected password testpass, got %s", cfg.Database.Password)
	}
}

func TestConfig_Load_FromEnv(t *testing.T) {
	os.Setenv("ADSERVER_SERVER_PORT", "9000")
	os.Setenv("ADSERVER_DB_PASSWORD", "secret")
	os.Setenv("ADSERVER_DB_HOST", "db.example.com")
	os.Setenv("ADSERVER_REDIS_ADDR", "redis:6379")
	defer os.Unsetenv("ADSERVER_SERVER_PORT")
	defer os.Unsetenv("ADSERVER_DB_PASSWORD")
	defer os.Unsetenv("ADSERVER_DB_HOST")
	defer os.Unsetenv("ADSERVER_REDIS_ADDR")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	if cfg.Server.Port != 9000 {
		t.Errorf("Expected port 9000, got %d", cfg.Server.Port)
	}

	if cfg.Database.Host != "db.example.com" {
		t.Errorf("Expected DB host db.example.com, got %s", cfg.Database.Host)
	}

	if cfg.Redis.Addr != "redis:6379" {
		t.Errorf("Expected Redis addr redis:6379, got %s", cfg.Redis.Addr)
	}
}

func TestConfig_Load_MissingRequired(t *testing.T) {
	// Clear required env var
	os.Unsetenv("ADSERVER_DB_PASSWORD")

	_, err := Load()
	if err == nil {
		t.Errorf("Expected error for missing required field")
	}
}

func TestDatabaseConfig_DSN(t *testing.T) {
	cfg := &DatabaseConfig{
		Host:     "localhost",
		Port:     5432,
		User:     "user",
		Password: "pass",
		Database: "db",
		SSLMode:  "disable",
	}

	expected := "host=localhost port=5432 user=user password=pass dbname=db sslmode=disable"
	result := cfg.DSN()

	if result != expected {
		t.Errorf("Expected DSN %s, got %s", expected, result)
	}
}
