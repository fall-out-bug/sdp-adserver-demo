package bootstrap

import (
	"os"
	"testing"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/config"
)

func TestNew_MissingDBPassword(t *testing.T) {
	os.Unsetenv("ADSERVER_DB_PASSWORD")

	cfg := &config.Config{
		Server: config.ServerConfig{
			Port:            8080,
			ReadTimeout:     10 * time.Second,
			WriteTimeout:    10 * time.Second,
			ShutdownTimeout: 10 * time.Second,
		},
		Database: config.DatabaseConfig{
			Host:     "localhost",
			Port:     5432,
			User:     "adserver",
			Password: "",
			Database: "adserver",
			SSLMode:  "disable",
		},
		Redis: config.RedisConfig{
			Addr: "localhost:6379",
		},
	}

	_, err := New(cfg)
	if err == nil {
		t.Errorf("Expected error for missing DB password")
	}
}

func TestApp_Shutdown(t *testing.T) {
	app := &App{
		shutdownCh: make(chan struct{}),
	}

	// Should not block
	done := make(chan bool)
	go func() {
		app.Shutdown()
		close(done)
	}()

	select {
	case <-done:
		// Success
	case <-time.After(1 * time.Second):
		t.Errorf("Shutdown timed out")
	}
}
