# PT Gadai Top Indonesia
## User Stories - Super Admin Master Data Module

**Version:** 1.0  
**Date:** January 2026  
**Module:** Super Admin CMS - Master Data  
**RS Reference:** Section 8.1 (a-f), Section 9

---

## 📋 Story Format

```
AS A [role]
I WANT TO [action]
SO THAT [benefit]

Acceptance Criteria:
- [ ] Given/When/Then scenarios
```

**Priority Legend:**
- 🔴 P0 - Critical (Must have for MVP)
- 🟠 P1 - High (Important for launch)
- 🟡 P2 - Medium (Nice to have)
- 🟢 P3 - Low (Future enhancement)

---

# EPIC 1: Authentication & Security

## US-1.1: User Login 🔴 P0

**AS A** registered user (any role)  
**I WANT TO** login to the system using my email and password  
**SO THAT** I can access features according to my role

### Acceptance Criteria:

- [ ] **AC-1.1.1:** Given valid email and password, when I submit login form, then I receive JWT access token and refresh token
- [ ] **AC-1.1.2:** Given invalid credentials, when I submit login form, then I see error message "Email atau password salah"
- [ ] **AC-1.1.3:** Given 5 failed login attempts, when I try again, then my account is locked for 30 minutes
- [ ] **AC-1.1.4:** Given locked account, when I try to login, then I see message "Akun terkunci. Coba lagi dalam X menit"
- [ ] **AC-1.1.5:** Given inactive/suspended account, when I login, then I see appropriate error message
- [ ] **AC-1.1.6:** Given successful login, then system records lastLoginAt and lastLoginIp

### Technical Notes:
- Password hashed with bcrypt (12 rounds)
- JWT expiry: access token 15min, refresh token 7 days
- Rate limiting: 10 requests/minute per IP

---

## US-1.2: MAC Address Verification 🔴 P0

**AS A** system administrator  
**I WANT TO** restrict application access to registered devices only  
**SO THAT** unauthorized devices cannot access the system

### Acceptance Criteria:

- [ ] **AC-1.2.1:** Given user with no registered devices, when they try to login, then access is denied with message "Perangkat belum terdaftar"
- [ ] **AC-1.2.2:** Given user with registered device, when they login from that device, then access is granted
- [ ] **AC-1.2.3:** Given user tries to login from unregistered MAC address, when login attempted, then access is denied
- [ ] **AC-1.2.4:** Given successful login from registered device, then system updates lastUsedAt timestamp

### Technical Notes:
- MAC address format: XX:XX:XX:XX:XX:XX
- Client app must send MAC address in request header
- Unique constraint: one MAC address per user

---

## US-1.3: Device Registration 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** register devices for my users  
**SO THAT** they can access the system from approved devices

### Acceptance Criteria:

- [ ] **AC-1.3.1:** Given I am logged in as Super Admin, when I navigate to user management, then I can see list of registered devices for each user
- [ ] **AC-1.3.2:** Given user details page, when I click "Tambah Perangkat", then I can enter MAC address, device name, and device type
- [ ] **AC-1.3.3:** Given valid MAC address format, when I submit, then device is registered and active
- [ ] **AC-1.3.4:** Given invalid MAC address format, when I submit, then I see validation error
- [ ] **AC-1.3.5:** Given duplicate MAC address for same user, when I submit, then I see error "MAC address sudah terdaftar"
- [ ] **AC-1.3.6:** Given registered device, when I click "Nonaktifkan", then device isActive becomes false
- [ ] **AC-1.3.7:** Given inactive device, when user tries to login, then access is denied

### API Endpoints:
```
POST   /api/v1/users/{userId}/devices
GET    /api/v1/users/{userId}/devices
PATCH  /api/v1/users/{userId}/devices/{deviceId}
DELETE /api/v1/users/{userId}/devices/{deviceId}
```

---

## US-1.4: Password Reset 🟠 P1

**AS A** registered user  
**I WANT TO** reset my password via email  
**SO THAT** I can regain access if I forget my password

### Acceptance Criteria:

