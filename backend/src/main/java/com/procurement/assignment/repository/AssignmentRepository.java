package com.procurement.assignment.repository;

import com.procurement.assignment.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByAssigneeRoleAndStatus(String assigneeRole, String status);
}
