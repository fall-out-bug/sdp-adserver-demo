package entities

import (
	"testing"

	"github.com/google/uuid"
)

func TestDemoBanner_IsValidFormat(t *testing.T) {
	tests := []struct {
		name   string
		format string
		want   bool
	}{
		{"valid leaderboard", "leaderboard", true},
		{"valid medium rectangle", "medium-rectangle", true},
		{"valid skyscraper", "skyscraper", true},
		{"valid half page", "half-page", true},
		{"valid native in feed", "native-in-feed", true},
		{"invalid format", "invalid-format", false},
		{"empty format", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			b := &DemoBanner{Format: tt.format}
			if got := b.IsValidFormat(); got != tt.want {
				t.Errorf("DemoBanner.IsValidFormat() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestDemoBanner_HasContent(t *testing.T) {
	tests := []struct {
		name     string
		html     string
		imageURL string
		want     bool
	}{
		{"has html", "<div>content</div>", "", true},
		{"has image", "", "http://example.com/image.png", true},
		{"has both", "<div>content</div>", "http://example.com/image.png", true},
		{"has neither", "", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			b := &DemoBanner{HTML: tt.html, ImageURL: tt.imageURL}
			if got := b.HasContent(); got != tt.want {
				t.Errorf("DemoBanner.HasContent() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestNewDemoBanner(t *testing.T) {
	tests := []struct {
		name        string
		bannerName  string
		format      string
		width       int
		height      int
		html        string
		imageURL    string
		clickURL    string
		wantErr     error
		description string
	}{
		{
			name:        "valid leaderboard",
			bannerName:  "Test Banner",
			format:      "leaderboard",
			width:       728,
			height:      90,
			html:        "<div>Test</div>",
			imageURL:    "",
			clickURL:    "http://example.com",
			wantErr:     nil,
			description: "should create valid leaderboard banner",
		},
		{
			name:        "valid medium rectangle with image",
			bannerName:  "Image Banner",
			format:      "medium-rectangle",
			width:       300,
			height:      250,
			html:        "",
			imageURL:    "http://example.com/image.png",
			clickURL:    "",
			wantErr:     nil,
			description: "should create valid image banner",
		},
		{
			name:        "empty name",
			bannerName:  "",
			format:      "leaderboard",
			width:       728,
			height:      90,
			html:        "<div>Test</div>",
			imageURL:    "",
			clickURL:    "",
			wantErr:     ErrInvalidName,
			description: "should fail with empty name",
		},
		{
			name:        "invalid format",
			bannerName:  "Test",
			format:      "invalid",
			width:       728,
			height:      90,
			html:        "<div>Test</div>",
			imageURL:    "",
			clickURL:    "",
			wantErr:     ErrInvalidFormat,
			description: "should fail with invalid format",
		},
		{
			name:        "no content",
			bannerName:  "Test",
			format:      "leaderboard",
			width:       728,
			height:      90,
			html:        "",
			imageURL:    "",
			clickURL:    "",
			wantErr:     ErrInvalidContent,
			description: "should fail with no content",
		},
		{
			name:        "invalid dimensions",
			bannerName:  "Test",
			format:      "leaderboard",
			width:       -1,
			height:      90,
			html:        "<div>Test</div>",
			imageURL:    "",
			clickURL:    "",
			wantErr:     ErrInvalidDimensions,
			description: "should fail with invalid dimensions",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := NewDemoBanner(tt.bannerName, tt.format, tt.width, tt.height, tt.html, tt.imageURL, tt.clickURL)
			if err != tt.wantErr {
				t.Errorf("%s: NewDemoBanner() error = %v, wantErr %v", tt.description, err, tt.wantErr)
				return
			}
			if err == nil {
				if got.Name != tt.bannerName {
					t.Errorf("NewDemoBanner() Name = %v, want %v", got.Name, tt.bannerName)
				}
				if got.Format != tt.format {
					t.Errorf("NewDemoBanner() Format = %v, want %v", got.Format, tt.format)
				}
				if got.Width != tt.width {
					t.Errorf("NewDemoBanner() Width = %v, want %v", got.Width, tt.width)
				}
				if got.Height != tt.height {
					t.Errorf("NewDemoBanner() Height = %v, want %v", got.Height, tt.height)
				}
				if !got.Active {
					t.Errorf("NewDemoBanner() Active = %v, want true", got.Active)
				}
				if got.ID == (uuid.UUID{}) {
					t.Errorf("NewDemoBanner() ID should not be empty")
				}
			}
		})
	}
}

func TestDemoSlot_Validate(t *testing.T) {
	tests := []struct {
		name        string
		slotID      string
		slotName    string
		format      string
		width       int
		height      int
		wantErr     error
		description string
	}{
		{
			name:        "valid slot",
			slotID:      "demo-leaderboard",
			slotName:    "Demo Leaderboard",
			format:      "leaderboard",
			width:       728,
			height:      90,
			wantErr:     nil,
			description: "should validate correct slot",
		},
		{
			name:        "empty slot id",
			slotID:      "",
			slotName:    "Test",
			format:      "leaderboard",
			width:       728,
			height:      90,
			wantErr:     ErrInvalidSlotID,
			description: "should fail with empty slot ID",
		},
		{
			name:        "empty name",
			slotID:      "test-slot",
			slotName:    "",
			format:      "leaderboard",
			width:       728,
			height:      90,
			wantErr:     ErrInvalidName,
			description: "should fail with empty name",
		},
		{
			name:        "invalid format",
			slotID:      "test-slot",
			slotName:    "Test",
			format:      "invalid",
			width:       728,
			height:      90,
			wantErr:     ErrInvalidFormat,
			description: "should fail with invalid format",
		},
		{
			name:        "invalid dimensions",
			slotID:      "test-slot",
			slotName:    "Test",
			format:      "leaderboard",
			width:       0,
			height:      90,
			wantErr:     ErrInvalidDimensions,
			description: "should fail with zero dimensions",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &DemoSlot{
				SlotID: tt.slotID,
				Name:   tt.slotName,
				Format: tt.format,
				Width:  tt.width,
				Height: tt.height,
			}
			if err := s.Validate(); err != tt.wantErr {
				t.Errorf("%s: DemoSlot.Validate() error = %v, wantErr %v", tt.description, err, tt.wantErr)
			}
		})
	}
}

func TestDemoSlot_HasBanner(t *testing.T) {
	tests := []struct {
		name   string
		bannerID *uuid.UUID
		want   bool
	}{
		{
			name: "has banner",
			bannerID: func() *uuid.UUID { id := uuid.New(); return &id }(),
			want: true,
		},
		{
			name: "no banner",
			bannerID: nil,
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &DemoSlot{DemoBannerID: tt.bannerID}
			if got := s.HasBanner(); got != tt.want {
				t.Errorf("DemoSlot.HasBanner() = %v, want %v", got, tt.want)
			}
		})
	}
}
