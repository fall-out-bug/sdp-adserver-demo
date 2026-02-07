package http

import (
	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all HTTP routes
func SetupRoutes(
	router *gin.Engine,
	deliveryService DeliveryService,
	impressionService ImpressionService,
	clickService ClickService,
) {
	// Health check
	healthHandler := NewHealthHandler()
	router.GET("/health", healthHandler.Handle)

	// Delivery API
	deliveryHandler := NewDeliveryHandler(deliveryService)
	router.GET("/api/v1/delivery/:slot_id", deliveryHandler.Handle)

	// Tracking APIs
	impressionHandler := NewImpressionHandler(impressionService)
	router.POST("/api/v1/track/impression", impressionHandler.Handle)

	clickHandler := NewClickHandler(clickService)
	router.GET("/api/v1/track/click/:impression_id", clickHandler.Handle)
}
