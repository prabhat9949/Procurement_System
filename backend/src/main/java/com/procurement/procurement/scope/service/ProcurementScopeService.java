package com.procurement.procurement.scope.service;

import com.procurement.procurement.scope.dto.response.ProcurementScopeResponse;
import com.procurement.procurement.scope.repository.OfficerCategoryScopeRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Resolves the authenticated user's procurement category scope from the
 * database. Used by the RFQ / PO / PR search services to enforce per-officer
 * scoping server-side — the backend is the single source of truth.
 */
@Service
public class ProcurementScopeService {

    private static final Set<String> OFFICER_ROLES =
            Set.of("PROCUREMENT_MANAGER", "PROCUREMENT_OFFICER");

    private final UserRepository users;
    private final OfficerCategoryScopeRepository scopes;

    public ProcurementScopeService(UserRepository users, OfficerCategoryScopeRepository scopes) {
        this.users = users;
        this.scopes = scopes;
    }

    private String username() {
        var a = SecurityContextHolder.getContext().getAuthentication();
        return a == null ? "system" : a.getName();
    }

    @Transactional(readOnly = true)
    public boolean isProcurementOfficer() {
        return users.findByUsername(username())
                .map(u -> u.getRole() != null && OFFICER_ROLES.contains(u.getRole().getRoleCode()))
                .orElse(false);
    }

    /**
     * Category ids the current user is scoped to. Empty means "no scope":
     * either the user is not a procurement officer, or the officer has no
     * configured scope and therefore sees all categories.
     */
    @Transactional(readOnly = true)
    public List<Long> myCategoryIds() {
        if (!isProcurementOfficer()) return List.of();
        var emp = users.findByUsername(username()).map(User::getEmployee).orElse(null);
        if (emp == null) return List.of();
        return scopes.findByEmployeeIdAndActiveTrue(emp.getId())
                .stream()
                .map(s -> s.getCategory().getId())
                .toList();
    }

    @Transactional(readOnly = true)
    public ProcurementScopeResponse myScope() {
        var user = users.findByUsername(username()).orElse(null);
        boolean officer = user != null && user.getRole() != null
                && OFFICER_ROLES.contains(user.getRole().getRoleCode());
        if (!officer || user.getEmployee() == null) {
            return new ProcurementScopeResponse(
                    null, null, user == null || user.getRole() == null ? null : user.getRole().getRoleCode(),
                    user == null || user.getRole() == null ? null : user.getRole().getRoleName(),
                    false, List.of(), List.of());
        }
        var emp = user.getEmployee();
        var rows = scopes.findByEmployeeIdAndActiveTrue(emp.getId());
        var categoryIds = rows.stream().map(s -> s.getCategory().getId()).toList();
        var categoryNames = rows.stream().map(s -> s.getCategory().getCategoryName()).toList();
        return new ProcurementScopeResponse(
                emp.getId(),
                emp.getFirstName() + " " + (emp.getLastName() == null ? "" : emp.getLastName()),
                user.getRole().getRoleCode(), user.getRole().getRoleName(),
                !categoryIds.isEmpty(), categoryIds, categoryNames);
    }
}
