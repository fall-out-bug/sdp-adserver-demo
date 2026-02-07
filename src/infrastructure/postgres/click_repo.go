package postgres

import (
	"context"
	"database/sql"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

type clickRepository struct {
	db *sql.DB
}

// NewClickRepository creates a new click repository
func NewClickRepository(db *sql.DB) repositories.ClickRepository {
	return &clickRepository{db: db}
}

func (r *clickRepository) Create(ctx context.Context, click *entities.Click) error {
	query := `INSERT INTO clicks (id, impression_id, banner_id, timestamp, ip, referer, country)
              VALUES ($1, $2, $3, $4, $5, $6, $7)`

	_, err := r.db.ExecContext(ctx, query,
		click.ID, click.ImpressionID, click.BannerID,
		click.Timestamp, click.IP, click.Referer, click.Country,
	)

	return err
}

func (r *clickRepository) CountByBannerID(ctx context.Context, bannerID string, since time.Time) (int64, error) {
	var count int64

	query := `SELECT COUNT(*) FROM clicks WHERE banner_id = $1 AND timestamp >= $2`

	err := r.db.QueryRowContext(ctx, query, bannerID, since).Scan(&count)

	return count, err
}

func (r *clickRepository) FindByImpressionID(ctx context.Context, impressionID string) (*entities.Impression, error) {
	var i entities.Impression

	query := `SELECT i.id, i.banner_id, i.slot_id, i.campaign_id, i.timestamp, i.ip,
              i.user_agent, i.referer, i.country, i.device, i.fraud_score
              FROM impressions i
              JOIN clicks c ON c.impression_id = i.id
              WHERE c.impression_id = $1`

	err := r.db.QueryRowContext(ctx, query, impressionID).Scan(
		&i.ID, &i.BannerID, &i.SlotID, &i.CampaignID, &i.Timestamp,
		&i.IP, &i.UserAgent, &i.Referer, &i.Country, &i.Device, &i.FraudScore,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &i, nil
}
