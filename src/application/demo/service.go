package demo

import (
	"context"
	"fmt"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
	"github.com/google/uuid"
)

// Service provides demo banner and slot management
type Service struct {
	bannerRepo repositories.DemoBannerRepository
	slotRepo   repositories.DemoSlotRepository
}

// NewService creates a new demo service
func NewService(bannerRepo repositories.DemoBannerRepository, slotRepo repositories.DemoSlotRepository) *Service {
	return &Service{
		bannerRepo: bannerRepo,
		slotRepo:   slotRepo,
	}
}

// Banner CRUD operations

// CreateBanner creates a new demo banner
func (s *Service) CreateBanner(ctx context.Context, name, format string, width, height int, html, imageURL, clickURL string) (*entities.DemoBanner, error) {
	banner, err := entities.NewDemoBanner(name, format, width, height, html, imageURL, clickURL)
	if err != nil {
		return nil, fmt.Errorf("invalid banner: %w", err)
	}

	if err := s.bannerRepo.Create(ctx, banner); err != nil {
		return nil, fmt.Errorf("failed to create banner: %w", err)
	}

	return banner, nil
}

// GetBanner retrieves a banner by ID
func (s *Service) GetBanner(ctx context.Context, id uuid.UUID) (*entities.DemoBanner, error) {
	return s.bannerRepo.GetByID(ctx, id)
}

// GetAllBanners retrieves all banners
func (s *Service) GetAllBanners(ctx context.Context) ([]*entities.DemoBanner, error) {
	return s.bannerRepo.GetAll(ctx)
}

// GetActiveBanners retrieves all active banners
func (s *Service) GetActiveBanners(ctx context.Context) ([]*entities.DemoBanner, error) {
	return s.bannerRepo.GetActive(ctx)
}

// GetBannersByFormat retrieves banners by format
func (s *Service) GetBannersByFormat(ctx context.Context, format string) ([]*entities.DemoBanner, error) {
	return s.bannerRepo.GetByFormat(ctx, format)
}

// UpdateBanner updates an existing banner
func (s *Service) UpdateBanner(ctx context.Context, id uuid.UUID, name, format string, width, height int, html, imageURL, clickURL string, active bool) (*entities.DemoBanner, error) {
	banner, err := s.bannerRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("banner not found: %w", err)
	}

	// Update fields
	banner.Name = name
	banner.Format = format
	banner.HTML = html
	banner.ImageURL = imageURL
	banner.Width = width
	banner.Height = height
	banner.ClickURL = clickURL
	banner.Active = active

	// Validate updated banner
	if err := banner.Validate(); err != nil {
		return nil, fmt.Errorf("invalid banner: %w", err)
	}

	if err := s.bannerRepo.Update(ctx, banner); err != nil {
		return nil, fmt.Errorf("failed to update banner: %w", err)
	}

	return banner, nil
}

// DeleteBanner deletes a banner
func (s *Service) DeleteBanner(ctx context.Context, id uuid.UUID) error {
	// Check if banner is assigned to any slot
	exists, err := s.bannerRepo.ExistsBySlotID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check banner usage: %w", err)
	}
	if exists {
		return fmt.Errorf("cannot delete banner: it is assigned to one or more slots")
	}

	if err := s.bannerRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete banner: %w", err)
	}

	return nil
}

// Slot CRUD operations

// CreateSlot creates a new demo slot
func (s *Service) CreateSlot(ctx context.Context, slotID, name, format string, width, height int, bannerID *uuid.UUID) (*entities.DemoSlot, error) {
	slot, err := entities.NewDemoSlot(slotID, name, format, width, height, bannerID)
	if err != nil {
		return nil, fmt.Errorf("invalid slot: %w", err)
	}

	// Validate banner exists if provided
	if bannerID != nil {
		_, err := s.bannerRepo.GetByID(ctx, *bannerID)
		if err != nil {
			return nil, fmt.Errorf("banner not found: %w", err)
		}
	}

	if err := s.slotRepo.Create(ctx, slot); err != nil {
		return nil, fmt.Errorf("failed to create slot: %w", err)
	}

	return slot, nil
}

// GetSlot retrieves a slot by ID
func (s *Service) GetSlot(ctx context.Context, id uuid.UUID) (*entities.DemoSlot, error) {
	return s.slotRepo.GetByID(ctx, id)
}

// GetSlotBySlotID retrieves a slot by slot_id
func (s *Service) GetSlotBySlotID(ctx context.Context, slotID string) (*entities.DemoSlot, error) {
	return s.slotRepo.GetBySlotID(ctx, slotID)
}

// GetAllSlots retrieves all slots with their banners
func (s *Service) GetAllSlots(ctx context.Context) ([]*entities.DemoSlot, error) {
	return s.slotRepo.GetAll(ctx)
}

// GetActiveSlots retrieves all active slots with active banners
func (s *Service) GetActiveSlots(ctx context.Context) ([]*entities.DemoSlot, error) {
	return s.slotRepo.GetAllActive(ctx)
}

// UpdateSlot updates an existing slot
func (s *Service) UpdateSlot(ctx context.Context, id uuid.UUID, slotID, name, format string, width, height int, bannerID *uuid.UUID) (*entities.DemoSlot, error) {
	slot, err := s.slotRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("slot not found: %w", err)
	}

	// Update fields
	slot.SlotID = slotID
	slot.Name = name
	slot.Format = format
	slot.Width = width
	slot.Height = height
	slot.DemoBannerID = bannerID

	// Validate updated slot
	if err := slot.Validate(); err != nil {
		return nil, fmt.Errorf("invalid slot: %w", err)
	}

	// Validate banner exists if provided
	if bannerID != nil {
		_, err := s.bannerRepo.GetByID(ctx, *bannerID)
		if err != nil {
			return nil, fmt.Errorf("banner not found: %w", err)
		}
	}

	if err := s.slotRepo.Update(ctx, slot); err != nil {
		return nil, fmt.Errorf("failed to update slot: %w", err)
	}

	return slot, nil
}

// DeleteSlot deletes a slot
func (s *Service) DeleteSlot(ctx context.Context, id uuid.UUID) error {
	if err := s.slotRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete slot: %w", err)
	}

	return nil
}

// GetBannerForSlot retrieves the banner for a given slot_id (for Delivery API)
func (s *Service) GetBannerForSlot(ctx context.Context, slotID string) (*entities.DemoBanner, error) {
	slot, err := s.slotRepo.GetBySlotID(ctx, slotID)
	if err != nil {
		return nil, fmt.Errorf("slot not found: %w", err)
	}

	if slot.DemoBanner == nil {
		return nil, fmt.Errorf("no banner assigned to slot")
	}

	if !slot.DemoBanner.Active {
		return nil, fmt.Errorf("banner is not active")
	}

	return slot.DemoBanner, nil
}
