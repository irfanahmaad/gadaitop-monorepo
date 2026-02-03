FR‑105 Display Admin PT Login
Feature Name: Display Admin PT Login

Description: The system displays the Gadai Top login page for Admin PT users, using email and password.

Actor: Admin PT

Priority: High

Acceptance Criteria:

When an Admin PT opens the CMS URL (or specific Admin PT URL), the login page appears with Email, Password, and “Masuk” button as in the design.

If an Admin PT is already authenticated and hits the login URL, the system redirects them to the Admin PT Dashboard instead of showing the form.
​

Layout is responsive and usable on desktop, tablet, and mobile.

FR‑106 Admin PT Email & Password Authentication
Feature Name: Admin PT Authentication

Description: The system authenticates Admin PT using email and password, then assigns the Admin PT role to the session.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The Email field validates proper email format; the Password field enforces the system password policy and supports show/hide via the eye icon.

On “Masuk”, credentials are verified; if valid and the user has the Admin PT role, the system signs them in and redirects to the Admin PT Dashboard with PT/branch context loaded.
​

If the user exists but does not have Admin PT privileges, access to Admin PT UI is denied and a generic “You are not authorized to access this area” style error (or redirect) is shown according to the RBAC rules.

FR‑107 Invalid Login & Security for Admin PT
Feature Name: Admin PT Login Validation & Security

Description: The login for Admin PT handles invalid credentials and protects against abuse, consistent with global auth rules.

Actor: Admin PT

Priority: High

Acceptance Criteria:

Wrong email or password shows a generic error message (e.g., “Email or password is incorrect”) without revealing which part is wrong.
​

After a configurable number of failed attempts, the account or IP may be temporarily locked or require additional verification (CAPTCHA, MFA) following security policy.
​

All Admin PT logins are served via HTTPS; successful login creates a secure session/cookie which encodes the Admin PT role and PT scope, used later for authorization checks.
​

FR‑108 Logout & Session Expiration for Admin PT
Feature Name: Admin PT Logout & Session Expiry

Description: The system ends the Admin PT session on logout or timeout and returns to the login screen.

Actor: Admin PT

Priority: High

Acceptance Criteria:

Choosing “Logout” anywhere in the Admin PT interface invalidates the session and redirects to the same login page shown in the screenshot.
​

When a session expires due to inactivity, accessing any Admin PT page redirects to the login screen with an optional “session expired” message.

Using browser Back after logout/expiry does not restore access to Admin PT pages unless the user logs in again.