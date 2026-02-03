FR‑240 Display Login Page (Auction Staff)
Feature Name: Display Login (Auction Staff)

Description: The system shows a responsive login page where Auction Staff enter email and password to access their account.

Actor: Auction Staff

Priority: High

Acceptance Criteria:

When an Auction Staff user opens the application URL, the login page appears with logo, welcome text, Email, Password fields, and “Masuk” button, matching both desktop and mobile layouts in the design.

If the user is already authenticated as Auction Staff and visits the login URL, the system redirects them to the Auction dashboard instead of showing the form.

The page layout remains readable and usable on various screen sizes (mobile, tablet, desktop) with consistent branding and spacing.
​

FR‑241 Authenticate Auction Staff with Role‑Based Redirect
Feature Name: Auction Staff Authentication & Redirect

Description: The system validates credentials and routes authenticated users to the correct Auction Staff home page based on their role.

Actor: Auction Staff

Priority: High

Acceptance Criteria:

On clicking “Masuk”, the system validates the email format and verifies the password against the stored credential record.

If credentials are valid and the user has the Auction Staff role, a session is created with auction‑related permissions only and the user is redirected to the Auction Staff dashboard; other roles using the same login page are redirected to their own dashboards according to role‑based rules.
​

If the account does not have permission to access Auction features, the system shows an appropriate error or redirects to the correct module according to RBAC configuration.
​

FR‑242 Login Validation & Security for Auction Staff
Feature Name: Auction Login Validation & Security

Description: The login process for Auction Staff must protect credentials and handle invalid login attempts securely.

Actor: Auction Staff

Priority: High

Acceptance Criteria:

Invalid email/password combinations return a generic error message without specifying which field is incorrect, and the password field is cleared to encourage re‑entry.

After a configurable number of failed attempts, the system enforces temporary lockout, CAPTCHA, or MFA according to global security policy to prevent brute‑force attacks.
​

All login traffic uses HTTPS, passwords are stored only as secure hashes, and authentication events (success or failure) are logged with user identifier, timestamp, and IP address for auditing.
​