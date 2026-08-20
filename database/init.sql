-- =====================================================================
-- Enterprise Procurement System (EPS) — Database Bootstrap
-- =====================================================================
-- The Spring Boot backend AUTOMATICALLY creates the schema and seed data:
--   1. The JDBC URL uses createDatabaseIfNotExist=true, so the database
--      itself is created on first connection.
--   2. spring.jpa.hibernate.ddl-auto=update creates all tables from the
--      JPA entities.
--   3. DataInitializerConfig + DemoDataSeeder insert roles, users, the
--      login matrix, departments, cost centers, employees, vendors,
--      products, warehouses, inventory and sample purchase requests.
--
-- Therefore you do NOT need to run this file. It is provided only as a
-- reference for manual setups (e.g. a DBA provisioning the server).
--
-- The EASIEST way to get a ready database is:
--     docker compose up -d
-- (creates MySQL 8 with user root / password root and the database below)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS enterprise_procurement
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE enterprise_procurement;

-- =====================================================================
-- APP DEFAULTS
-- =====================================================================
-- Backend (backend/src/main/resources/application.properties):
--   spring.datasource.url=jdbc:mysql://localhost:3306/enterprise_procurement?createDatabaseIfNotExist=true&...
--   spring.datasource.username=root
--   spring.datasource.password=root
--   spring.jpa.hibernate.ddl-auto=update
-- Override any of these with environment variables:
--   SPRING_DATASOURCE_URL / SPRING_DATASOURCE_USERNAME / SPRING_DATASOURCE_PASSWORD
-- =====================================================================

-- =====================================================================
-- DEVELOPMENT LOGIN MATRIX (seeded automatically by DataInitializerConfig)
-- =====================================================================
-- Username            Password            Role
-- ------------------  ------------------  --------------------------
-- admin@123           Admin@123           SUPER_ADMIN
-- hr@123              Hr@123              HR_MANAGER
-- employee@123        Employee@123        EMPLOYEE
-- employee2@123       Employee2@123       EMPLOYEE
-- manager@123         Manager@123         DEPARTMENT_MANAGER
-- seniormanager@123   Senior@123          SENIOR_MANAGER
-- head@123            Head@123            HEAD
-- procurement@123     Procurement@123     PROCUREMENT_OFFICER
-- equipment@123       Equipment@123       EQUIPMENT_ASSET_TEAM
-- software@123        Software@123        IT_SOFTWARE_TEAM
-- facilities@123      Facilities@123      FACILITIES_TEAM
-- warehouse@123       Warehouse@123       WAREHOUSE_MANAGER
-- finance@123         Finance@123         FINANCE_MANAGER
-- auditor@123         Auditor@123         AUDITOR
-- vendor@123          Vendor@123          VENDOR
-- =====================================================================
