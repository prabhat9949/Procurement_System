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
import java.util.Optional;

@Configuration
public class DataInitializerConfig {

    private static final Logger log =
            LoggerFactory.getLogger(DataInitializerConfig.class);

    // ===== Role Codes =====
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_PROCUREMENT_MANAGER = "PROCUREMENT_MANAGER";
    private static final String ROLE_PROCUREMENT_OFFICER = "PROCUREMENT_OFFICER";
    private static final String ROLE_FINANCE_MANAGER = "FINANCE_MANAGER";
    private static final String ROLE_WAREHOUSE_MANAGER = "WAREHOUSE_MANAGER";
    private static final String ROLE_HR_MANAGER = "HR_MANAGER";
    private static final String ROLE_EMPLOYEE = "EMPLOYEE";

    // ===== Default Credentials =====
    private static final String DEFAULT_ADMIN_USERNAME = "admin";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";
    private static final String DEFAULT_ADMIN_EMAIL = "admin@company.com";

    private static final String USER_PMANAGER = "pmanager";
    private static final String USER_FMANAGER = "fmanager";
    private static final String USER_WMANAGER = "wmanager";
    private static final String USER_HRMANAGER = "hrmanager";
    private static final String USER_EMPLOYEE = "employee";
    private static final String DEFAULT_DEMO_PASSWORD = "admin123";

    @Bean
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
            Role adminRole = createRoleIfNotExists(
                    roleRepository,
                    ROLE_ADMIN,
                    "Administrator",
                    "System administrator with full access"
            );

            Role procurementManagerRole = createRoleIfNotExists(
                    roleRepository,
                    ROLE_PROCUREMENT_MANAGER,
                    "Procurement Manager",
                    "Approves and oversees procurement"
            );

            Role procurementOfficerRole = createRoleIfNotExists(
                    roleRepository,
                    ROLE_PROCUREMENT_OFFICER,
                    "Procurement Officer",
                    "Handles day-to-day procurement operations"
            );

            Role financeManagerRole = createRoleIfNotExists(
                    roleRepository,
                    ROLE_FINANCE_MANAGER,
                    "Finance Manager",
                    "Manages budgets, invoices, and payments"
            );

            Role warehouseManagerRole = createRoleIfNotExists(
                    roleRepository,
                    ROLE_WAREHOUSE_MANAGER,
                    "Warehouse Manager",
                    "Manages inventory and warehouse operations"
            );

            Role hrManagerRole = createRoleIfNotExists(
                    roleRepository,
                    ROLE_HR_MANAGER,
                    "HR Manager",
                    "Manages employee onboarding and access creation"
            );

            Role employeeRole = createRoleIfNotExists(
                    roleRepository,
                    ROLE_EMPLOYEE,
                    "Employee",
                    "Regular employee who creates purchase requests"
            );

            // ==========================
            // 2. Seed Departments
            // ==========================
            Department adminDept = createDepartmentIfNotExists(
                    departmentRepository,
                    "ADM",
                    "Administration",
                    "Administration Department"
            );

            Department procurementDept = createDepartmentIfNotExists(
                    departmentRepository,
                    "PROC",
                    "Procurement",
                    "Procurement Department"
            );

            Department financeDept = createDepartmentIfNotExists(
                    departmentRepository,
                    "FIN",
                    "Finance",
                    "Finance Department"
            );

            Department itDept = createDepartmentIfNotExists(
                    departmentRepository,
                    "IT",
                    "Information Technology",
                    "IT Department"
            );

            Department hrDept = createDepartmentIfNotExists(
                    departmentRepository,
                    "HR",
                    "Human Resources",
                    "HR Department"
            );

            // ==========================
            // 3. Seed Cost Centers
            // ==========================
            CostCenter admCostCenter = createCostCenterIfNotExists(
                    costCenterRepository,
                    "ADM-001",
                    "Administration Main",
                    adminDept
            );

            CostCenter procCostCenter = createCostCenterIfNotExists(
                    costCenterRepository,
                    "PROC-001",
                    "Procurement Operations",
                    procurementDept
            );

            CostCenter finCostCenter = createCostCenterIfNotExists(
                    costCenterRepository,
                    "FIN-001",
                    "Finance Main",
                    financeDept
            );

            CostCenter itCostCenter = createCostCenterIfNotExists(
                    costCenterRepository,
                    "IT-001",
                    "IT Operations",
                    itDept
            );

            CostCenter hrCostCenter = createCostCenterIfNotExists(
                    costCenterRepository,
                    "HR-001",
                    "HR Operations",
                    hrDept
            );

            // ==========================
            // 4. Seed Employees (Admin + Demo)
            // ==========================

            // 4.1 Admin Employee (system owner)
            Employee adminEmployee = createEmployeeIfNotExists(
                    employeeRepository,
                    "EMP001",
                    "System",
                    "Administrator",
                    DEFAULT_ADMIN_EMAIL,
                    "9876543210",
                    adminDept,
                    admCostCenter,
                    adminRole
            );

            // 4.2 Procurement Manager
            Employee procurementManager = createEmployeeIfNotExists(
                    employeeRepository,
                    "EMP002",
                    "Priya",
                    "Sharma",
                    "priya.sharma@company.com",
                    "9876543211",
                    procurementDept,
                    procCostCenter,
                    procurementManagerRole
            );

            // 4.3 Finance Manager
            Employee financeManager = createEmployeeIfNotExists(
                    employeeRepository,
                    "EMP003",
                    "Raj",
                    "Verma",
                    "raj.verma@company.com",
                    "9876543212",
                    financeDept,
                    finCostCenter,
                    financeManagerRole
            );

