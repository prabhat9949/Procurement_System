package com.procurement.config;

import com.procurement.category.entity.Category;
import com.procurement.category.repository.CategoryRepository;
import com.procurement.costcenter.entity.CostCenter;
import com.procurement.costcenter.repository.CostCenterRepository;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.inventory.entity.Inventory;
import com.procurement.inventory.repository.InventoryRepository;
import com.procurement.product.entity.Product;
import com.procurement.product.repository.ProductRepository;
import com.procurement.purchaserequest.entity.ApprovalStatus;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.entity.PurchaseRequestPriority;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
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
import java.time.LocalDate;
import java.util.Optional;

/**
 * Seeds realistic demo MASTER DATA (UOMs, categories, vendors, products,
 * warehouses, inventory and a handful of purchase requests) so that every
 * dashboard shows real, editable database records on a fresh clone.
 *
 * Runs after {@link DataInitializerConfig} (roles/departments/employees/users).
 * Everything is idempotent: rows are only inserted when their unique code is
 * missing, so it is safe to run on every startup.
 */
@Configuration
@Order(2)
public class DemoDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    @Bean
    @org.springframework.core.annotation.Order(2)
    @Transactional
    public CommandLineRunner seedDemoData(
            UnitOfMeasureRepository uomRepository,
            CategoryRepository categoryRepository,
            VendorRepository vendorRepository,
            ProductRepository productRepository,
            WarehouseRepository warehouseRepository,
            InventoryRepository inventoryRepository,
            PurchaseRequestRepository purchaseRequestRepository,
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            CostCenterRepository costCenterRepository
    ) {
        return args -> {
            if (productRepository.count() > 0 && vendorRepository.count() > 0) {
                log.info("Demo master data already present, skipping.");
                return;
            }

            // ============ UOMs ============
            UnitOfMeasure pcs = uom("PCS", "Pieces", "Individual units", uomRepository);
            UnitOfMeasure box = uom("BOX", "Box", "Carton / box quantity", uomRepository);
            UnitOfMeasure kg = uom("KG", "Kilogram", "Weight in kilograms", uomRepository);
            UnitOfMeasure ltr = uom("LTR", "Litre", "Volume in litres", uomRepository);
            UnitOfMeasure set = uom("SET", "Set", "Complete set of items", uomRepository);
            UnitOfMeasure unit = uom("UNIT", "Unit", "Single service or licence unit", uomRepository);
            UnitOfMeasure month = uom("MONTH", "Month", "Monthly service subscription", uomRepository);
            UnitOfMeasure year = uom("YEAR", "Year", "Annual service subscription", uomRepository);

            // ============ Categories ============
            Category itHardware = category("CAT-IT-HW", "IT Hardware", "Laptops, desktops, printers and networking gear", null, categoryRepository);
            Category itSoftware = category("CAT-IT-SW", "IT Software & Licences", "Software licences and digital services", null, categoryRepository);
            Category office = category("CAT-OFF", "Office Supplies", "Stationery and day-to-day office consumables", null, categoryRepository);
            Category furniture = category("CAT-FUR", "Furniture", "Office furniture and fixtures", null, categoryRepository);
            Category facilities = category("CAT-FAC", "Facilities & Services", "AMC, maintenance and facility services", null, categoryRepository);
            category("CAT-NET", "Networking", "Routers, switches, cabling and wireless", itHardware, categoryRepository);

            // ============ Vendors (Indian, GST-registered, KYC-approved) ============
            Vendor delhiTech = vendor("VEN-2026-001", "Delhi Tech Solutions Pvt Ltd", "Rohit Malhotra",
                    "sales@delhitech.in", "011-45678901", "07AABCT1234F1Z5", "AABCT1234F",
                    "Electronics & IT", "Net 30", "HDFC Bank", "50100234567890", "HDFC0001234",
                    "27, Nehru Place", "New Delhi", "Delhi", "110019", new BigDecimal("2500000"),
                    vendorRepository);
            Vendor mumbaiSupply = vendor("VEN-2026-002", "Mumbai Office Supplies Co", "Priya Deshmukh",
                    "orders@mumbaioffice.in", "022-26854321", "27AAMOS1234P1Z2", "AAMOS1234P",
                    "Office Supplies", "Net 15", "ICICI Bank", "00234567123456", "ICIC0004567",
                    "45, Nariman Point", "Mumbai", "Maharashtra", "400021", new BigDecimal("1000000"),
                    vendorRepository);
            Vendor bengaluruSoft = vendor("VEN-2026-003", "Bengaluru Software Distributors", "Ananya Iyer",
                    "licences@blrsoft.in", "080-41234567", "29AABSD5678K1Z9", "AABSD5678K",
                    "Software Licences", "Net 45", "Axis Bank", "9110200456789012", "UTIB0007890",
                    "12, Electronic City Phase 1", "Bengaluru", "Karnataka", "560100", new BigDecimal("3000000"),
                    vendorRepository);
            Vendor chennaiFurn = vendor("VEN-2026-004", "Chennai Furniture Works", "Karthik Subramanian",
                    "sales@chennaifurn.in", "044-27654321", "33AACFW9012P1Z5", "AACFW9012P",
                    "Furniture", "Net 30", "SBI", "30123456789012", "SBIN0001234",
                    "8, Anna Salai", "Chennai", "Tamil Nadu", "600002", new BigDecimal("1800000"),
                    vendorRepository);
            Vendor puneServ = vendor("VEN-2026-005", "Pune Facility Services Ltd", "Sneha Kulkarni",
                    "amc@punefacility.in", "020-23456789", "27AAPFS3456L1Z1", "AAPFS3456L",
                    "Facility Services", "Net 60", "Kotak Mahindra", "3456789012345678", "KKBK0000987",
                    "56, Baner Road", "Pune", "Maharashtra", "411045", new BigDecimal("1500000"),
                    vendorRepository);

            // ============ Products ============
            product("PRD-LAP-001", "SKU-LAP-MBP14", "Apple MacBook Pro 14\" M3 (16GB/512GB)",
                    "High-performance laptop for engineering teams", "Apple", "Apple Inc.",
                    itHardware, delhiTech, pcs, new BigDecimal("159900"), 5, 50, 10, 3, new BigDecimal("18"),
                    productRepository);
            product("PRD-DSK-001", "SKU-DSK-DELL", "Dell OptiPlex 7010 Desktop (i7/16GB/512GB)",
                    "Standard business desktop workstation", "Dell", "Dell Technologies",
                    itHardware, delhiTech, pcs, new BigDecimal("65900"), 10, 80, 15, 7, new BigDecimal("18"),
                    productRepository);
            product("PRD-PRN-001", "SKU-PRN-HP", "HP LaserJet Pro M404dn Printer",
                    "Monochrome laser printer for shared office use", "HP", "HP Inc.",
                    itHardware, delhiTech, pcs, new BigDecimal("24500"), 4, 30, 6, 5, new BigDecimal("18"),
                    productRepository);
            product("PRD-M365", "SKU-SW-M365", "Microsoft 365 Business Standard (per user / year)",
                    "Annual Microsoft 365 subscription licence", "Microsoft", "Microsoft Corporation",
                    itSoftware, bengaluruSoft, year, new BigDecimal("18500"), 10, 200, 25, 1, new BigDecimal("18"),
                    productRepository);
            product("PRD-ADOBE", "SKU-SW-ADOBE", "Adobe Creative Cloud — All Apps (per user / year)",
                    "Annual creative software subscription", "Adobe", "Adobe Inc.",
                    itSoftware, bengaluruSoft, year, new BigDecimal("38900"), 5, 50, 8, 2, new BigDecimal("18"),
                    productRepository);
            product("PRD-APER-1", "SKU-OFF-APER", "A4 Premium Copier Paper (500 sheets, pack of 5)",
                    "Standard A4 paper for printers and copiers", "JK Copier", "JK Paper Ltd",
                    office, mumbaiSupply, box, new BigDecimal("1450"), 20, 300, 40, 3, new BigDecimal("5"),
                    productRepository);
            product("PRD-PEN-01", "SKU-OFF-PEN", "Gel Pen Blue (box of 50)",
                    "Office gel pens, blue ink", "Reynolds", "Reynolds India",
                    office, mumbaiSupply, box, new BigDecimal("750"), 20, 200, 30, 2, new BigDecimal("5"),
                    productRepository);
            product("PRD-DESK-1", "SKU-FUR-DESK", "Ergonomic Executive Desk (W 160 cm)",
                    "Executive desk with cable management", "Godrej Interio", "Godrej Interio",
                    furniture, chennaiFurn, pcs, new BigDecimal("28000"), 5, 40, 8, 15, new BigDecimal("18"),
                    productRepository);
            product("PRD-CHAIR", "SKU-FUR-CHR", "Ergonomic Office Chair (High Back)",
                    "High-back mesh ergonomic chair", "Featherlite", "Featherlite India",
                    furniture, chennaiFurn, pcs, new BigDecimal("12500"), 10, 60, 12, 10, new BigDecimal("18"),
                    productRepository);
            product("PRD-AC-AMC", "SKU-FAC-AMC", "HVAC / AC Annual Maintenance Contract",
                    "Preventive and breakdown AMC for split AC units", "Voltas", "Voltas Ltd",
                    facilities, puneServ, year, new BigDecimal("12000"), 5, 100, 10, 5, new BigDecimal("18"),
                    productRepository);
            product("PRD-CLEAN", "SKU-FAC-CLN", "Office Deep Cleaning Service (per month)",
                    "Monthly professional office cleaning contract", "CleanKare", "CleanKare Services",
                    facilities, puneServ, month, new BigDecimal("18500"), 1, 24, 3, 7, new BigDecimal("18"),
                    productRepository);

            // ============ Warehouses ============
            Warehouse mumbaiCentral = warehouse("WH-MUM-01", "Mumbai Central Warehouse",
                    "Central distribution warehouse for western region", WarehouseType.CENTRAL,
                    "Manish Yadav", "Ramesh Pawar", "warehouse.mumbai@enterprise.com", "022-24051234",
                    "Plot 14, MIDC Andheri East", "Mumbai", "Maharashtra", "400093",
                    new BigDecimal("10000"), warehouseRepository);
            Warehouse bengaluruRegional = warehouse("WH-BLR-01", "Bengaluru Regional Warehouse",
                    "Regional warehouse serving southern states", WarehouseType.REGIONAL,
                    "Manish Yadav", "Lakshmi Narayan", "warehouse.blr@enterprise.com", "080-28561234",
                    "Industrial Area, Whitefield", "Bengaluru", "Karnataka", "560066",
                    new BigDecimal("8000"), warehouseRepository);

            // ============ Inventory (a few low-stock to surface alerts) ============
            inventory(mumbaiCentral, "PRD-LAP-001", 24, 3, 1, 5, 50, 10, new BigDecimal("149000"), inventoryRepository, productRepository);
            inventory(mumbaiCentral, "PRD-DSK-001", 45, 2, 0, 10, 80, 15, new BigDecimal("62000"), inventoryRepository, productRepository);
            inventory(mumbaiCentral, "PRD-PRN-001", 7, 1, 0, 4, 30, 6, new BigDecimal("23000"), inventoryRepository, productRepository);
            inventory(mumbaiCentral, "PRD-APER-1", 120, 10, 2, 20, 300, 40, new BigDecimal("1350"), inventoryRepository, productRepository);
            inventory(mumbaiCentral, "PRD-CHAIR", 4, 0, 0, 10, 60, 12, new BigDecimal("11800"), inventoryRepository, productRepository);
            inventory(bengaluruRegional, "PRD-LAP-001", 9, 2, 0, 5, 50, 10, new BigDecimal("149000"), inventoryRepository, productRepository);
            inventory(bengaluruRegional, "PRD-M365", 40, 5, 0, 10, 200, 25, new BigDecimal("17500"), inventoryRepository, productRepository);
            inventory(bengaluruRegional, "PRD-DESK-1", 2, 0, 0, 5, 40, 8, new BigDecimal("26500"), inventoryRepository, productRepository);

            log.info("Transaction sample seeding disabled; PR/RFQ/PO records are created only by user workflow actions.");

            log.info("Demo master data seeded: {} UOMs, {} categories, {} vendors, {} products, {} warehouses, {} inventory rows.",
                    uomRepository.count(), categoryRepository.count(), vendorRepository.count(),
                    productRepository.count(), warehouseRepository.count(), inventoryRepository.count());
        };
    }

    // ===== Idempotent helpers =====

    private UnitOfMeasure uom(String code, String name, String description, UnitOfMeasureRepository repo) {
        Optional<UnitOfMeasure> existing = repo.findByUomCode(code);
        if (existing.isPresent()) return existing.get();
        return repo.save(UnitOfMeasure.builder()
                .uomCode(code).uomName(name).description(description).active(true).build());
    }

    private Category category(String code, String name, String description, Category parent, CategoryRepository repo) {
        Optional<Category> existing = repo.findByCategoryCode(code);
        if (existing.isPresent()) return existing.get();
        return repo.save(Category.builder()
                .categoryCode(code).categoryName(name).description(description)
                .parentCategory(parent).active(true).build());
    }

    private Vendor vendor(String code, String name, String contact, String email, String phone,
                          String gst, String pan, String type, String terms, String bank,
                          String account, String ifsc, String addr, String city, String state,
                          String pincode, BigDecimal creditLimit, VendorRepository repo) {
        Optional<Vendor> existing = repo.findByVendorCode(code);
        if (existing.isPresent()) return existing.get();
        return repo.save(Vendor.builder()
                .vendorCode(code).vendorName(name).contactPerson(contact).email(email).phone(phone)
                .gstNumber(gst).panNumber(pan).vendorType(type).paymentTerms(terms)
                .paymentMethod("BANK_TRANSFER").creditLimit(creditLimit).currency("INR")
                .bankName(bank).bankAccountNumber(account).ifscCode(ifsc)
                .addressLine1(addr).city(city).state(state).country("India").postalCode(pincode)
                .status("ACTIVE").approved(true).rating(new BigDecimal("4.50"))
                .createdBy("system").updatedBy("system").build());
    }

    private void product(String code, String sku, String name, String description, String brand,
                         String manufacturer, Category category, Vendor vendor, UnitOfMeasure uom,
                         BigDecimal price, Integer minStock, Integer maxStock, Integer reorder,
                         Integer leadTime, BigDecimal tax, ProductRepository repo) {
        Optional<Product> existing = repo.findByProductCode(code);
        if (existing.isPresent()) return;
        repo.save(Product.builder()
                .productCode(code).sku(sku).productName(name).description(description)
                .brand(brand).manufacturer(manufacturer).category(category).vendor(vendor)
                .unitOfMeasure(uom).unitPrice(price).currency("INR")
                .minimumStock(minStock).maximumStock(maxStock).reorderLevel(reorder)
                .leadTimeDays(leadTime).taxPercentage(tax).active(true)
                .createdBy("system").updatedBy("system").build());
    }

    private Warehouse warehouse(String code, String name, String description, WarehouseType type,
                                String manager, String contact, String email, String phone,
                                String addr, String city, String state, String pincode,
                                BigDecimal capacity, WarehouseRepository repo) {
        Optional<Warehouse> existing = repo.findByWarehouseCode(code);
        if (existing.isPresent()) return existing.get();
        return repo.save(Warehouse.builder()
                .warehouseCode(code).warehouseName(name).description(description).warehouseType(type)
                .status("ACTIVE").managerName(manager).contactPerson(contact).email(email).phone(phone)
                .addressLine1(addr).city(city).state(state).country("India").postalCode(pincode)
                .storageCapacity(capacity).createdBy("system").updatedBy("system").build());
    }

    private void inventory(Warehouse warehouse, String productCode, Integer available,
                           Integer reserved, Integer damaged, Integer minStock,
                           Integer maxStock, Integer reorder, BigDecimal avgCost,
                           InventoryRepository inventoryRepo, ProductRepository productRepo) {
        Product product = productRepo.findByProductCode(productCode).orElse(null);
        if (product == null) return;
        if (inventoryRepo.existsByProductIdAndWarehouseId(product.getId(), warehouse.getId())) return;
        BigDecimal availableQty = BigDecimal.valueOf(available);
        BigDecimal value = availableQty.multiply(avgCost);
        inventoryRepo.save(Inventory.builder()
                .product(product).warehouse(warehouse)
                .availableQuantity(availableQty)
                .reservedQuantity(BigDecimal.valueOf(reserved))
                .damagedQuantity(BigDecimal.valueOf(damaged))
                .minimumStock(BigDecimal.valueOf(minStock))
                .maximumStock(BigDecimal.valueOf(maxStock))
                .reorderLevel(BigDecimal.valueOf(reorder))
                .averageUnitCost(avgCost).inventoryValue(value).status("ACTIVE")
                .createdBy("system").updatedBy("system").build());
    }

    private void pr(String requestNumber, LocalDate requestDate, LocalDate requiredDate,
                    Employee requester, Department department, CostCenter costCenter,
                    PurchaseRequestPriority priority, PurchaseRequestStatus status,
                    ApprovalStatus approvalStatus, String purpose, String remarks,
                    BigDecimal estimatedAmount, String createdBy, PurchaseRequestRepository repo) {
        Optional<PurchaseRequest> existing = repo.findByRequestNumber(requestNumber);
        if (existing.isPresent()) return;
        repo.save(PurchaseRequest.builder()
                .requestNumber(requestNumber).requestDate(requestDate).requiredDate(requiredDate)
                .requester(requester).department(department).costCenter(costCenter)
                .priority(priority).status(status).approvalStatus(approvalStatus)
                .purpose(purpose).remarks(remarks).estimatedAmount(estimatedAmount)
                .createdBy(createdBy).updatedBy(createdBy).build());
    }
}
