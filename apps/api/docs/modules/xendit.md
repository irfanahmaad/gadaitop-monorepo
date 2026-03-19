# Xendit Module

## Overview

The Xendit module is a **global NestJS module** (`@Global()`) that wraps the Xendit REST API using native Node.js `fetch`. It is used exclusively by `CashDepositModule` to create Fixed Virtual Accounts and verify incoming webhook callbacks.

> **Why native fetch instead of xendit-node SDK?**
> `xendit-node` v7 only exposes the Invoice and PaymentMethod APIs. The legacy Fixed Virtual Account endpoint (`POST /callback_virtual_accounts`) is not available through the v7 SDK, so we call it directly via `fetch`.

---

## Service: `XenditService`

### `createFixedVirtualAccount(externalId, amount, expiresAt, name?, bankCode?)`

Creates a **single-use, closed** Fixed VA on Xendit.

| Parameter | Type | Description |
|-----------|------|-------------|
| `externalId` | string | Unique reference (= `depositCode`) used to match webhook |
| `amount` | number | Exact amount the payer must transfer |
| `expiresAt` | Date | VA expiry datetime (set to 23:59:59 WIB same day) |
| `name` | string? | Payer name shown on VA (default: `"Gadai Top"`) |
| `bankCode` | string? | Bank code for VA (default: `XENDIT_VA_BANK_CODE` env, fallback `"BNI"`) |

**Returns:**
```typescript
{
  xenditId: string     // Xendit's internal VA ID
  externalId: string   // Same as input externalId
  vaNumber: string     // VA number to show to payer (e.g. "8808123456789")
  bankCode: string     // Bank code used
  expiresAt: Date      // Expiry datetime
}
```

**Xendit API called:**
```
POST https://api.xendit.co/callback_virtual_accounts
Authorization: Basic base64(SECRET_KEY:)
Content-Type: application/json

{
  "external_id": "DEP-20260319-12345",
  "bank_code": "BNI",
  "name": "Gadai Top",
  "expected_amount": 5000000,
  "expiration_date": "2026-03-19T16:59:59.000Z",
  "is_single_use": true,
  "is_closed": true
}
```

---

### `verifyWebhookToken(callbackToken)`

Compares the `x-callback-token` header from an incoming webhook against `XENDIT_WEBHOOK_TOKEN` env var.

| Parameter | Type | Description |
|-----------|------|-------------|
| `callbackToken` | string | Value of `x-callback-token` header |

**Returns:** `boolean` — `true` if tokens match

---

## Module Setup

`XenditModule` is decorated with `@Global()` so `XenditService` is available throughout the application without explicit imports in consumer modules.

```typescript
@Global()
@Module({
  providers: [XenditService],
  exports: [XenditService],
})
export class XenditModule {}
```

Registered in `AppModule`:
```typescript
imports: [
  ...,
  XenditModule,
  ...
]
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `XENDIT_SECRET_KEY` | ✅ | API secret key from Xendit dashboard (starts with `xnd_`) |
| `XENDIT_WEBHOOK_TOKEN` | ✅ | Webhook verification token from Xendit dashboard |
| `XENDIT_API_URL` | ❌ | API base URL override (default: `https://api.xendit.co`) |
| `XENDIT_VA_BANK_CODE` | ❌ | Default bank code for VA (default: `BNI`) |

---

## Supported Bank Codes (Xendit Sandbox)

| Code | Bank |
|------|------|
| `BNI` | Bank Negara Indonesia |
| `BRI` | Bank Rakyat Indonesia |
| `MANDIRI` | Bank Mandiri |
| `BCA` | Bank Central Asia |
| `PERMATA` | Bank Permata |

---

## Files

```
src/modules/xendit/
├── xendit.module.ts     # @Global() module definition
└── xendit.service.ts    # Fixed VA creation + webhook token verification
```
