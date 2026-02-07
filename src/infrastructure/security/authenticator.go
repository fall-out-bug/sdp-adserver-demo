package security

// JWTAuthenticatorAdapter adapts JWTService for middleware
type JWTAuthenticatorAdapter struct {
	jwtService *JWTService
}

// NewJWTAuthenticatorAdapter creates a new adapter
func NewJWTAuthenticatorAdapter(jwtService *JWTService) *JWTAuthenticatorAdapter {
	return &JWTAuthenticatorAdapter{jwtService: jwtService}
}

// Validate validates a JWT token
func (a *JWTAuthenticatorAdapter) Validate(token string) (userID, userType string, err error) {
	claims, err := a.jwtService.Validate(token)
	if err != nil {
		return "", "", err
	}
	return claims.UserID, claims.UserType, nil
}
