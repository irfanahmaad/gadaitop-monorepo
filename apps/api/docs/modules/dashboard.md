# Dashboard Module

## Overview

The Dashboard module provides aggregated KPIs and chart data for frontend dashboards. Data is scoped by user's PT.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/dashboard/kpis` | Get key metrics | Yes |
| GET | `/v1/dashboard/charts/spk-by-status` | SPK distribution | Yes |
| GET | `/v1/dashboard/charts/mutation-trends` | Cash flow trends | Yes |

## Features

- PT-scoped aggregations
- Time-series mutation data
- SPK status breakdown
