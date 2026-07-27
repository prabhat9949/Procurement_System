# Enterprise Procurement System — Frontend API Guide

Frontend-only integration reference. This document describes the APIs that currently exist in the backend. Update this file in the same change whenever a new endpoint, request field, response field, or enum is added.

Last updated: 2026-07-27

## Connection

Development base URL:

```text
http://localhost:8080
```

All paths below already include `/api`.

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Only `/api/auth/**` is public. The backend uses stateless JWT authentication.

## Response conventions

Most business endpoints return:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Paginated `data`:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0,
  "last": true
}
```

Delete and change-password operations return `204 No Content`.

Use ISO dates (`YYYY-MM-DD`) and ISO date-times where returned by the API.

## Authentication

### Register

```http
POST /api/auth/register
```

```json
{
  "username": "john.doe",
  "password": "Password@123",
  "employeeId": 1,
  "roleId": 2
}
```

Response `201 Created`:

```json
{
  "userId": 1,
  "username": "john.doe"
}
```

### Login

```http
POST /api/auth/login
```

```json
{
  "username": "john.doe",
  "password": "Password@123"
}
```

Response:

```json
{
  "accessToken": "<JWT>",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "username": "john.doe"
}
```

Store `accessToken` and send it as a Bearer token on protected requests.

### Current user

```http
GET /api/auth/me
```

Response:

```json
{
  "userId": 1,
  "username": "john.doe",
  "authorities": [
    { "authority": "ROLE_EMPLOYEE" },
    { "authority": "VIEW_PRODUCTS" }
  ]
}
```

### Change password

```http
POST /api/auth/change-password
```

```json
{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@123"
}
```

### Logout

```http
POST /api/auth/logout
```

The backend is stateless. Treat logout as successful and remove the token from the frontend; the server does not maintain a token blacklist.

## Vendor

### Endpoints

```text
POST   /api/vendors
GET    /api/vendors
GET    /api/vendors/search
GET    /api/vendors/{id}
PUT    /api/vendors/{id}
DELETE /api/vendors/{id}
```

`GET /api/vendors` and `/search` accept:

```text
keyword, vendorType, status, approved, page, size, sort, direction
```

Example request body:

```json
{
  "vendorCode": "VEN-001",
  "vendorName": "Acme Supplies",
  "contactPerson": "Jane Doe",
  "email": "jane@acme.example",
  "phone": "+91-9876543210",
  "mobile": "+91-9876543210",
  "gstNumber": "22AAAAA0000A1Z5",
  "panNumber": "AAAAA0000A",
  "registrationNumber": "REG-001",
  "vendorType": "DISTRIBUTOR",
  "paymentTerms": "NET_30",
  "paymentMethod": "BANK_TRANSFER",
  "creditLimit": 500000.00,
  "currency": "INR",
  "bankName": "Example Bank",
  "bankAccountNumber": "1234567890",
  "ifscCode": "EXMP0001234",
  "website": "https://acme.example",
  "addressLine1": "1 Main Street",
  "addressLine2": "Industrial Area",
  "city": "Delhi",
  "state": "Delhi",
  "country": "India",
  "postalCode": "110001",
  "status": "ACTIVE",
  "rating": 4.5,
  "approved": false
}
```

`vendorCode`, `vendorName`, and `vendorType` are required. `gstNumber` and `vendorCode` are unique. `status` defaults to `ACTIVE`; valid statuses are `ACTIVE`, `INACTIVE`, and `BLOCKED`.

## Product

### Endpoints

```text
POST   /api/products
GET    /api/products
GET    /api/products/search
GET    /api/products/{id}
PUT    /api/products/{id}
DELETE /api/products/{id}
```

Search parameters:

```text
keyword, categoryId, vendorId, active, page, size, sort, direction
```

Request body:

```json
{
  "productCode": "LAP-001",
  "sku": "LAP-001-BLK",
  "productName": "Business Laptop",
  "description": "14-inch business laptop",
  "brand": "Example",
  "manufacturer": "Example Manufacturing",
  "categoryId": 1,
  "vendorId": 1,
  "unitOfMeasureId": 1,
  "unitPrice": 85000.00,
  "currency": "INR",
  "minimumStock": 10,
  "maximumStock": 100,
  "reorderLevel": 20,
  "leadTimeDays": 14,
  "taxPercentage": 18.00,
  "active": true
}
```

`productCode`, `sku`, `productName`, category, vendor, UOM, price, currency, and stock thresholds are required. `productCode` and `sku` are unique. `maximumStock` must be at least `minimumStock`.

## Warehouse

### Endpoints

```text
POST   /api/warehouses
GET    /api/warehouses
GET    /api/warehouses/search
GET    /api/warehouses/{id}
PUT    /api/warehouses/{id}
DELETE /api/warehouses/{id}
```

Search parameters:

```text
keyword, warehouseType, city, state, status, page, size, sort, direction
```

Request body:

```json
{
  "warehouseCode": "WH-DEL-001",
  "warehouseName": "Delhi Central Warehouse",
  "description": "Central distribution facility",
  "warehouseType": "CENTRAL",
  "status": "ACTIVE",
  "managerName": "Rahul Kumar",
  "contactPerson": "Operations Desk",
  "email": "delhi.wh@example.com",
  "phone": "+91-1111111111",
  "addressLine1": "1 Industrial Road",
  "addressLine2": "Sector 10",
  "city": "Delhi",
  "state": "Delhi",
  "country": "India",
  "postalCode": "110001",
  "storageCapacity": 100000.00
}
```

`warehouseCode`, `warehouseName`, `warehouseType`, and positive `storageCapacity` are required. `warehouseCode` is unique. Valid warehouse types are `CENTRAL`, `REGIONAL`, `BRANCH`, `STORE`, and `VIRTUAL`. Status defaults to `ACTIVE`; valid statuses are `ACTIVE` and `INACTIVE`.

## Inventory

### CRUD endpoints

```text
POST   /api/inventory
GET    /api/inventory
GET    /api/inventory/search
GET    /api/inventory/{id}
PUT    /api/inventory/{id}
DELETE /api/inventory/{id}
```

Search parameters:

```text
keyword, productId, warehouseId, categoryId, status,
lowStock, outOfStock, page, size, sort, direction
```

Request body:

```json
{
  "productId": 1,
  "warehouseId": 1,
  "availableQuantity": 42.000,
  "reservedQuantity": 5.000,
  "damagedQuantity": 0.000,
  "minimumStock": 10.000,
  "maximumStock": 100.000,
  "reorderLevel": 20.000,
  "averageUnitCost": 85000.00,
  "status": "ACTIVE"
}
```

The product/warehouse pair is unique. Quantities and cost must be zero or greater. `maximumStock` must be at least `minimumStock`. Inventory value is calculated by the backend from available quantity and average unit cost.

### Inventory reports

```text
GET /api/inventory/low-stock
GET /api/inventory/out-of-stock
GET /api/inventory/reorder
```

Optional parameters for these endpoints:

```text
productId, warehouseId, page, size, sort, direction
```

Low stock means `availableQuantity <= reorderLevel`. Out of stock means `availableQuantity <= 0`. Reorder uses the low-stock rule.

## Purchase Request

The Purchase Request header API is available. Purchase Request Lines and Approval Tasks are not implemented yet.

### Endpoints

```text
POST   /api/purchase-requests
GET    /api/purchase-requests
GET    /api/purchase-requests/search
GET    /api/purchase-requests/{id}
PUT    /api/purchase-requests/{id}
DELETE /api/purchase-requests/{id}
```

Search parameters:

```text
keyword, requesterId, departmentId, costCenterId,
priority, status, approvalStatus,
requiredDateFrom, requiredDateTo,
createdDateFrom, createdDateTo,
page, size, sort, direction
```

Request body:

```json
{
  "requesterId": 1,
  "departmentId": 1,
  "costCenterId": 1,
  "requiredDate": "2026-08-15",
  "priority": "HIGH",
  "purpose": "Replace aging laptops",
  "remarks": "Required for the new team",
  "estimatedAmount": 850000.00
}
```

The backend generates `requestNumber` in the format `PR-YYYY-######`. Required date must be in the future. New requests start as `DRAFT` with approval status `PENDING`. Only draft requests can be updated or deleted, and only their creator can modify them.

