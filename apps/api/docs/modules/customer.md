# Customer Module

## Overview

The Customer module manages all customer-related operations in the GadaiTop pawn shop system. Customers are end-users who pawn items at stores and access the customer portal. They are separate from internal users and authenticate via NIK+PIN or Email+Password.

## Features

- **Customer CRUD**: Create, read, update, delete customers
- **KTP Scanning**: OCR-based KTP data extraction
- **PIN Management**: PIN creation, reset, and history tracking
- **Blacklist Management**: Blacklist/unblacklist customers with audit trail
- **Multi-tenant Scoping**: Customers are scoped to PT (company) level
- **Search & Filtering**: Search by NIK, name, phone, email

## Architecture

### Entity: CustomerEntity

**File**: `entities/customer.entity.ts`

| Field | Type | Description |
|-------|------|-------------|
| `nik` | string(20) | National ID (unique, indexed) |
| `pinHash` | string | Hashed PIN (excluded from responses) |
| `passwordHash` | string | Hashed password (optional) |
| `name` | string | Customer name |
| `dob` | Date | Date of birth |
| `gender` | enum | Male/Female |
| `address` | text | Full address |
| `city` | string | City name |
| `phone` | string | Phone number |
| `email` | string | Email address |
| `ktpPhotoUrl` | string | KTP photo URL |
| `selfiePhotoUrl` | string | Selfie photo URL |
| `ptId` | UUID | Company ID (FK) |
| `isBlacklisted` | boolean | Blacklist status |
| `blacklistedAt` | timestamp | When blacklisted |
| `blacklistedBy` | UUID | Who blacklisted |
| `blacklistReason` | text | Reason for blacklist |

### Entity: CustomerPinHistoryEntity

Tracks all PIN changes for audit purposes.

| Field | Type | Description |
|-------|------|-------------|
| `customerId` | UUID | Customer reference |
| `oldPinHash` | string | Previous PIN hash |
| `newPinHash` | string | New PIN hash |
| `changedBy` | UUID | User who changed PIN |
| `changeReason` | string | Reason (initial_setup, admin_reset, customer_request) |
| `ipAddress` | string | IP address of request |
| `userAgent` | string | User agent string |

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/v1/customers/scan-ktp` | Scan KTP image and extract data | Yes |
| GET | `/v1/customers` | List all customers (paginated) | Yes |
| GET | `/v1/customers/:id` | Get customer details | Yes |
| POST | `/v1/customers` | Create new customer | Yes |
| PUT | `/v1/customers/:id` | Update customer | Yes |
| PUT | `/v1/customers/:id/pin` | Change customer PIN | Yes |
| POST | `/v1/customers/:id/blacklist` | Blacklist a customer | Yes |
| DELETE | `/v1/customers/:id/blacklist` | Remove from blacklist | Yes |
| DELETE | `/v1/customers/:id` | Delete customer (soft) | Yes |

## DTOs

### CreateCustomerDto

```typescript
{
  nik: string;           // Required, 16-digit NIK
  name: string;          // Required
  dob: string;           // Required, ISO date
  gender: 'male' | 'female';
  address: string;       // Required
  city: string;          // Required
  phone: string;         // Required
  email: string;         // Required, unique
  pin: string;           // Required, 6-digit PIN
  ptId: string;          // Required, company UUID
  ktpPhotoUrl?: string;  // Optional
  selfiePhotoUrl?: string; // Optional
}
```

### UpdateCustomerDto

```typescript
{
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  ktpPhotoUrl?: string;
  selfiePhotoUrl?: string;
}
```

### ChangePinDto

```typescript
{
  oldPin?: string;  // Required if customer changing own PIN
  newPin: string;   // Required, 6-digit
}
```

### QueryCustomerDto

```typescript
{
  page?: number;     // Default: 1
  take?: number;     // Default: 10
  ptId?: string;     // Filter by company
  search?: string;   // Search NIK, name, phone, email
  sortBy?: string;   // Field to sort
  order?: 'ASC' | 'DESC';
}
```

### BlacklistCustomerDto

```typescript
{
  reason?: string;  // Optional reason for blacklisting
}
```

## Usage Examples

### Create Customer

```http
POST /v1/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "nik": "3201234567890001",
  "name": "John Doe",
  "dob": "1990-01-15",
  "gender": "male",
  "address": "Jl. Contoh No. 123",
  "city": "Jakarta",
  "phone": "081234567890",
  "email": "john.doe@example.com",
  "pin": "123456",
  "ptId": "uuid-of-company"
}
```

### Search Customers

```http
GET /v1/customers?search=john&ptId=uuid&page=1&take=10
Authorization: Bearer <token>
```

### Change Customer PIN (Admin Reset)

```http
PUT /v1/customers/:id/pin
Authorization: Bearer <token>
Content-Type: application/json

{
  "newPin": "654321"
}
```

### Blacklist Customer

```http
POST /v1/customers/:id/blacklist
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Fraudulent activity detected"
}
```

## Business Logic

### PIN Management

1. **Initial Setup**: PIN is hashed with bcrypt on customer creation
2. **Admin Reset**: Admin can reset PIN without old PIN
3. **Customer Change**: Customer must provide old PIN
4. **History Tracking**: All PIN changes logged with IP, user agent

### Blacklist Rules

1. Cannot blacklist already blacklisted customer
2. Cannot unblacklist if not blacklisted
3. Blacklist status logged with timestamps and actor
4. Blacklisted customers cannot create new SPK

### Duplicate Validation

- NIK must be unique across system
- Email must be unique per PT

## Error Handling

| Error | Code | Description |
|-------|------|-------------|
| Customer not found | 404 | UUID doesn't exist |
| NIK already exists | 400 | Duplicate NIK |
| Email already exists | 400 | Duplicate email |
| Old PIN incorrect | 400 | Wrong old PIN on change |
| Already blacklisted | 400 | Customer already on blacklist |
| Not blacklisted | 400 | Trying to unblacklist non-blacklisted |

## Related Modules

- **Auth Module**: Customer login via NIK+PIN
- **SPK Module**: Customers are linked to pawn contracts
- **Company Module**: Customers belong to a PT

## Feature Specification Reference

| Spec File | Description |
|-----------|-------------|
| [`store-staff-customer-management.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/customer/store-staff-customer-management.md) | Store Staff CRUD operations |
| [`admin-pt-customer-management.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/customer/admin-pt-customer-management.md) | Admin PT view + PIN change |
| [`store-staff-ktp-scan.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/customer/store-staff-ktp-scan.md) | KTP scanning feature |
| [`customer-profile-view.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/customer/customer-profile-view.md) | Customer self-service profile |

## Required Permissions

Based on [`roles-and-permissions.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/docs/roles-and-permissions.md):

| Role | Permission |
|------|------------|
| Store Staff | CRUD (create, read, update, delete) |
| Admin PT | READ + UPDATE (view, change PIN only) |
| Customer | READ own profile only |
