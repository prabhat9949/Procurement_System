package com.procurement.invoice.repository;import com.procurement.invoice.entity.*;import org.springframework.data.jpa.repository.*;import org.springframework.stereotype.Repository;import java.util.*;@Repository public interface InvoiceRepository extends JpaRepository<Invoice,Long>,JpaSpecificationExecutor<Invoice>{
    boolean existsByVendorInvoiceNumber(String n);
    java.util.List<Invoice> findByPurchaseOrderId(Long purchaseOrderId);
    java.util.List<Invoice> findByVendorId(Long vendorId);
}
