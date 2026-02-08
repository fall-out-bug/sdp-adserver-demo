package config

import (
	"os"
	"testing"
)

func TestConfig_Load_Defaults(t *testing.T) {
	// Set minimal required env vars
	os.Setenv("DB_PASSWORD", "testpass")
	os.Setenv("JWT_SECRET", "this-is-a-test-jwt-secret-at-least-32-characters-long")
	defer os.Unsetenv("DB_PASSWORD")
	defer os.Unsetenv("JWT_SECRET")

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
	os.Setenv("SERVER_PORT", "9000")
	os.Setenv("DB_PASSWORD", "secret")
	os.Setenv("DB_HOST", "db.example.com")
	os.Setenv("REDIS_ADDR", "redis:6379")
	os.Setenv("JWT_SECRET", "this-is-a-test-jwt-secret-at-least-32-characters-long")
	defer os.Unsetenv("SERVER_PORT")
	defer os.Unsetenv("DB_PASSWORD")
	defer os.Unsetenv("DB_HOST")
	defer os.Unsetenv("REDIS_ADDR")
	defer os.Unsetenv("JWT_SECRET")

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
	// Clear required env vars
	os.Unsetenv("DB_PASSWORD")
	os.Unsetenv("JWT_SECRET")

	_, err := Load()
	if err == nil {
		t.Errorf("Expected error for missing required field")
	}
}

func TestConfig_Load_InvalidJWTSecret(t *testing.T) {
	os.Setenv("DB_PASSWORD", "testpass")
	os.Setenv("JWT_SECRET", "short")
	defer os.Unsetenv("DB_PASSWORD")
	defer os.Unsetenv("JWT_SECRET")

	_, err := Load()
	if err == nil {
		t.Errorf("Expected error for short JWT secret")
	}
}

func TestConfig_Load_InsecureJWTSecret(t *testing.T) {
	os.Setenv("DB_PASSWORD", "testpass")
	os.Setenv("JWT_SECRET", "secret-key-change-in-production")
	defer os.Unsetenv("DB_PASSWORD")
	defer os.Unsetenv("JWT_SECRET")

	_, err := Load()
	if err == nil {
		t.Errorf("Expected error for insecure JWT secret")
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
