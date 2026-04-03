# Code Quality Issues Report

**Date:** April 3, 2026  
**Total Issues:** 25  
**Analysis Scope:** Backend (Python) + Frontend (TypeScript/React)

---

## Summary by Severity

| Severity | Count | Files Affected |
|----------|-------|-----------------|
| Critical | 2 | ws_router.py, chat.py, agent_tasks.py |
| High | 5 | ws_router.py, auth/deps.py, useWebSocket.ts |
| Medium | 6 | graph.py, redis_bus.py, auth_router.py |
| Low | 12 | Various frontend + backend |
| **TOTAL** | **25** | **45+ files** |

---

## CRITICAL ISSUES (Must Fix)

### 1. Race Condition in WebSocket Message Ordering
```
File: backend/app/api/ws_router.py (lines 204-213)
Severity: CRITICAL
Component: WebSocket Message Handler
```

**Current Code Problem:**
```python
asyncio.create_task(_save_messages(...))  # Doesn't wait for completion
```

**Why It's Bad:**
- Messages saved in background without order guarantee
- Rapid messages could persist out-of-order
- Chat history corrupted

**Fix Approach:**
Replace `asyncio.create_task()` with `await`:
```python
await _save_messages(...)  # Wait for completion before continuing
```

**Impact if Not Fixed:** Chat history becomes useless

---

### 2. Unsafe Anonymous User UUID Placeholder
```
Files: 
  - backend/app/api/chat.py (line 55)
  - backend/app/tasks/agent_tasks.py (line 85)
Severity: CRITICAL
Component: User Authentication/Session Management
```

**Current Code Problem:**
```python
ANONYMOUS_USER_ID = "00000000-0000-0000-0000-000000000001"
# ... XP awards skipped for this hardcoded ID
```

**Why It's Bad:**
- Fragile hardcoded UUID
- Confusing anonymous user handling
- Stats APIs may break with anonymous users
- Not scalable

**Fix Approach:**
Either:
1. Create proper anonymous user in database
2. Reject anonymous sessions explicitly with clear error
3. Track anonymous sessions separately

**Impact if Not Fixed:** Anonymous sessions break; system unreliable

---

## HIGH PRIORITY ISSUES (Next Sprint)

### 3. Missing Database Commit
```
File: backend/app/api/ws_router.py (line 89)
Component: Database Persistence
Risk Level: Data Loss
```

**Issue:** 
Messages added to session but `commit()` never called. If Celery worker crashes, messages lost.

**Code Example:**
```python
def _save_messages(...):
    db.add(Message(...))
    # Missing: await db.commit()
```

**Fix:**
```python
db.add(Message(...))
await db.commit()  # Ensure transaction persisted
```

---

### 4. Overly Broad Exception Handling
```
Files: 
  - backend/app/auth/dependencies.py (line 63)
  - backend/app/auth/security.py (line 30)
  - backend/app/db/base.py (line 44)
  - backend/app/ws/manager.py (line 49)
Component: Error Handling Strategy
Risk Level: Debugging Difficulty
```

**Issue:**
```python
try:
    # something risky
except Exception:  # Catches EVERYTHING
    pass  # Silently fails
```

**Problems:**
- Can't distinguish expected from unexpected errors
- Silent failures hard to debug
- Production issues hidden

**Fix:**
```python
try:
    # something
except ValueError as e:  # Specific exception
    logger.error(f"Invalid value: {e}", exc_info=True)
except asyncio.TimeoutError:
    logger.warning("Timeout occurred")
except Exception:  # Only as last resort
    logger.exception("Unexpected error")  # Log full trace
```

---

### 5. Session ID Not Validated
```
File: backend/app/api/ws_router.py (lines 42-48)
Component: WebSocket Connection Handler
Risk Level: Session Security
```

**Issue:**
```python
try:
    session_id = UUID(session_id)  # Silently fails
except ValueError:
    # Doesn't handle invalid UUID properly
```

**Problem:**
Invalid UUIDs accepted; unpredictable behavior

**Fix:**
```python
try:
    session_id = UUID(session_id)
except ValueError:
    raise HTTPException(status_code=400, detail="Invalid session ID format")
```

---

### 6. Missing Type Validation in WebSocket Messages
```
File: backend/app/api/ws_router.py (lines 136-203)
Component: WebSocket Message Handler
Risk Level: Type Safety
```

**Issue:**
```python
msg = await websocket.receive_json()
msg_type = msg.get("type")  # Could be any type!
```

**Problem:**
If client sends `{"type": 123}` or `{"type": null}`, code breaks

**Fix:**
Use Pydantic for validation:
```python
from pydantic import BaseModel

class WSMessage(BaseModel):
    type: str  # Validated
    content: str
    agent: Optional[str] = None

msg = WSMessage(**await websocket.receive_json())
```

---

### 7. Unhandled Promise in Frontend WebSocket
```
File: frontend/src/hooks/useWebSocket.ts (line 153)
Component: WebSocket Connection Manager
Risk Level: Silent Failures
```

**Issue:**
```typescript
connect()  // No error handling
  .then(...)
  .catch(() => {})  // Silently swallows errors
```

