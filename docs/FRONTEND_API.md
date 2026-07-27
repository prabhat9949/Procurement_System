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

## Invoice

### Endpoints

```text
POST   /api/invoices
GET    /api/invoices
GET    /api/invoices/{id}
POST   /api/invoices/{id}/lines
GET    /api/invoices/{id}/lines
POST   /api/invoices/{id}/match
POST   /api/invoices/{id}/approve
POST   /api/invoices/{id}/attachments
GET    /api/invoices/{id}/attachments
GET    /api/invoices/{id}/history
```

List/search parameters:

```text
keyword, purchaseOrderId, goodsReceiptNoteId, status, page, size, sort, direction
```

Invoice header request:

```json
{
  "vendorInvoiceNumber": "VEN-INV-2026-0001",
  "purchaseOrderId": 1,
  "goodsReceiptNoteId": 1,
  "invoiceDate": "2026-07-27",
  "dueDate": "2026-08-26",
  "currency": "INR",
  "discountAmount": 0,
  "taxAmount": 0,
  "shippingCharges": 0,
  "otherCharges": 0,
  "paymentTerms": "NET_30",
  "paymentMethod": "BANK_TRANSFER",
  "remarks": "Invoice received from vendor"
}
```

Invoice line request:

```json
{
  "purchaseOrderLineId": 1,
  "goodsReceiptLineId": 1,
  "productId": 1,
  "quantity": 10,
  "unitPrice": 85000.00,
  "discountPercentage": 0,
  "taxPercentage": 18,
  "remarks": "Matched against GRN"
}
```

The invoice workflow currently supports:

* header creation from a purchase order and GRN
* line-level three-way matching against PO lines and GRN lines
* invoice matching and approval
* attachment metadata
* invoice history lookup

Invoice statuses currently exposed by the API:

```text
DRAFT, RECEIVED, UNDER_VERIFICATION, MATCH_PENDING, MATCHED, APPROVED, REJECTED, PARTIALLY_PAID, PAID, CANCELLED
```

## Three-Way Match

### Endpoints

```text
POST   /api/three-way-matches
GET    /api/three-way-matches
GET    /api/three-way-matches/{id}
GET    /api/three-way-matches/search
POST   /api/three-way-matches/{id}/generate
POST   /api/three-way-matches/{id}/approve
POST   /api/three-way-matches/{id}/reject
GET    /api/three-way-matches/{id}/history
GET    /api/three-way-match-lines
GET    /api/three-way-match-lines/{id}
```

Search parameters:

```text
keyword, vendorId, status, page, size, sort, direction
```

Create request:

```json
{
  "purchaseOrderId": 1,
  "goodsReceiptNoteId": 1,
  "invoiceId": 1,
  "remarks": "Finance validation before payment"
}
```

Response overview:

```json
{
  "matchNumber": "TWM-2026-000001",
  "status": "MATCHED",
  "overallResult": "PASS"
}
```

The match engine compares:

* purchase order lines
* GRN lines
* invoice lines

Tolerance settings:

```text
app.three-way-match.quantity-tolerance-percent
app.three-way-match.price-tolerance-percent
```

Default values:

```text
quantity = 0
price = 2
```

Status lifecycle:

```text
PENDING -> MATCHED -> APPROVED
PENDING -> MISMATCH -> REJECTED
```

Result values:

```text
PASS, FAIL, WARNING
```

## Payment

### Endpoints

```text
POST   /api/payments
GET    /api/payments
GET    /api/payments/{id}
PUT    /api/payments/{id}
DELETE /api/payments/{id}
GET    /api/payments/search
POST   /api/payments/{id}/approve
POST   /api/payments/{id}/process
POST   /api/payments/{id}/complete
POST   /api/payments/{id}/fail
POST   /api/payments/{id}/cancel
POST   /api/payments/{id}/allocations
GET    /api/payments/{id}/allocations
POST   /api/payments/{id}/attachments
GET    /api/payments/{id}/attachments
DELETE /api/payments/{id}/attachments/{attachmentId}
GET    /api/payments/{id}/history
```

Search parameters:

```text
keyword, vendorId, status, paymentMethod, page, size, sort, direction
```

Create payment request:

