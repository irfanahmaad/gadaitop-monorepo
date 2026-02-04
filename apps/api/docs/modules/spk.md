# SPK Module (Surat Perjanjian Kredit)

## Overview

The SPK (Surat Perjanjian Kredit) module manages pawn agreements/contracts in the GadaiTop system. It handles the complete lifecycle of pawn transactions from creation to redemption or auction.

## Features

- **SPK Creation**: Create new pawn agreements with items
- **SPK Confirmation**: Confirm draft SPK with customer PIN
- **SPK Extension**: Extend pawn period with interest payment
- **SPK Redemption**: Redeem pawned items with payment
- **Transaction History**: Track all SPK-related transactions
- **Interest Calculation**: Automatic interest and fee calculation
- **Status Management**: Draft, Active, Extended, Redeemed, Auctioned statuses

## Entity Structure

### SpkRecordEntity

**Table**: `spk_records`

| Field | Type | Description |
|-------|------|-------------|
| `spkNumber` | varchar(50) | Unique SPK number |
| `internalSpkNumber` | varchar(20) | Internal SPK number: [TypeCode][8-digit sequence] |
| `customerSpkNumber` | varchar(20) | Customer SPK number: YYYYMMDD[4 random digits] |
| `customerId` | uuid | Customer reference |
| `storeId` | uuid | Branch/store reference |
| `ptId` | uuid | Company reference |
| `principalAmount` | decimal(15,2) | Principal loan amount |
| `tenor` | int | Loan period in days |
| `interestRate` | decimal(5,2) | Interest rate percentage |
| `adminFee` | decimal(15,2) | Administration fee |
| `totalAmount` | decimal(15,2) | Total amount (principal + interest + fees) |
| `remainingBalance` | decimal(15,2) | Remaining balance to pay |
| `dueDate` | date | Due date for payment |
| `status` | enum | SPK status (draft, active, extended, redeemed, auctioned) |
| `confirmedAt` | timestamp | Confirmation timestamp |
| `confirmedByPin` | boolean | Whether confirmed by customer PIN |

### SpkItemEntity

**Table**: `spk_items`

Represents individual items in a pawn agreement.

| Field | Type | Description |
|-------|------|-------------|
| `spkId` | uuid | SPK record reference |
| `itemTypeId` | uuid | Item type reference |
| `description` | text | Item description |
| `weight` | decimal | Item weight (for gold/jewelry) |
| `estimatedValue` | decimal(15,2) | Estimated item value |
| `photoUrl` | varchar | Item photo URL |

## API Endpoints

### List SPK Records

```
GET /v1/spk
```

**Query Parameters**:
- `page`: Page number
- `pageSize`: Items per page
- `status`: Filter by status
- `customerId`: Filter by customer
- `storeId`: Filter by branch

### Create SPK

```
POST /v1/spk
```

**Request Body**:
```json
{
  "customerId": "uuid",
  "storeId": "uuid",
  "principalAmount": 1000000,
  "tenor": 30,
  "items": [
    {
      "itemTypeId": "uuid",
      "description": "Gold ring 24K",
      "weight": 5.5,
      "estimatedValue": 1500000,
      "photoUrl": "https://..."
    }
  ]
}
```

### Confirm SPK

```
PUT /v1/spk/:id/confirm
```

**Request Body**:
```json
{
  "customerPin": "123456"
}
```

Confirms a draft SPK and activates the pawn agreement.

### Extend SPK

```
PUT /v1/spk/:id/extend
```

**Request Body**:
```json
{
  "extensionDays": 30,
  "interestPayment": 50000
}
```

Extends the pawn period by paying interest.

### Redeem SPK

```
PUT /v1/spk/:id/redeem
```

**Request Body**:
```json
{
  "amountPaid": 1100000
}
```

Redeems the pawned items by paying the full amount.

### Get SPK History

```
GET /v1/spk/:id/history
```

Returns all transactions related to the SPK (extensions, payments, etc.).

### Get SPK NKB Records

```
GET /v1/spk/:id/nkb
```

Returns all NKB (Nota Kredit Barang) records associated with the SPK.

### Get SPK Details

```
GET /v1/spk/:id
```

Returns detailed SPK information including items and customer data.

## Business Logic

### Interest Calculation

The system uses the Interest Calculator Service to calculate:

- **Early Payment Interest**: Applied if paid within early payment period
- **Normal Interest**: Standard interest rate
- **Late Penalty**: Additional penalty for overdue payments

Formula:
```
Interest = Principal × (Rate / 100) × (Days / 30)
Total = Principal + Interest + Admin Fee
```

### SPK Lifecycle