Valid priorities:

```text
LOW, MEDIUM, HIGH, URGENT
```

Valid request statuses:

```text
DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, RFQ_CREATED
```

Valid approval statuses:

```text
PENDING, APPROVED, REJECTED, RETURNED
```

## Not currently available as APIs

These modules currently have no frontend API controllers:

- User management
- Employee management
- Department management
- Cost Center management
- Role management
- Permission management
- RolePermission management
- Purchase Request Lines
- Approval Rule, Stage, Task, and History
- RFQ and vendor invitations
- Vendor quotations and comparison
- Purchase Orders
- Goods Receipt Notes
- Invoices and three-way matching
- Payments
- Reports, dashboard, notifications, and audit logs

## Frontend integration checklist

1. Login and store `accessToken`.
2. Attach `Authorization: Bearer <accessToken>` to every protected request.
3. Use the IDs returned by master-data APIs when creating Product, Inventory, and Purchase Requests.
4. Treat `401` as an expired/missing session and redirect to login.
5. Treat `409` as a duplicate/conflict response.
6. Treat `400` as validation or invalid-filter input.
7. Keep this file updated in the same commit whenever an API changes.

## API change log

| Date | Change |
|---|---|
| 2026-07-27 | Added frontend API reference for authentication, Vendor, Product, Warehouse, Inventory, and Purchase Request header APIs. |
