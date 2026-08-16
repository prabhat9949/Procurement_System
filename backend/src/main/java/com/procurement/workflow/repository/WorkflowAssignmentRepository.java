package com.procurement.workflow.repository;

import com.procurement.workflow.entity.WorkflowAssignment;
import com.procurement.workflow.entity.WorkflowAssignmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowAssignmentRepository extends JpaRepository<WorkflowAssignment, Long> {

    Page<WorkflowAssignment> findByAssignedEmployeeIdAndStatus(Long assignedEmployeeId, WorkflowAssignmentStatus status, Pageable pageable);

    Page<WorkflowAssignment> findByAssignedEmployeeId(Long assignedEmployeeId, Pageable pageable);

    long countByAssignedEmployeeIdAndStatus(Long assignedEmployeeId, WorkflowAssignmentStatus status);

    List<WorkflowAssignment> findByAssignedEmployeeIdAndStatusOrderByAssignedAtAsc(Long assignedEmployeeId, WorkflowAssignmentStatus status);

    List<WorkflowAssignment> findByEntityTypeAndEntityIdOrderByAssignedAtAsc(String entityType, Long entityId);

    List<WorkflowAssignment> findByEntityTypeAndEntityIdAndStatus(String entityType, Long entityId, WorkflowAssignmentStatus status);

    Optional<WorkflowAssignment> findByEntityTypeAndEntityIdAndStatusAndStage(
            String entityType, Long entityId, WorkflowAssignmentStatus status, String stage);

    List<WorkflowAssignment> findByStatus(WorkflowAssignmentStatus status, Pageable pageable);
}
