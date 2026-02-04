# GadaiTop API Reference

Complete API endpoint reference for the GadaiTop pawn shop management system.

**Base URL**: `http://localhost:8080` (Development)

**API Version**: v1

## Table of Contents

- [Authentication](#authentication)
- [Companies](#companies)
- [Branches](#branches)
- [Item Types](#item-types)
- [Devices](#devices)
- [Audit Logs](#audit-logs)
- [Borrow Requests](#borrow-requests)
- [Users](#users)
- [Health](#health)

---

## Authentication

### Register

Create a new user account.

**Endpoint**: `POST /v1/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+6281234567890"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+6281234567890"
    },
    "token": {
      "accessToken": "jwt-token-here"
    }
  }
}
```

---

### Login

Authenticate and obtain access token.

**Endpoint**: `POST /v1/auth/login`

**Request Body**:
```json
{
  "email": "admin@gadaitop.com",
  "password": "admin123",
  "macAddress": "00:1B:44:11:3A:B7" // Optional for device verification
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@gadaitop.com",
      "fullName": "Admin User"
    },
    "token": {
      "accessToken": "jwt-token-here"
    }
  }
}
```

---

### Get Current User

Get authenticated user information.

**Endpoint**: `GET /v1/auth/me`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true,
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

---

### Logout

Invalidate current session token.

**Endpoint**: `POST /v1/auth/logout`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Forgot Password

Request password reset token.

**Endpoint**: `POST /v1/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Reset Password

Reset password using token from email.

**Endpoint**: `POST /v1/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newPassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

### Verify Email

Verify user email with token.

**Endpoint**: `POST /v1/auth/verify-email`

**Request Body**:
```json
{
  "token": "email-verification-token"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## Companies

### Get Company

Get company details by ID.

**Endpoint**: `GET /v1/companies/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): Company UUID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "companyName": "PT Gadai Top",
    "phoneNumber": "+6281234567890",
    "address": "Jakarta",
    "config": {
      "earlyInterestRate": 1.5,
      "normalInterestRate": 2.0,
      "adminFeeRate": 0.5,
      "insuranceFee": 10000
    }
  }
}
```

---

### Update Company

Update company information.

**Endpoint**: `PATCH /v1/companies/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `id` (path, required): Company UUID

**Request Body**:
```json
{
  "companyName": "Updated Company Name",
  "phoneNumber": "+6281234567890",
  "address": "Updated Address"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "companyName": "Updated Company Name",
    "phoneNumber": "+6281234567890",
    "address": "Updated Address"
  }
}
```

---

### Update Company Config

Update company interest and fee configuration.

**Endpoint**: `PATCH /v1/companies/:id/config`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `id` (path, required): Company UUID

**Request Body**:
```json
{
  "earlyInterestRate": 1.5,
  "normalInterestRate": 2.0,
  "adminFeeRate": 0.5,
  "insuranceFee": 10000,
  "latePenaltyRate": 0.1,
  "minPrincipalPayment": 50000,
  "defaultTenorDays": 30,
  "earlyPaymentDays": 7
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "earlyInterestRate": 1.5,
    "normalInterestRate": 2.0,
    "adminFeeRate": 0.5,
    "insuranceFee": 10000
  }
}
```

---

### Get Company Statistics

Get company statistics.

**Endpoint**: `GET /v1/companies/:id/statistics`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): Company UUID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalBranches": 10,
    "activePawns": 150,
    "totalRevenue": 50000000,
    "totalCustomers": 500
  }
}
```

---

## Branches

### List Branches

List all branches with optional filters.

**Endpoint**: `GET /v1/branches`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 10): Items per page
- `companyId` (optional): Filter by company ID
- `status` (optional): Filter by status (draft, pending_approval, active, inactive)
- `city` (optional): Filter by city

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "branchCode": "BR001",
        "shortName": "Jakarta Pusat",
        "fullName": "Cabang Jakarta Pusat",
        "address": "Jl. Sudirman No. 1",
        "phone": "+6281234567890",
        "city": "Jakarta",
        "status": "active"
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 50,
      "totalPages": 5
    }
  }
}
```

---

### Get Branch

Get branch details by ID.

**Endpoint**: `GET /v1/branches/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): Branch UUID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "branchCode": "BR001",
    "shortName": "Jakarta Pusat",
    "fullName": "Cabang Jakarta Pusat",
    "address": "Jl. Sudirman No. 1",
    "phone": "+6281234567890",
    "city": "Jakarta",
    "status": "active",
    "company": { ... }
  }
}
```

---

### Create Branch

Create a new branch.

**Endpoint**: `POST /v1/branches`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**:
```json
{
  "branchCode": "BR001",
  "shortName": "Jakarta Pusat",
  "fullName": "Cabang Jakarta Pusat",
  "address": "Jl. Sudirman No. 1",
  "phone": "+6281234567890",
  "city": "Jakarta",
  "companyId": "company-uuid-here",
  "isBorrowed": false
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "branchCode": "BR001",
    "shortName": "Jakarta Pusat",
    "status": "draft"
  }
}
```

---

### Update Branch

Update branch information.

**Endpoint**: `PATCH /v1/branches/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `id` (path, required): Branch UUID

**Request Body**:
```json
{
  "shortName": "Updated Short Name",
  "fullName": "Updated Full Name",
  "address": "Updated Address",
  "phone": "+6281234567891",
  "city": "Updated City"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "shortName": "Updated Short Name",
    "fullName": "Updated Full Name"
  }
}
```

---

### Deactivate Branch

Deactivate a branch (soft delete).

**Endpoint**: `DELETE /v1/branches/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): Branch UUID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Branch deactivated successfully"
}
```

---

### Approve Borrow Request

Approve a borrow request (Pinjam PT) for a branch.

**Endpoint**: `PATCH /v1/branches/:id/approve`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): Branch UUID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Borrow request approved",
  "data": {
    "id": "uuid",
    "status": "active",
    "isBorrowed": true
  }
}
```

