package entities

import "time"

// BannerSize represents banner dimensions
type BannerSize string

const (
	BannerSize300x250    BannerSize = "300x250"
	BannerSize728x90     BannerSize = "728x90"
	BannerSize160x600    BannerSize = "160x600"
	BannerSizeResponsive BannerSize = "responsive"
)

// BannerStatus represents banner status
type BannerStatus string

const (
	BannerStatusPending  BannerStatus = "pending"
	BannerStatusActive   BannerStatus = "active"
	BannerStatusPaused   BannerStatus = "paused"
	BannerStatusRejected BannerStatus = "rejected"
)

// Banner represents an advertising banner
type Banner struct {
	ID         string
	CampaignID string
	Name       string
	Status     BannerStatus
	Size       BannerSize
	HTML       string // Banner HTML code
	ClickURL   string // Target URL
	Weight     int    // Rotation weight (default: 1)
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// IsActive checks if banner is active
func (b *Banner) IsActive() bool {
	return b.Status == BannerStatusActive
}
