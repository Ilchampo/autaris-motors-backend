# Autaris Motors — Business Rules

**Document:** 02-business-rules.md  
**Version:** 1.0.0  
**Status:** Draft

---

# 1. Purpose

This document defines the global business rules governing Autaris Motors. Business rules describe how the system behaves independently of user interface or implementation details.

Business rules are identified using the prefix `BR`.

---

# 2. User Rules

## BR-001

The system shall support three user roles: `client`, `employee`, and `admin`.

## BR-002

Permissions are hierarchical: `admin > employee > client`.

## BR-003

Only Administrators may create internal users.

## BR-004

Only active users may authenticate.

## BR-005

Email addresses shall remain globally unique, even for inactive users.

## BR-006

Phone numbers shall remain globally unique, even for inactive users.

## BR-007

Inactive users may only be reactivated; duplicate accounts shall never be created.

## BR-008

Administrators cannot deactivate or delete their own account.

## BR-009

The last active Administrator cannot be deactivated.

---

# 3. Vehicle Publication Rules

## BR-010

Every vehicle shall exist in exactly one status:

- Draft
- Published
- Sold
- Deleted

## BR-011

Only published vehicles are visible in the public catalog.

## BR-012

Draft vehicles are never publicly visible.

## BR-013

Sold vehicles are never publicly visible.

## BR-014

Deleted vehicles are never publicly visible.

## BR-015

Only published vehicles may be marked as sold.

## BR-016

Published vehicles cannot return to Draft.

## BR-017

Sold vehicles are immutable and cannot be edited.

## BR-018

Deleted vehicles cannot be restored.

## BR-019

A publication title is automatically generated when creating a vehicle.

## BR-020

Employees may manually override the generated title.

## BR-021

The system shall provide a "Regenerate Title" action.

---

# 4. Vehicle Images

## BR-022

Draft vehicles may contain zero images.

## BR-023

Published vehicles must contain between one and ten images.

## BR-024

Exactly one image must be designated as the primary image.

## BR-025

Vehicle images are stored in Cloudinary.

---

# 5. Featured Vehicles

## BR-026

Any published vehicle may be marked as featured.

## BR-027

Featured vehicles receive a `featuredAt` timestamp.

## BR-028

Default catalog ordering prioritizes featured vehicles.

## BR-029

At most six featured vehicles shall appear on the first page for a matching query.

## BR-030

Featured vehicles are ordered by `featuredAt` ascending.

## BR-031

Remaining featured vehicles may appear on later pages.

## BR-032

Any custom sort order ignores featured priority.

---

# 6. Sales

## BR-033

Only one active sale may exist for a vehicle.

## BR-034

Creating a sale changes the vehicle status to Sold.

## BR-035

A sale stores both the original listing price and the final selling price independently.

## BR-036

Only Administrators may edit sales.

## BR-037

Only Administrators may cancel sales.

## BR-038

Cancelled sales do not contribute to analytics.

## BR-039

Cancelling a sale republishes the associated vehicle.

## BR-040

Republished vehicles receive a new `publishedAt` timestamp.

---

# 7. Vehicle Inquiry

## BR-041

Clicking the WhatsApp contact button creates a Vehicle Inquiry record.

## BR-042

Every click creates a new inquiry.

## BR-043

Vehicle inquiries may belong to authenticated or anonymous users.

## BR-044

Vehicle inquiries generate customer logs.

---

# 8. Vehicle Appraisal Requests

## BR-045

Vehicle appraisal requests are stored permanently.

## BR-046

Submitting an appraisal request sends an email through Resend.

## BR-047

Submitting an appraisal request creates a customer log.

---

# 9. Entities

## BR-048

Entities populate dropdowns and filters throughout the application.

## BR-049

Entity names must be unique within their type.

## BR-050

Models are unique within the same brand.

## BR-051

Inactive entities are hidden from new forms.

## BR-052

Deleted entities preserve historical references.

---

# 10. Analytics

## BR-053

Analytics are generated only from application data.

## BR-054

Vehicle views are not tracked in the MVP.

## BR-055

Dashboard comparisons use the immediately preceding period with identical duration.

## BR-056

Cancelled sales are excluded from analytics.

---

# 11. Logs

## BR-057

Only important business events generate logs.

## BR-058

Logs are immutable.

## BR-059

Logs cannot be edited.

## BR-060

Logs cannot be deleted through the user interface.

---

# 12. System Configuration

## BR-061

The application uses a single global System Configuration document.

## BR-062

WhatsApp behavior is controlled through system configuration.

## BR-063

Contact information is globally configurable.

## BR-064

Social media links are globally configurable.

---

# 13. General Rules

## BR-065

Soft deletion shall preserve historical business data.

## BR-066

All sensitive operations require authentication.

## BR-067

Authorization is always enforced by the backend.

## BR-068

Every timestamp shall be stored in UTC.

## BR-069

Business rules take precedence over user interface behavior.

## BR-070

Features explicitly marked as out of scope shall not be implemented in the MVP.
