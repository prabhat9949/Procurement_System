package com.procurement.externalprocurement.service;

import com.procurement.rfq.dto.request.RfqRequest;
import com.procurement.rfq.dto.response.RfqResponse;

public interface ExternalProcurementService {
    /**
     * Starts the external procurement process for a given purchase request.
     * It creates an RFQ using the existing RfqService.
     *
     * @param purchaseRequestId the PR id that requires external procurement
     * @param rfqRequest the RFQ details (closing/quotation dates, currency, remarks)
     * @return the created {@link RfqResponse}
     */
    RfqResponse startExternalProcurement(Long purchaseRequestId, RfqRequest rfqRequest);
}
