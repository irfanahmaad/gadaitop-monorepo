# PT Gadai Top Indonesia
## Super Admin Master Data - ERD & TypeORM Entities

**Version:** 1.0  
**Date:** January 2026  
**Module:** Super Admin CMS - Master Data

---

## 📊 Entity Relationship Diagram

```mermaid
---
title: PT Gadai Top Indonesia - Super Admin Master Data ERD
---

erDiagram
    %% ============================================
    %% CORE ENTITIES
    %% ============================================

    users {
        int id PK
        uuid uuid UK "Generated UUID"
        varchar fullName
        varchar email UK
        varchar password "Hashed bcrypt"
        varchar phoneNumber
        uuid companyId FK "Assigned company"
        uuid branchId FK "Assigned branch"
        uuid ownedCompanyId FK_UK "For owner role 1-1"
        enum activeStatus "active|inactive|suspended"
        inet lastLoginIp
        timestamptz lastLoginAt
        smallint failedLoginAttempts
        timestamptz lockedUntil
        boolean isEmailVerified
        boolean isPhoneVerified
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt "Soft delete"
        int version "Optimistic lock"
    }

    roles {
        int id PK
        uuid uuid UK
        varchar name
        varchar code UK "owner|company_admin|branch_staff|stock_auditor|auction_staff|marketing"
        text description
        jsonb permissions "IAbility array"
        boolean isSystemRole
        boolean isActive
        uuid companyId FK "NULL for system roles"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    user_roles {
        int id PK
        int user_id FK
        int role_id FK
        timestamptz createdAt
    }

    companies {
        int id PK
        uuid uuid UK
        varchar companyCode UK
        varchar companyName
        varchar phoneNumber
        text address
        uuid ownerId FK_UK "1-1 with owner user"
        decimal earlyInterestRate "x persen default 5"
        decimal normalInterestRate "y persen default 10"
        decimal adminFeeRate "adm persen default 0"
        decimal insuranceFee "as Rp default 0"
        decimal latePenaltyRate "d persen default 2"
        decimal minPrincipalPayment "Min Rp50000"
        smallint defaultTenorDays "Default 30"
        smallint earlyPaymentDays "Default 15"
        enum activeStatus "active|inactive|suspended"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    branches {
        int id PK
        uuid uuid UK
        varchar branchCode UK "Kode lokasi"
        varchar shortName "Nama toko short"
        varchar fullName "Nama toko long"
        text address
        varchar phone
        varchar city
        uuid companyId FK
        boolean isBorrowed "Pinjam PT flag"
        uuid actualOwnerId FK "Real owner if borrowed"
        enum status "draft|pending_approval|active|inactive"
        uuid approvedBy FK
        timestamptz approvedAt
        text rejectionReason
        int transactionSequence "8 digit counter"
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    item_types {
        int id PK
        uuid uuid UK
        varchar typeCode UK "H L E etc"
        varchar typeName "Handphone Laptop Emas"
        text description
        boolean isActive
        smallint sortOrder
        varchar iconUrl
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    device_registrations {
        int id PK
        uuid uuid UK
        uuid userId FK
        varchar macAddress "MAC format"
        varchar deviceName
        varchar deviceType "desktop|laptop|mobile"
        varchar osInfo
        boolean isActive
        uuid registeredBy FK
        timestamptz registeredAt
        timestamptz lastUsedAt
        inet lastIpAddress
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    audit_logs {
        int id PK
        uuid uuid
        varchar entityName "Table name"
        uuid entityId "Record UUID"
        enum action "create|update|delete|login|logout"
        uuid userId FK
        jsonb oldValues "Previous state"
        jsonb newValues "New state"
        jsonb changedFields "Field names"
        inet ipAddress
        text userAgent
        jsonb metadata
        timestamptz createdAt
    }

    borrow_requests {
        int id PK
        uuid uuid UK
        uuid branchId FK
        uuid requesterId FK "Owner requesting"
        uuid targetCompanyId FK "PT being borrowed"
        enum status "pending|approved|rejected"
        text requestReason
        uuid processedBy FK
        timestamptz processedAt
        text rejectionReason
        timestamptz createdAt
        timestamptz updatedAt
        timestamptz deletedAt
    }

    %% ============================================
    %% RELATIONSHIPS
    %% ============================================

    users ||--o{ user_roles : "has"
    roles ||--o{ user_roles : "assigned to"
    users |o--|| companies : "owns 1-1"
    users }o--o| companies : "assigned to"
    users }o--o| branches : "works at"
    companies ||--o{ branches : "has"
    branches }o--o| users : "actual owner"
    branches }o--o| users : "approved by"
    users ||--o{ device_registrations : "has devices"
    users ||--o{ audit_logs : "performed"
    roles }o--o| companies : "custom for"
    borrow_requests }o--|| branches : "for branch"
    borrow_requests }o--|| users : "requested by"
    borrow_requests }o--|| companies : "target company"
    borrow_requests }o--o| users : "processed by"
```

