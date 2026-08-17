package com.procurement.assignment.service;

import com.procurement.purchaserequest.entity.PurchaseRequest;
import java.util.List;

public interface AssignmentService {
    /**
     * Create an assignment based on the purchase request's status and category.
     * The implementation decides which role should handle the request.
     */
    void createAssignment(PurchaseRequest purchaseRequest);

    /**
     * Retrieve pending assignments for a given assignee role.
     */
    List<com.procurement.assignment.entity.Assignment> getPendingAssignmentsByRole(String role);

    /**
     * Update the status of an existing assignment.
     */
    void updateAssignmentStatus(Long assignmentId, String newStatus);
}
