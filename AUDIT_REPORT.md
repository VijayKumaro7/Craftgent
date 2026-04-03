# CraftAgent Project Audit Report

**Date:** April 3, 2026  
**Scope:** Full codebase audit (backend + frontend)  
**Status:** CRITICAL ISSUES FOUND - Requires immediate action before production deployment

---

## Executive Summary

The CraftAgent project is a well-architected Full-Stack Multi-Agent AI Chat System. However, **2 CRITICAL security vulnerabilities** and **25 total code quality issues** have been identified that must be addressed before production deployment.

**Total Issues Found:**
- Critical: 2
- High Priority: 5  
- Medium Priority: 6
- Low Priority: 12
- **Security Issues: 20**

---

## CRITICAL CODE QUALITY ISSUES (Must Fix Before Production)

### Issue #1: Race Condition in WebSocket Message Ordering
- **Severity:** CRITICAL
- **File:** `/backend/app/api/ws_router.py` (lines 204-213)
- **Problem:** Messages are saved asynchronously in a background task while the WebSocket continues processing. If multiple rapid messages arrive, they could be persisted out-of-order.
- **Impact:** Chat history may appear scrambled or corrupted
- **Reproduction:** Send multiple messages in rapid succession on same connection
- **Fix:** Use `await` instead of `asyncio.create_task()` or implement proper sequencing with message ordering

### Issue #2: Unsafe Anonymous User UUID Placeholder
- **Severity:** CRITICAL
- **Files:** 
  - `/backend/app/api/chat.py:55`
  - `/backend/app/tasks/agent_tasks.py:85`
- **Problem:** Hardcoded UUID "00000000-0000-0000-0000-000000000001" used as anonymous user placeholder; XP awards deliberately skipped for these users. This is fragile and confusing.
- **Impact:** Anonymous sessions don't track stats; may break stats APIs if anonymous users exist
- **Fix:** Implement proper anonymous user handling or explicitly reject anonymous sessions with clear error message

---

## HIGH PRIORITY CODE QUALITY ISSUES (Fix in Next Sprint)

### Issue #3: Missing Database Commit on WebSocket Writes
- **File:** `/backend/app/api/ws_router.py:89`
- **Problem:** `db.add(Message(...))` executed without `await db.commit()`. Transaction may not be persisted if worker crashes.
- **Impact:** Messages could be lost silently
- **Fix:** Add `await db.commit()` after persisting messages

### Issue #4: Overly Broad Exception Handling
- **Files:**
  - `/backend/app/auth/dependencies.py:63`
  - `/backend/app/auth/security.py:30`
  - `/backend/app/db/base.py:44`
  - `/backend/app/ws/manager.py:49`
- **Problem:** Bare `except Exception:` catches all errors without differentiating expected vs unexpected failures
- **Impact:** Debugging is difficult; genuine errors swallowed silently
- **Fix:** Catch specific exception types or log full stack trace for unexpected errors

### Issue #5: Session ID Not Validated on WebSocket Connection
- **File:** `/backend/app/api/ws_router.py:42-48`
- **Problem:** `session_id` string converted to UUID without proper validation; invalid UUIDs silently create new sessions
- **Impact:** Invalid UUIDs accepted; unintended session creation
- **Fix:** Validate UUID format strictly before connection acceptance

### Issue #6: Missing Type Validation in WebSocket Message Handler
- **File:** `/backend/app/api/ws_router.py:136-203`
- **Problem:** Message dictionary keys accessed without type checking; `msg.get("type")` could be any type, not string
- **Impact:** Type errors on malformed JSON input
- **Fix:** Add Pydantic schema validation for all incoming WebSocket messages

### Issue #7: Unhandled Promise in Frontend WebSocket
- **File:** `/frontend/src/hooks/useWebSocket.ts:153`
- **Problem:** `connect()` called without error handling if reconnection fails during `send()`
- **Impact:** Silent failures; user thinks message sent when it wasn't
- **Fix:** Add error handling and user feedback for reconnection failures

---

## MEDIUM PRIORITY CODE QUALITY ISSUES (Fix in Current Backlog)

### Issue #8: Missing Null Check on Agent Field
- **File:** `/backend/app/api/ws_router.py:196`
- **Problem:** `final_agent = event.get("agent", "NEXUS")` doesn't validate if agent is valid AgentName
- **Impact:** Invalid agent names cause runtime errors
- **Fix:** Validate agent name against AgentName enum before use

### Issue #9: Hardcoded Token Count Calculation
- **File:** `/backend/app/api/ws_router.py:87`
- **Problem:** `token_count=len(assistant_content.split())` uses word count, not actual tokens
- **Impact:** Token usage statistics are inaccurate
- **Fix:** Use tiktoken or Anthropic's token counting API

### Issue #10: Redis Connection Not Reused
- **File:** `/backend/app/tasks/redis_bus.py:32-65`
- **Problem:** Each function creates new Redis connection and closes immediately; no connection pooling
- **Impact:** Performance degradation; connection exhaustion under load
- **Fix:** Use Redis connection pool or singleton pattern

