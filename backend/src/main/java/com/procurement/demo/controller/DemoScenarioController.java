package com.procurement.demo.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.demo.service.DemoScenarioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Database-backed demo scenario endpoints.
 * <p>
 * "Run Demo" creates REAL records in MySQL (tagged DEMO-2026-001); the status
 * endpoint reports the pipeline progress; reset removes ONLY demo records.
 */
@RestController
@RequestMapping("/api/demo")
public class DemoScenarioController {

    private final DemoScenarioService service;

    public DemoScenarioController(DemoScenarioService service) {
        this.service = service;
    }

    @PostMapping("/run")
    public ApiResponse<Map<String, Object>> runDemo() {
        return ApiResponse.success("Demo scenario created", service.createCompleteDemoScenario());
    }

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> status() {
        return ApiResponse.success(service.getDemoScenarioStatus());
    }

    @PostMapping("/reset")
    public ApiResponse<Map<String, Object>> resetDemo() {
        return ApiResponse.success("Demo scenario reset", service.resetDemoScenario());
    }
}
