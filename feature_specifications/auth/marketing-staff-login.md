FR‑251 Display Login Page (Marketing Staff)
Feature Name: Display Login (Marketing Staff)

Description: The system shows a responsive login page where Marketing Staff enter email and password to access their account.

Actor: Marketing Staff

Priority: High

Acceptance Criteria:

When a Marketing Staff user opens the application URL, the login page appears with logo, welcome copy, Email, Password fields, and “Masuk” button, following the desktop and mobile designs.

If a Marketing Staff user is already authenticated and navigates to the login URL, the system redirects them to the Marketing dashboard instead of showing the form.

The layout remains readable and consistent across screen sizes, with correct alignment of form fields and primary button.

FR‑252 Authenticate Marketing Staff with Role‑Based Redirect
Feature Name: Marketing Staff Authentication & Redirect

Description: The system authenticates credentials and routes Marketing Staff to their dedicated home page.

Actor: Marketing Staff

Priority: High

Acceptance Criteria:

When “Masuk” is clicked, the system validates the email format and checks the password against the stored record.

If credentials are valid and the user has the Marketing Staff role, a session is created with marketing‑only permissions and the user is redirected to the Marketing dashboard; other roles using the same login page are redirected to their own dashboards by role.
​

If the account does not have authorization for Marketing features, an appropriate message or redirect is applied according to RBAC rules.

FR‑253 Login Validation & Security for Marketing Staff
Feature Name: Marketing Login Validation & Security

Description: The login process for Marketing Staff must guard credentials and handle invalid attempts securely.

Actor: Marketing Staff

Priority: High

Acceptance Criteria:

Wrong email/password combinations result in a generic error message without revealing which field is incorrect, and the password field is cleared.

After a configurable number of failed attempts, the system enforces additional security such as temporary lockout, CAPTCHA, or MFA as per global security policies.
​

All login communication uses HTTPS, passwords are stored as secure hashes only, and authentication events are logged with user, timestamp, and IP address for audit purposes.