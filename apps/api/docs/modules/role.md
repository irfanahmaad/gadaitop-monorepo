# Role Module

## Overview

The Role module provides read-only access to system roles. Roles are predefined and seeded during deployment. Each role contains a set of permissions used by the RBAC system.

## Features

- **Role Listing**: View all available roles
- **Role Lookup**: Find role by code
- **Permission Storage**: Roles contain JSONB permission arrays

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/roles` | List all roles | Yes |
| GET | `/v1/roles/code/:code` | Get role by code | Yes |

## Predefined Roles

| Code | Name | Description |
|------|------|-------------|
| `owner` | Owner | Super Admin with full system access |
| `company_admin` | Admin PT | Company administrator |
| `branch_staff` | Store Staff | Branch-level operator |
| `stock_auditor` | Stock Opname Staff | Inventory counter |
| `auction_staff` | Auction Staff | Auction validator |
| `marketing` | Marketing Staff | Marketing activities |
| `customer` | Customer | End-user (portal access) |

## Related Documentation

- [`roles-and-permissions.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/docs/roles-and-permissions.md) - Comprehensive RBAC specification
