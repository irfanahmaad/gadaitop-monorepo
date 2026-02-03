FR‑116 View Stock Opname List
Feature Name: View Stock Opname List

Description: The system displays a list of stock opname (stock count) sessions for the Admin PT’s PT and branches.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Stock Opname” list shows key fields such as Schedule Name/Code, Branch, Date, Status (e.g., Scheduled, In Progress, Completed), and Actions, matching the grid design.

Only stock opname sessions belonging to the Admin PT’s PT (and accessible branches) are displayed; sessions from other PTs are never visible.
​

The list supports basic sorting by date and status, and uses pagination when the number of sessions exceeds the per‑page limit.

FR‑117 Stock Opname Calendar / Matrix View
Feature Name: Stock Opname Calendar View

Description: The module provides a calendar/matrix view that visualizes planned and completed stock opname across days and locations.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

Switching to the calendar view shows days or periods as grid cells and indicates, via color or badges, which days have planned, ongoing, or completed stock opname for the selected branch/warehouse.
​

Hovering or clicking a cell reveals summary details (e.g., schedule name, branch, status) and provides a way to open the corresponding stock opname record.

Filters (e.g., branch, month) affect both the list and calendar views consistently.

FR‑118 Create Stock Opname Schedule
Feature Name: Create Stock Opname Schedule

Description: Admin PT can create a new stock opname schedule defining when and where a physical count will occur.

Actor: Admin PT

Priority: High

Acceptance Criteria:

The “Create Stock Opname Schedule” form includes at least: PT/Branch (pre‑scoped to Admin PT), Warehouse/Location, Start Date, End Date (or single Date), Frequency/Type (if applicable), and Notes, as shown on the form UI.
​

Required fields are validated; missing or invalid values show inline error messages and prevent saving.

On successful save, a new schedule entry appears in the Stock Opname list and is reflected in the calendar view.

FR‑119 Confirm and Activate Stock Opname
Feature Name: Confirm Stock Opname Schedule

Description: Before a scheduled stock opname can start, Admin PT must confirm/activate the schedule.

Actor: Admin PT

Priority: Medium

Acceptance Criteria:

Saving a schedule opens a confirmation dialog summarizing the key details (branch, dates, notes) with options to Confirm or Cancel.

Clicking Confirm sets the schedule status to “Scheduled/Active” and notifies relevant users (e.g., branch staff) per business rules.
​

Clicking Cancel closes the dialog and keeps the schedule in draft or unscheduled state without activating it.

FR‑120 Record Stock Opname Results & Completion
Feature Name: Complete Stock Opname

Description: After the physical stock count is done, Admin PT (or assigned staff) records results and marks the stock opname as completed.

Actor: Admin PT

Priority: High

Acceptance Criteria:

For an active schedule, the system provides a detail screen to view counted items and discrepancies, and to adjust statuses/notes as needed (e.g., over, short, okay).
​
​

Clicking the “Finish / Mark as Completed” action opens a confirmation dialog; upon confirmation, the stock opname status becomes “Completed”, and inventory records are reconciled according to the approved differences.

Once marked as Completed, the stock opname session becomes read‑only; further changes require a separate adjustment process or a new stock opname run.