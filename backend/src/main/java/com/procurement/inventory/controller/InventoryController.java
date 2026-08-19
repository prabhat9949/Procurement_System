package com.procurement.inventory.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.inventory.dto.request.InventoryRequest;
import com.procurement.inventory.dto.response.InventoryResponse;
import com.procurement.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final com.procurement.inventory.service.InventoryTransactionService transactionService;

    public InventoryController(InventoryService inventoryService,
                               com.procurement.inventory.service.InventoryTransactionService transactionService) {
        this.inventoryService = inventoryService;
        this.transactionService = transactionService;
    }

    @PostMapping("/adjust")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','PROCUREMENT_OFFICER','WAREHOUSE_MANAGER') or hasAnyAuthority('CAN_UPDATE_INVENTORY','CAN_MANAGE_PRODUCTS')")
    public ApiResponse<com.procurement.inventory.dto.response.InventoryTransactionResponse> adjust(
            @Valid @RequestBody com.procurement.inventory.dto.request.InventoryAdjustmentRequest request) {
        return ApiResponse.success("Stock updated with transaction log", transactionService.adjustStock(request));
    }

    @GetMapping("/transactions")
    public ApiResponse<PageResponse<com.procurement.inventory.dto.response.InventoryTransactionResponse>> getTransactions(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String transactionType,
            @RequestParam(required = false) String referenceNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.success(transactionService.search(productId, warehouseId, transactionType, referenceNumber,
                PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort))));
    }

    @GetMapping("/transactions/product/{productId}")
    public ApiResponse<java.util.List<com.procurement.inventory.dto.response.InventoryTransactionResponse>> getProductTransactions(
            @PathVariable Long productId) {
        return ApiResponse.success(transactionService.getByProduct(productId));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InventoryResponse>> create(
            @Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Inventory created", inventoryService.create(request)));
    }

    @GetMapping
    public ApiResponse<PageResponse<InventoryResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean lowStock,
            @RequestParam(required = false) Boolean outOfStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "lastStockUpdate") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.success(inventoryService.search(keyword, productId, warehouseId, categoryId,
                status, lowStock, outOfStock, pageable(page, size, sort, direction)));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<InventoryResponse>> searchEndpoint(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean lowStock,
            @RequestParam(required = false) Boolean outOfStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "lastStockUpdate") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        return search(keyword, productId, warehouseId, categoryId, status, lowStock, outOfStock,
                page, size, sort, direction);
    }

    @GetMapping("/low-stock")
    public ApiResponse<PageResponse<InventoryResponse>> lowStock(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "availableQuantity") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        return search(null, productId, warehouseId, null, null, true, null,
                page, size, sort, direction);
    }

    @GetMapping("/out-of-stock")
    public ApiResponse<PageResponse<InventoryResponse>> outOfStock(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "availableQuantity") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        return search(null, productId, warehouseId, null, null, null, true,
                page, size, sort, direction);
    }

    @GetMapping("/reorder")
    public ApiResponse<PageResponse<InventoryResponse>> reorder(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "availableQuantity") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        return lowStock(productId, warehouseId, page, size, sort, direction);
    }

    @GetMapping("/{id}")
    public ApiResponse<InventoryResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(inventoryService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<InventoryResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody InventoryRequest request) {
        return ApiResponse.success("Inventory updated", inventoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inventoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private Pageable pageable(int page, int size, String sort, String direction) {
        return PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
    }
}
