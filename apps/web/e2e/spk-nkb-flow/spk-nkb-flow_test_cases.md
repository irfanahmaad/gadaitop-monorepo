# SPK & NKB Flows — Test Case Documentation

Test cases for **SPK (Surat Perintah Kerja)** and **NKB (Nota Kredit Barang)** flows in **Project: Digitalisasi Gadai Top Indonesia**.

---

## 1. Authentication

### Feature: Authentication

| Field | Content |
|--------|--------|
| **Feature** | Authentication |
| **Scenario ID** | Admin & Customer Authentication |
| **Test Scenario** | Users can log in to access their respective portals |

### Case 1.1 — Staff can login with valid credentials

| Field | Content |
|--------|--------|
| Case ID | TC-AUTH-001 |
| Test Case | Staff can login with valid email and password |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Staff account exists and is active |
| Process Steps | 1. Open login page<br>2. Enter staff email<br>3. Enter password<br>4. Click Masuk |
| Test Data | Email: staff.jkt001@test.com<br>Password: test123 |
| Expected Result | Staff is logged in and redirected to dashboard |

### Case 1.2 — Company Admin can login with valid credentials

| Field | Content |
|--------|--------|
| Case ID | TC-AUTH-002 |
| Test Case | Company Admin can login with valid email and password |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Company Admin account exists and is active |
| Process Steps | 1. Open login page<br>2. Enter admin email<br>3. Enter password<br>4. Click Masuk |
| Test Data | Email: admin.pt001@test.com<br>Password: test123 |
| Expected Result | Admin is logged in and redirected to dashboard |

### Case 1.3 — Customer can login with NIK + PIN

| Field | Content |
|--------|--------|
| Case ID | TC-AUTH-004 |
| Test Case | Customer can login to portal using NIK and PIN |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Customer exists with valid PIN |
| Process Steps | 1. Open customer portal URL<br>2. Enter NIK<br>3. Enter PIN<br>4. Click Masuk |
| Test Data | NIK: 3201010101010001<br>PIN: 111111 |
| Expected Result | Customer is logged in and redirected to portal home |

---

## 2. SPK Management

### Feature: SPK Management

| Field | Content |
|--------|--------|
| **Feature** | SPK Management |
| **Scenario ID** | SPK List & Management |
| **Test Scenario** | Staff can create, view, and manage SPK records |

### Case 2.1 — SPK list page loads successfully

| Field | Content |
|--------|--------|
| Case ID | TC-SPK-001 |
| Test Case | SPK list page loads successfully |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is logged in as Staff |
| Process Steps | 1. Navigate to /spk |
| Test Data | — |
| Expected Result | SPK list page loads; heading is visible; table displays |

### Case 2.2 — Create SPK with valid customer and item data

| Field | Content |
|--------|--------|
| Case ID | TC-SPK-007 |
| Test Case | Create new SPK with valid customer and item |
| Type | Positive |
| Priority | High |
| Pre-Conditions | User is logged in as Staff; Customer exists |
| Process Steps | 1. Click "Tambah Data"<br>2. Select customer by NIK<br>3. Fill item details (type, brand, model, condition)<br>4. Set loan amount<br>5. Submit and confirm |
| Test Data | Customer NIK: 3201010101010001<br>Item: HP Samsung A54<br>Loan: Rp 500.000 |
| Expected Result | SPK created successfully; SPK number generated; redirect to list/detail |

### Case 2.3 — Create SPK fails for blacklist customer

| Field | Content |
|--------|--------|
| Case ID | TC-SPK-008 |
| Test Case | Cannot create SPK for blacklisted customer |
| Type | Negative |
| Priority | High |
| Pre-Conditions | Customer is blacklisted |
| Process Steps | 1. Navigate to SPK create<br>2. Select blacklisted customer<br>3. Try to submit |
| Test Data | Customer NIK: 9999999999999999 (blacklist) |
| Expected Result | Error message displayed; SPK not created |

### Case 2.4 — SPK detail shows NKB history

| Field | Content |
|--------|--------|
| Case ID | TC-SPK-012 |
| Test Case | SPK detail page displays NKB payment history |
| Type | Positive |
| Priority | High |
| Pre-Conditions | SPK exists with NKB records |
| Process Steps | 1. From SPK list, click Detail on a row<br>2. Verify NKB history table |
| Test Data | — |
| Expected Result | NKB table displays with columns: No, NKB Number, Type, Date, Total, Status |

---

## 3. Customer Portal

### Feature: Customer Portal