- [ ] **AC-1.4.1:** Given valid email, when I request password reset, then I receive email with reset link
- [ ] **AC-1.4.2:** Given reset link, when I click within 1 hour, then I can set new password
- [ ] **AC-1.4.3:** Given expired reset link (>1 hour), when I click, then I see error "Link sudah kadaluarsa"
- [ ] **AC-1.4.4:** Given new password set, when I login, then reset token is invalidated
- [ ] **AC-1.4.5:** Given password change, then audit log records the action

---

## US-1.5: Session Management 🟠 P1

**AS A** logged in user  
**I WANT TO** have my session managed securely  
**SO THAT** my account remains protected

### Acceptance Criteria:

- [ ] **AC-1.5.1:** Given expired access token, when I make request with valid refresh token, then I receive new access token
- [ ] **AC-1.5.2:** Given expired refresh token, when I make request, then I am redirected to login
- [ ] **AC-1.5.3:** Given I click logout, when confirmed, then both tokens are invalidated
- [ ] **AC-1.5.4:** Given 30 minutes of inactivity, when I try to perform action, then I am prompted to re-authenticate

---

# EPIC 2: Master Super Admin (Pemilik)

## US-2.1: View Owner Profile 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** view my profile information  
**SO THAT** I can verify my account details

### Acceptance Criteria:

- [ ] **AC-2.1.1:** Given I am logged in as Pemilik, when I navigate to profile, then I see: nama, email, nomor telepon
- [ ] **AC-2.1.2:** Given profile page, then I see my owned PT information
- [ ] **AC-2.1.3:** Given profile page, then I see count of toko under my PT

---

## US-2.2: Update Owner Profile 🟠 P1

**AS A** Super Admin (Pemilik)  
**I WANT TO** update my profile information  
**SO THAT** my contact details remain current

### Acceptance Criteria:

- [ ] **AC-2.2.1:** Given profile edit mode, when I update nama, then changes are saved
- [ ] **AC-2.2.2:** Given profile edit mode, when I update nomor telepon with valid format, then changes are saved
- [ ] **AC-2.2.3:** Given email change attempt, then system requires email verification
- [ ] **AC-2.2.4:** Given any profile update, then audit log records old and new values

---

## US-2.3: Change Password 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** change my password  
**SO THAT** I can maintain account security

### Acceptance Criteria:

- [ ] **AC-2.3.1:** Given password change form, when I enter current password incorrectly, then I see error
- [ ] **AC-2.3.2:** Given valid current password, when new password meets requirements (min 8 chars, 1 uppercase, 1 number), then password is updated
- [ ] **AC-2.3.3:** Given password changed, then all existing sessions are invalidated
- [ ] **AC-2.3.4:** Given password changed, then audit log records the action (without password values)

---

# EPIC 3: Master PT (Company)

## US-3.1: View PT Details 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** view my PT (company) details  
**SO THAT** I can see all company information

### Acceptance Criteria:

- [ ] **AC-3.1.1:** Given I am logged in as Pemilik, when I navigate to Master PT, then I see: kode PT, nama PT, nomor telepon, alamat
- [ ] **AC-3.1.2:** Given PT details page, then I see list of all toko under this PT
- [ ] **AC-3.1.3:** Given PT details page, then I see interest/fee configuration (bunga cepat, bunga normal, adm, asuransi, denda)
- [ ] **AC-3.1.4:** Given PT details page, then I see count statistics: total toko, total user, total SPK aktif

---

## US-3.2: Update PT Information 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** update my PT information  
**SO THAT** company details remain accurate

### Acceptance Criteria:

- [ ] **AC-3.2.1:** Given PT edit mode, when I update nama PT, then changes are saved
- [ ] **AC-3.2.2:** Given PT edit mode, when I update nomor telepon, then changes are saved
- [ ] **AC-3.2.3:** Given PT edit mode, when I update alamat, then changes are saved
- [ ] **AC-3.2.4:** Given kode PT field, then it is read-only (cannot be changed)
- [ ] **AC-3.2.5:** Given any update, then audit log records changes

---

## US-3.3: Configure Interest & Fees 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** configure interest rates and fees for my PT  
**SO THAT** loan calculations use correct values

