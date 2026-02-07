package entities_test

import (
	"testing"
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/shopspring/decimal"
)

func TestCampaign_IsActive_StatusActive_ReturnsTrue(t *testing.T) {
	// Arrange
	now := time.Now()
	campaign := &entities.Campaign{
		ID:        "cmp-1",
		Name:      "Test Campaign",
		Status:    entities.CampaignStatusActive,
		StartDate: now.Add(-1 * time.Hour),
		EndDate:   ptrTime(now.Add(24 * time.Hour)),
	}

	// Act
	result := campaign.IsActive()

	// Assert
	if !result {
		t.Errorf("Expected campaign to be active, got false")
	}
}

func TestCampaign_IsActive_StatusPending_ReturnsFalse(t *testing.T) {
	// Arrange
	now := time.Now()
	campaign := &entities.Campaign{
		ID:        "cmp-1",
		Name:      "Test Campaign",
		Status:    entities.CampaignStatusPending,
		StartDate: now.Add(-1 * time.Hour),
		EndDate:   ptrTime(now.Add(24 * time.Hour)),
	}

	// Act
	result := campaign.IsActive()

	// Assert
	if result {
		t.Errorf("Expected pending campaign to be inactive, got true")
	}
}

func TestCampaign_IsActive_StatusPaused_ReturnsFalse(t *testing.T) {
	// Arrange
	now := time.Now()
	campaign := &entities.Campaign{
		ID:        "cmp-1",
		Name:      "Test Campaign",
		Status:    entities.CampaignStatusPaused,
		StartDate: now.Add(-1 * time.Hour),
		EndDate:   ptrTime(now.Add(24 * time.Hour)),
	}

	// Act
	result := campaign.IsActive()

	// Assert
	if result {
		t.Errorf("Expected paused campaign to be inactive, got true")
	}
}

func TestCampaign_IsActive_NotStartedYet_ReturnsFalse(t *testing.T) {
	// Arrange
	now := time.Now()
	campaign := &entities.Campaign{
		ID:        "cmp-1",
		Name:      "Test Campaign",
		Status:    entities.CampaignStatusActive,
		StartDate: now.Add(1 * time.Hour),
		EndDate:   ptrTime(now.Add(24 * time.Hour)),
	}

	// Act
	result := campaign.IsActive()

	// Assert
	if result {
		t.Errorf("Expected future campaign to be inactive, got true")
	}
}

func TestCampaign_IsActive_EndDatePassed_ReturnsFalse(t *testing.T) {
	// Arrange
	now := time.Now()
	campaign := &entities.Campaign{
		ID:        "cmp-1",
		Name:      "Test Campaign",
		Status:    entities.CampaignStatusActive,
		StartDate: now.Add(-2 * time.Hour),
		EndDate:   ptrTime(now.Add(-1 * time.Hour)),
	}

	// Act
	result := campaign.IsActive()

	// Assert
	if result {
		t.Errorf("Expected expired campaign to be inactive, got true")
	}
}

func TestCampaign_IsActive_NoEndDate_Active_ReturnsTrue(t *testing.T) {
	// Arrange
	now := time.Now()
	campaign := &entities.Campaign{
		ID:        "cmp-1",
		Name:      "Test Campaign",
		Status:    entities.CampaignStatusActive,
		StartDate: now.Add(-1 * time.Hour),
		EndDate:   nil,
	}

	// Act
	result := campaign.IsActive()

	// Assert
	if !result {
		t.Errorf("Expected active campaign with no end date to be active, got false")
	}
}

func TestCampaign_IsWithinBudget_HasBudget_ReturnsTrue(t *testing.T) {
	// Arrange
	campaign := &entities.Campaign{
		ID:          "cmp-1",
		Name:        "Test Campaign",
		BudgetTotal: decimal.NewFromInt(1000),
	}
	spent := decimal.NewFromInt(500)

	// Act
	result := campaign.IsWithinBudget(spent)

	// Assert
	if !result {
		t.Errorf("Expected campaign with remaining budget to be within budget, got false")
	}
}

func TestCampaign_IsWithinBudget_ExhaustedBudget_ReturnsFalse(t *testing.T) {
	// Arrange
	campaign := &entities.Campaign{
		ID:          "cmp-1",
		Name:        "Test Campaign",
		BudgetTotal: decimal.NewFromInt(1000),
	}
	spent := decimal.NewFromInt(1000)

	// Act
	result := campaign.IsWithinBudget(spent)

	// Assert
	if result {
		t.Errorf("Expected campaign with exhausted budget to be over budget, got true")
	}
}

func TestCampaign_IsWithinBudget_ZeroSpent_ReturnsTrue(t *testing.T) {
	// Arrange
	campaign := &entities.Campaign{
		ID:          "cmp-1",
		Name:        "Test Campaign",
		BudgetTotal: decimal.NewFromInt(1000),
	}
	spent := decimal.NewFromInt(0)

	// Act
	result := campaign.IsWithinBudget(spent)

	// Assert
	if !result {
		t.Errorf("Expected campaign with zero spent to be within budget, got false")
	}
}

func TestBanner_IsActive_StatusActive_ReturnsTrue(t *testing.T) {
	// Arrange
	banner := &entities.Banner{
		ID:     "ban-1",
		Name:   "Test Banner",
		Status: entities.BannerStatusActive,
	}

	// Act
	result := banner.IsActive()

	// Assert
	if !result {
		t.Errorf("Expected active banner to be active, got false")
	}
}

func TestBanner_IsActive_StatusPending_ReturnsFalse(t *testing.T) {
	// Arrange
	banner := &entities.Banner{
		ID:     "ban-1",
		Name:   "Test Banner",
		Status: entities.BannerStatusPending,
	}

	// Act
	result := banner.IsActive()

	// Assert
	if result {
		t.Errorf("Expected pending banner to be inactive, got true")
	}
}

func TestBanner_IsActive_StatusRejected_ReturnsFalse(t *testing.T) {
	// Arrange
	banner := &entities.Banner{
		ID:     "ban-1",
		Name:   "Test Banner",
		Status: entities.BannerStatusRejected,
	}

	// Act
	result := banner.IsActive()

	// Assert
	if result {
		t.Errorf("Expected rejected banner to be inactive, got true")
	}
}

func TestNewImpression_ValidInput_ReturnsImpression(t *testing.T) {
	// Arrange
	bannerID := "ban-1"
	slotID := "slot-1"
	campaignID := "cmp-1"

	// Act
	impression := entities.NewImpression(bannerID, slotID, campaignID)

	// Assert
	if impression == nil {
		t.Fatalf("Expected impression to be created, got nil")
	}
	if impression.BannerID != bannerID {
		t.Errorf("Expected BannerID %s, got %s", bannerID, impression.BannerID)
	}
	if impression.SlotID != slotID {
		t.Errorf("Expected SlotID %s, got %s", slotID, impression.SlotID)
	}
	if impression.CampaignID != campaignID {
		t.Errorf("Expected CampaignID %s, got %s", campaignID, impression.CampaignID)
	}
	if impression.ID == "" {
		t.Errorf("Expected ID to be generated, got empty string")
	}
}

// Helper function
func ptrTime(t time.Time) *time.Time {
	return &t
}