---

### Reject Borrow Request

Reject a borrow request (Pinjam PT) for a branch.

**Endpoint**: `PATCH /v1/branches/:id/reject`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `id` (path, required): Branch UUID

**Request Body**:
```json
{
  "rejectionReason": "Reason for rejection"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Borrow request rejected"
}
```

---

## Item Types

### List Item Types

List all item types.

**Endpoint**: `GET /v1/item-types`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 10): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "typeCode": "GOLD",
        "typeName": "Emas",
        "description": "Jenis barang emas",
        "isActive": true,
        "sortOrder": 1,
        "iconUrl": "https://example.com/icon.png"
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 20,
      "totalPages": 2
    }
  }
}
```

---

### Get Item Type

Get item type details by ID.

**Endpoint**: `GET /v1/item-types/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): Item Type UUID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "typeCode": "GOLD",
    "typeName": "Emas",
    "description": "Jenis barang emas",
    "isActive": true,
    "sortOrder": 1,
    "iconUrl": "https://example.com/icon.png"
  }
}
```

---

### Create Item Type

Create a new item type.

**Endpoint**: `POST /v1/item-types`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**:
```json
{
  "typeCode": "GOLD",
  "typeName": "Emas",
  "description": "Jenis barang emas",
  "isActive": true,
  "sortOrder": 1,
  "iconUrl": "https://example.com/icon.png"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "typeCode": "GOLD",
    "typeName": "Emas"
  }
}
```

---

### Update Item Type

Update item type information.

**Endpoint**: `PATCH /v1/item-types/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `id` (path, required): Item Type UUID

**Request Body**:
```json
{
  "typeName": "Updated Type Name",
  "description": "Updated description",
  "isActive": true,
  "sortOrder": 2,
  "iconUrl": "https://example.com/updated-icon.png"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "typeName": "Updated Type Name"
  }
}
```

---

### Delete Item Type

Delete an item type.

**Endpoint**: `DELETE /v1/item-types/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): Item Type UUID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Item type deleted successfully"
}
```

---

## Devices

### List User Devices

List all registered devices for a user.