### Acceptance Criteria:

- [ ] **AC-3.3.1:** Given configuration page, when I update bunga cepat (x%), then value is saved (range: 0-100%)
- [ ] **AC-3.3.2:** Given configuration page, when I update bunga normal (y%), then value is saved (range: 0-100%)
- [ ] **AC-3.3.3:** Given configuration page, when I update biaya administrasi (adm%), then value is saved
- [ ] **AC-3.3.4:** Given configuration page, when I update biaya asuransi (Rp), then value is saved
- [ ] **AC-3.3.5:** Given configuration page, when I update denda keterlambatan (d%), then value is saved
- [ ] **AC-3.3.6:** Given configuration page, when I update minimal angsuran pokok, then value is saved (default: Rp 50.000)
- [ ] **AC-3.3.7:** Given configuration page, when I update tenor default (hari), then value is saved (default: 30)
- [ ] **AC-3.3.8:** Given configuration page, when I update batas hari bunga cepat, then value is saved (default: 15)
- [ ] **AC-3.3.9:** Given any configuration change, then audit log records old and new values
- [ ] **AC-3.3.10:** Given configuration change, then existing SPK are NOT affected (only new SPK use new config)

### Business Rules:
```
Pelunasan < 15 hari     → Pokok + (Pokok × x%)
Pelunasan ≤ 1 bulan     → Pokok + (Pokok × y%)
Perpanjangan tepat waktu → (Pokok × y%) + adm% + as(Rp)
Perpanjangan terlambat  → (Pokok × y%) + adm% + as(Rp) + d%
Keterlambatan > 1 bulan → (Pokok × y%) + adm% + as + (d% × n bulan)
```

---

# EPIC 4: Master Toko (Branch)

## US-4.1: View Branch List 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** view list of all toko under my PT  
**SO THAT** I can manage my branches

### Acceptance Criteria:

- [ ] **AC-4.1.1:** Given I am logged in as Pemilik, when I navigate to Master Toko, then I see list of all toko
- [ ] **AC-4.1.2:** Given toko list, then each row shows: kode lokasi, nama toko, kota, status
- [ ] **AC-4.1.3:** Given toko list, then I can filter by: kota, status
- [ ] **AC-4.1.4:** Given toko list, then I can search by: kode lokasi, nama toko
- [ ] **AC-4.1.5:** Given toko list, then borrowed branches are marked with indicator "Pinjam PT"
- [ ] **AC-4.1.6:** Given toko list, then I see total count and pagination

---

## US-4.2: Create New Branch 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** create a new toko under my PT  
**SO THAT** I can expand my business

### Acceptance Criteria:

- [ ] **AC-4.2.1:** Given create toko form, when I fill all required fields, then toko is created with status "active"
- [ ] **AC-4.2.2:** Required fields: kode lokasi, nama toko (short), nama toko (long), alamat, telepon, kota
- [ ] **AC-4.2.3:** Given kode lokasi, then it must be unique across all PT
- [ ] **AC-4.2.4:** Given new toko created, then PT field defaults to my PT
- [ ] **AC-4.2.5:** Given new toko created, then transactionSequence starts at 0
- [ ] **AC-4.2.6:** Given new toko created, then audit log records the creation

### API Endpoint:
```
POST /api/v1/branches
{
  "branchCode": "JKT-PM-01",
  "shortName": "Pasar Minggu",
  "fullName": "Gadai Top Pasar Minggu",
  "address": "Jl. Raya Pasar Minggu No. 123",
  "phone": "021-7891234",
  "city": "Jakarta Selatan"
}
```

---

## US-4.3: Update Branch Information 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** update toko information  
**SO THAT** branch details remain accurate

### Acceptance Criteria:

- [ ] **AC-4.3.1:** Given toko edit mode, when I update nama toko, then changes are saved
- [ ] **AC-4.3.2:** Given toko edit mode, when I update alamat, then changes are saved
- [ ] **AC-4.3.3:** Given toko edit mode, when I update telepon, then changes are saved
- [ ] **AC-4.3.4:** Given toko edit mode, when I update kota, then changes are saved
- [ ] **AC-4.3.5:** Given kode lokasi field, then it is read-only after creation
- [ ] **AC-4.3.6:** Given any update, then audit log records changes