```json
{
  "invoiceId": 1,
  "threeWayMatchId": 1,
  "purchaseOrderId": 1,
  "paymentDate": "2026-07-27",
  "scheduledDate": "2026-07-31",
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "PAY-REF-001",
  "bankReference": "BANK-REF-001",
  "currency": "INR",
  "grossAmount": 100000.00,
  "discountAmount": 0,
  "taxDeduction": 0,
  "otherDeduction": 0,
  "remarks": "Initial vendor payment"
}
```

Payment allocation request:

```json
{
  "invoiceId": 1,
  "allocatedAmount": 50000.00,
  "remarks": "Partial payment against invoice"
}
```

Payment lifecycle:

```text
DRAFT -> APPROVED -> PROCESSING -> PAID
DRAFT -> SCHEDULED -> APPROVED -> PROCESSING -> PARTIALLY_PAID -> PAID
DRAFT -> CANCELLED
DRAFT -> FAILED
```

Status values:

```text
DRAFT, SCHEDULED, APPROVED, PROCESSING, PARTIALLY_PAID, PAID, FAILED, CANCELLED, REFUNDED
```

Payment methods:

```text
BANK_TRANSFER, CHEQUE, NEFT, RTGS, IMPS, UPI, CASH, OTHER
```

The payment workflow currently supports:

* payment creation after a three-way match is approved
* partial and multiple allocations against one invoice
* status transitions for approval, processing, completion, failure, and cancellation
* payment attachments and history
* automatic invoice status refresh to `PARTIALLY_PAID` or `PAID`

## Notifications

### Endpoints

```text
POST   /api/notifications
GET    /api/notifications
GET    /api/notifications/{id}
GET    /api/notifications/search
POST   /api/notifications/{id}/send
POST   /api/notifications/{id}/mark-read
POST   /api/notifications/{id}/archive
GET    /api/notifications/{id}/recipients
```

### Templates

```text
POST   /api/notification-templates
GET    /api/notification-templates
PUT    /api/notification-templates/{id}
```

### Preferences

```text
GET   /api/notification-preferences
PUT   /api/notification-preferences/{userId}
```

Notification search parameters:

```text
keyword, userId, status, priority, type, page, size, sort, direction
```

Notification create request:

```json
{
  "title": "Purchase Request Submitted",
  "message": "PR-2026-000123 has been submitted for approval.",
  "type": "PURCHASE_REQUEST",
  "priority": "HIGH",
  "referenceType": "PurchaseRequest",
  "referenceId": 123,
  "senderId": 1,
  "scheduledAt": "2026-07-27T10:30:00",
  "expiresAt": "2026-07-30T10:30:00"
}
```

Send request:

```json
{
  "recipientUserIds": [2, 3],
  "deliveryChannels": ["IN_APP", "EMAIL"]
}
```

Template request:

```json
{
  "templateCode": "PR_SUBMITTED",
  "titleTemplate": "Purchase Request Submitted",
  "bodyTemplate": "{{requestNumber}} has been submitted for approval.",
  "notificationType": "PURCHASE_REQUEST",
  "active": true
}
```

Preference request:

```json
{
  "emailEnabled": true,
  "smsEnabled": false,
  "inAppEnabled": true,
  "approvalNotifications": true,
  "paymentNotifications": true,
  "rfqNotifications": true
}
```

Notification status values:

```text
DRAFT, PENDING, SENT, DELIVERED, READ, FAILED, EXPIRED
```

Notification types:

```text
SYSTEM, APPROVAL, PURCHASE_REQUEST, RFQ, QUOTATION, PURCHASE_ORDER, GOODS_RECEIPT, INVOICE, PAYMENT, REMINDER, CUSTOM
```

Notification priorities:

```text
LOW, MEDIUM, HIGH, CRITICAL
```

Delivery channels:

```text
IN_APP, EMAIL, SMS
```

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

The Purchase Request header and line APIs are available. Approval Tasks are not implemented yet.

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

### Purchase Request Lines

```text
POST   /api/purchase-request-lines
GET    /api/purchase-request-lines
GET    /api/purchase-request-lines/search
GET    /api/purchase-request-lines/{id}
PUT    /api/purchase-request-lines/{id}
DELETE /api/purchase-request-lines/{id}
```

Search parameters:

