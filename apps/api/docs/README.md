# GadaiTop API Documentation

## Overview

GadaiTop is a comprehensive pawn shop management system API built with NestJS, TypeScript, and PostgreSQL. The system provides complete functionality for managing pawn transactions, inventory, customers, branches, and financial operations.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture](#architecture)
3. [Modules](#modules)
4. [API Reference](#api-reference)
5. [Authentication & Authorization](#authentication--authorization)
6. [Database Schema](#database-schema)

## Getting Started

### Prerequisites

- Node.js >= 16.x
- PostgreSQL >= 13.x
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Base URL

- Development: `http://localhost:8080`
- Production: Configure via `BASE_URL` environment variable

## Architecture

### Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI (via Postman Collection)

### Project Structure

```
apps/api/
├── src/
│   ├── modules/          # Feature modules
│   ├── common/           # Shared utilities
│   ├── constants/        # Application constants
│   ├── database/         # Database configuration
│   ├── decorators/       # Custom decorators
│   ├── guards/           # Authentication & authorization guards
│   ├── interceptors/     # Request/response interceptors
│   ├── interfaces/       # TypeScript interfaces
│   ├── providers/        # Custom providers
│   ├── seeders/          # Database seeders
│   ├── shared/           # Shared modules
│   └── types/            # Type definitions
├── test/                 # Test files
└── docs/                 # Documentation
```

## Modules

The API is organized into the following feature modules:

### Core Modules

1. **[Auth](./modules/auth.md)** - Authentication and authorization
2. **[User](./modules/user.md)** - User management
3. **[Role](./modules/role.md)** - Role-based access control
4. **[Company](./modules/company.md)** - Company/organization management
5. **[Branch](./modules/branch.md)** - Branch management

### Business Modules

6. **[Customer](./modules/customer.md)** - Customer management
7. **[SPK](./modules/spk.md)** - Surat Perjanjian Kredit (Pawn Agreement)
8. **[NKB](./modules/nkb.md)** - Nota Kredit Barang (Item Credit Note)
9. **[Pawn Term](./modules/pawn-term.md)** - Pawn term management
10. **[Auction](./modules/auction.md)** - Auction management
11. **[Catalog](./modules/catalog.md)** - Product catalog

### Financial Modules

12. **[Cash Deposit](./modules/cash-deposit.md)** - Cash deposit management
13. **[Cash Mutation](./modules/cash-mutation.md)** - Cash flow tracking
14. **[Capital Topup](./modules/capital-topup.md)** - Capital top-up management

### Inventory Modules

15. **[Item Type](./modules/item-type.md)** - Item type master data
16. **[Stock Opname](./modules/stock-opname.md)** - Stock taking/inventory count

### System Modules

17. **[Audit](./modules/audit.md)** - Audit logging
18. **[Device](./modules/device.md)** - Device registration (MAC address locking)
19. **[Notification](./modules/notification.md)** - Notification system
20. **[Borrow Request](./modules/borrow-request.md)** - Branch borrowing (Pinjam PT)
21. **[Report](./modules/report.md)** - Reporting functionality
22. **[Dashboard](./modules/dashboard.md)** - Dashboard analytics
23. **[Upload](./modules/upload.md)** - File upload management
24. **[Scheduler](./modules/scheduler.md)** - Scheduled tasks
25. **[Health Checker](./modules/health-checker.md)** - Health monitoring

## API Reference

See [API Reference](./API_REFERENCE.md) for complete endpoint documentation.

### API Versioning

All endpoints are versioned under `/v1/`:

```
/v1/auth/*
/v1/users/*
/v1/companies/*
...
```

### Standard Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-02-03T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": []
  },
  "timestamp": "2024-02-03T10:30:00Z"
}
```

## Authentication & Authorization

### Authentication Flow

1. **Register** or **Login** to obtain JWT access token
2. Include token in `Authorization` header: `Bearer <token>`
3. Token expires after configured duration
4. Refresh token or re-authenticate when expired

### Role-Based Access Control (RBAC)

The system implements role-based access control with the following features:

- **Roles**: Define user roles (Admin, Manager, Cashier, etc.)
- **Permissions**: Granular permissions per resource
- **Guards**: Protect routes based on roles and permissions

### Device Registration

The system supports MAC address locking for enhanced security:

- Users can register trusted devices
- Login attempts from unregistered devices can be blocked
- Admins can manage device registrations

## Database Schema

The system uses PostgreSQL with TypeORM for database management.

### Key Entities

- **User**: System users with authentication
- **Company**: Organizations/companies
- **Branch**: Company branches
- **Customer**: Pawn customers
- **SPKRecord**: Pawn agreements
- **NKBRecord**: Item credit notes
- **AuctionBatch**: Auction batches
- **CashDeposit**: Cash deposits
- **AuditLog**: System audit trail

### Migrations

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

## Rate Limiting

API endpoints may be rate-limited to prevent abuse. Rate limit information is included in response headers:

- `X-RateLimit-Limit` - Maximum requests per window
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Time when limit resets

## Support

For issues and questions:

- Create an issue in the repository
- Contact the development team
- Refer to module-specific documentation

## License

[Specify your license here]
