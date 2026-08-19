package com.procurement.product.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.product.dto.request.NewCatalogueItemRequest;
import com.procurement.product.dto.request.ProductRequest;
import com.procurement.product.dto.response.ProductResponse;
import com.procurement.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@PreAuthorize("isAuthenticated()")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','PROCUREMENT_OFFICER','WAREHOUSE_MANAGER')")
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created", productService.create(request)));
    }

    /**
     * Add an item to the catalogue from minimal fields. Available to employees
     * (non-catalogue item request), the consolidated Warehouse / Inventory
     * dashboard and procurement so new items immediately become requestable and
     * visible across the procurement system.
     */
    @PostMapping("/request-new")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','PROCUREMENT_OFFICER','WAREHOUSE_MANAGER','EMPLOYEE')")
    public ResponseEntity<ApiResponse<ProductResponse>> requestNew(
            @Valid @RequestBody NewCatalogueItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item added to the catalogue", productService.requestNewCatalogueItem(request)));
    }

    @GetMapping
    public ApiResponse<PageResponse<ProductResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "productName") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(productService.search(keyword, categoryId, vendorId, active, pageable));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<ProductResponse>> searchEndpoint(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "productName") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        return search(keyword, categoryId, vendorId, active, page, size, sort, direction);
    }

    @GetMapping("/active")
    public ApiResponse<List<ProductResponse>> activeProducts() {
        return ApiResponse.success(productService.search(null, null, null, true,
                PageRequest.of(0, 1000, Sort.by(Sort.Direction.ASC, "productName"))).content());
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(productService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','PROCUREMENT_OFFICER','WAREHOUSE_MANAGER')")
    public ApiResponse<ProductResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody ProductRequest request) {
        return ApiResponse.success("Product updated", productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','PROCUREMENT_OFFICER','WAREHOUSE_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
