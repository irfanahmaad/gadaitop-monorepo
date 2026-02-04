# Branch Module (Store/Cabang)

## Overview

The Branch module manages store/branch entities under each PT. Admin PT creates and manages branches where Store Staff operate daily transactions.

## Features

- **Branch CRUD**: Full lifecycle management
- **Company Scoping**: Auto-filtered by user's PT
- **Borrow Request**: Inter-branch capital borrowing approval
- **Status Management**: Active/inactive toggle

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/branches` | List branches | Yes |
| GET | `/v1/branches/:id` | Get branch details | Yes |
| POST | `/v1/branches` | Create branch | Yes |
| PATCH | `/v1/branches/:id` | Update branch | Yes |
| DELETE | `/v1/branches/:id` | Delete branch | Yes |
| PATCH | `/v1/branches/:id/approve` | Approve borrow request | Yes |
| PATCH | `/v1/branches/:id/reject` | Reject borrow request | Yes |

## Required Permissions

| Role | Permission |
|------|------------|
| Admin PT | CRUD |
| Store Staff | READ (own branch only) |

## Feature Spec Reference

- [`admin-pt-store-management.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/store/admin-pt-store-management.md)
