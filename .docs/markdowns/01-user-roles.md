# Autaris Motors — User Roles

**Document:** 01-user-roles.md  
**Version:** 1.0.0  
**Status:** Draft

---

# 1. Purpose

This document defines every user role supported by Autaris Motors, their responsibilities, authentication behavior, account lifecycle, and permission hierarchy.

Business permissions are described at a high level in this document. The complete authorization matrix is defined in **05-permissions.md**.

# 2. User Hierarchy

| Role       | Description                                                |
| ---------- | ---------------------------------------------------------- |
| `client`   | Registered public customer.                                |
| `employee` | Internal dealership user responsible for daily operations. |
| `admin`    | Internal user with unrestricted system access.             |

Hierarchy:

admin
└── employee
└── client

Administrators inherit all Employee permissions.
Employees inherit all Client capabilities.

# 3. Public Visitor

Visitors may:

- Browse the website.
- Search and filter vehicles.
- View vehicle details.
- Submit a Vehicle Appraisal Request.
- Contact the dealership through WhatsApp when public contact is enabled.

# 4. Client

Clients may:

- Use every public feature.
- Authenticate with email and password.
- Submit authenticated vehicle inquiries.
- Recover their password.

The MVP does not include a customer profile.

# 5. Employee

Employees may:

- View the dashboard.
- Manage vehicles.
- Create sales.
- Use every public feature.

Employees cannot:

- Manage users.
- Manage entities.
- Access logs.
- Change system configuration.

# 6. Administrator

Administrators may perform every Employee action plus:

- Manage users.
- Manage entities.
- View logs.
- Configure the system.
- Edit and cancel sales.
- Change user roles.

# 7. Authentication

Authentication uses local credentials only.

Passwords are stored only as secure hashes.

# 8. Account Lifecycle

Client:
Visitor → Register → Active → Inactive (optional)

Employee:
Administrator creates account → Temporary password → First login → Forced password change → Active

# 9. User Status

Inactive users:

- Cannot sign in.
- Cannot recover passwords.
- Preserve email and phone uniqueness.
- May be reactivated by an Administrator.

# 10. Password Policy

- Minimum 8 characters.
- At least one special character.
- Temporary passwords are generated for internal accounts.

# 11. Security Rules

- Authorization is enforced server-side.
- Password hashes are never exposed.
- Sensitive operations generate audit logs.

# 12. Administrative Restrictions

- Administrators cannot deactivate themselves.
- Administrators cannot delete themselves.
- The last active Administrator cannot be deactivated.
- Only Administrators may change internal roles.

# 13. Out of Scope

- Google Authentication
- Social login
- Customer profile
- MFA
- User avatars
- Email verification
