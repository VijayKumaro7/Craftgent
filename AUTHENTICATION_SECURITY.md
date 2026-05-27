# Craftgent Authentication & Security Guide

## Overview

Craftgent uses industry-standard security practices for user authentication and password management. This document explains:
- How accounts and passwords are stored securely
- Password requirements and best practices
- Token management and session security
- Security considerations for deployment

---

## Account & Password Storage

### Password Storage (Backend)

**Never store raw passwords.** Craftgent uses **bcrypt** for password hashing:

```python
# Backend: /app/auth/security.py
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()
```

**What this means:**
- Passwords are **never stored in plain text** in the database
- Each password is hashed with a unique salt (bcrypt automatically generates this)
- Even if someone accesses the database, they cannot recover passwords
- The same password produces a different hash every time (because of the unique salt)

### Database Storage

User accounts are stored in PostgreSQL with the following schema:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_gen_v4(),
    username VARCHAR(64) UNIQUE NOT NULL,
    hashed_password VARCHAR(256) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key security points:**
- `id`: Unique identifier (UUID, not guessable)
- `username`: Unique username constraint (case-insensitive lookups)
- `hashed_password`: Only bcrypt hash stored, never the raw password
- `created_at`: Account creation timestamp for audit logs

---

## Password Requirements

Craftgent enforces strong password policies to prevent common attacks:

