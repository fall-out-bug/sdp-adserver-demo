package repositories

import (
	"context"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

// ImpressionRepository defines the interface for impression data access
type ImpressionRepository interface {
	Create(ctx context.Context, impression *entities.Impression) error
	CountBySlotID(ctx context.Context, slotID string, since time.Time) (int64, error)
	Exists(ctx context.Context, slotID, userID string, within time.Duration) (bool, error)
	FindByImpressionID(ctx context.Context, impressionID string) (*entities.Impression, error)
}
