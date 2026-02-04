# Company Module (PT)

## Overview

The Company module manages PT (company) entities in the multi-tenant system. Super Admin creates companies with their admin users, while Admin PT manages their own company settings.

## Features

- **Company CRUD**: Full lifecycle management
- **Admin Creation**: Create company with initial admin user
- **Configuration**: Separate config endpoint for business settings
- **Statistics**: Dashboard-ready aggregate data

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/companies` | List companies | Yes |
| GET | `/v1/companies/:id` | Get company details | Yes |
| POST | `/v1/companies` | Create company with admin | Yes |
| PATCH | `/v1/companies/:id` | Update company | Yes |
| PATCH | `/v1/companies/:id/config` | Update business config | Yes |
| GET | `/v1/companies/:id/statistics` | Get aggregated stats | Yes |
| DELETE | `/v1/companies/:id` | Delete company | Yes |

## Required Permissions

| Role | Permission |
|------|------------|
| Super Admin | CRUD |
| Admin PT | READ + UPDATE (own company only) |

## Feature Spec Reference

- [`pt-list.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/pt/pt-list.md)
- [`pt-create.md`](file:///Users/travis/Work/gadaitop/gadaitop-monorepo/feature_specifications/master-data/pt/pt-create.md)
