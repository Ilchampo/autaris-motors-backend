# Autaris Motors — Permissions

**Document:** 05-permissions.md  
**Version:** 1.0.0  
**Status:** Draft

---

# 1. Purpose

This document defines the authorization model used by Autaris Motors.

Permission rules use the prefix `PR`.

Role hierarchy:

```text
admin
└── employee
    └── client
```

Higher roles inherit every permission from lower roles.

---

# 2. Resource Permission Matrix

| Resource             |   Client    |   Employee    | Admin  |
| -------------------- | :---------: | :-----------: | :----: |
| Public Website       |    Read     |     Read      |  Read  |
| Dashboard            |     ❌      |     Read      |  Read  |
| Vehicles             | Public Only |     CRUD      |  CRUD  |
| Sales                |     ❌      | Create / Read |  CRUD  |
| Users                |     ❌      |      ❌       |  CRUD  |
| Entities             |     ❌      |      ❌       |  CRUD  |
| Logs                 |     ❌      |      ❌       |  Read  |
| System Configuration |     ❌      |      ❌       | Update |

---

# 3. Vehicle Permissions

| Action              | Client | Employee | Admin |
| ------------------- | :----: | :------: | :---: |
| View Public Vehicle |   ✓    |    ✓     |   ✓   |
| Create Draft        |   ❌   |    ✓     |   ✓   |
| Create Published    |   ❌   |    ✓     |   ✓   |
| Edit Draft          |   ❌   |    ✓     |   ✓   |
| Edit Published      |   ❌   |    ✓     |   ✓   |
| Edit Sold           |   ❌   |    ❌    |  ❌   |
| Delete Vehicle      |   ❌   |    ✓     |   ✓   |
| Publish Draft       |   ❌   |    ✓     |   ✓   |
| Mark as Sold        |   ❌   |    ✓     |   ✓   |

PR-001: Only published vehicles may be marked as sold.

PR-002: Deleted vehicles cannot be restored.

---

# 4. Sales Permissions

| Action      | Client | Employee | Admin |
| ----------- | :----: | :------: | :---: |
| Create Sale |   ❌   |    ✓     |   ✓   |
| Read Sales  |   ❌   |    ✓     |   ✓   |
| Edit Sale   |   ❌   |    ❌    |   ✓   |
| Cancel Sale |   ❌   |    ❌    |   ✓   |

PR-003: Only one active sale may exist per vehicle.

PR-004: Cancelling a sale republishes the associated vehicle.

---

# 5. User Permissions

Administrator only.

| Action          | Admin |
| --------------- | :---: |
| Create User     |   ✓   |
| Read Users      |   ✓   |
| Update User     |   ✓   |
| Activate User   |   ✓   |
| Deactivate User |   ✓   |
| Change Role     |   ✓   |

PR-005: Administrators cannot deactivate themselves.

PR-006: The last active administrator cannot be deactivated.

---

# 6. Entity Permissions

Administrator only.

| Action            | Admin |
| ----------------- | :---: |
| Create Entity     |   ✓   |
| Read Entities     |   ✓   |
| Update Entity     |   ✓   |
| Delete Entity     |   ✓   |
| Activate Entity   |   ✓   |
| Deactivate Entity |   ✓   |

---

# 7. Logs

Administrator only.

| Action      | Admin |
| ----------- | :---: |
| Read Logs   |   ✓   |
| Search Logs |   ✓   |
| Filter Logs |   ✓   |

PR-007: Logs are immutable.

PR-008: Logs cannot be edited or deleted.

---

# 8. System Configuration

Administrator only.

| Action                     | Admin |
| -------------------------- | :---: |
| View Configuration         |   ✓   |
| Update WhatsApp Settings   |   ✓   |
| Update Contact Information |   ✓   |
| Update Social Links        |   ✓   |

---

# 9. Authentication Permissions

| Action           | Visitor | Client | Employee | Admin |
| ---------------- | :-----: | :----: | :------: | :---: |
| Register         |    ✓    |   ❌   |    ❌    |  ❌   |
| Login            |    ✓    |   ✓    |    ✓     |   ✓   |
| Logout           |   ❌    |   ✓    |    ✓     |   ✓   |
| Recover Password |    ✓    |   ✓    |    ✓     |   ✓   |

PR-009: Inactive users cannot authenticate.

---

# 10. Authorization Principles

PR-010: Authorization shall always be enforced by the backend.

PR-011: UI visibility shall never replace backend authorization.

PR-012: Every protected endpoint shall validate both authentication and authorization.

PR-013: Every successful mutation shall generate the corresponding business event and audit log when applicable.
