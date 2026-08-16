package com.procurement.procurement.scope.repository;

import com.procurement.procurement.scope.entity.OfficerCategoryScope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfficerCategoryScopeRepository extends JpaRepository<OfficerCategoryScope, Long> {

    List<OfficerCategoryScope> findByEmployeeIdAndActiveTrue(Long employeeId);

    boolean existsByEmployeeIdAndCategoryId(Long employeeId, Long categoryId);
}