---

## US-4.4: Deactivate Branch 🟠 P1

**AS A** Super Admin (Pemilik)  
**I WANT TO** deactivate a toko  
**SO THAT** it no longer operates but data is preserved

### Acceptance Criteria:

- [ ] **AC-4.4.1:** Given active toko, when I click "Nonaktifkan", then status changes to "inactive"
- [ ] **AC-4.4.2:** Given toko with active SPK (belum lunas), when I try to deactivate, then I see warning "Terdapat X SPK aktif"
- [ ] **AC-4.4.3:** Given inactive toko, then staff cannot create new SPK
- [ ] **AC-4.4.4:** Given inactive toko, then existing SPK can still be processed (pelunasan/perpanjangan)
- [ ] **AC-4.4.5:** Given inactive toko, when I click "Aktifkan", then status changes to "active"

---

## US-4.5: Request Pinjam PT (Borrow Company) 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** create a toko under another owner's PT  
**SO THAT** I can operate in their PT structure

### Acceptance Criteria:

- [ ] **AC-4.5.1:** Given create toko form, when I select different PT (not my own), then system marks this as "Pinjam PT"
- [ ] **AC-4.5.2:** Given Pinjam PT selected, when I submit, then toko is created with status "pending_approval"
- [ ] **AC-4.5.3:** Given pending toko, then it is not operational until approved
- [ ] **AC-4.5.4:** Given pending toko, then target PT owner receives notification
- [ ] **AC-4.5.5:** Given Pinjam PT toko, then isBorrowed = true and actualOwnerId = my user ID
- [ ] **AC-4.5.6:** Given pending toko, then I can see status in my toko list

### Data Model:
```typescript
{
  branchCode: "JKT-PM-02",
  companyId: "target-pt-uuid",      // PT yang dipinjam
  isBorrowed: true,
  actualOwnerId: "my-user-uuid",    // Pemilik sebenarnya
  status: "pending_approval"
}
```

---

## US-4.6: Approve/Reject Pinjam PT Request 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** approve or reject Pinjam PT requests for my PT  
**SO THAT** I can control who operates under my PT

### Acceptance Criteria:

- [ ] **AC-4.6.1:** Given I am PT owner, when someone requests Pinjam PT, then I see notification
- [ ] **AC-4.6.2:** Given pending request, when I navigate to approval page, then I see: requester name, toko details, request date
- [ ] **AC-4.6.3:** Given pending request, when I click "Setujui", then toko status changes to "active"
- [ ] **AC-4.6.4:** Given approved request, then requester receives notification
- [ ] **AC-4.6.5:** Given pending request, when I click "Tolak", then I must provide rejection reason
- [ ] **AC-4.6.6:** Given rejected request, then toko status changes to "inactive" and rejectionReason is saved
- [ ] **AC-4.6.7:** Given rejection, then requester receives notification with reason
- [ ] **AC-4.6.8:** Given any decision, then audit log records the action

---

## US-4.7: View Borrowed Branch Data 🔴 P0

**AS A** Super Admin (Pemilik) who owns a borrowed branch  
**I WANT TO** see all data of my borrowed toko  
**SO THAT** I can manage operations

### Acceptance Criteria:

- [ ] **AC-4.7.1:** Given I have borrowed toko, when I view toko list, then I see all my borrowed branches
- [ ] **AC-4.7.2:** Given borrowed toko, when I view details, then I see all SPK, NKB, mutasi
- [ ] **AC-4.7.3:** Given I am PT owner being borrowed, when I view that toko, then I see only basic info (kode, nama) NOT transactional data
- [ ] **AC-4.7.4:** Given borrowed toko, then only actualOwner can see full transactional data

### Business Rule:
> "Pada case pinjam PT, semua data pada toko tersebut hanya dapat dilihat oleh pemilik peminjam"

---

# EPIC 5: Master User

## US-5.1: View User List 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** view list of all users under my PT  
**SO THAT** I can manage staff access

### Acceptance Criteria:

