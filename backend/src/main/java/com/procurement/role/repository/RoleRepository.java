package com.procurement.role.repository;

import com.procurement.role.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByRoleCode(String roleCode);

    Optional<Role> findByRoleName(String roleName);

    boolean existsByRoleCode(String roleCode);

    boolean existsByRoleName(String roleName);

}
