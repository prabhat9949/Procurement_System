# Frontend API Reference

This document is the working API map for the frontend team. It lists the backend routes the React application uses today and the patterns the UI should follow.

## Base URL

Default local backend:

```text
http://localhost:8080
```

The frontend reads the base URL from:

```text
VITE_API_BASE_URL
```

If that is not set, the app falls back to `http://localhost:8080`.

## Authentication

All secured endpoints expect:

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

### Auth endpoints

```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
POST /api/auth/change-password
POST /api/auth/logout
```

### Auth response patterns

`POST /api/auth/login`

```json
{
  "accessToken": "jwt...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "username": "admin"
}
```

`GET /api/auth/me`

```json
{
  "userId": 1,
  "username": "admin",
  "authorities": [
    { "authority": "ROLE_ADMIN" }
  ]
}
```

## Identity and access

```http
GET    /api/employees
GET    /api/employees/{id}
POST   /api/employees
PUT    /api/employees/{id}
DELETE /api/employees/{id}

GET    /api/departments
GET    /api/departments/{id}
POST   /api/departments
PUT    /api/departments/{id}
DELETE /api/departments/{id}

GET    /api/cost-centers
GET    /api/cost-centers/{id}
POST   /api/cost-centers
PUT    /api/cost-centers/{id}
DELETE /api/cost-centers/{id}

GET    /api/roles
GET    /api/roles/{id}
POST   /api/roles
PUT    /api/roles/{id}
DELETE /api/roles/{id}

GET    /api/permissions
GET    /api/permissions/{id}
POST   /api/permissions
PUT    /api/permissions/{id}
DELETE /api/permissions/{id}

GET    /api/role-permissions
POST   /api/role-permissions
DELETE /api/role-permissions/{id}
```

## Master data

```http
GET    /api/vendors
GET    /api/vendors/{id}
POST   /api/vendors
PUT    /api/vendors/{id}
DELETE /api/vendors/{id}
GET    /api/vendors/search

GET    /api/categories
GET    /api/categories/{id}
POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}

GET    /api/uoms
GET    /api/uoms/{id}
POST   /api/uoms
PUT    /api/uoms/{id}
DELETE /api/uoms/{id}

GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
GET    /api/products/search

GET    /api/warehouses
GET    /api/warehouses/{id}
POST   /api/warehouses
PUT    /api/warehouses/{id}
DELETE /api/warehouses/{id}
GET    /api/warehouses/search

GET    /api/inventory
GET    /api/inventory/{id}
POST   /api/inventory
PUT    /api/inventory/{id}
DELETE /api/inventory/{id}
GET    /api/inventory/search
GET    /api/inventory/low-stock
GET    /api/inventory/out-of-stock
GET    /api/inventory/reorder
```

## Procurement workflow

```http
GET    /api/purchase-requests
GET    /api/purchase-requests/{id}
POST   /api/purchase-requests
PUT    /api/purchase-requests/{id}
DELETE /api/purchase-requests/{id}
POST   /api/purchase-requests/{id}/submit
GET    /api/purchase-requests/search

GET    /api/approval-rules
POST   /api/approval-rules
PUT    /api/approval-rules/{id}
DELETE /api/approval-rules/{id}

GET    /api/approvals
POST   /api/approvals/{id}/approve
POST   /api/approvals/{id}/reject

GET    /api/rfqs
GET    /api/rfqs/{id}
POST   /api/rfqs
PUT    /api/rfqs/{id}
DELETE /api/rfqs/{id}
POST   /api/rfqs/{id}/open
POST   /api/rfqs/{id}/close
POST   /api/rfqs/{id}/cancel

GET    /api/vendor-quotations
GET    /api/vendor-quotations/{id}
POST   /api/vendor-quotations
POST   /api/vendor-quotations/{id}/submit
POST   /api/vendor-quotations/{id}/withdraw

GET    /api/quotation-comparisons
GET    /api/quotation-comparisons/{id}
POST   /api/quotation-comparisons
POST   /api/quotation-comparisons/{id}/approve
POST   /api/quotation-comparisons/{id}/recommend/{quotationId}
POST   /api/quotation-comparisons/{id}/reject

GET    /api/purchase-orders
GET    /api/purchase-orders/{id}
POST   /api/purchase-orders
POST   /api/purchase-orders/{id}/send
POST   /api/purchase-orders/{id}/acknowledge
POST   /api/purchase-orders/{id}/close
POST   /api/purchase-orders/{id}/cancel

GET    /api/goods-receipts
GET    /api/goods-receipts/{id}
POST   /api/goods-receipts
POST   /api/goods-receipts/{id}/complete
```

## Finance and controls

```http
GET    /api/invoices
GET    /api/invoices/{id}
POST   /api/invoices
POST   /api/invoices/{id}/approve
POST   /api/invoices/{id}/match

GET    /api/three-way-matches
GET    /api/three-way-matches/{id}
POST   /api/three-way-matches
POST   /api/three-way-matches/{id}/approve
POST   /api/three-way-matches/{id}/reject

GET    /api/payments
GET    /api/payments/{id}
POST   /api/payments
POST   /api/payments/{id}/approve
POST   /api/payments/{id}/process
POST   /api/payments/{id}/complete

GET    /api/notifications
POST   /api/notifications
POST   /api/notifications/{id}/read
POST   /api/notifications/read-all

GET    /api/audit-logs
GET    /api/reports/dashboard
GET    /api/reports/export
```

## Frontend integration rules

- Keep API calls inside `frontend/src/services/apiServices.ts` or a module-specific service file.
- Use the shared Axios client so token handling stays consistent.
- Prefer backend DTO field names when building request payloads.
- If the backend returns wrapped responses, the shared API helper unwraps them automatically.
- Keep the Redux slices hydrated from backend API results rather than duplicating business state in page-local state.

## Current frontend approach

- Authentication is real and backed by `/api/auth/login` and `/api/auth/me`.
- Role-based navigation uses the authenticated account role.
- The app bootstraps core data when a token exists.
- Mock fallback data still exists so the UI remains usable during backend downtime, but the backend remains the source of truth.

