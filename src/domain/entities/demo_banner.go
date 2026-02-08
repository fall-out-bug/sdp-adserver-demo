package entities

import (
	"time"

	"github.com/google/uuid"
)

// DemoBanner represents a demo banner for the demo website
type DemoBanner struct {
	ID        uuid.UUID `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Format    string    `json:"format" db:"format"` // leaderboard, medium-rectangle, skyscraper, etc
	HTML      string    `json:"html,omitempty" db:"html"`
	ImageURL  string    `json:"image_url,omitempty" db:"image_url"`
	Width     int       `json:"width" db:"width"`
	Height    int       `json:"height" db:"height"`
	ClickURL  string    `json:"click_url,omitempty" db:"click_url"`
	Active    bool      `json:"active" db:"active"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// ValidBannerFormats defines supported banner formats
var ValidBannerFormats = map[string]bool{
	"leaderboard":       true,
	"medium-rectangle":  true,
	"skyscraper":        true,
	"half-page":         true,
	"native-in-feed":    true,
	"native-sponsored":  true,
}

// IsValidFormat checks if the format is valid
func (b *DemoBanner) IsValidFormat() bool {
	return ValidBannerFormats[b.Format]
}

// HasContent checks if banner has either HTML or image
func (b *DemoBanner) HasContent() bool {
	return b.HTML != "" || b.ImageURL != ""
}

// Validate checks if the banner entity is valid
func (b *DemoBanner) Validate() error {
	if b.Name == "" {
		return ErrInvalidName
	}
	if !b.IsValidFormat() {
		return ErrInvalidFormat
	}
	if !b.HasContent() {
		return ErrInvalidContent
	}
	if b.Width <= 0 || b.Height <= 0 {
		return ErrInvalidDimensions
	}
	return nil
}

// NewDemoBanner creates a new demo banner with validation
func NewDemoBanner(name, format string, width, height int, html, imageURL, clickURL string) (*DemoBanner, error) {
	banner := &DemoBanner{
		ID:        uuid.New(),
		Name:      name,
		Format:    format,
		HTML:      html,
		ImageURL:  imageURL,
		Width:     width,
		Height:    height,
		ClickURL:  clickURL,
		Active:    true,
		CreatedAt: time.Now(),
	}

	if err := banner.Validate(); err != nil {
		return nil, err
	}

	return banner, nil
}
