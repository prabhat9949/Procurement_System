package com.procurement.workflow.service;

import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Shared routing helper for every "who gets this task" decision.
 *
 * Tasks are never hard-wired to a single person: any active employee holding
 * the required role is in the flow, and assignments are distributed round-robin
 * using a stable rotation key (typically the PR / entity id). Adding a fifth
 * officer to a team of four simply widens the pool to five — the next task can
 * land on any of them.
 */
@Service
public class TaskRoutingService {

    private final EmployeeRepository employees;
    private final UserRepository users;

    public TaskRoutingService(EmployeeRepository employees, UserRepository users) {
        this.employees = employees;
        this.users = users;
    }

    /** Active employee holding the role, round-robin by rotation key. */
    @Transactional(readOnly = true)
    public Optional<Employee> pickActiveByRole(Long roleId, Long rotationKey) {
        return pickActiveByRole(roleId, rotationKey, null);
    }

    /** Active employee holding the role (excluding one person), round-robin by rotation key. */
    @Transactional(readOnly = true)
    public Optional<Employee> pickActiveByRole(Long roleId, Long rotationKey, Long excludeEmployeeId) {
        if (roleId == null) {
            return Optional.empty();
        }
        List<Employee> candidates = employees.findAllByRoleIdAndActiveTrue(roleId).stream()
                .filter(e -> excludeEmployeeId == null || !e.getId().equals(excludeEmployeeId))
                .filter(e -> users.findByEmployee(e)
                        .map(u -> Boolean.TRUE.equals(u.getEnabled()) && !Boolean.TRUE.equals(u.getAccountLocked()))
                        .orElse(false))
                .sorted(Comparator.comparing(Employee::getId))
                .toList();
        if (candidates.isEmpty()) {
            return Optional.empty();
        }
        int index = rotationKey == null ? 0 : Math.floorMod(rotationKey, candidates.size());
        return Optional.of(candidates.get(index));
    }
}
