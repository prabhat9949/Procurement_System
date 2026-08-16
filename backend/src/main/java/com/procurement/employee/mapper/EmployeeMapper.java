package com.procurement.employee.mapper;

import com.procurement.costcenter.entity.CostCenter;
import com.procurement.department.entity.Department;
import com.procurement.employee.dto.request.EmployeeRequest;
import com.procurement.employee.dto.response.EmployeeResponse;
import com.procurement.employee.entity.Employee;
import com.procurement.role.entity.Role;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public Employee toEntity(EmployeeRequest request, Department department, CostCenter costCenter,
                             Role role, Employee manager) {
        Employee employee = new Employee();
        updateEntity(employee, request, department, costCenter, role, manager);
        return employee;
    }

    public void updateEntity(Employee employee, EmployeeRequest request, Department department,
                             CostCenter costCenter, Role role, Employee manager) {
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setPhone(request.phone());
        employee.setDepartment(department);
        employee.setCostCenter(costCenter);
        employee.setRole(role);
        employee.setManager(manager);
        employee.setActive(request.active() == null ? Boolean.TRUE : request.active());
    }

    public EmployeeResponse toResponse(Employee employee) {
        Employee manager = employee.getManager();
        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getDepartment().getId(),
                employee.getDepartment().getDepartmentCode(),
                employee.getDepartment().getDepartmentName(),
                employee.getCostCenter().getId(),
                employee.getCostCenter().getCode(),
                employee.getCostCenter().getName(),
                employee.getRole().getId(),
                employee.getRole().getRoleCode(),
                employee.getRole().getRoleName(),
                manager == null ? null : manager.getId(),
                manager == null ? null : manager.getEmployeeCode(),
                manager == null ? null : manager.getFirstName() + " " + manager.getLastName(),
                employee.getActive(),
                employee.getCreatedAt(),
                employee.getUpdatedAt()
        );
    }
}
