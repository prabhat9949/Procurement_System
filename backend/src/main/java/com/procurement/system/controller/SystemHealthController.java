package com.procurement.system.controller;

import com.procurement.costcenter.repository.CostCenterRepository;
import com.procurement.department.repository.DepartmentRepository;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.user.repository.UserRepository;
import com.procurement.vendor.repository.VendorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@Tag(name = "System Health", description = "Backend and database health monitoring")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class SystemHealthController {

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final CostCenterRepository costCenterRepository;
    private final VendorRepository vendorRepository;

    public SystemHealthController(JdbcTemplate jdbcTemplate,
                                  UserRepository userRepository,
                                  EmployeeRepository employeeRepository,
                                  DepartmentRepository departmentRepository,
                                  CostCenterRepository costCenterRepository,
                                  VendorRepository vendorRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.costCenterRepository = costCenterRepository;
        this.vendorRepository = vendorRepository;
    }

    @GetMapping("/health")
    @Operation(summary = "Real backend + database health check")
    public Map<String, Object> health() {
        Map<String, Object> db = new LinkedHashMap<>();
        try {
            String dbName = jdbcTemplate.queryForObject("select database()", String.class);
            db.put("status", "UP");
            db.put("database", dbName);
            db.put("responseTimeMs", pingMs());
            db.put("lastCheckedAt", LocalDateTime.now().toString());
        } catch (Exception e) {
            db.put("status", "DOWN");
            db.put("error", e.getMessage());
        }

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("users", userRepository.count());
        counts.put("employees", employeeRepository.count());
        counts.put("departments", departmentRepository.count());
        counts.put("costCenters", costCenterRepository.count());
        counts.put("vendors", vendorRepository.count());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("backend", "UP");
        result.put("version", "EPS 1.0");
        result.put("database", db);
        result.put("recordCounts", counts);
        result.put("overall", "UP".equals(db.get("status")) ? "UP" : "DEGRADED");
        return result;
    }

    private long pingMs() {
        long start = System.currentTimeMillis();
        jdbcTemplate.queryForObject("select 1", Integer.class);
        return System.currentTimeMillis() - start;
    }
}
