```markdown
# Ticket Management API - Testing Guide (Thunder Client / Postman)

**Base URL:** `http://localhost:3000`

**How to test**
- Use **Thunder Client** (VS Code extension) or **Postman**.
- Create an **Environment** with these variables:
  - `baseUrl` → `http://localhost:3000`
  - `token` → (leave empty, fill after login)
  - `ticketId` → (fill after creating a ticket)
  - `commentId` → (fill after creating a comment)
- For every protected request, add header:
  ```
  Authorization: Bearer {{token}}
  ```
- Content-Type: `application/json` for all POST/PATCH bodies.

---

## 1. Authentication

### POST /auth/login
**Role:** Public

**Body (JSON)**
```json
{
  "email": "manager@123.com",
  "password": "password123"
}
```
*(Use any existing user from your DB. Password is whatever you set when creating the user.)*

**Expected 200 Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
→ Copy the token and paste it into environment variable `token`.

**Other test logins you can use:**
- `rana@example.com` / password you set
- `support@example.com` (after creating below)

---

## 2. User Management (MANAGER only)

### POST /users → Create User
**Body examples:**

**Create SUPPORT user**
```json
{
  "name": "Support Sharma",
  "email": "support@example.com",
  "password": "support123",
  "role": "SUPPORT"
}
```

**Create normal USER**
```json
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "user123",
  "role": "USER"
}
```

**Expected 201 Response**
```json
{
  "id": 9,
  "name": "Support Sharma",
  "email": "support@example.com",
  "role": { "id": 3, "name": "SUPPORT" },
  "created_at": "2026-02-24T12:45:00.000Z"
}
```

<<<<<<< HEAD
Result:
Admin -> 200 OK ✅
User  -> 403 Unauthorized user check your role ❌
No Token -> 401 Unauthorized ❌
=======
### GET /users → List all users
No body.  
Expected: array of all users (same format as above).
>>>>>>> 2d6e66a6b3ef0a82e2726748adeda2cb7b3814fa

---

## 3. Tickets

### POST /tickets → Create Ticket (USER + MANAGER)
**Body examples:**

```json
{
  "title": "Login page not loading",
  "description": "After entering credentials, spinner keeps loading forever.",
  "priority": "HIGH"
}
```

<<<<<<< HEAD
Result:
Admin -> 200 OK ✅
User  -> 403 Unauthorized user check your role ❌
No Token -> 401 Unauthorized ❌
=======
```json
{
  "title": "Payment gateway issue",
  "description": "UPI option not showing for some users.",
  "priority": "MEDIUM"
}
```
>>>>>>> 2d6e66a6b3ef0a82e2726748adeda2cb7b3814fa

**Expected 201 Response**
```json
{
  "id": 5,
  "title": "Login page not loading",
  "description": "After entering credentials...",
  "status": "OPEN",
  "priority": "HIGH",
  "created_by": { ... },
  "assigned_to": null,
  "created_at": "2026-02-24T12:50:00.000Z"
}
```
→ Copy the `id` and set environment variable `ticketId = 5`

### GET /tickets → List tickets
- MANAGER → sees **all** tickets
- SUPPORT → sees only **assigned** tickets
- USER → sees only **their own** tickets

**Example response (exactly like you provided):**
```json
[
  {
    "id": 4,
    "title": "Tamasha ",
    "description": "\"Ved the Casanova\"",
    "status": "OPEN",
    "priority": "MEDIUM",
    "createdBy": 8,
    "assignedTo": null,
    "createdAt": "2026-02-24T06:37:03.382Z",
    "updatedAt": "2026-02-24T06:37:03.382Z",
    "creator": {
      "id": 8,
      "name": "Manager Kohli",
      "email": "manager@123.com",
      "role": { "id": 2, "name": "MANAGER" },
      "createdAt": "2026-02-24T06:03:44.583Z"
    },
    "assignee": null
  },
  {
    "id": 3,
    "title": "Rockstar 2011",
    "description": "\"Jordan the Casanova\"",
    "status": "OPEN",
    "priority": "MEDIUM",
    "createdBy": 3,
    "assignedTo": null,
    "createdAt": "2026-02-24T06:35:23.333Z",
    "updatedAt": "2026-02-24T06:34:16.601Z",
    "creator": {
      "id": 3,
      "name": "Rana",
      "email": "rana@example.com",
      "role": { "id": 2, "name": "MANAGER" },
      "createdAt": "2026-02-24T03:54:18.102Z"
    },
    "assignee": null
  }
]
```

### PATCH /tickets/{{ticketId}}/assign → Assign ticket (MANAGER / SUPPORT)
**Body**
```json
{
  "assignedTo": 9
}
```
*(9 = ID of Support Sharma you created earlier)*

<<<<<<< HEAD
Result:
Admin -> 200 OK ✅
User  -> 403 Unauthorized user check your role ❌
No Token -> 401 Unauthorized ❌
=======
**Expected 200:** Updated ticket with `assigned_to` populated.
>>>>>>> 2d6e66a6b3ef0a82e2726748adeda2cb7b3814fa

### PATCH /tickets/{{ticketId}}/status → Update status (MANAGER / SUPPORT)
**Body**
```json
{
  "status": "IN_PROGRESS"
}
```
Other possible values: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

**Expected 200:** Ticket with new status.

### DELETE /tickets/{{ticketId}} → Delete ticket (MANAGER only)
No body.  
Expected: **204 No Content**

---

## 4. Comments

### POST /tickets/{{ticketId}}/comments → Add comment
**Body**
```json
{
  "comment": "I am looking into this issue. Can you share console error?"
}
```

**Expected 201**
```json
{
  "id": 12,
  "comment": "I am looking into this issue...",
  "user": { ...your user details... },
  "created_at": "2026-02-24T13:00:00.000Z"
}
```
→ Copy `id` → set environment `commentId = 12`

### GET /tickets/{{ticketId}}/comments → List comments
No body. Returns array of comments.

### PATCH /comments/{{commentId}} → Edit comment (author or MANAGER)
**Body**
```json
{
  "comment": "Updated: Please check network tab as well."
}
```

**Expected 200:** Updated comment object.

### DELETE /comments/{{commentId}} → Delete comment (author or MANAGER)
No body. Expected **204 No Content**

---

## Quick Test Flow (Recommended)

1. Login as `manager@123.com`
2. Create SUPPORT user
3. Create 2-3 tickets as MANAGER
4. Login as SUPPORT user → assign tickets to yourself
5. Update status to IN_PROGRESS / RESOLVED
6. Add comments
7. Try to edit/delete comment as author
8. Login as MANAGER → delete one ticket

**All example data above is ready to copy-paste directly into Thunder Client / Postman.**

You now have complete test data for **every single endpoint**.  
Just replace `{{ticketId}}` and `{{commentId}}` with real values from responses.

Happy testing! 🚀
```

**Copy everything above** and save as `README.md` in your project root.  
No curl commands, only clean JSON bodies and clear instructions for Thunder Client / Postman — exactly what you asked for.
