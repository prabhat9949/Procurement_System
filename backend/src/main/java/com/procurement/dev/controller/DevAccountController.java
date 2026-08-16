package com.procurement.dev.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.dev.dto.DevAccountResponse;
import com.procurement.dev.service.DevAccountService;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Development-only login matrix endpoint. Never enabled in production.
 * <p>
 * Returns grouped dev accounts from the database (including the development
 * passwords) so the login panel can offer one-click sign-in for testing.
 */
@RestController
@RequestMapping("/api/dev/accounts")
@Profile("dev")
public class DevAccountController {

    private final DevAccountService service;

    public DevAccountController(DevAccountService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<Map<String, List<DevAccountResponse>>> devAccounts() {
        return ApiResponse.success(service.devLoginMatrix());
    }
}
