package entities

import "time"

// Impression represents a banner impression
type Impression struct {
	ID         string
	BannerID   string
	SlotID     string
	CampaignID string
	Timestamp  time.Time
	IP         string
	UserAgent  string
	Referer    string
	Country    string
	Device     string
	FraudScore float64
}

// NewImpression creates a new impression
func NewImpression(bannerID, slotID, campaignID string) *Impression {
	return &Impression{
		ID:         generateImpressionID(),
		BannerID:   bannerID,
		SlotID:     slotID,
		CampaignID: campaignID,
		Timestamp:  time.Now(),
	}
}

func generateImpressionID() string {
	return generateUUID()
}
