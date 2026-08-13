package com.procurement.config;

import com.procurement.approvalrule.entity.ApprovalRule;
import com.procurement.approvalrule.repository.ApprovalRuleRepository;
import com.procurement.category.entity.Category;
import com.procurement.category.repository.CategoryRepository;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.permission.entity.Permission;
import com.procurement.permission.repository.PermissionRepository;
import com.procurement.product.entity.Product;
import com.procurement.product.repository.ProductRepository;
import com.procurement.role.entity.Role;
import com.procurement.role.entity.RolePermission;
import com.procurement.role.repository.RolePermissionRepository;
import com.procurement.role.repository.RoleRepository;
import com.procurement.uom.entity.UnitOfMeasure;
import com.procurement.uom.repository.UnitOfMeasureRepository;
import com.procurement.vendor.entity.Vendor;
import com.procurement.vendor.repository.VendorRepository;
import com.procurement.warehouse.entity.Warehouse;
import com.procurement.warehouse.entity.WarehouseType;
import com.procurement.warehouse.repository.WarehouseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Seeds a small, realistic set of master data for the Admin Panel (development).
 * Every record is a real database row: permissions, role-permission mappings,
 * categories, units of measure, vendors, products, warehouses and approval rules.
 * Idempotent: existing records (by unique code) are left untouched.
 */
@Configuration
public class AdminSeedDataInitializer {

    private static final Logger log = LoggerFactory.getLogger(AdminSeedDataInitializer.class);

