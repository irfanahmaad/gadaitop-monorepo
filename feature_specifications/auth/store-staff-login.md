For Store Staff, the Login feature is the same shared login screen, but successful authentication redirects specifically to the Store Staff dashboard and scope.
​

FR‑190 Display Store Staff Login Page
Feature Name: Display Login (Store Staff)

Description: The system displays a unified login page where Store Staff sign in using email and password.

Actor: Store Staff

Priority: High

Acceptance Criteria:

When a Store Staff user opens the application URL, the login page appears with Email, Password, and “Masuk” button as shown in the design.

If the user is already authenticated as Store Staff and navigates to the login URL, the system redirects them to the Store Staff dashboard instead of showing the form.
​

The layout is responsive and usable on desktop, tablet, and mobile devices.

FR‑191 Authenticate Store Staff with Role-Based Redirect
Feature Name: Store Staff Authentication & Redirect

Description: The system authenticates Store Staff credentials and redirects them to the correct Store Staff home page based on role.

Actor: Store Staff

Priority: High

Acceptance Criteria:

On clicking “Masuk”, the system validates email format and checks the provided password against the stored hash for that user.

If credentials are valid and the user has the Store Staff role, the session is created with Store Staff permissions and the user is redirected to the Store Staff dashboard; other roles using the same login page are redirected to their respective dashboards according to role-based rules.
​

If the user does not have permission to access Store Staff features, an appropriate error or redirect is applied according to the RBAC configuration.

FR‑192 Handle Invalid Login & Security for Store Staff
Feature Name: Store Staff Login Validation & Security

Description: The login process for Store Staff must handle invalid attempts securely and protect credentials.

Actor: Store Staff

Priority: High

Acceptance Criteria:

Incorrect email/password combinations show a generic error message without indicating which field is wrong, and the password field is cleared.

After a configurable number of failed attempts, the account or IP may be temporarily locked, or additional security such as CAPTCHA or MFA is required, following global security policies.
​

All login traffic uses HTTPS, passwords are never stored in plain text, and authentication events are logged for audit.

FR‑193 Logout & Session Expiration for Store Staff
Feature Name: Store Staff Logout & Session Timeout

Description: Store Staff sessions can be explicitly ended or automatically expired, returning the user to the login page.

Actor: Store Staff

Priority: Medium

Acceptance Criteria:

Selecting “Logout” anywhere in the Store Staff interface terminates the session and redirects to the same login screen shown in the design.

After a period of inactivity, the system expires the Store Staff session; subsequent access to protected pages redirects to the login page with an optional “session expired” message.
​

Using the browser Back button after logout or expiration does not restore access to Store Staff pages unless the user logs in again.