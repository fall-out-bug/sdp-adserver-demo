package postgres

import (
	"context"
	"database/sql"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

type publisherRepository struct {
	db *sql.DB
}

// NewPublisherRepository creates a new publisher repository
func NewPublisherRepository(db *sql.DB) repositories.PublisherRepository {
	return &publisherRepository{db: db}
}

func (r *publisherRepository) FindByID(ctx context.Context, id string) (*entities.Publisher, error) {
	var p entities.Publisher

	query := `SELECT id, email, password_hash, company_name, website, status, created_at, updated_at
              FROM publishers WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&p.ID, &p.Email, &p.PasswordHash, &p.CompanyName, &p.Website,
		&p.Status, &p.CreatedAt, &p.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (r *publisherRepository) FindByEmail(ctx context.Context, email string) (*entities.Publisher, error) {
	var p entities.Publisher

	query := `SELECT id, email, password_hash, company_name, website, status, created_at, updated_at
              FROM publishers WHERE email = $1`

	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&p.ID, &p.Email, &p.PasswordHash, &p.CompanyName, &p.Website,
		&p.Status, &p.CreatedAt, &p.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (r *publisherRepository) Create(ctx context.Context, publisher *entities.Publisher) error {
	query := `INSERT INTO publishers (id, email, password_hash, company_name, website, status, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`

	_, err := r.db.ExecContext(ctx, query,
		publisher.ID, publisher.Email, publisher.PasswordHash, publisher.CompanyName,
		publisher.Website, publisher.Status, publisher.CreatedAt, publisher.UpdatedAt,
	)

	return err
}

func (r *publisherRepository) Update(ctx context.Context, publisher *entities.Publisher) error {
	query := `UPDATE publishers SET
              email = $2, password_hash = $3, company_name = $4, website = $5,
              status = $6, updated_at = $7
              WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		publisher.ID, publisher.Email, publisher.PasswordHash, publisher.CompanyName,
		publisher.Website, publisher.Status, publisher.UpdatedAt,
	)

	return err
}
