package com.procurement.config;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Enterprise Procurement System API",
                version = "1.0.0",
                description = """
                        Enterprise Procurement System Backend APIs.

                        Modules Included:
                        • Authentication
                        • Employee Management
                        • Vendor Management
                        • Product Management
                        • Purchase Requests
                        • RFQ
                        • Purchase Orders
                        • Goods Receipt
                        • Inventory
                        • Invoice
                        • Payments
                        • Reports
                        • Dashboard
                        • Audit Logs
                        """,
                contact = @Contact(
                        name = "Enterprise Procurement Development Team",
                        email = "support@procurement.local"
                ),
                license = @License(
                        name = "Internal Enterprise Project"
                )
        ),
        security = @SecurityRequirement(name = "Bearer Authentication")
)

@SecurityScheme(
        name = "Bearer Authentication",
        description = "Enter JWT Bearer Token",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)

public class OpenApiConfig {
}