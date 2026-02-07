package auth

import (
	"context"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
	"github.com/fall-out-bug/demo-adserver/src/domain/repositories"
)

// AdvertiserService handles advertiser business logic
type AdvertiserService struct {
	advertiserRepo repositories.AdvertiserRepository
	passwordHasher PasswordHasher
	jwtService     JWTService
}

// NewAdvertiserService creates a new advertiser service
func NewAdvertiserService(
	advertiserRepo repositories.AdvertiserRepository,
	passwordHasher PasswordHasher,
	jwtService JWTService,
) *AdvertiserService {
	return &AdvertiserService{
		advertiserRepo: advertiserRepo,
		passwordHasher: passwordHasher,
		jwtService:     jwtService,
	}
}

// Register registers a new advertiser
func (s *AdvertiserService) Register(ctx context.Context, req *RegisterRequest) (*RegisterResponse, error) {
	// Check if email already exists
	existing, _ := s.advertiserRepo.FindByEmail(ctx, req.Email)
	if existing != nil {
		return nil, ErrEmailAlreadyExists
	}

	// Hash password
	hash, err := s.passwordHasher.Hash(req.Password)
	if err != nil {
		return nil, err
	}

	// Create advertiser
	advertiser := entities.NewAdvertiser(req.Email, hash, req.CompanyName, req.Website)
	if err := s.advertiserRepo.Create(ctx, advertiser); err != nil {
		return nil, err
	}

	// Generate JWT token
	token, err := s.jwtService.Generate(advertiser.ID, "advertiser")
	if err != nil {
		return nil, err
	}

	return &RegisterResponse{
		ID:    advertiser.ID,
		Email: advertiser.Email,
		Token: token,
	}, nil
}

// Login logs in an advertiser
func (s *AdvertiserService) Login(ctx context.Context, req *LoginRequest) (*RegisterResponse, error) {
	advertiser, err := s.advertiserRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		return nil, err
	}
	if advertiser == nil {
		return nil, entities.ErrInvalidCredentials
	}

	// Verify password
	if !s.passwordHasher.Verify(req.Password, advertiser.PasswordHash) {
		return nil, entities.ErrInvalidCredentials
	}

	// Generate JWT token
	token, err := s.jwtService.Generate(advertiser.ID, "advertiser")
	if err != nil {
		return nil, err
	}

	return &RegisterResponse{
		ID:    advertiser.ID,
		Email: advertiser.Email,
		Token: token,
	}, nil
}

// GetByID returns an advertiser by ID
func (s *AdvertiserService) GetByID(ctx context.Context, id string) (*entities.Advertiser, error) {
	advertiser, err := s.advertiserRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if advertiser == nil {
		return nil, entities.ErrUserNotFound
	}
	return advertiser, nil
}