    @Bean
    @Order(2)
    @Transactional
    public CommandLineRunner adminMasterDataSeeder(
            PermissionRepository permissionRepository,
            RolePermissionRepository rolePermissionRepository,
            RoleRepository roleRepository,
            CategoryRepository categoryRepository,
            UnitOfMeasureRepository unitOfMeasureRepository,
            VendorRepository vendorRepository,
            ProductRepository productRepository,
            WarehouseRepository warehouseRepository,
            ApprovalRuleRepository approvalRuleRepository,
            DepartmentRepository departmentRepository) {
        return args -> {

            // ============ 1. PERMISSIONS ============
            seedPermissions(permissionRepository);

            // ============ 2. ROLE → PERMISSION MAPPINGS ============
            // Only SUPER_ADMIN and ADMIN carry the complete permission set.
            // Every other role receives exactly the permissions required for its
            // responsibilities — and anything previously granted beyond that is
            // revoked, so a fresh clone or an upgraded database stays least-privilege.
            List<Permission> allPermissions = permissionRepository.findAll();
            assignAllPermissions(roleRepository, rolePermissionRepository, "SUPER_ADMIN", allPermissions);
            assignAllPermissions(roleRepository, rolePermissionRepository, "ADMIN", allPermissions);

            assignRolePermissions(roleRepository, rolePermissionRepository, permissionRepository,
                    List.of("HR_MANAGER"),
                    "CAN_VIEW_USERS", "CAN_CREATE_USER", "CAN_UPDATE_USER", "CAN_DEACTIVATE_USER",
                    "CAN_RESET_PASSWORD", "CAN_ASSIGN_ROLE", "CAN_VIEW_EMPLOYEES", "CAN_MANAGE_EMPLOYEES",
                    "CAN_VIEW_ROLES", "CAN_VIEW_DEPARTMENTS", "CAN_MANAGE_DEPARTMENTS",
                    "CAN_VIEW_COST_CENTERS", "CAN_MANAGE_COST_CENTERS", "CAN_VIEW_NOTIFICATIONS");

            assignRolePermissions(roleRepository, rolePermissionRepository, permissionRepository,
                    List.of("PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER"),
                    "CAN_VIEW_VENDORS", "CAN_MANAGE_VENDORS", "CAN_VERIFY_KYC",
                    "CAN_VIEW_CATEGORIES", "CAN_MANAGE_CATEGORIES",
                    "CAN_VIEW_PRODUCTS", "CAN_MANAGE_PRODUCTS",
                    "CAN_VIEW_WAREHOUSES", "CAN_VIEW_BUDGETS", "CAN_VIEW_RULES",
                    "CAN_VIEW_REPORTS", "CAN_VIEW_NOTIFICATIONS");

            assignRolePermissions(roleRepository, rolePermissionRepository, permissionRepository,
                    List.of("FINANCE_MANAGER"),
                    "CAN_VIEW_BUDGETS", "CAN_MANAGE_BUDGETS", "CAN_VIEW_VENDORS",
                    "CAN_VIEW_REPORTS", "CAN_VIEW_NOTIFICATIONS");

            assignRolePermissions(roleRepository, rolePermissionRepository, permissionRepository,
                    List.of("WAREHOUSE_MANAGER"),
                    "CAN_VIEW_WAREHOUSES", "CAN_MANAGE_WAREHOUSES", "CAN_VIEW_PRODUCTS",
                    "CAN_VIEW_CATEGORIES", "CAN_VIEW_REPORTS", "CAN_VIEW_NOTIFICATIONS");

            assignRolePermissions(roleRepository, rolePermissionRepository, permissionRepository,
                    List.of("DEPARTMENT_MANAGER", "SENIOR_MANAGER", "HEAD"),
                    "CAN_VIEW_EMPLOYEES", "CAN_VIEW_DEPARTMENTS", "CAN_VIEW_COST_CENTERS",
                    "CAN_VIEW_PRODUCTS", "CAN_VIEW_CATEGORIES", "CAN_VIEW_BUDGETS",
                    "CAN_VIEW_RULES", "CAN_VIEW_REPORTS", "CAN_VIEW_NOTIFICATIONS");

            assignRolePermissions(roleRepository, rolePermissionRepository, permissionRepository,
                    List.of("EMPLOYEE"),
                    "CAN_VIEW_PRODUCTS", "CAN_VIEW_CATEGORIES", "CAN_VIEW_DEPARTMENTS",
                    "CAN_VIEW_COST_CENTERS", "CAN_VIEW_NOTIFICATIONS");

            assignRolePermissions(roleRepository, rolePermissionRepository, permissionRepository,
                    List.of("EQUIPMENT_ASSET_TEAM", "IT_SOFTWARE_TEAM", "FACILITIES_TEAM"),
                    "CAN_VIEW_PRODUCTS", "CAN_VIEW_CATEGORIES", "CAN_VIEW_VENDORS",
                    "CAN_VIEW_WAREHOUSES", "CAN_VIEW_NOTIFICATIONS");

            assignRolePermissions(roleRepository, rolePermissionRepository, permissionRepository,
                    List.of("AUDITOR"),
                    "CAN_VIEW_USERS", "CAN_VIEW_EMPLOYEES", "CAN_VIEW_VENDORS",
                    "CAN_VIEW_BUDGETS", "CAN_VIEW_REPORTS", "CAN_VIEW_AUDIT_LOGS",
                    "CAN_VIEW_NOTIFICATIONS");

            assignRolePermissions(roleRepository, rolePermissionRepository, permissionRepository,
                    List.of("VENDOR"),
                    "CAN_VIEW_VENDORS", "CAN_VIEW_PRODUCTS", "CAN_VIEW_CATEGORIES",
                    "CAN_VIEW_NOTIFICATIONS");

            // ============ 3. CATEGORIES ============
            Category hardware = createCategory(categoryRepository, "HW", "Hardware & IT Equipment",
                    "Laptops, desktops, networking and peripherals", null);
            Category software = createCategory(categoryRepository, "SW", "Software & Digital Services",
                    "Software licences, SaaS and digital subscriptions", null);
            Category facilities = createCategory(categoryRepository, "FAC", "Facilities & Infrastructure",
                    "Furniture, maintenance and facility services", null);
            Category supplies = createCategory(categoryRepository, "SUP", "Office Supplies",
                    "Stationery and general office consumables", null);
            createCategory(categoryRepository, "HW-LAP", "Laptops & Desktops", "Portable and desktop computing", hardware);
            createCategory(categoryRepository, "HW-NET", "Networking Equipment", "Switches, routers and access points", hardware);
            createCategory(categoryRepository, "SW-SaaS", "SaaS Subscriptions", "Subscription software services", software);
            createCategory(categoryRepository, "SW-DEV", "Development Tools", "IDEs and developer utilities", software);
            createCategory(categoryRepository, "FAC-FUR", "Furniture", "Office furniture and seating", facilities);
            createCategory(categoryRepository, "SUP-PRN", "Print & Stationery", "Printing and stationery items", supplies);

            // ============ 4. UNITS OF MEASURE ============
            UnitOfMeasure pcs = createUom(unitOfMeasureRepository, "PCS", "Piece", "Individual unit");
            UnitOfMeasure set = createUom(unitOfMeasureRepository, "SET", "Set", "Set of items");
            UnitOfMeasure license = createUom(unitOfMeasureRepository, "LIC", "License", "Software license");
            createUom(unitOfMeasureRepository, "MONTH", "Month", "Monthly subscription period");
            createUom(unitOfMeasureRepository, "SVC", "Service", "Service engagement");
            UnitOfMeasure box = createUom(unitOfMeasureRepository, "BOX", "Box", "Box of items");

            // ============ 5. VENDORS ============
            Vendor techNova = createVendor(vendorRepository, "VND001", "TechNova Solutions Pvt Ltd",
                    "Ramesh Iyer", "ramesh.iyer@technova.in", "022-40001234", "27AABCT1332L1Z5",
                    "AABCT1332L", "TECHNOVA-2021", "Equipment & IT Supplies", "Net 30",
                    "INR", "HDFC Bank", "50100234567890", "HDFC0001234",
                    "5th Floor, Technopark", "Andheri East", "Mumbai", "Maharashtra", "400069", "ACTIVE", true);
            Vendor rajeshEnterprises = createVendor(vendorRepository, "VND002", "Rajesh Enterprises",
                    "Rajesh Kumar", "rajesh@rajeshenterprises.in", "011-45678901", "07AAPCR1234K1Z2",
                    "AAPCR1234K", "RE-ENTERPRISES-2022", "Office Supplies & Furniture", "Net 45",
                    "INR", "State Bank of India", "30211234567", "SBIN0004321",
                    "12, Karol Bagh Market", "Karol Bagh", "New Delhi", "Delhi", "110005", "ACTIVE", true);
            Vendor cloudMinds = createVendor(vendorRepository, "VND003", "CloudMinds Digital Services",
                    "Ananya Rao", "contact@cloudminds.in", "080-67894567", "29AAGCM4321K1Z8",
                    "AAGCM4321K", "CM-DIGITAL-2023", "Software & Cloud Services", "Net 15",
                    "INR", "ICICI Bank", "60122334455", "ICIC0007788",
                    "Plot 42, Outer Ring Road", "Bellandur", "Bengaluru", "Karnataka", "560103", "ACTIVE", true);

            // ============ 6. WAREHOUSES ============
            Warehouse mainWarehouse = createWarehouse(warehouseRepository, "WH-MUM", "Mumbai Central Warehouse",
                    WarehouseType.CENTRAL, "Manish Yadav", "Manish Yadav", "manish.yadav@enterprise.com",
                    "9876543213", "MIDC Industrial Area", "Andheri East", "Mumbai", "Maharashtra", "400093",
                    new BigDecimal("100000"));
            createWarehouse(warehouseRepository, "WH-DEL", "Delhi Regional Warehouse",
                    WarehouseType.REGIONAL, "Suresh Gupta", "Suresh Gupta", "suresh.gupta@enterprise.com",
                    "9812345678", "Udyog Vihar Phase 1", "Gurugram", "Gurugram", "Haryana", "122016",
                    new BigDecimal("50000"));

            // ============ 7. PRODUCTS ============
            createProduct(productRepository, "PROD001", "LAP-DELL-XPS15", "Dell XPS 15 Laptop (32GB/1TB)",
                    "Enterprise laptop for engineering and development teams", "Dell", hardware, techNova, pcs,
                    new BigDecimal("185000.00"), "INR", 5, 50, 10, 7, new BigDecimal("18.00"), true);
            createProduct(productRepository, "PROD002", "OFCH-HERMAN", "Herman Miller Aeron Office Chair",
                    "Ergonomic office chair", "Herman Miller", facilities, rajeshEnterprises, pcs,
                    new BigDecimal("115000.00"), "INR", 2, 30, 5, 15, new BigDecimal("18.00"), true);
            createProduct(productRepository, "PROD003", "MS365-E3-YR", "Microsoft 365 E3 License (Annual)",
                    "Enterprise productivity suite license", "Microsoft", software, cloudMinds, license,
                    new BigDecimal("46500.00"), "INR", 10, 300, 20, 2, new BigDecimal("18.00"), true);
            createProduct(productRepository, "PROD004", "PRN-HP-LJ-M404", "HP LaserJet Pro M404dn Printer",
                    "Network laser printer for office use", "HP", hardware, techNova, pcs,
                    new BigDecimal("32000.00"), "INR", 2, 20, 4, 10, new BigDecimal("18.00"), true);
            createProduct(productRepository, "PROD005", "A4-PAPER-BOX", "A4 Copier Paper (Box of 5 reams)",
                    "Standard office paper", "JK Paper", supplies, rajeshEnterprises, box,
                    new BigDecimal("1600.00"), "INR", 20, 200, 30, 3, new BigDecimal("12.00"), true);

            // ============ 8. APPROVAL RULES ============
            Department procurementDept = departmentRepository.findByDepartmentCode("PROC")
                    .orElseGet(() -> departmentRepository.findAll().stream().findFirst().orElse(null));
            if (procurementDept != null) {
                createApprovalRule(approvalRuleRepository, "AR-PROC-001", "Procurement Standard Approval",
                        procurementDept, new BigDecimal("0.00"), new BigDecimal("50000.00"), true,
                        "Requests up to ₹50,000 approved by department manager");
                createApprovalRule(approvalRuleRepository, "AR-PROC-002", "Procurement Senior Approval",
                        procurementDept, new BigDecimal("50000.01"), new BigDecimal("200000.00"), true,
                        "Requests ₹50,001–₹2,00,000 require senior manager approval");
                createApprovalRule(approvalRuleRepository, "AR-PROC-003", "Procurement Head Approval",
                        procurementDept, new BigDecimal("200000.01"), null, true,
                        "Requests above ₹2,00,000 require head approval");
            }

            log.info("Admin master data seed complete: {} permissions, {} categories, {} vendors, {} products, {} warehouses, {} approval rules",
                    allPermissions.size(), categoryRepository.count(), vendorRepository.count(),
                    productRepository.count(), warehouseRepository.count(), approvalRuleRepository.count());
        };
    }

