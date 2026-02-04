# Cash Mutation Module (Mutasi Kas)

## Overview

The Cash Mutation module tracks all cash movements at store level. It provides transaction history, balance queries, and manual mutation entries for reconciliation.

## Features

- **Balance Query**: Get current store cash balance
- **Transaction History**: List all cash mutations
- **Manual Entry**: Create adjustment entries
- **Multi-source Tracking**: Tracks deposits, topups, SPK payouts, NKB receipts

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/cash-mutations/balance?storeId=` | Get store balance | Yes |
| GET | `/v1/cash-mutations` | List mutations (paginated) | Yes |
| POST | `/v1/cash-mutations` | Create manual mutation | Yes |

## Business Logic

### Mutation Types

- **Inflow**: NKB payments, capital topups
- **Outflow**: SPK disbursements, cash deposits

### Required Permissions

| Role | Permission |
|------|------------|
| Store Staff | READ |
| Admin PT | READ |

## Feature Spec Reference

- [`store-staff-cash-mutations.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/transactions/financial/store-staff-cash-mutations.md)
- [`admin-pt-cash-mutations.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/transactions/financial/admin-pt-cash-mutations.md)
