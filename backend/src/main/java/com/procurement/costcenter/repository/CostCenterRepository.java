package com.procurement.costcenter.repository;

import com.procurement.costcenter.entity.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CostCenterRepository extends JpaRepository<CostCenter, Long>, JpaSpecificationExecutor<CostCenter> {

    Optional<CostCenter> findByCode(String code);

    boolean existsByCode(String code);

    long countByDepartmentId(Long departmentId);

    long countByActiveTrue();

    java.util.List<CostCenter> findByDepartmentId(Long departmentId);
}
