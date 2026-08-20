package com.procurement.user.repository;

import com.procurement.employee.entity.Employee;
import com.procurement.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findByEmployee(Employee employee);

    long countByRoleId(Long roleId);

    long countByEnabledTrueAndAccountLockedFalse();

    long countByEnabledFalse();

    long countByRoleIdAndEnabledTrue(Long roleId);

    java.util.List<User> findByRoleId(Long roleId);
}
