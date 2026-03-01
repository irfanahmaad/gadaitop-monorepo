# FR-043 Login Staff Toko

## TITLE
**FR-043 Login Staff Toko** - Feature Name

## Description
The Login page allows Staff Toko users to access the Gadai Top system by entering their email/username and password credentials. The UI is shared across all roles, with differentiation based on the assigned account role. Successful login grants role-based access to Staff Toko features such as Master Customer, SPK creation, and NKB processing.

## Actor
- Staff Toko

## Priority
Medium

## Preconditions
1. User is registered as Staff Toko in Master User (assigned to a specific PT/Toko).
2. System supports role-based authentication (JWT).
3. Device/VPN restrictions are met (per non-functional requirements).

## Postconditions
1. Valid credentials redirect to Staff Toko dashboard with role-specific menu.
2. Invalid credentials show error message.
3. Session established with role-based permissions.

---

## TITLE
**FR-043 Login Staff Toko - FR043.1 View Login Page**

## Description
Display the unified login interface for all roles, including Staff Toko, featuring Gadai Top branding, input fields for email/username and password, and a login button.

## UI Interaction Requirements - Page Layout
- Split layout: Left side red background with "Selamat Datang" placeholder text; right side white form panel.
- Top-right logo: "GADAI TOP" with thumbs-up icon.
- Subtitle: "Silakan Selamatkan data akun Anda" (or similar welcome text).
- Input fields:
  - Email/username label and text input.
  - Password label, text input with eye icon for visibility toggle.
- Primary button: "Masuk" (red background).
- Responsive design for web/mobile.

## UI Interaction Requirements - Error States
- Standard error handling for invalid credentials.

## Data Behaviour Requirements
- Form inputs validate email/username format and password length.
- No role selection; role determined post-authentication from backend.

## Security Business Rules
- Password encryption and sensitive data protection.
- JWT role-based authentication.
- VPN-based access required.
- MAC address locking for verified devices.
- Audit trail for login attempts (user, time, success/fail).

## Acceptance Criteria
1. Page loads with exact layout from Figma (red/white split, inputs, button).
2. Eye icon toggles password visibility.
3. Form submission triggers authentication without page reload (e.g., spinner).

---

## TITLE
**FR-043 Login Staff Toko - FR043.2 Submit Login**

## Description
Process login request for Staff Toko credentials, validate against Master User data, and redirect based on role.

## UI Interaction Requirements
- "Masuk" button submits form on click or Enter.
- Loading state on submit (button disabled/spinner).
- Success: Redirect to dashboard.
- Failure: Shake animation or error text under fields.

## Data Behaviour Requirements
- Backend verifies email/username and password hash.
- On success: Generate JWT token with Staff Toko role/PT assignment.
- Role grants access to assigned toko features only.

## Security Business Rules
- Failed attempts limited.
- Session timeout and logout on inactivity.

## Acceptance Criteria
1. Valid Staff Toko credentials redirect to role-specific dashboard.
2. Invalid credentials display error (e.g., "Email atau password salah").
3. Role mismatch grants correct role access, not Staff Toko.
