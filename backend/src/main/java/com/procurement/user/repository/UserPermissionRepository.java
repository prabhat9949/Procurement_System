package com.procurement.user.repository;

import com.procurement.user.entity.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserPermissionRepository extends JpaRepository<UserPermission, Long> {

    List<UserPermission> findByUserId(Long userId);

    @Query("select up from UserPermission up "
            + "join fetch up.permission p "
            + "where up.user.id = :userId")
    List<UserPermission> findWithPermissionsByUserId(@Param("userId") Long userId);

    boolean existsByUserIdAndPermissionId(Long userId, Long permissionId);

    @Modifying
    @Query("delete from UserPermission up where up.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
