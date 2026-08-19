package com.procurement.externalprocurement.service;

import com.procurement.common.exception.BadRequestException;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.rfq.dto.request.RfqRequest;
import com.procurement.rfq.dto.response.RfqResponse;
import com.procurement.rfq.service.RfqService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class ExternalProcurementServiceImpl implements ExternalProcurementService {

    private final RfqService rfqService;
    private final PurchaseRequestRepository purchaseRequestRepository;

    public ExternalProcurementServiceImpl(RfqService rfqService,
                                         PurchaseRequestRepository purchaseRequestRepository) {
        this.rfqService = rfqService;
        this.purchaseRequestRepository = purchaseRequestRepository;
    }

    @Override
    @Transactional
    public RfqResponse startExternalProcurement(Long purchaseRequestId, RfqRequest rfqRequest) {
        PurchaseRequest pr = purchaseRequestRepository.findById(purchaseRequestId)
                .orElseThrow(() -> new BadRequestException("Purchase request not found: " + purchaseRequestId));

        // Ensure the PR is in a state that requires external procurement
        if (pr.getStatus() != PurchaseRequestStatus.EXTERNAL_PROCUREMENT_REQUIRED &&
                pr.getStatus() != PurchaseRequestStatus.PARTIAL_FULFILMENT_PENDING) {
            throw new BadRequestException("Purchase request is not in external procurement required state.");
        }

        // The RfqRequest already carries the purchaseRequestId; ensure it matches
        if (!purchaseRequestId.equals(rfqRequest.purchaseRequestId())) {
            throw new BadRequestException("Path PR ID does not match request body purchaseRequestId.");
        }

        // Delegate to existing RFQ service to create the RFQ
        return rfqService.generate(rfqRequest);
    }
}
