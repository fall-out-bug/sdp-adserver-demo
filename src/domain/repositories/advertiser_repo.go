package repositories

import (
	"context"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

// AdvertiserRepository defines the interface for advertiser data access
type AdvertiserRepository interface {
	FindByID(ctx context.Context, id string) (*entities.Advertiser, error)
	FindByEmail(ctx context.Context, email string) (*entities.Advertiser, error)
	Create(ctx context.Context, advertiser *entities.Advertiser) error
	Update(ctx context.Context, advertiser *entities.Advertiser) error
}
