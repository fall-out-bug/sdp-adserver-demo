package postgres

import (
	"context"
	"database/sql"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

type advertiserRepository struct {
	db *sql.DB
}

// NewAdvertiserRepository creates a new advertiser repository
func NewAdvertiserRepository(db *sql.DB) repositories.AdvertiserRepository {
	return &advertiserRepository{db: db}
}

func (r *advertiserRepository) FindByID(ctx context.Context, id string) (*entities.Advertiser, error) {
	var a entities.Advertiser

	query := `SELECT id, email, password_hash, company_name, website, status, created_at, updated_at
              FROM advertisers WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&a.ID, &a.Email, &a.PasswordHash, &a.CompanyName, &a.Website,
		&a.Status, &a.CreatedAt, &a.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &a, nil
}

func (r *advertiserRepository) FindByEmail(ctx context.Context, email string) (*entities.Advertiser, error) {
	var a entities.Advertiser

	query := `SELECT id, email, password_hash, company_name, website, status, created_at, updated_at
              FROM advertisers WHERE email = $1`

	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&a.ID, &a.Email, &a.PasswordHash, &a.CompanyName, &a.Website,
		&a.Status, &a.CreatedAt, &a.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &a, nil
}

func (r *advertiserRepository) Create(ctx context.Context, advertiser *entities.Advertiser) error {
	query := `INSERT INTO advertisers (id, email, password_hash, company_name, website, status, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := r.db.ExecContext(ctx, query,
		advertiser.ID, advertiser.Email, advertiser.PasswordHash, advertiser.CompanyName,
		advertiser.Website, advertiser.Status, advertiser.CreatedAt, advertiser.UpdatedAt,
	)

	return err
}

func (r *advertiserRepository) Update(ctx context.Context, advertiser *entities.Advertiser) error {
	query := `UPDATE advertisers SET
              email = $2, password_hash = $3, company_name = $4, website = $5,
              status = $6, updated_at = $7
              WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		advertiser.ID, advertiser.Email, advertiser.PasswordHash, advertiser.CompanyName,
		advertiser.Website, advertiser.Status, advertiser.UpdatedAt,
	)

	return err
}
