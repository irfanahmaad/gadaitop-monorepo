# Database Schema Reference - Gadaitop CMS

**Version:** 2.1
**Last Updated:** 2026-01-19
**Purpose:** Complete database schema for backend implementation (updated to match actual implementation and address critical gaps)

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Base Entity Structure](#base-entity-structure)
3. [Core Tables](#core-tables)
4. [Organization Tables](#organization-tables)
5. [Master Data Tables](#master-data-tables)
6. [Transaction Tables](#transaction-tables)
7. [Inventory & Auction Tables](#inventory--auction-tables)
8. [System Tables](#system-tables)
9. [Indexes & Performance](#indexes--performance)
10. [Relationships Diagram](#relationships-diagram)

---

## Schema Overview

### Database Engine
- **Recommended:** PostgreSQL 14+ (TypeORM with PostgreSQL)
- **Character Set:** UTF-8
- **Collation:** en_US.UTF-8

### Naming Conventions
- **Tables:** snake_case, plural (e.g., `users`, `companies`, `branches`)
- **Columns:** camelCase in entities, snake_case in database (TypeORM handles conversion)
- **Primary Keys:** `id` (BIGINT, AUTO_INCREMENT) + `uuid` (UUID, unique)
- **Foreign Keys:** `{table}_id` or `{table}Id` (UUID references)
- **Timestamps:** `created_at`, `updated_at`, `deleted_at` (with timezone)

### Base Entity Pattern
Most entities extend `AbstractEntity` which provides:
- `id` (BIGINT, auto-increment)
- `uuid` (UUID, unique, generated)
- `created_at`, `updated_at`, `deleted_at` (timestamps with timezone)
- `version` (optimistic locking)
- `created_by`, `updated_by`, `deleted_by` (audit fields, UUID references)

---

## Base Entity Structure

### AbstractEntity Fields
All entities extending `AbstractEntity` include these base fields:

```sql
-- Base fields in AbstractEntity (inherited by most tables)
id BIGINT PRIMARY KEY AUTO_INCREMENT,
uuid UUID UNIQUE NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP WITH TIME ZONE NULL,
version INTEGER DEFAULT 0,  -- Optimistic locking
created_by UUID NULL,        -- References users.uuid
updated_by UUID NULL,         -- References users.uuid
deleted_by UUID NULL         -- References users.uuid
```

**Note:** `audit_logs` table does NOT extend AbstractEntity (audit logs should never be soft-deleted).

---

## Core Tables

### 1. users
**Purpose:** All system users (Super Admin, Admin PT, Store Staff, etc.)
**Note:** Uses many-to-many relationship with `roles` table (not a single role enum)

```sql
CREATE TABLE users (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    -- Basic Info
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Hashed with bcrypt
    phone_number VARCHAR(20) NULL,

    -- Multi-tenancy: Company & Branch Assignment
    company_id UUID NULL,              -- For Admin PT, Staff assigned to company
    branch_id UUID NULL,              -- For Staff Toko, Stock Opname staff
    owned_company_id UUID UNIQUE NULL, -- For owner role (1:1 with companies)

    -- Status & Security
    active_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login_ip INET NULL,
    last_login_at TIMESTAMP WITH TIME ZONE NULL,
    failed_login_attempts SMALLINT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE NULL,

    -- Email Verification
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    validate_email_token VARCHAR(255) NULL,
    validate_email_expires TIMESTAMP WITH TIME ZONE NULL,

    -- Password Reset
    reset_password_token VARCHAR(255) NULL,
    reset_password_expires TIMESTAMP WITH TIME ZONE NULL,

    -- JWT Tokens (excluded from serialization)
    access_token TEXT NULL,
    refresh_token TEXT NULL,

    -- Legacy Fields
    google_id VARCHAR(255) NULL,
    job_position VARCHAR(255) NULL,
    is_registration_complete BOOLEAN DEFAULT FALSE,
    is_administrator BOOLEAN DEFAULT FALSE,

    INDEX idx_email (email),
    INDEX idx_phone_number (phone_number),
    INDEX idx_company_id (company_id),
    INDEX idx_branch_id (branch_id),
    INDEX idx_owned_company_id (owned_company_id),
    INDEX idx_active_status (active_status),
    FOREIGN KEY (company_id) REFERENCES companies(uuid) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branches(uuid) ON DELETE SET NULL,
    FOREIGN KEY (owned_company_id) REFERENCES companies(uuid) ON DELETE SET NULL
);

-- Many-to-Many relationship with roles
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

### 2. roles
**Purpose:** System roles and permissions (many-to-many with users)

```sql
CREATE TABLE roles (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,  -- e.g., 'owner', 'company_admin', 'branch_staff'
    description TEXT NULL,
    permissions JSONB DEFAULT '[]',     -- Array of IAbility objects
    is_system_role BOOLEAN DEFAULT FALSE,  -- System roles cannot be deleted/modified
    is_active BOOLEAN DEFAULT TRUE,
    company_id UUID NULL,              -- NULL for system-wide roles, UUID for company-specific

    INDEX idx_code (code),
    INDEX idx_company_id (company_id),
    FOREIGN KEY (company_id) REFERENCES companies(uuid) ON DELETE CASCADE
);
```

### 3. customers
**Purpose:** Customer master data (pawn service users)
**Note:** Customers are separate from users - they authenticate via Customer Portal (NIK+PIN or Email+Password), not the admin system

```sql
CREATE TABLE customers (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    nik VARCHAR(20) UNIQUE NOT NULL,        -- National ID Number
    pin_hash VARCHAR(255) NOT NULL,         -- Hashed PIN for portal login (NIK+PIN auth)
    password_hash VARCHAR(255) NULL,        -- Hashed password for Email+Password auth (optional)
    name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,                      -- Date of Birth
    gender ENUM('male', 'female') NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,            -- Required for Email+Password login
    ktp_photo_url VARCHAR(500),             -- Scanned KTP image
    selfie_photo_url VARCHAR(500),          -- Customer selfie for verification
    pt_id UUID NOT NULL,                    -- Belongs to which PT

    -- Blacklist Management (RS 8.3.a)
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklisted_at TIMESTAMP WITH TIME ZONE NULL,
    blacklisted_by UUID NULL,
    blacklist_reason TEXT NULL,
    unblacklisted_at TIMESTAMP WITH TIME ZONE NULL,
    unblacklisted_by UUID NULL,

    INDEX idx_nik (nik),
    INDEX idx_name (name),
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_pt_id (pt_id),
    INDEX idx_created_by (created_by),
    INDEX idx_is_blacklisted (is_blacklisted),
    FOREIGN KEY (pt_id) REFERENCES companies(uuid) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (blacklisted_by) REFERENCES users(uuid) ON DELETE SET NULL,
    FOREIGN KEY (unblacklisted_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 3a. customer_pin_history
**Purpose:** Audit trail for customer PIN changes (RS 8.3.b - PIN change history/audit)

```sql
CREATE TABLE customer_pin_history (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    customer_id UUID NOT NULL,
    old_pin_hash VARCHAR(255) NULL,        -- NULL for initial PIN creation
    new_pin_hash VARCHAR(255) NOT NULL,
    changed_by UUID NULL,                   -- NULL if customer self-service
    change_reason VARCHAR(255) NULL,         -- e.g., 'admin_reset', 'customer_request', 'initial_setup'
    ip_address INET NULL,
    user_agent TEXT NULL,

    INDEX idx_customer_id (customer_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (customer_id) REFERENCES customers(uuid) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

---

## Organization Tables

### 4. companies (PT)
**Purpose:** PT (Perusahaan/Company) master data
**Note:** 1:1 relationship with owner (UserEntity)

```sql
CREATE TABLE companies (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    -- Basic Info
    company_code VARCHAR(10) UNIQUE NOT NULL,  -- e.g., "PT001"
    company_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NULL,
    address TEXT NULL,

    -- Owner Relationship (1:1)
    owner_id UUID UNIQUE NOT NULL,  -- References users.uuid

    -- Interest & Fee Configuration (RS Section 9: Configurable via UI)
    early_interest_rate DECIMAL(5,2) DEFAULT 5.0,      -- x = bunga cepat (default 5%)
    normal_interest_rate DECIMAL(5,2) DEFAULT 10.0,   -- y = bunga normal (default 10%)
    admin_fee_rate DECIMAL(5,2) DEFAULT 0.0,          -- adm = biaya administrasi (default 0%)
    insurance_fee DECIMAL(15,2) DEFAULT 0.0,          -- as = biaya asuransi (default 0 IDR)
    late_penalty_rate DECIMAL(5,2) DEFAULT 2.0,       -- d = denda keterlambatan (default 2%)
    min_principal_payment DECIMAL(15,2) DEFAULT 50000.0, -- Minimal angsuran pokok (default Rp 50.000)
    default_tenor_days SMALLINT DEFAULT 30,           -- Tenor default (default 30 hari)
    early_payment_days SMALLINT DEFAULT 15,           -- Batas hari untuk bunga cepat (default 15 hari)

    -- Status
    active_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',

    INDEX idx_company_code (company_code),
    INDEX idx_company_name (company_name),
    INDEX idx_owner_id (owner_id),
    INDEX idx_active_status (active_status),
    FOREIGN KEY (owner_id) REFERENCES users(uuid) ON DELETE RESTRICT
);
```

### 5. branches (Toko/Stores)
**Purpose:** Store/branch master data under each PT
**Note:** Supports "Pinjam PT" feature (borrowed branches)

```sql
CREATE TABLE branches (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    -- Basic Info
    branch_code VARCHAR(20) UNIQUE NOT NULL,  -- kode lokasi (e.g., "TK001")
    short_name VARCHAR(50) NOT NULL,          -- nama toko (short version)
    full_name VARCHAR(255) NOT NULL,           -- nama toko (long version)
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,

    -- Company Relationship
    company_id UUID NOT NULL,  -- References companies.uuid

    -- Pinjam PT Feature (RS Section 8.1.d)
    is_borrowed BOOLEAN DEFAULT FALSE,       -- If true, branch belongs to actualOwner
    actual_owner_id UUID NULL,                 -- The actual owner (for borrowed branches)
    status ENUM('draft', 'pending_approval', 'active', 'inactive') DEFAULT 'draft',
    approved_by UUID NULL,                    -- Who approved the borrow request
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    rejection_reason TEXT NULL,

    -- Transaction Sequence
    transaction_sequence INTEGER DEFAULT 0,   -- For SPK number generation (8 digits)

    UNIQUE KEY unique_company_code (company_id, branch_code),
    INDEX idx_branch_code (branch_code),
    INDEX idx_company_id (company_id),
    INDEX idx_actual_owner_id (actual_owner_id),
    INDEX idx_status (status),
    FOREIGN KEY (company_id) REFERENCES companies(uuid) ON DELETE CASCADE,
    FOREIGN KEY (actual_owner_id) REFERENCES users(uuid) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 6. borrow_requests
**Purpose:** Track borrow requests between owners (Pinjam PT feature)

```sql
CREATE TABLE borrow_requests (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    branch_id UUID NOT NULL,              -- The branch being requested
    requester_id UUID NOT NULL,           -- The owner requesting to borrow
    target_company_id UUID NOT NULL,      -- The company being borrowed from
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    request_reason TEXT NULL,
    processed_by UUID NULL,                -- Who processed this request
    processed_at TIMESTAMP WITH TIME ZONE NULL,
    rejection_reason TEXT NULL,

    INDEX idx_branch_id (branch_id),
    INDEX idx_requester_id (requester_id),
    INDEX idx_target_company_id (target_company_id),
    INDEX idx_requester_status (requester_id, status),
    INDEX idx_target_company_status (target_company_id, status),
    FOREIGN KEY (branch_id) REFERENCES branches(uuid) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (target_company_id) REFERENCES companies(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (processed_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

---

## Master Data Tables

### 7. item_types
**Purpose:** Item categories (system-wide master data)
**Note:** Used for SPK internal format: [Tipe barang][kode urutan] e.g., H00000001

```sql
CREATE TABLE item_types (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    type_code VARCHAR(5) UNIQUE NOT NULL,   -- e.g., 'H' for Handphone, 'L' for Laptop
    type_name VARCHAR(100) NOT NULL,        -- e.g., 'Handphone', 'Laptop', 'Emas'
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order SMALLINT DEFAULT 0,          -- Sort order for display
    icon_url VARCHAR(500) NULL,             -- Icon or image URL (optional)

    INDEX idx_type_code (type_code)
);
```

### 8. catalogs
**Purpose:** Catalog/product master data (PT-specific)
**Note:** Current price stored here; historical prices tracked in `catalog_price_history` (RS 8.2.a)

```sql
CREATE TABLE catalogs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pt_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,              -- SKU or catalog code
    name VARCHAR(255) NOT NULL,
    item_type_id BIGINT NOT NULL,
    base_price DECIMAL(15,2) NOT NULL,
    pawn_value_min DECIMAL(15,2) NOT NULL,  -- Minimum loan value
    pawn_value_max DECIMAL(15,2) NOT NULL,  -- Maximum loan value
    tenor_options JSON,                     -- [30, 60, 90, 120] days
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    UNIQUE KEY unique_pt_code (pt_id, code),
    INDEX idx_pt_id (pt_id),
    INDEX idx_item_type_id (item_type_id),
    FOREIGN KEY (pt_id) REFERENCES companies(uuid) ON DELETE CASCADE,
    FOREIGN KEY (item_type_id) REFERENCES item_types(uuid) ON DELETE RESTRICT
);
```

### 8a. catalog_price_history
**Purpose:** Historical pricing records for catalogs (RS 8.2.a - keep old prices)

```sql
CREATE TABLE catalog_price_history (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    catalog_id UUID NOT NULL,
    base_price DECIMAL(15,2) NOT NULL,
    pawn_value_min DECIMAL(15,2) NOT NULL,
    pawn_value_max DECIMAL(15,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_until DATE NULL,              -- NULL if current price
    change_reason TEXT NULL,

    INDEX idx_catalog_id (catalog_id),
    INDEX idx_effective_from (effective_from),
    INDEX idx_effective_until (effective_until),
    FOREIGN KEY (catalog_id) REFERENCES catalogs(uuid) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 9. pawn_terms (Syarat Mata)
**Purpose:** Pawn lending terms and conditions

```sql
CREATE TABLE pawn_terms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pt_id BIGINT NOT NULL,
    item_type_id BIGINT NOT NULL,
    loan_limit_min DECIMAL(15,2) NOT NULL,
    loan_limit_max DECIMAL(15,2) NOT NULL,
    tenor_default INT NOT NULL,             -- Default tenor in days
    interest_rate DECIMAL(5,2) NOT NULL,    -- Percentage (e.g., 1.25%)
    admin_fee DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_pt_item_type (pt_id, item_type_id),
    INDEX idx_pt_id (pt_id),
    INDEX idx_item_type_id (item_type_id),
    FOREIGN KEY (pt_id) REFERENCES companies(uuid) ON DELETE CASCADE,
    FOREIGN KEY (item_type_id) REFERENCES item_types(uuid) ON DELETE RESTRICT
);
```

---

## Transaction Tables

### 10. spk_records (SPK - Pawn Contracts)
**Purpose:** Surat Perjanjian Kredit (Loan/Pawn Agreement)
**Note:** SPK numbers have two formats: internal (for system) and customer-facing (for display)

```sql
CREATE TABLE spk_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    spk_number VARCHAR(50) UNIQUE NOT NULL,  -- Legacy field (kept for backward compatibility)
    internal_spk_number VARCHAR(20) UNIQUE NULL,  -- Format: [TypeCode][8-digit sequence] e.g., "H00000001" (RS 8.3.b)
    customer_spk_number VARCHAR(20) UNIQUE NULL,  -- Format: YYYYMMDD[4 random digits] e.g., "202401181234" (globally unique)
    customer_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    pt_id BIGINT NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL, -- Loan amount
    tenor INT NOT NULL,                      -- Tenor in days
    interest_rate DECIMAL(5,2) NOT NULL,     -- Interest rate %
    admin_fee DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) NOT NULL,     -- Principal + Interest + Fee
    remaining_balance DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('draft', 'active', 'extended', 'redeemed', 'overdue', 'auctioned', 'closed') DEFAULT 'draft',
    confirmed_at TIMESTAMP NULL,             -- When customer confirmed via PIN
    confirmed_by_pin BOOLEAN DEFAULT FALSE,
    created_by BIGINT NOT NULL,              -- Staff who created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    INDEX idx_spk_number (spk_number),
    INDEX idx_internal_spk_number (internal_spk_number),
    INDEX idx_customer_spk_number (customer_spk_number),
    INDEX idx_customer_id (customer_id),
    INDEX idx_store_id (store_id),
    INDEX idx_pt_id (pt_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (customer_id) REFERENCES customers(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (store_id) REFERENCES branches(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (pt_id) REFERENCES companies(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(uuid) ON DELETE RESTRICT
);
```

### 11. spk_items
**Purpose:** Items pledged in each SPK

```sql
CREATE TABLE spk_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    spk_id BIGINT NOT NULL,
    catalog_id BIGINT NULL,                 -- NULL if not from catalog
    item_type_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    appraised_value DECIMAL(15,2) NOT NULL,
    condition ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'good',
    weight DECIMAL(10,3),                   -- For gold items
    purity VARCHAR(20),                     -- e.g., "24K", "18K"
    evidence_photos JSON,                   -- Array of photo URLs
    storage_location VARCHAR(100),          -- Physical location in warehouse
    qr_code VARCHAR(100) UNIQUE,            -- Generated QR for tracking
    status ENUM('in_storage', 'in_auction', 'sold', 'returned') DEFAULT 'in_storage',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_spk_id (spk_id),
    INDEX idx_item_type_id (item_type_id),
    INDEX idx_qr_code (qr_code),
    INDEX idx_status (status),
    FOREIGN KEY (spk_id) REFERENCES spk_records(uuid) ON DELETE CASCADE,
    FOREIGN KEY (catalog_id) REFERENCES catalogs(uuid) ON DELETE SET NULL,
    FOREIGN KEY (item_type_id) REFERENCES item_types(uuid) ON DELETE RESTRICT
);
```

### 12. nkb_records (NKB - Payment Records)
**Purpose:** Nota Kredit Barang (Payment/Renewal/Redemption Records)
**Note:** Supports both staff-initiated and customer self-service payments (RS 8.3.d)

```sql
CREATE TABLE nkb_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nkb_number VARCHAR(50) UNIQUE NOT NULL,  -- Auto-generated
    spk_id BIGINT NOT NULL,
    amount_paid DECIMAL(15,2) NOT NULL,
    payment_type ENUM('renewal', 'partial', 'full_redemption') NOT NULL,
    payment_method ENUM('cash', 'transfer', 'qris', 'virtual_account') NOT NULL,
    payment_proof_url VARCHAR(500),          -- Receipt/proof image
    transaction_ref VARCHAR(100),            -- Bank/gateway reference
    status ENUM('pending', 'confirmed', 'rejected', 'failed') DEFAULT 'pending',
    notes TEXT,
    created_by BIGINT NULL,                  -- NULL if customer-initiated
    confirmed_by BIGINT NULL,                -- Staff who confirmed
    confirmed_at TIMESTAMP NULL,
    rejection_reason TEXT,
    
    -- Customer Self-Service Payment Fields (RS 8.3.d, FR-094 to FR-097)
    is_customer_initiated BOOLEAN DEFAULT FALSE,
    payment_gateway_provider VARCHAR(50) NULL,  -- e.g., 'midtrans', 'xendit'
    payment_gateway_order_id VARCHAR(100) NULL,
    payment_gateway_status VARCHAR(50) NULL,    -- e.g., 'pending', 'settled', 'expired'
    payment_gateway_callback_data JSONB NULL,  -- Store gateway response
    expires_at TIMESTAMP NULL,                  -- Payment expiration
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_nkb_number (nkb_number),
    INDEX idx_spk_id (spk_id),
    INDEX idx_status (status),
    INDEX idx_payment_type (payment_type),
    INDEX idx_created_at (created_at),
    INDEX idx_customer_initiated (is_customer_initiated),
    INDEX idx_payment_gateway_order_id (payment_gateway_order_id),
    FOREIGN KEY (spk_id) REFERENCES spk_records(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(uuid) ON DELETE SET NULL,
    FOREIGN KEY (confirmed_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 13. cash_deposits (Setor Uang)
**Purpose:** Store cash deposit transactions

```sql
CREATE TABLE cash_deposits (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    deposit_code VARCHAR(50) UNIQUE NOT NULL,
    store_id UUID NOT NULL,
    pt_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('bank_transfer', 'qris', 'virtual_account') NOT NULL,
    payment_channel VARCHAR(100),            -- Bank name or provider
    qr_code_url VARCHAR(500),                -- QR code for payment
    virtual_account VARCHAR(50),
    payment_proof_url VARCHAR(500),
    status ENUM('pending', 'paid', 'confirmed', 'rejected', 'expired') DEFAULT 'pending',
    requested_by UUID NOT NULL,
    approved_by UUID NULL,
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    notes TEXT,
    rejection_reason TEXT,

    INDEX idx_store_id (store_id),
    INDEX idx_pt_id (pt_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (store_id) REFERENCES branches(uuid) ON DELETE CASCADE,
    FOREIGN KEY (pt_id) REFERENCES companies(uuid) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 14. capital_topups (Tambah Modal)
**Purpose:** Store capital top-up requests

```sql
CREATE TABLE capital_topups (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    topup_code VARCHAR(50) UNIQUE NOT NULL,
    store_id UUID NOT NULL,
    pt_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'disbursed') DEFAULT 'pending',
    requested_by UUID NOT NULL,
    approved_by UUID NULL,
    approved_at TIMESTAMP WITH TIME ZONE NULL,
    disbursed_at TIMESTAMP WITH TIME ZONE NULL,
    disbursement_proof_url VARCHAR(500),
    notes TEXT,
    rejection_reason TEXT,

    INDEX idx_store_id (store_id),
    INDEX idx_pt_id (pt_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (store_id) REFERENCES branches(uuid) ON DELETE CASCADE,
    FOREIGN KEY (pt_id) REFERENCES companies(uuid) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 15. cash_mutations (Mutasi/Transaksi)
**Purpose:** Store cash flow tracking

```sql
CREATE TABLE cash_mutations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    store_id BIGINT NOT NULL,
    mutation_date DATE NOT NULL,
    mutation_type ENUM('debit', 'credit', 'adjustment') NOT NULL,
    category ENUM('spk_disbursement', 'nkb_payment', 'deposit', 'topup', 'expense', 'other') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),              -- e.g., "spk_record", "nkb_record"
    reference_id BIGINT,                     -- Foreign key to reference table
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_store_id (store_id),
    INDEX idx_mutation_date (mutation_date),
    INDEX idx_mutation_type (mutation_type),
    INDEX idx_category (category),
    INDEX idx_reference (reference_type, reference_id),
    FOREIGN KEY (store_id) REFERENCES branches(uuid) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(uuid) ON DELETE RESTRICT
);
```

---

## Inventory & Auction Tables

### 16. stock_opname_sessions
**Purpose:** Stock opname/inventory count sessions

```sql
CREATE TABLE stock_opname_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_code VARCHAR(50) UNIQUE NOT NULL,
    pt_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    status ENUM('draft', 'in_progress', 'completed', 'approved') DEFAULT 'draft',
    total_items_system INT DEFAULT 0,
    total_items_counted INT DEFAULT 0,
    variances_count INT DEFAULT 0,
    created_by BIGINT NOT NULL,
    approved_by BIGINT NULL,
    approved_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_pt_id (pt_id),
    INDEX idx_store_id (store_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    FOREIGN KEY (pt_id) REFERENCES companies(uuid) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES branches(uuid) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 17. stock_opname_items
**Purpose:** Individual item records in SO session

```sql
CREATE TABLE stock_opname_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    so_session_id BIGINT NOT NULL,
    spk_item_id BIGINT NOT NULL,
    system_quantity INT DEFAULT 1,
    counted_quantity INT NULL,
    variance INT GENERATED ALWAYS AS (counted_quantity - system_quantity) STORED,
    condition_before ENUM('excellent', 'good', 'fair', 'poor'),
    condition_after ENUM('excellent', 'good', 'fair', 'poor'),
    condition_notes TEXT,
    damage_photos JSON,                      -- Array of photo URLs
    counted_by BIGINT NULL,
    counted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_so_session_id (so_session_id),
    INDEX idx_spk_item_id (spk_item_id),
    INDEX idx_counted_by (counted_by),
    FOREIGN KEY (so_session_id) REFERENCES stock_opname_sessions(uuid) ON DELETE CASCADE,
    FOREIGN KEY (spk_item_id) REFERENCES spk_items(uuid) ON DELETE CASCADE,
    FOREIGN KEY (counted_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 17a. so_priority_rules (Mata Rules)
**Purpose:** Stock Opname priority rules configuration (RS 8.2.e - "Mata" priority criteria)
**Note:** Defines which items get priority in Stock Opname (marked as "Mata")

```sql
CREATE TABLE so_priority_rules (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    pt_id UUID NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_type ENUM('item_type', 'value_threshold', 'days_overdue', 'custom') NOT NULL,
    rule_config JSONB NOT NULL,              -- Flexible config per rule type
    priority_level SMALLINT NOT NULL,        -- 1 = highest priority
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT NULL,

    INDEX idx_pt_id (pt_id),
    INDEX idx_is_active (is_active),
    INDEX idx_priority_level (priority_level),
    FOREIGN KEY (pt_id) REFERENCES companies(uuid) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

**Example `rule_config` JSON:**
```json
// For item_type rule
{"item_type_codes": ["E", "G"]}  // Emas, Gold items

// For value_threshold rule
{"min_value": 10000000}  // Items worth > 10M IDR

// For days_overdue rule
{"min_days": 30}  // SPK overdue > 30 days
```

### 18. auction_batches
**Purpose:** Auction batch/lot groupings

```sql
CREATE TABLE auction_batches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    pt_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,              -- Store ID
    auction_date DATE NOT NULL,
    status ENUM('draft', 'scheduled', 'validated', 'in_progress', 'completed') DEFAULT 'draft',
    total_items INT DEFAULT 0,
    total_reserve_value DECIMAL(15,2) DEFAULT 0.00,
    total_realized_value DECIMAL(15,2) DEFAULT 0.00,
    created_by BIGINT NOT NULL,
    validated_by BIGINT NULL,
    validated_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_pt_id (pt_id),
    INDEX idx_branch_id (branch_id),
    INDEX idx_status (status),
    INDEX idx_auction_date (auction_date),
    FOREIGN KEY (pt_id) REFERENCES companies(uuid) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(uuid) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (validated_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 19. auction_items
**Purpose:** Items in auction batches

```sql
CREATE TABLE auction_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    batch_id BIGINT NOT NULL,
    spk_id BIGINT NOT NULL,
    spk_item_id BIGINT NOT NULL,
    reserve_price DECIMAL(15,2) NOT NULL,
    starting_price DECIMAL(15,2) NOT NULL,
    final_price DECIMAL(15,2) NULL,
    status ENUM('not_prepared', 'ready', 'in_auction', 'sold', 'unsold') DEFAULT 'not_prepared',
    marketing_notes TEXT,
    marketing_assets JSON,                   -- Array of image/video URLs
    validated_by BIGINT NULL,
    validated_at TIMESTAMP NULL,
    sold_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_batch_id (batch_id),
    INDEX idx_spk_id (spk_id),
    INDEX idx_spk_item_id (spk_item_id),
    INDEX idx_status (status),
    FOREIGN KEY (batch_id) REFERENCES auction_batches(uuid) ON DELETE CASCADE,
    FOREIGN KEY (spk_id) REFERENCES spk_records(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (spk_item_id) REFERENCES spk_items(uuid) ON DELETE RESTRICT,
    FOREIGN KEY (validated_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

---

## System Tables

### 20. device_registrations
**Purpose:** Device/IP address registration for security (RS Section 9: IP address locking)

```sql
CREATE TABLE device_registrations (
    -- AbstractEntity fields
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    version INTEGER DEFAULT 0,
    created_by UUID NULL,
    updated_by UUID NULL,
    deleted_by UUID NULL,

    user_id UUID NOT NULL,
    ip_address INET NOT NULL,              -- IPv4 or IPv6
    device_name VARCHAR(100) NOT NULL,      -- Device identifier/name
    device_type VARCHAR(20) NULL,           -- desktop, laptop, mobile
    os_info VARCHAR(100) NULL,              -- Operating system info
    is_active BOOLEAN DEFAULT TRUE,
    registered_by UUID NULL,                -- Who registered/approved
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE NULL,
    last_ip_address INET NULL,

    UNIQUE KEY unique_user_ip (user_id, ip_address),
    INDEX idx_user_id (user_id),
    INDEX idx_ip_address (ip_address),
    FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE,
    FOREIGN KEY (registered_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 21. notifications
**Purpose:** User notifications

```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error', 'system') DEFAULT 'info',
    related_entity_type VARCHAR(50),         -- e.g., "spk_record", "nkb_record"
    related_entity_id BIGINT,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_read_at (read_at),
    INDEX idx_created_at (created_at),
    INDEX idx_related (related_entity_type, related_entity_id),
    FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);
```

### 22. audit_logs
**Purpose:** Comprehensive audit trail
**Note:** Does NOT extend AbstractEntity (audit logs should never be soft-deleted)

```sql
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid UUID UNIQUE NOT NULL,
    entity_name VARCHAR(100) NOT NULL,       -- Table/entity name
    entity_id UUID NOT NULL,                 -- UUID of the modified record
    action ENUM('create', 'update', 'delete', 'login', 'logout', 'password_change', 'status_change') NOT NULL,
    user_id UUID NULL,                       -- NULL for system actions
    old_values JSONB NULL,                  -- Old values before change
    new_values JSONB NULL,                   -- New values after change
    changed_fields JSONB NULL,               -- Array of changed field names
    ip_address INET NULL,
    user_agent TEXT NULL,
    metadata JSONB NULL,                     -- Additional context/metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_entity_name_id (entity_name, entity_id),
    INDEX idx_user_id_created_at (user_id, created_at),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE SET NULL
);
```

### 23. system_settings
**Purpose:** Application configuration

```sql
CREATE TABLE system_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pt_id BIGINT NULL,                       -- NULL for system-wide settings
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type ENUM('string', 'integer', 'float', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_by BIGINT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_pt_key (pt_id, setting_key),
    INDEX idx_setting_key (setting_key),
    FOREIGN KEY (pt_id) REFERENCES companies(uuid) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(uuid) ON DELETE SET NULL
);
```

---

## Indexes & Performance

### Critical Indexes
```sql
-- SPK Performance
CREATE INDEX idx_spk_customer_status ON spk_records(customer_id, status);
CREATE INDEX idx_spk_store_date ON spk_records(store_id, created_at);
CREATE INDEX idx_spk_due_status ON spk_records(due_date, status);

-- NKB Performance
CREATE INDEX idx_nkb_spk_date ON nkb_records(spk_id, created_at);
CREATE INDEX idx_nkb_status_date ON nkb_records(status, created_at);

-- Customer Search
CREATE FULLTEXT INDEX ft_customer_name ON customers(name);
CREATE FULLTEXT INDEX ft_customer_address ON customers(address);

-- Customer PIN History
CREATE INDEX idx_customer_pin_history_customer_created ON customer_pin_history(customer_id, created_at);

-- Catalog Price History
CREATE INDEX idx_catalog_price_history_catalog_effective ON catalog_price_history(catalog_id, effective_from, effective_until);

-- SPK Internal Format
CREATE INDEX idx_spk_internal_number ON spk_records(internal_spk_number);
CREATE INDEX idx_spk_customer_number ON spk_records(customer_spk_number);

-- Audit Log Partitioning (PostgreSQL)
CREATE INDEX idx_audit_created_month ON audit_logs(EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at));

-- Notification Performance
CREATE INDEX idx_notification_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
```

### Partitioning Recommendations
```sql
-- Partition audit_logs by month (PostgreSQL)
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Partition cash_mutations by quarter
CREATE TABLE cash_mutations_2024_q1 PARTITION OF cash_mutations
FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

---

## Relationships Diagram

```
┌─────────────────┐
│    companies    │ (PT)
│  (1:1 owner)    │
└────────┬────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         │              │              │              │
┌────────▼──────┐  ┌───▼──────┐  ┌───▼──────┐  ┌───▼──────────┐
│   branches    │  │  users   │  │ catalogs │  │ pawn_terms   │
│ (Toko/Stores) │  │          │  │          │  │ (Syarat Mata)│
└────────┬──────┘  └───┬──────┘  └──────────┘  └──────────────┘
         │             │
         │             ├──────────────┐
         │             │              │
         │      ┌──────▼──────┐  ┌─────▼──────────┐
         │      │ user_roles  │  │device_registr. │
         │      │  (M:N)      │  │                │
         │      └─────────────┘  └────────────────┘
         │
┌────────▼──────────┐
│  borrow_requests  │ (Pinjam PT)
└───────────────────┘

┌──────────────┐
│  customers   │
└──────┬───────┘
       │
       ├──────────────────┐
       │                  │
┌──────▼──────────┐  ┌───▼──────────────────┐
│customer_pin_hist│  │ spk_records          │
└─────────────────┘  └──────┬───────────────┘
                            │
                            ├───────────┬──────────────┬─────────────┐
                            │           │              │             │
                    ┌──────▼──────┐ ┌──▼──────┐  ┌────▼─────┐ ┌────▼────────┐
                    │ spk_items   │ │nkb_recs│  │cash_muts  │ │auction_items│
                    └─────────────┘ └─────────┘  └──────────┘ └─────────────┘

┌──────────────┐
│  catalogs    │
└──────┬───────┘
       │
┌──────▼──────────────────┐
│ catalog_price_history   │
└─────────────────────────┘

┌──────────────────┐
│ so_priority_rules│ (Mata Rules)
└──────────────────┘

┌──────────────┐
│ audit_logs   │ (Does NOT extend AbstractEntity)
└──────────────┘
```

### Key Relationships

1. **companies ↔ users (1:1)**: One owner per company (`owner_id` ↔ `owned_company_id`)
2. **companies ↔ branches (1:N)**: One company has many branches
3. **users ↔ roles (M:N)**: Many-to-many via `user_roles` junction table
4. **users ↔ companies**: Users can belong to a company (`company_id`) or own one (`owned_company_id`)
5. **users ↔ branches**: Branch-level users assigned via `branch_id`
6. **branches ↔ borrow_requests**: Track borrow requests for Pinjam PT feature
7. **users ↔ device_registrations (1:N)**: IP address locking per user
8. **customers ↔ customer_pin_history (1:N)**: PIN change audit trail
9. **customers ↔ users (N:1)**: Customers created by staff users (`created_by`, `blacklisted_by`)
10. **catalogs ↔ catalog_price_history (1:N)**: Historical pricing records
11. **companies ↔ so_priority_rules (1:N)**: Stock Opname priority rules per PT
12. **All entities extend AbstractEntity** (except `audit_logs`) with UUID, timestamps, and audit fields

### Important Notes

- **Customers vs Users**: Customers are separate from users - they authenticate via Customer Portal (NIK+PIN or Email+Password), not the admin system. Customers don't have roles.
- **SPK Numbers**: Two formats stored - `internal_spk_number` (H00000001) for system use and `customer_spk_number` (YYYYMMDD+4digits) for customer-facing display.
- **NKB Payments**: Can be initiated by staff (`is_customer_initiated = FALSE`) or customers via portal (`is_customer_initiated = TRUE`).
- **Customer Blacklist**: Prevents SPK creation for blacklisted customers. Tracked with audit fields.
- **Catalog Pricing**: Current price in `catalogs.base_price`, historical prices in `catalog_price_history`.
- **SO Priority Rules**: Configurable rules determine which items get "Mata" priority in Stock Opname.

---

**End of Database Schema Reference**
