package postgres

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// nullUUID represents a nullable UUID
type nullUUID struct {
	UUID  uuid.UUID
	Valid bool
}

// Scan implements the sql.Scanner interface
func (n *nullUUID) Scan(value interface{}) error {
	if value == nil {
		n.Valid = false
		return nil
	}

	// Handle both string and byte slice representations
	switch v := value.(type) {
	case []byte:
		if len(v) == 0 {
			n.Valid = false
			return nil
		}
		var err error
		n.UUID, err = uuid.FromBytes(v)
		if err == nil {
			n.Valid = true
		}
		return err
	case string:
		if v == "" {
			n.Valid = false
			return nil
		}
		var err error
		n.UUID, err = uuid.Parse(v)
		if err == nil {
			n.Valid = true
		}
		return err
	default:
		return fmt.Errorf("invalid type for UUID: %T", value)
	}
}

type demoBannerRepository struct {
	db *sqlx.DB
}

// NewDemoBannerRepository creates a new demo banner repository
func NewDemoBannerRepository(db interface{}) repositories.DemoBannerRepository {
	// Handle both sqlx.DB and *sqlx.DB for compatibility
	var sqlxDB *sqlx.DB
	switch v := db.(type) {
	case *sqlx.DB:
		sqlxDB = v
	case sqlx.Ext:
		sqlxDB = v.(*sqlx.DB)
	default:
		// Try to convert from sql.DB
		if sqlDB, ok := db.(*sql.DB); ok {
			sqlxDB = sqlx.NewDb(sqlDB, "postgres")
		} else {
			panic("demoBannerRepository requires sqlx.DB or sql.DB")
		}
	}
	return &demoBannerRepository{db: sqlxDB}
}

func (r *demoBannerRepository) Create(ctx context.Context, banner *entities.DemoBanner) error {
	query := `
		INSERT INTO demo_banners (id, name, format, html, image_url, width, height, click_url, active, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(ctx, query,
		banner.ID, banner.Name, banner.Format, banner.HTML, banner.ImageURL,
		banner.Width, banner.Height, banner.ClickURL, banner.Active, banner.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create demo banner: %w", err)
	}
	return nil
}

func (r *demoBannerRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.DemoBanner, error) {
	var banner entities.DemoBanner
	query := `SELECT id, name, format, html, image_url, width, height, click_url, active, created_at FROM demo_banners WHERE id = $1`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&banner.ID, &banner.Name, &banner.Format, &banner.HTML, &banner.ImageURL,
		&banner.Width, &banner.Height, &banner.ClickURL, &banner.Active, &banner.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get demo banner: %w", err)
	}
	return &banner, nil
}

func (r *demoBannerRepository) GetAll(ctx context.Context) ([]*entities.DemoBanner, error) {
	query := `SELECT id, name, format, html, image_url, width, height, click_url, active, created_at FROM demo_banners ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all demo banners: %w", err)
	}
	defer rows.Close()

	var banners []*entities.DemoBanner
	for rows.Next() {
		var banner entities.DemoBanner
		err := rows.Scan(
			&banner.ID, &banner.Name, &banner.Format, &banner.HTML, &banner.ImageURL,
			&banner.Width, &banner.Height, &banner.ClickURL, &banner.Active, &banner.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan banner: %w", err)
		}
		banners = append(banners, &banner)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating banners: %w", err)
	}

	return banners, nil
}

