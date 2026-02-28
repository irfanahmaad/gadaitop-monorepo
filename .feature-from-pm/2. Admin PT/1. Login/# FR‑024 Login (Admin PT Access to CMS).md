# FR‑024 Login (Admin PT Access to CMS)

## Feature Name
CMS Login (Admin PT)

## Description
The system provides a branded login page for Gadai Top CMS that allows **Admin PT roles** to authenticate using email and password before accessing Admin PT backoffice features.  
This includes:
- **Admin Primary** created from the Master PT module.  
- **Admin PT “Temporary”** created from Master Data → Master Pengguna (temporary or additional Admin PT accounts for a PT).

The visual layout is shared with the global CMS login Figma: a red welcome panel on the left (“Selamat Datang” headline) and a white login form panel on the right with Gadai Top logo, “Selamat Datang” title, and a vertical login form.

## Actor
- Admin PT (Admin Primary)  
- Admin PT (Temporary)  
- (Shared UI) Super Admin Owner & Super Admin — but scope of this FR focuses on Admin PT behaviour and routing.

## Priority
High  

---

## Preconditions

1. User has an existing CMS account with:
   - Role **Admin PT**, and  
   - Status **active**, and  
   - Proper linkage to at least one PT (as Admin Primary from Master PT or Temporary Admin PT from Master Pengguna).  
2. User accesses the CMS login URL over HTTPS and, if enforced, via VPN and/or allowed device according to security constraints (MAC/device lock).  
3. User is currently logged out (no active session or previous session expired).  

---

## Postconditions

On successful login as Admin PT (Primary or Temporary):

1. A secure authenticated session is created (e.g., JWT + httpOnly cookie) bound to the Admin PT user and device/network constraints.  
2. User is redirected to the **Admin PT dashboard/home** as default landing page, with menus relevant to Admin PT and without Super Admin–only menus.  
3. The login attempt (success or failure) is recorded in audit logs with user identifier (email or user id), timestamp, result (success/fail), and IP/device information where available, but without storing raw passwords.  

---

## UI & Interaction Requirements

### Screen Layout
- **Left red panel**
  - Full‑height red background with pattern and big headline “Selamat Datang”.  
  - Short descriptive text as per Figma.  
  - Carousel dots at bottom (static unless future slides are implemented).

- **Right white panel**
  - Gadai Top logo at top‑center.  
  - Title “Selamat Datang”.  
  - Hint text: “Silakan masukkan email & password untuk masuk ke akunmu.”  
  - Vertical form:
    - **E-mail \*** input field.  
    - **Kata Sandi \*** input field with lock icon and eye icon to toggle visibility.  
  - Primary red button “Masuk” centered below the form.

Layout, colors, typography, and spacing must follow the existing login design used for Super Admin login.

### Email Field Behaviour
- Accepts text input formatted as email.  
- On submit, if format invalid, show inline validation (e.g., “Masukkan alamat email yang valid”).  
- Email value remains when validation fails or credentials are invalid.

### Password Field Behaviour
- Masks input by default (●●●●●).  
- Eye icon toggles between masked and plaintext without reload or clearing field.  
- Password must never be logged to console or stored in client‑side persistent storage.  

### “Masuk” Button Behaviour
- Enabled only when both Email and Password fields are non‑empty.  
- On click:
  - Sends credentials to authentication endpoint.  
  - Shows loading state (spinner or disabled) until response, preventing double submit.  

### Error & Info Messages
- For invalid credentials, inactive account, or role not allowed:
  - Stay on login page.  
  - Show generic error (e.g., “Email atau kata sandi salah, atau akun tidak aktif.”) near the form.  
  - Do not specify whether email or password is wrong.  
- For backend/network failure (500, timeout):
  - Show generic message (e.g., “Tidak dapat masuk saat ini, silakan coba lagi.”).  
  - Allow retry after error dismissed.  

---

## Security & Business Rules

1. **Role Eligibility**
   - Allowed: any account with role `Admin PT` (Admin Primary or Temporary) and status `active`.  
   - These accounts may be created either:
     - As Admin Primary when PT is created/managed in Master PT, or  
     - As Admin PT Temporary in Master Pengguna for additional access.  
   - Other roles (Super Admin Owner, Super Admin, Staff Toko, etc.) still use the same login page but are governed by their respective FRs.  

2. **Role‑Based Routing & Authorization**
   - After authentication, backend returns user roles and PT context(s).  
   - Frontend:
     - If role set contains `Admin PT` and not any Super Admin role, route to Admin PT dashboard/home.  
     - Show only Admin PT menus; hide and guard Super Admin–only features with backend authorization checks.  

3. **Brute‑Force & Lockout**
   - Backend implements throttling/lockout after N failed attempts per IP/account.  
   - When active, show generic message (e.g., “Terlalu banyak percobaan gagal, coba lagi beberapa saat lagi.”).

4. **Global Authentication Constraints**  
   - No hard delete for user records; deactivated Admin PT accounts remain in DB but cannot log in.  
   - Session timeout is configurable (e.g., X minutes inactivity); after timeout any action redirects to login with message “Sesi kamu telah berakhir, silakan masuk kembali.”  
   - If VPN/device lock is enforced, backend validates connection/device; violations result in generic access error (“Akses tidak diizinkan dari perangkat atau jaringan ini.”).

---

## Acceptance Criteria

1. When an Admin PT (Primary or Temporary) opens the CMS login URL, they see the branded login page with left welcome panel and right login form exactly as in Figma.  
2. When they enter valid email + password for an active Admin PT account and click “Masuk”:
   - Authentication succeeds.  
   - User is redirected to the Admin PT dashboard/home (not Super Admin dashboard).  
   - Session remains valid across page refresh within the configured timeout.  

3. When credentials are invalid or account is inactive/locked:
   - User remains on login page.  
   - A generic error message is shown near the form.  
   - Email value is preserved; password handling follows security policy but is never logged.  

4. When backend/network returns unexpected error:
   - A generic error message is displayed.  
   - Layout remains intact and user can retry login.  

5. All Admin PT login attempts (success/failure) are written into audit logs with user identifier, timestamp, result, and IP/device info when available, without any raw password values.  

6. When an Admin PT account (Primary or Temporary) is deactivated or locked by security policy, further login attempts result in a generic error message and no CMS access, while the account remains stored (soft state, no hard delete).  
