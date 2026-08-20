package com.procurement.externalprocurement.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.rfq.dto.request.RfqRequest;
import com.procurement.rfq.dto.response.RfqResponse;
import com.procurement.externalprocurement.service.ExternalProcurementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/external-procurement")
public class ExternalProcurementController {

    private final ExternalProcurementService externalProcurementService;

    public ExternalProcurementController(ExternalProcurementService externalProcurementService) {
        this.externalProcurementService = externalProcurementService;
    }

    @PostMapping("/pr/{prId}/rfq")
    @PreAuthorize("hasAuthority('CAN_CREATE_RFQ')")
    public ResponseEntity<ApiResponse<RfqResponse>> createRfq(
            @PathVariable Long prId,
            @Valid @RequestBody RfqRequest rfqRequest) {
        RfqResponse response = externalProcurementService.startExternalProcurement(prId, rfqRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("RFQ created for external procurement", response));
    }
}