**Endpoint**: `GET /v1/users/:userId/devices`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `userId` (path, required): User UUID

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "macAddress": "00:1B:44:11:3A:B7",
      "deviceName": "iPhone 13 Pro",
      "deviceType": "mobile",
      "osInfo": "iOS 15.0",
      "isActive": true,
      "lastUsedAt": "2024-02-03T10:30:00Z"
    }
  ]
}
```

---

### Register Device

Register a new device for a user (MAC address locking).

**Endpoint**: `POST /v1/users/:userId/devices`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `userId` (path, required): User UUID

**Request Body**:
```json
{
  "macAddress": "00:1B:44:11:3A:B7",
  "deviceName": "iPhone 13 Pro",
  "deviceType": "mobile",
  "osInfo": "iOS 15.0"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "macAddress": "00:1B:44:11:3A:B7",
    "deviceName": "iPhone 13 Pro",
    "isActive": true
  }
}
```

---

### Update Device

Update device registration information.

**Endpoint**: `PATCH /v1/users/:userId/devices/:deviceId`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `userId` (path, required): User UUID
- `deviceId` (path, required): Device UUID

**Request Body**:
```json
{
  "deviceName": "Updated Device Name",
  "isActive": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "deviceName": "Updated Device Name",
    "isActive": true
  }
}
```

---

### Deactivate Device

Deactivate a device registration.

**Endpoint**: `DELETE /v1/users/:userId/devices/:deviceId`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `userId` (path, required): User UUID
- `deviceId` (path, required): Device UUID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Device deactivated successfully"
}
```

---

## Audit Logs

### List Audit Logs

List audit logs with optional filters.

**Endpoint**: `GET /v1/audit-logs`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 10): Items per page
- `entityName` (optional): Filter by entity name
- `action` (optional): Filter by action (create, update, delete, login, logout, password_change, status_change)
- `userId` (optional): Filter by user ID
- `startDate` (optional): Filter by start date (ISO 8601)
- `endDate` (optional): Filter by end date (ISO 8601)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "entityName": "User",
        "entityId": "user-uuid",
        "action": "update",
        "userId": "user-uuid",
        "userName": "John Doe",
        "changes": { ... },
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2024-02-03T10:30:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 100,
      "totalPages": 10
    }
  }
}
```

---

### Get Audit Log

Get audit log details by ID.

**Endpoint**: `GET /v1/audit-logs/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): Audit Log UUID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "entityName": "User",
    "entityId": "user-uuid",
    "action": "update",
    "userId": "user-uuid",
    "userName": "John Doe",
    "changes": {
      "before": { ... },
      "after": { ... }
    },
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2024-02-03T10:30:00Z"
  }
}
```

---

### Export Audit Logs

Export audit logs as JSON.

**Endpoint**: `GET /v1/audit-logs/export`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
- `entityName` (optional): Filter by entity name
- `action` (optional): Filter by action
- `userId` (optional): Filter by user ID
- `startDate` (optional): Filter by start date (ISO 8601)
- `endDate` (optional): Filter by end date (ISO 8601)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entityName": "User",
      "action": "update",
      "createdAt": "2024-02-03T10:30:00Z"
    }
  ]
}
```

---

## Borrow Requests

### List Borrow Requests

List all borrow requests (Pinjam PT).

**Endpoint**: `GET /v1/borrow-requests`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 10): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "branch": { ... },
        "targetCompany": { ... },
        "requestReason": "Need to borrow this branch",
        "status": "pending",
        "createdAt": "2024-02-03T10:30:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 20,
      "totalPages": 2
    }
  }
}
```

---

### Get Borrow Request

Get borrow request details by ID.

**Endpoint**: `GET /v1/borrow-requests/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): Borrow Request UUID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "branch": { ... },
    "targetCompany": { ... },
    "requestReason": "Need to borrow this branch",
    "status": "pending",
    "createdAt": "2024-02-03T10:30:00Z"
  }
}
```

---

### Create Borrow Request

Create a new borrow request (Pinjam PT).

**Endpoint**: `POST /v1/borrow-requests`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**:
```json
{
  "branchId": "branch-uuid-here",
  "targetCompanyId": "target-company-uuid-here",
  "requestReason": "Need to borrow this branch for temporary operations"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending",
    "requestReason": "Need to borrow this branch for temporary operations"
  }
}
```

---

### Approve Borrow Request

Approve a borrow request.

**Endpoint**: `PATCH /v1/borrow-requests/:id/approve`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): Borrow Request UUID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Borrow request approved",
  "data": {
    "id": "uuid",
    "status": "approved"
  }
}
```

