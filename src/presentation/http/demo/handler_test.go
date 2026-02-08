package demo

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	demoApp "github.com/fall-out-bug/demo-adserver/src/application/demo"
	"github.com/fall_out-bug/demo-adserver/src/domain/entities"
	"github.com/google/uuid"
)

// Mock repository
type MockDemoBannerRepository struct {
	mock.Mock
}

func (m *MockDemoBannerRepository) Create(ctx interface{}, banner *entities.DemoBanner) error {
	args := m.Called(ctx, banner)
	return args.Error(0)
}

func (m *MockDemoBannerRepository) GetByID(ctx interface{}, id uuid.UUID) (*entities.DemoBanner, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.DemoBanner), args.Error(1)
}

func (m *MockDemoBannerRepository) GetAll(ctx interface{}) ([]*entities.DemoBanner, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entities.DemoBanner), args.Error(1)
}

func (m *MockDemoBannerRepository) GetActive(ctx interface{}) ([]*entities.DemoBanner, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entities.DemoBanner), args.Error(1)
}

func (m *MockDemoBannerRepository) GetByFormat(ctx interface{}, format string) ([]*entities.DemoBanner, error) {
	args := m.Called(ctx, format)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entities.DemoBanner), args.Error(1)
}

func (m *MockDemoBannerRepository) Update(ctx interface{}, banner *entities.DemoBanner) error {
	args := m.Called(ctx, banner)
	return args.Error(0)
}

func (m *MockDemoBannerRepository) Delete(ctx interface{}, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockDemoBannerRepository) ExistsBySlotID(ctx interface{}, bannerID uuid.UUID) (bool, error) {
	args := m.Called(ctx, bannerID)
	return args.Bool(0), args.Error(1)
}

type MockDemoSlotRepository struct {
	mock.Mock
}

func (m *MockDemoSlotRepository) Create(ctx interface{}, slot *entities.DemoSlot) error {
	args := m.Called(ctx, slot)
	return args.Error(0)
}

func (m *MockDemoSlotRepository) GetByID(ctx interface{}, id uuid.UUID) (*entities.DemoSlot, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.DemoSlot), args.Error(1)
}

func (m *MockDemoSlotRepository) GetBySlotID(ctx interface{}, slotID string) (*entities.DemoSlot, error) {
	args := m.Called(ctx, slotID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.DemoSlot), args.Error(1)
}

func (m *MockDemoSlotRepository) GetAll(ctx interface{}) ([]*entities.DemoSlot, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entities.DemoSlot), args.Error(1)
}

func (m *MockDemoSlotRepository) Update(ctx interface{}, slot *entities.DemoSlot) error {
	args := m.Called(ctx, slot)
	return args.Error(0)
}

func (m *MockDemoSlotRepository) Delete(ctx interface{}, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockDemoSlotRepository) GetAllActive(ctx interface{}) ([]*entities.DemoSlot, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*entities.DemoSlot), args.Error(1)
}

func setupTestRouter(handler *Handler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// Public endpoints
	router.GET("/api/v1/demo/slots", handler.ListSlots)
	router.GET("/api/v1/demo/slots/:slot_id/banner", handler.GetSlotBanner)

	// Admin endpoints
	router.POST("/api/v1/demo/banners", handler.CreateBanner)
	router.GET("/api/v1/demo/banners", handler.ListBanners)
	router.PUT("/api/v1/demo/banners/:id", handler.UpdateBanner)
	router.DELETE("/api/v1/demo/banners/:id", handler.DeleteBanner)
	router.POST("/api/v1/demo/slots", handler.CreateSlot)
	router.PUT("/api/v1/demo/slots/:id", handler.UpdateSlot)
	router.DELETE("/api/v1/demo/slots/:id", handler.DeleteSlot)

	return router
}

