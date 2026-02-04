# Borrow Request Module

## Overview

The Borrow Request module handles inter-branch capital borrowing. Branch Staff requests capital from another branch, and Admin PT approves/rejects.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/borrow-requests` | List requests | Yes |
| GET | `/v1/borrow-requests/:id` | Get request details | Yes |
| POST | `/v1/borrow-requests` | Create request | Yes |
| PATCH | `/v1/borrow-requests/:id/approve` | Approve request | Yes |
| PATCH | `/v1/borrow-requests/:id/reject` | Reject request | Yes |

## Features

- Inter-branch capital transfer
- Approval workflow
- Rejection with reason
