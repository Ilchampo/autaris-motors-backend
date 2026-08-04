# Autaris Motors — Public Module

**Document:** 03-public-module.md
**Version:** 1.0.0

---

# Purpose

This document defines the functional requirements for the public-facing website.

## Modules

- Authentication
- Home
- Vehicle Catalog
- Vehicle Details
- Vehicle Inquiry
- Vehicle Appraisal Request

# Functional Requirements

## Authentication

### FR-001

The system shall allow visitors to register using first name, last name, email, phone, password and password confirmation.

### FR-002

The system shall authenticate users using email and password.

### FR-003

Password recovery shall be performed through Resend.

## Home Page

### FR-004

The Home page shall include a hero section with a vehicle title search box.

### FR-005

The Home page shall display vehicle brands.

### FR-006

Selecting a brand shall navigate to the catalog with the corresponding filter applied.

### FR-007

The Home page shall display featured published vehicles only.

## Vehicle Catalog

### FR-008

Only published vehicles shall be displayed.

### FR-009

The catalog shall support server-side pagination with 12 vehicles per page.

### FR-010

The catalog shall support searching by publication title.

### FR-011

The catalog shall support filtering by brand, model, price, year, transmission, fuel type, vehicle type, city, mileage and plate last digit.

### FR-012

Changing the selected brand shall reset the model filter.

### FR-013

Supported sorting options are Featured First, Newest, Price ASC, Price DESC, Year ASC, Year DESC, Mileage ASC and Mileage DESC.

### FR-014

Featured priority only applies when Featured First is selected.

### FR-015

The first page shall display up to six featured vehicles ordered by featuredAt ascending.

### FR-016

Remaining featured vehicles may appear on later pages.

### FR-017

If no vehicles match, the system shall display an empty state.

## Vehicle Details

### FR-018

The details page shall display an image gallery, title, listing price, summary, technical specifications, description and WhatsApp button.

### FR-019

The gallery shall support up to ten images.

### FR-020

Public users accessing a sold vehicle shall receive a 'Vehicle already sold' message.

### FR-021

Clicking the WhatsApp button shall create a Vehicle Inquiry before opening WhatsApp.

## Vehicle Inquiry

### FR-022

Each WhatsApp click shall generate a new inquiry record.

### FR-023

Anonymous inquiries shall store a null user reference.

## Vehicle Appraisal Request

### FR-024

The system shall provide a public form to request a vehicle appraisal.

### FR-025

Authenticated users shall have personal information prefilled.

### FR-026

Submitting the form shall persist the request, send an email using Resend and generate a customer log.

### FR-027

The MVP shall not provide an administrative interface for appraisal requests.

## Navigation

### FR-028

The navigation bar shall provide access to Home, Catalog, Sell Your Vehicle, Login and Register.

## Footer

### FR-029

The footer shall display contact information and social media links loaded from System Configuration.

## Constraints

### FR-030

The public website shall be responsive and shall never expose Draft or Deleted vehicles.
