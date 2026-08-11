package com.procurement.security.config;

import com.procurement.security.jwt.JwtAuthenticationFilter;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final List<String> allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint authenticationEntryPoint,
            @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:4200,http://localhost:5173}") String allowedOrigins
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthenticationProvider authenticationProvider
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(authenticationEntryPoint))

                .authenticationProvider(authenticationProvider)

                .authorizeHttpRequests(authorize -> authorize

                        // ===========================
                        // PUBLIC ENDPOINTS
                        // ===========================
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                        .requestMatchers(
                                // Swagger UI
                                "/swagger-ui/**",
                                "/swagger-ui.html",

                                // OpenAPI
                                "/v3/api-docs/**",
                                "/v3/api-docs",

                                // Actuator
                                "/actuator/health",
                                "/actuator/info",

                                // Error
                                "/error"

                        ).permitAll()

                        // ===========================
                        // AUTHENTICATED AUTH ENDPOINTS
                        // ===========================
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/me",
                                "/api/auth/change-password",
                                "/api/auth/logout"
                        ).authenticated()

                        // ===========================
                        // HR / IDENTITY
                        // ===========================
                        // Any authenticated user may view their own employee profile.
                        .requestMatchers(
                                "/api/employees/me"
                        ).authenticated()

                        .requestMatchers(
                                "/api/employees/**",
                                "/api/departments/**",
                                "/api/cost-centers/**",
                                "/api/roles/**",
                                "/api/permissions/**",
                                "/api/role-permissions/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER", "EMPLOYEE")

                        .requestMatchers(
                                "/api/users/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER")

                        // ===========================
                        // MASTER DATA
                        // ===========================
                        .requestMatchers(
                                "/api/vendor/my/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "VENDOR")

                        .requestMatchers(
                                "/api/vendors/**",
                                "/api/categories/**",
                                "/api/uoms/**",
                                "/api/products/**",
                                "/api/warehouses/**",
                                "/api/inventory/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "WAREHOUSE_MANAGER", "EMPLOYEE")

                        // ===========================
                        // PROCUREMENT WORKFLOW
                        // ===========================
                        .requestMatchers(
                                "/api/purchase-requests/**",
                                "/api/purchase-request-lines/**",
                                "/api/approval-rules/**",
                                "/api/approval-stages/**",
                                "/api/approval-tasks/**",
                                "/api/approval-histories/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "EMPLOYEE", "DEPARTMENT_MANAGER", "SENIOR_MANAGER", "HEAD", "EQUIPMENT_ASSET_TEAM", "IT_SOFTWARE_TEAM", "FACILITIES_TEAM")

                        .requestMatchers(
                                "/api/rfqs/**",
                                "/api/rfq-lines/**",
                                "/api/rfq-vendors/**",
                                "/api/vendor-quotations/**",
                                "/api/vendor-quotation-lines/**",
                                "/api/quotation-comparisons/**",
                                "/api/quotation-comparison-lines/**",
                                "/api/quotation-attachments/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "VENDOR")

                        .requestMatchers(
                                "/api/purchase-orders/**",
                                "/api/purchase-order-lines/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "FINANCE_MANAGER", "WAREHOUSE_MANAGER", "VENDOR", "EQUIPMENT_ASSET_TEAM", "IT_SOFTWARE_TEAM", "FACILITIES_TEAM", "EMPLOYEE", "DEPARTMENT_MANAGER", "SENIOR_MANAGER", "HEAD")

                        .requestMatchers(
                                "/api/goods-receipts/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "WAREHOUSE_MANAGER", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "EQUIPMENT_ASSET_TEAM", "IT_SOFTWARE_TEAM", "FACILITIES_TEAM")

                        .requestMatchers(
                                "/api/invoices/**",
                                "/api/three-way-matches/**",
                                "/api/payments/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "FINANCE_MANAGER", "PROCUREMENT_MANAGER")

                        // ===========================
                        // NOTIFICATIONS / REPORTING / AUDIT
                        // ===========================
                        .requestMatchers(
                                "/api/notification-templates/**",
                                "/api/audit-logs/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "AUDITOR", "COMPLIANCE_OFFICER")

                        .requestMatchers(
                                "/api/notifications/**",
                                "/api/notification-preferences/**"
                        ).authenticated()

                        .requestMatchers(
                                "/api/dashboard/admin"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "AUDITOR")

                        .requestMatchers(
                                "/api/dashboard/procurement"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER")

                        .requestMatchers(
                                "/api/dashboard/finance"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "FINANCE_MANAGER")

                        .requestMatchers(
                                "/api/dashboard/warehouse"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "WAREHOUSE_MANAGER")

                        .requestMatchers(
                                "/api/dashboard/vendor"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "VENDOR")

                        .requestMatchers(
                                "/api/dashboard/hr"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER")

                        .requestMatchers(
                                "/api/dashboard/employee"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "EMPLOYEE")

                        .requestMatchers(
                                "/api/dashboard/charts/**"
                        ).authenticated()

                        .requestMatchers(
                                "/api/reports/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "AUDITOR", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "FINANCE_MANAGER", "WAREHOUSE_MANAGER")

                        // ===========================
                        // PROTECTED ENDPOINTS
                        // ===========================
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "X-Request-Id"));
        configuration.setExposedHeaders(List.of("X-Request-Id"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {

        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }
}