    // ===================== Helpers =====================

    private void seedPermissions(PermissionRepository repository) {
        List<Permission> permissions = List.of(
                perm("CAN_VIEW_USERS", "View Users", "Users"),
                perm("CAN_CREATE_USER", "Create User", "Users"),
                perm("CAN_UPDATE_USER", "Update User", "Users"),
                perm("CAN_DEACTIVATE_USER", "Deactivate User", "Users"),
                perm("CAN_RESET_PASSWORD", "Reset Password", "Users"),
                perm("CAN_ASSIGN_ROLE", "Assign Role", "Users"),
                perm("CAN_VIEW_EMPLOYEES", "View Employees", "Employees"),
                perm("CAN_MANAGE_EMPLOYEES", "Manage Employees", "Employees"),
                perm("CAN_VIEW_ROLES", "View Roles", "Roles"),
                perm("CAN_CREATE_ROLE", "Create Role", "Roles"),
                perm("CAN_UPDATE_ROLE", "Update Role", "Roles"),
                perm("CAN_MANAGE_PERMISSIONS", "Manage Permissions", "Roles"),
                perm("CAN_VIEW_DEPARTMENTS", "View Departments", "Departments"),
                perm("CAN_MANAGE_DEPARTMENTS", "Manage Departments", "Departments"),
                perm("CAN_VIEW_COST_CENTERS", "View Cost Centers", "Cost Centers"),
                perm("CAN_MANAGE_COST_CENTERS", "Manage Cost Centers", "Cost Centers"),
                perm("CAN_VIEW_VENDORS", "View Vendors", "Vendors"),
                perm("CAN_MANAGE_VENDORS", "Manage Vendors", "Vendors"),
                perm("CAN_VERIFY_KYC", "Verify Vendor KYC", "Vendors"),
                perm("CAN_VIEW_CATEGORIES", "View Categories", "Categories"),
                perm("CAN_MANAGE_CATEGORIES", "Manage Categories", "Categories"),
                perm("CAN_VIEW_PRODUCTS", "View Products", "Products"),
                perm("CAN_MANAGE_PRODUCTS", "Manage Products", "Products"),
                perm("CAN_VIEW_WAREHOUSES", "View Warehouses", "Warehouses"),
                perm("CAN_MANAGE_WAREHOUSES", "Manage Warehouses", "Warehouses"),
                perm("CAN_VIEW_BUDGETS", "View Budgets", "Budgets"),
                perm("CAN_MANAGE_BUDGETS", "Manage Budgets", "Budgets"),
                perm("CAN_CONFIGURE_RULES", "Configure Approval Rules", "Approval Rules"),
                perm("CAN_VIEW_RULES", "View Approval Rules", "Approval Rules"),
                perm("CAN_VIEW_REPORTS", "View Reports", "Reports"),
                perm("CAN_VIEW_AUDIT_LOGS", "View Audit Logs", "Audit"),
                perm("CAN_VIEW_NOTIFICATIONS", "View Notifications", "Notifications"),
                perm("CAN_MANAGE_SETTINGS", "Manage System Settings", "System")
        );
        permissions.forEach(p -> createPermission(repository, p));
    }

