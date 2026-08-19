package com.procurement.role.repository;

import com.procurement.role.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    boolean existsByRole_IdAndPermission_Id(Long roleId, Long permissionId);

    @Query("select rolePermission from RolePermission rolePermission "
            + "join fetch rolePermission.permission "
            + "where rolePermission.role.id = :roleId")
    List<RolePermission> findWithPermissionsByRoleId(@Param("roleId") Long roleId);
}
