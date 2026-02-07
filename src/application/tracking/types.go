package tracking

// TrackRequest represents impression tracking request
type TrackRequest struct {
	ImpressionID string
	SlotID       string
	BannerID     string
	CampaignID   string
	IP           string
	UserAgent    string
	Referer      string
	Country      string
	Device       string
}

// TrackResponse represents tracking response
type TrackResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

// ClickResponse represents click tracking response
type ClickResponse struct {
	RedirectURL string `json:"redirect_url"`
	Success     bool   `json:"success"`
	Message     string `json:"message,omitempty"`
}