```text
keyword, purchaseRequestId, productId, page, size, sort, direction
```

Request body:

```json
{
  "purchaseRequestId": 1,
  "productId": 1,
  "quantity": 10.000,
  "unitPrice": 85000.00,
  "remarks": "Standard configuration"
}
```

The product can appear only once on a Purchase Request. `estimatedAmount` is calculated as `quantity × unitPrice`, and the parent Purchase Request's `estimatedAmount` is recalculated automatically. Lines can be changed only while the parent request is `DRAFT` and only by its creator.

### Approval Rules

```text
POST   /api/approval-rules
GET    /api/approval-rules
GET    /api/approval-rules/{id}
PUT    /api/approval-rules/{id}
DELETE /api/approval-rules/{id}
```

Search parameters: `keyword`, `departmentId`, `active`, `page`, `size`, `sort`, `direction`.

Request body:

```json
{
  "ruleCode": "IT_HIGH_VALUE",
  "ruleName": "IT high-value approval",
  "departmentId": 1,
  "minimumAmount": 100000.00,
  "maximumAmount": 1000000.00,
  "active": true,
  "description": "Multi-level approval for IT purchases"
}
```

### Approval Stages

```text
POST   /api/approval-stages
GET    /api/approval-stages
GET    /api/approval-stages/{id}
PUT    /api/approval-stages/{id}
DELETE /api/approval-stages/{id}
```

Search parameters: `approvalRuleId`, `approverRoleId`, `active`, `page`, `size`, `sort`, `direction`.

### Approval Workflow

```text
POST /api/purchase-requests/{id}/submit
GET  /api/approval-tasks
GET  /api/approval-tasks/{id}
POST /api/approval-tasks/{id}/approve
POST /api/approval-tasks/{id}/reject
POST /api/approval-tasks/{id}/return
GET  /api/approval-histories
GET  /api/approval-histories/{id}
```

Submission requires a matching active rule and stage, changes the request to `UNDER_REVIEW`, creates the first pending task, and records history. Only the assigned employee can decide a pending task. Approving creates the next stage or completes the request; rejecting sets `REJECTED`; returning resets it to `DRAFT`.

Task filters: `purchaseRequestId`, `assignedEmployeeId`, `status`, `page`, `size`, `sort`, `direction`.

Decision body:

```json
{ "comments": "Approved within department budget" }
```

History filters: `purchaseRequestId`, `page`, `size`, `sort`, `direction`.

### RFQ

Generate an RFQ from an approved Purchase Request. The backend copies all Purchase Request Lines automatically.

```text
POST   /api/rfqs
POST   /api/rfqs/{purchaseRequestId}/generate
GET    /api/rfqs
GET    /api/rfqs/{id}
PUT    /api/rfqs/{id}
DELETE /api/rfqs/{id}
POST   /api/rfqs/{id}/open
POST   /api/rfqs/{id}/close
POST   /api/rfqs/{id}/cancel
```

Request body:

```json
{
  "purchaseRequestId": 1,
  "closingDate": "2026-08-30",
  "quotationOpeningDate": "2026-09-01",
  "currency": "INR",
  "remarks": "Invite approved technology vendors"
}
```

RFQ search parameters: `keyword`, `status`, `departmentId`, `page`, `size`, `sort`, `direction`.

Status flow: `DRAFT` → `OPEN` → `CLOSED`; RFQs may be cancelled before award. Only approved Purchase Requests can generate an RFQ, and each Purchase Request can generate only one RFQ.

### RFQ Lines

```text
GET /api/rfq-lines
GET /api/rfq-lines/{id}
```

Filters: `rfqId`, `productId`, `page`, `size`, `sort`, `direction`.

### RFQ Vendors

```text
POST   /api/rfqs/{rfqId}/vendors
DELETE /api/rfqs/{rfqId}/vendors/{vendorId}
GET    /api/rfqs/{rfqId}/vendors
GET    /api/rfq-vendors/search
```

Invite request:

```json
{
  "vendorId": 1,
  "remarks": "Preferred supplier invitation"
}
```

Only active and approved vendors can be invited, and duplicate invitations are rejected. Vendor search filters are `rfqId`, `vendorId`, `page`, `size`, `sort`, and `direction`.

### Vendor Quotations

