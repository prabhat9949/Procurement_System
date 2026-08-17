package com.procurement.assignment.service.impl;

import com.procurement.assignment.entity.Assignment;
import com.procurement.assignment.repository.AssignmentRepository;
import com.procurement.assignment.service.AssignmentService;
import com.procurement.purchaserequest.entity.PurchaseRequest;
import com.procurement.purchaserequest.entity.PurchaseRequestStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;

    public AssignmentServiceImpl(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    @Override
    @Transactional
    public void createAssignment(PurchaseRequest purchaseRequest) {
        // Determine assignee role based on purchase request status
        String role;
        if (purchaseRequest.getStatus() == PurchaseRequestStatus.EXTERNAL_PROCUREMENT_REQUIRED) {
            role = "PROCUREMENT_MANAGER"; // assign to procurement manager
        } else if (purchaseRequest.getStatus() == PurchaseRequestStatus.PARTIAL_FULFILMENT_PENDING) {
            // For partial fulfilment, procurement manager handles the external part
            role = "PROCUREMENT_MANAGER";
        } else {
            // No assignment needed for other statuses
            return;
        }

        Assignment assignment = new Assignment();
        assignment.setPurchaseRequestId(purchaseRequest.getId());
        assignment.setAssigneeRole(role);
        assignment.setStatus("PENDING");
        assignmentRepository.save(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Assignment> getPendingAssignmentsByRole(String role) {
        return assignmentRepository.findByAssigneeRoleAndStatus(role, "PENDING");
    }

    @Override
    @Transactional
    public void updateAssignmentStatus(Long assignmentId, String newStatus) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found: " + assignmentId));
        assignment.setStatus(newStatus);
        assignmentRepository.save(assignment);
    }
}
