package entities

import (
	"time"

	"github.com/google/uuid"
)

// DemoSlot represents a demo ad slot for the demo website
type DemoSlot struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	SlotID       string     `json:"slot_id" db:"slot_id"`       // For Delivery API
	Name         string     `json:"name" db:"name"`
	Format       string     `json:"format" db:"format"`
	Width        int        `json:"width" db:"width"`
	Height       int        `json:"height" db:"height"`
	DemoBannerID *uuid.UUID `json:"demo_banner_id,omitempty" db:"demo_banner_id"`
	DemoBanner   *DemoBanner `json:"demo_banner,omitempty" db:"-"` // Loaded from relation
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
}

// Validate checks if the slot entity is valid
func (s *DemoSlot) Validate() error {
	if s.SlotID == "" {
		return ErrInvalidSlotID
	}
	if s.Name == "" {
		return ErrInvalidName
	}
	if !ValidBannerFormats[s.Format] {
		return ErrInvalidFormat
	}
	if s.Width <= 0 || s.Height <= 0 {
		return ErrInvalidDimensions
	}
	return nil
}

// HasBanner checks if slot has an assigned banner
func (s *DemoSlot) HasBanner() bool {
	return s.DemoBannerID != nil
}

// NewDemoSlot creates a new demo slot with validation
func NewDemoSlot(slotID, name, format string, width, height int, bannerID *uuid.UUID) (*DemoSlot, error) {
	slot := &DemoSlot{
		ID:           uuid.New(),
		SlotID:       slotID,
		Name:         name,
		Format:       format,
		Width:        width,
		Height:       height,
		DemoBannerID: bannerID,
		CreatedAt:    time.Now(),
	}

	if err := slot.Validate(); err != nil {
		return nil, err
	}

	return slot, nil
}
