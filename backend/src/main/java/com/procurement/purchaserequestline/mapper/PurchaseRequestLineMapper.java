package com.procurement.purchaserequestline.mapper;

import com.procurement.product.entity.Product;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequestline.dto.request.PurchaseRequestLineRequest;
import com.procurement.purchaserequestline.dto.response.PurchaseRequestLineResponse;
import com.procurement.purchaserequestline.entity.PurchaseRequestLine;
import org.springframework.stereotype.Component;

@Component
public class PurchaseRequestLineMapper {

    public PurchaseRequestLine toEntity(PurchaseRequestLineRequest request,
                                        PurchaseRequest purchaseRequest, Product product) {
        PurchaseRequestLine line = new PurchaseRequestLine();
        updateEntity(line, request, purchaseRequest, product);
        return line;
    }

    public void updateEntity(PurchaseRequestLine line, PurchaseRequestLineRequest request,
                             PurchaseRequest purchaseRequest, Product product) {
        line.setPurchaseRequest(purchaseRequest);
        line.setProduct(product);
        line.setQuantity(request.quantity());
        line.setUnitPrice(request.unitPrice());
        line.setEstimatedAmount(request.quantity().multiply(request.unitPrice()));
        line.setRemarks(request.remarks());
    }

    public PurchaseRequestLineResponse toResponse(PurchaseRequestLine line) {
        return new PurchaseRequestLineResponse(
                line.getId(), line.getPurchaseRequest().getId(),
                line.getPurchaseRequest().getRequestNumber(), line.getProduct().getId(),
                line.getProduct().getProductCode(), line.getProduct().getProductName(),
                line.getQuantity(), line.getUnitPrice(), line.getEstimatedAmount(),
                line.getRemarks(), line.getCreatedAt(), line.getUpdatedAt());
    }
}
