# Autaris Motors — System Events

**Document:** 08-system-events.md  
**Version:** 1.0.0  
**Status:** Draft

---

# 1. Purpose

This document defines the business events that occur throughout the Autaris Motors platform.

System events describe state transitions, side effects, logging behavior, and analytics impact. They are implementation-independent and should be treated as the canonical workflow specification.

System events use the prefix `EV`.

---

# 2. Event Structure

Each event defines:

- Trigger
- Preconditions
- State Changes
- Side Effects
- Audit Logs
- Analytics Impact

---

# 3. Authentication Events

## EV-001 User Registration

**Trigger**

A visitor successfully completes the registration form.

**Preconditions**

- Email is unique.
- Phone is unique.
- Validation succeeds.

**State Changes**

- New `client` user is created.
- Account becomes active.

**Side Effects**

- User session is created.

**Audit Logs**

None.

**Analytics**

None.

---

## EV-002 Password Recovery

**Trigger**

User submits the password recovery form.

**Side Effects**

- Recovery email is sent through Resend if the account is active.

**Audit Logs**

None.

---

# 4. Vehicle Events

## EV-003 Draft Vehicle Created

**Trigger**

Employee saves a vehicle as Draft.

**State Changes**

- Vehicle status becomes `draft`.

**Side Effects**

- Vehicle is hidden from the public catalog.

**Audit Logs**

System log created.

---

## EV-004 Vehicle Published

**Trigger**

Employee publishes a Draft or creates a Published vehicle.

**State Changes**

- Status becomes `published`.
- `publishedAt` is updated.

**Side Effects**

- Vehicle becomes visible in the catalog.

**Audit Logs**

System log created.

---

## EV-005 Vehicle Updated

**Trigger**

Employee edits a Draft or Published vehicle.

**Preconditions**

- Vehicle is not Sold.
- Vehicle is not Deleted.

**State Changes**

Vehicle information is updated.

**Audit Logs**

System log created.

---

## EV-006 Vehicle Marked as Sold

**Trigger**

Employee creates a Sale.

**Preconditions**

- Vehicle status is `published`.

**State Changes**

- Vehicle status becomes `sold`.
- `sellingPrice` is assigned.
- `soldAt` is assigned.

**Side Effects**

- Vehicle disappears from the public catalog.

**Audit Logs**

System log created.

**Analytics**

Sales metrics updated.

---

## EV-007 Vehicle Deleted

**Trigger**

Employee deletes a vehicle.

**State Changes**

- Vehicle status becomes `deleted`.
- `deletedAt` is assigned.

**Side Effects**

- Vehicle is removed from all public listings.

**Audit Logs**

System log created.

---

# 5. Sale Events

## EV-008 Sale Created

**Trigger**

Employee confirms a vehicle sale.

**State Changes**

- Active Sale created.

**Audit Logs**

System log created.

**Analytics**

Revenue metrics updated.

---

## EV-009 Sale Updated

**Trigger**

Administrator edits a sale.

**State Changes**

Sale information is updated.

**Audit Logs**

Audit log created.

**Analytics**

Metrics are recalculated.

---

## EV-010 Sale Cancelled

**Trigger**

Administrator cancels an active sale.

**State Changes**

- Sale status becomes `cancelled`.
- Vehicle status becomes `published`.
- Vehicle `sellingPrice` becomes `null`.
- `publishedAt` receives a new timestamp.

**Audit Logs**

Audit log created.

**Analytics**

Cancelled sale is excluded from all analytics.

---

# 6. Inquiry Events

## EV-011 Vehicle Inquiry Created

**Trigger**

User clicks the WhatsApp button.

**State Changes**

- Vehicle Inquiry record created.

**Side Effects**

- WhatsApp link is opened.

**Audit Logs**

Customer log created.

**Analytics**

Inquiry metrics updated.

---

## EV-012 Vehicle Appraisal Request Submitted

**Trigger**

User submits the appraisal request form.

**State Changes**

- Request persisted.

**Side Effects**

- Email sent through Resend.

**Audit Logs**

Customer log created.

**Analytics**

No dashboard metrics affected.

---

# 7. User Events

## EV-013 Internal User Created

**Trigger**

Administrator creates an internal account.

**State Changes**

- User created.
- Temporary password generated.
- `mustChangePassword = true`.

**Side Effects**

Credentials delivered by email.

**Audit Logs**

System log created.

---

## EV-014 User Activated

**Trigger**

Administrator activates an inactive account.

**State Changes**

User becomes active.

**Audit Logs**

System log created.

---

## EV-015 User Deactivated

**Trigger**

Administrator deactivates an account.

**State Changes**

User becomes inactive.

**Audit Logs**

System log created.

---

# 8. Entity Events

## EV-016 Entity Created

System creates a new configurable entity.

Audit log generated.

---

## EV-017 Entity Updated

Entity information changes.

Audit log generated.

---

## EV-018 Entity Deleted

Entity becomes logically deleted.

Historical references remain intact.

Audit log generated.

---

# 9. Configuration Events

## EV-019 System Configuration Updated

Administrator updates the global configuration.

Affected sections may include:

- WhatsApp
- Contact Information
- Social Media

Audit log generated.

---

# 10. Logging Rules

- Business mutations generate logs.
- Logs are immutable.
- Logs cannot be edited.
- Logs cannot be deleted through the UI.

---

# 11. Analytics Rules

Analytics are updated only by:

- Sale creation
- Sale cancellation
- Vehicle inquiry creation

Vehicle views are intentionally ignored in the MVP.

---

# 12. Event Ordering

Typical publication lifecycle:

```text
Draft Created
        ↓
Published
        ↓
Vehicle Inquiry (0..n)
        ↓
Sale Created
        ↓
Sold
```

Cancelled sale lifecycle:

```text
Sold
    ↓
Sale Cancelled
    ↓
Published
```