func (r *demoBannerRepository) GetActive(ctx context.Context) ([]*entities.DemoBanner, error) {
	query := `SELECT id, name, format, html, image_url, width, height, click_url, active, created_at FROM demo_banners WHERE active = true ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get active demo banners: %w", err)
	}
	defer rows.Close()

	var banners []*entities.DemoBanner
	for rows.Next() {
		var banner entities.DemoBanner
		err := rows.Scan(
			&banner.ID, &banner.Name, &banner.Format, &banner.HTML, &banner.ImageURL,
			&banner.Width, &banner.Height, &banner.ClickURL, &banner.Active, &banner.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan banner: %w", err)
		}
		banners = append(banners, &banner)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating banners: %w", err)
	}

	return banners, nil
}

func (r *demoBannerRepository) GetByFormat(ctx context.Context, format string) ([]*entities.DemoBanner, error) {
	query := `SELECT id, name, format, html, image_url, width, height, click_url, active, created_at FROM demo_banners WHERE format = $1 ORDER BY created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, format)
	if err != nil {
		return nil, fmt.Errorf("failed to get demo banners by format: %w", err)
	}
	defer rows.Close()

	var banners []*entities.DemoBanner
	for rows.Next() {
		var banner entities.DemoBanner
		err := rows.Scan(
			&banner.ID, &banner.Name, &banner.Format, &banner.HTML, &banner.ImageURL,
			&banner.Width, &banner.Height, &banner.ClickURL, &banner.Active, &banner.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan banner: %w", err)
		}
		banners = append(banners, &banner)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating banners: %w", err)
	}

	return banners, nil
}

func (r *demoBannerRepository) Update(ctx context.Context, banner *entities.DemoBanner) error {
	query := `
		UPDATE demo_banners
		SET name = $2, format = $3, html = $4, image_url = $5, width = $6, height = $7, click_url = $8, active = $9
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		banner.ID, banner.Name, banner.Format, banner.HTML, banner.ImageURL,
		banner.Width, banner.Height, banner.ClickURL, banner.Active,
	)
	if err != nil {
		return fmt.Errorf("failed to update demo banner: %w", err)
	}
	return nil
}

func (r *demoBannerRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM demo_banners WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete demo banner: %w", err)
	}
	return nil
}

func (r *demoBannerRepository) ExistsBySlotID(ctx context.Context, bannerID uuid.UUID) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM demo_slots WHERE demo_banner_id = $1)`
	err := r.db.QueryRowContext(ctx, query, bannerID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check if banner exists in slots: %w", err)
	}
	return exists, nil
}

type demoSlotRepository struct {
	db *sqlx.DB
}

// NewDemoSlotRepository creates a new demo slot repository
func NewDemoSlotRepository(db interface{}) repositories.DemoSlotRepository {
	// Handle both sqlx.DB and *sqlx.DB for compatibility
	var sqlxDB *sqlx.DB
	switch v := db.(type) {
	case *sqlx.DB:
		sqlxDB = v
	case sqlx.Ext:
		sqlxDB = v.(*sqlx.DB)
	default:
		// Try to convert from sql.DB
		if sqlDB, ok := db.(*sql.DB); ok {
			sqlxDB = sqlx.NewDb(sqlDB, "postgres")
		} else {
			panic("demoSlotRepository requires sqlx.DB or sql.DB")
		}
	}
	return &demoSlotRepository{db: sqlxDB}
}

