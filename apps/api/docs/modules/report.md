# Report Module

## Overview

The Report module generates business reports with optional CSV export. Reports are scoped by PT and support date range filtering.

## API Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/v1/reports/mutation-by-branch` | Cash mutations by branch | `READ Report` |
| GET | `/v1/reports/mutation-by-pt` | Cash mutations by PT | `READ Report` |
| GET | `/v1/reports/spk` | SPK/pawn contract report | `READ Report` |
| GET | `/v1/reports/nkb-payments` | NKB payment report | `READ Report` |
| GET | `/v1/reports/stock-opname` | Stock opname report | `READ Report` |

## Features

- JSON and CSV export (`?format=csv`)
- Date range filtering
- PT and branch scoping
