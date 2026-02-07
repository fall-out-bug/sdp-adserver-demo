package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// JWTAuthenticator defines JWT authentication interface
type JWTAuthenticator interface {
	Validate(token string) (userID, userType string, err error)
}

// AuthMiddleware creates an authentication middleware
type AuthMiddleware struct {
	authenticator JWTAuthenticator
	userTypes     map[string]bool
}

// NewAuthMiddleware creates a new auth middleware
func NewAuthMiddleware(authenticator JWTAuthenticator, userTypes []string) *AuthMiddleware {
	userTypeMap := make(map[string]bool)
	for _, ut := range userTypes {
		userTypeMap[ut] = true
	}

	return &AuthMiddleware{
		authenticator: authenticator,
		userTypes:     userTypeMap,
	}
}

// RequireAuth creates a gin middleware for authentication
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			return
		}

		userID, userType, err := m.authenticator.Validate(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		if !m.userTypes[userType] {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}

		c.Set("user_id", userID)
		c.Set("user_type", userType)
		c.Next()
	}
}