func TestListSlots(t *testing.T) {
	mockSlotRepo := new(MockDemoSlotRepository)
	mockBannerRepo := new(MockDemoBannerRepository)

	bannerID := uuid.New()
	slot := &entities.DemoSlot{
		ID:           uuid.New(),
		SlotID:       "demo-leaderboard",
		Name:         "Demo Leaderboard",
		Format:       "leaderboard",
		Width:        728,
		Height:       90,
		DemoBannerID: &bannerID,
	}
	slot.DemoBanner = &entities.DemoBanner{
		ID:     bannerID,
		Name:   "Test Banner",
		Format: "leaderboard",
		Active: true,
	}

	mockSlotRepo.On("GetAll", mock.Anything).Return([]*entities.DemoSlot{slot}, nil)

	demoService := demoApp.NewService(mockBannerRepo, mockSlotRepo)
	handler := NewHandler(demoService)
	router := setupTestRouter(handler)

	req, _ := http.NewRequest("GET", "/api/v1/demo/slots", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	mockSlotRepo.AssertExpectations(t)
}

func TestGetSlotBanner_Found(t *testing.T) {
	mockSlotRepo := new(MockDemoSlotRepository)
	mockBannerRepo := new(MockDemoBannerRepository)

	bannerID := uuid.New()
	banner := &entities.DemoBanner{
		ID:     bannerID,
		Name:   "Test Banner",
		Format: "leaderboard",
		HTML:   `<div>Test Ad</div>`,
		Active: true,
	}
	slot := &entities.DemoSlot{
		ID:           uuid.New(),
		SlotID:       "demo-leaderboard",
		Name:         "Demo Leaderboard",
		Format:       "leaderboard",
		Width:        728,
		Height:       90,
		DemoBannerID: &bannerID,
		DemoBanner:   banner,
	}

	mockSlotRepo.On("GetBySlotID", mock.Anything, "demo-leaderboard").Return(slot, nil)

	demoService := demoApp.NewService(mockBannerRepo, mockSlotRepo)
	handler := NewHandler(demoService)
	router := setupTestRouter(handler)

	req, _ := http.NewRequest("GET", "/api/v1/demo/slots/demo-leaderboard/banner", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(t, "Test Ad", response["html"])
	mockSlotRepo.AssertExpectations(t)
}

func TestGetSlotBanner_NotFound(t *testing.T) {
	mockSlotRepo := new(MockDemoSlotRepository)
	mockBannerRepo := new(MockDemoBannerRepository)

	mockSlotRepo.On("GetBySlotID", mock.Anything, "non-existent").Return(
		(*entities.DemoSlot)(nil), assert.AnError)

	demoService := demoApp.NewService(mockBannerRepo, mockSlotRepo)
	handler := NewHandler(demoService)
	router := setupTestRouter(handler)

	req, _ := http.NewRequest("GET", "/api/v1/demo/slots/non-existent/banner", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
	mockSlotRepo.AssertExpectations(t)
}

func TestListBanners(t *testing.T) {
	mockSlotRepo := new(MockDemoSlotRepository)
	mockBannerRepo := new(MockDemoBannerRepository)

	banners := []*entities.DemoBanner{
		{
			ID:     uuid.New(),
			Name:   "Banner 1",
			Format: "leaderboard",
			Active: true,
		},
		{
			ID:     uuid.New(),
			Name:   "Banner 2",
			Format: "medium-rectangle",
			Active: true,
		},
	}

	mockBannerRepo.On("GetAll", mock.Anything).Return(banners, nil)

	demoService := demoApp.NewService(mockBannerRepo, mockSlotRepo)
	handler := NewHandler(demoService)
	router := setupTestRouter(handler)

	req, _ := http.NewRequest("GET", "/api/v1/demo/banners", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response []map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Len(t, response, 2)
	mockBannerRepo.AssertExpectations(t)
}

func TestCreateBanner_InvalidRequest(t *testing.T) {
	mockSlotRepo := new(MockDemoSlotRepository)
	mockBannerRepo := new(MockDemoBannerRepository)

	demoService := demoApp.NewService(mockBannerRepo, mockSlotRepo)
	handler := NewHandler(demoService)
	router := setupTestRouter(handler)

	body := map[string]string{
		"name": "", // Invalid: empty name
	}
	jsonBody, _ := json.Marshal(body)

	req, _ := http.NewRequest("POST", "/api/v1/demo/banners", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestCreateBanner_ValidRequest(t *testing.T) {
	mockSlotRepo := new(MockDemoSlotRepository)
	mockBannerRepo := new(MockDemoBannerRepository)

	bannerID := uuid.New()
	mockBannerRepo.On("Create", mock.Anything, mock.AnythingOfType("*entities.DemoBanner")).
		Return(nil)
	mockBannerRepo.On("GetByID", mock.Anything, mock.Anything).Return(
		&entities.DemoBanner{ID: bannerID, Name: "Test Banner", Format: "leaderboard", Active: true},
		nil,
	)

	demoService := demoApp.NewService(mockBannerRepo, mockSlotRepo)
	handler := NewHandler(demoService)
	router := setupTestRouter(handler)

	body := map[string]interface{}{
		"name":   "Test Banner",
		"format": "leaderboard",
		"width":  728,
		"height": 90,
		"html":   "<div>Ad</div>",
		"active": true,
	}
	jsonBody, _ := json.Marshal(body)

	req, _ := http.NewRequest("POST", "/api/v1/demo/banners", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	mockBannerRepo.AssertExpectations(t)
}
