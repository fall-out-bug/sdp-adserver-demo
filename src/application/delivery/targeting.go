package delivery

import (
	"time"

	"github.com/fall-out-bug/demo-adserver/src/domain/entities"
)

// matchesTargeting checks if request matches campaign targeting
func (s *Service) matchesTargeting(t entities.Targeting, req *DeliveryRequest) bool {
	// Geo targeting
	if len(t.Geo) > 0 && !s.contains(t.Geo, req.Country) {
		return false
	}

	// Device targeting
	if len(t.Devices) > 0 && !s.contains(t.Devices, req.Device) {
		return false
	}

	// OS targeting
	if len(t.OS) > 0 && !s.contains(t.OS, req.OS) {
		return false
	}

	// Time targeting (simplified - check if current time is within any range)
	if len(t.TimeOfDay) > 0 && !s.matchesTime(t.TimeOfDay, req.Timestamp) {
		return false
	}

	return true
}

// contains checks if slice contains string
func (s *Service) contains(slice []string, item string) bool {
	for _, str := range slice {
		if str == item {
			return true
		}
	}
	return false
}

// matchesTime checks if current time matches any time range
func (s *Service) matchesTime(ranges []entities.TimeRange, timestamp time.Time) bool {
	hour := timestamp.Hour()
	minute := timestamp.Minute()
	current := hour*60 + minute

	for _, r := range ranges {
		start := r.Start.Hour()*60 + r.Start.Minute()
		end := r.End.Hour()*60 + r.End.Minute()
		if current >= start && current <= end {
			return true
		}
	}
	return false
}
