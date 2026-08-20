package com.procurement.rfq.controller;
import com.procurement.common.response.*;
import com.procurement.rfq.dto.request.*;
import com.procurement.rfq.dto.response.*;
import com.procurement.rfq.service.*;
import org.springframework.data.domain.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/rfq-vendors")
public class RfqVendorController {
    private final RfqVendorService service;
    public RfqVendorController(RfqVendorService s) { service = s; }
    @PostMapping("/{id}/invite")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','PROCUREMENT_OFFICER')")
    public ResponseEntity<ApiResponse<RfqVendorResponse>> invite(@PathVariable Long id,
                                                                 @Valid @RequestBody RfqVendorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vendor invited to RFQ", service.invite(id, request)));
    }
    @DeleteMapping("/{id}/vendors/{vendorId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','PROCUREMENT_OFFICER')")
    public ResponseEntity<Void> remove(@PathVariable Long id, @PathVariable Long vendorId) {
        service.remove(id, vendorId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/search")
    public ApiResponse<PageResponse<RfqVendorResponse>> search(
            @RequestParam(required = false) Long rfqId,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "invitationDate") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        return ApiResponse.success(service.search(rfqId, vendorId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort))));
    }
}
