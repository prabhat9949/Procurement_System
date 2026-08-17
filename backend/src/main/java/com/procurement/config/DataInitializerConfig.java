package com.procurement.config;

import com.procurement.role.entity.Role;
import com.procurement.role.repository.RoleRepository;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.costcenter.entity.CostCenter;
import com.procurement.costcenter.repository.CostCenterRepository;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Configuration
public class DataInitializerConfig {

    private static final Logger log =
            LoggerFactory.getLogger(DataInitializerConfig.class);

    // ===== Role Codes =====
    private static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_PROCUREMENT_MANAGER = "PROCUREMENT_MANAGER";
    private static final String ROLE_PROCUREMENT_OFFICER = "PROCUREMENT_OFFICER";
    private static final String ROLE_FINANCE_MANAGER = "FINANCE_MANAGER";
    private static final String ROLE_WAREHOUSE_MANAGER = "WAREHOUSE_MANAGER";
    private static final String ROLE_HR_MANAGER = "HR_MANAGER";
    private static final String ROLE_DEPARTMENT_MANAGER = "DEPARTMENT_MANAGER";
    private static final String ROLE_EMPLOYEE = "EMPLOYEE";
    private static final String ROLE_VENDOR = "VENDOR";
    private static final String ROLE_SENIOR_MANAGER = "SENIOR_MANAGER";
    private static final String ROLE_HEAD = "HEAD";
    private static final String ROLE_EQUIPMENT_ASSET_TEAM = "EQUIPMENT_ASSET_TEAM";
    private static final String ROLE_IT_SOFTWARE_TEAM = "IT_SOFTWARE_TEAM";
    private static final String ROLE_FACILITIES_TEAM = "FACILITIES_TEAM";
    private static final String ROLE_AUDITOR = "AUDITOR";
    private static final String ROLE_SUPPORT_TEAM = "SUPPORT_TEAM";

    // ===== Development Login Matrix (simple role-based usernames) =====
    private static final String DEFAULT_ADMIN_USERNAME = "admin@123";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@123";
    private static final String DEFAULT_ADMIN_EMAIL = "amit.sharma@enterprise.com";

    private static final String USER_HR = "hr@123";
    private static final String USER_EMPLOYEE = "employee@123";
    private static final String USER_EMPLOYEE2 = "employee2@123";
    private static final String USER_EMPLOYEE3 = "employee3@123";
    private static final String USER_EMPLOYEE4 = "employee4@123";
    private static final String USER_MANAGER = "manager@123";
    private static final String USER_MANAGER2 = "manager2@123";
    private static final String USER_MANAGER3 = "manager3@123";
    private static final String USER_SENIOR_MANAGER = "seniormanager@123";
    private static final String USER_SENIOR_MANAGER2 = "seniormanager2@123";
    private static final String USER_HEAD = "head@123";
    private static final String USER_PROCUREMENT = "procurement@123";
    private static final String USER_PROCUREMENT2 = "procurement2@123";
    private static final String USER_PROCUREMENT3 = "procurement3@123";
    private static final String USER_EQUIPMENT = "equipment@123";
    private static final String USER_EQUIPMENT2 = "equipment2@123";
    private static final String USER_SOFTWARE = "software@123";
    private static final String USER_SOFTWARE2 = "software2@123";
    private static final String USER_FACILITIES = "facilities@123";
    private static final String USER_FACILITIES2 = "facilities2@123";
    private static final String USER_WAREHOUSE = "warehouse@123";
    private static final String USER_WAREHOUSE2 = "warehouse2@123";
    private static final String USER_FINANCE = "finance@123";
    private static final String USER_FINANCE2 = "finance2@123";
    private static final String USER_AUDITOR = "auditor@123";
    private static final String USER_SUPPORT = "support@123";
    private static final String USER_VENDOR = "vendor@123";

