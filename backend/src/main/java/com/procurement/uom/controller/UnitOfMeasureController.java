package com.procurement.uom.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.uom.dto.response.UomResponse;
import com.procurement.uom.service.UnitOfMeasureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/uoms")
@Tag(name = "Unit of Measure", description = "Unit of measure master data")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class UnitOfMeasureController {

    private final UnitOfMeasureService unitOfMeasureService;

    public UnitOfMeasureController(UnitOfMeasureService unitOfMeasureService) {
        this.unitOfMeasureService = unitOfMeasureService;
    }

    @GetMapping("/all")
    @Operation(summary = "List all units of measure (for dropdowns)")
    public ApiResponse<List<UomResponse>> listAll() {
        return ApiResponse.success(unitOfMeasureService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get UOM by id")
    public ApiResponse<UomResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(unitOfMeasureService.getById(id));
    }
}