func (r *demoSlotRepository) Create(ctx context.Context, slot *entities.DemoSlot) error {
	query := `
		INSERT INTO demo_slots (id, slot_id, name, format, width, height, demo_banner_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.ExecContext(ctx, query,
		slot.ID, slot.SlotID, slot.Name, slot.Format, slot.Width, slot.Height, slot.DemoBannerID, slot.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create demo slot: %w", err)
	}
	return nil
}

func (r *demoSlotRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.DemoSlot, error) {
	var slot entities.DemoSlot
	var bannerIDStr *string
	query := `SELECT id, slot_id, name, format, width, height, demo_banner_id, created_at FROM demo_slots WHERE id = $1`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&slot.ID, &slot.SlotID, &slot.Name, &slot.Format, &slot.Width, &slot.Height, &bannerIDStr, &slot.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get demo slot: %w", err)
	}

	if bannerIDStr != nil && *bannerIDStr != "" {
		bannerID, err := uuid.Parse(*bannerIDStr)
		if err == nil {
			slot.DemoBannerID = &bannerID
			banner, err := r.getBannerByUUID(ctx, bannerID)
			if err == nil {
				slot.DemoBanner = banner
			}
		}
	}

	return &slot, nil
}

func (r *demoSlotRepository) GetBySlotID(ctx context.Context, slotID string) (*entities.DemoSlot, error) {
	var slot entities.DemoSlot
	var bannerIDStr *string

	query := `
		SELECT s.id, s.slot_id, s.name, s.format, s.width, s.height, s.demo_banner_id, s.created_at
		FROM demo_slots s
		WHERE s.slot_id = $1
	`
	err := r.db.QueryRowContext(ctx, query, slotID).Scan(
		&slot.ID, &slot.SlotID, &slot.Name, &slot.Format, &slot.Width, &slot.Height, &bannerIDStr, &slot.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get demo slot by slot_id: %w", err)
	}

	if bannerIDStr != nil && *bannerIDStr != "" {
		bannerID, err := uuid.Parse(*bannerIDStr)
		if err == nil {
			slot.DemoBannerID = &bannerID
			// Load banner
			banner, err := r.getBannerByUUID(ctx, bannerID)
			if err == nil {
				slot.DemoBanner = banner
			}
		}
	}

	return &slot, nil
}

func (r *demoSlotRepository) getBannerByUUID(ctx context.Context, id uuid.UUID) (*entities.DemoBanner, error) {
	bannerRepo := NewDemoBannerRepository(r.db)
	return bannerRepo.GetByID(ctx, id)
}

func (r *demoSlotRepository) GetAll(ctx context.Context) ([]*entities.DemoSlot, error) {
	query := `
		SELECT s.id, s.slot_id, s.name, s.format, s.width, s.height, s.demo_banner_id, s.created_at
		FROM demo_slots s
		ORDER BY s.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all demo slots: %w", err)
	}
	defer rows.Close()

	var slots []*entities.DemoSlot
	for rows.Next() {
		var slot entities.DemoSlot
		var bannerIDStr *string

		err := rows.Scan(
			&slot.ID, &slot.SlotID, &slot.Name, &slot.Format, &slot.Width, &slot.Height, &bannerIDStr, &slot.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan slot: %w", err)
		}

		if bannerIDStr != nil && *bannerIDStr != "" {
			bannerID, err := uuid.Parse(*bannerIDStr)
			if err == nil {
				slot.DemoBannerID = &bannerID
				banner, err := r.getBannerByUUID(ctx, bannerID)
				if err == nil {
					slot.DemoBanner = banner
				}
			}
		}

		slots = append(slots, &slot)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating slots: %w", err)
	}

	return slots, nil
}

func (r *demoSlotRepository) Update(ctx context.Context, slot *entities.DemoSlot) error {
	query := `
		UPDATE demo_slots
		SET slot_id = $2, name = $3, format = $4, width = $5, height = $6, demo_banner_id = $7
		WHERE id = $1
	`
	_, err := r.db.ExecContext(ctx, query,
		slot.ID, slot.SlotID, slot.Name, slot.Format, slot.Width, slot.Height, slot.DemoBannerID,
	)
	if err != nil {
		return fmt.Errorf("failed to update demo slot: %w", err)
	}
	return nil
}

func (r *demoSlotRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM demo_slots WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete demo slot: %w", err)
	}
	return nil
}

func (r *demoSlotRepository) GetAllActive(ctx context.Context) ([]*entities.DemoSlot, error) {
	query := `
		SELECT s.id, s.slot_id, s.name, s.format, s.width, s.height, s.demo_banner_id, s.created_at
		FROM demo_slots s
		INNER JOIN demo_banners b ON s.demo_banner_id = b.id
		WHERE b.active = true
		ORDER BY s.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to get all active demo slots: %w", err)
	}
	defer rows.Close()

	var slots []*entities.DemoSlot
	for rows.Next() {
		var slot entities.DemoSlot
		var bannerIDStr *string

		err := rows.Scan(
			&slot.ID, &slot.SlotID, &slot.Name, &slot.Format, &slot.Width, &slot.Height, &bannerIDStr, &slot.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan slot: %w", err)
		}

		if bannerIDStr != nil && *bannerIDStr != "" {
			bannerID, err := uuid.Parse(*bannerIDStr)
			if err == nil {
				slot.DemoBannerID = &bannerID
				banner, err := r.getBannerByUUID(ctx, bannerID)
				if err == nil {
					slot.DemoBanner = banner
				}
			}
		}

		slots = append(slots, &slot)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating slots: %w", err)
	}

	return slots, nil
}
