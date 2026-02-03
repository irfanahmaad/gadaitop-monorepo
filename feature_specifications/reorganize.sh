#!/bin/bash
# Gadaitop Feature Specifications Reorganization Script
# This script reorganizes feature specs from role-based to domain-based structure

BASE_DIR="/sessions/ecstatic-happy-brahmagupta/mnt/feature_specifications"
cd "$BASE_DIR"

echo "Starting reorganization..."

# ============================================================
# AUTHENTICATION DOMAIN
# ============================================================
echo "Organizing Authentication features..."

# Super Admin Login (FR-076 to FR-080)
cp "Super Admin/SA01-Login Page.md" "auth/super-admin-login.md"

# Admin PT Login (FR-105 to FR-108)
cp "Admin PT/A03-Admin PT Login.md" "auth/admin-pt-login.md"

# Store Staff Login (FR-190 to FR-193)
cp "Staf Toko/ST01-Login (Staf Toko).md" "auth/store-staff-login.md"

# Customer Portal Login (FR-081 to FR-085)
cp "Customer/C01-Customer Login Portal.md" "auth/customer-login.md"

# Stock Opname Staff Login
cp "Staf Stock Opname/SSO01-Login (Staf Stock Opname).md" "auth/stock-opname-staff-login.md"

# Auction Staff Login
cp "Staf Lelang/SL02-Login (Staf Lelang).md" "auth/auction-staff-login.md"

# Marketing Staff Login
cp "Staf Marketing/L02-Login (Staf Marketing).md" "auth/marketing-staff-login.md"

# ============================================================
# DASHBOARD DOMAIN
# ============================================================
echo "Organizing Dashboard features..."

# Super Admin Dashboard (FR-069 to FR-075)
cp "Super Admin/SA00-Dashboard.md" "dashboard/super-admin-dashboard.md"

# Admin PT Dashboard (FR-109 to FR-115)
cp "Admin PT/A00-Admin PT Dashboard.md" "dashboard/admin-pt-dashboard.md"

# ============================================================
# TRANSACTIONS DOMAIN
# ============================================================
echo "Organizing Transaction features..."

# SPK - Admin PT
cp "Admin PT/A08-SPK (Admin PT).md" "transactions/spk/admin-pt-spk-management.md"

# SPK - Store Staff
cp "Staf Toko/ST08-SPK (Staf Toko).md" "transactions/spk/store-staff-spk-create.md"

# SPK - Customer
cp "Customer/C03.1-List SPK Customer.md" "transactions/spk/customer-spk-list.md"
cp "Customer/C03.3-View Customer SPK Detail.md" "transactions/spk/customer-spk-detail.md"

# NKB - Store Staff
cp "Staf Toko/ST04-NKB (Staf Toko).md" "transactions/nkb/store-staff-nkb-management.md"

# Financial - Cash Deposits (Setor Uang)
cp "Admin PT/A07-Fitur Setor Uang.md" "transactions/financial/admin-pt-cash-deposit.md"
cp "Staf Toko/ST07-Setor Uang (Staf Toko).md" "transactions/financial/store-staff-cash-deposit.md"

# Financial - Capital Top-up (Tambah Modal)
cp "Admin PT/A09.3-Fitur Tambah Modal.md" "transactions/financial/admin-pt-capital-topup.md"
cp "Staf Toko/ST09-Tambah Modal (Staf Toko).md" "transactions/financial/store-staff-capital-topup.md"

# Financial - Mutations (Mutasi/Transaksi)
cp "Admin PT/A05-Mutasi:Transaksi.md" "transactions/financial/admin-pt-cash-mutations.md"
cp "Staf Toko/ST03-Mutasi:Transaksi List.md" "transactions/financial/store-staff-cash-mutations.md"

# ============================================================
# MASTER DATA DOMAIN
# ============================================================
echo "Organizing Master Data features..."

# PT Management (Super Admin)
cp "Super Admin/SA02.0-List PT.md" "master-data/pt/pt-list.md"
cp "Super Admin/SA02.1-Add New PT.md" "master-data/pt/pt-create.md"
cp "Super Admin/SA02.3-Edit PT.md" "master-data/pt/pt-edit.md"
cp "Super Admin/SA02.5-View PT Details.md" "master-data/pt/pt-detail.md"

