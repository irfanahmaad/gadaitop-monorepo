# Item Type Module

## Overview

The Item Type module manages global pawn item categories (e.g., Electronics, Jewelry, Vehicles). Super Admin manages these system-wide types that all PTs use.

## Features

- **Global Types**: Shared across all PTs
- **Category Hierarchy**: Parent/child relationships
- **Appraisal Rules**: Default valuation settings per type

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/item-types` | List item types | Yes |
| GET | `/v1/item-types/:id` | Get item type | Yes |
| POST | `/v1/item-types` | Create item type | Yes |
| PATCH | `/v1/item-types/:id` | Update item type | Yes |
| DELETE | `/v1/item-types/:id` | Delete item type | Yes |

## Required Permissions

| Role | Permission |
|------|------------|
| Super Admin | CRUD |
| Admin PT | READ |
| Store Staff | READ |

## Feature Spec Reference

- [`item-type-list.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/system/item-type-list.md)
- [`item-type-management.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/system/item-type-management.md)
