package com.procurement.vendor.repository;

import com.procurement.vendor.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long>, JpaSpecificationExecutor<Vendor> {

    Optional<Vendor> findByVendorCode(String vendorCode);

    Optional<Vendor> findByGstNumber(String gstNumber);

    boolean existsByVendorCode(String vendorCode);

    boolean existsByGstNumber(String gstNumber);
}
