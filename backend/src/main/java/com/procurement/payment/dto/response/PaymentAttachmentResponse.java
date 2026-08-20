package com.procurement.payment.dto.response;

import java.time.LocalDateTime;

public record PaymentAttachmentResponse(
        Long id,
        Long paymentId,
        String fileName,
        String filePath,
        String fileType,
        LocalDateTime uploadedAt
) {}
