# Autaris Motors — Functional Constraints

**Document:** 09-functional-constraints.md  
**Version:** 1.0.0  
**Status:** Draft

---

# 1. Purpose

This document explicitly defines the functional boundaries of the Minimum Viable Product (MVP).

Functional Constraints identify features that are intentionally excluded from the current scope. Any requirement outside this document should be considered a future enhancement unless otherwise approved.

Functional Constraints use the prefix `FC`.

---

# 2. Authentication

## FC-001

Google Authentication is not included.

## FC-002

Facebook Authentication is not included.

## FC-003

Multi-factor authentication (MFA/2FA) is not included.

## FC-004

Email verification is not required.

## FC-005

Account suspension workflows are not included.

---

# 3. Customer Features

## FC-006

Customers do not have a profile page.

## FC-007

Customers cannot edit their personal information.

## FC-008

Customers cannot view previous inquiries.

## FC-009

Customers cannot view appraisal requests.

## FC-010

Favorites and wish lists are not included.

## FC-011

Vehicle comparison is not included.

---

# 4. Vehicle Features

## FC-012

Vehicle reservations are not supported.

## FC-013

Online purchases are not supported.

## FC-014

Financing applications are not supported.

## FC-015

Insurance quotations are not supported.

## FC-016

Vehicle recommendations are not included.

## FC-017

Recently viewed vehicles are not tracked.

## FC-018

Vehicle view analytics are not collected.

---

# 5. Communication

## FC-019

The platform communicates with customers through standard WhatsApp links only.

## FC-020

WhatsApp Business API integration is not included.

## FC-021

Live chat is not included.

## FC-022

Internal messaging is not included.

## FC-023

SMS notifications are not included.

## FC-024

Push notifications are not included.

---

# 6. Sales

## FC-025

Invoices are not generated.

## FC-026

Contracts are not generated.

## FC-027

Payments are not processed by the application.

## FC-028

Only one active sale is allowed per vehicle.

---

# 7. Administration

## FC-029

Only a single dealership is supported.

## FC-030

Multiple branches are not supported.

## FC-031

Multiple companies are not supported.

## FC-032

Role customization is not supported.

## FC-033

Fine-grained permissions are not configurable.

---

# 8. Reporting

## FC-034

Reports cannot be exported to PDF.

## FC-035

Reports cannot be exported to Excel.

## FC-036

Custom report builders are not included.

---

# 9. Content Management

## FC-037

Blog management is not included.

## FC-038

News publishing is not included.

## FC-039

CMS functionality is not included.

---

# 10. Integrations

## FC-040

ERP integrations are not included.

## FC-041

Accounting integrations are not included.

## FC-042

CRM integrations are not included.

## FC-043

Third-party analytics providers are not required.

---

# 11. Mobile

## FC-044

A native mobile application is not included.

## FC-045

Offline support is not included.

---

# 12. Analytics

## FC-046

Analytics are generated exclusively from application data.

## FC-047

Vehicle page views are intentionally excluded.

## FC-048

Inquiry metrics are based solely on WhatsApp contact events.

---

# 13. Technical Scope

## FC-049

Only local authentication is supported.

## FC-050

Cloudinary is the only supported image provider.

## FC-051

Resend is the only supported email provider.

## FC-052

The application stores timestamps internally in UTC.

---

# 14. Future Enhancements

The following capabilities are considered valid future enhancements but are explicitly outside the MVP:

- Customer profile management
- Appointment scheduling
- Vehicle reservation workflow
- Financing workflow
- Online payments
- AI-powered recommendations
- Favorites
- Vehicle comparison
- Multiple dealership support
- Branch management
- CRM integration
- WhatsApp Business API
- Exportable reports
- Mobile applications
- Public API
- Advanced analytics
- Marketing campaigns
- Loyalty programs

---

# 15. Scope Management

Any feature request that contradicts or extends the constraints defined in this document shall be treated as a change request rather than a defect.

Such requests require:

1. Scope evaluation.
2. Cost estimation.
3. Schedule impact analysis.
4. Formal approval before implementation.

This document serves as the primary reference for preventing scope creep during the MVP lifecycle.
