package security

import (
	"testing"
)

func TestBcryptPasswordHasher(t *testing.T) {
	hasher := NewBcryptPasswordHasher(12)

	password := "testpassword123"

	// Test Hash
	hash, err := hasher.Hash(password)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}
	if hash == password {
		t.Error("Hash should not equal password")
	}

	// Test Verify with correct password
	if !hasher.Verify(password, hash) {
		t.Error("Failed to verify correct password")
	}

	// Test Verify with incorrect password
	if hasher.Verify("wrongpassword", hash) {
		t.Error("Should not verify incorrect password")
	}
}
