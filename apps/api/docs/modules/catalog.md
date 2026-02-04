# Catalog Module

## Overview

The Catalog module manages PT-level product catalogs with pricing guidance for pawn items. Admin PT defines catalog items that Store Staff reference when creating SPK.

## Features

- **Catalog CRUD**: Item type + brand + variant combinations
- **Price History**: Track price changes over time
- **Bulk Import**: Import catalog from file
- **PT Scoping**: Each PT has their own catalog

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/catalogs` | List catalog items | Yes |
| GET | `/v1/catalogs/:id` | Get catalog details | Yes |
| GET | `/v1/catalogs/:id/price-history` | Get price changes | Yes |
| POST | `/v1/catalogs` | Create catalog item | Yes |
| PUT | `/v1/catalogs/:id` | Update catalog item | Yes |
| DELETE | `/v1/catalogs/:id` | Delete catalog item | Yes |
| POST | `/v1/catalogs/import` | Bulk import | Yes |

## Required Permissions

| Role | Permission |
|------|------------|
| Admin PT | CRUD |
| Store Staff | READ |

## Feature Spec Reference

- [`admin-pt-catalog-management.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/catalog/admin-pt-catalog-management.md)
