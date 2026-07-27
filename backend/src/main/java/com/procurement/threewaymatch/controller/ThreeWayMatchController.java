package com.procurement.threewaymatch.controller;

import com.procurement.common.response.*;
import com.procurement.threewaymatch.dto.request.ThreeWayMatchRequest;
import com.procurement.threewaymatch.dto.response.*;
import com.procurement.threewaymatch.entity.ThreeWayMatchStatus;
import com.procurement.threewaymatch.service.ThreeWayMatchService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/three-way-matches")
public class ThreeWayMatchController {
    private final ThreeWayMatchService service;
    public ThreeWayMatchController(ThreeWayMatchService service){this.service=service;}
    @PostMapping
    public ResponseEntity<ApiResponse<ThreeWayMatchResponse>> create(@Valid @RequestBody ThreeWayMatchRequest request){return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Three-way match created",service.create(request)));}
    @GetMapping
    public ApiResponse<PageResponse<ThreeWayMatchResponse>> search(@RequestParam(required=false)String keyword,@RequestParam(required=false)Long vendorId,@RequestParam(required=false)ThreeWayMatchStatus status,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size,@RequestParam(defaultValue="matchDate")String sort,@RequestParam(defaultValue="desc")String direction){var order="asc".equalsIgnoreCase(direction)?Sort.by(sort).ascending():Sort.by(sort).descending();return ApiResponse.success(service.search(keyword,vendorId,status,PageRequest.of(page,size,order)));}
    @GetMapping("/{id}")
    public ApiResponse<ThreeWayMatchResponse> get(@PathVariable Long id){return ApiResponse.success(service.get(id));}
    @GetMapping("/search")
    public ApiResponse<PageResponse<ThreeWayMatchResponse>> searchLegacy(@RequestParam(required=false)String keyword,@RequestParam(required=false)Long vendorId,@RequestParam(required=false)ThreeWayMatchStatus status,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size,@RequestParam(defaultValue="matchDate")String sort,@RequestParam(defaultValue="desc")String direction){var order="asc".equalsIgnoreCase(direction)?Sort.by(sort).ascending():Sort.by(sort).descending();return ApiResponse.success(service.search(keyword,vendorId,status,PageRequest.of(page,size,order)));}
    @PostMapping("/{id}/generate")
    public ApiResponse<ThreeWayMatchResponse> generate(@PathVariable Long id){return ApiResponse.success("Three-way match generated",service.generate(id));}
    @PostMapping("/{id}/approve")
    public ApiResponse<ThreeWayMatchResponse> approve(@PathVariable Long id){return ApiResponse.success("Three-way match approved",service.approve(id));}
    @PostMapping("/{id}/reject")
    public ApiResponse<ThreeWayMatchResponse> reject(@PathVariable Long id){return ApiResponse.success("Three-way match rejected",service.reject(id));}
    @GetMapping("/{id}/history")
    public ApiResponse<PageResponse<ThreeWayMatchHistoryResponse>> history(@PathVariable Long id,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(service.history(id,PageRequest.of(page,size)));}
}
