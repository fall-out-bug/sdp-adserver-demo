package entities

import "time"

// PublisherStatus represents publisher account status
type PublisherStatus string

const (
	PublisherStatusPending   PublisherStatus = "pending"
	PublisherStatusActive    PublisherStatus = "active"
	PublisherStatusSuspended PublisherStatus = "suspended"
)

// Publisher represents a publisher entity
type Publisher struct {
	ID           string
	Email        string
	PasswordHash string
	CompanyName  string
	Website      string
	Status       PublisherStatus
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// NewPublisher creates a new publisher
func NewPublisher(email, passwordHash, companyName, website string) *Publisher {
	return &Publisher{
		ID:           generateUUID(),
		Email:        email,
		PasswordHash: passwordHash,
		CompanyName:  companyName,
		Website:      website,
		Status:       PublisherStatusPending,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
}

// IsActive checks if publisher is active
func (p *Publisher) IsActive() bool {
	return p.Status == PublisherStatusActive
}

// Activate activates the publisher account
func (p *Publisher) Activate() {
	p.Status = PublisherStatusActive
	p.UpdatedAt = time.Now()
}

// Suspend suspends the publisher account
func (p *Publisher) Suspend() {
	p.Status = PublisherStatusSuspended
	p.UpdatedAt = time.Now()
}
