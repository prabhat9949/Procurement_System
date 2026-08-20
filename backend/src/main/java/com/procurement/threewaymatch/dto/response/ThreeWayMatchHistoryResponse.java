package com.procurement.threewaymatch.dto.response;

import com.procurement.threewaymatch.entity.ThreeWayMatchStatus;

import java.time.LocalDateTime;

public record ThreeWayMatchHistoryResponse(
        Long id,
        Long threeWayMatchId,
        String action,
        String performedBy,
        ThreeWayMatchStatus oldStatus,
        ThreeWayMatchStatus newStatus,
        String remarks,
        LocalDateTime performedAt
) {}
