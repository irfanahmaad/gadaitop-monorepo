FR‑001 Login (Super Admin Access to CMS)
Feature Name: CMS Login (Super Admin)

Description:
The system provides a branded login page for Gadai Top CMS, allowing Super Admin roles to authenticate using email and password before accessing any backoffice features. The layout follows the Figma design with a left welcome panel and a right login form.

Actor:

Super Admin (Owner)

Super Admin

(Future) Admin PT / other CMS roles, but scope of this FR focuses on Super Admin access.
​

Priority: High

Preconditions
User has an existing CMS account with role Super Admin Owner or Super Admin and status “active”.
​

User accesses the CMS URL over HTTPS and (if enforced) via VPN / allowed device according to security constraints.
​

User is currently logged out (no active session or previous session already expired).

Postconditions
On successful login, a secure authenticated session is created (e.g., JWT + httpOnly cookie) bound to the user and device constraints.
​

User is redirected to the CMS Dashboard as the default landing page for Super Admin.
​

Login attempt (success or failure) is recorded in the audit trail with timestamp, IP/device info where available, but without storing raw passwords.
​

UI & Interaction Requirements
The login screen shows:

Left side: red welcome panel with “Selamat Datang” headline and descriptive text, as in Figma.

Right side: Gadai Top logo, “Selamat Datang” title, hint text, and a vertical form with:

Email field labeled “E-mail *”

Password field labeled “Kata Sandi *” with eye icon to toggle visibility

Primary red button “Masuk” centered under the form.

Email field behavior:

Accepts text input formatted as an email.

On invalid email format, shows an inline validation message (e.g., “Please enter a valid email address”) when user attempts to submit.

Password field behavior:

Masks input by default (●●●●●).

Clicking the eye icon toggles between masked and plain-text display without causing page reload or resetting the field.

Password value is never logged to console or stored in any client-side persistent storage.

Primary button behavior:

“Masuk” is enabled when both fields are non-empty.

On click, sends credentials to the authentication endpoint and displays a loading state (spinner or disabled button) until the response is received, preventing double-submit.

Security & Business Rules
Only accounts with role Super Admin Owner or Super Admin and status “active” are allowed to log into CMS; all others receive a generic error (“Email or password is incorrect” or “Account is inactive”) without leaking which part is wrong.
​

Brute-force protection must be supported at backend level (e.g., throttling or lockout after N failed attempts per IP/account); when activated, the user sees a generic message (e.g., “Too many failed attempts, please try again later”).

Authentication must comply with global constraints:

No hard delete of user records; deactivated accounts remain in database but cannot log in.
​

Session timeout is configurable (e.g., X minutes of inactivity); after timeout, any action redirects to login with an informational message (“Your session has expired, please log in again”).
​

If MAC address / device locking or VPN-only access is enforced, the backend validates device/connection; on violation, login is rejected with a generic access error (e.g., “Access not allowed from this device or network”).
​

Acceptance Criteria
When a Super Admin enters valid email and password and clicks “Masuk”, the system authenticates successfully and navigates to the Dashboard page without full page reload.

When credentials are invalid (wrong email/password or inactive account), the system:

Keeps the user on the login page.

Displays a clear error message near the form (top or under fields).

Preserves the email field value but clears or keeps the password field according to security policy.

When the backend or network returns an unexpected error (e.g., 500, timeout), the system shows a generic error notification (e.g., “Unable to log in, please try again”) and allows the user to retry, without breaking the layout.

Session timeout: after X minutes of inactivity, the next navigation or API call triggers a redirect to login, with a non-intrusive message that the session has expired. Active sessions remain valid across page refresh within the timeout window.

Login events are stored in audit log with: user identifier (email or user id), timestamp, result (success/fail), and optionally IP / device information; no raw password is logged.
​

The layout matches Figma in spacing, alignment, and responsive behavior for standard desktop widths (e.g., ≥1366px); on smaller widths, left and right panels may stack but all elements remain visible and usable.