    private Permission perm(String code, String name, String module) {
        return Permission.builder().permissionCode(code).permissionName(name)
                .moduleName(module).description(name + " permission").active(true).build();
    }

    private void createPermission(PermissionRepository repository, Permission p) {
        if (repository.existsByPermissionCode(p.getPermissionCode())) {
            return;
        }
        repository.save(p);
    }

    private void assignAllPermissions(RoleRepository roleRepository,
                                      RolePermissionRepository rolePermissionRepository,
                                      String roleCode,
                                      List<Permission> permissions) {
        Optional<Role> roleOpt = roleRepository.findByRoleCode(roleCode);
        if (roleOpt.isEmpty()) {
            return;
        }
        Role role = roleOpt.get();
        for (Permission permission : permissions) {
            boolean exists = rolePermissionRepository.findWithPermissionsByRoleId(role.getId())
                    .stream().anyMatch(rp -> rp.getPermission().getId().equals(permission.getId()));
            if (!exists) {
                rolePermissionRepository.save(RolePermission.builder().role(role).permission(permission).build());
            }
        }
        log.info("Assigned {} permissions to role {}", permissions.size(), roleCode);
    }

    /**
     * Ensures a role carries the required permission codes.
     * <p>
     * The revoke step runs only when the role still carries the full permission set
     * (the state left by the older all-permissions bootstrap) — that cleanup happens
     * once, so least-privilege is restored on upgraded databases. After that, this
     * method only ever adds missing required permissions and never removes a mapping
     * an admin granted later through Role Management.
     */
    private void assignRolePermissions(RoleRepository roleRepository,
                                       RolePermissionRepository rolePermissionRepository,
                                       PermissionRepository permissionRepository,
                                       List<String> roleCodes,
                                       String... permissionCodes) {
        long totalPermissions = permissionRepository.count();
        List<String> required = List.of(permissionCodes);
        for (String roleCode : roleCodes) {
            Optional<Role> roleOpt = roleRepository.findByRoleCode(roleCode);
            if (roleOpt.isEmpty()) {
                continue;
            }
            Role role = roleOpt.get();
            List<RolePermission> existing = rolePermissionRepository.findWithPermissionsByRoleId(role.getId());
            // One-time cleanup: a role still holding the complete bootstrap grant is
            // reset to its required set. Admin-tuned mappings after that are preserved.
            if (existing.size() >= totalPermissions) {
                for (RolePermission rp : existing) {
                    if (!required.contains(rp.getPermission().getPermissionCode())) {
                        rolePermissionRepository.delete(rp);
                    }
                }
                existing = rolePermissionRepository.findWithPermissionsByRoleId(role.getId());
            }
            for (String code : required) {
                boolean exists = existing.stream()
                        .anyMatch(rp -> rp.getPermission().getPermissionCode().equals(code));
                if (exists) {
                    continue;
                }
                Optional<Permission> permissionOpt = permissionRepository.findByPermissionCode(code);
                if (permissionOpt.isPresent()) {
                    rolePermissionRepository.save(
                            RolePermission.builder().role(role).permission(permissionOpt.get()).build());
                }
            }
            log.info("Configured role {} with {} required permissions", roleCode, required.size());
        }
    }