**Problem:**
User thinks message sent, but it wasn't

**Fix:**
```typescript
try {
  await connect()
} catch (error) {
  setError(`Connection failed: ${error.message}`)
  toast.error("Failed to send message")
}
```

---

## MEDIUM PRIORITY ISSUES (Current Backlog)

### 8. Missing Agent Name Validation
```
File: backend/app/api/ws_router.py (line 196)
Issue: Invalid agent names accepted
```

### 9. Hardcoded Token Count (Word Count ≠ Tokens)
```
File: backend/app/api/ws_router.py (line 87)
Issue: len(text.split()) is inaccurate
Fix: Use tiktoken or Anthropic's token counter
```

### 10. Redis Connection Pool Missing
```
File: backend/app/tasks/redis_bus.py (lines 32-65)
Issue: New connection per operation, no pooling
Impact: Performance degradation under load
Fix: Use redis.ConnectionPool or aioredis
```

### 11. Nested Event Loops in Celery
```
File: backend/app/tasks/agent_tasks.py (lines 93-114)
Issue: asyncio.run() inside sync Celery task creates nested loops
Fix: Use proper async Celery (Celery 5.1+) or refactor
```

### 12. Missing Tool Argument Validation
```
File: backend/app/agents/graph.py (line 142)
Issue: fn.invoke() could fail with args mismatch
Fix: Validate arguments before invocation
```

### 13. Incomplete Auth Router
```
File: backend/app/api/auth_router.py (line 80)
Issue: /login endpoint incomplete; cuts off mid-implementation
Fix: Complete the implementation
```

---

## LOW PRIORITY ISSUES (Technical Debt - 12 Items)

### 14. Session History Pagination Not Validated
Component: Frontend SessionHistory component  
Fix: Clamp page numbers to valid range

### 15. Missing Accessibility Labels
Component: Multiple (hotbar, sidebar buttons)  
Fix: Add aria-labels to all interactive elements  
WCAG 2.1 AA Compliance

### 16. Potential XSS in Message Display
Component: ChatPanel.tsx  
Risk: Low (React escapes by default)  
Fix: Add content sanitization for defense-in-depth

### 17. Memory Leak in Reconnect Loop
Component: useWebSocket.ts (lines 73-77)  
Issue: Unmounting during timeout leaves pending connection  
Fix: Clear timeouts on cleanup

### 18. Hotbar Key Handler Race Condition
Component: Hotbar.tsx (lines 14-19)  
Issue: Multiple event listeners if dependencies change  
Fix: Add proper dependency array validation

### 19. Agent Handoff Not Validated
Component: graph.py (lines 108-109)  
Issue: publish_handoff() sends unvalidated agent names  
Fix: Validate against AgentName enum

### 20. Cache Invalidation Issue
Component: useSessionList.ts (lines 28-39)  
Issue: Query key doesn't include user ID  
Fix: Include isAuthenticated or userId in key

### 21. Console Logging in Production
Component: ErrorBoundary.tsx (line 30)  
Issue: console.error() in production code  
Fix: Use Sentry or structured logging service

### 22. Silent Memory Service Failure
Component: memory/service.py (lines 72-74)  
Issue: memory_store_failed logged but continues  
Fix: Either fail loudly or retry with backoff

### 23. No Request Tracing
Component: All async operations  
Issue: Can't trace requests end-to-end  
Fix: Add OpenTelemetry or correlation IDs

### 24. Register Endpoint Status Check Missing
Component: auth_router.py (line 71)  
Issue: Doesn't confirm user actually created in DB  
Fix: Verify commit() succeeded before returning

### 25. Unhandled Promise Rejections
Component: SessionHistory.tsx (lines 37-47)  
Issue: Generic error messages on API failures  
Fix: Map status codes to specific messages

---

## Issue Distribution by Component

```
ws_router.py          → 6 issues (Critical + High priority)
auth_router.py        → 3 issues (High + Medium)
useWebSocket.ts       → 2 issues (High + Low)
graph.py              → 2 issues (Medium)
redis_bus.py          → 1 issue (Medium)
agent_tasks.py        → 2 issues (Critical + Medium)
memory/service.py     → 1 issue (Low)
Other files           → 8 issues (Low)
```

---

## Recommended Fix Priority

**Week 1 (Critical):**
1. Fix race condition in WebSocket ordering
2. Handle anonymous users properly
3. Add database commit

**Week 2 (High):**
4. Complete auth router
5. Improve exception handling
6. Validate session IDs
7. Add WebSocket message validation
8. Fix frontend promise handling

**Week 3 (Medium):**
9-13. Validate agents, token counting, Redis pooling, etc.

**Backlog (Low):**
14-25. Accessibility, technical debt, logging improvements

---

## Testing Recommendations

For each fix, add tests:
- Unit tests for critical logic
- Integration tests for WebSocket flows
- E2E tests for auth flows
- Accessibility audit for UI components

---

## Metrics Tracked

- **Code Coverage Target:** 80%+
- **Type Safety:** 100% of new code typed
- **Linting:** Zero Ruff/MyPy errors
- **Security:** 0 HIGH or CRITICAL vulns in production