- [ ] **AC-5.1.1:** Given I am logged in as Pemilik, when I navigate to Master User, then I see list of all users
- [ ] **AC-5.1.2:** Given user list, then each row shows: nama, email, role, assigned branch, status
- [ ] **AC-5.1.3:** Given user list, then I can filter by: role, branch, status
- [ ] **AC-5.1.4:** Given user list, then I can search by: nama, email
- [ ] **AC-5.1.5:** Given user list, then I see total count per role

---

## US-5.2: Create Admin PT User 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** create Admin PT user  
**SO THAT** they can help manage all toko under my PT

### Acceptance Criteria:

- [ ] **AC-5.2.1:** Given create user form, when I select role "Admin PT", then branch assignment is optional
- [ ] **AC-5.2.2:** Required fields: nama, email, password, nomor telepon
- [ ] **AC-5.2.3:** Given valid data, when I submit, then user is created with companyId = my PT
- [ ] **AC-5.2.4:** Given new user created, then temporary password email is sent
- [ ] **AC-5.2.5:** Given Admin PT role, then user can access all toko under the PT

### Role Permissions (Admin PT):
- View & edit all data in all toko under PT
- Manage katalog & potongan harga
- Approve tambah modal requests
- View mutasi all toko
- Schedule & monitor stock opname
- Manage lelang batches

---

## US-5.3: Create Staff Toko User 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** create Staff Toko user  
**SO THAT** they can operate daily transactions

### Acceptance Criteria:

- [ ] **AC-5.3.1:** Given create user form, when I select role "Staff Toko", then branch assignment is REQUIRED
- [ ] **AC-5.3.2:** Given branch dropdown, then only active branches are shown
- [ ] **AC-5.3.3:** Given valid data, when I submit, then user is created with branchId assigned
- [ ] **AC-5.3.4:** Given Staff Toko role, then user can only access assigned branch data

### Role Permissions (Staff Toko):
- Create & manage customers
- Create SPK (pinjaman)
- Process NKB (pembayaran)
- Request tambah modal
- Process setor uang
- View branch mutasi

---

## US-5.4: Create Stock Opname User 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** create Stock Opname user  
**SO THAT** they can perform inventory audits

### Acceptance Criteria:

- [ ] **AC-5.4.1:** Given create user form, when I select role "Stock Opname", then I can assign multiple branches
- [ ] **AC-5.4.2:** Given Stock Opname user, then they can be assigned to multiple toko for audit
- [ ] **AC-5.4.3:** Given valid data, when I submit, then user is created with companyId = my PT

### Role Permissions (Stock Opname):
- View assigned audit schedules
- Scan QR Code SPK for stock check
- Submit audit results with photos
- View audit progress

---

## US-5.5: Create Lelang User 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** create Lelang (Auction) user  
**SO THAT** they can collect overdue items

### Acceptance Criteria:

- [ ] **AC-5.5.1:** Given create user form, when I select role "Lelang", then I can assign to company level
- [ ] **AC-5.5.2:** Given Lelang user, then they can access all branches for item collection
- [ ] **AC-5.5.3:** Given valid data, when I submit, then user is created with companyId = my PT

### Role Permissions (Lelang):
- View assigned auction batches
- Scan QR Code SPK for item pickup
- Mark items as collected
- Submit collection notes

---

## US-5.6: Create Marketing User 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** create Marketing user  
**SO THAT** they can validate collected auction items

### Acceptance Criteria:

- [ ] **AC-5.6.1:** Given create user form, when I select role "Marketing", then I assign to company level
- [ ] **AC-5.6.2:** Given Marketing user, then they validate items from all branches
- [ ] **AC-5.6.3:** Given valid data, when I submit, then user is created with companyId = my PT

### Role Permissions (Marketing):
- View items pending validation
- Validate item condition (OK/Return/Reject)
- Upload validation photos
- Submit validation verdict

---

## US-5.7: Update User Information 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** update user information  
**SO THAT** user details remain accurate

### Acceptance Criteria:

