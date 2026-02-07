package entities

import (
	"testing"
)

func TestNewAdvertiser(t *testing.T) {
	email := "test@example.com"
	hash := "hashed_password"
	company := "Test Company"
	website := "https://example.com"

	advertiser := NewAdvertiser(email, hash, company, website)

	if advertiser.ID == "" {
		t.Error("ID should not be empty")
	}
	if advertiser.Email != email {
		t.Errorf("Expected email %s, got %s", email, advertiser.Email)
	}
	if advertiser.Status != AdvertiserStatusPending {
		t.Errorf("Expected status %s, got %s", AdvertiserStatusPending, advertiser.Status)
	}
}
