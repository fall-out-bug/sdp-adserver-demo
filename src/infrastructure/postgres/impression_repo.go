package postgres

import (
	"context"
	"database/sql"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

type impressionRepository struct {
	db *sql.DB
}

// NewImpressionRepository creates a new impression repository
func NewImpressionRepository(db *sql.DB) repositories.ImpressionRepository {
	return &impressionRepository{db: db}
}

func (r *impressionRepository) Create(ctx context.Context, impression *entities.Impression) error {
	query := `INSERT INTO impressions (id, banner_id, slot_id, campaign_id, timestamp, ip,
                                     user_agent, referer, country, device, fraud_score)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

	_, err := r.db.ExecContext(ctx, query,
		impression.ID, impression.BannerID, impression.SlotID, impression.CampaignID,
		impression.Timestamp, impression.IP, impression.UserAgent, impression.Referer,
		impression.Country, impression.Device, impression.FraudScore,
	)

	return err
}

func (r *impressionRepository) CountBySlotID(ctx context.Context, slotID string, since time.Time) (int64, error) {
	var count int64

	query := `SELECT COUNT(*) FROM impressions WHERE slot_id = $1 AND timestamp >= $2`

	err := r.db.QueryRowContext(ctx, query, slotID, since).Scan(&count)

	return count, err
}

func (r *impressionRepository) Exists(ctx context.Context, slotID, userID string, within time.Duration) (bool, error) {
	var exists bool
	cutoff := time.Now().Add(-within)

	query := `SELECT EXISTS(
              SELECT 1 FROM impressions
              WHERE slot_id = $1 AND ip = $2 AND timestamp >= $3
              LIMIT 1
          )`

	err := r.db.QueryRowContext(ctx, query, slotID, userID, cutoff).Scan(&exists)

	return exists, err
}

func (r *impressionRepository) FindByImpressionID(ctx context.Context, impressionID string) (*entities.Impression, error) {
	var i entities.Impression

	query := `SELECT id, banner_id, slot_id, campaign_id, timestamp, ip,
              user_agent, referer, country, device, fraud_score
              FROM impressions WHERE id = $1`

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