- [ ] **AC-5.7.1:** Given user edit mode, when I update nama, then changes are saved
- [ ] **AC-5.7.2:** Given user edit mode, when I update nomor telepon, then changes are saved
- [ ] **AC-5.7.3:** Given user edit mode, when I change role, then permissions update accordingly
- [ ] **AC-5.7.4:** Given user edit mode, when I change assigned branch (for Staff Toko), then access updates
- [ ] **AC-5.7.5:** Given any update, then audit log records changes

---

## US-5.8: Deactivate/Reactivate User 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** deactivate a user  
**SO THAT** they can no longer access the system

### Acceptance Criteria:

- [ ] **AC-5.8.1:** Given active user, when I click "Nonaktifkan", then status changes to "inactive"
- [ ] **AC-5.8.2:** Given inactive user, then they cannot login
- [ ] **AC-5.8.3:** Given inactive user, then their active sessions are terminated
- [ ] **AC-5.8.4:** Given inactive user, when I click "Aktifkan", then status changes to "active"
- [ ] **AC-5.8.5:** Given deactivation, then audit log records the action

---

## US-5.9: Reset User Password 🟠 P1

**AS A** Super Admin (Pemilik)  
**I WANT TO** reset a user's password  
**SO THAT** they can regain access

### Acceptance Criteria:

- [ ] **AC-5.9.1:** Given user detail page, when I click "Reset Password", then system generates temporary password
- [ ] **AC-5.9.2:** Given password reset, then email is sent to user with temporary password
- [ ] **AC-5.9.3:** Given temporary password, then user must change on first login
- [ ] **AC-5.9.4:** Given password reset, then all user sessions are invalidated

---

# EPIC 6: Master Tipe Barang (Item Types)

## US-6.1: View Item Type List 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** view list of all item types  
**SO THAT** I can manage product categories

### Acceptance Criteria:

- [ ] **AC-6.1.1:** Given I navigate to Master Tipe Barang, then I see list of all item types
- [ ] **AC-6.1.2:** Given item type list, then each row shows: kode tipe, nama tipe, status
- [ ] **AC-6.1.3:** Given item type list, then I can see sort order
- [ ] **AC-6.1.4:** Given item type list, then I can filter by status (active/inactive)

---

## US-6.2: Create Item Type 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** create new item type  
**SO THAT** staff can categorize pawned items

### Acceptance Criteria:

- [ ] **AC-6.2.1:** Given create form, when I enter kode tipe (max 5 chars), then it must be unique
- [ ] **AC-6.2.2:** Given create form, when I enter nama tipe, then it is saved
- [ ] **AC-6.2.3:** Given create form, when I enter description, then it is saved
- [ ] **AC-6.2.4:** Given create form, when I set sort order, then it determines display position
- [ ] **AC-6.2.5:** Given valid data, when I submit, then item type is created with isActive = true

### Example Item Types:
| Code | Name | Description |
|------|------|-------------|
| H | Handphone | Smartphone, feature phone |
| L | Laptop | Notebook, MacBook |
| E | Emas | Perhiasan, logam mulia |
| T | Tablet | iPad, Android tablet |
| K | Kamera | DSLR, Mirrorless |
| J | Jam | Jam tangan branded |

---

## US-6.3: Update Item Type 🟠 P1

**AS A** Super Admin (Pemilik)  
**I WANT TO** update item type information  
**SO THAT** categories remain accurate

### Acceptance Criteria:

- [ ] **AC-6.3.1:** Given item type edit mode, when I update nama tipe, then changes are saved
- [ ] **AC-6.3.2:** Given item type edit mode, when I update description, then changes are saved
- [ ] **AC-6.3.3:** Given item type edit mode, when I update sort order, then display order changes
- [ ] **AC-6.3.4:** Given kode tipe field, then it is read-only (cannot be changed after creation)
- [ ] **AC-6.3.5:** Given any update, then audit log records changes

---

## US-6.4: Deactivate Item Type 🟠 P1

**AS A** Super Admin (Pemilik)  
**I WANT TO** deactivate an item type  
**SO THAT** it's no longer used for new SPK

### Acceptance Criteria:

