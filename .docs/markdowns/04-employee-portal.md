# Autaris Motors — Employee Portal

**Document:** 04-employee-portal.md  
**Version:** 1.0.0  
**Status:** Draft

---

# 1. Purpose

This document defines the functional requirements for the internal Employee Portal used by Employees and Administrators.

The portal contains the following modules:

- Dashboard
- Vehicle Management
- Sales Management
- User Management
- Entity Management
- Logs
- System Settings

Functional requirements use the prefix `FR`.

---

# 2. Dashboard

## Overview

### FR-101

The Dashboard shall be accessible to `employee` and `admin` users.

### FR-102

All dashboard data is read-only.

### FR-103

The dashboard shall support filtering by `startDate` and `endDate`.

### FR-104

The comparison period shall be the immediately preceding period with identical duration.

## KPI Cards

The dashboard shall display:

- Published Vehicles
- Available Vehicles
- Sold Vehicles
- Total Sales (USD)
- Vehicle Inquiries

### FR-105

Each KPI shall display:

- Current value
- Comparison status (`increase`, `decrease`, `equal`)
- Comparison value

## Charts

### FR-106

The dashboard shall display:

- Sales by Month (last 6 months)
- Vehicle Inquiries by Month (last 6 months)
- Top 5 Requested Brands
- Top 5 Requested Models

---

# 3. Vehicle Management

## Vehicle List

### FR-107

The system shall provide a paginated vehicle table.

Columns:

- Thumbnail
- Title
- Price
- City
- Status
- Featured
- Created At
- Actions

### FR-108

Supported filters:

- Title
- Brand
- City
- Status

### FR-109

Supported sorting:

- Created (Newest)
- Created (Oldest)
- Price ASC
- Price DESC

### FR-110

Available actions:

- View
- Edit
- Publish
- Mark as Sold
- Delete

## Create Vehicle

### FR-111

Employees shall create Draft or Published vehicles.

### FR-112

Draft vehicles may contain zero images.

### FR-113

Published vehicles require at least one image.

### FR-114

Vehicles support up to ten Cloudinary images.

### FR-115

Exactly one image shall be marked as primary.

### FR-116

Publication titles are generated automatically but remain editable.

## Edit Vehicle

### FR-117

Draft and Published vehicles may be edited.

### FR-118

Sold and Deleted vehicles cannot be edited.

## Publish

### FR-119

Publishing updates the vehicle status to Published.

### FR-120

Publishing sets `publishedAt`.

## Mark as Sold

### FR-121

Only Published vehicles may be sold.

### FR-122

Creating a sale updates the vehicle status to Sold.

### FR-123

Sale creation requires:

- Advisor
- Selling Price
- Sale Date
- Optional Notes

### FR-124

The advisor defaults to the authenticated user.

## Delete Vehicle

### FR-125

Deleting a vehicle performs a soft delete.

### FR-126

Deleted vehicles cannot be restored.

---

# 4. Sales Management

### FR-127

The system shall provide CRUD operations for sales.

### FR-128

Employees may create sales.

### FR-129

Only Administrators may edit or cancel sales.

### FR-130

Cancelling a sale:

- Changes sale status to Cancelled
- Republishes the vehicle
- Clears sellingPrice
- Updates publishedAt
- Creates an audit log

### FR-131

Only one active sale may exist per vehicle.

---

# 5. User Management

Administrator only.

### FR-132

The system shall provide CRUD operations for users.

### FR-133

Creating an internal user requires:

- First Name
- Last Name
- Email
- Phone
- Role

### FR-134

Temporary passwords shall be generated automatically.

### FR-135

Credentials shall be sent using Resend.

### FR-136

Users shall change their password on first login.

### FR-137

Inactive users may be reactivated.

---

# 6. Entity Management

Administrator only.

Supported entity types:

- Brand
- Model
- City
- Vehicle Type
- Fuel Type
- Transmission
- Payment Method

### FR-138

The system shall provide CRUD operations for entities.

### FR-139

Brands may include models as child entities.

### FR-140

Only Brand entities may store images.

### FR-141

Entities support Active and Inactive states.

### FR-142

Deleted entities preserve historical references.

---

# 7. Logs

Administrator only.

### FR-143

The portal shall display:

- System Logs
- Customer Logs

### FR-144

Logs support search.

### FR-145

Logs support pagination.

### FR-146

Logs support sorting by creation date.

### FR-147

Logs are read-only.

---

# 8. System Settings

Administrator only.

### FR-148

The application shall manage a single global configuration.

Configuration sections:

- WhatsApp
- Contact Information
- Social Media

### FR-149

WhatsApp configuration:

- Number
- Default Message
- Require Login

### FR-150

Contact configuration:

- Email
- Phone
- Address

### FR-151

Social configuration:

- Facebook
- Instagram
- TikTok
- YouTube

---

# 9. General Portal Requirements

### FR-152

All employee pages require authentication.

### FR-153

Authorization shall be enforced by the backend.

### FR-154

Every successful mutation shall generate the appropriate business event.

### FR-155

Sensitive operations shall create immutable audit logs.

### FR-156

The portal shall support desktop and tablet layouts.

### FR-157

All lists shall use server-side pagination, filtering and sorting.