---

## 📋 Entity Descriptions

### 1. Users (users)

**Purpose:** Master Super Admin (pemilik) dan semua user sistem  
**RS Reference:** Section 8.1.a, 8.1.e

| Field | Type | Description |
|-------|------|-------------|
| `uuid` | UUID | Primary identifier for API |
| `fullName` | VARCHAR(255) | Nama lengkap user |
| `email` | VARCHAR(255) | Email (unique, untuk login) |
| `password` | VARCHAR(255) | Password hashed dengan bcrypt |
| `phoneNumber` | VARCHAR(20) | Nomor telepon |
| `companyId` | UUID | FK ke company (untuk staff) |
| `branchId` | UUID | FK ke branch (untuk staff toko) |
| `ownedCompanyId` | UUID | FK ke company yang dimiliki (1:1, untuk owner) |
| `activeStatus` | ENUM | Status: active, inactive, suspended |

**Relationships:**
- Many-to-Many dengan `roles` via `user_roles`
- One-to-One dengan `companies` (sebagai owner)
- Many-to-One dengan `companies` (sebagai staff)
- Many-to-One dengan `branches` (sebagai staff toko)
- One-to-Many dengan `device_registrations`

---

### 2. Roles (roles)

**Purpose:** System roles untuk RBAC  
**RS Reference:** Section 8.1.e

| Role Code | Nama | Akses |
|-----------|------|-------|
| `owner` | Pemilik/Super Admin | Akses penuh ke semua data PT dan toko miliknya |
| `company_admin` | Admin PT | Melihat dan mengubah semua data toko di bawah PT |
| `branch_staff` | Staff Toko | Operasional harian di toko tertentu |
| `stock_auditor` | Stock Opname | Akses fitur stock opname |
| `auction_staff` | Lelang | Akses fitur pengambilan barang lelang |
| `marketing` | Marketing | Akses fitur validator barang lelang |

**Permission Structure (JSONB):**
```typescript
interface IAbility {
  action: string;      // 'create' | 'read' | 'update' | 'delete' | 'manage'
  subject: string;     // Entity name: 'Loan', 'Payment', 'Customer', etc.
  condition?: object;  // Row-level filter: { companyId: '${user.companyId}' }
}
```

---

### 3. Companies (companies)

**Purpose:** Master PT  
**RS Reference:** Section 8.1.b

| Field | Type | Description |
|-------|------|-------------|
| `companyCode` | VARCHAR(10) | Kode unik PT |
| `companyName` | VARCHAR(255) | Nama PT |
| `phoneNumber` | VARCHAR(20) | Nomor telepon PT |
| `ownerId` | UUID | FK ke user owner (1:1) |

**Interest & Fee Configuration (RS Section 9):**

| Field | Default | Description |
|-------|---------|-------------|
| `earlyInterestRate` | 5% | Bunga cepat (< 15 hari) |
| `normalInterestRate` | 10% | Bunga normal (≤ 1 bulan) |
| `adminFeeRate` | 0% | Biaya administrasi |
| `insuranceFee` | Rp 0 | Biaya asuransi |
| `latePenaltyRate` | 2% | Denda keterlambatan |
| `minPrincipalPayment` | Rp 50.000 | Minimal angsuran pokok |
| `defaultTenorDays` | 30 | Tenor default (hari) |
| `earlyPaymentDays` | 15 | Batas hari bunga cepat |

---

### 4. Branches (branches)

**Purpose:** Master Toko  
**RS Reference:** Section 8.1.c, 8.1.d

| Field | Type | Description |
|-------|------|-------------|
| `branchCode` | VARCHAR(20) | Kode lokasi (unique) |
| `shortName` | VARCHAR(50) | Nama toko (short version) |
| `fullName` | VARCHAR(255) | Nama toko (long version) |
| `address` | TEXT | Alamat lengkap |
| `phone` | VARCHAR(20) | Nomor telepon |
| `city` | VARCHAR(100) | Kota |
| `companyId` | UUID | FK ke PT |
| `transactionSequence` | INT | Counter untuk nomor SPK (8 digit) |

**Pinjam PT Feature (RS Section 8.1.d):**

