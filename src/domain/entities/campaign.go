package entities

import (
	"time"

	"github.com/shopspring/decimal"
)

// CampaignStatus represents campaign status
type CampaignStatus string

const (
	CampaignStatusPending   CampaignStatus = "pending"
	CampaignStatusActive    CampaignStatus = "active"
	CampaignStatusPaused    CampaignStatus = "paused"
	CampaignStatusCompleted CampaignStatus = "completed"
)

// Campaign represents an advertising campaign
type Campaign struct {
	ID          string
	Name        string
	Status      CampaignStatus
	BudgetTotal decimal.Decimal
	BudgetDaily decimal.Decimal
	StartDate   time.Time
	EndDate     *time.Time
	Targeting   Targeting
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// Targeting represents campaign targeting criteria
type Targeting struct {
	Geo       []string    // Country codes
	Devices   []string    // mobile, desktop, tablet
	OS        []string    // ios, android, windows, macos
	Browsers  []string    // chrome, firefox, safari, edge
	TimeOfDay []TimeRange // Active hours
}

// TimeRange represents a time range
type TimeRange struct {
	Start time.Time // HH:MM format
	End   time.Time // HH:MM format
}

// IsActive checks if campaign is currently active
func (c *Campaign) IsActive() bool {
	now := time.Now()

	if c.Status != CampaignStatusActive {
		return false
	}

	if now.Before(c.StartDate) {
		return false
	}

	if c.EndDate != nil && now.After(*c.EndDate) {
		return false
	}

	return true
}

// IsWithinBudget checks if campaign has remaining budget
func (c *Campaign) IsWithinBudget(spent decimal.Decimal) bool {
	return c.BudgetTotal.Sub(spent).IsPositive()
}
