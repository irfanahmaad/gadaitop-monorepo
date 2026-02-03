# API Endpoint Mapping - Gadaitop CMS

**Version:** 1.0
**Last Updated:** 2026-01-18
**Purpose:** Complete mapping of features to REST API endpoints for backend development

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Dashboard Endpoints](#dashboard-endpoints)
3. [Transaction Endpoints](#transaction-endpoints)
4. [Master Data Endpoints](#master-data-endpoints)
5. [Inventory Endpoints](#inventory-endpoints)
6. [Auction Endpoints](#auction-endpoints)
7. [Reports & Notifications](#reports--notifications)
8. [Naming Conventions](#naming-conventions)

---

## Authentication Endpoints

### Login & Session Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `POST` | `/api/auth/login` | FR-076 to FR-080, FR-105 to FR-108, FR-190 to FR-193 | Universal login (email/password for staff, NIK/PIN for customers) | `{ email, password }` or `{ nik, pin }` | `{ token, user, role, pt_id, store_id }` |
| `POST` | `/api/auth/logout` | All auth features | Invalidate session token | - | `{ success: true }` |
| `GET` | `/api/auth/session` | All auth features | Verify current session | - | `{ user, role, permissions }` |
| `GET` | `/api/auth/me` | All auth features | Verify current session | - | `{ user, role, permissions }` |
| `POST` | `/api/auth/refresh-token` | All auth features | Refresh JWT token | `{ refresh_token }` | `{ token, refresh_token }` |
| `POST` | `/api/auth/forgot-password` | Implied | Password reset request | `{ email }` | `{ success: true }` |
| `POST` | `/api/auth/reset-password` | Implied | Password reset with token | `{ token, new_password }` | `{ success: true }` |

### Customer PIN Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `PUT` | `/api/auth/customer/{id}/pin` | FR-160 to FR-164 | Change customer PIN | `{ old_pin, new_pin }` | `{ success: true }` |
| `POST` | `/api/auth/customer/pin-reset` | Implied | Reset customer PIN (admin only) | `{ customer_id }` | `{ temporary_pin }` |

---

## Dashboard Endpoints

### Super Admin Dashboard
| HTTP Method | Endpoint | Feature Reference | Description | Query Params | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/dashboard/super-admin` | FR-069 to FR-075 | Get global KPI dashboard | `date_from, date_to, pt_id` | `{ kpis, charts, recent_activity }` |
| `GET` | `/api/dashboard/super-admin/kpis` | FR-069 to FR-070 | Get system-wide KPIs | `date_from, date_to` | `{ total_pts, active_branches, total_spk, revenue }` |
| `GET` | `/api/dashboard/super-admin/charts/pt-performance` | FR-071 to FR-073 | PT performance comparison | `date_from, date_to, metric` | `{ labels[], datasets[] }` |

### Admin PT Dashboard
| HTTP Method | Endpoint | Feature Reference | Description | Query Params | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/dashboard/admin-pt` | FR-109 to FR-115 | Get PT-scoped dashboard | `pt_id, branch_id, date_from, date_to` | `{ kpis, charts, due_spk }` |
| `GET` | `/api/dashboard/admin-pt/kpis` | FR-110 | Get PT KPI summary cards | `pt_id, branch_id` | `{ spk_due_7days, spk_overdue, active_items, overdue_ratio }` |
| `GET` | `/api/dashboard/admin-pt/charts/spk-due` | FR-111 | SPK due & overdue chart | `pt_id, branch_id, date_from` | `{ buckets[], counts[] }` |
| `GET` | `/api/dashboard/admin-pt/charts/pawn-trend` | FR-112 | Pawn transaction trend | `pt_id, branch_id, months` | `{ labels[], amounts[], counts[] }` |
| `GET` | `/api/dashboard/admin-pt/recent-spk` | FR-113 | Latest SPK list | `pt_id, branch_id, limit=5` | `{ spk[] }` |
| `GET` | `/api/dashboard/admin-pt/recent-nkb` | FR-113 | Latest NKB list | `pt_id, branch_id, limit=5` | `{ nkb[] }` |
| `GET` | `/api/dashboard/admin-pt/due-today` | FR-114 | Today's due SPK table | `pt_id, branch_id, date` | `{ spk[] }` |

---

## Transaction Endpoints

### SPK (Pawn Contract) Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/spk` | FR-150 to FR-154 (Admin), FR-086 to FR-097 (Customer) | List SPK with filters | Query: `pt_id, branch_id, customer_id, status, date_from, date_to, page, limit` | `{ spk[], total, page, pages }` |
| `GET` | `/api/spk/{id}` | FR-086 to FR-097, FR-150 | Get SPK detail | - | `{ spk, customer, items[], nkb[] }` |
| `POST` | `/api/spk` | FR-198 to FR-202 | Create new SPK | `{ customer_id, items[], amount, tenor, interest_rate, store_id }` | `{ spk_id, spk_number }` |
| `PUT` | `/api/spk/{id}/confirm` | FR-198 to FR-202 | Customer PIN confirmation | `{ customer_pin }` | `{ success: true }` |
| `GET` | `/api/spk/{id}/history` | FR-150, FR-086 | Get SPK transaction history | - | `{ events[] }` |
| `GET` | `/api/spk/{id}/nkb` | FR-086 to FR-097 | Get NKB records for SPK | - | `{ nkb[] }` |
| `PUT` | `/api/spk/{id}/extend` | FR-086 to FR-097 | Request SPK extension/renewal | `{ tenor, payment_amount }` | `{ nkb_id }` |
| `PUT` | `/api/spk/{id}/redeem` | FR-086 to FR-097 | Request full redemption | `{ payment_amount }` | `{ nkb_id, remaining_amount }` |

### NKB (Payment/Renewal) Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/nkb` | FR-203 to FR-207, FR-152 to FR-154 | List NKB records | Query: `pt_id, branch_id, spk_id, status, type, page, limit` | `{ nkb[], total }` |
| `GET` | `/api/nkb/{id}` | FR-203 to FR-207 | Get NKB detail | - | `{ nkb, spk, customer, payment_proof }` |
| `POST` | `/api/nkb` | System-generated | Create NKB record | `{ spk_id, amount, type, payment_method }` | `{ nkb_id, nkb_number }` |
| `PUT` | `/api/nkb/{id}/confirm` | FR-203 to FR-207 | Confirm NKB (Store Staff) | `{ notes }` | `{ success: true }` |
| `PUT` | `/api/nkb/{id}/reject` | FR-203 to FR-207 | Reject NKB | `{ reason }` | `{ success: true }` |
| `PUT` | `/api/nkb/{id}/status` | FR-203 to FR-207 | Update NKB status | `{ status, notes }` | `{ success: true }` |

### Financial Transactions

#### Cash Deposits (Setor Uang)
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/cash-deposits` | FR-140 to FR-144, FR-213 to FR-216 | List cash deposit requests | Query: `pt_id, store_id, status, date_from, date_to` | `{ deposits[], total }` |
| `POST` | `/api/cash-deposits` | FR-213 to FR-216 | Create deposit request | `{ store_id, amount, payment_method }` | `{ deposit_id, qr_code_url }` |
| `GET` | `/api/cash-deposits/{id}` | FR-140 to FR-144 | Get deposit detail | - | `{ deposit, payment_proof, approvals[] }` |
| `PUT` | `/api/cash-deposits/{id}/status` | FR-140 to FR-144 | Update deposit status | `{ status, notes }` | `{ success: true }` |
| `PUT` | `/api/cash-deposits/{id}/approve` | FR-140 to FR-144 | Approve deposit (Admin PT) | `{ notes }` | `{ success: true }` |
| `PUT` | `/api/cash-deposits/{id}/reject` | FR-140 to FR-144 | Reject deposit | `{ reason }` | `{ success: true }` |

#### Capital Top-up (Tambah Modal)
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/capital-topups` | FR-134 to FR-139, FR-217 to FR-221 | List capital requests | Query: `pt_id, store_id, status` | `{ topups[], total }` |
| `POST` | `/api/capital-topups` | FR-217 to FR-221 | Create capital request | `{ store_id, amount, reason }` | `{ topup_id }` |
| `GET` | `/api/capital-topups/{id}` | FR-134 to FR-139 | Get topup detail | - | `{ topup, store, approvals[] }` |
| `PUT` | `/api/capital-topups/{id}` | FR-217 to FR-221 | Edit pending request | `{ amount, reason }` | `{ success: true }` |
| `PUT` | `/api/capital-topups/{id}/approve` | FR-134 to FR-139 | Approve topup (Admin PT) | `{ notes }` | `{ success: true }` |
| `PUT` | `/api/capital-topups/{id}/reject` | FR-134 to FR-139 | Reject topup | `{ reason }` | `{ success: true }` |
| `PUT` | `/api/capital-topups/{id}/disburse` | FR-134 to FR-139 | Mark as disbursed | `{ disbursement_proof }` | `{ success: true }` |

#### Cash Mutations (Mutasi/Transaksi)
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/mutations` | FR-222 to FR-225 | List cash mutations | Query: `store_id, date_from, date_to, type` | `{ mutations[], opening_balance, closing_balance }` |
| `POST` | `/api/mutations` | FR-222 to FR-225 | Add manual mutation | `{ store_id, type, amount, description }` | `{ mutation_id }` |
| `GET` | `/api/mutations/balance` | FR-222 to FR-225 | Get current balance | Query: `store_id` | `{ balance, last_updated }` |

---

## Master Data Endpoints

### PT (Company) Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/pts` | FR-026 to FR-028 | List PTs | Query: `search, status, page, limit` | `{ pts[], total }` |
| `POST` | `/api/pts` | FR-029 to FR-034 | Create new PT | `{ code, name, email, phone, logo, primary_admin }` | `{ pt_id }` |
| `GET` | `/api/pts/{id}` | FR-052 to FR-054 | Get PT detail | - | `{ pt, admin, branches[], stats }` |
| `PUT` | `/api/pts/{id}` | FR-039 to FR-046 | Update PT | `{ name, email, phone, logo }` | `{ success: true }` |
| `DELETE` | `/api/pts/{id}` | FR-055 to FR-057 | Delete PT (soft delete) | - | `{ success: true }` |
| `PUT` | `/api/pts/{id}/status` | Implied | Activate/deactivate PT | `{ status }` | `{ success: true }` |

### Store/Branch Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/stores` | FR-165 to FR-169 | List stores | Query: `pt_id, status` | `{ stores[] }` |
| `POST` | `/api/stores` | FR-165 to FR-169 | Create store | `{ pt_id, code, name, alias, address, city }` | `{ store_id }` |
| `GET` | `/api/stores/{id}` | FR-165 to FR-169 | Get store detail | - | `{ store, staff[], stats }` |
| `PUT` | `/api/stores/{id}` | FR-165 to FR-169 | Update store | `{ name, alias, address, city }` | `{ success: true }` |
| `PUT` | `/api/stores/{id}/status` | FR-165 to FR-169 | Activate/deactivate | `{ status }` | `{ success: true }` |

### Customer Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/customers` | FR-160 to FR-164, FR-208 to FR-212 | List customers | Query: `pt_id, search, page, limit` | `{ customers[], total }` |
| `POST` | `/api/customers` | FR-208 to FR-212 | Create customer | `{ nik, name, dob, gender, address, city, phone, email, pin }` | `{ customer_id }` |
| `POST` | `/api/customers/scan-ktp` | FR-194 to FR-197 | OCR KTP data extraction | `{ image_base64 }` | `{ nik, name, dob, address, extracted_data }` |
| `GET` | `/api/customers/{id}` | FR-160 to FR-164 | Get customer detail | - | `{ customer, spk[], total_active_loans }` |
| `PUT` | `/api/customers/{id}` | FR-160 to FR-164 | Update customer | `{ phone, email, address }` | `{ success: true }` |
| `PUT` | `/api/customers/{id}/pin` | FR-160 to FR-164, FR-208 to FR-212 | Change PIN | `{ old_pin, new_pin }` or `{ new_pin }` (admin) | `{ success: true }` |
| `GET` | `/api/customers/{id}/spk` | FR-086 to FR-097 | Get customer SPK list | Query: `status` | `{ spk[] }` |

### Catalog Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/catalogs` | FR-176 to FR-180 | List catalog items | Query: `pt_id, item_type_id, search` | `{ catalogs[] }` |
| `POST` | `/api/catalogs` | FR-176 to FR-180 | Create catalog item | `{ pt_id, code, name, item_type_id, base_price, pawn_values, tenors }` | `{ catalog_id }` |
| `POST` | `/api/catalogs/import` | FR-176 to FR-180 | Bulk import catalogs | `{ file, pt_id }` | `{ imported_count, errors[] }` |
| `GET` | `/api/catalogs/{id}` | FR-176 to FR-180 | Get catalog detail | - | `{ catalog }` |
| `PUT` | `/api/catalogs/{id}` | FR-176 to FR-180 | Update catalog | `{ name, base_price, pawn_values }` | `{ success: true }` |
| `DELETE` | `/api/catalogs/{id}` | FR-176 to FR-180 | Delete catalog | - | `{ success: true }` |

### User/Staff Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/users` | FR-170 to FR-175, FR-007 to FR-025 | List users | Query: `pt_id, store_id, role, status` | `{ users[] }` |
| `POST` | `/api/users` | FR-170 to FR-175, FR-007 to FR-025 | Create user | `{ full_name, email, phone, role, pt_id, store_id, password }` | `{ user_id }` |
| `GET` | `/api/users/{id}` | FR-007 to FR-025 | Get user detail | - | `{ user, permissions[], activity[] }` |
| `PUT` | `/api/users/{id}` | FR-170 to FR-175, FR-014 to FR-020 | Update user | `{ full_name, email, phone, role }` | `{ success: true }` |
| `PUT` | `/api/users/{id}/status` | FR-170 to FR-175 | Activate/deactivate | `{ status }` | `{ success: true }` |
| `PUT` | `/api/users/{id}/password` | Implied | Reset password | `{ new_password }` | `{ success: true }` |

### System Master Data

#### Item Types
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/item-types` | FR-058 to FR-063 | List item types | Query: `search` | `{ item_types[] }` |
| `POST` | `/api/item-types` | FR-059 to FR-063 | Create item type | `{ code, name }` | `{ item_type_id }` |
| `PUT` | `/api/item-types/{id}` | FR-059 to FR-063 | Update item type | `{ name }` | `{ success: true }` |
| `DELETE` | `/api/item-types/{id}` | FR-059 to FR-063 | Delete item type | - | `{ success: true }` |

#### Pawn Terms (Syarat Mata)
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/pawn-terms` | Implied | List pawn terms | Query: `pt_id, item_type_id` | `{ terms[] }` |
| `POST` | `/api/pawn-terms` | Implied | Create pawn term | `{ pt_id, item_type_id, loan_limits, tenor, interest_rate }` | `{ term_id }` |
| `PUT` | `/api/pawn-terms/{id}` | Implied | Update pawn term | `{ loan_limits, interest_rate }` | `{ success: true }` |

---

## Inventory Endpoints

### Stock Opname Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/stock-opname` | FR-116 to FR-126 | List SO sessions | Query: `pt_id, store_id, status` | `{ sessions[] }` |
| `POST` | `/api/stock-opname` | FR-116 to FR-120 | Create SO session | `{ pt_id, store_id, session_code, start_date }` | `{ so_id }` |
| `GET` | `/api/stock-opname/{id}` | FR-121 to FR-126 | Get SO detail | - | `{ session, items[], variances[], staff[] }` |
| `PUT` | `/api/stock-opname/{id}/items` | FR-232 to FR-236 | Update item counts | `{ item_counts[] }` | `{ success: true }` |
| `POST` | `/api/stock-opname/{id}/items/{item_id}/condition` | FR-232 to FR-236 | Record item condition | `{ condition, notes, photos }` | `{ success: true }` |
| `PUT` | `/api/stock-opname/{id}/complete` | FR-232 to FR-236 | Complete SO session | - | `{ success: true }` |
| `PUT` | `/api/stock-opname/{id}/approve` | FR-121 to FR-126 | Approve SO (Admin PT) | `{ notes }` | `{ success: true }` |
| `GET` | `/api/stock-opname/{id}/qr/{item_id}` | FR-234 to FR-235 | Generate item QR code | - | `{ qr_code_url }` |

---

## Auction Endpoints

### Auction Batch Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/auction-batches` | FR-127 to FR-133 | List auction batches | Query: `pt_id, branch_id, status` | `{ batches[] }` |
| `POST` | `/api/auction-batches` | FR-127 to FR-133 | Create auction batch | `{ pt_id, batch_code, branch_id, auction_date }` | `{ batch_id }` |
| `GET` | `/api/auction-batches/{id}` | FR-127 to FR-133 | Get batch detail | - | `{ batch, items[], stats }` |
| `PUT` | `/api/auction-batches/{id}` | FR-127 to FR-133 | Update batch | `{ auction_date, status }` | `{ success: true }` |
| `GET` | `/api/auction-batches/{id}/items` | FR-127 to FR-133 | List items in batch | - | `{ items[] }` |

### Auction Item Management
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `POST` | `/api/auction-items` | FR-127 to FR-133 | Add item to auction | `{ batch_id, spk_id, item_id, reserve_price }` | `{ auction_item_id }` |
| `PUT` | `/api/auction-items/{id}/status` | FR-127 to FR-133, FR-243 to FR-247 | Update item status | `{ status }` (Not Prepared, Ready, In Auction, Sold, Unsold) | `{ success: true }` |
| `PUT` | `/api/auction-items/{id}/validate` | FR-243 to FR-247 | Validate item (Auction Staff) | `{ condition, notes }` | `{ success: true }` |
| `PUT` | `/api/auction-items/{id}/notes` | FR-254 to FR-258 | Add marketing notes | `{ notes }` | `{ success: true }` |
| `POST` | `/api/auction-items/{id}/assets` | FR-254 to FR-258 | Upload marketing assets | `{ files[] }` | `{ asset_urls[] }` |
| `GET` | `/api/auction-items/{id}/qr` | FR-131, FR-243 to FR-247 | Get item QR code | - | `{ qr_code_url }` |

---

## Reports & Notifications

### Transaction Reports
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/reports/transactions` | FR-155 to FR-159 | Generate transaction report | Query: `pt_id, branch_id, date_from, date_to, type, format` | `{ report_data[] }` or file download |
| `GET` | `/api/reports/spk` | FR-155 to FR-159 | SPK summary report | Query: `pt_id, date_from, date_to, format` | `{ spk_stats, breakdown[] }` |
| `GET` | `/api/reports/auctions` | Implied | Auction performance report | Query: `pt_id, date_from, date_to` | `{ auction_stats[] }` |
| `POST` | `/api/reports/export` | FR-155 to FR-159 | Export report to file | `{ report_type, filters, format }` (CSV, PDF, Excel) | `{ download_url }` |

### Notifications
| HTTP Method | Endpoint | Feature Reference | Description | Request Body | Response |
|-------------|----------|-------------------|-------------|--------------|----------|
| `GET` | `/api/notifications` | FR-064 to FR-068, FR-186 to FR-189 | List notifications | Query: `user_id, read_status, type, page, limit` | `{ notifications[], unread_count }` |
| `GET` | `/api/notifications/{id}` | All notification features | Get notification detail | - | `{ notification }` |
| `PUT` | `/api/notifications/{id}/read` | All notification features | Mark as read | - | `{ success: true }` |
| `PUT` | `/api/notifications/read-all` | All notification features | Mark all as read | - | `{ success: true, count }` |
| `POST` | `/api/notifications` | System-generated | Create notification (system) | `{ user_id, title, description, type, related_entity }` | `{ notification_id }` |
| `GET` | `/api/notifications/unread-count` | All notification features | Get unread count | Query: `user_id` | `{ count }` |

---

## Naming Conventions

### URL Structure
```
/api/{domain}/{entity}/{id?}/{action?}
```

**Examples:**
- `/api/spk` - List SPK
- `/api/spk/123` - Get SPK #123
- `/api/spk/123/confirm` - Confirm SPK #123
- `/api/cash-deposits/456/approve` - Approve deposit #456

### HTTP Method Mapping
- `GET` - Retrieve resource(s)
- `POST` - Create new resource
- `PUT` - Update existing resource or perform action
- `DELETE` - Remove resource (soft delete preferred)
- `PATCH` - Partial update (use sparingly)

### Query Parameters
- **Pagination:** `page`, `limit`, `offset`
- **Filtering:** `status`, `type`, `date_from`, `date_to`
- **Search:** `search`, `query`
- **Sorting:** `sort_by`, `order` (asc/desc)
- **Scoping:** `pt_id`, `store_id`, `branch_id`, `customer_id`

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "errors": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate, constraint violation)
- `422` - Unprocessable Entity (business logic error)
- `500` - Internal Server Error

---

## Authentication & Authorization

### Headers Required
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-PT-ID: {pt_id}         (for PT-scoped requests)
X-Store-ID: {store_id}   (for store-scoped requests)
```

### Permission Scoping
- **Super Admin:** Access all PTs, unrestricted
- **Admin PT:** Scoped to `pt_id` from user profile
- **Store Staff:** Scoped to `store_id` from user profile
- **Customer:** Scoped to own `customer_id` only

---

## Notes for Backend Developers

1. **PT/Store Scoping:** Always filter queries by `pt_id` and/or `store_id` based on user role
2. **Audit Logging:** Log all CUD operations (Create, Update, Delete) to `audit_logs` table
3. **Soft Deletes:** Never hard delete financial records (SPK, NKB); use `deleted_at` timestamp
4. **Transactions:** Wrap multi-step operations (SPK creation, NKB confirmation) in DB transactions
5. **Validation:** Enforce business rules (loan limits, tenor constraints) at API level
6. **Rate Limiting:** Implement rate limits per user/role to prevent abuse
7. **Caching:** Cache master data (item types, catalogs) with appropriate TTL
8. **File Uploads:** Use signed URLs for S3/cloud storage; validate file types/sizes
9. **Notifications:** Use queues for async notification delivery (email, SMS, push)
10. **Testing:** Write integration tests for critical flows (SPK creation, payment confirmation)

---

**End of API Endpoint Mapping Document**