---

### Reject Borrow Request

Reject a borrow request with reason.

**Endpoint**: `PATCH /v1/borrow-requests/:id/reject`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `id` (path, required): Borrow Request UUID

**Request Body**:
```json
{
  "rejectionReason": "Reason for rejection"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Borrow request rejected",
  "data": {
    "id": "uuid",
    "status": "rejected",
    "rejectionReason": "Reason for rejection"
  }
}
```

---

## Users

### List Users

List all users.

**Endpoint**: `GET /v1/users`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Query Parameters**:
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 10): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "fullName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+6281234567890",
        "company": { ... },
        "branch": { ... },
        "roles": ["admin"]
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 50,
      "totalPages": 5
    }
  }
}
```

---

### Get User

Get user details by ID.

**Endpoint**: `GET /v1/users/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
```

**Parameters**:
- `id` (path, required): User UUID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+6281234567890",
    "company": { ... },
    "branch": { ... },
    "roles": ["admin"]
  }
}
```

---

### Create User

Create a new user.

**Endpoint**: `POST /v1/users`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "+6281234567890",
  "companyId": "company-uuid-here",
  "branchId": "branch-uuid-here",
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Update User

Update user information.

**Endpoint**: `PATCH /v1/users/:id`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `id` (path, required): User UUID

**Request Body**:
```json
{
  "fullName": "Updated Name",
  "phoneNumber": "+6281234567891",
  "companyId": "company-uuid-here",
  "branchId": "branch-uuid-here"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Updated Name",
    "phoneNumber": "+6281234567891"
  }
}
```

---

### Assign Roles to User

Assign roles to a user.

**Endpoint**: `POST /v1/users/:id/assign-roles`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `id` (path, required): User UUID

**Request Body**:
```json
{
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Roles assigned successfully",
  "data": {
    "id": "uuid",
    "roles": ["admin", "manager"]
  }
}
```

---

### Reset User Password

Reset a user's password.

**Endpoint**: `POST /v1/users/:id/reset-password`

**Headers**:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Parameters**:
- `id` (path, required): User UUID

**Request Body**:
```json
{
  "newPassword": "newPassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Health

### Health Check

Check API and database health status.

**Endpoint**: `GET /health`

**Response** (200 OK):
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "memory": {
      "status": "up",
      "heapUsed": 50000000,
      "heapTotal": 100000000
    }
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": []
  },
  "timestamp": "2024-02-03T10:30:00Z"
}
```

### Common Error Codes

- `UNAUTHORIZED` - Authentication required or token invalid
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Request validation failed
- `CONFLICT` - Resource conflict (e.g., duplicate email)
- `INTERNAL_ERROR` - Internal server error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1612345678
```

---

## Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 10, max: 100)

Response includes pagination metadata:

```json
{
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 100,
    "totalPages": 10
  }
}
```

---

## Filtering & Sorting

Many list endpoints support filtering and sorting:

**Filtering**: Use query parameters matching field names
```
GET /v1/branches?city=Jakarta&status=active
```

**Sorting**: Use `sortBy` and `sortOrder` parameters
```
GET /v1/users?sortBy=createdAt&sortOrder=DESC
```

---

## Postman Collection

Import the Postman collection for easy API testing:

**File**: `GadaiTop_API.postman_collection.json`

**Variables**:
- `baseUrl`: API base URL (default: `http://localhost:8080`)
- `accessToken`: JWT access token (auto-populated after login)
- `userId`: Current user ID (auto-populated after login)

---

*For module-specific technical documentation, see the [modules](./modules/) directory.*
