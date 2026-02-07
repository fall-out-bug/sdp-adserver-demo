package middleware

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

// mockJWTAuthenticator is a mock implementation
type mockJWTAuthenticator struct {
	validToken string
	userID     string
	userType   string
}

var assertAnError = errors.New("assert.AnError")

func (m *mockJWTAuthenticator) Validate(token string) (string, string, error) {
	if token == m.validToken {
		return m.userID, m.userType, nil
	}
	return "", "", assertAnError
}

func TestAuthMiddleware_RequireAuth_ValidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)

	authenticator := &mockJWTAuthenticator{
		validToken: "valid-token",
		userID:     "user-123",
		userType:   "publisher",
	}

	middleware := NewAuthMiddleware(authenticator, []string{"publisher", "advertiser"})

	router := gin.New()
	router.Use(middleware.RequireAuth())
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"user_id": c.GetString("user_id")})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer valid-token")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}
}

func TestAuthMiddleware_RequireAuth_MissingHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)

	authenticator := &mockJWTAuthenticator{}
	middleware := NewAuthMiddleware(authenticator, []string{"publisher"})

	router := gin.New()
	router.Use(middleware.RequireAuth())
	router.GET("/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{})
	})

	req := httptest.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}
}
