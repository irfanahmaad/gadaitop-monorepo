# Auction Module

## Overview

The Auction module manages defaulted pawn item auctions. Admin PT creates batches of items for auction, Auction Staff validates items and handles pickup, and Marketing Staff manages auction marketing activities.

## Features

- **Batch Management**: Create/manage auction batches
- **Item Validation**: Verify item condition before auction
- **Pickup Tracking**: Record when items are collected
- **Assignment**: Assign staff to batches
- **Finalization**: Close batch after auction

## API Endpoints

| Method | Endpoint | Description | Auth/Permission |
|--------|----------|-------------|-----------------|
| GET | `/v1/auction-batches` | List batches | `READ AuctionBatch` |
| GET | `/v1/auction-batches/:id` | Get batch details | `READ AuctionBatch` |
| POST | `/v1/auction-batches` | Create batch | `CREATE AuctionBatch` |
| PUT | `/v1/auction-batches/:id/assign` | Assign to staff | `UPDATE AuctionBatch` |
| PUT | `/v1/auction-batches/:id/items/:itemId/pickup` | Update pickup | `UPDATE AuctionPickup` |
| PUT | `/v1/auction-batches/:id/items/:itemId/validation` | Submit validation | `UPDATE AuctionValidation` |
| PUT | `/v1/auction-batches/:id/finalize` | Finalize batch | `UPDATE AuctionValidation` |
| PUT | `/v1/auction-batches/:id/cancel` | Cancel batch | `UPDATE AuctionBatch` |

## Business Logic

### Batch Workflow

```
Draft → Assigned → Pickup → Validated → Finalized
```

### Required Permissions

| Role | Permission |
|------|------------|
| Admin PT | CRUD (all operations) |
| Auction Staff | CRUD AuctionValidation (validate items) |
| Marketing Staff | READ AuctionBatch |

## Feature Spec Reference

- [`admin-pt-auction-management.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/auction/admin-pt-auction-management.md)
