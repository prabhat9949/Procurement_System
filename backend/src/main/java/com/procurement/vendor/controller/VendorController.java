package com.procurement.vendor.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.vendor.dto.request.VendorRequest;
import com.procurement.vendor.dto.response.VendorResponse;
import com.procurement.vendor.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VendorResponse>> create(
            @Valid @RequestBody VendorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vendor created", vendorService.create(request)));
    }

    @GetMapping
    public ApiResponse<PageResponse<VendorResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String vendorType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean approved,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "vendorName") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(vendorService.search(keyword, vendorType, status, approved, pageable));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<VendorResponse>> searchEndpoint(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String vendorType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean approved,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "vendorName") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        return search(keyword, vendorType, status, approved, page, size, sort, direction);
    }

    @GetMapping("/{id}")
    public ApiResponse<VendorResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(vendorService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<VendorResponse> update(@PathVariable Long id,
                                              @Valid @RequestBody VendorRequest request) {
        return ApiResponse.success("Vendor updated", vendorService.update(id, request));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<VendorResponse> updateStatus(@PathVariable Long id,
                                                    @RequestBody StatusUpdateRequest request) {
        return ApiResponse.success("Vendor status updated", vendorService.updateStatus(id, request.status(), request.approved()));
    }

    @PutMapping("/{id}/kyc")
    public ApiResponse<VendorResponse> updateKyc(@PathVariable Long id,
                                                 @RequestBody KycDecisionRequest request) {
        return ApiResponse.success("Vendor KYC decision recorded",
                vendorService.updateKyc(id, request.decision(), request.reason()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vendorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    public record StatusUpdateRequest(String status, Boolean approved) {
    }

    public record KycDecisionRequest(String decision, String reason) {
    }
}