| Field | Content |
|--------|--------|
| **Feature** | Customer Portal |
| **Scenario ID** | Customer Self-Service |
| **Test Scenario** | Customer can view their SPKs and make payments |

### Case 3.1 — Customer portal shows active SPK list

| Field | Content |
|--------|--------|
| Case ID | TC-CUST-001 |
| Test Case | Customer portal displays customer's active SPKs |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Customer is logged in; has active SPKs |
| Process Steps | 1. Login as customer<br>2. Navigate to portal home |
| Test Data | Customer NIK: 3201010101010001 |
| Expected Result | List of customer's SPKs displayed with status badges |

### Case 3.2 — Payment buttons visible based on SPK status

| Field | Content |
|--------|--------|
| Case ID | TC-CUST-003 |
| Test Case | Payment buttons show/hide based on SPK status |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Customer is logged in |
| Process Steps | 1. View SPK list<br>2. Check pay button visibility for each SPK |
| Test Data | — |
| Expected Result | Active SPKs show pay button; Paid SPKs don't |

---

## 4. NKB - Pelunasan (Full Redemption)

### Feature: NKB - Pelunasan

| Field | Content |
|--------|--------|
| **Feature** | NKB - Pelunasan |
| **Scenario ID** | Full Redemption Flow |
| **Test Scenario** | Customer can fully redeem their pawned item |

### Case 4.1 — Customer initiates full redemption

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-P01 |
| Test Case | Customer can click "Bayar Lunas" and see payment summary |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Customer logged in; has active SPK |
| Process Steps | 1. Click on SPK<br>2. Click "Bayar Lunas"<br>3. Verify payment dialog |
| Test Data | — |
| Expected Result | Payment dialog opens with total amount breakdown |

### Case 4.2 — Calculation: <15 days (5% interest)

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-P02 |
| Test Case | Interest is 5% for redemptions within 15 days |
| Type | Positive |
| Priority | High |
| Pre-Conditions | SPK created <15 days ago |
| Process Steps | 1. Initiate full redemption<br>2. Check interest calculation |
| Test Data | Principal: Rp 500.000<br>Days: 10<br>Expected Interest: Rp 25.000 (5%) |
| Expected Result | Total = Principal + 5% interest |

### Case 4.3 — SPK status changes to "Lunas"

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-P05 |
| Test Case | SPK status becomes "Lunas" after full payment |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Full payment completed |
| Process Steps | 1. Complete payment<br>2. Check SPK status |
| Test Data | — |
| Expected Result | SPK status = "Lunas" |

---

## 5. NKB - Perpanjangan Tepat Waktu (On-time Extension)

### Feature: NKB - Perpanjangan Tepat Waktu

| Field | Content |
|--------|--------|
| **Feature** | NKB - Perpanjangan Tepat Waktu |
| **Scenario ID** | On-time Extension Flow |
| **Test Scenario** | Customer can extend pawn period before due date |

### Case 5.1 — Customer initiates on-time extension

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-E01 |
| Test Case | Customer can extend before due date |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Customer logged in; SPK not yet due |
| Process Steps | 1. Click on SPK<br>2. Click "Bayar Cicil" or "Perpanjang"<br>3. Verify dialog |
| Test Data | — |
| Expected Result | Payment dialog opens for extension |

### Case 5.2 — Calculation: (Pokok x 10%) + admin + insurance

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-E02 |
| Test Case | Extension fee calculated correctly |
| Type | Positive |
| Priority | High |
| Pre-Conditions | SPK is active |
| Process Steps | 1. Initiate extension<br>2. Verify calculation |
| Test Data | Principal: Rp 500.000<br>Admin: Rp 5.000<br>Insurance: Rp 10.000<br>Interest (10%): Rp 50.000 |
| Expected Result | Total = Principal (partial) + Interest + Admin + Insurance |

### Case 5.3 — Due date extension: old + 30 days

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-E05 |
| Test Case | New due date = old due date + 30 days |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Extension completed |
| Process Steps | 1. Note original due date<br>2. Complete extension<br>3. Check new due date |
| Test Data | Original due date: 2025-04-01 |
| Expected Result | New due date: 2025-05-01 (+30 days) |

### Case 5.4 — SPK status remains "Berjalan"

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-E06 |
| Test Case | SPK status stays "Berjalan" after extension |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Extension completed |
| Process Steps | 1. Complete extension<br>2. Check SPK status |
| Test Data | — |
| Expected Result | SPK status = "Berjalan" |

---

## 6. NKB - Perpanjangan Terlambat (Late Extension)

### Feature: NKB - Perpanjangan Terlambat

