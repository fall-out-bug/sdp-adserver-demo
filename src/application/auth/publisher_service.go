package auth

import (
	"context"
	"errors"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

// PublisherService handles publisher business logic
type PublisherService struct {
	publisherRepo  repositories.PublisherRepository
	passwordHasher PasswordHasher
	jwtService     JWTService
}

// NewPublisherService creates a new publisher service
func NewPublisherService(
	publisherRepo repositories.PublisherRepository,
	passwordHasher PasswordHasher,
	jwtService JWTService,
) *PublisherService {
	return &PublisherService{
		publisherRepo:  publisherRepo,
		passwordHasher: passwordHasher,
		jwtService:     jwtService,
	}
}

// RegisterRequest represents a publisher registration request
type RegisterRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8"`
	CompanyName string `json:"company_name" form:"company_name" binding:"required"`
	Website     string `json:"website" form:"website" binding:"omitempty,url"`
}

// RegisterResponse represents a registration response
type RegisterResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Token string `json:"token"`
}

// Register registers a new publisher
func (s *PublisherService) Register(ctx context.Context, req *RegisterRequest) (*RegisterResponse, error) {
	// Check if email already exists
	existing, _ := s.publisherRepo.FindByEmail(ctx, req.Email)
	if existing != nil {
		return nil, ErrEmailAlreadyExists
	}

	// Hash password
	hash, err := s.passwordHasher.Hash(req.Password)
	if err != nil {
		return nil, err
	}

	// Create publisher
	publisher := entities.NewPublisher(req.Email, hash, req.CompanyName, req.Website)
	if err := s.publisherRepo.Create(ctx, publisher); err != nil {
		return nil, err
	}

	// Generate JWT token
	token, err := s.jwtService.Generate(publisher.ID, "publisher")
	if err != nil {
		return nil, err
	}

	return &RegisterResponse{
		ID:    publisher.ID,
		Email: publisher.Email,
		Token: token,
	}, nil
}

// LoginRequest represents a login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Login logs in a publisher
func (s *PublisherService) Login(ctx context.Context, req *LoginRequest) (*RegisterResponse, error) {
	publisher, err := s.publisherRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if publisher == nil {
		return nil, entities.ErrInvalidCredentials
	}

	// Verify password
	if !s.passwordHasher.Verify(req.Password, publisher.PasswordHash) {
		return nil, entities.ErrInvalidCredentials
	}

	// Generate JWT token
	token, err := s.jwtService.Generate(publisher.ID, "publisher")
	if err != nil {
		return nil, err
	}

	return &RegisterResponse{
		ID:    publisher.ID,
		Email: publisher.Email,
		Token: token,
	}, nil
}

// GetByID returns a publisher by ID
func (s *PublisherService) GetByID(ctx context.Context, id string) (*entities.Publisher, error) {
	publisher, err := s.publisherRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if publisher == nil {
		return nil, entities.ErrUserNotFound
	}
	return publisher, nil
}

var ErrEmailAlreadyExists = errors.New("email already exists")