```
Draft → Active → Extended/Redeemed/Auctioned
```

1. **Draft**: SPK created but not confirmed
2. **Active**: SPK confirmed and active
3. **Extended**: Pawn period extended with interest payment
4. **Redeemed**: Items redeemed, SPK closed
5. **Auctioned**: Items sent to auction due to non-payment

### Number Generation

**Internal SPK Number**: `[TypeCode][8-digit sequence]`
- Example: `GOLD00000123`

**Customer SPK Number**: `YYYYMMDD[4 random digits]`
- Example: `202402031234`

## Service Methods

### `create(createDto: CreateSpkDto, createdBy: string): Promise<SpkDto>`

Creates a new SPK record with items.

**Validations**:
- Customer must exist and be active
- Branch must exist and be active
- Principal amount must be positive
- Items must be provided

### `confirm(id: string, dto: ConfirmSpkDto): Promise<SpkDto>`

Confirms a draft SPK with customer PIN verification.

**Process**:
1. Validate customer PIN
2. Update status to Active
3. Set confirmation timestamp
4. Generate customer SPK number

### `extend(id: string, dto: ExtendSpkDto, createdBy: string): Promise<{ nkbNumber: string }>`

Extends the SPK period.

**Process**:
1. Validate SPK is active
2. Calculate extension interest
3. Create NKB record for interest payment
4. Update due date
5. Update status to Extended

### `redeem(id: string, amountPaid: number, createdBy: string): Promise<{ nkbNumber: string }>`

Redeems the pawned items.

**Process**:
1. Validate SPK is active or extended
2. Calculate total amount due (principal + interest + penalties)
3. Validate payment amount
4. Create NKB record for redemption
5. Update status to Redeemed
6. Update remaining balance to 0

## DTOs

### CreateSpkDto

```typescript
{
  customerId: string;
  storeId: string;
  principalAmount: number;
  tenor: number;
  items: CreateSpkItemDto[];
}
```

### ConfirmSpkDto

```typescript
{
  customerPin: string;
}
```

### ExtendSpkDto

```typescript
{
  extensionDays: number;
  interestPayment: number;
}
```

### RedeemSpkDto

```typescript
{
  amountPaid: number;
}
```

### SpkDto

```typescript
{
  id: string;
  spkNumber: string;
  internalSpkNumber: string;
  customerSpkNumber: string;
  customer: CustomerDto;
  store: BranchDto;
  principalAmount: number;
  tenor: number;
  interestRate: number;
  adminFee: number;
  totalAmount: number;
  remainingBalance: number;
  dueDate: Date;
  status: SpkStatusEnum;
  items: SpkItemDto[];
  confirmedAt?: Date;
}
```

## Related Modules

- **Customer Module**: Customer management
- **Branch Module**: Branch/store management
- **Company Module**: Company configuration (interest rates, fees)
- **NKB Module**: Transaction records (extensions, redemptions)
- **Item Type Module**: Item type master data
- **Auction Module**: Auction management for unredeemed items

## Error Handling

| Error | Status | Description |
|-------|--------|-------------|
| SPK_NOT_FOUND | 404 | SPK record not found |
| INVALID_STATUS | 400 | Invalid SPK status for operation |
| INVALID_PIN | 401 | Invalid customer PIN |
| INSUFFICIENT_PAYMENT | 400 | Payment amount insufficient |
| ALREADY_CONFIRMED | 400 | SPK already confirmed |
| CUSTOMER_INACTIVE | 400 | Customer is inactive |

## Configuration

SPK configuration is managed at the company level:

```typescript
{
  earlyInterestRate: 1.5,      // % per month
  normalInterestRate: 2.0,     // % per month
  adminFeeRate: 0.5,           // % of principal
  insuranceFee: 10000,         // Fixed amount
  latePenaltyRate: 0.1,        // % per day
  minPrincipalPayment: 50000,  // Minimum principal
  defaultTenorDays: 30,        // Default tenor
  earlyPaymentDays: 7          // Early payment period
}
```

## Best Practices

1. **Always validate customer PIN** before confirming SPK
2. **Calculate interest accurately** using the Interest Calculator Service
3. **Create NKB records** for all financial transactions
4. **Update remaining balance** after each payment
5. **Check SPK status** before performing operations
6. **Log all SPK operations** in audit trail
7. **Validate payment amounts** against calculated totals

## Future Enhancements

- [ ] Partial redemption support
- [ ] Multiple extension periods
- [ ] Automatic auction scheduling for overdue SPKs
- [ ] SMS/email notifications for due dates
- [ ] Payment installment plans
- [ ] Digital signature for SPK confirmation