| Field | Content |
|--------|--------|
| **Feature** | NKB - Perpanjangan Terlambat |
| **Scenario ID** | Late Extension Flow |
| **Test Scenario** | Customer can extend after due date with penalties |

### Case 6.1 — Customer initiates late extension

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-L01 |
| Test Case | Customer can extend after due date |
| Type | Positive |
| Priority | High |
| Pre-Conditions | SPK is past due date |
| Process Steps | 1. Click on overdue SPK<br>2. Click "Bayar" or "Perpanjang"<br>3. Verify dialog shows penalty |
| Test Data | — |
| Expected Result | Payment dialog opens with penalty calculated |

### Case 6.2 — Penalty: 2% per month late

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-L02 |
| Test Case | Penalty is 2% of principal per month |
| Type | Positive |
| Priority | High |
| Pre-Conditions | SPK is 1 month overdue |
| Process Steps | 1. Initiate late extension<br>2. Verify penalty calculation |
| Test Data | Principal: Rp 500.000<br>Months late: 1<br>Penalty: Rp 10.000 (2%) |
| Expected Result | Total includes penalty amount |

### Case 6.3 — Due date: old + 30 days

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-L04 |
| Test Case | New due date calculated from old due date, not payment date |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Late extension completed |
| Process Steps | 1. Note original due date<br>2. Complete late extension<br>3. Check new due date |
| Test Data | Original due: 2025-03-01<br>Payment date: 2025-04-15 |
| Expected Result | New due date: 2025-04-01 (old + 30, not from payment date) |

---

## 7. NKB Admin Approval

### Feature: NKB Admin Approval

| Field | Content |
|--------|--------|
| **Feature** | NKB Admin Approval |
| **Scenario ID** | NKB Approval Workflow |
| **Test Scenario** | Staff can approve/reject pending NKB payments |

### Case 7.1 — View pending NKB in "NKB Baru" tab

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-A01 |
| Test Case | Staff can see pending NKBs |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Staff logged in; pending NKBs exist |
| Process Steps | 1. Navigate to /nkb<br>2. Click "NKB Baru" tab |
| Test Data | — |
| Expected Result | List of pending NKBs displayed |

### Case 7.2 — Approve pending NKB

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-A02 |
| Test Case | Staff can approve pending NKB |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Pending NKB exists |
| Process Steps | 1. Click Detail on NKB row<br>2. Click Approve/Setuju<br>3. Confirm |
| Test Data | — |
| Expected Result | NKB status changes to "confirmed"; SPK balance updated |

### Case 7.3 — Approved NKB moves to History

| Field | Content |
|--------|--------|
| Case ID | TC-NKB-A04 |
| Test Case | Approved NKB appears in History tab |
| Type | Positive |
| Priority | High |
| Pre-Conditions | NKB was approved |
| Process Steps | 1. Navigate to /nkb<br>2. Click "History" tab |
| Test Data | — |
| Expected Result | Approved NKB visible in history |

---

## 8. Access Control

### Feature: Access Control

| Field | Content |
|--------|--------|
| **Feature** | Access Control |
| **Scenario ID** | Role-Based Access Control |
| **Test Scenario** | Users can only access data appropriate to their role |

### Case 8.1 — Staff can only see their branch SPKs

| Field | Content |
|--------|--------|
| Case ID | TC-ACCESS-001 |
| Test Case | Staff limited to their branch data |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Staff logged in (JKT001) |
| Process Steps | 1. Navigate to SPK list<br>2. Verify branch filter or data scope |
| Test Data | Staff: staff.jkt001@test.com (Branch: JKT001) |
| Expected Result | Only JKT001 SPKs displayed; branch filter disabled or preset |

### Case 8.2 — Company Admin can see all branches

| Field | Content |
|--------|--------|
| Case ID | TC-ACCESS-002 |
| Test Case | Company Admin has multi-branch access |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Company Admin logged in |
| Process Steps | 1. Navigate to SPK list<br>2. Verify branch filter available |
| Test Data | Admin: admin.pt001@test.com |
| Expected Result | Branch filter visible and functional; all branches accessible |

### Case 8.3 — Customer only sees their own SPKs

| Field | Content |
|--------|--------|
| Case ID | TC-ACCESS-003 |
| Test Case | Customer data isolation |
| Type | Positive |
| Priority | High |
| Pre-Conditions | Customer logged in |
| Process Steps | 1. Navigate to customer portal<br>2. Verify SPK list |
| Test Data | Customer NIK: 3201010101010001 |
| Expected Result | Only customer's own SPKs displayed |

---

*Document generated for Project: Digitalisasi Gadai Top Indonesia.*
