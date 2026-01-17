# Postman Collection Setup

## Import Instructions

1. **Import Collection:**
   - Open Postman
   - Click "Import" button
   - Select `GadaiTop_API.postman_collection.json`
   - Click "Import"

2. **Import Environment:**
   - Click "Import" button again
   - Select `GadaiTop_API.postman_environment.json`
   - Click "Import"
   - Select "Gadai Top API - Local" from the environment dropdown (top right)

## Collection Structure

### 📁 Auth Folder
- **Register** - Create a new user account
- **Login** - Authenticate and get access token (auto-saves token)
- **Get Current User** - Get authenticated user info (requires token)
- **Logout** - Invalidate current token (requires token)
- **Forgot Password** - Request password reset token
- **Reset Password** - Reset password with token
- **Verify Email** - Verify email with token

### 📁 Health Folder
- **Health Check** - Check API and database status

### 📁 Links Folder
- **Create Link** - Create a new link (requires token)
- **Get All Links** - List all links (requires token)
- **Get Link by ID** - Get specific link (requires token)
- **Update Link** - Update a link (requires token)
- **Delete Link** - Delete a link (requires token)

### 📁 Root Folder
- **Root Endpoint** - Basic API root

## Testing Workflow

### 1. First Time Setup
1. Start your API server: `pnpm dev:api`
2. Make sure your database is running and migrations are applied
3. Import the collection and environment in Postman

### 2. Register a New User
1. Go to **Auth > Register**
2. Update the email and password in the request body
3. Click "Send"
4. The access token will be automatically saved to collection variables

### 3. Login (Alternative)
1. Go to **Auth > Login**
2. Use the same email/password from registration
3. Click "Send"
4. Token will be automatically saved

### 4. Test Protected Endpoints
1. After login/register, the token is automatically set
2. All protected endpoints (marked with 🔒) will use this token
3. Try **Auth > Get Current User** to verify authentication works

### 5. Test Links CRUD
1. Use **Links > Create Link** to create a link
2. Use **Links > Get All Links** to list them
3. Use **Links > Get Link by ID** with the ID from the list
4. Use **Links > Update Link** to modify it
5. Use **Links > Delete Link** to remove it

## Environment Variables

The collection uses these variables:
- `baseUrl` - API base URL (default: http://localhost:8080)
- `accessToken` - JWT token (auto-populated after login/register)
- `userId` - Current user ID (auto-populated after login/register)

## Notes

- **Auto Token Management**: Login and Register requests automatically save the token to `accessToken` variable
- **Bearer Auth**: All protected endpoints use Bearer token authentication
- **Base URL**: Update `baseUrl` variable if your API runs on a different port
- **Test Data**: Update email/password in requests or use environment variables

## Troubleshooting

1. **401 Unauthorized**: Make sure you've logged in/registered first
2. **Connection Error**: Verify your API server is running on the correct port
3. **Token Expired**: Re-login to get a new token
4. **Validation Errors**: Check request body matches the DTO requirements
