-- Flyway migration: V20231101__external_procurement_tables.sql
-- Creates tables for external procurement workflow (vendors, rfqs, rfq_lines, quotations, purchase_orders)

CREATE TABLE vendors (
    vendor_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    contact_info VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE rfqs (
    rfq_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rfq_number VARCHAR(40) NOT NULL UNIQUE,
    purchase_request_id BIGINT NOT NULL,
    shortage_quantity DECIMAL(15,3),
    status VARCHAR(20) NOT NULL,
    issue_date DATE NOT NULL,
    closing_date DATE NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rfq_pr FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(purchase_request_id)
) ENGINE=InnoDB;

CREATE TABLE rfq_lines (
    rfq_line_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rfq_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    required_date DATE NOT NULL,
    remarks VARCHAR(500),
    CONSTRAINT fk_rfq_line_rfq FOREIGN KEY (rfq_id) REFERENCES rfqs(rfq_id),
    CONSTRAINT fk_rfq_line_product FOREIGN KEY (product_id) REFERENCES products(product_id)
) ENGINE=InnoDB;

CREATE TABLE quotations (
    quotation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rfq_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    delivery_date DATE,
    valid_until DATE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quotation_rfq FOREIGN KEY (rfq_id) REFERENCES rfqs(rfq_id),
    CONSTRAINT fk_quotation_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
) ENGINE=InnoDB;

CREATE TABLE purchase_orders (
    po_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(40) NOT NULL UNIQUE,
    purchase_request_id BIGINT NOT NULL,
    rfq_id BIGINT NOT NULL,
    quotation_id BIGINT NOT NULL,
    vendor_id BIGINT NOT NULL,
    ordered_quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_pr FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(purchase_request_id),
    CONSTRAINT fk_po_rfq FOREIGN KEY (rfq_id) REFERENCES rfqs(rfq_id),
    CONSTRAINT fk_po_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(quotation_id),
    CONSTRAINT fk_po_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
) ENGINE=InnoDB;