    private static final String PASSWORD_HR = "Hr@123";
    private static final String PASSWORD_EMPLOYEE = "Employee@123";
    private static final String PASSWORD_EMPLOYEE2 = "Employee2@123";
    private static final String PASSWORD_EMPLOYEE3 = "Employee3@123";
    private static final String PASSWORD_EMPLOYEE4 = "Employee4@123";
    private static final String PASSWORD_MANAGER = "Manager@123";
    private static final String PASSWORD_MANAGER2 = "Manager2@123";
    private static final String PASSWORD_MANAGER3 = "Manager3@123";
    private static final String PASSWORD_SENIOR_MANAGER = "SeniorManager@123";
    private static final String PASSWORD_SENIOR_MANAGER2 = "SeniorManager2@123";
    private static final String PASSWORD_HEAD = "Head@123";
    private static final String PASSWORD_PROCUREMENT = "Procurement@123";
    private static final String PASSWORD_PROCUREMENT2 = "Procurement2@123";
    private static final String PASSWORD_PROCUREMENT3 = "Procurement3@123";
    private static final String PASSWORD_EQUIPMENT = "Equipment@123";
    private static final String PASSWORD_EQUIPMENT2 = "Equipment2@123";
    private static final String PASSWORD_SOFTWARE = "Software@123";
    private static final String PASSWORD_SOFTWARE2 = "Software2@123";
    private static final String PASSWORD_FACILITIES = "Facilities@123";
    private static final String PASSWORD_FACILITIES2 = "Facilities2@123";
    private static final String PASSWORD_WAREHOUSE = "Warehouse@123";
    private static final String PASSWORD_WAREHOUSE2 = "Warehouse2@123";
    private static final String PASSWORD_FINANCE = "Finance@123";
    private static final String PASSWORD_FINANCE2 = "Finance2@123";
    private static final String PASSWORD_AUDITOR = "Auditor@123";
    private static final String PASSWORD_SUPPORT = "Support@123";
    private static final String PASSWORD_VENDOR = "Vendor@123";

    // Legacy usernames that should be renamed to the new matrix (keeps existing employees).
    private static final String LEGACY_ADMIN = "admin";
    private static final String LEGACY_HR = "hr";
    private static final String LEGACY_EMPLOYEE = "employee";
    private static final String LEGACY_MANAGER = "manager";
    private static final String LEGACY_PROCUREMENT = "procurement";
    private static final String LEGACY_WAREHOUSE = "warehouse";
    private static final String LEGACY_FINANCE = "finance";
    private static final String LEGACY_VENDOR = "vendor";

