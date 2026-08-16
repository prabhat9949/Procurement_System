package com.procurement.purchaserequestline.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.purchaserequestline.dto.request.PurchaseRequestLineRequest;
import com.procurement.purchaserequestline.dto.response.PurchaseRequestLineResponse;
import com.procurement.purchaserequestline.service.PurchaseRequestLineService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase-request-lines")
public class PurchaseRequestLineController {

    private final PurchaseRequestLineService lineService;

    public PurchaseRequestLineController(PurchaseRequestLineService lineService) {
        this.lineService = lineService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseRequestLineResponse>> create(
            @Valid @RequestBody PurchaseRequestLineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Purchase request line created", lineService.create(request)));
    }

    @GetMapping
    public ApiResponse<PageResponse<PurchaseRequestLineResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long purchaseRequestId,
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(lineService.search(keyword, purchaseRequestId, productId, pageable));
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<PurchaseRequestLineResponse>> searchEndpoint(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long purchaseRequestId,
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        return search(keyword, purchaseRequestId, productId, page, size, sort, direction);
    }

    @GetMapping("/{id}")
    public ApiResponse<PurchaseRequestLineResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(lineService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<PurchaseRequestLineResponse> update(
            @PathVariable Long id, @Valid @RequestBody PurchaseRequestLineRequest request) {
        return ApiResponse.success("Purchase request line updated", lineService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        lineService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
