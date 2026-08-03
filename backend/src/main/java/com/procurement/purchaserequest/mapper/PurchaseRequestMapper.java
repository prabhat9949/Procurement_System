package com.procurement.purchaserequest.mapper;

import com.procurement.costcenter.entity.CostCenter;
import com.procurement.department.entity.Department;
import com.procurement.employee.entity.Employee;
import com.procurement.purchaserequest.dto.request.PurchaseRequestRequest;
import com.procurement.purchaserequest.dto.response.PurchaseRequestResponse;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import org.springframework.stereotype.Component;

@Component
public class PurchaseRequestMapper {

    public PurchaseRequest toEntity(PurchaseRequestRequest request, Employee requester,
                                    Department department, CostCenter costCenter) {
        PurchaseRequest entity = new PurchaseRequest();
        updateEntity(entity, request, requester, department, costCenter);
        return entity;
    }

    public void updateEntity(PurchaseRequest entity, PurchaseRequestRequest request,
                             Employee requester, Department department, CostCenter costCenter) {
        entity.setRequester(requester);
        entity.setDepartment(department);
        entity.setCostCenter(costCenter);
        entity.setRequiredDate(request.requiredDate());
        entity.setPriority(request.priority());
        entity.setPurpose(request.purpose());
        entity.setRemarks(request.remarks());
        entity.setEstimatedAmount(request.estimatedAmount());
    }

    public PurchaseRequestResponse toResponse(PurchaseRequest entity) {
        return new PurchaseRequestResponse(
                entity.getId(), entity.getRequestNumber(), entity.getRequestDate(),
                entity.getRequiredDate(), entity.getRequester().getId(),
                entity.getRequester().getFirstName() + " " + entity.getRequester().getLastName(),
                entity.getDepartment().getId(), entity.getDepartment().getDepartmentName(),
                entity.getCostCenter().getId(), entity.getCostCenter().getName(),
                entity.getPriority(), entity.getStatus(), entity.getApprovalStatus(),
                entity.getPurpose(), entity.getRemarks(), entity.getEstimatedAmount(),
                entity.getCreatedBy(), entity.getUpdatedBy(), entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
