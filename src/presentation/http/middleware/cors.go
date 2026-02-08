package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware adds CORS headers
type CORSMiddleware struct {
	allowedOrigins []string
}

// NewCORSMiddleware creates a new CORS middleware
// For production, pass specific allowed origins
func NewCORSMiddleware(allowedOrigins ...string) *CORSMiddleware {
	// Default to safe origins for demo
	if len(allowedOrigins) == 0 {
		allowedOrigins = []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:3001",
		}
	}
	return &CORSMiddleware{
		allowedOrigins: allowedOrigins,
	}
}

// Handle applies CORS headers with origin validation
func (m *CORSMiddleware) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Check if origin is allowed
		allowed := false
		if origin != "" {
			for _, allowedOrigin := range m.allowedOrigins {
				if allowedOrigin == "*" || m.matchOrigin(origin, allowedOrigin) {
					allowed = true
					c.Header("Access-Control-Allow-Origin", origin)
					break
				}
			}
		}

		if allowed {
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Max-Age", "86400")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// matchOrigin checks if the request origin matches the allowed origin
func (m *CORSMiddleware) matchOrigin(origin, allowed string) bool {
	// Exact match
	if origin == allowed {
		return true
	}

	// For local development, allow localhost variations
	if strings.HasSuffix(allowed, ":3000") || strings.HasSuffix(allowed, ":3001") {
		// Strip protocol and port for comparison
		originHost := strings.TrimPrefix(strings.TrimPrefix(origin, "http://"), "https://")
		originHost = strings.Split(originHost, ":")[0]

		allowedHost := strings.TrimPrefix(strings.TrimPrefix(allowed, "http://"), "https://")
		allowedHost = strings.Split(allowedHost, ":")[0]

		if originHost == "localhost" || originHost == "127.0.0.1" {
			return allowedHost == "localhost" || allowedHost == "127.0.0.1"
		}
	}

	return false
}

