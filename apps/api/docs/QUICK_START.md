# Quick Start Guide - GadaiTop API Documentation

Welcome to the GadaiTop API documentation! This guide will help you quickly find what you need.

## 📚 Documentation Files

### Main Documentation
- **[README.md](./README.md)** - Start here for system overview, architecture, and getting started
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API endpoint reference with examples
- **[DOCUMENTATION_SUMMARY.md](./DOCUMENTATION_SUMMARY.md)** - Summary of all documentation

### Module Documentation
- **[modules/README.md](./modules/README.md)** - Index of all 25 modules with relationships
- **[modules/auth.md](./modules/auth.md)** - Authentication & authorization (detailed)
- **[modules/spk.md](./modules/spk.md)** - Pawn agreements (detailed)

## 🚀 Quick Links

### For Developers
1. **Getting Started**: [README.md#getting-started](./README.md#getting-started)
2. **Architecture**: [README.md#architecture](./README.md#architecture)
3. **Module List**: [modules/README.md](./modules/README.md)
4. **Auth Module**: [modules/auth.md](./modules/auth.md)

### For API Users
1. **API Reference**: [API_REFERENCE.md](./API_REFERENCE.md)
2. **Authentication**: [API_REFERENCE.md#authentication](./API_REFERENCE.md#authentication)
3. **Error Handling**: [API_REFERENCE.md#error-responses](./API_REFERENCE.md#error-responses)
4. **Postman Collection**: `../GadaiTop_API.postman_collection.json`

### By Feature

#### Authentication & Users
- [Auth Endpoints](./API_REFERENCE.md#authentication)
- [User Endpoints](./API_REFERENCE.md#users)
- [Auth Module Details](./modules/auth.md)

#### Pawn Operations
- [SPK Module](./modules/spk.md)
- Company & Branch: [API Reference](./API_REFERENCE.md)

#### Master Data
- [Item Types](./API_REFERENCE.md#item-types)
- [Branches](./API_REFERENCE.md#branches)
- [Companies](./API_REFERENCE.md#companies)

#### Security & Audit
- [Device Registration](./API_REFERENCE.md#devices)
- [Audit Logs](./API_REFERENCE.md#audit-logs)

## 📖 How to Use

### 1. First Time Setup

```bash
# Navigate to API directory
cd apps/api

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

### 2. Test with Postman

1. Import `GadaiTop_API.postman_collection.json`
2. Set `baseUrl` variable to `http://localhost:8080`
3. Login to get access token (auto-populated)
4. Test endpoints

### 3. Explore the API

- **Base URL**: `http://localhost:8080`
- **API Version**: `v1`
- **All endpoints**: `/v1/*`

## 🔍 Find What You Need

### "How do I authenticate?"
→ [API Reference - Authentication](./API_REFERENCE.md#authentication)  
→ [Auth Module](./modules/auth.md)

### "What endpoints are available?"
→ [API Reference](./API_REFERENCE.md)  
→ [Postman Collection](../GadaiTop_API.postman_collection.json)

### "How does the pawn system work?"
→ [SPK Module](./modules/spk.md)  
→ [Module Index](./modules/README.md)

### "What are all the modules?"
→ [Module Index](./modules/README.md)  
→ [Main README](./README.md#modules)

### "How do I handle errors?"
→ [API Reference - Error Responses](./API_REFERENCE.md#error-responses)  
→ [Main README - Error Handling](./README.md#error-handling)

### "What's the database schema?"
→ [Main README - Database Schema](./README.md#database-schema)  
→ [Module Documentation](./modules/) (entity structures)

## 📊 Documentation Coverage

### ✅ Fully Documented
- Authentication & Authorization
- API Endpoints (10 categories)
- Auth Module (detailed)
- SPK Module (detailed)
- Module Index

### 📝 API Reference Only
- Companies, Branches, Users
- Item Types, Devices
- Audit Logs, Borrow Requests

### 🔜 Needs Detailed Docs
- Customer, NKB, Pawn Term
- Auction, Catalog
- Financial modules
- Other system modules

## 🛠️ Development Workflow

1. **Read** [README.md](./README.md) for overview
2. **Review** [API_REFERENCE.md](./API_REFERENCE.md) for endpoints
3. **Study** [modules/](./modules/) for implementation details
4. **Test** with Postman collection
5. **Build** your integration

## 📞 Support

- **Documentation Issues**: Check [DOCUMENTATION_SUMMARY.md](./DOCUMENTATION_SUMMARY.md)
- **API Questions**: Review [API_REFERENCE.md](./API_REFERENCE.md)
- **Module Details**: See [modules/README.md](./modules/README.md)

## 🎯 Common Tasks

### Authenticate a User
```bash
POST /v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```
→ [Details](./API_REFERENCE.md#login)

### Create a Pawn Agreement
```bash
POST /v1/spk
{
  "customerId": "uuid",
  "principalAmount": 1000000,
  ...
}
```
→ [Details](./modules/spk.md#create-spk)

### List Branches
```bash
GET /v1/branches?page=1&pageSize=10
```
→ [Details](./API_REFERENCE.md#list-branches)

---

**Happy Coding! 🚀**

For the complete documentation, start with [README.md](./README.md)
