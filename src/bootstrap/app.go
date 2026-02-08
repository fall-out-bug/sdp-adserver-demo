package bootstrap

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/fall-out-bug/demo-adserver/src/application/auth"
	"github.com/fall-out-bug/demo-adserver/src/application/demo"
	"github.com/fall-out-bug/demo-adserver/src/application/delivery"
	"github.com/fall-out-bug/demo-adserver/src/application/tracking"
	"github.com/fall-out-bug/demo-adserver/src/config"
	httpHandlers "github.com/fall-out-bug/demo-adserver/src/presentation/http"
	"github.com/fall-out-bug/demo-adserver/src/presentation/http/middleware"
	"github.com/fall-out-bug/demo-adserver/src/infrastructure/postgres"
	"github.com/fall-out-bug/demo-adserver/src/infrastructure/redis"
	securityinfra "github.com/fall-out-bug/demo-adserver/src/infrastructure/security"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// App represents the application
type App struct {
	config     *config.Config
	server     *http.Server
	logger     *zap.Logger
	shutdownCh chan struct{}
}

// New creates and initializes the application
func New(cfg *config.Config) (*App, error) {
	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		return nil, fmt.Errorf("failed to create logger: %w", err)
	}

	// Initialize database
	db, err := postgres.NewConnection(cfg.Database.DSN())
	if err != nil {
		logger.Error("Failed to connect to database", zap.Error(err))
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Initialize Redis
	redisClient := redis.NewClient(cfg.Redis.Addr)
	if err := redisClient.Ping(context.Background()); err != nil {
		logger.Error("Failed to connect to Redis", zap.Error(err))
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	// Initialize repositories
	campaignRepo := postgres.NewCampaignRepository(db)
	bannerRepo := postgres.NewBannerRepository(db)
	impressionRepo := postgres.NewImpressionRepository(db)
	clickRepo := postgres.NewClickRepository(db)
	publisherRepo := postgres.NewPublisherRepository(db)
	advertiserRepo := postgres.NewAdvertiserRepository(db)
	demoBannerRepo := postgres.NewDemoBannerRepository(db)
	demoSlotRepo := postgres.NewDemoSlotRepository(db)

	// Initialize infrastructure
	rateLimiter := redis.NewRateLimiter(redisClient.Client)
	deduper := redis.NewDeduper(redisClient.Client)

	// Create cache adapter
	cacheAdapter := &cacheAdapter{cache: redis.NewCache(redisClient.Client)}

	// Initialize security
	passwordHasher := securityinfra.NewBcryptPasswordHasher(12)
	jwtService := securityinfra.NewJWTService(cfg.JWT.Secret, cfg.JWT.Expiration)

	// Initialize services
	deliveryService := delivery.NewService(campaignRepo, bannerRepo, demoBannerRepo, demoSlotRepo, cacheAdapter)
	impressionService := tracking.NewImpressionService(impressionRepo, deduper)
	clickService := tracking.NewClickService(impressionRepo, clickRepo, bannerRepo)
	publisherService := auth.NewPublisherService(publisherRepo, passwordHasher, jwtService)
	advertiserService := auth.NewAdvertiserService(advertiserRepo, passwordHasher, jwtService)
	demoService := demo.NewService(demoBannerRepo, demoSlotRepo)

	// Create JWT authenticator adapter
	jwtAuthenticator := securityinfra.NewJWTAuthenticatorAdapter(jwtService)

	// Setup HTTP server
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())

	// Apply middleware
	loggingMiddleware := middleware.NewLoggingMiddleware(logger)
	router.Use(loggingMiddleware.Handle())

	corsMiddleware := middleware.NewCORSMiddleware(cfg.CORS.AllowedOrigins...)
	router.Use(corsMiddleware.Handle())

	// Create middleware adapters
	rateLimitAdapter := &rateLimitAdapter{limiter: rateLimiter}
	router.Use(middleware.NewRateLimitMiddleware(rateLimitAdapter).Handle())

	// Setup routes with auth services
	httpHandlers.SetupRoutes(router, deliveryService, impressionService, clickService,
		publisherService, advertiserService, demoService, jwtAuthenticator)

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
	}

	return &App{
		config:     cfg,
		server:     server,
		logger:     logger,
		shutdownCh: make(chan struct{}),
	}, nil
}

// rateLimitAdapter adapts redis.RateLimiter to middleware.RateLimiter interface
type rateLimitAdapter struct {
	limiter interface {
		CheckRateLimit(ctx context.Context, ip string) (bool, error)
		GetRetryAfter(ctx context.Context, ip string) (int, error)
	}
}

func (a *rateLimitAdapter) CheckRateLimit(ctx interface{}, ip string) (bool, error) {
	return a.limiter.CheckRateLimit(ctx.(context.Context), ip)
}

func (a *rateLimitAdapter) GetRetryAfter(ctx interface{}, ip string) (int, error) {
	return a.limiter.GetRetryAfter(ctx.(context.Context), ip)
}

// cacheAdapter adapts redis.Cache to delivery.Cache interface
type cacheAdapter struct {
	cache interface {
		GetBanner(ctx context.Context, slotID string) (*redis.CachedBanner, error)
		SetBanner(ctx context.Context, slotID string, banner *redis.CachedBanner) error
	}
}

func (a *cacheAdapter) GetBanner(ctx context.Context, slotID string) (*delivery.CachedBanner, error) {
	b, err := a.cache.GetBanner(ctx, slotID)
	if err != nil || b == nil {
		return nil, err
	}
	return &delivery.CachedBanner{
		HTML:       b.HTML,
		Width:      b.Width,
		Height:     b.Height,
		ClickURL:   b.ClickURL,
		Impression: b.Impression,
		CampaignID: b.CampaignID,
	}, nil
}

func (a *cacheAdapter) SetBanner(ctx context.Context, slotID string, banner *delivery.CachedBanner) error {
	return a.cache.SetBanner(ctx, slotID, &redis.CachedBanner{
		HTML:       banner.HTML,
		Width:      banner.Width,
		Height:     banner.Height,
		ClickURL:   banner.ClickURL,
		Impression: banner.Impression,
		CampaignID: banner.CampaignID,
	})
}

// Run starts the HTTP server
func (a *App) Run() error {
	a.logger.Info("Starting server",
		zap.String("addr", a.server.Addr),
		zap.Int("port", a.config.Server.Port),
	)

	// Start server in goroutine
	go func() {
		if err := a.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			a.logger.Error("Server error", zap.Error(err))
		}
	}()

	// Wait for shutdown signal
	<-a.shutdownCh

	// Graceful shutdown
	a.logger.Info("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), a.config.Server.ShutdownTimeout)
	defer cancel()

	if err := a.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown failed: %w", err)
	}

	a.logger.Info("Server stopped")
	return nil
}

// Shutdown gracefully shuts down the server
func (a *App) Shutdown() {
	close(a.shutdownCh)
}

// WaitForShutdown waits for interrupt signal
func (a *App) WaitForShutdown() {
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh
}
