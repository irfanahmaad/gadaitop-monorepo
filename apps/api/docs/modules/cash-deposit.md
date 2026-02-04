# Cash Deposit Module (Setor Uang)

## Overview

The Cash Deposit module handles store cash deposits to head office. Store Staff creates deposit requests, makes payment via QR/bank transfer, and Admin PT approves the final deposit.

## Features

- **Request Creation**: Store Staff submits deposit amount
- **Payment Integration**: QRIS/Bank transfer webhook support
- **Approval Workflow**: Admin PT approves/rejects deposits
- **Ledger Integration**: Approved deposits update store cash balance
- **Audit Trail**: Full tracking of request → payment → approval

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/cash-deposits` | List deposits (paginated) | Yes |
| GET | `/v1/cash-deposits/:id` | Get deposit details | Yes |
| POST | `/v1/cash-deposits` | Create deposit request | Yes |
| POST | `/v1/cash-deposits/webhook` | Payment provider callback | Public |
| PUT | `/v1/cash-deposits/:id/approve` | Approve deposit | Yes |
| PUT | `/v1/cash-deposits/:id/reject` | Reject deposit | Yes |

## Business Logic

### Deposit Workflow

```
Store Staff creates request → Payment made → Webhook confirms → Admin PT approves → Ledger updated
```

### Required Permissions

| Role | Permission |
|------|------------|
| Store Staff | CREATE, READ, UPDATE (pending only) |
| Admin PT | CRUD (approve/reject) |

## Feature Spec Reference

- [`store-staff-cash-deposit.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/transactions/financial/store-staff-cash-deposit.md)
- [`admin-pt-cash-deposit.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/transactions/financial/admin-pt-cash-deposit.md)
