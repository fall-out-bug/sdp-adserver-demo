package entities

import (
	"testing"
	"time"
)

func TestNewPublisher(t *testing.T) {
	email := "test@example.com"
	hash := "hashed_password"
	company := "Test Company"
	website := "https://example.com"

	publisher := NewPublisher(email, hash, company, website)

	if publisher.ID == "" {
		t.Error("ID should not be empty")
	}
	if publisher.Email != email {
		t.Errorf("Expected email %s, got %s", email, publisher.Email)
	}
	if publisher.PasswordHash != hash {
		t.Errorf("Expected password hash %s, got %s", hash, publisher.PasswordHash)
	}
	if publisher.Status != PublisherStatusPending {
		t.Errorf("Expected status %s, got %s", PublisherStatusPending, publisher.Status)
	}
}

func TestPublisher_IsActive(t *testing.T) {
	publisher := NewPublisher("test@example.com", "hash", "Company", "https://example.com")

	if publisher.IsActive() {
		t.Error("New publisher should not be active")
	}

	publisher.Activate()
	if !publisher.IsActive() {
		t.Error("Activated publisher should be active")
	}
}
