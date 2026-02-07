package entities

import "time"

// AdvertiserStatus represents advertiser account status
type AdvertiserStatus string

const (
	AdvertiserStatusPending   AdvertiserStatus = "pending"
	AdvertiserStatusActive    AdvertiserStatus = "active"
	AdvertiserStatusSuspended AdvertiserStatus = "suspended"
)

// Advertiser represents an advertiser entity
type Advertiser struct {
	ID           string
	Email        string
	PasswordHash string
	CompanyName  string
	Website      string
	Status       AdvertiserStatus
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// NewAdvertiser creates a new advertiser
func NewAdvertiser(email, passwordHash, companyName, website string) *Advertiser {
	return &Advertiser{
		ID:           generateUUID(),
		Email:        email,
		PasswordHash: passwordHash,
		CompanyName:  companyName,
		Website:      website,
		Status:       AdvertiserStatusPending,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
}

// IsActive checks if advertiser is active
func (a *Advertiser) IsActive() bool {
	return a.Status == AdvertiserStatusActive
}

// Activate activates the advertiser account
func (a *Advertiser) Activate() {
	a.Status = AdvertiserStatusActive
	a.UpdatedAt = time.Now()
}

// Suspend suspends the advertiser account
func (a *Advertiser) Suspend() {
	a.Status = AdvertiserStatusSuspended
	a.UpdatedAt = time.Now()
}
