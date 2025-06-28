# MongoDB Atlas Connection Helper

## Current Connection String Format:
```
mongodb+srv://aniruddhagayki0:<NEW_PASSWORD>@cluster0.hujehyy.mongodb.net/projectbuzz?retryWrites=true&w=majority
```

## Steps to Update:

1. **Get New Password from Atlas Dashboard**
   - Database Access → Edit User → Edit Password
   - Copy the new password

2. **Update backend/.env file**
   Replace line 7 with the new connection string:
   ```
   MONGO_URI=mongodb+srv://aniruddhagayki0:<NEW_PASSWORD>@cluster0.hujehyy.mongodb.net/projectbuzz?retryWrites=true&w=majority
   ```

3. **Test Connection**
   ```bash
   npm run test:connection
   ```

## Common Issues:

- **Special Characters in Password**: If password contains special characters, they need to be URL-encoded:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `$` becomes `%24`
  - `%` becomes `%25`
  - `&` becomes `%26`

- **IP Whitelist**: Make sure your IP is whitelisted in Network Access

- **User Permissions**: Ensure user has "Read and write to any database" permissions

## Alternative: Create New User

If issues persist, create a new database user:

1. Database Access → Add New Database User
2. Username: `projectbuzz-admin`
3. Password: Generate strong password
4. Database User Privileges: "Read and write to any database"
5. Update connection string with new credentials

## Test Commands:
```bash
# Test connection
npm run test:connection

# Full health check
npm run atlas:health

# Migration verification
npm run atlas:migrate
```
