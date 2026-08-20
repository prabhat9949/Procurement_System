package com.procurement.inventory.service;

import com.procurement.common.response.PageResponse;
import com.procurement.department.entity.Department;
import com.procurement.employee.entity.Employee;
import com.procurement.inventory.dto.request.InventoryAdjustmentRequest;
import com.procurement.inventory.dto.response.InventoryTransactionResponse;
import com.procurement.inventory.entity.InventoryTransaction;
import com.procurement.inventory.entity.InventoryTransactionType;
import com.procurement.product.entity.Product;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.warehouse.entity.Warehouse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface InventoryTransactionService {

    InventoryTransaction recordTransaction(
            Product product,
            Warehouse warehouse,
            InventoryTransactionType type,
            BigDecimal quantityBefore,
            BigDecimal quantityChanged,
            BigDecimal quantityAfter,
            BigDecimal unitCost,
            String referenceType,
            Long referenceId,
            String referenceNumber,
            Employee requester,
            Department department,
            String reason
    );

    InventoryTransactionResponse adjustStock(InventoryAdjustmentRequest request);

    void allocateStock(Product product, Warehouse warehouse, BigDecimal quantity, PurchaseRequest pr, Employee requester, String reason);

    void releaseAllocation(Product product, Warehouse warehouse, BigDecimal quantity, PurchaseRequest pr, String reason);

    void issueStock(Product product, Warehouse warehouse, BigDecimal quantity, PurchaseRequest pr, Employee requester, String reason);

    PageResponse<InventoryTransactionResponse> search(Long productId, Long warehouseId, String transactionType, String referenceNumber, Pageable pageable);

    List<InventoryTransactionResponse> getByProduct(Long productId);

    List<InventoryTransactionResponse> getByReference(String referenceNumber);
}
