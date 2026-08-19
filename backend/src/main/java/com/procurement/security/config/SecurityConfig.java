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

                                // Dev login matrix (dev profile only)
                                "/api/dev/accounts",

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

                        // ===========================
                        // ROLE-BASED ACCESS USING PRIMARY ROLES
                        // ===========================
                        // All endpoint access is determined by the user's current primary role
                        // and per-record permissions enforced in the service layer.

                        // ADMIN/HR has full access to identity endpoints
                        .requestMatchers(
                                "/api/employees/**",
                                "/api/departments/**",
                                "/api/cost-centers/**",
                                "/api/roles/**",
                                "/api/permissions/**",
                                "/api/role-permissions/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER")

                        .requestMatchers(
                                "/api/users/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER")

                        // ===========================
                        // MASTER DATA - scoped by role
                        // ===========================
                        // Vendor self-service portal
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
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER", "EMPLOYEE", "DEPARTMENT_MANAGER", "SENIOR_MANAGER", "HEAD", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "EQUIPMENT_ASSET_TEAM", "WAREHOUSE_MANAGER", "FINANCE_MANAGER", "AUDITOR", "SUPPORT_TEAM")

                        // ===========================
                        // PROCUREMENT WORKFLOW
                        // ===========================
                        // Purchase requests and approval workflow
                        .requestMatchers(
                                "/api/purchase-requests/**",
                                "/api/purchase-request-lines/**",
                                "/api/approval-rules/**",
                                "/api/approval-stages/**",
                                "/api/approval-tasks/**",
                                "/api/approval-histories/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER", "EMPLOYEE", "DEPARTMENT_MANAGER", "SENIOR_MANAGER", "HEAD", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "AUDITOR", "FINANCE_MANAGER", "EQUIPMENT_ASSET_TEAM", "WAREHOUSE_MANAGER")

                        // Central workflow assignment engine: queues and task actions are
                        // authorized per-assignment in the service layer (current assignee,
                        // requester, or admin) — never by role alone.
                        .requestMatchers(
                                "/api/workflow/**"
                        ).authenticated()

                        // RFQ, quotations, quotation comparison
                        .requestMatchers(
                                "/api/rfqs/**",
                                "/api/rfq-lines/**",
                                "/api/rfq-vendors/**",
                                "/api/vendor-quotations/**",
                                "/api/vendor-quotation-lines/**",
                                "/api/quotation-comparisons/**",
                                "/api/quotation-comparison-lines/**",
                                "/api/quotation-attachments/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "VENDOR", "EMPLOYEE", "DEPARTMENT_MANAGER", "SENIOR_MANAGER", "HEAD")

                        // Purchase orders - scoped by role
                        .requestMatchers(
                                "/api/purchase-orders/**",
                                "/api/purchase-order-lines/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER", "EMPLOYEE", "DEPARTMENT_MANAGER", "SENIOR_MANAGER", "HEAD", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "EQUIPMENT_ASSET_TEAM", "WAREHOUSE_MANAGER", "FINANCE_MANAGER", "VENDOR", "AUDITOR")

                        // Goods receipts
                        .requestMatchers(
                                "/api/goods-receipts/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "EQUIPMENT_ASSET_TEAM", "WAREHOUSE_MANAGER", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "FINANCE_MANAGER", "AUDITOR")

                        // Invoices, three-way matches, payments
                        .requestMatchers(
                                "/api/invoices/**",
                                "/api/three-way-matches/**",
                                "/api/payments/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "FINANCE_MANAGER", "AUDITOR", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER")

                        // ===========================
                        // NOTIFICATIONS / REPORTING / AUDIT
                        // ===========================
                        .requestMatchers(
                                "/api/notification-templates/**",
                                "/api/audit-logs/**",
                                "/api/audits/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "AUDITOR", "FINANCE_MANAGER")

                        .requestMatchers(
                                "/api/notifications/**",
                                "/api/notification-preferences/**"
                        ).authenticated()

                        // ===========================
                        // SUPPORT TICKETS
                        // ===========================
                        .requestMatchers(
                                "/api/support-tickets/**"
                        ).authenticated()

                        // Admin dashboard - only SUPER_ADMIN and AUDITOR
                        .requestMatchers(
                                "/api/dashboard/admin"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "AUDITOR")

                        // Procurement workspace + the unified PR timeline.
                        // Per-record visibility is enforced in the service layer.
                        .requestMatchers(
                                "/api/dashboard/procurement",
                                "/api/procurement/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER", "EMPLOYEE", "DEPARTMENT_MANAGER", "SENIOR_MANAGER", "HEAD", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "AUDITOR", "FINANCE_MANAGER", "EQUIPMENT_ASSET_TEAM", "WAREHOUSE_MANAGER")

                        .requestMatchers(
                                "/api/dashboard/finance"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "FINANCE_MANAGER", "AUDITOR", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER")

                        .requestMatchers(
                                "/api/dashboard/warehouse"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "EQUIPMENT_ASSET_TEAM", "WAREHOUSE_MANAGER", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "FINANCE_MANAGER", "AUDITOR")

                        .requestMatchers(
                                "/api/dashboard/vendor"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "VENDOR")

                        .requestMatchers(
                                "/api/dashboard/hr",
                                "/api/hr/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER")

                        .requestMatchers(
                                "/api/dashboard/employee"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "EMPLOYEE")

                        .requestMatchers(
                                "/api/dashboard/charts/**"
                        ).authenticated()

                        .requestMatchers(
                                "/api/reports/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "HR_MANAGER", "AUDITOR", "PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER", "FINANCE_MANAGER", "EQUIPMENT_ASSET_TEAM", "WAREHOUSE_MANAGER")

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
