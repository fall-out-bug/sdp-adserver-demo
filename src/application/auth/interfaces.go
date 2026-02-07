package auth

// PasswordHasher defines password hashing interface
type PasswordHasher interface {
	Hash(password string) (string, error)
	Verify(password, hash string) bool
}

// JWTService defines JWT service interface
type JWTService interface {
	Generate(userID, userType string) (string, error)
	Validate(token string) (*TokenClaims, error)
}

// TokenClaims represents JWT token claims
type TokenClaims struct {
	UserID   string
	UserType string
}
