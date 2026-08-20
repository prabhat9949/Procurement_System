package com.procurement.warehouse.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.warehouse.dto.request.WarehouseRequest;
import com.procurement.warehouse.dto.response.WarehouseResponse;
import com.procurement.warehouse.entity.WarehouseType;
import com.procurement.warehouse.service.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WarehouseResponse>> create(
            @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Warehouse created", warehouseService.create(request)));
    }

    @GetMapping
    public ApiResponse<PageResponse<WarehouseResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) WarehouseType warehouseType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "warehouseName") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(warehouseService.search(keyword, warehouseType, city, state,
                status, pageable));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<WarehouseResponse>> searchEndpoint(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) WarehouseType warehouseType,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "warehouseName") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        return search(keyword, warehouseType, city, state, status, page, size, sort, direction);
    }

    @GetMapping("/{id}")
    public ApiResponse<WarehouseResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(warehouseService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<WarehouseResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody WarehouseRequest request) {
        return ApiResponse.success("Warehouse updated", warehouseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        warehouseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
