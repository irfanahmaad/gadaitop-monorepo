# Pawn Term Module

## Overview

The Pawn Term module manages PT-level pawn contract terms including interest rates, durations, and fee structures. Admin PT configures terms that apply to SPK created in their company.

## Features

- **Term Configuration**: Interest rate, duration, grace period
- **Fee Structure**: Admin fee, penalty rates
- **PT Scoping**: Each PT manages their own terms
- **Active/Inactive**: Toggle term availability

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/pawn-terms` | List pawn terms | Yes |
| GET | `/v1/pawn-terms/:id` | Get term details | Yes |
| POST | `/v1/pawn-terms` | Create term | Yes |
| PUT | `/v1/pawn-terms/:id` | Update term | Yes |
| DELETE | `/v1/pawn-terms/:id` | Delete term | Yes |

## Required Permissions

| Role | Permission |
|------|------------|
| Admin PT | CRUD |
| Store Staff | READ |

## Feature Spec Reference

- [`admin-pt-pawn-terms.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/system/admin-pt-pawn-terms.md)
