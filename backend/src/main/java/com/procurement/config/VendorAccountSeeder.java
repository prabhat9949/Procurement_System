package com.procurement.config;

import com.procurement.costcenter.entity.CostCenter;
import com.procurement.costcenter.repository.CostCenterRepository;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.role.entity.Role;
import com.procurement.role.repository.RoleRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.vendor.entity.Vendor;
import com.procurement.vendor.repository.VendorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Links every demo vendor company to a login account so suppliers can sign in
 * and bid on RFQs. Runs after {@link DemoDataSeeder} (which creates the vendor
 * companies) and {@link DataInitializerConfig} (which creates the VENDOR role).
 *
 * Accounts:
 *   vendor@123  / Vendor@123   -> Delhi Tech Solutions (VEN-2026-001)
 *   vendor2@123 / Vendor2@123  -> Mumbai Office Supplies (VEN-2026-002)
 *   vendor3@123 / Vendor@123   -> Bengaluru Software Distributors (VEN-2026-003)
 *   vendor4@123 / Vendor@123   -> Chennai Furniture Works (VEN-2026-004)
 *   vendor5@123 / Vendor@123   -> Pune Facility Services (VEN-2026-005)
 *
 * Each vendor account is scoped via User.vendor so the portal only ever shows
 * that supplier's own RFQs, quotations and purchase orders.
 */
@Configuration
@Order(3)
public class VendorAccountSeeder {

    private static final Logger log = LoggerFactory.getLogger(VendorAccountSeeder.class);

    private static final String VENDOR_PASSWORD = "Vendor@123";
    private static final String VENDOR2_PASSWORD = "Vendor2@123";

    @Bean
    @org.springframework.core.annotation.Order(3)
    @Transactional
    public CommandLineRunner seedVendorAccounts(
            VendorRepository vendorRepository,
            RoleRepository roleRepository,
            DepartmentRepository departmentRepository,
            CostCenterRepository costCenterRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            Role vendorRole = roleRepository.findByRoleCode("VENDOR").orElse(null);
            if (vendorRole == null) {
                log.warn("VENDOR role not found — skipping vendor account seeding.");
                return;
            }
            Department procurement = departmentRepository.findByDepartmentCode("PROC").orElse(null);
            CostCenter procCostCenter = costCenterRepository.findByCode("PROC-001").orElse(null);
            if (procurement == null || procCostCenter == null) {
                log.warn("Procurement department / cost centre missing — skipping vendor accounts.");
                return;
            }

            List<Vendor> vendors = vendorRepository.findAll();
            // Sort by vendor code so the demo password contract is deterministic regardless of
            // insertion order or unrelated vendors added later.
            vendors.sort(java.util.Comparator.comparing(v -> v.getVendorCode() == null ? "" : v.getVendorCode()));
            for (int i = 0; i < vendors.size(); i++) {
                Vendor vendor = vendors.get(i);
                final int index = i;
                String username = index == 0 ? "vendor@123" : "vendor" + (index + 1) + "@123";
                // Demo account contract: vendor2@123 (Mumbai Office Supplies, VEN-2026-002) uses Vendor2@123.
                String password = index == 1 ? VENDOR2_PASSWORD : VENDOR_PASSWORD;
                Optional<User> existing = userRepository.findByUsername(username);
                if (existing.isPresent()) {
                    User user = existing.get();
                    if (user.getVendor() == null || !user.getVendor().getId().equals(vendor.getId())) {
                        user.setVendor(vendor);
                        user.setRole(vendorRole);
                        userRepository.save(user);
                    }
                    // Keep the demo password contract in sync even for already-seeded accounts.
                    if (user.getPlainPassword() == null || !password.equals(user.getPlainPassword())) {
                        user.setPassword(passwordEncoder.encode(password));
                        user.setPlainPassword(password);
                        userRepository.save(user);
                        log.info("Updated password for '{}' to match demo account contract", username);
                    }
                    log.info("Linked existing account '{}' to vendor '{}'", username, vendor.getVendorName());
                    continue;
                }

                // A user requires a linked employee record — create one per vendor.
                String empCode = "EMP-VEN-" + String.format("%03d", index + 1);
                Optional<Employee> emp = employeeRepository.findByEmployeeCode(empCode);
                Employee vendorEmployee = emp.orElseGet(() -> {
                    Employee e = new Employee();
                    e.setEmployeeCode(empCode);
                    e.setFirstName(vendor.getVendorName());
                    e.setLastName("(Supplier)");
                    e.setEmail(vendor.getEmail() == null || vendor.getEmail().isBlank()
                            ? ("vendor" + (index + 1) + "@enterprise.com")
                            : vendor.getEmail());
                    e.setPhone(vendor.getPhone());
                    e.setDepartment(procurement);
                    e.setCostCenter(procCostCenter);
                    e.setRole(vendorRole);
                    e.setActive(true);
                    return employeeRepository.save(e);
                });

                User user = new User();
                user.setUsername(username);
                user.setPassword(passwordEncoder.encode(password));
                user.setPlainPassword(password);
                user.setEmployee(vendorEmployee);
                user.setRole(vendorRole);
                user.setVendor(vendor);
                user.setEnabled(true);
                user.setAccountLocked(false);
                userRepository.save(user);
                log.info("Created vendor account '{}' for '{}'", username, vendor.getVendorName());
            }

            log.info("Vendor portal accounts ready (vendor@123: {}, vendor2@123: {}, others: {}).",
                    VENDOR_PASSWORD, VENDOR2_PASSWORD, VENDOR_PASSWORD);
        };
    }
}
