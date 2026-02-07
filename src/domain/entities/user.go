package entities

// Credentials represents user login credentials
type Credentials struct {
	Email    string
	Password string
}

// Validate validates credentials
func (c *Credentials) Validate() error {
	if c.Email == "" {
		return ErrInvalidEmail
	}
	if c.Password == "" {
		return ErrInvalidPassword
	}
	return nil
}

// RegistrationRequest represents a registration request
type RegistrationRequest struct {
	Email       string
	Password    string
	CompanyName string
	Website     string
}

// Validate validates registration request
func (r *RegistrationRequest) Validate() error {
	if r.Email == "" {
		return ErrInvalidEmail
	}
	if len(r.Password) < 8 {
		return ErrPasswordTooShort
	}
	if r.CompanyName == "" {
		return ErrInvalidCompanyName
	}
	return nil
}

// Domain errors
var (
	ErrInvalidEmail       = &DomainError{Message: "invalid email"}
	ErrInvalidPassword    = &DomainError{Message: "invalid password"}
	ErrPasswordTooShort   = &DomainError{Message: "password must be at least 8 characters"}
	ErrInvalidCompanyName = &DomainError{Message: "invalid company name"}
	ErrUserNotFound       = &DomainError{Message: "user not found"}
	ErrInvalidCredentials = &DomainError{Message: "invalid credentials"}
)

// DomainError represents a domain error
type DomainError struct {
	Message string
}

func (e *DomainError) Error() string {
	return e.Message
}
