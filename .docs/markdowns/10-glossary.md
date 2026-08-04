# Autaris Motors — Glossary

**Document:** 10-glossary.md  
**Version:** 1.0.0  
**Status:** Draft

---

# 1. Purpose

This glossary defines the canonical business terminology used throughout the Autaris Motors Functional Requirements Specification.

All future documentation, source code, database models, API contracts, UI copy, and AI-generated artifacts should use these definitions consistently.

---

# 2. Business Terms

## Administrator

An internal user with unrestricted access to the application. Administrators inherit all Employee and Client permissions.

---

## Analytics

Aggregated business metrics generated exclusively from application data. Analytics do not include external tracking providers or page view statistics.

---

## Brand

A configurable entity representing a vehicle manufacturer (e.g. Toyota, Chevrolet, Kia). Brands may contain one or more Models.

---

## Client

A registered public user who authenticates with a local account. Clients may browse vehicles and create authenticated inquiries but have no administrative capabilities.

---

## Dashboard

The landing page of the Employee Portal containing KPI cards and analytical charts.

---

## Draft

A vehicle publication that has not yet been published. Draft vehicles are never visible to public visitors.

---

## Employee

An internal dealership user responsible for managing inventory and registering vehicle sales.

---

## Entity

Configurable master data used throughout the application, including Brands, Models, Cities, Fuel Types, Vehicle Types, Transmissions and Payment Methods.

---

## Featured Vehicle

A published vehicle that receives priority in the default catalog ordering.

---

## Inquiry

A customer interaction created immediately before opening WhatsApp from a vehicle details page.

The canonical model name is:

```text
VehicleInquiry
```

---

## Log

An immutable record describing an important business event performed by the system or a user.

Two categories exist:

- System Log
- Customer Log

---

## Model

A vehicle model belonging to a Brand (e.g. Toyota → Corolla).

Model uniqueness is enforced only within its parent Brand.

---

## Payment Method

A configurable entity describing accepted payment options for a vehicle listing.

---

## Publication

A publicly accessible vehicle listing.

A publication exists only while the vehicle status is:

```text
published
```

---

## Sale

A completed vehicle transaction associated with exactly one vehicle.

Only one active Sale may exist per vehicle.

---

## Sale Cancellation

An administrative operation that invalidates a Sale.

Cancelling a sale republishes the associated vehicle and excludes the cancelled sale from analytics.

---

## Selling Price

The final negotiated price recorded when a vehicle is sold.

This value is independent from the original listing price.

---

## Soft Delete

Logical deletion that hides a resource from normal application workflows while preserving historical information.

---

## System Configuration

The single global configuration document storing WhatsApp settings, contact information and social media links.

---

## Vehicle

The primary business entity managed by the application.

Vehicles transition through the following lifecycle:

```text
Draft
    ↓
Published
    ↓
Sold
```

or

```text
Draft
    ↓
Published
    ↓
Deleted
```

---

## Vehicle Appraisal Request

A request submitted by a person wishing to sell their own vehicle to the dealership.

Canonical model:

```text
VehicleAppraisalRequest
```

---

## Vehicle Inquiry

A record created whenever a user clicks the WhatsApp contact button from a published vehicle.

Vehicle inquiries are used for analytics and customer activity tracking.

---

# 3. User Roles

| Role          | Description                                  |
| ------------- | -------------------------------------------- |
| Visitor       | Anonymous public user.                       |
| Client        | Registered customer.                         |
| Employee      | Internal operational user.                   |
| Administrator | Internal user with unrestricted permissions. |

---

# 4. Vehicle Statuses

| Status    | Meaning                             |
| --------- | ----------------------------------- |
| Draft     | Hidden from the public website.     |
| Published | Publicly visible.                   |
| Sold      | Removed from the public catalog.    |
| Deleted   | Logically deleted and inaccessible. |

---

# 5. Sale Statuses

| Status    | Meaning                                          |
| --------- | ------------------------------------------------ |
| Active    | Counts toward analytics.                         |
| Cancelled | Preserved historically but ignored by analytics. |

---

# 6. Abbreviations

| Term | Meaning                           |
| ---- | --------------------------------- |
| API  | Application Programming Interface |
| CRUD | Create, Read, Update, Delete      |
| DTO  | Data Transfer Object              |
| KPI  | Key Performance Indicator         |
| MVP  | Minimum Viable Product            |
| UTC  | Coordinated Universal Time        |

---

# 7. Requirement Prefixes

| Prefix | Description            |
| ------ | ---------------------- |
| FR     | Functional Requirement |
| BR     | Business Rule          |
| PR     | Permission Rule        |
| VR     | Validation Rule        |
| EV     | System Event           |
| FC     | Functional Constraint  |

---

# 8. Naming Conventions

Business model names use PascalCase.

Examples:

- User
- Vehicle
- Sale
- Entity
- VehicleInquiry
- VehicleAppraisalRequest
- SystemConfig

Properties use camelCase.

Examples:

- firstName
- sellingPrice
- publishedAt
- featuredAt
- deletedAt

Enumerations use lowercase string values unless explicitly documented.

---

# 9. Guiding Principle

When ambiguity exists between documentation or implementation, the terminology and definitions contained in this glossary should be considered the authoritative vocabulary for the Autaris Motors project.
