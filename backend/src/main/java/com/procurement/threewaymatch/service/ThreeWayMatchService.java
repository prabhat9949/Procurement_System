package com.procurement.threewaymatch.service;

import com.procurement.common.response.PageResponse;
import com.procurement.threewaymatch.dto.request.ThreeWayMatchRequest;
import com.procurement.threewaymatch.dto.response.*;
import com.procurement.threewaymatch.entity.ThreeWayMatchStatus;
import org.springframework.data.domain.Pageable;

public interface ThreeWayMatchService {
    ThreeWayMatchResponse create(ThreeWayMatchRequest request);
    PageResponse<ThreeWayMatchResponse> search(String keyword, Long vendorId, ThreeWayMatchStatus status, Pageable pageable);
    ThreeWayMatchResponse get(Long id);
    ThreeWayMatchResponse generate(Long id);
    ThreeWayMatchResponse approve(Long id);
    ThreeWayMatchResponse reject(Long id);
    PageResponse<ThreeWayMatchLineResponse> lines(Long id, Pageable pageable);
    ThreeWayMatchLineResponse getLine(Long id);
    PageResponse<ThreeWayMatchHistoryResponse> history(Long id, Pageable pageable);
}
