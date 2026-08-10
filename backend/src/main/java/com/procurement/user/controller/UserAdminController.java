package com.procurement.user.controller;

import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.ApiResponse;
import com.procurement.user.dto.request.AdminUserCredentialUpdateRequest;
import com.procurement.user.dto.response.UserAccountResponse;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','HR_MANAGER')")
public class UserAdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAdminController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ApiResponse<List<UserAccountResponse>> listUsers() {
        return ApiResponse.success(userRepository.findAll().stream()
                .map(this::toResponse)
                .toList());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ApiResponse<UserAccountResponse> getUser(@PathVariable Long id) {
        return ApiResponse.success(toResponse(findUser(id)));
    }

    @PutMapping("/{id}/credentials")
    @Transactional
    public ApiResponse<UserAccountResponse> updateCredentials(
            @PathVariable Long id,
            @Valid @RequestBody AdminUserCredentialUpdateRequest request) {
        User user = findUser(id);

        if (request.username() != null && !request.username().isBlank()
                && !request.username().equalsIgnoreCase(user.getUsername())
                && userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username is already registered");
        }

        if (request.username() != null && !request.username().isBlank()) {
            user.setUsername(request.username().trim());
        }
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.newPassword()));
            user.setPlainPassword(request.newPassword());
        }
        if (request.enabled() != null) {
            user.setEnabled(request.enabled());
        }
        if (request.accountLocked() != null) {
            user.setAccountLocked(request.accountLocked());
        }

        return ApiResponse.success("User credentials updated successfully", toResponse(userRepository.save(user)));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserAccountResponse toResponse(User user) {
        return new UserAccountResponse(
                user.getId(),
                user.getUsername(),
                user.getPlainPassword(),
                user.getEnabled(),
                user.getAccountLocked(),
                user.getRole().getRoleCode(),
                user.getRole().getRoleName(),
                user.getEmployee().getId(),
                user.getEmployee().getEmployeeCode(),
                user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName(),
                user.getEmployee().getEmail(),
                user.getLastLogin(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
