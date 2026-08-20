package com.procurement.threewaymatch.controller;

import com.procurement.common.response.*;
import com.procurement.threewaymatch.dto.response.ThreeWayMatchLineResponse;
import com.procurement.threewaymatch.service.ThreeWayMatchService;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/three-way-match-lines")
public class ThreeWayMatchLineController {
    private final ThreeWayMatchService service;
    public ThreeWayMatchLineController(ThreeWayMatchService service){this.service=service;}
    @GetMapping
    public ApiResponse<PageResponse<ThreeWayMatchLineResponse>> list(@RequestParam Long threeWayMatchId,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(service.lines(threeWayMatchId, PageRequest.of(page,size)));}
    @GetMapping("/{id}")
    public ApiResponse<ThreeWayMatchLineResponse> get(@PathVariable Long id){return ApiResponse.success(service.getLine(id));}
}
