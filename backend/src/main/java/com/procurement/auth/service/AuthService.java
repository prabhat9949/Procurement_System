package com.procurement.auth.service;

import com.procurement.auth.dto.ChangePasswordRequest;
import com.procurement.auth.dto.LoginRequest;
import com.procurement.auth.dto.LoginResponse;
import com.procurement.auth.dto.RegisterRequest;
import com.procurement.auth.dto.RegisterResponse;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.exception.UnauthorizedException;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.event.BusinessEventPublisher;
import com.procurement.event.BusinessEventType;
import com.procurement.notification.entity.NotificationType;
import com.procurement.role.entity.Role;
import com.procurement.role.repository.RoleRepository;
import com.procurement.security.jwt.JwtTokenProvider;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final BusinessEventPublisher eventPublisher;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       UserRepository userRepository,
                       EmployeeRepository employeeRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       BusinessEventPublisher eventPublisher) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username is already registered");
        }

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        if (userRepository.findByEmployee(employee).isPresent()) {
            throw new ConflictException("Employee already has a user account");
        }

        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .employee(employee)
                .role(role)
                .enabled(true)
                .accountLocked(false)
                .build();
        user = userRepository.save(user);
        eventPublisher.publish(
                BusinessEventType.LOGIN,
                "Auth",
                "User",
                user.getId(),
                user.getUsername(),
                "User account registered",
                user.getUsername(),
                NotificationType.SYSTEM
        );
        return new RegisterResponse(user.getId(), user.getUsername());
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        } catch (BadCredentialsException exception) {
            throw new UnauthorizedException("Invalid username or password");
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);

        eventPublisher.publish(
                BusinessEventType.LOGIN,
                "Auth",
                "User",
                user.getId(),
                user.getUsername(),
                "User logged in",
                user.getUsername(),
                NotificationType.SYSTEM
        );

        String token = tokenProvider.generateToken(authentication);
        return new LoginResponse(token, "Bearer", tokenProvider.getExpirationMs(),
                authentication.getName());
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }
}
