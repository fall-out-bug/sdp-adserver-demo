package postgres

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

type campaignRepository struct {
	db *sql.DB
}

// NewCampaignRepository creates a new campaign repository
func NewCampaignRepository(db *sql.DB) repositories.CampaignRepository {
	return &campaignRepository{db: db}
}

func (r *campaignRepository) FindByID(ctx context.Context, id string) (*entities.Campaign, error) {
	var c entities.Campaign
	var targetingJSON []byte

	query := `SELECT id, name, status, budget_total, budget_daily,
                     start_date, end_date, targeting, created_at, updated_at
              FROM campaigns WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&c.ID, &c.Name, &c.Status, &c.BudgetTotal, &c.BudgetDaily,
		&c.StartDate, &c.EndDate, &targetingJSON, &c.CreatedAt, &c.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(targetingJSON, &c.Targeting); err != nil {
		return nil, err
	}

	return &c, nil
}

func (r *campaignRepository) FindActive(ctx context.Context) ([]*entities.Campaign, error) {
	query := `SELECT id, name, status, budget_total, budget_daily,
                     start_date, end_date, targeting, created_at, updated_at
              FROM campaigns
              WHERE status = 'active'
                AND start_date <= NOW()
                AND (end_date IS NULL OR end_date > NOW())
              ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var campaigns []*entities.Campaign
	for rows.Next() {
		var c entities.Campaign
		var targetingJSON []byte

		if err := rows.Scan(
			&c.ID, &c.Name, &c.Status, &c.BudgetTotal, &c.BudgetDaily,
			&c.StartDate, &c.EndDate, &targetingJSON, &c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return nil, err
		}

		if err := json.Unmarshal(targetingJSON, &c.Targeting); err != nil {
			return nil, err
		}

		campaigns = append(campaigns, &c)
	}

	return campaigns, rows.Err()
}

func (r *campaignRepository) FindBySlotID(ctx context.Context, slotID string) ([]*entities.Campaign, error) {
	// For now, return all active campaigns - slot-specific filtering would be done at application layer
	// In a real implementation, you'd have a slot_campaigns mapping table
	return r.FindActive(ctx)
}

func (r *campaignRepository) Create(ctx context.Context, campaign *entities.Campaign) error {
	targetingJSON, err := json.Marshal(campaign.Targeting)
	if err != nil {
		return err
	}

	query := `INSERT INTO campaigns (id, name, status, budget_total, budget_daily,
                                     start_date, end_date, targeting, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err = r.db.ExecContext(ctx, query,
		campaign.ID, campaign.Name, campaign.Status, campaign.BudgetTotal, campaign.BudgetDaily,
		campaign.StartDate, campaign.EndDate, targetingJSON, campaign.CreatedAt, campaign.UpdatedAt,
	)

	return err
}

func (r *campaignRepository) Update(ctx context.Context, campaign *entities.Campaign) error {
	targetingJSON, err := json.Marshal(campaign.Targeting)
	if err != nil {
		return err
	}

	query := `UPDATE campaigns SET
              name = $2, status = $3, budget_total = $4, budget_daily = $5,
              start_date = $6, end_date = $7, targeting = $8, updated_at = $9
              WHERE id = $1`

	_, err = r.db.ExecContext(ctx, query,
		campaign.ID, campaign.Name, campaign.Status, campaign.BudgetTotal, campaign.BudgetDaily,
		campaign.StartDate, campaign.EndDate, targetingJSON, campaign.UpdatedAt,
	)

	return err
}
