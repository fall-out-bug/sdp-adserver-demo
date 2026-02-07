package http

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/fall-out-bug/demo-adserver/src/application/delivery"
)

type mockFailingDeliveryService struct{}

func (m *mockFailingDeliveryService) DeliverBanner(ctx context.Context, slotID string, req *delivery.DeliveryRequest) (*delivery.GetBannerResponse, error) {
	return nil, errors.New("service error")
}

func TestDeliveryHandler_Handle_Error(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := &mockFailingDeliveryService{}
	handler := NewDeliveryHandler(service)

	router := gin.New()
	router.GET("/api/v1/delivery/:slot_id", handler.Handle)

	req, _ := http.NewRequest("GET", "/api/v1/delivery/slot-1", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("Expected status 500, got %d", w.Code)
	}
}

func TestDeliveryHandler_Handle_MissingSlotID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := &mockDeliveryService{}
	handler := NewDeliveryHandler(service)

	router := gin.New()
	router.GET("/api/v1/delivery/:slot_id", handler.Handle)

	req, _ := http.NewRequest("GET", "/api/v1/delivery/", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Gin should return 404 for missing route param
	if w.Code != 404 {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}
