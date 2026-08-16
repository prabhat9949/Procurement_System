package com.procurement.role.service;

import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.permission.entity.Permission;
import com.procurement.permission.repository.PermissionRepository;
import com.procurement.role.dto.request.RoleRequest;
import com.procurement.role.dto.response.RoleResponse;
import com.procurement.role.entity.Role;
import com.procurement.role.entity.RolePermission;
import com.procurement.role.repository.RolePermissionRepository;
import com.procurement.role.repository.RoleRepository;
import com.procurement.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public RoleService(RoleRepository roleRepository,
                       RolePermissionRepository rolePermissionRepository,
                       PermissionRepository permissionRepository,
                       UserRepository userRepository,
                       AuditLogService auditLogService) {
        this.roleRepository = roleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public RoleResponse create(RoleRequest request) {
        if (roleRepository.existsByRoleCode(request.roleCode())) {
            throw new ConflictException("Role code is already registered: " + request.roleCode());
        }
        if (roleRepository.existsByRoleName(request.roleName())) {
            throw new ConflictException("Role name is already registered: " + request.roleName());
        }
        Role role = new Role();
        role.setRoleCode(request.roleCode().trim().toUpperCase());
        role.setRoleName(request.roleName().trim());
        role.setDescription(request.description());
        role.setSystemRole(Boolean.TRUE.equals(request.systemRole()));
        role.setActive(request.active() == null || request.active());
        Role saved = roleRepository.save(role);
        assignPermissions(saved, request.permissionIds());
        auditLogService.record("Role", "Role", saved.getId(), "CREATE", saved.getRoleCode(), "ROLE",
                true, null, roleDetails(saved), "Role created by admin");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<RoleResponse> search(String keyword, Boolean active, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Role> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("roleCode")), like),
                        cb.like(cb.lower(root.get("roleName")), like)
                ));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        Page<RoleResponse> page = roleRepository.findAll(spec, pageable).map(this::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> listAll() {
        return roleRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public RoleResponse getById(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public RoleResponse update(Long id, RoleRequest request) {
        Role role = find(id);
        if (request.roleCode() != null && !request.roleCode().isBlank()
                && !role.getRoleCode().equalsIgnoreCase(request.roleCode())
                && roleRepository.existsByRoleCode(request.roleCode())) {
            throw new ConflictException("Role code is already registered: " + request.roleCode());
        }
        if (request.roleName() != null && !request.roleName().isBlank()
                && !role.getRoleName().equalsIgnoreCase(request.roleName())
                && roleRepository.existsByRoleName(request.roleName())) {
            throw new ConflictException("Role name is already registered: " + request.roleName());
        }
        String oldDetails = roleDetails(role);
        if (request.roleCode() != null && !request.roleCode().isBlank()) {
            role.setRoleCode(request.roleCode().trim().toUpperCase());
        }
        if (request.roleName() != null && !request.roleName().isBlank()) {
            role.setRoleName(request.roleName().trim());
        }
        role.setDescription(request.description());
        if (request.active() != null && !request.active()) {
            if (Boolean.TRUE.equals(role.getSystemRole())) {
                throw new ConflictException("System roles cannot be deactivated");
            }
            long assignedUsers = userRepository.countByRoleId(role.getId());
            if (assignedUsers > 0) {
                throw new ConflictException(
                        "Role is assigned to " + assignedUsers
                                + " user(s). Reassign those users before deactivating this role.");
            }
        }
        if (request.active() != null) {
            role.setActive(request.active());
        }
        if (request.permissionIds() != null) {
            assignPermissions(role, request.permissionIds());
        }
        Role saved = roleRepository.save(role);
        auditLogService.record("Role", "Role", saved.getId(), "UPDATE", saved.getRoleCode(), "ROLE",
                true, oldDetails, roleDetails(saved), "Role updated by admin");
        return toResponse(saved);
    }

    @Transactional
    public RoleResponse setPermissions(Long id, List<Long> permissionIds) {
        Role role = find(id);
        assignPermissions(role, permissionIds);
        Role saved = roleRepository.save(role);
        auditLogService.record("Role", "Role", saved.getId(), "PERMISSIONS_UPDATED", saved.getRoleCode(), "ROLE",
                true, null, "permissionIds=" + permissionIds, "Role permissions assigned by admin");
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Role role = find(id);
        if (Boolean.TRUE.equals(role.getSystemRole())) {
            throw new ConflictException("System roles cannot be deleted");
        }
        long users = userRepository.countByRoleId(id);
        if (users > 0) {
            throw new ConflictException("Role is assigned to " + users + " user(s) and cannot be deleted");
        }
        rolePermissionRepository.deleteAll(rolePermissionRepository.findWithPermissionsByRoleId(id));
        roleRepository.delete(role);
        auditLogService.record("Role", "Role", id, "DELETE", role.getRoleCode(), "ROLE",
                true, roleDetails(role), null, "Role deleted by admin");
    }

    /**
     * Logical permission dependencies: assigning the key permission automatically
     * includes the required permissions so impossible configurations cannot be saved.
     */
    private static final java.util.Map<String, java.util.List<String>> PERMISSION_DEPENDENCIES =
            java.util.Map.ofEntries(
                    java.util.Map.entry("CAN_APPROVE_PR", java.util.List.of("CAN_VIEW_ASSIGNED_APPROVAL")),
                    java.util.Map.entry("CAN_REJECT_PR", java.util.List.of("CAN_VIEW_ASSIGNED_APPROVAL")),
                    java.util.Map.entry("CAN_RETURN_PR", java.util.List.of("CAN_VIEW_ASSIGNED_APPROVAL")),
                    java.util.Map.entry("CAN_SELECT_VENDOR", java.util.List.of("CAN_VIEW_QUOTATIONS")),
                    java.util.Map.entry("CAN_CREATE_PO", java.util.List.of("CAN_VIEW_PO")),
                    java.util.Map.entry("CAN_APPROVE_PO", java.util.List.of("CAN_VIEW_PO")),
                    java.util.Map.entry("CAN_CREATE_GRN", java.util.List.of("CAN_VIEW_PO")),
                    java.util.Map.entry("CAN_VERIFY_GRN", java.util.List.of("CAN_VIEW_PO")),
                    java.util.Map.entry("CAN_UPLOAD_INVOICE", java.util.List.of("CAN_VIEW_INVOICE")),
                    java.util.Map.entry("CAN_VERIFY_INVOICE", java.util.List.of("CAN_VIEW_INVOICE")),
                    java.util.Map.entry("CAN_THREE_WAY_MATCH", java.util.List.of("CAN_VIEW_INVOICE")),
                    java.util.Map.entry("CAN_PROCESS_PAYMENT", java.util.List.of("CAN_VIEW_PAYMENT")));

    private void assignPermissions(Role role, List<Long> permissionIds) {
        if (permissionIds == null) {
            return;
        }
        rolePermissionRepository.deleteAll(rolePermissionRepository.findWithPermissionsByRoleId(role.getId()));
        if (permissionIds.isEmpty()) {
            return;
        }
        java.util.LinkedHashSet<Long> expanded = new java.util.LinkedHashSet<>(permissionIds);
        List<Permission> selected = permissionRepository.findAllById(permissionIds);
        // Auto-include required dependencies so the saved set is always valid.
        for (Permission permission : selected) {
            java.util.List<String> required = PERMISSION_DEPENDENCIES.get(permission.getPermissionCode());
            if (required == null) {
                continue;
            }
            for (String code : required) {
                permissionRepository.findByPermissionCode(code)
                        .filter(p -> Boolean.TRUE.equals(p.getActive()))
                        .ifPresent(p -> expanded.add(p.getId()));
            }
        }
        List<Permission> permissions = permissionRepository.findAllById(expanded);
        List<RolePermission> mappings = permissions.stream()
                .map(p -> RolePermission.builder().role(role).permission(p).build())
                .toList();
        rolePermissionRepository.saveAll(mappings);
    }

    private Role find(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
    }

    private RoleResponse toResponse(Role role) {
        List<Long> permissionIds = rolePermissionRepository.findWithPermissionsByRoleId(role.getId())
                .stream().map(rp -> rp.getPermission().getId()).toList();
        long userCount = userRepository.countByRoleId(role.getId());
        return new RoleResponse(role.getId(), role.getRoleCode(), role.getRoleName(),
                role.getDescription(), role.getSystemRole(), role.getActive(),
                userCount, permissionIds, role.getCreatedAt(), role.getUpdatedAt());
    }

    private String roleDetails(Role role) {
        return "{code=" + role.getRoleCode() + ", name=" + role.getRoleName()
                + ", description=" + role.getDescription() + ", active=" + role.getActive() + "}";
    }
}
