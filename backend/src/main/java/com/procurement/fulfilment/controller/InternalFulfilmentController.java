package com.procurement.fulfilment.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.fulfilment.dto.request.FulfilmentActionRequest;
import com.procurement.fulfilment.dto.request.InitiateFulfilmentRequest;
import com.procurement.fulfilment.dto.response.AvailabilityCheckResponse;
import com.procurement.fulfilment.dto.response.InternalFulfilmentResponse;
import com.procurement.fulfilment.service.InternalFulfilmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fulfilments")
public class InternalFulfilmentController {

    private final InternalFulfilmentService fulfilmentService;

    public InternalFulfilmentController(InternalFulfilmentService fulfilmentService) {
        this.fulfilmentService = fulfilmentService;
    }

    @GetMapping("/check-availability/{prId}")
    public ApiResponse<AvailabilityCheckResponse> checkAvailability(@PathVariable Long prId) {
        return ApiResponse.success("Internal availability checked", fulfilmentService.checkAvailability(prId));
    }

    @PostMapping("/initiate/{prId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','PROCUREMENT_MANAGER','PROCUREMENT_OFFICER') or hasAuthority('CAN_MANAGE_PRODUCTS')")
    public ApiResponse<List<InternalFulfilmentResponse>> initiateFulfilment(
            @PathVariable Long prId,
            @Valid @RequestBody InitiateFulfilmentRequest request) {
        return ApiResponse.success("Fulfilment initiated", fulfilmentService.initiateFulfilment(prId, request));
    }

    @GetMapping("/my-tasks")
    public ApiResponse<PageResponse<InternalFulfilmentResponse>> getMyTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(fulfilmentService.getMyTasks(pageable));
    }

    @GetMapping("/team-tasks")
    public ApiResponse<PageResponse<InternalFulfilmentResponse>> getTeamTasks(
            @RequestParam(required = false) String teamRole,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(direction), sort));
        return ApiResponse.success(fulfilmentService.getTeamTasks(teamRole, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<InternalFulfilmentResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(fulfilmentService.getById(id));
    }

    @PostMapping("/{id}/confirm")
    public ApiResponse<InternalFulfilmentResponse> confirmStock(
            @PathVariable Long id,
            @RequestBody(required = false) FulfilmentActionRequest request) {
        return ApiResponse.success("Stock availability confirmed", fulfilmentService.confirmStock(id, request));
    }

    @PostMapping("/{id}/allocate")
    public ApiResponse<InternalFulfilmentResponse> allocateStock(
            @PathVariable Long id,
            @RequestBody(required = false) FulfilmentActionRequest request) {
        return ApiResponse.success("Stock allocated", fulfilmentService.allocateStock(id, request));
    }

    @PostMapping("/{id}/dispatch")
    public ApiResponse<InternalFulfilmentResponse> dispatchStock(
            @PathVariable Long id,
            @RequestBody(required = false) FulfilmentActionRequest request) {
        return ApiResponse.success("Dispatched to requester", fulfilmentService.dispatchStock(id, request));
    }

    @PostMapping("/{id}/complete")
    public ApiResponse<InternalFulfilmentResponse> completeFulfilment(
            @PathVariable Long id,
            @RequestBody(required = false) FulfilmentActionRequest request) {
        return ApiResponse.success("Fulfilment completed successfully", fulfilmentService.completeFulfilment(id, request));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<InternalFulfilmentResponse> cancelFulfilment(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Cancelled by user") String reason) {
        return ApiResponse.success("Fulfilment cancelled and stock released", fulfilmentService.cancelFulfilment(id, reason));
    }
}
