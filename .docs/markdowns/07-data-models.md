# Autaris Motors — Data Models

**Document:** 07-data-models.md  
**Version:** 1.0.0  
**Status:** Draft

---

# 1. Purpose

This document defines the canonical domain models used throughout Autaris Motors.

These models are implementation-agnostic reference models intended to keep terminology and data structures consistent across the application.

---

# 2. Common Types

```ts
type Role = 'client' | 'employee' | 'admin';

type VehicleStatus = 'draft' | 'published' | 'sold' | 'deleted';

type SaleStatus = 'active' | 'cancelled';
```

---

# 3. User

```ts
interface User {
    _id: string;

    role: Role;

    firstName: string;
    lastName: string;

    email: string;
    phone: string;

    passwordHash: string;

    active: boolean;
    mustChangePassword: boolean;

    createdAt: Date;
    updatedAt: Date;
}
```

Notes

- Passwords are never stored in plain text.
- Email and phone are globally unique.
- Only active users may authenticate.

---

# 4. Vehicle

```ts
interface VehicleImage {
    id: string;
    url: string;
    isPrimary: boolean;
    order: number;
}

interface Vehicle {
    _id: string;

    title: string;

    featured: boolean;
    featuredAt: Date | null;

    price: number;
    sellingPrice: number | null;

    brand: string;
    model: string;

    year: number;

    city: string;

    vehicleType: string;
    fuelType: string;
    transmission: string;

    kilometers: number;

    plateInitial: string;
    plateLastNumber: number;

    engine: string;
    color: string;

    description: string | null;

    paymentMethods: string[];

    images: VehicleImage[];

    status: VehicleStatus;

    publishedAt: Date | null;
    soldAt: Date | null;
    deletedAt: Date | null;

    createdAt: Date;
    updatedAt: Date;
}
```

Rules

- Draft vehicles may contain zero images.
- Published vehicles require one primary image.
- Sold vehicles are immutable.
- Deleted vehicles cannot be restored.

---

# 5. Sale

```ts
interface Sale {
    _id: string;

    vehicleId: string;

    advisorId: string;

    sellingPrice: number;

    saleDate: Date;

    notes: string | null;

    status: SaleStatus;

    createdBy: string;
    updatedBy: string | null;

    createdAt: Date;
    updatedAt: Date;
}
```

Rules

- Only one active sale may exist per vehicle.
- Cancelling a sale republishes the vehicle.

---

# 6. Vehicle Inquiry

```ts
interface VehicleInquiry {
    _id: string;

    vehicleId: string;
    userId: string | null;

    vehicleTitle: string;
    brand: string;
    model: string;

    createdAt: Date;
}
```

Generated whenever a WhatsApp contact action is performed.

---

# 7. Vehicle Appraisal Request

```ts
interface VehicleAppraisalRequest {
    _id: string;

    brand: string;
    model: string;
    year: number;
    kilometers: number;

    city: string;

    transmission: string;
    fuelType: string;
    color: string;

    expectedPrice: number;

    firstName: string;
    lastName: string;

    email: string;
    phone: string;

    preferredContactSchedule: 'morning' | 'afternoon' | 'evening';

    notes: string | null;

    createdAt: Date;
}
```

---

# 8. Entity

```ts
type EntityType = 'brand' | 'city' | 'vehicleType' | 'fuelType' | 'transmission' | 'paymentMethod';

interface EntityChild {
    name: string;
    active: boolean;
}

interface Entity {
    _id: string;

    type: EntityType;

    name: string;
    slug: string;

    order: number;

    active: boolean;
    deletedAt: Date | null;

    imageUrl: string | null;

    children: EntityChild[];

    metadata: Record<string, string> | null;

    createdAt: Date;
    updatedAt: Date;
}
```

Only Brand entities may contain child models and images.

---

# 9. System Configuration

```ts
interface WhatsAppConfig {
    number: string;
    message: string;
    onlyRegistered: boolean;
}

interface ContactConfig {
    email: string;
    phone: string;
    address: string;
}

interface SocialConfig {
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
    youtube: string | null;
}

interface SystemConfig {
    whatsApp: WhatsAppConfig;
    contact: ContactConfig;
    social: SocialConfig;

    updatedAt: Date;
}
```

Only one SystemConfig document exists.

---

# 10. Log

```ts
type LogType = 'system' | 'customer';

interface Log {
    _id: string;

    type: LogType;

    message: string;

    actorId: string | null;

    metadata: Record<string, unknown> | null;

    createdAt: Date;
}
```

Logs are immutable.

---

# 11. Pagination

```ts
interface Pagination {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

interface PaginatedResponse<T> extends Pagination {
    items: T[];
}
```

---

# 12. Relationships

```text
User (1)
 ├──< Vehicle (creator)
 ├──< Sale (advisor)
 ├──< Log (actor)
 └──< VehicleInquiry

Vehicle (1)
 ├── Sale (0..1 active)
 └── VehicleInquiry (0..n)

Brand (Entity)
 └── Models (children)

SystemConfig
 └── Single global document
```

---

# 13. Design Principles

- Immutable historical records whenever possible.
- Soft deletion for business entities.
- UTC timestamps.
- Globally unique user identifiers.
- Snapshot data for analytics where historical consistency is required.
