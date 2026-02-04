# Auth Module

## Overview

The Auth module handles all authentication and authorization functionality for the GadaiTop API. It provides secure user authentication, JWT token management, password reset, email verification, and device registration for enhanced security.

## Features

- **User Authentication**: Email/password login with JWT tokens
- **Customer Authentication**: NIK/PIN or email/password login for customers
- **User Registration**: New user account creation
- **Password Management**: Forgot password and reset password flows
- **Email Verification**: Email verification with tokens
- **Device Registration**: Automatic IP address registration for security
- **Account Locking**: Automatic account locking after failed login attempts
- **Session Management**: Token-based session management

## Architecture

### Controller

**File**: `auth.controller.ts`

The AuthController exposes the following endpoints:

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/v1/auth/login` | POST | User login | No |
| `/v1/auth/customer/login` | POST | Customer login | No |
| `/v1/auth/register` | POST | User registration | No |
| `/v1/auth/me` | GET | Get current user | Yes |
| `/v1/auth/logout` | POST | Logout user | Yes |
| `/v1/auth/forgot-password` | POST | Request password reset | No |
| `/v1/auth/reset-password` | POST | Reset password | No |
| `/v1/auth/verify-email` | POST | Verify email | No |

### Service

**File**: `auth.service.ts`

The AuthService provides the following key methods:

#### `createAccessToken(user: UserDto): Promise<TokenPayloadDto>`

Creates a JWT access token for the authenticated user.

**Parameters**:
- `user`: User data transfer object

**Returns**: Token payload with access token and expiration time

#### `validateUser(userLoginDto: UserLoginDto, ipAddress?: string): Promise<UserDto>`

Validates user credentials and handles login logic.

**Features**:
- Password validation
- Account status checking (active, inactive, suspended)
- Account locking after failed attempts
- IP address verification and device registration
- Failed login attempt tracking

**Parameters**:
- `userLoginDto`: Login credentials (email, password)
- `ipAddress`: Optional IP address for device verification

**Returns**: Validated user data

**Throws**:
- `UnauthorizedException`: Invalid credentials or locked account
- `NotAcceptableException`: Inactive account
- `ForbiddenException`: Suspended account or no roles assigned

#### `validateCustomer(options): Promise<CustomerEntity>`

Validates customer credentials for customer login.

**Parameters**:
- `loginType`: Login type (NIK/PIN or email/password)
- `nik`: National ID number (for NIK login)
- `pin`: PIN code (for NIK login)
- `email`: Email address (for email login)
- `password`: Password (for email login)

**Returns**: Validated customer entity

#### `forgotPassword(options: { email: string }): Promise<string>`

Generates a password reset token and sends reset email.

**Parameters**:
- `email`: User email address

**Returns**: Success message

#### `resetPassword(options: { token: string; newPassword: string }): Promise<void>`

Resets user password using reset token.

**Parameters**:
- `token`: Password reset token
- `newPassword`: New password

## Security Features

### Account Locking

The system automatically locks user accounts after failed login attempts:

- **Max Failed Attempts**: 5
- **Lock Duration**: 30 minutes
- **Reset**: Failed attempts reset on successful login

### Device Registration

The system supports IP address-based device registration:

1. **First Login**: IP address is automatically registered
2. **Subsequent Logins**: IP address is verified against registered devices
3. **New Device**: Automatically registers new IP addresses
4. **No IP**: Blocks login if user has registered devices but no IP provided

### Password Security

- Passwords are hashed using bcrypt
- Password reset tokens expire after 3 hours
- Email verification tokens for account activation

## Data Transfer Objects (DTOs)

### UserLoginDto

```typescript
{
  email: string;
  password: string;
  macAddress?: string; // Optional for device verification
}
```

### UserRegisterDto

```typescript
{
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  companyId?: string;
  branchId?: string;
}
```

### CustomerLoginDto

```typescript
{
  loginType: 'nik' | 'email';
  nik?: string;
  pin?: string;
  email?: string;
  password?: string;
}
```

### LoginPayloadDto

```typescript
{
  user: UserDto;
  token: TokenPayloadDto;
}
```

### TokenPayloadDto

```typescript
{
  expiresIn: number;
  accessToken: string;
}
```

## JWT Strategy

**File**: `jwt.strategy.ts`

The JWT strategy validates JWT tokens and extracts user information:

- Validates token signature
- Checks token expiration
- Extracts user ID and roles
- Loads user data from database

## Public Strategy

**File**: `public.strategy.ts`

The public strategy allows unauthenticated access to public endpoints.

## Usage Examples

### User Login

```typescript
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe"
    },
    "token": {
      "accessToken": "jwt-token",
      "expiresIn": 3600
    }
  }
}
```

### Get Current User

```typescript
GET /v1/auth/me
Authorization: Bearer <jwt-token>

Response:
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "roles": ["admin"],
    "company": { ... },
    "branch": { ... }
  }
}
```

### Forgot Password

```typescript
POST /v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "data": "Password reset email sent"
}
```

### Reset Password

```typescript
POST /v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newPassword123"
}

Response:
{
  "data": true
}
```

## Dependencies

- `@nestjs/jwt`: JWT token generation and validation
- `@nestjs/passport`: Passport integration
- `passport-jwt`: JWT passport strategy
- `bcrypt`: Password hashing
- `uuid`: Token generation

## Related Modules

- **User Module**: User management and CRUD operations
- **Role Module**: Role-based access control
- **Device Module**: Device registration and verification
- **Audit Module**: Login/logout audit logging

## Error Handling

The module handles the following error scenarios:

| Error | Status Code | Description |
|-------|-------------|-------------|
| Invalid credentials | 400 | Wrong email or password |
| Account locked | 401 | Too many failed login attempts |
| Inactive account | 406 | Account is inactive |
| Suspended account | 403 | Account is suspended |
| No roles assigned | 403 | User has no roles |
| Invalid reset token | 400 | Password reset token invalid or expired |
| Device not registered | 401 | IP address not registered |

## Configuration

The module uses the following configuration:

```typescript
{
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationTime: process.env.JWT_EXPIRATION_TIME || 3600,
  maxFailedAttempts: 5,
  lockDurationMinutes: 30,
  resetTokenExpirationHours: 3
}
```

## Testing

Example test cases:

```typescript
describe('AuthService', () => {
  it('should validate user with correct credentials', async () => {
    // Test successful login
  });

  it('should lock account after max failed attempts', async () => {
    // Test account locking
  });

  it('should register device on first login', async () => {
    // Test device registration
  });

  it('should generate password reset token', async () => {
    // Test forgot password
  });
});
```

## Best Practices

1. **Always use HTTPS** in production to protect JWT tokens
2. **Store tokens securely** on the client side (httpOnly cookies recommended)
3. **Implement token refresh** for better security
4. **Monitor failed login attempts** for security threats
5. **Use strong password policies** for user accounts
6. **Implement rate limiting** on auth endpoints
7. **Log all authentication events** for audit trail

## Future Enhancements

- [ ] Refresh token implementation
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 integration (Google, Facebook)
- [ ] Biometric authentication support
- [ ] Session management dashboard
- [ ] Advanced device fingerprinting
