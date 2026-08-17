package com.procurement.fulfilment.service;

import com.procurement.common.response.PageResponse;
import com.procurement.fulfilment.dto.request.FulfilmentActionRequest;
import com.procurement.fulfilment.dto.request.InitiateFulfilmentRequest;
import com.procurement.fulfilment.dto.response.AvailabilityCheckResponse;
import com.procurement.fulfilment.dto.response.InternalFulfilmentResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InternalFulfilmentService {

    AvailabilityCheckResponse checkAvailability(Long purchaseRequestId);

    List<InternalFulfilmentResponse> initiateFulfilment(Long purchaseRequestId, InitiateFulfilmentRequest request);

    InternalFulfilmentResponse getById(Long id);

    PageResponse<InternalFulfilmentResponse> search(String specializedTeam, String status, Long assignedEmployeeId, Long requesterId, Pageable pageable);

    PageResponse<InternalFulfilmentResponse> getMyTasks(Pageable pageable);

    PageResponse<InternalFulfilmentResponse> getTeamTasks(String teamRole, Pageable pageable);

    InternalFulfilmentResponse confirmStock(Long id, FulfilmentActionRequest request);

    InternalFulfilmentResponse allocateStock(Long id, FulfilmentActionRequest request);

    InternalFulfilmentResponse dispatchStock(Long id, FulfilmentActionRequest request);

    InternalFulfilmentResponse completeFulfilment(Long id, FulfilmentActionRequest request);

    InternalFulfilmentResponse cancelFulfilment(Long id, String reason);
}