    private Category createCategory(CategoryRepository repository, String code, String name,
                                    String description, Category parent) {
        if (repository.existsByCategoryCode(code)) {
            return repository.findByCategoryCode(code).orElseThrow();
        }
        Category category = new Category();
        category.setCategoryCode(code);
        category.setCategoryName(name);
        category.setDescription(description);
        category.setParentCategory(parent);
        category.setActive(true);
        return repository.save(category);
    }

    private UnitOfMeasure createUom(UnitOfMeasureRepository repository, String code, String name, String description) {
        if (repository.existsByUomCode(code)) {
            return repository.findByUomCode(code).orElseThrow();
        }
        UnitOfMeasure uom = new UnitOfMeasure();
        uom.setUomCode(code);
        uom.setUomName(name);
        uom.setDescription(description);
        uom.setActive(true);
        return repository.save(uom);
    }

    private Vendor createVendor(VendorRepository repository, String code, String name, String contact,
                                String email, String phone, String gst, String pan, String regNo,
                                String type, String paymentTerms, String currency, String bank,
                                String account, String ifsc, String address, String city, String state,
                                String country, String postal, String status, boolean approved) {
        if (repository.existsByVendorCode(code)) {
            return repository.findByVendorCode(code).orElseThrow();
        }
        Vendor vendor = new Vendor();
        vendor.setVendorCode(code);
        vendor.setVendorName(name);
        vendor.setContactPerson(contact);
        vendor.setEmail(email);
        vendor.setPhone(phone);
        vendor.setGstNumber(gst);
        vendor.setPanNumber(pan);
        vendor.setRegistrationNumber(regNo);
        vendor.setVendorType(type);
        vendor.setPaymentTerms(paymentTerms);
        vendor.setPaymentMethod("BANK_TRANSFER");
        vendor.setCreditLimit(new BigDecimal("5000000"));
        vendor.setCurrency(currency);
        vendor.setBankName(bank);
        vendor.setBankAccountNumber(account);
        vendor.setIfscCode(ifsc);
        vendor.setWebsite("https://" + code.toLowerCase() + ".example.in");
        vendor.setAddressLine1(address);
        vendor.setCity(city);
        vendor.setState(state);
        vendor.setCountry(country);
        vendor.setPostalCode(postal);
        vendor.setStatus(status);
        vendor.setRating(new BigDecimal("4.5"));
        vendor.setApproved(approved);
        vendor.setCreatedBy("seed");
        vendor.setUpdatedBy("seed");
        return repository.save(vendor);
    }