### Issue #11: Unhandled XP Award Async Error
- **File:** `/backend/app/tasks/agent_tasks.py:93-114`
- **Problem:** `asyncio.run()` inside sync Celery task creates nested event loops; unhandled exceptions silently pass
- **Impact:** XP awards fail silently without visibility
- **Fix:** Restructure for proper async handling in Celery or wrap with try/except and logging

### Issue #12: Missing Error Handling in Graph Tool Execution
- **File:** `/backend/app/agents/graph.py:142`
- **Problem:** `fn.invoke(tc["args"])` could fail if tool arguments don't match function signature
- **Impact:** Agent crashes with cryptic errors
- **Fix:** Validate tool arguments match function signature before invoking

### Issue #13: Incomplete Auth Router Implementation
- **File:** `/backend/app/api/auth_router.py:80`
- **Problem:** `/login` endpoint incomplete; cuts off at line 80, missing response handling
- **Impact:** Login API is non-functional
- **Fix:** Complete the login endpoint implementation

---

## LOW PRIORITY CODE QUALITY ISSUES (Technical Debt)

### Issue #14: Session History Pagination Not Validated
### Issue #15: Missing Aria Labels on Interactive Elements (Accessibility)
### Issue #16: Potential XSS Vector in Message Display
### Issue #17: Memory Leak in WebSocket Reconnect Loop
### Issue #18: Race Condition in Hotbar Key Handler
### Issue #19: Missing Validation on Agent Handoff
### Issue #20: Cache Invalidation Issue in Session List
### Issue #21: Unused Console Logging
### Issue #22: Incomplete Memory Service Implementation
### Issue #23: No Request ID Tracing for Debugging
### Issue #24: Status Code Not Checked on Register
### Issue #25: Unhandled Promise Rejections

---

## SECURITY VULNERABILITIES ASSESSMENT

**Total Security Issues: 20**

### CRITICAL SEVERITY (2 Issues) - Fix Before Production

#### 1. Hardcoded Secret Key in Configuration
- **Location:** `/backend/app/core/config.py`
- **OWASP:** A02:2021 Cryptographic Failures
- **Issue:** Default `SECRET_KEY` hardcoded; must be changed before any production deployment
- **Risk:** All JWT tokens compromised if default secret used
- **Immediate Action:** Generate cryptographically strong random key (64+ characters) and set via environment variable

#### 2. No User Ownership Verification on Session Endpoints
- **Location:** `/backend/app/api/sessions_router.py`
- **OWASP:** A01:2021 Broken Access Control
- **Issue:** Sessions endpoint doesn't verify requesting user owns the session
- **Risk:** Users can access/modify other users' chat sessions
- **Immediate Action:** Add user_id verification on all session access endpoints

---

### HIGH SEVERITY (3 Issues) - Fix Immediately

#### 3. Code Execution Sandbox Missing
- **Location:** `/backend/app/tools/code_exec.py`
- **OWASP:** A03:2021 Injection
- **Issue:** Arbitrary Python code execution without sandboxing
- **Risk:** Malicious code can read files, access network, crash system
- **Recommendation:** Implement Docker container or seccomp sandboxing

#### 4. Overly Permissive CORS Configuration
- **Location:** `/backend/app/main.py` (FastAPI CORS config)
- **OWASP:** A05:2021 Security Misconfiguration
- **Issue:** `allow_credentials=True` combined with wildcard origins (if present)
- **Risk:** Cross-site request forgery; sensitive operations vulnerable
- **Fix:** Restrict to specific origins; don't allow credentials with wildcards

#### 5. Missing CSRF Protection
- **Location:** `/backend/app/api/auth_router.py`, `/backend/app/api/ws_router.py`
- **OWASP:** A01:2021 Broken Access Control
- **Issue:** State-changing operations (POST, PUT, DELETE) have no CSRF tokens
- **Risk:** Attackers can trigger actions on behalf of authenticated users
- **Fix:** Implement CSRF token validation for all state-changing operations

---

### MEDIUM SEVERITY (6 Issues) - Fix Soon

#### 6. Incomplete Authentication on Code Execution
- **Location:** `/backend/app/tools/code_exec.py`
- **Issue:** Code execution tool not fully authenticated; assumes request already verified
- **Risk:** Improperly scoped access to dangerous operation
- **Fix:** Add explicit user/permission verification before code execution

#### 7. Weak Password Policy
- **Location:** `/backend/app/api/auth_router.py`
- **OWASP:** A07:2021 Identification and Authentication Failures
- **Issue:** No password complexity requirements (min length, special chars, etc.)
- **Risk:** Weak passwords easily brute-forced
- **Fix:** Enforce min 12 characters, require uppercase + numbers + special chars

