# Device Module

## Overview

The Device module manages registered devices for users. Used for IP/MAC address verification during login.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/users/:userId/devices` | List user devices | Yes |
| POST | `/v1/users/:userId/devices` | Register device | Yes |
| PATCH | `/v1/users/:userId/devices/:deviceId` | Update device | Yes |
| DELETE | `/v1/users/:userId/devices/:deviceId` | Remove device | Yes |

## Features

- IP address and MAC address tracking
- Device activation/deactivation
- Security-focused device locking
