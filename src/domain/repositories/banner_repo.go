package repositories

import (
	"context"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

// BannerRepository defines the interface for banner data access
type BannerRepository interface {
	FindByID(ctx context.Context, id string) (*entities.Banner, error)
	FindByCampaignID(ctx context.Context, campaignID string) ([]*entities.Banner, error)
	FindActiveForCampaign(ctx context.Context, campaignID string) ([]*entities.Banner, error)
	Create(ctx context.Context, banner *entities.Banner) error
	Update(ctx context.Context, banner *entities.Banner) error
}
