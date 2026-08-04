# Autaris Motors — Validation Rules

**Document:** 06-validation-rules.md  
**Version:** 1.0.0  
**Status:** Draft

---

# 1. Purpose

This document centralizes all validation rules used throughout Autaris Motors.

Validation rules use the prefix `VR`.

Validation must always be enforced by the backend. Frontend validation exists only to improve user experience.

---

# 2. General Rules

## VR-001

All string values shall be trimmed before persistence.

## VR-002

Email comparisons shall be case-insensitive.

## VR-003

Unique fields shall be validated using normalized values.

## VR-004

Server-side validation is authoritative.

---

# 3. Authentication

## Registration

| Field            | Rule                                                           |
| ---------------- | -------------------------------------------------------------- |
| First Name       | Required, 2–50 characters                                      |
| Last Name        | Required, 2–50 characters                                      |
| Email            | Required, valid email, unique                                  |
| Phone            | Required, 7–20 characters, unique                              |
| Password         | Required, minimum 8 characters, at least one special character |
| Confirm Password | Must match Password                                            |

## Login

VR-005: Email and password are required.

## Password Recovery

VR-006: Recovery accepts a valid email format only.

VR-007: The response shall be identical whether the account exists or not.

---

# 4. Vehicle Validation

| Field            | Rule                    |
| ---------------- | ----------------------- |
| Title            | 5–120 characters        |
| Price            | 0.01–999999.99          |
| Selling Price    | 0.01–999999.99          |
| Year             | 1950–Current Year       |
| Mileage          | 0–999999 km             |
| Plate Initial    | Single uppercase A–Z    |
| Plate Last Digit | Integer 0–9             |
| Engine           | 1–50 characters         |
| Color            | 1–50 characters         |
| Description      | Maximum 3000 characters |

VR-008: Draft vehicles may contain zero images.

VR-009: Published vehicles require between one and ten images.

VR-010: Exactly one image must be marked as primary.

VR-011: Only published vehicles may be sold.

VR-012: Sold vehicles cannot be edited.

VR-013: Deleted vehicles cannot be restored.

---

# 5. Sale Validation

| Field         | Rule                    |
| ------------- | ----------------------- |
| Advisor       | Required                |
| Selling Price | Required                |
| Sale Date     | Required                |
| Notes         | Maximum 1000 characters |

VR-014: Only one active sale may exist per vehicle.

VR-015: Selling Price must be greater than zero.

VR-016: Sale Date cannot be in the future.

---

# 6. Vehicle Inquiry Validation

VR-017: Every WhatsApp click creates a new inquiry.

VR-018: User reference may be null.

VR-019: Vehicle snapshot fields are required.

---

# 7. Vehicle Appraisal Request

## Vehicle Information

| Field          | Rule              |
| -------------- | ----------------- |
| Brand          | Required          |
| Model          | Required          |
| Year           | 1950–Current Year |
| Mileage        | 0–999999          |
| City           | Required          |
| Transmission   | Required          |
| Fuel Type      | Required          |
| Color          | Required          |
| Expected Price | Greater than zero |

## Seller Information

| Field                      | Rule                    |
| -------------------------- | ----------------------- |
| First Name                 | 2–50 characters         |
| Last Name                  | 2–50 characters         |
| Email                      | Valid email             |
| Phone                      | 7–20 characters         |
| Preferred Contact Schedule | Required                |
| Notes                      | Maximum 1000 characters |

---

# 8. User Validation

VR-020: Emails are globally unique.

VR-021: Phone numbers are globally unique.

VR-022: Internal users receive temporary passwords.

VR-023: Users must change temporary passwords on first login.

VR-024: Inactive users cannot authenticate.

---

# 9. Entity Validation

| Field  | Rule                                |
| ------ | ----------------------------------- |
| Name   | Required, unique within entity type |
| Slug   | Auto-generated                      |
| Order  | Integer >= 0                        |
| Active | Boolean                             |

VR-025: Brand names are unique.

VR-026: Model names are unique within the same Brand.

VR-027: Only Brand entities may contain images.

VR-028: Entity images must be valid Cloudinary URLs after upload.

---

# 10. System Configuration

## WhatsApp

| Field           | Rule              |
| --------------- | ----------------- |
| Number          | Required          |
| Default Message | 1–1000 characters |
| Require Login   | Boolean           |

Allowed placeholders:

- {{vehicleTitle}}
- {{price}}
- {{vehicleUrl}}

VR-029: Unknown placeholders shall be rejected.

## Contact

| Field   | Rule             |
| ------- | ---------------- |
| Email   | Valid email      |
| Phone   | 7–20 characters  |
| Address | 1–250 characters |

## Social Links

VR-030: Empty values are allowed.

VR-031: Non-empty values must be valid HTTPS URLs.

---

# 11. Pagination

VR-032: Page numbers start at 1.

VR-033: Page size must be greater than zero.

VR-034: Vehicle catalog page size is fixed at 12.

---

# 12. Date Validation

VR-035: All timestamps are stored in UTC.

VR-036: Date ranges require Start Date <= End Date.

VR-037: Dashboard comparisons use the immediately preceding period with identical duration.

---

# 13. Error Handling

VR-038: Validation errors shall identify the invalid field.

VR-039: Business rule violations shall return meaningful error messages.

VR-040: Internal implementation details shall never be exposed in validation responses.
