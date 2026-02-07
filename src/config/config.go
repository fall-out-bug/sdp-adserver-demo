package config

import (
	"fmt"
	"time"

	"github.com/kelseyhightower/envconfig"
)

// Config holds all application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
}

// ServerConfig holds HTTP server configuration
type ServerConfig struct {
	Port            int           `envconfig:"SERVER_PORT" default:"8080"`
	ReadTimeout     time.Duration `envconfig:"SERVER_READ_TIMEOUT" default:"10s"`
	WriteTimeout    time.Duration `envconfig:"SERVER_WRITE_TIMEOUT" default:"10s"`
	ShutdownTimeout time.Duration `envconfig:"SERVER_SHUTDOWN_TIMEOUT" default:"10s"`
}

// DatabaseConfig holds PostgreSQL configuration
type DatabaseConfig struct {
	Host     string `envconfig:"DB_HOST" default:"localhost"`
	Port     int    `envconfig:"DB_PORT" default:"5432"`
	User     string `envconfig:"DB_USER" default:"adserver"`
	Password string `envconfig:"DB_PASSWORD" required:"true"`
	Database string `envconfig:"DB_NAME" default:"adserver"`
	SSLMode  string `envconfig:"DB_SSLMODE" default:"disable"`
}

// RedisConfig holds Redis configuration
type RedisConfig struct {
	Addr     string `envconfig:"REDIS_ADDR" default:"localhost:6379"`
	Password string `envconfig:"REDIS_PASSWORD" default:""`
	DB       int    `envconfig:"REDIS_DB" default:"0"`
}

// Load loads configuration from environment variables
func Load() (*Config, error) {
	cfg := &Config{}

	// Process with envconfig (no prefix to allow direct env var names)
	err := envconfig.Process("", cfg)
	if err != nil {
		return nil, err
	}

	// Set defaults manually if envconfig didn't set them
	if cfg.Server.Port == 0 {
		cfg.Server.Port = 8080
	}

	return cfg, nil
}

// DSN returns the PostgreSQL connection string
func (c *DatabaseConfig) DSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.Database, c.SSLMode)
}
