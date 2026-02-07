package auth

import (
	"errors"
	"net/http"

	"github.com/fall-out-bug/demo-adserver/src/application/auth"
	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/gin-gonic/gin"
)

// AdvertiserHandler handles advertiser HTTP requests
type AdvertiserHandler struct {
	service    *auth.AdvertiserService
	jwtService auth.JWTService
}

// NewAdvertiserHandler creates a new advertiser handler
func NewAdvertiserHandler(service *auth.AdvertiserService, jwtService auth.JWTService) *AdvertiserHandler {
	return &AdvertiserHandler{
		service:    service,
		jwtService: jwtService,
	}
}

// Register handles POST /api/v1/advertisers/register
func (h *AdvertiserHandler) Register(c *gin.Context) {
	var req auth.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.service.Register(c.Request.Context(), &req)
	if err != nil {
		if errors.Is(err, auth.ErrEmailAlreadyExists) {
			c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

// Login handles POST /api/v1/advertisers/login
func (h *AdvertiserHandler) Login(c *gin.Context) {
	var req auth.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.service.Login(c.Request.Context(), &req)
	if err != nil {
		if errors.Is(err, entities.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GetMe handles GET /api/v1/advertisers/me
func (h *AdvertiserHandler) GetMe(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	advertiser, err := h.service.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "advertiser not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           advertiser.ID,
		"email":        advertiser.Email,
		"company_name": advertiser.CompanyName,
		"website":      advertiser.Website,
		"status":       advertiser.Status,
	})
}