```text
POST   /api/vendor-quotations
GET    /api/vendor-quotations
GET    /api/vendor-quotations/search
GET    /api/vendor-quotations/{id}
PUT    /api/vendor-quotations/{id}
DELETE /api/vendor-quotations/{id}
POST   /api/vendor-quotations/{id}/submit
POST   /api/vendor-quotations/{id}/withdraw
```

Create a draft quotation only for an invited vendor on an `OPEN` RFQ:

```json
{
  "rfqId": 1,
  "vendorId": 1,
  "validUntil": "2026-09-30",
  "currency": "INR",
  "discountAmount": 5000.00,
  "taxAmount": 18000.00,
  "shippingCharges": 1500.00,
  "otherCharges": 0.00,
  "paymentTerms": "Net 30",
  "deliveryDays": 14,
  "deliveryLocation": "Delhi Warehouse",
  "warrantyMonths": 12,
  "remarks": "Commercial quotation"
}
```

Quotation lines:

```text
POST   /api/vendor-quotation-lines
GET    /api/vendor-quotation-lines
GET    /api/vendor-quotation-lines/search
GET    /api/vendor-quotation-lines/{id}
PUT    /api/vendor-quotation-lines/{id}
DELETE /api/vendor-quotation-lines/{id}
```

Line request fields are `vendorQuotationId`, `rfqLineId`, `quantity`, `unitPrice`, `discountPercentage`, `taxPercentage`, and `remarks`. The backend calculates line amounts, subtotal, tax, discount, and grand total when the quotation is submitted. A quotation must contain at least one line and cannot be edited after submission.

Quotation attachments (metadata):

```text
POST /api/quotation-attachments
GET  /api/quotation-attachments?quotationId={id}&page=0&size=20
```

Attachment fields are `vendorQuotationId`, `fileName`, `filePath`, and `fileType`. Supported document types are PDF, DOCX, and XLSX; the file path references storage managed by the application.

### Quotation Comparison

```text
POST   /api/quotation-comparisons
GET    /api/quotation-comparisons
GET    /api/quotation-comparisons/search
GET    /api/quotation-comparisons/{id}
PUT    /api/quotation-comparisons/{id}
DELETE /api/quotation-comparisons/{id}
POST   /api/quotation-comparisons/{id}/generate
POST   /api/quotation-comparisons/{id}/recommend/{quotationId}
POST   /api/quotation-comparisons/{id}/approve
POST   /api/quotation-comparisons/{id}/reject
```

Create request:

```json
{
  "rfqId": 1,
  "comparisonMethod": "WEIGHTED_SCORE",
  "remarks": "Commercial evaluation"
}
```

Generate is allowed only after the RFQ is `CLOSED` and at least two quotations are `SUBMITTED`. The generated comparison ranks quotations using price and delivery scoring. Recommend a quotation before approval. Approval marks the winner `ACCEPTED`, other quotations `REJECTED`, and the RFQ `AWARDED`.

Comparison lines:

```text
GET /api/quotation-comparison-lines
GET /api/quotation-comparison-lines/search
GET /api/quotation-comparison-lines/{id}
```

Supported comparison methods: `LOWEST_PRICE`, `BEST_VALUE`, `WEIGHTED_SCORE`, `TECHNICAL`, `MANUAL`. Search filters include `keyword`, `method`, `status`, `page`, `size`, `sort`, and `direction`.

### Purchase Orders

```text
POST   /api/purchase-orders
POST   /api/purchase-orders/generate/{comparisonId}
GET    /api/purchase-orders
GET    /api/purchase-orders/search
GET    /api/purchase-orders/{id}
PUT    /api/purchase-orders/{id}
DELETE /api/purchase-orders/{id}
POST   /api/purchase-orders/{id}/send
POST   /api/purchase-orders/{id}/acknowledge
POST   /api/purchase-orders/{id}/cancel
POST   /api/purchase-orders/{id}/close
```

Purchase Order generation requires an `APPROVED` comparison with an `ACCEPTED` winning quotation. Quotation lines are copied automatically and totals are calculated.

```json
{
  "quotationComparisonId": 1,
  "expectedDeliveryDate": "2026-10-15",
  "deliveryAddress": "Main Warehouse",
  "billingAddress": "Head Office",
  "remarks": "Generated from approved comparison"
}
```

