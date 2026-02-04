# User Module

## Overview

The User module manages internal system users (Admin PT, Store Staff, Stock Opname Staff, Auction Staff, Marketing Staff). These are separate from customers and authenticate via email/password.

## Features

- **User CRUD**: Full lifecycle management
- **Role Assignment**: Assign/reassign roles to users
- **Password Reset**: Admin-initiated password reset
- **Company/Branch Assignment**: Scope users to PT and branch
- **Status Management**: Active/inactive/suspended

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/users` | List users | Yes |
| GET | `/v1/users/:id` | Get user details | Yes |
| POST | `/v1/users` | Create user | Yes |
| PATCH | `/v1/users/:id` | Update user | Yes |
| POST | `/v1/users/:id/assign-roles` | Assign roles | Yes |
| POST | `/v1/users/:id/reset-password` | Reset password | Yes |
| DELETE | `/v1/users/:id` | Delete user | Yes |

## Required Permissions

| Role | Permission |
|------|------------|
| Super Admin | CRUD (super admin users only) |
| Admin PT | CRUD (PT/store staff only) |

## Feature Spec Reference

- [`admin-pt-user-management.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/user/admin-pt-user-management.md)
- [`super-admin-list.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/user/super-admin-list.md)
