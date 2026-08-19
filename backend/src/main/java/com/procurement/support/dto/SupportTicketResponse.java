package com.procurement.support.dto;

import java.time.LocalDateTime;

public record SupportTicketResponse(
        Long id,
        String ticketNumber,
        String subject,
        String description,
        String status,
        String priority,
        String category,
        String createdByUsername,
        String createdByName,
        String assignedToUsername,
        long unreadMessages,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
