package com.procurement.assignment.controller;

import com.procurement.assignment.entity.Assignment;
import com.procurement.assignment.service.AssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    /**
     * Retrieve pending assignments for a given role, optionally filtered by status.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('PROCUREMENT','FACILITIES','EQUIPMENT_ASSET_TEAM','IT_SOFTWARE_TEAM','WAREHOUSE')")
    public ResponseEntity<List<Assignment>> getAssignments(
            @RequestParam String role,
            @RequestParam(required = false) String status) {
        List<Assignment> assignments = assignmentService.getPendingAssignmentsByRole(role);
        if (status != null) {
            assignments = assignments.stream()
                    .filter(a -> status.equalsIgnoreCase(a.getStatus()))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(assignments);
    }

    /**
     * Update the status of an assignment.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('PROCUREMENT','FACILITIES','EQUIPMENT_ASSET_TEAM','IT_SOFTWARE_TEAM','WAREHOUSE')")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestParam String newStatus) {
        assignmentService.updateAssignmentStatus(id, newStatus);
        return ResponseEntity.noContent().build();
    }
}
