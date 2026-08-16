package com.procurement.procurement.scope.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.procurement.scope.dto.response.ProcurementScopeResponse;
import com.procurement.procurement.scope.service.ProcurementScopeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/procurement")
public class ProcurementScopeController {

    private final ProcurementScopeService scopeService;

    public ProcurementScopeController(ProcurementScopeService scopeService) {
        this.scopeService = scopeService;
    }

    @GetMapping("/my-scope")
    public ApiResponse<ProcurementScopeResponse> myScope() {
        return ApiResponse.success(scopeService.myScope());
    }
}
