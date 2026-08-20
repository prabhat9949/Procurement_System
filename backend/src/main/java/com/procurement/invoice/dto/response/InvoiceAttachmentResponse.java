package com.procurement.invoice.dto.response;

import java.time.LocalDateTime;

public record InvoiceAttachmentResponse(
        Long id,
        Long invoiceId,
        String fileName,
        String filePath,
        String fileType,
        LocalDateTime uploadedAt
) {}
