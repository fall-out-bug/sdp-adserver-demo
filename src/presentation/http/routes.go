package http

import (
	"github.com/gin-gonic/gin"
	"github.com/fall-out-bug/demo-adserver/src/application/auth"
	httpAuth "github.com/fall-out-bug/demo-adserver/src/presentation/http/auth"
	"github.com/fall-out-bug/demo-adserver/src/presentation/http/middleware"
)

// SetupRoutes configures all HTTP routes
func SetupRoutes(
	router *gin.Engine,
	deliveryService DeliveryService,
	impressionService ImpressionService,
	clickService ClickService,
	publisherService *auth.PublisherService,
	advertiserService *auth.AdvertiserService,
	jwtAuthenticator middleware.JWTAuthenticator,
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

	// Publisher API
	publisherHandler := httpAuth.NewPublisherHandler(publisherService, nil)
	router.POST("/api/v1/publishers/register", publisherHandler.Register)
	router.POST("/api/v1/publishers/login", publisherHandler.Login)

	publisherAuth := middleware.NewAuthMiddleware(jwtAuthenticator, []string{"publisher"})
	publisherGroup := router.Group("/api/v1/publishers")
	publisherGroup.Use(publisherAuth.RequireAuth())
	{
		publisherGroup.GET("/me", publisherHandler.GetMe)
	}

	// Advertiser API
	advertiserHandler := httpAuth.NewAdvertiserHandler(advertiserService, nil)
	router.POST("/api/v1/advertisers/register", advertiserHandler.Register)
	router.POST("/api/v1/advertisers/login", advertiserHandler.Login)

	advertiserAuth := middleware.NewAuthMiddleware(jwtAuthenticator, []string{"advertiser"})
	advertiserGroup := router.Group("/api/v1/advertisers")
	advertiserGroup.Use(advertiserAuth.RequireAuth())
	{
		advertiserGroup.GET("/me", advertiserHandler.GetMe)
	}
}
