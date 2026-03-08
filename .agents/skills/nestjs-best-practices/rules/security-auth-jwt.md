---
title: Implement Secure JWT Authentication
impact: CRITICAL
impactDescription: Essential for secure APIs
tags: security, jwt, authentication, tokens
---

## Implement Secure JWT Authentication

Use `@nestjs/jwt` with `@nestjs/passport` for authentication. Load JWT config from environment via a dedicated config service (e.g. `ApiConfigService`); prefer RS256 (public/private key) in production. Use a JWT strategy that validates the token and loads the user (or customer) so the request gets a full identity. Support public routes via a separate strategy or guard option. Never put secrets or sensitive data in the JWT payload.

**Incorrect (insecure JWT implementation):**

```typescript
// Hardcode secrets
@Module({
  imports: [
    JwtModule.register({
      secret: 'my-secret-key', // Exposed in code
      signOptions: { expiresIn: '7d' }, // Too long
    }),
  ],
})
export class AuthModule {}

// Store sensitive data in JWT
async login(user: User): Promise<{ accessToken: string }> {
  const payload = {
    sub: user.id,
    email: user.email,
    password: user.password, // NEVER include password!
    ssn: user.ssn, // NEVER include sensitive data!
    isAdmin: user.isAdmin, // Can be tampered if not verified
  };
  return { accessToken: this.jwtService.sign(payload) };
}

// Skip token validation
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'my-secret',
    });
  }

  async validate(payload: any): Promise<any> {
    return payload; // No validation of user existence
  }
}
```

**Correct (config-driven JWT, optional RS256, strategy loads user — align with apps/api):**

```typescript
// Config from ApiConfigService (or ConfigService): JWT keys, expiration
// Use JWT_PRIVATE_KEY / JWT_PUBLIC_KEY for RS256 in production

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ApiConfigService,  // or ConfigService
    private usersService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.authConfig.publicKey,  // RS256
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<LogedUserDto> {
    // Support both access token (userId, rolesIds) and customer token (customerId)
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { ...user, roles: ... };  // Return minimal DTO for request.user
  }
}

// Public routes: use a PublicStrategy or guard that skips JWT when route is marked public
```

**Single decorator for auth + permissions + interceptor:** Use an `@Auth()` decorator that applies the JWT guard, permission guard (e.g. CASL), and auth-user interceptor, and accepts `{ public: true }` for public routes.

Reference: [NestJS Authentication](https://docs.nestjs.com/security/authentication)