| Field | Type | Description |
|-------|------|-------------|
| `isBorrowed` | BOOLEAN | Flag jika toko dipinjam |
| `actualOwnerId` | UUID | Pemilik sebenarnya jika borrowed |
| `status` | ENUM | draft → pending_approval → active |
| `approvedBy` | UUID | User yang approve pinjam PT |
| `approvedAt` | TIMESTAMP | Waktu approval |
| `rejectionReason` | TEXT | Alasan penolakan |

**Business Rules:**
1. Toko harus dimiliki oleh sebuah PT
2. Data toko hanya dapat dilihat oleh pemilik PT atau actualOwner
3. Toko borrowed perlu approval dari pemilik PT yang dipinjam
4. `transactionSequence` auto-increment per toko untuk SPK

---

### 5. Item Types (item_types)

**Purpose:** Master Tipe Barang  
**RS Reference:** Section 8.1.f

| Field | Type | Description |
|-------|------|-------------|
| `typeCode` | VARCHAR(5) | Kode tipe (H, L, E, dll) |
| `typeName` | VARCHAR(100) | Nama tipe barang |
| `description` | TEXT | Deskripsi |
| `sortOrder` | SMALLINT | Urutan tampilan |

**Examples:**

| Code | Name | Description |
|------|------|-------------|
| H | Handphone | Smartphone, feature phone |
| L | Laptop | Notebook, MacBook |
| E | Emas | Perhiasan, logam mulia |
| T | Tablet | iPad, Android tablet |
| K | Kamera | DSLR, Mirrorless |

**Usage in SPK:**
- Internal SPK format: `[TypeCode][8-digit sequence]`
- Example: `H00000001` (Handphone pertama di toko)

---

### 6. Device Registrations (device_registrations)

**Purpose:** MAC Address Locking  
**RS Reference:** Section 9 (Non-Functional Requirements)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | UUID | FK ke user |
| `macAddress` | VARCHAR(17) | Format: XX:XX:XX:XX:XX:XX |
| `deviceName` | VARCHAR(100) | Nama device (user-friendly) |
| `deviceType` | VARCHAR(20) | desktop, laptop, mobile |
| `osInfo` | VARCHAR(100) | Info OS |
| `isActive` | BOOLEAN | Device aktif/diblokir |
| `lastUsedAt` | TIMESTAMP | Terakhir digunakan |

**Business Rules:**
1. User hanya bisa login dari device yang terdaftar
2. Admin dapat meregistrasi/deaktivasi device
3. Unique constraint: userId + macAddress

---

### 7. Audit Logs (audit_logs)

**Purpose:** Audit Trail  
**RS Reference:** Section 4 Business Objectives

| Field | Type | Description |
|-------|------|-------------|
| `entityName` | VARCHAR(100) | Nama tabel yang diubah |
| `entityId` | UUID | UUID record yang diubah |
| `action` | ENUM | create, update, delete, login, logout |
| `userId` | UUID | User yang melakukan aksi |
| `oldValues` | JSONB | Nilai sebelum perubahan |
| `newValues` | JSONB | Nilai setelah perubahan |
| `changedFields` | JSONB | List field yang berubah |
| `ipAddress` | INET | IP address |
| `userAgent` | TEXT | Browser/client info |

**Example Log Entry:**
```json
{
  "entityName": "companies",
  "entityId": "550e8400-e29b-41d4-a716-446655440000",
  "action": "update",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "oldValues": {
    "normalInterestRate": 10.00,
    "latePenaltyRate": 2.00
  },
  "newValues": {
    "normalInterestRate": 12.00,
    "latePenaltyRate": 3.00
  },
  "changedFields": ["normalInterestRate", "latePenaltyRate"],
  "ipAddress": "192.168.1.100",
  "createdAt": "2026-01-17T10:30:00Z"
}
```

---

### 8. Borrow Requests (borrow_requests)

**Purpose:** Tracking Pinjam PT requests  
**RS Reference:** Section 8.1.d

| Status | Description |
|--------|-------------|
| `pending` | Menunggu approval dari pemilik PT |
| `approved` | Disetujui, toko aktif |
| `rejected` | Ditolak dengan alasan |

**Workflow:**
1. Owner A creates branch under Owner B's PT → status: pending
2. Owner B receives notification
3. Owner B approves/rejects
4. If approved → branch.status = active, branch.isBorrowed = true

---

