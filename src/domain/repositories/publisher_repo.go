package repositories

import (
	"context"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

// PublisherRepository defines the interface for publisher data access
type PublisherRepository interface {
	FindByID(ctx context.Context, id string) (*entities.Publisher, error)
	FindByEmail(ctx context.Context, email string) (*entities.Publisher, error)
	Create(ctx context.Context, publisher *entities.Publisher) error
	Update(ctx context.Context, publisher *entities.Publisher) error
}
