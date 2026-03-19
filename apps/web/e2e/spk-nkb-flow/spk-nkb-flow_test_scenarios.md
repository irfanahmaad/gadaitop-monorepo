# SPK & NKB Flows — Test Scenarios Summary

Summary of test scenarios and case IDs for **SPK (Surat Perintah Kerja)** and **NKB (Nota Kredit Barang)** flows.

**Project:** Digitalisasi Gadai Top Indonesia
**Module:** SPK & NKB (Pawn Agreement & Payment System)

---

## Scenario Overview

| Feature | Scenario ID | Test Scenario | Case IDs |
|---------|-------------|---------------|---------|
| Authentication | Admin Authentication | As a Staff/Company Admin, I want to log in using email and password so that I can access the dashboard | TC-AUTH-001 to TC-AUTH-003 |
| Authentication | Customer Authentication | As a Customer, I want to log in using NIK and PIN so that I can access the customer portal | TC-AUTH-004 to TC-AUTH-005 |
| SPK Management | SPK List & Filtering | As a Staff, I want to view and filter SPK list so that I can manage pawn agreements | TC-SPK-001 to TC-SPK-005 |
| SPK Management | SPK Creation | As a Staff, I want to create new SPK so that I can process pawn transactions | TC-SPK-006 to TC-SPK-010 |
| SPK Management | SPK Detail View | As a Staff, I want to view SPK details with NKB history so that I can see transaction history | TC-SPK-011 to TC-SPK-013 |
| Customer Portal | Customer SPK List | As a Customer, I want to view my active SPKs so that I can manage my pawn transactions | TC-CUST-001 to TC-CUST-003 |
| NKB - Pelunasan | Full Redemption Flow | As a Customer, I want to pay full redemption so that I can reclaim my item | TC-NKB-P01 to TC-NKB-P06 |
| NKB - Perpanjangan Tepat Waktu | On-time Extension Flow | As a Customer, I want to extend on-time so that I can extend my pawn period | TC-NKB-E01 to TC-NKB-E08 |
| NKB - Perpanjangan Terlambat | Late Extension Flow | As a Customer, I want to extend when late so that I can pay penalties and extend | TC-NKB-L01 to TC-NKB-L06 |
| NKB Admin | NKB Approval Workflow | As a Staff, I want to approve/reject NKB so that I can confirm payments | TC-NKB-A01 to TC-NKB-A04 |
| Access Control | Role-Based Access | Verify different roles have appropriate access levels | TC-ACCESS-001 to TC-ACCESS-003 |

---

## By Feature

### Authentication (5 cases)

- **TC-AUTH-001** — Staff can login with valid credentials (Positive, High)
- **TC-AUTH-002** — Company Admin can login with valid credentials (Positive, High)
- **TC-AUTH-003** — Login fails with invalid credentials (Negative, High)
- **TC-AUTH-004** — Customer can login with NIK + PIN (Positive, High)
- **TC-AUTH-005** — Customer login fails with invalid NIK/PIN (Negative, High)

### SPK Management (13 cases)

- **TC-SPK-001** — SPK list page loads successfully (Positive, High)
- **TC-SPK-002** — SPK list displays with correct columns (Positive, High)
- **TC-SPK-003** — Search filters SPK list by customer name/NIK (Positive, High)
- **TC-SPK-004** — Branch filter works correctly (Positive, Medium)
- **TC-SPK-005** — Date range filter works correctly (Positive, Medium)
- **TC-SPK-006** — SPK create page opens with required fields (Positive, High)
- **TC-SPK-007** — Create SPK with valid customer and item data (Positive, High)
- **TC-SPK-008** — Create SPK fails for blacklist customer (Negative, High)
- **TC-SPK-009** — Loan amount cannot exceed catalog price (Negative, High)
- **TC-SPK-010** — SPK number generated in correct format (Positive, Medium)
- **TC-SPK-011** — SPK detail page shows customer and item information (Positive, High)
- **TC-SPK-012** — SPK detail shows NKB history table (Positive, High)
- **TC-SPK-013** — QR Code can be generated (one-time print) (Positive, Medium)

### Customer Portal (3 cases)

- **TC-CUST-001** — Customer portal shows active SPK list (Positive, High)
- **TC-CUST-002** — SPK status badges display correctly (Positive, High)
- **TC-CUST-003** — Payment buttons visible based on SPK status (Positive, High)

### NKB - Pelunasan / Full Redemption (6 cases)

- **TC-NKB-P01** — Customer can initiate full redemption via portal (Positive, High)
- **TC-NKB-P02** — Calculation correct for <15 days (5% interest) (Positive, High)
- **TC-NKB-P03** — Calculation correct for >15 days (10% interest) (Positive, High)
- **TC-NKB-P04** — Staff can confirm cash payment (Positive, High)
- **TC-NKB-P05** — SPK status changes to "Lunas" after payment (Positive, High)
- **TC-NKB-P06** — NKB number format is correct (Positive, Medium)

### NKB - Perpanjangan Tepat Waktu / On-time Extension (8 cases)

- **TC-NKB-E01** — Customer can initiate on-time extension (<15 days before due) (Positive, High)
- **TC-NKB-E02** — Calculation: (Pokok x 10%) + admin + insurance (Positive, High)
- **TC-NKB-E03** — Can enter partial principal payment (Positive, High)
- **TC-NKB-E04** — Minimum principal Rp50.000 validation works (Positive, High)
- **TC-NKB-E05** — Due date extends: old + 30 days (Positive, High)
- **TC-NKB-E06** — SPK status remains "Berjalan" after extension (Positive, High)
- **TC-NKB-E07** — Next cycle interest based on previous principal (Positive, High)
- **TC-NKB-E08** — Payment method selection works (Cash/Transfer) (Positive, Medium)

### NKB - Perpanjangan Terlambat / Late Extension (6 cases)

- **TC-NKB-L01** — Customer can initiate late extension (>due date) (Positive, High)
- **TC-NKB-L02** — Penalty calculated: 2% per month late (Positive, High)
- **TC-NKB-L03** — Penalty correct for multiple months late (Positive, High)
- **TC-NKB-L04** — Due date: old + 30 days (not from pay date) (Positive, High)
- **TC-NKB-L05** — SPK status returns to "Berjalan" after payment (Positive, High)
- **TC-NKB-L06** — Total includes: interest + admin + insurance + penalty (Positive, High)

### NKB Admin Approval (4 cases)

- **TC-NKB-A01** — Staff can view pending NKB in "NKB Baru" tab (Positive, High)
- **TC-NKB-A02** — Staff can approve pending NKB (Positive, High)
- **TC-NKB-A03** — Staff can reject NKB with reason (Positive, High)
- **TC-NKB-A04** — Approved NKB moves to History tab (Positive, High)

### Access Control (3 cases)

- **TC-ACCESS-001** — Staff can only see their branch SPKs (Positive, High)
- **TC-ACCESS-002** — Company Admin can see all branches (Positive, High)
- **TC-ACCESS-003** — Customer only sees their own SPKs (Positive, High)

---

## Total Count

| Feature | Number of Cases |
|---------|-----------------|
| Authentication | 5 |
| SPK Management | 13 |
| Customer Portal | 3 |
| NKB - Pelunasan | 6 |
| NKB - Perpanjangan Tepat Waktu | 8 |
| NKB - Perpanjangan Terlambat | 6 |
| NKB Admin Approval | 4 |
| Access Control | 3 |
| **Total** | **48** |

---

*For full steps, test data, and expected results, see `spk-nkb-flow_test_cases.md`.*
