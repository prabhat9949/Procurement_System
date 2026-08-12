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

    @Transactional(readOnly = true)
    public Map<String, List<DevAccountResponse>> devLoginMatrix() {
        Map<String, List<DevAccountResponse>> groups = new LinkedHashMap<>();
        userRepository.findAll().stream()
                .filter(User::getEnabled)
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

        String category = switch (roleCode) {
            case "SUPER_ADMIN", "ADMIN" -> "ADMIN";
            case "HR_MANAGER" -> "HR";
            case "EMPLOYEE" -> "EMPLOYEES";
            case "DEPARTMENT_MANAGER" -> "MANAGERS";
            case "SENIOR_MANAGER" -> "SENIOR MANAGERS";
            case "HEAD" -> "HEAD";
            case "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER" -> "PROCUREMENT";
            case "EQUIPMENT_ASSET_TEAM" -> "EQUIPMENT";
            case "IT_SOFTWARE_TEAM" -> "SOFTWARE";
            case "FACILITIES_TEAM" -> "FACILITIES";
            case "WAREHOUSE_MANAGER" -> "WAREHOUSE";
            case "FINANCE_MANAGER" -> "FINANCE";
            case "AUDITOR" -> "AUDITOR";
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
