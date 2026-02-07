package main

import (
	"log"

	"github.com/fall-out-bug/demo-adserver/src/bootstrap"
	"github.com/fall-out-bug/demo-adserver/src/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	app, err := bootstrap.New(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize app: %v", err)
	}

	// Wait for interrupt signal in separate goroutine
	go func() {
		app.WaitForShutdown()
		app.Shutdown()
	}()

	if err := app.Run(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