### Minimum Requirements
✓ **At least 12 characters**
✓ **At least one uppercase letter** (A-Z)
✓ **At least one lowercase letter** (a-z)
✓ **At least one digit** (0-9)
✓ **At least one special character** (!@#$%^&*()_+-=[]{}|;:,.<>?)
✓ **Not a common password** (denylist of 100+ known breached passwords)
✓ **Cannot contain username**

### Why These Requirements?
- **12+ characters**: Longer passwords are exponentially harder to crack
- **Character variety**: Mixed case + numbers + symbols prevent dictionary attacks
- **Common password check**: Prevents reuse of known compromised passwords
- **No username embedding**: Prevents semantic attacks

### Example Valid Passwords
❌ `Password123` — Only 11 chars
❌ `MyPassword1` — Missing special character
✓ `MySecureP@ss2024` — 16 chars, mixed case, digit, special
✓ `Coffee&Code!2025` — All requirements met

---

## Token Management

### Access Token (Short-lived)
- **Lifespan**: 30 minutes
- **Storage**: Memory (not localStorage, for XSS protection)
- **Use**: Included in `Authorization: Bearer <token>` header
- **Purpose**: Proves your identity for each API request

### Refresh Token (Long-lived)
- **Lifespan**: 7 days
- **Storage**: httpOnly cookie (browser-managed, JavaScript cannot access)
- **Flags**: `Secure` (HTTPS only), `SameSite=Strict` (same-origin only)
- **Purpose**: Silently renews your access token when it expires

### Token Security
```typescript
// Frontend: Tokens are in memory only, never localStorage
const { accessToken } = useAuthStore()
// NEVER do: localStorage.setItem('token', token)

// Refresh tokens are auto-managed by the browser
response.set_cookie(
  key="refresh_token",
  value=refresh_token,
  httponly=True,      // JS cannot access this
  secure=True,        // HTTPS only
  samesite="strict",  // Same-origin requests only
  max_age=604800      // 7 days
)
```

---

## Authentication Flow

### Registration

1. **User submits username + password**
2. **Frontend validates**:
   - Username: 3-32 characters, no whitespace
   - Password: All 7 requirements checked
3. **Backend validates again**:
   - Username uniqueness (case-insensitive)
   - Password strength (redundant check)
4. **Password hashing**: `bcrypt.hashpw(password, salt)`
5. **Database insert**: User row created with hashed password
6. **Auto-login**: Access token issued immediately after registration

### Login

1. **User submits username + password**
2. **Database lookup**: Find user by username (case-insensitive)
3. **Password verification**:
   ```python
   bcrypt.checkpw(submitted_password, stored_hash) → True/False
   ```
4. **Timing protection**: Even if user doesn't exist, bcrypt runs (constant time)
5. **Token generation**:
   - Access token: 30-minute JWT
   - Refresh token: 7-day JWT in httpOnly cookie
6. **Frontend stores**: Access token in memory only

### Session Refresh

1. **Access token expires** (after 30 minutes)
2. **Axios interceptor detects 401 error**
3. **Sends refresh token** (in cookie, automatic)
4. **Backend validates refresh token**
5. **Issues new access token**
6. **Axios retries original request** with new token
7. **All automatic** — user doesn't see a login screen

### Logout

1. **Frontend clears**: In-memory access token deleted
2. **Authorization header removed** from all future requests
3. **Refresh cookie**: Automatically expires (browser's job)
4. **Next API call fails** with 401 → User redirected to login

---

## Security Hardening (Deployment)

### Environment Variables (.env)

**CRITICAL: Never commit .env to git**

```bash
# Generate a strong SECRET_KEY (32+ chars)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Store in .env
SECRET_KEY=your-generated-key-here
```

### Production Checklist

✓ **Set APP_ENV=production**
- Disables detailed error messages
- Disables API documentation (/docs endpoint)

✓ **Use HTTPS/TLS**
- Both frontend and backend must use HTTPS
- Set `secure=True` on refresh tokens
- Browser will refuse to send cookies over HTTP

✓ **Database Security**
- Use managed PostgreSQL (AWS RDS, Supabase, etc.)
- Enable encryption at rest
- Use strong credentials (not `craftgent:craftgent`)
- Restrict network access (VPC, security groups)

✓ **CORS Configuration**
```python
# In production, specify exact domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
# NOT: http://localhost:3000 or *
```

✓ **Rate Limiting**
- Register: 5 attempts per minute per IP
- Login: 10 attempts per minute per IP
- Prevents brute-force attacks

✓ **Logging & Monitoring**
- All auth events logged (registration, login, failures)
- Set up alerts for suspicious patterns (10+ failed logins)
- Monitor bcrypt performance (should be ~100-200ms)

---

## How Passwords Are NOT Stored

### ❌ Plain Text
```python
# WRONG - Never do this
user.password = "MyPassword123"
```

### ❌ Simple Encryption
```python
# WRONG - Symmetric encryption can be reversed
user.password = encrypt_aes("MyPassword123", key)
```

### ❌ Weak Hash
```python
# WRONG - MD5/SHA1 are too fast, GPU cracking possible
user.password = hashlib.sha1("MyPassword123")
```

### ✓ bcrypt (What Craftgent Uses)
```python
# RIGHT - Salted, slow, resistant to GPU/ASIC attacks
user.password = bcrypt.hashpw(b"MyPassword123", bcrypt.gensalt())
# Takes ~100-200ms to verify, making brute force impractical
```

---

## Best Practices for Users

### Creating Accounts

1. **Choose a unique username**
   - Not your email address
   - Not something guessable (birthdate, pet name, etc.)
   - 3-32 characters

2. **Create a strong password**
   - Use a password manager (Bitwarden, 1Password, etc.)
   - Avoid reusing passwords across sites
   - Don't use personal information
   - Example generator: `openssl rand -base64 16 | tr '+/' '-_'`

3. **Never share your credentials**
   - Craftgent staff will never ask for your password
   - Don't store in plain text files
   - Use environment variables or .env files in production

### Example Strong Passwords

✓ `Tr0pic@l!Summit2024` — memorable, strong
✓ `SparklingCoder#42` — uses username theme
✓ `K8@!zP$mR9%xL2#Q` — random (generated), very strong

### Password Manager Integration

Modern password managers can autofill registration:
1. Click "Register"
2. Fill username
3. Password manager generates 16+ char password
4. It meets all requirements automatically
5. Saved for future logins

---

## Common Issues & Troubleshooting

### "Registration failed"

Likely cause: **Password doesn't meet requirements**

**Solution**:
1. Check frontend error message for specific requirement
2. Ensure password has:
   - At least **12 characters**
   - **Uppercase** letter (A-Z)
   - **Lowercase** letter (a-z)
   - **Digit** (0-9)
   - **Special character** (!@#$%)
3. Don't include your username
4. Try: `TestPass@2024` (if your username is `myuser`, use different special char)

### "Username already taken"

**Solution**:
- Username is case-insensitive
- `john` and `John` are the same username
- Try appending a number: `john2024`

### "Session expired"

**What happened**:
- Your access token expired (30 minutes)
- Refresh token attempt failed (7 days expired? or wrong browser?)

**Solution**:
- Log in again — takes 2 seconds
- If using multiple devices, log in on each one
- Refresh tokens are device-specific (httpOnly cookies)

### Forgot Password

**Current limitation**: Craftgent doesn't have password reset yet

**Workaround**:
1. Contact admin to delete your account
2. Register with the same username
3. Use a new password

**Future feature**: Email-based password reset (planned)

---

## API Endpoints

### POST /api/auth/register
Create a new account

**Request**:
```json
{
  "username": "john2024",
  "password": "SecurePass@2024"
}
```

**Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john2024"
}
```

**Error** (422 - validation):
```json
{
  "detail": "Password must contain at least one uppercase letter"
}
```

**Error** (409 - conflict):
```json
{
  "detail": "Username already taken"
}
```

### POST /api/auth/login
Authenticate and get tokens

**Request**:
```json
{
  "username": "john2024",
  "password": "SecurePass@2024"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

**Cookie** (set automatically):
```
refresh_token=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error** (401):
```json
{
  "detail": "Invalid username or password"
}
```

### POST /api/auth/refresh
Get new access token (automatic)

**Response** (200):
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### GET /api/auth/me
Get current user info (requires token)

**Headers**:
```
Authorization: Bearer eyJhbGc...
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john2024"
}
```

**Error** (401):
```json
{
  "detail": "Not authenticated"
}
```

---

## Security Incident Response

### If your password is compromised

1. **Change it immediately**:
   - Log out all sessions
   - Update password with a completely new one
   - Use a password manager to generate a new one

2. **Check if used elsewhere**:
   - Use [haveibeenpwned.com](https://haveibeenpwned.com)
   - Change password on any sites with same password
   - Enable 2FA on important accounts

### If the database is compromised

**What Craftgent users are protected from**:
- ✓ Attackers cannot recover passwords (bcrypt is irreversible)
- ✓ Attackers cannot use hashes on other sites (bcrypt salt is unique)
- ✓ Would take millions of years to crack bcrypt offline

**Your responsibility**:
- Change your password anyway (new bcrypt hash)
- Monitor your account for unauthorized access
- Use unique passwords across sites

---

## References

- **bcrypt**: https://en.wikipedia.org/wiki/Bcrypt
- **OWASP Password Storage**: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725
- **NIST Password Guidelines**: https://pages.nist.gov/800-63-3/sp800-63b.html

---

## Questions?

For security issues or questions:
- Check the main README.md for support
- Review SECURITY_REPORT.md for known issues
- Open an issue on GitHub with security concerns (privately if sensitive)
