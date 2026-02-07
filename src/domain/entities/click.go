package entities

import "time"

// Click represents a banner click
type Click struct {
	ID           string
	ImpressionID string
	BannerID     string
	Timestamp    time.Time
	IP           string
	Referer      string
	Country      string
}