PO status flow: `GENERATED` → `SENT` → `ACKNOWLEDGED` → `PARTIALLY_RECEIVED` → `FULLY_RECEIVED` → `CLOSED`. Cancellation is terminal.

Purchase Order lines, attachments, and history:

```text
GET    /api/purchase-order-lines?purchaseOrderId={id}
GET    /api/purchase-order-lines/{id}
POST   /api/purchase-orders/{id}/attachments
GET    /api/purchase-orders/{id}/attachments
DELETE /api/purchase-orders/{id}/attachments/{attachmentId}
GET    /api/purchase-orders/{id}/history
```

Attachment request fields are `fileName`, `filePath`, and `fileType`.

### Goods Receipt Notes

```text
POST /api/goods-receipts
GET  /api/goods-receipts
GET  /api/goods-receipts/{id}
POST /api/goods-receipts/{id}/lines
GET  /api/goods-receipts/{id}/lines
POST /api/goods-receipts/{id}/complete
```

Only `ACKNOWLEDGED` or partially received Purchase Orders can receive goods. A line must satisfy `acceptedQuantity + rejectedQuantity + damagedQuantity = receivedQuantity`, and received quantity cannot exceed the remaining ordered quantity. Completing a GRN updates accepted and damaged inventory quantities and the Purchase Order line receipt totals.

## Reports

### Dashboard

```text
GET /api/reports/dashboard
```

Dashboard response includes:

* total procurement spend
* monthly spend
* pending approvals, RFQs, POs, GRNs, invoices, and payments
* inventory value
* chart data for monthly spend, department spend, vendor spend, invoice status, and payment status

### Report endpoints

```text
GET /api/reports/purchase-requests
GET /api/reports/approvals
GET /api/reports/rfqs
GET /api/reports/quotations
GET /api/reports/comparisons
GET /api/reports/purchase-orders
GET /api/reports/grns
GET /api/reports/inventory
GET /api/reports/invoices
GET /api/reports/three-way-matches
GET /api/reports/payments
GET /api/reports/vendors
GET /api/reports/departments
GET /api/reports/audit-summary
```

Common filter parameters:

```text
startDate, endDate, departmentId, vendorId, warehouseId, categoryId, productId, status, employeeId, costCenterId
```

Common paging and sorting parameters:

```text
page, size, sort, direction
```

Report row response schema:

```json
{
  "id": 1,
  "referenceNumber": "PO-2026-000001",
  "title": "Procurement spend",
  "status": "APPROVED",
  "relatedOne": "Acme Supplies",
  "relatedTwo": "Procurement",
  "relatedThree": "IT Infrastructure",
  "date": "2026-07-27",
  "quantity": 10,
  "amount": 100000.00,
  "remarks": "Generated from purchase order"
}
```

### Export APIs

```text
GET /api/reports/export/pdf?reportType=purchase-orders
GET /api/reports/export/excel?reportType=purchase-orders
GET /api/reports/export/csv?reportType=purchase-orders
```

Export parameters use the same filters as the report endpoints plus `reportType`.

Export response:

```json
{
  "fileName": "purchase-orders.xlsx",
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "dataBase64": "<base64-file-content>"
}
```

Supported report types:

```text
purchase-requests, approvals, rfqs, quotations, comparisons, purchase-orders, grns, inventory, invoices, three-way-matches, payments, vendors, departments, audit-summary
```

The reports module uses aggregate SQL over existing business tables only. No new business tables were added.

## Audit Logs

### Endpoints

```text
GET /api/audit-logs
GET /api/audit-logs/{id}
GET /api/audit-logs/search
GET /api/audit-logs/export
```

Search filters:

```text
moduleName, entityName, operation, userId, startDate, endDate, success, referenceNumber, page, size, sort, direction
```

Audit log response schema:

```json
{
  "id": 1,
  "moduleName": "PurchaseRequest",
  "entityName": "PurchaseRequest",
  "entityId": 10,
  "operation": "CREATE",
  "referenceNumber": "PR-2026-000001",
  "referenceType": "PurchaseRequest",
  "userId": 2,
  "username": "john.doe",
  "performedBy": "john.doe",
  "success": true,
  "oldValue": null,
  "newValue": "{\"status\":\"DRAFT\"}",
  "details": "Purchase request created",
  "performedAt": "2026-07-27T10:30:00"
}
```