            // 4.4 Warehouse Manager
            Employee warehouseManager = createEmployeeIfNotExists(
                    employeeRepository,
                    "EMP004",
                    "Amit",
                    "Gupta",
                    "amit.gupta@company.com",
                    "9876543213",
                    adminDept,  // or a dedicated Warehouse dept if you add one
                    admCostCenter,
                    warehouseManagerRole
            );

            // 4.5 HR Employee
            Employee hrEmployee = createEmployeeIfNotExists(
                    employeeRepository,
                    "EMP005",
                    "Neha",
                    "Singh",
                    "neha.singh@company.com",
                    "9876543214",
                    hrDept,
                    hrCostCenter,
                    hrManagerRole
            );

            // 4.6 IT Employee
            Employee itEmployee = createEmployeeIfNotExists(
                    employeeRepository,
                    "EMP006",
                    "Arjun",
                    "Patel",
                    "arjun.patel@company.com",
                    "9876543215",
                    itDept,
                    itCostCenter,
                    employeeRole
            );

            // ==========================
            // 5. Seed Users (login accounts)
            // ==========================
            createAdminUserIfNotExists(
                    userRepository,
                    passwordEncoder,
                    adminEmployee,
                    adminRole
            );

            createUserIfNotExists(
                    userRepository,
                    passwordEncoder,
                    USER_PMANAGER,
                    DEFAULT_DEMO_PASSWORD,
                    procurementManager,
                    procurementManagerRole
            );

            createUserIfNotExists(
                    userRepository,
                    passwordEncoder,
                    USER_FMANAGER,
                    DEFAULT_DEMO_PASSWORD,
                    financeManager,
                    financeManagerRole
            );

            createUserIfNotExists(
                    userRepository,
                    passwordEncoder,
                    USER_WMANAGER,
                    DEFAULT_DEMO_PASSWORD,
                    warehouseManager,
                    warehouseManagerRole
            );

            createUserIfNotExists(
                    userRepository,
                    passwordEncoder,
                    USER_HRMANAGER,
                    DEFAULT_DEMO_PASSWORD,
                    hrEmployee,
                    hrManagerRole
            );

            createUserIfNotExists(
                    userRepository,
                    passwordEncoder,
                    USER_EMPLOYEE,
                    DEFAULT_DEMO_PASSWORD,
                    itEmployee,
                    employeeRole
            );

            // ==========================
            // 6. Startup Log
            // ==========================
            log.info("====================================");
            log.info("Enterprise Procurement Initialized");
            log.info("Default Admin Username : {}", DEFAULT_ADMIN_USERNAME);
            log.info("Default Admin Password : {}", DEFAULT_ADMIN_PASSWORD);
            log.info("Demo Users:");
            log.info(" - {} / {} (role: {})", USER_PMANAGER, DEFAULT_DEMO_PASSWORD, ROLE_PROCUREMENT_MANAGER);
            log.info(" - {} / {} (role: {})", USER_FMANAGER, DEFAULT_DEMO_PASSWORD, ROLE_FINANCE_MANAGER);
            log.info(" - {} / {} (role: {})", USER_WMANAGER, DEFAULT_DEMO_PASSWORD, ROLE_WAREHOUSE_MANAGER);
            log.info(" - {} / {} (role: {})", USER_HRMANAGER, DEFAULT_DEMO_PASSWORD, ROLE_HR_MANAGER);
            log.info(" - {} / {} (role: {})", USER_EMPLOYEE, DEFAULT_DEMO_PASSWORD, ROLE_EMPLOYEE);
            log.info("====================================");
        };
    }

    // ===== Helper methods =====

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
        // ADMIN should be marked as system role
        role.setSystemRole(ROLE_ADMIN.equals(roleCode));
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
            Department department
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

        // Initialize budgets (if nullable / required)
        cc.setBudget(BigDecimal.ZERO);
        cc.setUsedBudget(BigDecimal.ZERO);
        cc.setRemainingBudget(BigDecimal.ZERO);

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
        // Prefer employeeCode as the primary unique identifier
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
        Optional<User> existing = userRepository.findByUsername(DEFAULT_ADMIN_USERNAME);
        if (existing.isPresent()) {
            log.info("Default admin user already exists.");
            return;
        }
        if (userRepository.findByEmployee(adminEmployee).isPresent()) {
            log.info("Admin employee already has a linked user account.");
            return;
        }

        User user = new User();
        user.setUsername(DEFAULT_ADMIN_USERNAME);
        user.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
        user.setEnabled(true);
        user.setAccountLocked(false);

        user.setEmployee(adminEmployee);
        user.setRole(adminRole);

        userRepository.save(user);
        log.info("Default admin user created: {}", DEFAULT_ADMIN_USERNAME);
    }

    private void createUserIfNotExists(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String username,
            String rawPassword,
            Employee employee,
            Role role
    ) {
        Optional<User> existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            log.info("User '{}' already exists, skipping.", username);
            return;
        }
        if (userRepository.findByEmployee(employee).isPresent()) {
            log.info("Employee '{}' already has a user account, skipping username '{}'.",
                    employee.getEmployeeCode(), username);
            return;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setEnabled(true);
        user.setAccountLocked(false);

        user.setEmployee(employee);
        user.setRole(role);

        userRepository.save(user);
        log.info("Demo user created: {} (role: {})", username, role.getRoleCode());
    }
}
