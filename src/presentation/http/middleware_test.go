package http

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	httpmiddleware "github.com/fall-out-bug/demo-adserver/src/presentation/http/middleware"
)

type mockRateLimiter struct {
	allowed bool
}

func (m *mockRateLimiter) CheckRateLimit(ctx interface{}, ip string) (bool, error) {
	return m.allowed, nil
}

func (m *mockRateLimiter) GetRetryAfter(ctx interface{}, ip string) (int, error) {
	return 60, nil
}

func TestRateLimitMiddleware_Allowed(t *testing.T) {
	gin.SetMode(gin.TestMode)

	limiter := &mockRateLimiter{allowed: true}
	middleware := httpmiddleware.NewRateLimitMiddleware(limiter)

	router := gin.New()
	router.Use(middleware.Handle())
	router.GET("/test", func(c *gin.Context) {
		c.Status(200)
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 200 {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}

func TestRateLimitMiddleware_RateLimited(t *testing.T) {
	gin.SetMode(gin.TestMode)

	limiter := &mockRateLimiter{allowed: false}
	middleware := httpmiddleware.NewRateLimitMiddleware(limiter)

	router := gin.New()
	router.Use(middleware.Handle())
	router.GET("/test", func(c *gin.Context) {
		c.Status(200)
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 429 {
		t.Errorf("Expected rate limit status 429, got %d", w.Code)
	}
}

func TestCORSMiddleware_Options(t *testing.T) {
	gin.SetMode(gin.TestMode)

	middleware := httpmiddleware.NewCORSMiddleware()

	router := gin.New()
	router.Use(middleware.Handle())
	router.GET("/test", func(c *gin.Context) {
		c.Status(200)
	})

	req, _ := http.NewRequest("OPTIONS", "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != 204 {
		t.Errorf("Expected OPTIONS status 204, got %d", w.Code)
	}
}

func TestCORSMiddleware_CORSHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)

	middleware := httpmiddleware.NewCORSMiddleware("http://localhost:3000")

	router := gin.New()
	router.Use(middleware.Handle())
	router.GET("/test", func(c *gin.Context) {
		c.Status(200)
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	origin := w.Header().Get("Access-Control-Allow-Origin")
	if origin != "http://localhost:3000" {
		t.Errorf("Expected origin 'http://localhost:3000', got '%s'", origin)
	}

	if w.Header().Get("Access-Control-Allow-Credentials") == "" {
		t.Errorf("Expected credentials header")
	}
}

func TestCORSMiddleware_UnallowedOrigin(t *testing.T) {
	gin.SetMode(gin.TestMode)

	middleware := httpmiddleware.NewCORSMiddleware("http://localhost:3000")

	router := gin.New()
	router.Use(middleware.Handle())
	router.GET("/test", func(c *gin.Context) {
		c.Status(200)
	})

	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Origin", "http://evil.com")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	origin := w.Header().Get("Access-Control-Allow-Origin")
	if origin != "" {
		t.Errorf("Expected no CORS header for unallowed origin, got '%s'", origin)
	}
}