## 🔗 Key Relationships Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     RELATIONSHIP MATRIX                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  users ──────────────── 1:1 ────────────────► companies         │
│    │                   (owner)                    │              │
│    │                                              │              │
│    ├──── M:N ────► roles                          │              │
│    │              (via user_roles)                │              │
│    │                                              │              │
│    ├──── M:1 ────► companies (staff assignment)   │              │
│    │                                              │              │
│    ├──── M:1 ────► branches (staff assignment)    │              │
│    │                                              ▼              │
│    │                                          branches ◄── 1:N ──┤
│    │                                              │              │
│    └──── 1:M ────► device_registrations          │              │
│                                                   │              │
│  branches.actualOwnerId ───► users (Pinjam PT)   │              │
│                                                   │              │
│  audit_logs.userId ────────► users               │              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/
├── common/
│   └── abstract.entity.ts          # Base entity
├── constants/
│   └── enums.ts                    # All enums
├── modules/
│   ├── user/
│   │   └── entities/
│   │       └── user.entity.ts
│   ├── role/
│   │   └── entities/
│   │       └── role.entity.ts
│   ├── company/
│   │   └── entities/
│   │       └── company.entity.ts
│   ├── branch/
│   │   └── entities/
│   │       ├── branch.entity.ts
│   │       └── borrow-request.entity.ts
│   ├── item-type/
│   │   └── entities/
│   │       └── item-type.entity.ts
│   ├── device/
│   │   └── entities/
│   │       └── device-registration.entity.ts
│   └── audit/
│       └── entities/
│           └── audit-log.entity.ts
└── database/
    ├── migrations/
    └── seeds/
        └── role.seeder.ts
