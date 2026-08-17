package com.procurement.noncatalog.repository;

import com.procurement.noncatalog.entity.NonCatalogRequest;
import com.procurement.noncatalog.entity.NonCatalogRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NonCatalogRequestRepository extends JpaRepository<NonCatalogRequest, Long>, JpaSpecificationExecutor<NonCatalogRequest> {

    Optional<NonCatalogRequest> findByRequestNumber(String requestNumber);

    Page<NonCatalogRequest> findByRequesterId(Long requesterId, Pageable pageable);

    Page<NonCatalogRequest> findByDepartmentId(Long departmentId, Pageable pageable);

    Page<NonCatalogRequest> findByStatus(NonCatalogRequestStatus status, Pageable pageable);

    List<NonCatalogRequest> findByStatus(NonCatalogRequestStatus status);
}