    private Warehouse createWarehouse(WarehouseRepository repository, String code, String name,
                                      WarehouseType type, String manager, String contact, String email,
                                      String phone, String address, String city, String state, String country,
                                      String postal, BigDecimal capacity) {
        if (repository.existsByWarehouseCode(code)) {
            return repository.findByWarehouseCode(code).orElseThrow();
        }
        Warehouse warehouse = new Warehouse();
        warehouse.setWarehouseCode(code);
        warehouse.setWarehouseName(name);
        warehouse.setWarehouseType(type);
        warehouse.setStatus("ACTIVE");
        warehouse.setManagerName(manager);
        warehouse.setContactPerson(contact);
        warehouse.setEmail(email);
        warehouse.setPhone(phone);
        warehouse.setAddressLine1(address);
        warehouse.setCity(city);
        warehouse.setState(state);
        warehouse.setCountry(country);
        warehouse.setPostalCode(postal);
        warehouse.setStorageCapacity(capacity);
        warehouse.setCreatedBy("seed");
        warehouse.setUpdatedBy("seed");
        return repository.save(warehouse);
    }

    private Product createProduct(ProductRepository repository, String code, String sku, String name,
                                  String description, String brand, Category category, Vendor vendor,
                                  UnitOfMeasure uom, BigDecimal price, String currency, int minStock,
                                  int maxStock, int reorder, int leadTime, BigDecimal tax, boolean active) {
        if (repository.existsByProductCode(code) || repository.existsBySku(sku)) {
            return repository.findByProductCode(code).orElse(null);
        }
        Product product = new Product();
        product.setProductCode(code);
        product.setSku(sku);
        product.setProductName(name);
        product.setDescription(description);
        product.setBrand(brand);
        product.setManufacturer(brand);
        product.setCategory(category);
        product.setVendor(vendor);
        product.setUnitOfMeasure(uom);
        product.setUnitPrice(price);
        product.setCurrency(currency);
        product.setMinimumStock(minStock);
        product.setMaximumStock(maxStock);
        product.setReorderLevel(reorder);
        product.setLeadTimeDays(leadTime);
        product.setTaxPercentage(tax);
        product.setActive(active);
        product.setCreatedBy("seed");
        product.setUpdatedBy("seed");
        return repository.save(product);
    }

    private void createApprovalRule(ApprovalRuleRepository repository, String code, String name,
                                    Department department, BigDecimal min, BigDecimal max,
                                    boolean active, String description) {
        if (repository.existsByRuleCode(code)) {
            return;
        }
        ApprovalRule rule = new ApprovalRule();
        rule.setRuleCode(code);
        rule.setRuleName(name);
        rule.setDepartment(department);
        rule.setMinimumAmount(min);
        rule.setMaximumAmount(max);
        rule.setActive(active);
        rule.setDescription(description);
        rule.setCreatedBy("seed");
        rule.setUpdatedBy("seed");
        repository.save(rule);
    }
}