Export response:

```json
{
  "fileName": "audit-logs.csv",
  "contentType": "text/csv",
  "dataBase64": "<base64-file-content>"
}
```

Audit logs are immutable. The API is read-only, while the service layer exposes `AuditLogService.record(...)` for future workflow integrations.

## Role dashboards

All dashboard endpoints are read-only and aggregate existing business data; they do not create dashboard tables. Send the normal bearer token with every request.

```text
GET /api/dashboard/admin
GET /api/dashboard/procurement
GET /api/dashboard/finance
GET /api/dashboard/warehouse
GET /api/dashboard/vendor?vendorId={vendorId}
```

Role access:

```text
admin        SUPER_ADMIN, ADMIN, AUDITOR
procurement  SUPER_ADMIN, ADMIN, PROCUREMENT_MANAGER
finance      SUPER_ADMIN, ADMIN, FINANCE_MANAGER
warehouse    SUPER_ADMIN, ADMIN, WAREHOUSE_MANAGER
vendor       SUPER_ADMIN, ADMIN, VENDOR
```

The vendor dashboard currently requires `vendorId`. A vendor-to-user mapping does not yet exist in the identity model, so the frontend must supply the selected vendor ID for an authorized vendor/admin user.

Supported filters (only filters applicable to the underlying data source affect a given KPI/chart):

```text
startDate, endDate, departmentId, vendorId, warehouseId, status, costCenterId
```

Dashboard response schema:

```json
{
  "dashboard": "procurement",
  "generatedAt": "2026-07-28T11:00:00",
  "kpis": [
    {"code": "OPEN_RFQS", "label": "Open RFQs", "count": 4, "amount": null}
  ],
  "charts": [
    {"code": "PURCHASE_REQUESTS", "label": "Purchase Requests", "points": [
      {"label": "2026-07", "value": 12.00}
    ]}
  ],
  "recentActivities": [
    {"type": "PURCHASE_REQUEST", "referenceNumber": "PR-2026-000001", "title": "Purchase request: New laptops", "status": "SUBMITTED", "occurredAt": "2026-07-28T10:00:00"}
  ]
}
```

Admin includes organization-wide users, master data, procurement, matching, payment, and unread-notification KPIs. Procurement includes assigned pending approvals, RFQs, quotations, and delivery KPIs. Finance includes invoice, three-way-match, payment, monthly-spend, and outstanding-balance KPIs. Warehouse includes GRN, inventory-value, low-stock, and out-of-stock KPIs. Admin chart payloads additionally include department spend plus purchase-order, invoice, and payment status distributions. Recent activities combine the latest purchase requests, approvals, purchase orders, payments, inventory updates, and notifications.

### Chart endpoints

```text
GET /api/dashboard/charts/spend
GET /api/dashboard/charts/pr
GET /api/dashboard/charts/rfq
GET /api/dashboard/charts/po
GET /api/dashboard/charts/grn
GET /api/dashboard/charts/invoices
GET /api/dashboard/charts/payments
GET /api/dashboard/charts/vendors
GET /api/dashboard/charts/inventory
```

Each chart endpoint returns `{ code, label, points }`, where every point has a string `label` and numeric `value`. Role dashboards also include department spend and PO, invoice, and payment status summaries where relevant.

## Not currently available as APIs

These modules currently have no frontend API controllers:

- User management
- Employee management
- Department management
- Cost Center management
- Role management
- Permission management
- RolePermission management

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
| 2026-07-27 | Added frontend API reference for authentication, Vendor, Product, Warehouse, Inventory, Purchase Request header/lines, Approval Workflow, RFQ, Vendor Quotation, Quotation Comparison, Purchase Order, and Goods Receipt APIs. |
| 2026-07-27 | Added frontend API reference for Invoice, Three-Way Match, Payment, Notification, and Reports APIs. |
| 2026-07-27 | Added frontend API reference for Audit Log APIs and export. |
| 2026-07-28 | Added role-based Dashboard APIs, KPI responses, recent activity feed, chart endpoints, filters, and access rules. |