    @Bean
    @org.springframework.core.annotation.Order(1)
    @Transactional
    public CommandLineRunner dataInitializer(
            RoleRepository roleRepository,
            DepartmentRepository departmentRepository,
            CostCenterRepository costCenterRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {

            // ==========================
            // 1. Seed Roles
            // ==========================
            Role superAdminRole = createRoleIfNotExists(
                    roleRepository, ROLE_SUPER_ADMIN, "Super Administrator",
                    "Root system administrator with full access");
            Role adminRole = createRoleIfNotExists(
                    roleRepository, ROLE_ADMIN, "Administrator",
                    "System administrator with full access");
            Role procurementManagerRole = createRoleIfNotExists(
                    roleRepository, ROLE_PROCUREMENT_MANAGER, "Procurement Manager",
                    "Approves and oversees procurement");
            Role procurementOfficerRole = createRoleIfNotExists(
                    roleRepository, ROLE_PROCUREMENT_OFFICER, "Procurement Officer",
                    "Handles day-to-day procurement operations");
            Role financeManagerRole = createRoleIfNotExists(
                    roleRepository, ROLE_FINANCE_MANAGER, "Finance Officer",
                    "Manages budgets, invoices, and payments");
            Role warehouseManagerRole = createRoleIfNotExists(
                    roleRepository, ROLE_WAREHOUSE_MANAGER, "Warehouse / Inventory",
                    "Manages inventory and warehouse operations");
            Role hrManagerRole = createRoleIfNotExists(
                    roleRepository, ROLE_HR_MANAGER, "HR Manager",
                    "Manages employee onboarding and access creation");
            Role departmentManagerRole = createRoleIfNotExists(
                    roleRepository, ROLE_DEPARTMENT_MANAGER, "Department Manager",
                    "First-level approval for department requests");
            Role employeeRole = createRoleIfNotExists(
                    roleRepository, ROLE_EMPLOYEE, "Employee",
                    "Regular employee who creates purchase requests");
            Role vendorRole = createRoleIfNotExists(
                    roleRepository, ROLE_VENDOR, "Vendor",
                    "External vendor portal role");
            Role seniorManagerRole = createRoleIfNotExists(
                    roleRepository, ROLE_SENIOR_MANAGER, "Senior Manager",
                    "Higher-level approval and department monitoring");
            Role headRole = createRoleIfNotExists(
                    roleRepository, ROLE_HEAD, "Head / Executive",
                    "High-value approvals and executive analytics");
            Role equipmentRole = createRoleIfNotExists(
                    roleRepository, ROLE_EQUIPMENT_ASSET_TEAM, "Equipment & Asset Team",
                    "Equipment and asset procurement and handover");
            Role softwareRole = createRoleIfNotExists(
                    roleRepository, ROLE_IT_SOFTWARE_TEAM, "IT Software & Digital Services Team",
                    "Software/license procurement and activation");
            Role facilitiesRole = createRoleIfNotExists(
                    roleRepository, ROLE_FACILITIES_TEAM, "Facilities Team",
                    "Facilities procurement and service fulfilment");
            Role auditorRole = createRoleIfNotExists(
                    roleRepository, ROLE_AUDITOR, "Auditor",
                    "Read-only audit and compliance review");
            Role supportTeamRole = createRoleIfNotExists(
                    roleRepository, ROLE_SUPPORT_TEAM, "Support Team",
                    "Handles support tickets, user issues, and system assistance");

            // ==========================
            // 2. Seed Departments
            // ==========================
            Department adminDept = createDepartmentIfNotExists(
                    departmentRepository, "ADM", "Administration",
                    "Corporate administration and platform governance");
            Department procurementDept = createDepartmentIfNotExists(
                    departmentRepository, "PROC", "Procurement",
                    "Strategic sourcing and procurement operations");
            Department financeDept = createDepartmentIfNotExists(
                    departmentRepository, "FIN", "Finance",
                    "Accounts payable, budgets, and financial controls");
            Department itDept = createDepartmentIfNotExists(
                    departmentRepository, "IT", "IT & Systems",
                    "Technology infrastructure and business applications");
            Department hrDept = createDepartmentIfNotExists(
                    departmentRepository, "HR", "Human Resources",
                    "Talent operations and employee lifecycle management");
            Department warehouseDept = createDepartmentIfNotExists(
                    departmentRepository, "WH", "Warehouse",
                    "Inventory, goods receipt, and stock movement operations");

            // ==========================
            // 3. Seed Cost Centers — every cost centre gets ₹10,00,000 (10 lakh).
            // ==========================
            CostCenter admCostCenter = createCostCenterIfNotExists(
                    costCenterRepository, "ADM-001", "Corporate Administration",
                    adminDept, new BigDecimal("1000000"));
            CostCenter procCostCenter = createCostCenterIfNotExists(
                    costCenterRepository, "PROC-001", "Strategic Procurement",
                    procurementDept, new BigDecimal("1000000"));
            CostCenter finCostCenter = createCostCenterIfNotExists(
                    costCenterRepository, "FIN-001", "Finance Operations",
                    financeDept, new BigDecimal("1000000"));
            CostCenter itCostCenter = createCostCenterIfNotExists(
                    costCenterRepository, "IT-001", "Infrastructure & Software",
                    itDept, new BigDecimal("1000000"));
            CostCenter hrCostCenter = createCostCenterIfNotExists(
                    costCenterRepository, "HR-001", "HR Operations",
                    hrDept, new BigDecimal("1000000"));
            CostCenter warehouseCostCenter = createCostCenterIfNotExists(
                    costCenterRepository, "WH-001", "Warehouse Operations",
                    warehouseDept, new BigDecimal("1000000"));

            // Sweep: force every existing cost centre in the live database to
            // the 10-lakh budget so the requirement holds on already-seeded data.
            BigDecimal TEN_LAKH = new BigDecimal("1000000");
            for (CostCenter cc : costCenterRepository.findAll()) {
                BigDecimal used = cc.getUsedBudget() == null ? BigDecimal.ZERO : cc.getUsedBudget();
                if (!TEN_LAKH.equals(cc.getBudget())) {
                    cc.setBudget(TEN_LAKH);
                }
                cc.setRemainingBudget(TEN_LAKH.subtract(used));
                costCenterRepository.save(cc);
            }
            log.info("All cost centres enforced to a ₹10,00,000 (10 lakh) budget.");

            // ==========================
            // 4. Seed Employees
            // ==========================

            // 4.1 Admin (system owner)
            Employee adminEmployee = createEmployeeIfNotExists(
                    employeeRepository, "EMP001", "Amit", "Sharma",
                    DEFAULT_ADMIN_EMAIL, "9876543210", adminDept, admCostCenter, superAdminRole);

            // 4.2 HR Manager
            Employee hrEmployee = createEmployeeIfNotExists(
                    employeeRepository, "EMP005", "Neha", "Singh",
                    "neha.singh@enterprise.com", "9876543214", hrDept, hrCostCenter, hrManagerRole);

            // 4.3 Department Manager
            Employee deptManager = createEmployeeIfNotExists(
                    employeeRepository, "EMP007", "Sandeep", "Kumar",
                    "sandeep.kumar@enterprise.com", "9876543216", itDept, itCostCenter, departmentManagerRole);

            // 4.4 Procurement Officer (matrix procurement@123)
            Employee procurementOfficer = createEmployeeIfNotExists(
                    employeeRepository, "EMP009", "Rohan", "Gupta",
                    "rohan.gupta@enterprise.com", "9876543218", procurementDept, procCostCenter, procurementManagerRole);

            // 4.5 Finance Officer
            Employee financeEmployee = createEmployeeIfNotExists(
                    employeeRepository, "EMP003", "Kavita", "Joshi",
                    "kavita.joshi@enterprise.com", "9876543212", financeDept, finCostCenter, financeManagerRole);

            // 4.6 Warehouse Manager
            Employee warehouseEmployee = createEmployeeIfNotExists(
                    employeeRepository, "EMP004", "Manish", "Yadav",
                    "manish.yadav@enterprise.com", "9876543213", warehouseDept, warehouseCostCenter, warehouseManagerRole);

            // 4.7 Employee
            Employee generalEmployee = createEmployeeIfNotExists(
                    employeeRepository, "EMP010", "Rahul", "Kumar",
                    "rahul.kumar@enterprise.com", "9876543219", itDept, itCostCenter, employeeRole);

            // 4.8 Vendor portal user
            Employee vendorEmployee = createEmployeeIfNotExists(
                    employeeRepository, "EMP008", "Rajesh", "Enterprises",
                    "vendor@enterprise.com", "9876543217", procurementDept, procCostCenter, vendorRole);

            // 4.9 Second Employee (for cross-department testing)
            Employee employee2 = createEmployeeIfNotExists(
                    employeeRepository, "EMP011", "Rohit", "Singh",
                    "rohit.singh@enterprise.com", "9876543221", financeDept, finCostCenter, employeeRole);

            // 4.10 Senior Manager
            Employee seniorManager = createEmployeeIfNotExists(
                    employeeRepository, "EMP012", "Amit", "Mehta",
                    "amit.mehta@enterprise.com", "9876543222", adminDept, admCostCenter, seniorManagerRole);

            // 4.11 Head / Executive
            Employee head = createEmployeeIfNotExists(
                    employeeRepository, "EMP013", "Vikram", "Kapoor",
                    "vikram.kapoor@enterprise.com", "9876543223", adminDept, admCostCenter, headRole);

            // 4.12 Equipment & Asset Team
            Employee equipment = createEmployeeIfNotExists(
                    employeeRepository, "EMP014", "Sanjay", "Patel",
                    "sanjay.patel@enterprise.com", "9876543224", procurementDept, procCostCenter, equipmentRole);

            // 4.13 IT Software Team
            Employee software = createEmployeeIfNotExists(
                    employeeRepository, "EMP015", "Ananya", "Iyer",
                    "ananya.iyer@enterprise.com", "9876543225", itDept, itCostCenter, softwareRole);

            // 4.14 Facilities Team
            Employee facilities = createEmployeeIfNotExists(
                    employeeRepository, "EMP016", "Pooja", "Nair",
                    "pooja.nair@enterprise.com", "9876543226", adminDept, admCostCenter, facilitiesRole);

            // 4.15 Auditor
            Employee auditor = createEmployeeIfNotExists(
                    employeeRepository, "EMP017", "Deepak", "Malhotra",
                    "deepak.malhotra@enterprise.com", "9876543227", adminDept, admCostCenter, auditorRole);

            // 4.15a Support Team
            Employee support = createEmployeeIfNotExists(
                    employeeRepository, "EMP030", "Ravi", "Kulkarni",
                    "ravi.kulkarni@enterprise.com", "9876543240", adminDept, admCostCenter, supportTeamRole);

            // 4.15b Additional employees for the multi-user demo matrix
            Employee employee3 = createEmployeeIfNotExists(
                    employeeRepository, "EMP018", "Rohan", "Singh",
                    "rohan.singh@enterprise.com", "9876543228", itDept, itCostCenter, employeeRole);
            Employee employee4 = createEmployeeIfNotExists(
                    employeeRepository, "EMP019", "Sneha", "Gupta",
                    "sneha.gupta@enterprise.com", "9876543229", hrDept, hrCostCenter, employeeRole);
            Employee manager2 = createEmployeeIfNotExists(
                    employeeRepository, "EMP020", "Rahul", "Mehta",
                    "rahul.mehta@enterprise.com", "9876543230", itDept, itCostCenter, departmentManagerRole);
            Employee manager3 = createEmployeeIfNotExists(
                    employeeRepository, "EMP021", "Kavita", "Sharma",
                    "kavita.sharma@enterprise.com", "9876543231", hrDept, hrCostCenter, departmentManagerRole);
            Employee seniorManager2 = createEmployeeIfNotExists(
                    employeeRepository, "EMP022", "Pooja", "Mehra",
                    "pooja.mehra@enterprise.com", "9876543232", adminDept, admCostCenter, seniorManagerRole);
            Employee procurement2 = createEmployeeIfNotExists(
                    employeeRepository, "EMP023", "Nitin", "Kapoor",
                    "nitin.kapoor@enterprise.com", "9876543233", procurementDept, procCostCenter, procurementOfficerRole);
            Employee procurement3 = createEmployeeIfNotExists(
                    employeeRepository, "EMP024", "Meera", "Joshi",
                    "meera.joshi@enterprise.com", "9876543234", procurementDept, procCostCenter, procurementOfficerRole);
            Employee equipment2 = createEmployeeIfNotExists(
                    employeeRepository, "EMP025", "Varun", "Bansal",
                    "varun.bansal@enterprise.com", "9876543235", procurementDept, procCostCenter, equipmentRole);
            Employee software2 = createEmployeeIfNotExists(
                    employeeRepository, "EMP026", "Nisha", "Kapoor",
                    "nisha.kapoor@enterprise.com", "9876543236", itDept, itCostCenter, softwareRole);
            Employee facilities2 = createEmployeeIfNotExists(
                    employeeRepository, "EMP027", "Ankit", "Gupta",
                    "ankit.gupta@enterprise.com", "9876543237", adminDept, admCostCenter, facilitiesRole);
            Employee warehouse2 = createEmployeeIfNotExists(
                    employeeRepository, "EMP028", "Rajesh", "Kumar",
                    "rajesh.kumar@enterprise.com", "9876543238", warehouseDept, warehouseCostCenter, warehouseManagerRole);
            Employee finance2 = createEmployeeIfNotExists(
                    employeeRepository, "EMP029", "Manish", "Agarwal",
                    "manish.agarwal@enterprise.com", "9876543239", financeDept, finCostCenter, financeManagerRole);

            // ==========================
            // 4.16 Seed Reporting Relationships (top-down org chart; only applied
            //     when the employee has no manager yet, so HR changes made through
            //     the panel are preserved across restarts)
            // ==========================
            assignManagerIfMissing(employeeRepository, seniorManager, head);          // Senior Manager reports to Head
            assignManagerIfMissing(employeeRepository, hrEmployee, head);             // HR Manager reports to Head
            assignManagerIfMissing(employeeRepository, auditor, head);                // Auditor reports to Head
            assignManagerIfMissing(employeeRepository, procurementOfficer, head);     // Procurement reports to Head
            assignManagerIfMissing(employeeRepository, deptManager, seniorManager);   // Department Manager reports to Senior Manager
            assignManagerIfMissing(employeeRepository, financeEmployee, seniorManager);   // Finance reports to Senior Manager
            assignManagerIfMissing(employeeRepository, warehouseEmployee, seniorManager); // Warehouse reports to Senior Manager
            assignManagerIfMissing(employeeRepository, generalEmployee, deptManager); // Employee reports to Department Manager
            assignManagerIfMissing(employeeRepository, employee2, deptManager);       // Employee 2 reports to Department Manager
            assignManagerIfMissing(employeeRepository, equipment, procurementOfficer);    // Equipment Team reports to Procurement
            assignManagerIfMissing(employeeRepository, software, procurementOfficer);     // Software Team reports to Procurement
            assignManagerIfMissing(employeeRepository, facilities, procurementOfficer);    // Facilities Team reports to Procurement
            // Additional employees / teams reporting structure
            assignManagerIfMissing(employeeRepository, employee3, deptManager);
            assignManagerIfMissing(employeeRepository, employee4, manager3);
            assignManagerIfMissing(employeeRepository, manager2, seniorManager);
            assignManagerIfMissing(employeeRepository, manager3, seniorManager);
            assignManagerIfMissing(employeeRepository, seniorManager2, head);
            assignManagerIfMissing(employeeRepository, procurement2, head);
            assignManagerIfMissing(employeeRepository, procurement3, head);
            assignManagerIfMissing(employeeRepository, equipment2, procurementOfficer);
            assignManagerIfMissing(employeeRepository, software2, procurementOfficer);
            assignManagerIfMissing(employeeRepository, facilities2, procurementOfficer);
            assignManagerIfMissing(employeeRepository, warehouse2, seniorManager);
            assignManagerIfMissing(employeeRepository, finance2, seniorManager);
            log.info("Reporting relationships seeded (manager assigned only when missing).");

            // ==========================
            // 5. Seed Users (development login matrix)
            // ==========================
            createAdminUserIfNotExists(userRepository, passwordEncoder, adminEmployee, superAdminRole);

            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_HR, PASSWORD_HR, LEGACY_HR, hrEmployee, hrManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_EMPLOYEE, PASSWORD_EMPLOYEE, LEGACY_EMPLOYEE, generalEmployee, employeeRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_EMPLOYEE2, PASSWORD_EMPLOYEE2, null, employee2, employeeRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_EMPLOYEE3, PASSWORD_EMPLOYEE3, null, employee3, employeeRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_EMPLOYEE4, PASSWORD_EMPLOYEE4, null, employee4, employeeRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_MANAGER, PASSWORD_MANAGER, LEGACY_MANAGER, deptManager, departmentManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_MANAGER2, PASSWORD_MANAGER2, null, manager2, departmentManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_MANAGER3, PASSWORD_MANAGER3, null, manager3, departmentManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_SENIOR_MANAGER, PASSWORD_SENIOR_MANAGER, null, seniorManager, seniorManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_SENIOR_MANAGER2, PASSWORD_SENIOR_MANAGER2, null, seniorManager2, seniorManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_HEAD, PASSWORD_HEAD, null, head, headRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_PROCUREMENT, PASSWORD_PROCUREMENT, LEGACY_PROCUREMENT, procurementOfficer, procurementManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_PROCUREMENT2, PASSWORD_PROCUREMENT2, null, procurement2, procurementOfficerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_PROCUREMENT3, PASSWORD_PROCUREMENT3, null, procurement3, procurementOfficerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_EQUIPMENT, PASSWORD_EQUIPMENT, null, equipment, equipmentRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_EQUIPMENT2, PASSWORD_EQUIPMENT2, null, equipment2, equipmentRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_SOFTWARE, PASSWORD_SOFTWARE, null, software, softwareRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_SOFTWARE2, PASSWORD_SOFTWARE2, null, software2, softwareRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_FACILITIES, PASSWORD_FACILITIES, null, facilities, facilitiesRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_FACILITIES2, PASSWORD_FACILITIES2, null, facilities2, facilitiesRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_WAREHOUSE, PASSWORD_WAREHOUSE, LEGACY_WAREHOUSE, warehouseEmployee, warehouseManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_WAREHOUSE2, PASSWORD_WAREHOUSE2, null, warehouse2, warehouseManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_FINANCE, PASSWORD_FINANCE, LEGACY_FINANCE, financeEmployee, financeManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_FINANCE2, PASSWORD_FINANCE2, null, finance2, financeManagerRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_AUDITOR, PASSWORD_AUDITOR, null, auditor, auditorRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_SUPPORT, PASSWORD_SUPPORT, null, support, supportTeamRole);
            createMatrixAccount(userRepository, employeeRepository, passwordEncoder,
                    USER_VENDOR, PASSWORD_VENDOR, LEGACY_VENDOR, vendorEmployee, vendorRole);

            // ==========================
            // 5.5 Final sweep: record plaintext for any remaining account whose hash
            //     matches a known default password (legacy accounts not renamed above).
            // ==========================
            userRepository.findAll().forEach(user -> {
                if (user.getPlainPassword() == null) {
                    backfillPlainPassword(userRepository, passwordEncoder, user, null);
                }
            });

            // ==========================
            // 6. Startup Log
            // ==========================
            log.info("====================================");
            log.info("Enterprise Procurement Initialized");
            log.info("Development Login Matrix:");
            logMatrix(log, "Admin", DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD);
            logMatrix(log, "HR", USER_HR, PASSWORD_HR);
            logMatrix(log, "Employee", USER_EMPLOYEE, PASSWORD_EMPLOYEE);
            logMatrix(log, "Employee 2", USER_EMPLOYEE2, PASSWORD_EMPLOYEE2);
            logMatrix(log, "Employee 3", USER_EMPLOYEE3, PASSWORD_EMPLOYEE3);
            logMatrix(log, "Employee 4", USER_EMPLOYEE4, PASSWORD_EMPLOYEE4);
            logMatrix(log, "Manager", USER_MANAGER, PASSWORD_MANAGER);
            logMatrix(log, "Manager 2", USER_MANAGER2, PASSWORD_MANAGER2);
            logMatrix(log, "Manager 3", USER_MANAGER3, PASSWORD_MANAGER3);
            logMatrix(log, "Senior Manager", USER_SENIOR_MANAGER, PASSWORD_SENIOR_MANAGER);
            logMatrix(log, "Senior Manager 2", USER_SENIOR_MANAGER2, PASSWORD_SENIOR_MANAGER2);
            logMatrix(log, "Head", USER_HEAD, PASSWORD_HEAD);
            logMatrix(log, "Procurement", USER_PROCUREMENT, PASSWORD_PROCUREMENT);
            logMatrix(log, "Procurement 2", USER_PROCUREMENT2, PASSWORD_PROCUREMENT2);
            logMatrix(log, "Procurement 3", USER_PROCUREMENT3, PASSWORD_PROCUREMENT3);
            logMatrix(log, "Equipment", USER_EQUIPMENT, PASSWORD_EQUIPMENT);
            logMatrix(log, "Equipment 2", USER_EQUIPMENT2, PASSWORD_EQUIPMENT2);
            logMatrix(log, "Software", USER_SOFTWARE, PASSWORD_SOFTWARE);
            logMatrix(log, "Software 2", USER_SOFTWARE2, PASSWORD_SOFTWARE2);
            logMatrix(log, "Facilities", USER_FACILITIES, PASSWORD_FACILITIES);
            logMatrix(log, "Facilities 2", USER_FACILITIES2, PASSWORD_FACILITIES2);
            logMatrix(log, "Warehouse", USER_WAREHOUSE, PASSWORD_WAREHOUSE);
            logMatrix(log, "Warehouse 2", USER_WAREHOUSE2, PASSWORD_WAREHOUSE2);
            logMatrix(log, "Finance", USER_FINANCE, PASSWORD_FINANCE);
            logMatrix(log, "Finance 2", USER_FINANCE2, PASSWORD_FINANCE2);
            logMatrix(log, "Auditor", USER_AUDITOR, PASSWORD_AUDITOR);
            logMatrix(log, "Support Team", USER_SUPPORT, PASSWORD_SUPPORT);
            logMatrix(log, "Vendor", USER_VENDOR, PASSWORD_VENDOR);
            log.info("====================================");
        };
    }

    // ===== Helper methods =====

    private void logMatrix(Logger log, String role, String username, String password) {
        log.info(" - {} : {} / {}", role, username, password);
    }

    /** Sets employee.manager = manager, but only when the employee has no manager yet. */
    private void assignManagerIfMissing(
            EmployeeRepository employeeRepository,
            Employee employee,
            Employee manager
    ) {
        if (employee == null || manager == null || employee.getId() == null) {
            return;
        }
        if (employee.getManager() == null && !employee.getId().equals(manager.getId())) {
            employee.setManager(manager);
            employeeRepository.save(employee);
        }
    }

    private Role createRoleIfNotExists(
            RoleRepository roleRepository,
            String roleCode,
            String roleName,
            String description
    ) {
        Optional<Role> existing = roleRepository.findByRoleCode(roleCode);
        if (existing.isPresent()) {
            return existing.get();
        }

        Role role = new Role();
        role.setRoleCode(roleCode);
        role.setRoleName(roleName);
        role.setDescription(description);
        role.setSystemRole(ROLE_SUPER_ADMIN.equals(roleCode) || ROLE_ADMIN.equals(roleCode));
        role.setActive(true);

        return roleRepository.save(role);
    }

    private Department createDepartmentIfNotExists(
            DepartmentRepository departmentRepository,
            String departmentCode,
            String departmentName,
            String description
    ) {
        Optional<Department> existing = departmentRepository.findByDepartmentCode(departmentCode);
        if (existing.isPresent()) {
            return existing.get();
        }

        Department dept = new Department();
        dept.setDepartmentCode(departmentCode);
        dept.setDepartmentName(departmentName);
        dept.setDescription(description);
        dept.setActive(true);

        return departmentRepository.save(dept);
    }

    private CostCenter createCostCenterIfNotExists(
            CostCenterRepository costCenterRepository,
            String costCenterCode,
            String costCenterName,
            Department department,
            BigDecimal budget
    ) {
        Optional<CostCenter> existing = costCenterRepository.findByCode(costCenterCode);
        if (existing.isPresent()) {
            return existing.get();
        }

        CostCenter cc = new CostCenter();
        cc.setCode(costCenterCode);
        cc.setName(costCenterName);
        cc.setDepartment(department);
        cc.setActive(true);

        cc.setBudget(budget);
        cc.setUsedBudget(BigDecimal.ZERO);
        cc.setRemainingBudget(budget);

        return costCenterRepository.save(cc);
    }

    private Employee createEmployeeIfNotExists(
            EmployeeRepository employeeRepository,
            String employeeCode,
            String firstName,
            String lastName,
            String email,
            String phone,
            Department department,
            CostCenter costCenter,
            Role role
    ) {
        Optional<Employee> existing = employeeRepository.findByEmployeeCode(employeeCode);
        if (existing.isPresent()) {
            return existing.get();
        }

        existing = employeeRepository.findByEmail(email);
        if (existing.isPresent()) {
            return existing.get();
        }

        Employee emp = new Employee();
        emp.setEmployeeCode(employeeCode);
        emp.setFirstName(firstName);
        emp.setLastName(lastName);
        emp.setEmail(email);
        emp.setPhone(phone);
        emp.setActive(true);

        emp.setDepartment(department);
        emp.setCostCenter(costCenter);
        emp.setRole(role);

        return employeeRepository.save(emp);
    }

    private void createAdminUserIfNotExists(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            Employee adminEmployee,
            Role adminRole
    ) {
        User user = userRepository.findByUsername(DEFAULT_ADMIN_USERNAME)
                .or(() -> userRepository.findByUsername(LEGACY_ADMIN))
                .or(() -> userRepository.findByEmployee(adminEmployee))
                .orElseGet(User::new);

        // Only (re)apply the default admin password when the account is brand new or
        // still on the seeded default. This preserves any password changed by an admin
        // through the dashboard or the change-password flow across restarts.
        boolean resetCredentials = user.getId() == null
                || (user.getPlainPassword() == null
                    && passwordEncoder.matches(DEFAULT_ADMIN_PASSWORD, user.getPassword()));

        user.setUsername(DEFAULT_ADMIN_USERNAME);
        if (resetCredentials) {
            user.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
            user.setPlainPassword(DEFAULT_ADMIN_PASSWORD);
        }
        user.setEnabled(true);
        user.setAccountLocked(false);
        user.setEmployee(adminEmployee);
        user.setRole(adminRole);

        userRepository.save(user);
        log.info("Admin account ready: {}", DEFAULT_ADMIN_USERNAME);
    }

    /**
     * Creates (or upgrades) one account from the development login matrix.
     * <p>
     * - If the new username already exists, its plaintext password is recorded when the
     *   hash matches the matrix default (admin-changed passwords are preserved).
     * - If a legacy username is supplied and exists, that account is renamed to the new
     *   username and its password/role are set to the matrix values.
     * - Otherwise a brand new employee + user is created.
     */
    private void createMatrixAccount(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            String username,
            String rawPassword,
            String legacyUsername,
            Employee employee,
            Role role
    ) {
        Optional<User> existing = userRepository.findByUsername(username);
        boolean renamedFromLegacy = false;
        if (existing.isEmpty() && legacyUsername != null) {
            existing = userRepository.findByUsername(legacyUsername);
            renamedFromLegacy = existing.isPresent();
        }
        if (existing.isEmpty() && employee != null) {
            existing = userRepository.findByEmployee(employee);
        }

        if (existing.isPresent()) {
            User user = existing.get();
            boolean renamed = !user.getUsername().equals(username);
            user.setUsername(username);
            user.setRole(role);
            if (employee != null) {
                employee.setRole(role);
                employeeRepository.save(employee);
            }
            if (renamed || user.getPlainPassword() == null) {
                // Renamed legacy account or account with no recorded plaintext: apply matrix default.
                user.setPassword(passwordEncoder.encode(rawPassword));
                user.setPlainPassword(rawPassword);
                log.info("Matrix account '{}' created/renamed{} (role: {})", username,
                        renamedFromLegacy ? " from legacy username '" + legacyUsername + "'" : "",
                        role.getRoleCode());
            } else if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                // Account already on the matrix default: just ensure plaintext is recorded.
                user.setPlainPassword(rawPassword);
                log.info("Matrix account '{}' confirmed (role: {})", username, role.getRoleCode());
            } else if (isRetiredDefault(user.getPlainPassword())) {
                // Account still on an older seeded default (e.g. Senior@123 before the
                // matrix contract was aligned) — upgrade to the current matrix password.
                user.setPassword(passwordEncoder.encode(rawPassword));
                user.setPlainPassword(rawPassword);
                log.info("Matrix account '{}' upgraded from retired default to the current contract (role: {})",
                        username, role.getRoleCode());
            } else {
                log.info("Matrix account '{}' exists with a custom password, left unchanged.", username);
            }
            user.setEnabled(true);
            user.setAccountLocked(false);
            if (user.getEmployee() == null && employee != null) {
                user.setEmployee(employee);
            }
            userRepository.save(user);
            return;
        }

        if (employee == null || employee.getId() == null) {
            log.warn("Cannot create matrix account '{}': no employee record available.", username);
            return;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setPlainPassword(rawPassword);
        user.setEnabled(true);
        user.setAccountLocked(false);
        user.setEmployee(employee);
        user.setRole(role);

        userRepository.save(user);
        log.info("Matrix account created: {} (role: {})", username, role.getRoleCode());
    }

    /**
     * True when the recorded plaintext is one of the retired seeded defaults that
     * predate the current login-matrix contract (these get upgraded automatically).
     */
    private boolean isRetiredDefault(String plainPassword) {
        if (plainPassword == null) {
            return false;
        }
        return plainPassword.equals("Senior@123")
                || plainPassword.equals("Senior2@123");
    }

    /**
     * Records the plaintext password for accounts seeded in the past whose hash
     * matches a known default. This never changes a password — it only stores the
     * matching plaintext so the admin dashboard can display it.
     */
    private void backfillPlainPassword(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            User user,
            String currentDefaultPassword
    ) {
        if (user.getPlainPassword() != null) {
            return;
        }

        List<String> candidates = new ArrayList<>();
        candidates.add(currentDefaultPassword);
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            candidates.add(user.getUsername() + "123"); // legacy "<username>123" seed pattern
        }
        candidates.add("admin123"); // historical shared demo default

        for (String candidate : candidates) {
            if (candidate != null && passwordEncoder.matches(candidate, user.getPassword())) {
                user.setPlainPassword(candidate);
                userRepository.save(user);
                log.info("Backfilled plaintext password for existing user '{}'.", user.getUsername());
                return;
            }
        }
    }
}
