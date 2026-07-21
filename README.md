# Enterprise Procurement System (EPS)

<p align="center">
  <strong>Enterprise-grade Procurement Management Platform</strong><br>
  Built with Spring Boot, React, and MySQL to automate the complete procurement lifecycle.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot%203-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React TypeScript" />
  <img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-8B5CF6?style=for-the-badge" alt="JWT RBAC" />
</p>

***

## Table of Contents

1. [Overview](#overview)
2. [Objectives](#objectives)
3. [Key Features](#key-features)
4. [Technology Stack](#technology-stack)
5. [System Architecture](#system-architecture)
6. [Core Modules](#core-modules)
7. [Procurement Workflow](#procurement-workflow)
8. [User Roles](#user-roles)
9. [Repository Structure](#repository-structure)
10. [Backend Architecture](#backend-architecture)
11. [Frontend Architecture](#frontend-architecture)
12. [Database Structure](#database-structure)
13. [Documentation Structure](#documentation-structure)
14. [Installation Guide](#installation-guide)
15. [Running the Project](#running-the-project)
16. [API Documentation](#api-documentation)
17. [Git Workflow](#git-workflow)
18. [Branch Strategy](#branch-strategy)
19. [Coding Standards](#coding-standards)
20. [Development Roadmap](#development-roadmap)
21. [Future Enhancements](#future-enhancements)
22. [Contributors](#contributors)
23. [License](#license)

***

## Overview

Enterprise Procurement System (EPS) is a centralized and modular procurement platform designed to digitize and automate the end-to-end purchasing lifecycle of an organization.

The platform enables employees to create purchase requests, routes them through configurable approval workflows, validates budgets, manages vendors and quotations, generates purchase orders, records goods receipt, updates inventory, processes invoices through three-way matching, and completes vendor payments.

EPS is designed with enterprise architecture principles to provide scalability, maintainability, security, auditability, and future extensibility for advanced capabilities such as AI-based recommendations, OCR, analytics, and ERP integration.

***

## Objectives

The primary goals of EPS are:

- Digitize the complete procurement lifecycle.
- Reduce manual paperwork and process delays.
- Automate approval workflows across departments.
- Improve procurement transparency and accountability.
- Enforce budget compliance and financial control.
- Improve inventory visibility and stock tracking.
- Simplify vendor onboarding and quotation handling.
- Maintain complete audit trails for enterprise governance.
- Provide dashboards and enterprise reporting.
- Prepare the system for future AI-driven enhancements.

***

## Key Features

### Procurement Management

- Purchase Request creation and tracking
- Purchase Request item management
- Budget validation before approvals
- Configurable multi-level approval workflow
- RFQ generation and vendor quotation collection
- Vendor comparison and selection
- Purchase Order generation and lifecycle tracking

### Inventory and Warehouse

- Goods Receipt Note (GRN) management
- Warehouse stock updates
- Inventory visibility across locations
- Stock transfer support
- Product and category management

### Finance and Compliance

- Invoice processing
- Three-way matching (PO + GRN + Invoice)
- Payment processing
- Cost center and budget management
- Audit logs and transaction history

### Administration and Insights

- Authentication and authorization
- Role-Based Access Control (RBAC)
- User, role, and permission management
- Notifications and alerts
- Dashboard analytics
- Procurement, vendor, inventory, finance, and audit reports

***

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Material UI
- Redux Toolkit
- Axios
- React Router

### Backend

- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Hibernate
- Maven
- Validation API
- Lombok
- JWT Authentication

### Database

- MySQL

### Documentation and Testing

- Swagger / OpenAPI
- Postman Collection

***

## System Architecture

```text
                     React Frontend
                            |
                     REST API (HTTPS)
                            |
                   Spring Boot Backend
                            |
         +------------------+------------------+
         |                  |                  |
   Authentication      Business Logic     Workflow Engine
         |                  |                  |
         +------------------+------------------+
                            |
                      MySQL Database
```

### Architectural Flow

```text
Frontend (React)
   ↓
REST Controllers
   ↓
Service Layer
   ↓
Business Modules / Workflow Engine
   ↓
Repository Layer
   ↓
MySQL Database
```

### Architecture Principles

- Modular and domain-driven package structure
- Layered architecture with separation of concerns
- Secure REST APIs with JWT-based authentication
- Scalable backend services and reusable frontend components
- Enterprise-ready auditing, reporting, and integrations

***

## Core Modules

### Authentication

- Login and logout
- JWT and refresh token handling
- Password reset
- Session and access control
- Role and permission management

### Master Data

- Users
- Roles
- Permissions
- Departments
- Cost Centers
- Employees
- Vendors
- Categories
- Products
- Warehouses
- Budgets

### Procurement

- Purchase Requests
- Purchase Request Items
- Approval Workflow
- RFQ Management
- Vendor Quotations
- Vendor Comparison
- Purchase Orders

### Inventory

- Goods Receipt Notes
- Warehouse Stock
- Inventory Tracking
- Stock Transfer

### Finance

- Invoice Management
- Budget Validation
- Three-Way Matching
- Payment Processing

### Reporting and Administration

- Dashboard Analytics
- Procurement Reports
- Vendor Reports
- Inventory Reports
- Finance Reports
- Audit Reports
- Notification Management
- Workflow Configuration
- System Settings

***

## Procurement Workflow

```text
Employee
   ↓
Create Purchase Request
   ↓
Budget Validation
   ↓
Department / Manager Approval
   ↓
Finance Approval
   ↓
Procurement Approval
   ↓
RFQ Generation
   ↓
Receive Quotations
   ↓
Vendor Selection
   ↓
Purchase Order Creation
   ↓
Goods Delivery
   ↓
Goods Receipt Note (GRN)
   ↓
Inventory Update
   ↓
Vendor Invoice
   ↓
Three-Way Matching
   ↓
Payment Processing
   ↓
Transaction Complete
```

***

## User Roles

| Role | Responsibilities |
|------|------------------|
| Super Admin | Complete system administration and governance |
| Admin | User management and master data administration |
| Employee | Create and track purchase requests |
| Department Manager | Department-level approval of requests |
| Procurement Manager | RFQ handling, vendor selection, and purchase orders |
| Finance Manager | Budget approval, invoice validation, and payments |
| Warehouse Manager | Goods receipt and inventory operations |
| Vendor | Submit quotations and manage deliveries |
| Auditor | Review reports, logs, and compliance activities |

***

## Repository Structure

```text
enterprise-procurement-system/
│
├── backend/
├── frontend/
├── database/
├── docs/
├── postman/
├── scripts/
├── assets/
├── .github/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── .editorconfig
└── .gitignore
```

### Folder Description

- `backend/` → Spring Boot backend source code
- `frontend/` → React frontend application
- `database/` → Schema, migrations, seed data, backups, ER diagrams, and queries
- `docs/` → Project and technical documentation
- `postman/` → API collections for testing and integration
- `scripts/` → Utility and automation scripts
- `assets/` → Branding assets, logos, screenshots, and icons
- `.github/` → CI/CD workflows, issue templates, and PR templates

***

## Backend Architecture

```text
backend/src/main/java/com/eps/
│
├── config/
├── security/
├── common/
│   ├── constants/
│   ├── enums/
│   ├── exception/
│   ├── response/
│   ├── util/
│   └── validation/
├── auth/
├── user/
├── role/
├── permission/
├── department/
├── costcenter/
├── employee/
├── vendor/
├── category/
├── product/
├── warehouse/
├── inventory/
├── budget/
├── procurement/
├── approval/
├── rfq/
├── quotation/
├── purchaseorder/
├── grn/
├── invoice/
├── payment/
├── dashboard/
├── report/
├── notification/
├── audit/
├── analytics/
├── workflow/
├── scheduler/
├── integration/
├── ai/
├── chatbot/
├── ocr/
├── barcode/
└── qrcode/
```

### Package Responsibilities

- `config` → Spring and application configuration
- `security` → JWT security, filters, and RBAC
- `common` → Shared constants, exceptions, responses, validators, and utilities
- `auth` → Authentication and authorization logic
- `user`, `role`, `permission` → Identity and access management
- `department`, `costcenter`, `employee` → Organizational master data
- `vendor`, `category`, `product`, `warehouse`, `inventory` → Supplier and inventory domains
- `budget`, `procurement`, `approval`, `rfq`, `quotation`, `purchaseorder` → Procurement lifecycle modules
- `grn`, `invoice`, `payment` → Receiving and finance workflows
- `dashboard`, `report`, `analytics` → Business intelligence and reporting
- `notification`, `audit`, `workflow`, `scheduler` → Operations, tracking, and automation
- `integration`, `ai`, `chatbot`, `ocr`, `barcode`, `qrcode` → Advanced and future-ready capabilities

***

## Frontend Architecture

```text
frontend/src/
│
├── api/
├── assets/
├── components/
├── pages/
├── layouts/
├── hooks/
├── redux/
├── services/
├── routes/
├── theme/
├── contexts/
├── constants/
├── styles/
├── utils/
├── types/
├── App.tsx
└── main.tsx
```

### Folder Responsibilities

- `api/` → Axios configuration and interceptors
- `components/` → Reusable UI components
- `pages/` → Application screens and feature pages
- `layouts/` → Shared application layouts
- `hooks/` → Custom React hooks
- `redux/` → Global state management using Redux Toolkit
- `services/` → Feature-specific API integration and business services
- `routes/` → Route configuration and protected routes
- `theme/` → Material UI theme setup
- `contexts/` → React contexts where needed
- `constants/` → App-wide constants and config values
- `styles/` → Shared styling resources
- `utils/` → Helper and utility functions
- `types/` → TypeScript interfaces, types, and models

***

## Database Structure

```text
database/
├── schema/
├── migration/
├── seed/
├── er-diagram/
├── queries/
└── backup/
```

### Database Notes

- Database name: `enterprise_procurement`
- The schema should follow normalized relational design.
- Use foreign key constraints for consistency and integrity.
- Migrations should be versioned and reusable.
- Seed scripts should initialize roles, permissions, and master data.

***

## Documentation Structure

```text
docs/
├── SRS/
├── TRD/
├── API/
├── Architecture/
├── ERD/
├── UML/
├── Workflow/
├── Sprint/
├── UI/
├── Deployment/
└── Presentation/
```

### Recommended Documentation Scope

- `SRS/` → Software Requirement Specification
- `TRD/` → Technical Requirement Document
- `API/` → Endpoint and contract documentation
- `Architecture/` → System architecture, diagrams, and design decisions
- `ERD/` → Database models and entity relationships
- `UML/` → Use case, sequence, activity, and class diagrams
- `Workflow/` → Procurement flow and approval diagrams
- `Sprint/` → Sprint plans, updates, and team tracking
- `UI/` → Design references, screens, and UX guidelines
- `Deployment/` → Deployment and environment setup guides
- `Presentation/` → Demo decks and project presentation materials

***

## Installation Guide

### Prerequisites

Make sure the following tools are installed:

- Java 21
- Maven
- Node.js LTS
- Git
- MySQL Server
- MySQL Workbench
- IntelliJ IDEA
- VS Code

### Clone the Repository

```bash
git clone https://github.com/<your-organization>/enterprise-procurement-system.git
cd enterprise-procurement-system
```

### Create the Database

```sql
CREATE DATABASE enterprise_procurement;
```

### Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Configure Application Properties

Update the backend configuration file:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/enterprise_procurement
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

***

## Running the Project

After setup, the application should be accessible at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Suggested Startup Order

1. Start MySQL Server.
2. Run the backend Spring Boot application.
3. Run the frontend React application.
4. Open the frontend in the browser.

***

## API Documentation

API documentation can be maintained using:

- Swagger / OpenAPI for interactive endpoint documentation
- Postman collections for testing and collaboration

### Recommended API Categories

- Authentication APIs
- User and Role APIs
- Master Data APIs
- Procurement APIs
- Approval APIs
- RFQ and Quotation APIs
- Purchase Order APIs
- GRN and Inventory APIs
- Invoice and Payment APIs
- Dashboard and Report APIs
- Notification and Audit APIs

***

## Git Workflow

### Branch Flow

```text
feature/*
   ↓
develop
   ↓
main
```

### Rules

- Never commit directly to `main`.
- Create every new task in a dedicated `feature/*` branch.
- Merge feature branches into `develop` through Pull Requests.
- Merge `develop` into `main` only for stable releases.

***

## Branch Strategy

```text
main
develop

feature/auth
feature/master-data
feature/vendor
feature/procurement
feature/inventory
feature/finance
feature/dashboard
feature/report
feature/notification
feature/testing
feature/documentation
```

### Suggested Naming Convention

- `feature/auth-jwt`
- `feature/vendor-management`
- `feature/purchase-request-module`
- `feature/grn-workflow`
- `bugfix/invoice-validation`
- `hotfix/payment-status-issue`

***

## Coding Standards

### Backend Standards

- Follow layered architecture.
- Use DTO pattern for request and response isolation.
- Apply service and repository patterns.
- Use constructor injection.
- Follow SOLID principles.
- Implement global exception handling.
- Use validation annotations for request integrity.
- Keep controller logic thin and business logic inside services.

### Frontend Standards

- Use functional React components.
- Write code in TypeScript.
- Use Redux Toolkit for scalable state management.
- Build reusable and composable UI components.
- Keep business API calls inside service layers.
- Use custom hooks for reusable logic.
- Organize code feature-wise where practical.

### General Standards

- Maintain clean code and meaningful naming conventions.
- Write modular, testable, and documented code.
- Add comments only where necessary.
- Follow consistent formatting and linting rules.
- Review code through Pull Requests before merging.

***

## Development Roadmap

### Phase 1: Foundation

- Project setup
- Environment configuration
- Authentication and authorization
- Core master data modules

### Phase 2: Procurement Core

- Purchase Request module
- Approval workflow
- Budget validation

### Phase 3: Sourcing

- RFQ generation
- Vendor quotations
- Vendor comparison and selection

### Phase 4: Ordering and Receiving

- Purchase Order module
- Goods Receipt Note (GRN)
- Inventory update workflows

### Phase 5: Finance

- Invoice processing
- Three-way matching
- Payment processing

### Phase 6: Insights and Operations

- Dashboard
- Reports
- Notifications
- Audit logs

### Phase 7: Quality and Release

- Testing
- Security hardening
- Performance optimization
- Deployment

***

## Future Enhancements

- AI-based vendor recommendation
- Demand forecasting
- OCR-based invoice processing
- Predictive procurement analytics
- ERP integration
- Mobile application
- Digital signature support
- Email notifications
- SMS notifications
- Push notifications
- AI procurement assistant
- Chatbot support
- Blockchain-based audit trail
- Barcode and QR code scanning automation

***

## Contributors

Each contributor should work in an isolated `feature/*` branch and create Pull Requests into `develop`.

### Suggested Team Ownership

| Area | Responsibility |
|------|----------------|
| Project Lead | Overall architecture and delivery |
| Backend Team | Spring Boot APIs and business modules |
| Frontend Team | React UI and state management |
| Database Team | Schema design, migration, and optimization |
| QA Team | Testing, validation, and bug tracking |
| Documentation Team | Technical documents, diagrams, and guides |

***

## License

This project is developed for academic, learning, and demonstration purposes.

You may replace this section later with your preferred license, such as:

- MIT License
- Apache 2.0 License
- Proprietary Academic Project License

***

## Maintainer Note

This README is structured to serve as a professional project overview for GitHub, academic submission, team collaboration, and enterprise-style documentation. For best presentation, keep the `docs/`, `postman/`, `database/`, and `.github/` folders updated alongside feature development.