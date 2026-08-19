package com.procurement.support.dto;

import com.procurement.support.entity.SupportTicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSupportTicketRequest(
        @NotBlank @Size(max = 200) String subject,
        @NotBlank @Size(max = 4000) String description,
        SupportTicketPriority priority,
        String category
) {}
