package security

import (
	"errors"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/application/auth"
	"github.com/golang-jwt/jwt/v4"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token expired")
)

// internal JWT claims
type jwtClaims struct {
	UserID   string `json:"user_id"`
	UserType string `json:"user_type"`
	jwt.RegisteredClaims
}

// JWTService implements auth.JWTService interface
type JWTService struct {
	secretKey  string
	expiration time.Duration
}

// NewJWTService creates a new JWT service
func NewJWTService(secretKey string, expiration time.Duration) *JWTService {
	return &JWTService{
		secretKey:  secretKey,
		expiration: expiration,
	}
}

// Generate generates a new JWT token
func (s *JWTService) Generate(userID, userType string) (string, error) {
	claims := jwtClaims{
		UserID:   userID,
		UserType: userType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.secretKey))
}

// Validate validates a JWT token and returns the claims
func (s *JWTService) Validate(tokenString string) (*auth.TokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &jwtClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.secretKey), nil
	})

	if err != nil {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*jwtClaims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return &auth.TokenClaims{
		UserID:   claims.UserID,
		UserType: claims.UserType,
	}, nil
}
