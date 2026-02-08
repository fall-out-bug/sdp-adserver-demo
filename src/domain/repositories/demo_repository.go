package repositories

import (
	"context"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/google/uuid"
)

// DemoBannerRepository defines the interface for demo banner persistence
type DemoBannerRepository interface {
	// Create creates a new demo banner
	Create(ctx context.Context, banner *entities.DemoBanner) error
	// GetByID retrieves a banner by ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.DemoBanner, error)
	// GetAll retrieves all banners
	GetAll(ctx context.Context) ([]*entities.DemoBanner, error)
	// GetActive retrieves all active banners
	GetActive(ctx context.Context) ([]*entities.DemoBanner, error)
	// GetByFormat retrieves banners by format
	GetByFormat(ctx context.Context, format string) ([]*entities.DemoBanner, error)
	// Update updates an existing banner
	Update(ctx context.Context, banner *entities.DemoBanner) error
	// Delete deletes a banner
	Delete(ctx context.Context, id uuid.UUID) error
	// ExistsBySlotID checks if a banner is assigned to any slot
	ExistsBySlotID(ctx context.Context, bannerID uuid.UUID) (bool, error)
}

// DemoSlotRepository defines the interface for demo slot persistence
type DemoSlotRepository interface {
	// Create creates a new demo slot
	Create(ctx context.Context, slot *entities.DemoSlot) error
	// GetByID retrieves a slot by ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.DemoSlot, error)
	// GetBySlotID retrieves a slot by its slot_id (for Delivery API)
	GetBySlotID(ctx context.Context, slotID string) (*entities.DemoSlot, error)
	// GetAll retrieves all slots with their banners
	GetAll(ctx context.Context) ([]*entities.DemoSlot, error)
	// Update updates an existing slot
	Update(ctx context.Context, slot *entities.DemoSlot) error
	// Delete deletes a slot
	Delete(ctx context.Context, id uuid.UUID) error
	// GetAllActive retrieves all active slots with active banners
	GetAllActive(ctx context.Context) ([]*entities.DemoSlot, error)
}
