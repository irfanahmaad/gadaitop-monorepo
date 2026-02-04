# Audit Module

## Overview

The Audit module provides audit log access for compliance and monitoring. Logs are automatically generated for system actions.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/audit-logs` | List audit logs | Yes |
| GET | `/v1/audit-logs/:id` | Get log details | Yes |
| GET | `/v1/audit-logs/export` | Export logs | Yes |

## Features

- Filter by action type, user, date range
- Export for compliance reporting
- Immutable log records