- [ ] **AC-6.4.1:** Given active item type, when I click "Nonaktifkan", then isActive = false
- [ ] **AC-6.4.2:** Given inactive item type, then it doesn't appear in SPK creation dropdown
- [ ] **AC-6.4.3:** Given inactive item type, then existing SPK with this type are NOT affected
- [ ] **AC-6.4.4:** Given inactive item type, when I click "Aktifkan", then isActive = true

---

# EPIC 7: Audit Trail

## US-7.1: View Audit Logs 🔴 P0

**AS A** Super Admin (Pemilik)  
**I WANT TO** view audit logs for my PT  
**SO THAT** I can track all changes

### Acceptance Criteria:

- [ ] **AC-7.1.1:** Given I navigate to Audit Log, then I see list of all changes
- [ ] **AC-7.1.2:** Given audit log list, then each row shows: waktu, user, aksi, entity, changes
- [ ] **AC-7.1.3:** Given audit log list, then I can filter by: date range, user, action type, entity
- [ ] **AC-7.1.4:** Given audit log list, then I can search by user name
- [ ] **AC-7.1.5:** Given audit log entry, when I click detail, then I see oldValues and newValues

---

## US-7.2: Export Audit Logs 🟡 P2

**AS A** Super Admin (Pemilik)  
**I WANT TO** export audit logs  
**SO THAT** I can keep records for compliance

### Acceptance Criteria:

- [ ] **AC-7.2.1:** Given audit log page, when I click "Export", then I can choose CSV or PDF format
- [ ] **AC-7.2.2:** Given export, then file includes all filtered data
- [ ] **AC-7.2.3:** Given export, then file is downloaded to my device

---

# 📊 Story Summary

## By Priority

| Priority | Count | Stories |
|----------|-------|---------|
| 🔴 P0 | 24 | US-1.1 to US-1.3, US-2.1, US-2.3, US-3.1 to US-3.3, US-4.1 to US-4.7, US-5.1 to US-5.8, US-6.1 to US-6.2, US-7.1 |
| 🟠 P1 | 8 | US-1.4, US-1.5, US-2.2, US-4.4, US-5.9, US-6.3, US-6.4 |
| 🟡 P2 | 1 | US-7.2 |
| 🟢 P3 | 0 | - |

## By Epic

| Epic | Stories | Priority Coverage |
|------|---------|-------------------|
| 1. Authentication & Security | 5 | 3 P0, 2 P1 |
| 2. Master Super Admin | 3 | 2 P0, 1 P1 |
| 3. Master PT | 3 | 3 P0 |
| 4. Master Toko | 7 | 6 P0, 1 P1 |
| 5. Master User | 9 | 8 P0, 1 P1 |
| 6. Master Tipe Barang | 4 | 2 P0, 2 P1 |
| 7. Audit Trail | 2 | 1 P0, 1 P2 |

---

## API Endpoints Summary

```
# Authentication
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

# Users
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id (soft delete)
POST   /api/v1/users/:id/reset-password

# User Devices
GET    /api/v1/users/:id/devices
POST   /api/v1/users/:id/devices
PATCH  /api/v1/users/:id/devices/:deviceId
DELETE /api/v1/users/:id/devices/:deviceId

# Companies
GET    /api/v1/companies/:id
PATCH  /api/v1/companies/:id
PATCH  /api/v1/companies/:id/config

# Branches
GET    /api/v1/branches
POST   /api/v1/branches
GET    /api/v1/branches/:id
PATCH  /api/v1/branches/:id
DELETE /api/v1/branches/:id (soft delete)

# Borrow Requests
GET    /api/v1/borrow-requests
POST   /api/v1/borrow-requests
PATCH  /api/v1/borrow-requests/:id/approve
PATCH  /api/v1/borrow-requests/:id/reject

# Item Types
GET    /api/v1/item-types
POST   /api/v1/item-types
GET    /api/v1/item-types/:id
PATCH  /api/v1/item-types/:id
DELETE /api/v1/item-types/:id (soft delete)

# Roles
GET    /api/v1/roles

# Audit Logs
GET    /api/v1/audit-logs
GET    /api/v1/audit-logs/:id
GET    /api/v1/audit-logs/export
```