# Store/Branch Management (Admin PT)
cp "Admin PT/A04.5-Master Toko (Admin PT).md" "master-data/store/admin-pt-store-management.md"

# Customer Management
cp "Admin PT/A04.1-Master Data Customer (Admin PT).md" "master-data/customer/admin-pt-customer-management.md"
cp "Staf Toko/ST02-Master Data Pengguna (Staf Toko).md" "master-data/customer/store-staff-customer-management.md"
cp "Customer/C03.2-View Customer Profile.md" "master-data/customer/customer-profile-view.md"

# KTP Scanning
cp "Staf Toko/ST06-Scan KTP (Staf Toko).md" "master-data/customer/store-staff-ktp-scan.md"

# Catalog Management (Admin PT)
cp "Admin PT/A04.2-Master Data Katalog (Admin PT).md" "master-data/catalog/admin-pt-catalog-management.md"

# User Management
cp "Admin PT/A04.3-Master Data Pengguna (Admin PT).md" "master-data/user/admin-pt-user-management.md"
cp "Super Admin/SA03.0-List Super Admin.md" "master-data/user/super-admin-list.md"
cp "Super Admin/SA03.1-Add New Super Admin.md" "master-data/user/super-admin-create.md"
cp "Super Admin/SA03.2-View Super Admin Detail.md" "master-data/user/super-admin-detail.md"
cp "Super Admin/SA03.3-Edit Super Admin.md" "master-data/user/super-admin-edit.md"

# System Master Data - Item Types
cp "Super Admin/SA04.0-List Tipe Barang.md" "master-data/system/item-type-list.md"
cp "Super Admin/SA04.1-Add, Edit, and Delete PopUp Tipe Barang" "master-data/system/item-type-management.md"

# Syarat Mata
cp "Admin PT/A04.4-Master Data Syarat \"Mata\" (Admin PT).md" "master-data/system/admin-pt-pawn-terms.md"

# ============================================================
# INVENTORY DOMAIN
# ============================================================
echo "Organizing Inventory features..."

# Stock Opname - Admin PT
cp "Admin PT/A09.1-View Stock Opname Detail.md" "inventory/admin-pt-stock-opname-detail.md"
cp "Admin PT/A09.2-View Stock Opname List.md" "inventory/admin-pt-stock-opname-list.md"

# Stock Opname - Staff
cp "Staf Stock Opname/SSO02-Stock Opname.md" "inventory/stock-opname-staff-counting.md"

# ============================================================
# AUCTION DOMAIN
# ============================================================
echo "Organizing Auction features..."

# Auction - Admin PT
cp "Admin PT/A02-Daftar Lelang (Item List).md" "auction/admin-pt-auction-management.md"

# Auction - Auction Staff
cp "Staf Lelang/SL01-Lelang (Staf Lelang).md" "auction/auction-staff-validation.md"

# Auction - Marketing Staff
cp "Staf Marketing/L01-Lelangan (Staf Marketing).md" "auction/marketing-staff-auction.md"

# ============================================================
# REPORTS & NOTIFICATIONS DOMAIN
# ============================================================
echo "Organizing Reports and Notifications..."

# Reports - Admin PT
cp "Admin PT/A01-Laporan Transaksi.md" "reports/admin-pt-transaction-reports.md"

# Notifications - Super Admin
cp "Super Admin/SA05-Notification List.md" "reports/super-admin-notifications.md"

# Notifications - Admin PT
cp "Admin PT/A06-Notifikasi (Admin PT).md" "reports/admin-pt-notifications.md"

# Notifications - Customer
cp "Customer/C02-View Customer Notification List.md" "reports/customer-notifications.md"

# Notifications - Store Staff
cp "Staf Toko/ST05-Notifikasi (Staf Toko).md" "reports/store-staff-notifications.md"

# Notifications - Stock Opname Staff
cp "Staf Stock Opname/SSO03-Notification (Staf Stock Opname).md" "reports/stock-opname-staff-notifications.md"

# Notifications - Auction Staff
cp "Staf Lelang/SL03-Notification.md" "reports/auction-staff-notifications.md"

# Notifications - Marketing Staff
cp "Staf Marketing/L03-Notification.md" "reports/marketing-staff-notifications.md"

echo "File reorganization complete!"
echo ""
echo "Files have been copied to new domain-based structure."
echo "Original files remain in place for verification."
