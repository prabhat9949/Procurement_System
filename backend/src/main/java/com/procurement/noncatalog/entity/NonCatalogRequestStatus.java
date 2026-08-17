package com.procurement.noncatalog.entity;

public enum NonCatalogRequestStatus {
    PENDING_HR_REVIEW,
    HR_APPROVED_FORWARDED,
    HR_RETURNED,
    HR_REJECTED,
    PROCUREMENT_REVIEW,
    CATALOG_PRODUCT_LINKED,
    PRODUCT_CREATED,
    COMPLETED,
    REJECTED
}
