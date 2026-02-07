package auth

import (
	"errors"
	"net/http"

	"github.com/fall-out-bug/demo-adserver/src/application/auth"
	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/gin-gonic/gin"
)

// PublisherHandler handles publisher HTTP requests
type PublisherHandler struct {
	service    *auth.PublisherService
	jwtService auth.JWTService
}

// NewPublisherHandler creates a new publisher handler
func NewPublisherHandler(service *auth.PublisherService, jwtService auth.JWTService) *PublisherHandler {
	return &PublisherHandler{
		service:    service,
		jwtService: jwtService,
	}
}

// Register handles POST /api/v1/publishers/register
func (h *PublisherHandler) Register(c *gin.Context) {
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

// Login handles POST /api/v1/publishers/login
func (h *PublisherHandler) Login(c *gin.Context) {
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

// GetMe handles GET /api/v1/publishers/me
func (h *PublisherHandler) GetMe(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	publisher, err := h.service.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "publisher not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           publisher.ID,
		"email":        publisher.Email,
		"company_name": publisher.CompanyName,
		"website":      publisher.Website,
		"status":       publisher.Status,
	})
}
