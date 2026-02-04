# Upload Module

## Overview

The Upload module provides presigned URL generation for S3 file uploads. Clients use these URLs to upload files directly to storage.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/upload/presigned` | Get presigned upload URL | No |
| GET | `/upload/public-url` | Get public URL for key | No |
| GET | `/upload/status` | Check S3 configuration | No |

## Features

- Direct-to-S3 uploads
- Configurable content types
- URL expiration control
