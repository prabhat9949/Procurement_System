package com.procurement.dev.service;

import com.procurement.dev.dto.DevAccountResponse;
import com.procurement.employee.entity.Employee;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.vendor.entity.Vendor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds the development login matrix straight from the database so the
 * frontend dev-login panel never hardcodes accounts. Grouped by role category
 * so the UI can render ADMIN / EMPLOYEES / MANAGERS / VENDORS etc.
 */
@Service
public class DevAccountService {

    private final UserRepository userRepository;

    public DevAccountService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * The demo-login panel shows exactly the curated set of accounts used for
     * demonstrations — one account per operational role plus the extra vendors /
     * employees / managers that make the workflows demoable. All other accounts
     * stay fully functional in the database; they are simply not listed here.
     */
    private static final java.util.Set<String> DEMO_USERNAMES = java.util.Set.of(
            // ADMIN / HR
            "admin@123", "hr@123",
            // Employees (4)
            "employee@123", "employee2@123", "employee3@123", "employee4@123",
            // Managers (3)
            "manager@123", "manager2@123", "manager3@123",
            // Senior managers (2) — HEAD maps to the senior manager workflow
            "seniormanager@123", "seniormanager2@123",
            // Procurement executive (4)
            "procurement@123", "officer", "procurement2@123", "procurement3@123",
            // Vendors (6)
            "vendor@123", "vendor2@123", "vendor3@123", "vendor4@123",
            "vendor5@123", "vendor6@123",
            // Warehouse / Inventory (1)
            "warehouse@123",
            // Finance (1)
            "finance@123",
            // Auditor (1) + Support (1)
            "auditor@123", "support@123"
    );

    @Transactional(readOnly = true)
    public Map<String, List<DevAccountResponse>> devLoginMatrix() {
        Map<String, List<DevAccountResponse>> groups = new LinkedHashMap<>();
        userRepository.findAll().stream()
                .filter(User::getEnabled)
                .filter(u -> DEMO_USERNAMES.contains(u.getUsername()))
                .sorted(Comparator.comparing(u -> u.getRole() == null ? "" : u.getRole().getRoleCode()))
                .forEach(u -> {
                    DevAccountResponse acc = toResponse(u);
                    if (acc != null) {
                        groups.computeIfAbsent(acc.category(), k -> new java.util.ArrayList<>()).add(acc);
                    }
                });
        return groups;
    }

    private DevAccountResponse toResponse(User user) {
        if (user.getRole() == null) {
            return null;
        }
        String roleCode = user.getRole().getRoleCode();
        Employee emp = user.getEmployee();
        Vendor vendor = user.getVendor();

        String name = emp != null ? emp.getFirstName() + (emp.getLastName() == null ? "" : " " + emp.getLastName())
                : (vendor != null ? vendor.getVendorName() : user.getUsername());
        String employeeCode = emp != null ? emp.getEmployeeCode() : null;
        String department = emp != null && emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : null;
        String costCenter = emp != null && emp.getCostCenter() != null ? emp.getCostCenter().getName() : null;
        String managerName = emp != null && emp.getManager() != null
                ? emp.getManager().getFirstName() + " " + (emp.getManager().getLastName() == null ? "" : emp.getManager().getLastName())
                : null;

        // Consolidated demo-login categories: equipment / software / facilities /
        // warehouse all land under the single Inventory category (one consolidated
        // inventory dashboard). Finance remains a separate functional role.
        String category = switch (roleCode) {
            case "SUPER_ADMIN", "ADMIN" -> "ADMIN";
            case "HR_MANAGER" -> "HR";
            case "EMPLOYEE" -> "EMPLOYEES";
            case "DEPARTMENT_MANAGER" -> "MANAGERS";
            case "SENIOR_MANAGER", "HEAD" -> "SENIOR MANAGERS";
            case "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER" -> "PROCUREMENT EXECUTIVE";
            case "EQUIPMENT_ASSET_TEAM", "IT_SOFTWARE_TEAM", "FACILITIES_TEAM", "WAREHOUSE_MANAGER" -> "WAREHOUSE / INVENTORY";
            case "FINANCE_MANAGER" -> "FINANCE";
            case "AUDITOR" -> "AUDITOR";
            case "SUPPORT_TEAM" -> "SUPPORT TEAM";
            case "VENDOR" -> "VENDORS";
            default -> "OTHER";
        };

        return new DevAccountResponse(
                user.getId(),
                name,
                user.getUsername(),
                user.getPlainPassword(), // dev-only demo credentials
                roleCode,
                user.getRole().getRoleName(),
                category,
                employeeCode,
                emp != null ? String.valueOf(emp.getId()) : null,
                vendor != null ? String.valueOf(vendor.getId()) : null,
                vendor != null ? vendor.getVendorName() : null,
                department,
                costCenter,
                managerName,
                vendor != null ? "VENDOR" : (emp != null ? "EMPLOYEE" : "SYSTEM"));
    }
}
