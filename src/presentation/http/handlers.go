package http

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/fall-out-bug/demo-adserver/src/application/delivery"
	"github.com/fall-out-bug/demo-adserver/src/application/tracking"
)

// DeliveryService defines the interface for banner delivery
type DeliveryService interface {
	DeliverBanner(ctx context.Context, slotID string, req *delivery.DeliveryRequest) (*delivery.GetBannerResponse, error)
}

// ImpressionService defines the interface for impression tracking
type ImpressionService interface {
	Track(ctx context.Context, req *tracking.TrackRequest) *tracking.TrackResponse
}

// ClickService defines the interface for click tracking
type ClickService interface {
	TrackClick(ctx context.Context, impressionID string) *tracking.ClickResponse
}

// DeliveryHandler handles delivery requests
type DeliveryHandler struct {
	service DeliveryService
}

// NewDeliveryHandler creates a new delivery handler
func NewDeliveryHandler(service DeliveryService) *DeliveryHandler {
	return &DeliveryHandler{service: service}
}

// Handle handles GET /api/v1/delivery/:slot_id
func (h *DeliveryHandler) Handle(c *gin.Context) {
	slotID := c.Param("slot_id")

	req := &delivery.DeliveryRequest{
		SlotID:    slotID,
		IP:        c.ClientIP(),
		UserAgent: c.GetHeader("User-Agent"),
		Country:   c.GetHeader("X-Country"),
		Device:    c.GetHeader("X-Device"),
		OS:        c.GetHeader("X-OS"),
		Referer:   c.GetHeader("Referer"),
		Timestamp: time.Now(),
	}

	response, err := h.service.DeliverBanner(c.Request.Context(), slotID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// ImpressionHandler handles impression tracking
type ImpressionHandler struct {
	service ImpressionService
}

// NewImpressionHandler creates a new impression handler
func NewImpressionHandler(service ImpressionService) *ImpressionHandler {
	return &ImpressionHandler{service: service}
}

// Handle handles POST /api/v1/track/impression
func (h *ImpressionHandler) Handle(c *gin.Context) {
	var req tracking.TrackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fire-and-forget (return immediately)
	go func() {
		ctx := context.Background()
		h.service.Track(ctx, &req)
	}()

	c.Status(http.StatusAccepted)
}

// ClickHandler handles click tracking
type ClickHandler struct {
	service ClickService
}

// NewClickHandler creates a new click handler
func NewClickHandler(service ClickService) *ClickHandler {
	return &ClickHandler{service: service}
}

// Handle handles GET /api/v1/track/click/:impression_id
func (h *ClickHandler) Handle(c *gin.Context) {
	impressionID := c.Param("impression_id")

	response := h.service.TrackClick(c.Request.Context(), impressionID)
	if !response.Success {
		c.JSON(http.StatusNotFound, gin.H{"error": response.Message})
		return
	}

	// HTTP 302 Redirect
	c.Redirect(http.StatusFound, response.RedirectURL)
}

// HealthHandler handles health checks
type HealthHandler struct{}

// NewHealthHandler creates a new health handler
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// Handle handles GET /health
func (h *HealthHandler) Handle(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"time":   time.Now().Format(time.RFC3339),
	})
}
