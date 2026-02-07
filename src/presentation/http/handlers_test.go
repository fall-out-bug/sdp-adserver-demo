package http

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/fall-out-bug/demo-adserver/src/application/delivery"
)

// Mock service for testing
type mockDeliveryService struct{}

func (m *mockDeliveryService) DeliverBanner(ctx context.Context, slotID string, req *delivery.DeliveryRequest) (*delivery.GetBannerResponse, error) {
	return &delivery.GetBannerResponse{
		Creative: &delivery.Creative{
			HTML:   "<div>Test Ad</div>",
			Width:  300,
			Height: 250,
		},
		Tracking: &delivery.TrackingInfo{
			Impression: "/api/v1/track/impression?id=123",
			Click:      "https://example.com",
		},
	}, nil
}

func TestDeliveryHandler_Handle_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := &mockDeliveryService{}
	handler := NewDeliveryHandler(service)

	router := gin.New()
	router.GET("/api/v1/delivery/:slot_id", handler.Handle)

	req, _ := http.NewRequest("GET", "/api/v1/delivery/slot-1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	if w.Header().Get("Content-Type") != "application/json; charset=utf-8" {
		t.Errorf("Expected JSON content type")
	}
}

func TestHealthHandler_Handle_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewHealthHandler()

	router := gin.New()
	router.GET("/health", handler.Handle)

	req, _ := http.NewRequest("GET", "/health", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}
}
