package demo

import (
	"net/http"

	"github.com/fall-out-bug/demo-adserver/src/application/demo"
	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Handler handles demo website HTTP requests
type Handler struct {
	service *demo.Service
}

// NewHandler creates a new demo handler
func NewHandler(service *demo.Service) *Handler {
	return &Handler{service: service}
}

// Public endpoints

// ListSlots handles GET /api/v1/demo/slots
func (h *Handler) ListSlots(c *gin.Context) {
	slots, err := h.service.GetAllSlots(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"slots": slots})
}

// GetSlotBanner handles GET /api/v1/demo/slots/:slot_id/banner
func (h *Handler) GetSlotBanner(c *gin.Context) {
	slotID := c.Param("slot_id")

	banner, err := h.service.GetBannerForSlot(c.Request.Context(), slotID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, banner)
}

// Admin endpoints (JWT protected)

// CreateBannerRequest represents a create banner request
type CreateBannerRequest struct {
	Name     string `json:"name" binding:"required"`
	Format   string `json:"format" binding:"required"`
	Width    int    `json:"width" binding:"required,min=1"`
	Height   int    `json:"height" binding:"required,min=1"`
	HTML     string `json:"html"`
	ImageURL string `json:"image_url"`
	ClickURL string `json:"click_url"`
}

// CreateBanner handles POST /api/v1/demo/banners
func (h *Handler) CreateBanner(c *gin.Context) {
	var req CreateBannerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	banner, err := h.service.CreateBanner(c.Request.Context(), req.Name, req.Format, req.Width, req.Height, req.HTML, req.ImageURL, req.ClickURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, banner)
}

// UpdateBannerRequest represents an update banner request
type UpdateBannerRequest struct {
	Name     string `json:"name" binding:"required"`
	Format   string `json:"format" binding:"required"`
	Width    int    `json:"width" binding:"required,min=1"`
	Height   int    `json:"height" binding:"required,min=1"`
	HTML     string `json:"html"`
	ImageURL string `json:"image_url"`
	ClickURL string `json:"click_url"`
	Active   bool   `json:"active"`
}

// UpdateBanner handles PUT /api/v1/demo/banners/:id
func (h *Handler) UpdateBanner(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid banner ID"})
		return
	}

	var req UpdateBannerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	banner, err := h.service.UpdateBanner(c.Request.Context(), id, req.Name, req.Format, req.Width, req.Height, req.HTML, req.ImageURL, req.ClickURL, req.Active)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, banner)
}

// DeleteBanner handles DELETE /api/v1/demo/banners/:id
func (h *Handler) DeleteBanner(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid banner ID"})
		return
	}

	if err := h.service.DeleteBanner(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// ListBanners handles GET /api/v1/demo/banners
func (h *Handler) ListBanners(c *gin.Context) {
	banners, err := h.service.GetAllBanners(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"banners": banners})
}

// CreateSlotRequest represents a create slot request
type CreateSlotRequest struct {
	SlotID    string `json:"slot_id" binding:"required"`
	Name      string `json:"name" binding:"required"`
	Format    string `json:"format" binding:"required"`
	Width     int    `json:"width" binding:"required,min=1"`
	Height    int    `json:"height" binding:"required,min=1"`
	BannerID  string `json:"banner_id"`
}

// CreateSlot handles POST /api/v1/demo/slots
func (h *Handler) CreateSlot(c *gin.Context) {
	var req CreateSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var bannerID *uuid.UUID
	if req.BannerID != "" {
		id, err := uuid.Parse(req.BannerID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid banner ID"})
			return
		}
		bannerID = &id
	}

	slot, err := h.service.CreateSlot(c.Request.Context(), req.SlotID, req.Name, req.Format, req.Width, req.Height, bannerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, slot)
}

// UpdateSlotRequest represents an update slot request
type UpdateSlotRequest struct {
	SlotID   string `json:"slot_id" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Format   string `json:"format" binding:"required"`
	Width    int    `json:"width" binding:"required,min=1"`
	Height   int    `json:"height" binding="required,min=1"`
	BannerID string `json:"banner_id"`
}

// UpdateSlot handles PUT /api/v1/demo/slots/:id
func (h *Handler) UpdateSlot(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid slot ID"})
		return
	}

	var req UpdateSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var bannerID *uuid.UUID
	if req.BannerID != "" {
		bid, err := uuid.Parse(req.BannerID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid banner ID"})
			return
		}
		bannerID = &bid
	}

	slot, err := h.service.UpdateSlot(c.Request.Context(), id, req.SlotID, req.Name, req.Format, req.Width, req.Height, bannerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, slot)
}

// DeleteSlot handles DELETE /api/v1/demo/slots/:id
func (h *Handler) DeleteSlot(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid slot ID"})
		return
	}

	if err := h.service.DeleteSlot(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// SuccessResponse represents a success response
type SuccessResponse struct {
	Message string `json:"message"`
}

// BannerResponse represents a banner response
type BannerResponse struct {
	Banner *entities.DemoBanner `json:"banner"`
}

// SlotResponse represents a slot response
type SlotResponse struct {
	Slot *entities.DemoSlot `json:"slot"`
}

// BannersResponse represents a list of banners response
type BannersResponse struct {
	Banners []*entities.DemoBanner `json:"banners"`
}

// SlotsResponse represents a list of slots response
type SlotsResponse struct {
	Slots []*entities.DemoSlot `json:"slots"`
}
