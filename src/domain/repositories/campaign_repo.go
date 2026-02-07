package repositories

import (
	"context"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

// CampaignRepository defines the interface for campaign data access
type CampaignRepository interface {
	FindByID(ctx context.Context, id string) (*entities.Campaign, error)
	FindActive(ctx context.Context) ([]*entities.Campaign, error)
	FindBySlotID(ctx context.Context, slotID string) ([]*entities.Campaign, error)
	Create(ctx context.Context, campaign *entities.Campaign) error
	Update(ctx context.Context, campaign *entities.Campaign) error
}
