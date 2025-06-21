# Architecture Decision: Passwordless Authentication

**Date**: June 13, 2025  
**Status**: Planned  
**Decision**: Implement passwordless authentication using WhatsApp OTP and Email magic links.

## Context

Traditional password-based authentication has several issues:
- Users forget passwords
- Password reuse is common
- Support burden for resets
- Poor UX on mobile devices

In El Salvador context:
- 95% WhatsApp penetration
- SMS is expensive (~$0.10/message)
- Email usage limited to formal business

## Decision

Implement dual passwordless authentication:

### WhatsApp OTP
- Primary method for most users
- 6-digit OTP valid for 5 minutes
- Uses Meta WhatsApp Business API
- Cost: ~$0.04 per authentication

### Email Magic Links
- Secondary method
- 15-minute expiration
- One-time use tokens
- Near-zero cost

## Implementation Strategy

### Phase 1: BSP Integration (Year 1)
Use 360dialog as Business Solution Provider:
- Quick setup (1-2 hours)
- ~$20/month + usage
- Handles infrastructure
- Professional support

### Phase 2: Direct Meta (Year 2+)
When volume > 50k messages/month:
- Direct Meta integration
- No per-message markup
- Full control

## Cost Projections

### Year 1 (1,000 users)
- WhatsApp: 70% (700 users) = ~$912/year
- Email: 30% (300 users) = $0 (free tier)
- **Total: ~$912**

### Year 2 (5,000 users)
- WhatsApp: 80% (4,000 users) = ~$4,080/year
- Email: 20% (1,000 users) = $240/year
- **Total: ~$4,320**

### Year 3 (15,000 users)
- WhatsApp: 85% (12,750 users) = ~$12,480/year
- Email: 15% (2,250 users) = $240/year
- **Total: ~$12,720**

## Technical Implementation

### Backend Service
```go
type AuthService struct {
    whatsapp WhatsAppProvider
    email    EmailProvider
    redis    *redis.Client
}

func (s *AuthService) SendOTP(identifier string) error {
    if isPhoneNumber(identifier) {
        code := generateOTP()
        s.redis.SetEX(ctx, "otp:"+identifier, code, 5*time.Minute)
        return s.whatsapp.SendOTP(identifier, code)
    }
    return s.email.SendMagicLink(identifier)
}
```

### Security Measures
- Rate limiting: 3 attempts per hour
- OTP: 6 digits, 5 minute expiry
- Magic links: Signed JWT, 15 minute expiry
- Session tokens: 30 day expiry

## Benefits

1. **Better UX**: No passwords to remember
2. **Higher Security**: No password reuse
3. **Cultural Fit**: WhatsApp is ubiquitous
4. **Cost Effective**: Cheaper than SMS
5. **Support Reduction**: No password resets

## Trade-offs

### Pros
- Improved security
- Better user experience
- Reduced support burden
- Fits local market

### Cons
- Dependency on WhatsApp
- Cost per authentication
- Requires phone/email access
- No offline authentication

This approach aligns perfectly with El Salvador's digital habits while providing modern security.