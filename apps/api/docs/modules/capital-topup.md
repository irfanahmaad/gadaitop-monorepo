# Capital Topup Module (Tambah Modal)

## Overview

The Capital Topup module manages requests to increase store operational cash. Store Staff requests additional capital, Admin PT approves, and funds are disbursed to the store.

## Features

- **Request Creation**: Store Staff submits topup amount
- **Edit Pending**: Store Staff can edit pending requests
- **Approval Workflow**: Admin PT approves/rejects
- **Disbursement**: Admin PT marks funds as disbursed
- **Limit Enforcement**: System can enforce daily/weekly caps

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/capital-topups` | List topup requests | Yes |
| GET | `/v1/capital-topups/:id` | Get topup details | Yes |
| POST | `/v1/capital-topups` | Create topup request | Yes |
| PUT | `/v1/capital-topups/:id` | Update pending request | Yes |
| PUT | `/v1/capital-topups/:id/approve` | Approve request | Yes |
| PUT | `/v1/capital-topups/:id/reject` | Reject request | Yes |
| PUT | `/v1/capital-topups/:id/disburse` | Mark as disbursed | Yes |

## Business Logic

### Topup Workflow

```
Store Staff creates → (optional edit) → Admin PT approves → Admin PT disburses → Store receives funds
```

### Required Permissions

| Role | Permission |
|------|------------|
| Store Staff | CREATE, READ, UPDATE (pending only) |
| Admin PT | CRUD (approve/reject/disburse) |

## Feature Spec Reference

- [`store-staff-capital-topup.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/transactions/financial/store-staff-capital-topup.md)
- [`admin-pt-capital-topup.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/transactions/financial/admin-pt-capital-topup.md)