```

---

## ✅ Requirements Checklist

| RS Section | Requirement | Status |
|------------|-------------|--------|
| 8.1.a | Master Super Admin (pemilik) | ✅ UserEntity with owner role |
| 8.1.b | Master PT (1:1 with pemilik) | ✅ CompanyEntity with ownerId |
| 8.1.c | Master Toko | ✅ BranchEntity |
| 8.1.d | Pinjam PT | ✅ Branch.isBorrowed + BorrowRequestEntity |
| 8.1.e | Master User (5 roles) | ✅ RoleEntity + user_roles |
| 8.1.f | Master Tipe Barang | ✅ ItemTypeEntity |
| 9 | Enkripsi PIN & data sensitif | ✅ bcrypt password |
| 9 | Role-based access | ✅ CASL permissions in roles |
| 9 | MAC address locking | ✅ DeviceRegistrationEntity |
| 9 | Audit trail (user, waktu, nilai lama/baru) | ✅ AuditLogEntity |
| 9 | Konfigurasi bunga/denda via UI | ✅ Company interest config fields |
| 10 | Tidak boleh hard delete | ✅ deletedAt soft delete |


/**
 * ============================================================================
 * PT GADAI TOP INDONESIA - SUPER ADMIN MASTER DATA ENTITIES
 * ============================================================================
 * 
 * Module: Super Admin CMS - Master Data
 * 
 * Entities covered:
 * 1. AbstractEntity (Base)
 * 2. UserEntity (Pemilik/Super Admin + All Users)
 * 3. RoleEntity (System Roles)
 * 4. CompanyEntity (Master PT)
 * 5. BranchEntity (Master Toko)
 * 6. ItemTypeEntity (Master Tipe Barang)
 * 7. DeviceRegistrationEntity (MAC Address Locking)
 * 8. AuditLogEntity (Audit Trail)
 * 
 * Requirements Reference:
 * - RS Section 8.1: Super Admin (a-f)
 * - RS Section 9: Non-Functional Requirements (Security, Audit Trail)
 */

import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

// ============================================================================
// ENUMS
// ============================================================================

export enum ActiveStatusEnum {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}

export enum BranchStatusEnum {
  Draft = 'draft',
  PendingApproval = 'pending_approval', // For "Pinjam PT" approval
  Active = 'active',
  Inactive = 'inactive',
}

export enum BorrowRequestStatusEnum {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum AuditActionEnum {
  Create = 'create',
  Update = 'update',
  Delete = 'delete', // Soft delete
  Login = 'login',
  Logout = 'logout',
  PasswordChange = 'password_change',
  StatusChange = 'status_change',
}

// ============================================================================
// 1. ABSTRACT ENTITY (BASE)
// ============================================================================

@Entity()
export abstract class AbstractEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', generated: 'uuid', unique: true })
  @Index()
  uuid: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Soft delete - RS: "Tidak boleh ada hard delete"
  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt: Date | null;

  // Optimistic locking
  @VersionColumn()
  version: number;

  // Audit fields
  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string | null;

  @Column({ type: 'uuid', nullable: true })
  deletedBy: string | null;
}

// ============================================================================
// 2. ROLE ENTITY
// ============================================================================

/**
 * System Roles as defined in RS Section 8.1.e:
 * 1. owner (Pemilik/Super Admin)
 * 2. company_admin (Admin PT)
 * 3. branch_staff (Staff Toko)
 * 4. stock_auditor (Stock Opname)
 * 5. auction_staff (Lelang)
 * 6. marketing (Marketing/Validator)
 */

export interface IAbility {
  action: string;
  subject: string;
  condition?: Record<string, unknown>;
}

@Entity({ name: 'roles' })
export class RoleEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: [] })
  permissions: IAbility[];

  // System roles cannot be deleted or modified by users
  @Column({ type: 'boolean', default: false })
  isSystemRole: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Optional: Company-specific custom roles
  @Column({ type: 'uuid', nullable: true })
  @Index()
  companyId: string | null;

  @ManyToOne(() => CompanyEntity, { nullable: true })
  @JoinColumn({ name: 'companyId', referencedColumnName: 'uuid' })
  company: Relation<CompanyEntity> | null;

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: Relation<UserEntity[]>;

  // Helper methods
  hasPermission(action: string, subject: string): boolean {
    return this.permissions.some(
      (p) => p.action === action && p.subject === subject,
    );
  }
}

// ============================================================================
// 3. USER ENTITY (Pemilik/Super Admin + All Users)
// ============================================================================

/**
 * RS Section 8.1.a - Master Super Admin (pemilik):
 * - Data: Email, password, nama, nomor telepon
 * - Pemilik bertindak sebagai super admin dengan akses penuh
 * 
 * RS Section 8.1.e - Master User:
 * - Admin PT, Staff Toko, Stock Opname, Lelang, Marketing
 */

@Entity({ name: 'users' })
@Index(['email'])
@Index(['phoneNumber'])
export class UserEntity extends AbstractEntity {
  // ============================================
  // BASIC INFO - RS: "Data: Email, password, nama, nomor telepon"
  // ============================================

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;

  // ============================================
  // ROLES: Many-to-Many with RoleEntity
  // ============================================

  @ManyToMany(() => RoleEntity, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Relation<RoleEntity[]>;

  // ============================================
  // MULTI-TENANCY: Company & Branch Assignment
  // ============================================

  /**
   * For non-owner users: which company they belong to
   * Admin PT, Staff assigned to a company
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  companyId: string | null;

  @ManyToOne(() => CompanyEntity, { nullable: true })
  @JoinColumn({ name: 'companyId', referencedColumnName: 'uuid' })
  company: Relation<CompanyEntity> | null;

  /**
   * For branch-level users: which branch they're assigned to
   * Staff Toko, Stock Opname staff
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  branchId: string | null;

  @ManyToOne(() => BranchEntity, { nullable: true })
  @JoinColumn({ name: 'branchId', referencedColumnName: 'uuid' })
  branch: Relation<BranchEntity> | null;

  /**
   * For owner role: link to owned company (1:1 relationship)
   * RS: "PT berelasi dengan pemilik (one to one). 1 Pemilik hanya memiliki 1 PT"
   */
  @Column({ type: 'uuid', nullable: true, unique: true })
  ownedCompanyId: string | null;

  @OneToOne(() => CompanyEntity, (company) => company.owner, { nullable: true })
  @JoinColumn({ name: 'ownedCompanyId', referencedColumnName: 'uuid' })
  ownedCompany: Relation<CompanyEntity> | null;

  // ============================================
  // STATUS & SECURITY
  // ============================================

  @Column({
    type: 'enum',
    enum: ActiveStatusEnum,
    default: ActiveStatusEnum.Active,
  })
  @Index()
  activeStatus: ActiveStatusEnum;

  // RS Section 9: "Terdapat penguncian mac address"
  // Registered devices stored in separate table
  @OneToMany(() => DeviceRegistrationEntity, (device) => device.user)
  registeredDevices: Relation<DeviceRegistrationEntity[]>;

  @Column({ type: 'inet', nullable: true })
  lastLoginIp: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'smallint', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lockedUntil: Date | null;

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  validateEmailToken: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  validateEmailExpires: Date | null;

  // ============================================
  // PASSWORD RESET
  // ============================================

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  resetPasswordExpires: Date | null;

  // ============================================
  // TOKENS (JWT)
  // ============================================

  @Exclude()
  @Column({ type: 'text', nullable: true })
  accessToken: string | null;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (
      this.password &&
      this.password.length > 0 &&
      !this.password.match(/^\$2[ayb]\$.{56}$/)
    ) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  isLocked(): boolean {
    return this.lockedUntil !== null && this.lockedUntil > new Date();
  }

  hasRole(roleCode: string): boolean {
    return this.roles?.some((role) => role.code === roleCode) ?? false;
  }

  isOwner(): boolean {
    return this.hasRole('owner');
  }

  isCompanyAdmin(): boolean {
    return this.hasRole('company_admin');
  }

  getRoleCodes(): string[] {
    return (
      this.roles
        ?.map((role) => role.code)
        .filter((code): code is string => code !== null) ?? []
    );
  }

  getAllPermissions(): IAbility[] {
    if (!this.roles || this.roles.length === 0) {
      return [];
    }

    const allPermissions = this.roles.flatMap((role) => role.permissions || []);

    // Remove duplicates
    return allPermissions.filter(
      (permission, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            p.action === permission.action && p.subject === permission.subject,
        ),
    );
  }
}

// ============================================================================
// 4. COMPANY ENTITY (Master PT)
// ============================================================================

/**
 * RS Section 8.1.b - Master PT:
 * - PT sebagai induk data dari toko/cabang
 * - PT berelasi dengan pemilik (one to one). 1 Pemilik hanya memiliki 1 PT
 * - PT berelasi dengan toko (one to many). 1 PT dapat memiliki banyak toko
 * - Data: kode unik, nama, nomor telepon, pemilik
 * 
 * RS Section 9: "Konfigurasi bunga/denda via UI admin tanpa hardcode"
 */

@Entity({ name: 'companies' })
export class CompanyEntity extends AbstractEntity {
  // ============================================
  // BASIC INFO - RS: "Data: kode unik, nama, nomor telepon, pemilik"
  // ============================================

  @Column({ type: 'varchar', length: 10, unique: true })
  @Index()
  companyCode: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  companyName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  // ============================================
  // OWNER RELATIONSHIP (1:1)
  // RS: "1 Pemilik hanya memiliki 1 PT"
  // ============================================

  @Column({ type: 'uuid', unique: true })
  @Index()
  ownerId: string;

  @OneToOne(() => UserEntity, (user) => user.ownedCompany)
  @JoinColumn({ name: 'ownerId', referencedColumnName: 'uuid' })
  owner: Relation<UserEntity>;

  // ============================================
  // BRANCHES (1:N)
  // RS: "1 PT dapat memiliki banyak toko"
  // ============================================

  @OneToMany(() => BranchEntity, (branch) => branch.company)
  branches: Relation<BranchEntity[]>;

  // ============================================
  // INTEREST & FEE CONFIGURATION
  // RS Section 9: "Konfigurasi bunga/denda via UI admin tanpa hardcode"
  // ============================================

  /**
   * x = bunga cepat (default: 5%) - Pelunasan < 15 hari
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  earlyInterestRate: number;

  /**
   * y = bunga normal (default: 10%) - Pelunasan ≤ 1 bulan
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  normalInterestRate: number;

  /**
   * adm = biaya administrasi (default: 0%)
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  adminFeeRate: number;

  /**
   * as = biaya asuransi (default: 0 rupiah)
   */
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  insuranceFee: number;

  /**
   * d = denda keterlambatan (default: 2%)
   */
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 2.0 })
  latePenaltyRate: number;

  /**
   * Minimal angsuran pokok (default: Rp 50.000)
   */
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 50000.0 })
  minPrincipalPayment: number;

  /**
   * Tenor default (dalam hari) - default 30 hari (1 bulan)
   */
  @Column({ type: 'smallint', default: 30 })
  defaultTenorDays: number;

  /**
   * Batas hari untuk bunga cepat (default: 15 hari)
   */
  @Column({ type: 'smallint', default: 15 })
  earlyPaymentDays: number;

  // ============================================
  // STATUS
  // ============================================

  @Column({
    type: 'enum',
    enum: ActiveStatusEnum,
    default: ActiveStatusEnum.Active,
  })
  activeStatus: ActiveStatusEnum;

  // ============================================
  // USERS ASSIGNED TO THIS COMPANY
  // ============================================

  @OneToMany(() => UserEntity, (user) => user.company)
  users: Relation<UserEntity[]>;
}

// ============================================================================
// 5. BRANCH ENTITY (Master Toko)
// ============================================================================

/**
 * RS Section 8.1.c - Master Toko:
 * - Toko adalah unit yang menjadi tempat transaksi antara customer dengan PT
 * - Toko harus dimiliki oleh sebuah PT
 * - Data toko hanya dapat dilihat oleh pemilik PT yang memiliki relasi
 * - Data: kode lokasi, nama toko (short), nama toko (long), alamat, telepon, kota, kode PT, pemilik
 * 
 * RS Section 8.1.d - Pinjam PT:
 * - Pemilik dapat memiliki toko di bawah naungan PT pemilik lain
 * - Toko aktif setelah pemilik yang PT-nya dipinjam mengkonfirmasi
 */

@Entity({ name: 'branches' })
@Unique(['companyId', 'branchCode'])
export class BranchEntity extends AbstractEntity {
  // ============================================
  // BASIC INFO - RS: "Data: kode lokasi, nama toko (short/long), alamat, telepon, kota"
  // ============================================

  @Column({ type: 'varchar', length: 20, unique: true })
  @Index()
  branchCode: string; // kode lokasi

  @Column({ type: 'varchar', length: 50 })
  shortName: string; // nama toko (short version)

  @Column({ type: 'varchar', length: 255 })
  @Index()
  fullName: string; // nama toko (long version)

  @Column({ type: 'text' })
  address: string; // alamat

  @Column({ type: 'varchar', length: 20 })
  phone: string; // telepon

  @Column({ type: 'varchar', length: 100 })
  @Index()
  city: string; // kota

  // ============================================
  // COMPANY RELATIONSHIP - RS: "kode PT"
  // "Toko harus dimiliki oleh sebuah PT"
  // ============================================

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  @ManyToOne(() => CompanyEntity, (company) => company.branches)
  @JoinColumn({ name: 'companyId', referencedColumnName: 'uuid' })
  company: Relation<CompanyEntity>;

  // ============================================
  // PINJAM PT FEATURE - RS Section 8.1.d
  // "pemilik dapat memiliki toko di bawah naungan PT pemilik lain"
  // ============================================

  /**
   * If isBorrowed = true, this branch belongs to actualOwner
   * but operates under a different company's PT
   */
  @Column({ type: 'boolean', default: false })
  isBorrowed: boolean;

  /**
   * The actual owner of this branch (for "Pinjam PT" case)
   * NULL if branch is not borrowed
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  actualOwnerId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'actualOwnerId', referencedColumnName: 'uuid' })
  actualOwner: Relation<UserEntity> | null;

  /**
   * Approval status for borrowed branches
   */
  @Column({
    type: 'enum',
    enum: BranchStatusEnum,
    default: BranchStatusEnum.Draft,
  })
  @Index()
  status: BranchStatusEnum;

  /**
   * Who approved the borrow request (the PT owner being borrowed from)
   */
  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'approvedBy', referencedColumnName: 'uuid' })
  approver: Relation<UserEntity> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt: Date | null;

  /**
   * Rejection reason if borrow request was rejected
   */
  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  // ============================================
  // TRANSACTION SEQUENCE
  // RS: "kode urutan transaksi yang dimiliki tiap toko" (8 digits)
  // ============================================

  @Column({ type: 'int', default: 0 })
  transactionSequence: number;

  // ============================================
  // USERS ASSIGNED TO THIS BRANCH
  // ============================================

  @OneToMany(() => UserEntity, (user) => user.branch)
  users: Relation<UserEntity[]>;

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Get next transaction sequence number (8 digits padded)
   */
  getNextSequence(): string {
    return String(this.transactionSequence + 1).padStart(8, '0');
  }

  /**
   * Check if this branch is accessible by a user
   */
  isAccessibleBy(user: UserEntity): boolean {
    // Owner of the company
    if (user.ownedCompanyId === this.companyId) {
      return true;
    }

    // Actual owner (for borrowed branches)
    if (this.isBorrowed && this.actualOwnerId === user.uuid) {
      return true;
    }

    // Company admin
    if (user.companyId === this.companyId && user.isCompanyAdmin()) {
      return true;
    }

    // Staff assigned to this branch
    if (user.branchId === this.uuid) {
      return true;
    }

    return false;
  }
}

// ============================================================================
// 6. ITEM TYPE ENTITY (Master Tipe Barang)
// ============================================================================

/**
 * RS Section 8.1.f - Master Tipe Barang:
 * - Terdapat master tipe barang untuk membedakan barang yang digadai
 * - Data: nama tipe barang, kode tipe barang
 * 
 * Used for:
 * - SPK internal format: [Tipe barang][kode urutan] e.g., H00000001
 */

@Entity({ name: 'item_types' })
export class ItemTypeEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 5, unique: true })
  @Index()
  typeCode: string; // e.g., 'H' for Handphone, 'L' for Laptop

  @Column({ type: 'varchar', length: 100 })
  typeName: string; // e.g., 'Handphone', 'Laptop', 'Emas'

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Sort order for display
   */
  @Column({ type: 'smallint', default: 0 })
  sortOrder: number;

  /**
   * Icon or image URL (optional)
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  iconUrl: string | null;
}

// ============================================================================
// 7. DEVICE REGISTRATION ENTITY (MAC Address Locking)
// ============================================================================

/**
 * RS Section 9 - Non-Functional Requirements:
 * - "Terdapat penguncian mac address untuk menentukan pc atau laptop 
 *    mana saja yang dapat mengakses aplikasi atau VPN"
 */

@Entity({ name: 'device_registrations' })
@Unique(['userId', 'macAddress'])
export class DeviceRegistrationEntity extends AbstractEntity {
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.registeredDevices)
  @JoinColumn({ name: 'userId', referencedColumnName: 'uuid' })
  user: Relation<UserEntity>;

  /**
   * MAC Address format: XX:XX:XX:XX:XX:XX
   */
  @Column({ type: 'varchar', length: 17 })
  @Index()
  macAddress: string;

  /**
   * Device identifier/name for user reference
   */
  @Column({ type: 'varchar', length: 100 })
  deviceName: string;

  /**
   * Device type: desktop, laptop, mobile
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  deviceType: string | null;

  /**
   * Operating system info
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  osInfo: string | null;

  /**
   * Is this device currently active/allowed
   */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Who registered/approved this device
   */
  @Column({ type: 'uuid', nullable: true })
  registeredBy: string | null;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  registeredAt: Date;

  /**
   * Last time this device was used for login
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastUsedAt: Date | null;

  /**
   * Last IP address used with this device
   */
  @Column({ type: 'inet', nullable: true })
  lastIpAddress: string | null;
}

// ============================================================================
// 8. AUDIT LOG ENTITY (Audit Trail)
// ============================================================================

/**
 * RS Section 4 - Business Objectives:
 * - "Audit trail & keamanan data: Setiap perubahan data tercatat (user, waktu, nilai lama/baru)"
 */

@Entity({ name: 'audit_logs' })
@Index(['entityName', 'entityId'])
@Index(['userId', 'createdAt'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', generated: 'uuid' })
  @Index()
  uuid: string;

  /**
   * Entity/table name that was modified
   */
  @Column({ type: 'varchar', length: 100 })
  @Index()
  entityName: string;

  /**
   * Primary key (uuid) of the modified record
   */
  @Column({ type: 'uuid' })
  entityId: string;

  /**
   * Action performed
   */
  @Column({ type: 'enum', enum: AuditActionEnum })
  @Index()
  action: AuditActionEnum;

  /**
   * User who performed the action
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'userId', referencedColumnName: 'uuid' })
  user: Relation<UserEntity> | null;

  /**
   * Old values before change (JSONB)
   * RS: "nilai lama"
   */
  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, unknown> | null;

  /**
   * New values after change (JSONB)
   * RS: "nilai baru"
   */
  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, unknown> | null;

  /**
   * Changed fields list
   */
  @Column({ type: 'jsonb', nullable: true })
  changedFields: string[] | null;

  /**
   * IP address of the request
   */
  @Column({ type: 'inet', nullable: true })
  ipAddress: string | null;

  /**
   * User agent string
   */
  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  /**
   * Additional context/metadata
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  @Index()
  createdAt: Date;
}

// ============================================================================
// 9. BORROW REQUEST ENTITY (Pinjam PT Request Tracking)
// ============================================================================

/**
 * RS Section 8.1.d - Pinjam PT:
 * - Track borrow requests between owners
 * - Toko akan aktif setelah pemilik yang PT nya dipinjam mengkonfirmasi
 */

@Entity({ name: 'borrow_requests' })
@Index(['requesterId', 'status'])
@Index(['targetCompanyId', 'status'])
export class BorrowRequestEntity extends AbstractEntity {
  /**
   * The branch being requested to borrow
   */
  @Column({ type: 'uuid' })
  @Index()
  branchId: string;

  @ManyToOne(() => BranchEntity)
  @JoinColumn({ name: 'branchId', referencedColumnName: 'uuid' })
  branch: Relation<BranchEntity>;

  /**
   * The owner requesting to borrow
   */
  @Column({ type: 'uuid' })
  @Index()
  requesterId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'requesterId', referencedColumnName: 'uuid' })
  requester: Relation<UserEntity>;

  /**
   * The company being borrowed from
   */
  @Column({ type: 'uuid' })
  @Index()
  targetCompanyId: string;

  @ManyToOne(() => CompanyEntity)
  @JoinColumn({ name: 'targetCompanyId', referencedColumnName: 'uuid' })
  targetCompany: Relation<CompanyEntity>;

  /**
   * Request status
   */
  @Column({
    type: 'enum',
    enum: BorrowRequestStatusEnum,
    default: BorrowRequestStatusEnum.Pending,
  })
  @Index()
  status: BorrowRequestStatusEnum;

  /**
   * Reason for the request
   */
  @Column({ type: 'text', nullable: true })
  requestReason: string | null;

  /**
   * Who processed this request
   */
  @Column({ type: 'uuid', nullable: true })
  processedBy: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'processedBy', referencedColumnName: 'uuid' })
  processor: Relation<UserEntity> | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  processedAt: Date | null;

  /**
   * Reason for rejection (if rejected)
   */
  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;
}