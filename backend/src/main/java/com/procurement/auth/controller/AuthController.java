package com.procurement.auth.controller;

import com.procurement.auth.dto.ChangePasswordRequest;
import com.procurement.auth.dto.LoginRequest;
import com.procurement.auth.dto.LoginResponse;
import com.procurement.auth.dto.RegisterRequest;
import com.procurement.auth.dto.RegisterResponse;
import com.procurement.auth.service.AuthService;
import com.procurement.security.service.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        // Use a HashMap: Map.of() throws NullPointerException when any value is
        // null (e.g. vendor accounts that have no linked employee record).
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("userId", userDetails.userId());
        result.put("username", userDetails.getUsername());
        result.put("authorities", userDetails.getAuthorities());
        result.put("roleCode", userDetails.roleCode());
        result.put("roleName", userDetails.roleName());
        result.put("displayName", userDetails.displayName());
        result.put("employeeId", authService.employeeIdForUser(userDetails.userId()));
        result.put("departmentId", authService.departmentIdForUser(userDetails.userId()));
        result.put("costCenterId", authService.costCenterIdForUser(userDetails.userId()));
        return result;
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password/admin")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public ResponseEntity<Void> changePasswordAsAdmin(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @Valid @RequestBody com.procurement.auth.dto.AdminChangePasswordRequest request) {
    authService.changePasswordAsAdmin(
            userDetails.getUsername(),
            request.targetUsername(),
            request.newPassword());
    return ResponseEntity.noContent().build();
}

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }
}
