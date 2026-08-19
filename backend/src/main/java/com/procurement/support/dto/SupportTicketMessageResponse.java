package com.procurement.support.dto;

import java.time.LocalDateTime;

public record SupportTicketMessageResponse(
        Long id,
        Long ticketId,
        String messageText,
        String senderUsername,
        String senderName,
        String senderRole,
        boolean read,
        LocalDateTime createdAt
) {}
