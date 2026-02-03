FR‑081 Display Customer Portal Login
Feature Name: Display Customer Portal Login

Description: The system displays the Customer Portal login page with two responsive variants: NIK + PIN (mobile/compact) and Email + Password (full desktop view).

Actor: Customer

Priority: High

Acceptance Criteria:

Unauthenticated visitors opening the Customer Portal URL see the login layout with title “Portal Customer”, logo, and the appropriate form depending on device size (NIK+PIN on narrow view, Email+Password on wide view, per design).

If a customer is already authenticated and revisits the login URL, the system redirects them to the Customer Dashboard (or equivalent landing page).
​

The layout scales correctly on mobile, tablet, and desktop without elements overlapping or requiring horizontal scrolling.

FR‑082 Login with NIK and PIN
Feature Name: NIK + PIN Authentication

Description: Customers can log in using their national ID number (NIK) and a numeric PIN associated with their account.

Actor: Customer

Priority: High

Acceptance Criteria:

The NIK field accepts only digits and validates basic format/length according to Indonesian NIK standards; invalid or empty input shows an inline error message.

The PIN field masks characters by default and enforces PIN length (e.g., 4–6 digits) with inline validation; an eye icon allows toggle visibility without changing the value.
​

When the customer clicks “Cari/Search” with valid NIK and PIN, the system verifies the pair and, if correct, authenticates the customer and opens their Customer Portal home; if incorrect, a generic error like “NIK or PIN is incorrect” is shown without revealing which field is wrong.
​

FR‑083 Login with Email and Password
Feature Name: Email + Password Authentication

Description: As an alternative, customers can log in using their registered email address and password.

Actor: Customer

Priority: High

Acceptance Criteria:

The Email field validates email format and shows an error when empty or invalid; the Password field enforces the global password policy (minimum length and complexity as defined for customer accounts).
​

Clicking the “Login/Masuk” button with valid credentials authenticates the customer and navigates to the Customer Portal home.

Invalid email or password produces a generic error message (e.g., “Email or password is incorrect”) and does not indicate which part failed, to avoid information disclosure.
​

FR‑084 Error & Security Handling on Customer Login
Feature Name: Customer Login Validation & Security

Description: The Customer Portal login handles errors and security concerns consistently for both NIK+PIN and Email+Password flows.

Actor: Customer

Priority: High

Acceptance Criteria:

Submitting any login form with required fields empty shows inline validation errors and does not send an authentication request.
​

After repeated failed login attempts (number configurable), the system may trigger protective measures such as temporary lockout or CAPTCHA, according to security policy.
​

All customer login requests use HTTPS and, on success, create a secure session/cookie with proper flags (Secure, HttpOnly, SameSite) and configured idle timeout.
​

FR‑085 Customer Logout & Session Expiration
Feature Name: Customer Logout & Session Expiration

Description: The system terminates customer sessions on logout or idle timeout and returns the user to the Customer Portal login screen.

Actor: Customer

Priority: High

Acceptance Criteria:

From any Customer Portal page, choosing “Logout” clears the session and redirects the customer to the Customer Portal login page.
​

If the session expires due to inactivity, accessing any protected customer page redirects to the login page with an optional “session expired” message.

Using the browser Back button after logout or expiry does not grant access to portal content unless the customer logs in again.