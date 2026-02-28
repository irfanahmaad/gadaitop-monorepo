# FR-040 SPK Index List (Admin PT)

## Feature Name
SPK Index – Pledge Transaction Overview

## Description
The **SPK** page displays a paginated table of SPK (Surat Perjanjian Kredit) records across stores. Admin PT can filter, search, and view SPK details and NKB payment history. Tabs include **SPK** (main list) and **NKB**.

## Actor
- Admin PT

## Priority
High

---

## Preconditions

1. User logged in as Admin PT.
2. SPK records exist from store transactions.

---

## Postconditions

1. Filters update SPK list.
2. Detail shows SPK and NKB information.

---

## FR‑040.1 View SPK List

### Description
Main table of SPK records with filtering.

### UI & Interaction Requirements

#### Page Header & Tabs
- Title: **"GADAI TOP SPK"**.
- Tabs: **SPK** (active) | **NKB**.

#### Toolbar
- **Rows per page**: 10/25/50/100.
- Search input.
- **Filter** → filter panel.

#### SPK Table
- Label: **"Daftar SPK"**.
- Columns:
  1. **User** – avatar + name.
  2. **No SPK** – SPK ID (clickable).
  3. **Customer** – customer name.
  4. **Barang** – item.
  5. **Tipe** – type.
  6. **Toko** – store.
  7. **Status** – badge (Lunas, Berjalan, Jatuh Tempo).
  8. **Action** – three-dot: **Detail**.

#### Filter Panel
- **Mulai Dari** | **Sampai Dengan** – date.
- **Toko** – dropdown.
- **Status** – multi-select.
- Buttons: **Tutup** | **Reset** | **Terapkan**.

#### Pagination & States
- Standard.

### Data & Behaviour Requirements
- SPK scoped to PT stores.
- Status: Lunas/Berjalan/Jatuh Tempo.

### Security & Business Rules
- PT data only.

### Acceptance Criteria
- Table matches Figma columns.

---

## FR‑040.2 SPK Detail View

### Description
Single SPK information.

### UI & Interaction Requirements

- From **No SPK** click → **"Detail Customer [Name]"**.
- Sections:
  - **Detail Customer**: name, info.
  - **Detail SPK**: No SPK, barang, tipe, toko, status.
- Buttons: **Tutup**.

### Data & Behaviour Requirements
- Full SPK data.

### Acceptance Criteria
- Modal shows customer/SPK details.

---

## FR‑040.3 NKB Tab List

### Description
NKB (payment) table under SPK page.

### UI & Interaction Requirements

- Tab **NKB** → table:
  1. **No NKB**.
  2. **Tanggal**.
  3. **Jenis** (Pelunasan/Perpanjangan).
  4. **Nominal**.
  5. **Status**.
- Same filter/search/pagination.

### Data & Behaviour Requirements
- Linked NKB per SPK/customer.

### Acceptance Criteria
- NKB table matches design.

---

## FR‑040.4 Filter SPK/NKB

### Description
Unified filtering.

### UI & Interaction Requirements
- Panel works across tabs.

### Data & Behaviour Requirements
- Tab-specific data.

### Acceptance Criteria
- Filters apply correctly.
  