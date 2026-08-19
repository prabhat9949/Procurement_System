package com.procurement.employee.repository;

import com.procurement.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>,
        JpaSpecificationExecutor<Employee> {

    Optional<Employee> findByEmployeeCode(String employeeCode);

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByPhone(String phone);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<Employee> findFirstByRoleIdAndActiveTrue(Long roleId);

    Optional<Employee> findFirstByRoleIdAndActiveTrueAndIdNot(Long roleId, Long excludeId);

    List<Employee> findAllByRoleIdAndActiveTrue(Long roleId);

    long countByDepartmentId(Long departmentId);

    long countByCostCenterId(Long costCenterId);

    long countByActiveTrue();

    long countByActiveFalse();

    long countByManagerIdIsNull();
}
