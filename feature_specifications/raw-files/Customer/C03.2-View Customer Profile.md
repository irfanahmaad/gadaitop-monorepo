FR‑098 View Customer Profile
Feature Name: View Customer Profile

Description: The system displays the logged‑in customer’s profile information in a dedicated “Profil” page and tab.

Actor: Customer

Priority: High

Acceptance Criteria:

From the Portal Customer navigation, choosing the “Profile” tab or menu opens a page showing the customer’s avatar, full name, NIK, gender, place of birth, and date of birth as in the design.

Only the currently authenticated customer’s data is shown; it is not possible to navigate to or load another customer’s profile via URL manipulation.

The same information is available in both desktop layout (wide content area) and mobile layout (card on the left with Profile tab), with consistent labels and values.

FR‑099 Responsive Profile Layout
Feature Name: Responsive Profile Layout

Description: The Customer Profile layout adapts to different screen sizes while keeping content readable and accessible.

Actor: Customer

Priority: Medium

Acceptance Criteria:

On desktop, profile data is displayed horizontally (avatar on the left, key fields arranged in two columns); on mobile, profile content appears as a vertical card under the “Profile” tab.

No horizontal scrolling is required to see all primary fields on typical mobile widths; text wraps correctly and avatar scales gracefully.

The “Portal Customer / Profil” breadcrumb and page title remain visible on all supported viewports, helping customers understand where they are in the portal.

FR‑100 Logout from Profile
Feature Name: Logout from Customer Profile

Description: Customers can log out from the portal directly from the Profile screen.

Actor: Customer

Priority: High

Acceptance Criteria:

A “Keluar/Logout” button is available on the Profile screen (and in the mobile card footer) as shown in the design.

Clicking “Keluar/Logout” invalidates the customer session and redirects them to the Customer Portal login page, without leaving profile data cached in the UI.
​

Using the browser Back button after logout does not allow access back to the profile or other protected pages unless the customer logs in again.