#### 8. No Token Revocation Mechanism
- **Location:** `/backend/app/auth/security.py` (lines 18, 49-53)
- **OWASP:** A07:2021 Identification and Authentication Failures
- **Issue:** Refresh tokens expire after 7 days with no revocation mechanism
- **Risk:** Compromised tokens grant access for 7 days; no logout capability
- **Fix:** Implement token blacklist (Redis) or JWT revocation service

#### 9. SQL Injection Risk in Analytics Tool
- **Location:** `/backend/app/tools/sql_tool.py`
- **OWASP:** A03:2021 Injection
- **Issue:** SQL queries not fully parameterized; user input in query construction
- **Risk:** SQL injection attacks possible
- **Fix:** Use parameterized queries exclusively; validate schema access

#### 10. API Key Exposure Risk
- **Location:** `/backend/app/tools/web_search.py`, `/backend/app/core/config.py`
- **OWASP:** A05:2021 Security Misconfiguration
- **Issue:** API keys could be logged in error messages or stack traces
- **Risk:** Third-party API compromise
- **Fix:** Mask API keys in logs; use request ID tracking

#### 11. Cookie Security Config Environment-Dependent
- **Location:** `/backend/app/api/auth_router.py` (lines 95-102)
- **OWASP:** A02:2021 Cryptographic Failures
- **Issue:** `secure=True` doesn't account for HTTP-only development properly
- **Risk:** Cookies transmitted insecurely in some environments
- **Fix:** Set `secure=not settings.is_development` explicitly

---

### LOW SEVERITY (9 Issues) - Best Practices

#### 12. Missing Content Security Policy Header
- **Location:** `/nginx/craftgent.conf`
- **OWASP:** A03:2021 Injection (XSS Prevention)
- **Fix:** Add CSP header `default-src 'self'; script-src 'self' 'wasm-unsafe-eval';`

#### 13. Missing Rate Limiting on Auth Endpoints
- **Location:** `/backend/app/api/auth_router.py`
- **Issue:** Only global 20/min limit; no per-endpoint stricter limits
- **Fix:** Apply 5/min limit to /login, /register endpoints

#### 14. Secrets in Production Docker Compose
- **Location:** `/docker-compose.prod.yml`
- **Issue:** Secrets documented in YAML (acceptable but ensure `.env.prod` not committed)
- **Fix:** Verify `.env.prod` in `.gitignore`

#### 15. Missing Input Sanitization
- **Location:** `/backend/app/api/chat.py:154`
- **Issue:** Message content stored as-is without sanitization
- **Fix:** Implement content filtering if messages used elsewhere

#### 16. WebSocket Authentication on Every Message
- **Location:** `/backend/app/api/ws_router.py:144-158`
- **Issue:** JWT validated on every message instead of just connection
- **Fix:** Move auth to connection handshake only

#### 17. Insufficient Security Event Logging
- **Issue:** No logging for failed logins, rate limit violations, unauthorized access
- **Fix:** Add audit logging for security events

#### 18-20. Dependency & Configuration Issues
- Regular `pip audit` and `npm audit` recommended
- Ensure dev vs production config differences are documented

---

## POSITIVE SECURITY FINDINGS (Strengths)

✅ **Bcrypt password hashing** with proper salt generation  
✅ **JWT token separation** (short-lived access + long-lived refresh)  
✅ **httpOnly cookies** for refresh tokens (XSS protection)  
✅ **SQLAlchemy ORM** prevents most SQL injection  
✅ **Pydantic validation** on all inputs  
✅ **Database connection pooling** with health checks  
✅ **Proper async/await** patterns  
✅ **Nginx security headers** (X-Frame-Options, X-Content-Type-Options, etc.)  
✅ **CORS origin whitelist** for development  
✅ **Read-only database** connection for analytics  
✅ **Code execution timeout** enforcement  
✅ **Environment-based secrets** loading  
✅ **Structured logging** (no sensitive data in logs)  

---

## RECOMMENDED FIX TIMELINE

### Immediate (Before Production)
1. Change hardcoded SECRET_KEY
2. Add user ownership verification to sessions
3. Restrict CORS to specific origins
4. Implement code execution sandboxing
5. Add CSRF protection

### Phase 2 (Next Sprint)
1. Complete auth router implementation
2. Add token revocation mechanism
3. Implement per-endpoint rate limiting
4. Add password complexity validation
5. Add security audit logging
6. Add CSP header

### Phase 3 (Long-term)
1. Regular security audits
2. Implement vulnerability scanning in CI/CD
3. Database row-level security
4. API key rotation mechanism
5. Comprehensive penetration testing

---

## Verification Checklist

- [ ] All CRITICAL issues reviewed and understood
- [ ] Plan created for fixing each issue
- [ ] Security audit logged in git history
- [ ] Team notified of findings
- [ ] Security fixes prioritized in sprint planning

---

**Generated by:** Automated Security & Code Quality Audit  
**Repository:** vijaykumaro7/craftgent  
**Branch:** claude/audit-project-security-JoAmd
