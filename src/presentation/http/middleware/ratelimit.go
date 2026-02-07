package middleware

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RateLimitMiddleware applies rate limiting using the provided limiter
type RateLimitMiddleware struct {
	limiter RateLimiter
}

// RateLimiter defines the interface for rate limiting
type RateLimiter interface {
	CheckRateLimit(ctx interface{}, ip string) (bool, error)
	GetRetryAfter(ctx interface{}, ip string) (int, error)
}

// NewRateLimitMiddleware creates a new rate limit middleware
func NewRateLimitMiddleware(limiter RateLimiter) *RateLimitMiddleware {
	return &RateLimitMiddleware{limiter: limiter}
}

// Handle applies rate limiting to the request
func (m *RateLimitMiddleware) Handle() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		allowed, err := m.limiter.CheckRateLimit(c.Request.Context(), ip)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Rate limit check failed"})
			c.Abort()
			return
		}

		if !allowed {
			retryAfter, _ := m.limiter.GetRetryAfter(c.Request.Context(), ip)
			c.Header("Retry-After", strconv.Itoa(retryAfter))
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			c.Abort()
			return
		}

		c.Next()
	}
}
