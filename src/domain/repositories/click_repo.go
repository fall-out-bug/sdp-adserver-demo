package repositories

import (
	"context"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

// ClickRepository defines the interface for click data access
type ClickRepository interface {
	Create(ctx context.Context, click *entities.Click) error
	CountByBannerID(ctx context.Context, bannerID string, since time.Time) (int64, error)
	FindByImpressionID(ctx context.Context, impressionID string) (*entities.Impression, error)
}
