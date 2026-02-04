# Stock Opname Module

## Overview

The Stock Opname module manages inventory counting sessions. Admin PT schedules sessions, Stock Opname Staff performs counting via QR scan and records item conditions, then Admin PT approves final results.

## Features

- **Session Management**: Create/schedule counting sessions
- **QR Scanning**: Scan item QR codes during count
- **Condition Recording**: Record item condition with photos
- **Completion Workflow**: Complete → Approve flow
- **Discrepancy Detection**: Auto-flag missing items

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/stock-opname` | List sessions | Yes |
| GET | `/v1/stock-opname/:id` | Get session details | Yes |
| POST | `/v1/stock-opname` | Create session | Yes |
| PUT | `/v1/stock-opname/:id/items` | Update counted items | Yes |
| POST | `/v1/stock-opname/:id/items/:itemId/condition` | Record condition | Yes |
| PUT | `/v1/stock-opname/:id/complete` | Mark as complete | Yes |
| PUT | `/v1/stock-opname/:id/approve` | Approve session | Yes |

## Business Logic

### Session Workflow

```
Draft → In Progress → Completed → Approved
```

### Required Permissions

| Role | Permission |
|------|------------|
| Admin PT | CRUD (create, approve) |
| Stock Opname Staff | READ + UPDATE (counting only) |

## Feature Spec Reference

- [`admin-pt-stock-opname-list.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/inventory/admin-pt-stock-opname-list.md)
- [`stock-opname-staff-counting.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/inventory/stock-opname-staff-counting.md)
