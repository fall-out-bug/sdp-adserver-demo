package postgres

import (
	"context"
	"database/sql"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

type bannerRepository struct {
	db *sql.DB
}

// NewBannerRepository creates a new banner repository
func NewBannerRepository(db *sql.DB) repositories.BannerRepository {
	return &bannerRepository{db: db}
}

func (r *bannerRepository) FindByID(ctx context.Context, id string) (*entities.Banner, error) {
	var b entities.Banner

	query := `SELECT id, campaign_id, name, status, size, html, click_url, weight, created_at, updated_at
              FROM banners WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&b.ID, &b.CampaignID, &b.Name, &b.Status, &b.Size, &b.HTML, &b.ClickURL,
		&b.Weight, &b.CreatedAt, &b.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &b, nil
}

func (r *bannerRepository) FindByCampaignID(ctx context.Context, campaignID string) ([]*entities.Banner, error) {
	query := `SELECT id, campaign_id, name, status, size, html, click_url, weight, created_at, updated_at
              FROM banners WHERE campaign_id = $1 ORDER BY created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, campaignID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var banners []*entities.Banner
	for rows.Next() {
		var b entities.Banner
		if err := rows.Scan(
			&b.ID, &b.CampaignID, &b.Name, &b.Status, &b.Size, &b.HTML, &b.ClickURL,
			&b.Weight, &b.CreatedAt, &b.UpdatedAt,
		); err != nil {
			return nil, err
		}
		banners = append(banners, &b)
	}

	return banners, rows.Err()
}

func (r *bannerRepository) FindActiveForCampaign(ctx context.Context, campaignID string) ([]*entities.Banner, error) {
	query := `SELECT id, campaign_id, name, status, size, html, click_url, weight, created_at, updated_at
              FROM banners WHERE campaign_id = $1 AND status = 'active' ORDER BY weight DESC`

	rows, err := r.db.QueryContext(ctx, query, campaignID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var banners []*entities.Banner
	for rows.Next() {
		var b entities.Banner
		if err := rows.Scan(
			&b.ID, &b.CampaignID, &b.Name, &b.Status, &b.Size, &b.HTML, &b.ClickURL,
			&b.Weight, &b.CreatedAt, &b.UpdatedAt,
		); err != nil {
			return nil, err
		}
		banners = append(banners, &b)
	}

	return banners, rows.Err()
}

func (r *bannerRepository) Create(ctx context.Context, banner *entities.Banner) error {
	query := `INSERT INTO banners (id, campaign_id, name, status, size, html, click_url, weight, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err := r.db.ExecContext(ctx, query,
		banner.ID, banner.CampaignID, banner.Name, banner.Status, banner.Size,
		banner.HTML, banner.ClickURL, banner.Weight, banner.CreatedAt, banner.UpdatedAt,
	)

	return err
}

func (r *bannerRepository) Update(ctx context.Context, banner *entities.Banner) error {
	query := `UPDATE banners SET
              name = $2, status = $3, size = $4, html = $5, click_url = $6, weight = $7, updated_at = $8
              WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		banner.ID, banner.Name, banner.Status, banner.Size,
		banner.HTML, banner.ClickURL, banner.Weight, banner.UpdatedAt,
	)

	return err
}
