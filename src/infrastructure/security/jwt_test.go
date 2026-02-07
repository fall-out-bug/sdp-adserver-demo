package security

import (
	"testing"
	"time"
)

func TestJWTService_Generate(t *testing.T) {
	service := NewJWTService("test-secret", 24*time.Hour)

	token, err := service.Generate("user-123", "publisher")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}
	if token == "" {
		t.Error("Token should not be empty")
	}
}

func TestJWTService_Validate(t *testing.T) {
	service := NewJWTService("test-secret", 24*time.Hour)

	// Generate token
	token, err := service.Generate("user-123", "advertiser")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Validate token
	claims, err := service.Validate(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}
	if claims.UserID != "user-123" {
		t.Errorf("Expected user ID user-123, got %s", claims.UserID)
	}
	if claims.UserType != "advertiser" {
		t.Errorf("Expected user type advertiser, got %s", claims.UserType)
	}

	// Test invalid token
	_, err = service.Validate("invalid-token")
	if err == nil {
		t.Error("Should return error for invalid token")
	}
}
