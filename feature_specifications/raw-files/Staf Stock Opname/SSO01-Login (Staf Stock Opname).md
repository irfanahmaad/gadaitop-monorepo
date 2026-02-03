FR‑229 Display Login Page (Stock Opname Staff)
Feature Name: Display Login (Stock Opname Staff)

Description: The system shows a responsive login page where Stock Opname Staff sign in using email and password.

Actor: Stock Opname Staff

Priority: High

Acceptance Criteria:

When a Stock Opname Staff user opens the application URL, the login page appears with Email, Password, and “Masuk” button as shown in the design (desktop and mobile).

If the user is already authenticated as Stock Opname Staff and navigates to the login URL, the system redirects them to the Stock Opname dashboard instead of showing the form.
​

The layout remains readable and usable on different screen sizes (mobile, tablet, desktop).

FR‑230 Authenticate Stock Opname Staff with Role‑Based Redirect
Feature Name: Stock Opname Staff Authentication & Redirect

Description: The system authenticates credentials and redirects the user to the correct Stock Opname home page based on their role.

Actor: Stock Opname Staff

Priority: High

Acceptance Criteria:

On clicking “Masuk”, the system validates email format and checks the provided password against the stored hash.

If credentials are valid and the user has the Stock Opname Staff role, a session is created with inventory permissions only and the user is redirected to the Stock Opname dashboard; other roles using the same login page are redirected to their respective dashboards according to role‑based rules.
​

If the account does not have permission to access Stock Opname features, an appropriate error or redirect is applied according to the RBAC configuration.

FR‑231 Login Validation & Security for Stock Opname Staff
Feature Name: Stock Opname Login Validation & Security

Description: The login process for Stock Opname Staff must handle invalid attempts securely and protect credentials and inventory data.

Actor: Stock Opname Staff

Priority: High

Acceptance Criteria:

Incorrect email/password combinations show a generic error message without indicating which field is wrong, and the password field is cleared.

After a configurable number of failed attempts, the account or IP may be temporarily locked, or additional security such as OTP or MFA is required, following global security policies.
​

All login traffic uses HTTPS, passwords are never stored in plain text, and authentication events (success and failure) are logged with user, timestamp, and IP address for audit.