package http

import (
	"github.com/gin-gonic/gin"
	"github.com/fall-out-bug/demo-adserver/src/application/auth"
	"github.com/fall-out-bug/demo-adserver/src/application/demo"
	httpAuth "github.com/fall-out-bug/demo-adserver/src/presentation/http/auth"
	demoHandler "github.com/fall-out-bug/demo-adserver/src/presentation/http/demo"
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
	demoService *demo.Service,
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

	// Demo API (public endpoints)
	demoH := demoHandler.NewHandler(demoService)
	router.GET("/api/v1/demo/slots", demoH.ListSlots)
	router.GET("/api/v1/demo/slots/:slot_id/banner", demoH.GetSlotBanner)

	// Demo API (admin endpoints - JWT protected)
	adminAuth := middleware.NewAuthMiddleware(jwtAuthenticator, []string{"admin", "publisher", "advertiser"})
	demoAdminGroup := router.Group("/api/v1/demo")
	demoAdminGroup.Use(adminAuth.RequireAuth())
	{
		// Banner CRUD
		demoAdminGroup.POST("/banners", demoH.CreateBanner)
		demoAdminGroup.GET("/banners", demoH.ListBanners)
		demoAdminGroup.PUT("/banners/:id", demoH.UpdateBanner)
		demoAdminGroup.DELETE("/banners/:id", demoH.DeleteBanner)

		// Slot CRUD
		demoAdminGroup.POST("/slots", demoH.CreateSlot)
		demoAdminGroup.PUT("/slots/:id", demoH.UpdateSlot)
		demoAdminGroup.DELETE("/slots/:id", demoH.DeleteSlot)
	}
}
