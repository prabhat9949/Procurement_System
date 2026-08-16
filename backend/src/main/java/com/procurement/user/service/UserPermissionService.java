package com.procurement.user.service;

import com.procurement.auditlog.service.AuditLogService;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.permission.entity.Permission;
import com.procurement.permission.repository.PermissionRepository;
import com.procurement.role.entity.RolePermission;
import com.procurement.role.repository.RolePermissionRepository;
import com.procurement.user.dto.request.UserPermissionItem;
import com.procurement.user.dto.response.EffectivePermissionResponse;
import com.procurement.user.dto.response.UserPermissionOverrideResponse;
import com.procurement.user.entity.PermissionAccess;
import com.procurement.user.entity.User;
import com.procurement.user.entity.UserPermission;
import com.procurement.user.repository.UserPermissionRepository;
import com.procurement.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * User-specific permission overrides (GRANT / DENY on top of the role's default
 * permission set). Effective permission = role permission + ALLOW overrides
 * − DENY overrides, with DENY taking highest precedence.
 */
@Service
public class UserPermissionService {

    private final UserRepository userRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final AuditLogService auditLogService;

    public UserPermissionService(UserRepository userRepository,
                                 UserPermissionRepository userPermissionRepository,
                                 PermissionRepository permissionRepository,
                                 RolePermissionRepository rolePermissionRepository,
                                 AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.userPermissionRepository = userPermissionRepository;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<UserPermissionOverrideResponse> getOverrides(Long userId) {
        return userPermissionRepository.findWithPermissionsByUserId(userId).stream()
                .sorted(Comparator.comparing(up -> up.getPermission().getPermissionCode()))
                .map(up -> new UserPermissionOverrideResponse(
                        up.getPermission().getId(),
                        up.getPermission().getPermissionCode(),
                        up.getPermission().getPermissionName(),
                        up.getPermission().getModuleName(),
                        up.getAccess(),
                        up.getReason()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EffectivePermissionResponse> effectivePermissions(Long userId) {
        User user = findUser(userId);
        Map<Long, Permission> rolePermissions = new HashMap<>();
        for (RolePermission rp : rolePermissionRepository.findWithPermissionsByRoleId(user.getRole().getId())) {
            rolePermissions.put(rp.getPermission().getId(), rp.getPermission());
        }
        Map<Long, UserPermission> overrides = userPermissionRepository
                .findWithPermissionsByUserId(userId).stream()
                .collect(Collectors.toMap(up -> up.getPermission().getId(), up -> up));

        return permissionRepository.findAll().stream()
                .sorted(Comparator.comparing(Permission::getModuleName)
                        .thenComparing(Permission::getPermissionCode))
                .map(p -> {
                    boolean fromRole = rolePermissions.containsKey(p.getId());
                    UserPermission override = overrides.get(p.getId());
                    boolean allowed;
                    String source = "ROLE";
                    if (override != null) {
                        source = "USER_OVERRIDE";
                        allowed = override.getAccess() == PermissionAccess.ALLOW;
                    } else {
                        allowed = fromRole;
                    }
                    return new EffectivePermissionResponse(
                            p.getId(),
                            p.getPermissionCode(),
                            p.getPermissionName(),
                            p.getModuleName(),
                            allowed,
                            source,
                            override != null);
                })
                .toList();
    }

    @Transactional
    public List<EffectivePermissionResponse> saveOverrides(Long userId,
                                                           List<UserPermissionItem> items,
                                                           String actor) {
        User user = findUser(userId);
        List<UserPermission> existing = userPermissionRepository.findWithPermissionsByUserId(userId);
        Map<Long, UserPermission> existingByPermission = existing.stream()
                .collect(Collectors.toMap(up -> up.getPermission().getId(), up -> up));

        // Resolve final map (permissionId → access); null access removes the override.
        Map<Long, PermissionAccess> finalState = new HashMap<>();
        for (UserPermissionItem item : items) {
            Permission permission = permissionRepository.findById(item.permissionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + item.permissionId()));
            if (!Boolean.TRUE.equals(permission.getActive())) {
                throw new com.procurement.common.exception.ConflictException(
                        "Inactive permissions cannot be assigned: " + permission.getPermissionCode());
            }
            if (item.access() == PermissionAccess.ALLOW || item.access() == PermissionAccess.DENY) {
                finalState.put(item.permissionId(), item.access());
            }
        }

        for (Map.Entry<Long, PermissionAccess> entry : finalState.entrySet()) {
            UserPermission previous = existingByPermission.get(entry.getKey());
            if (previous != null && previous.getAccess() == entry.getValue()) {
                continue; // unchanged
            }
            String action = entry.getValue() == PermissionAccess.ALLOW
                    ? "USER_PERMISSION_GRANTED" : "USER_PERMISSION_REVOKED";
            Permission permission = permissionRepository.findById(entry.getKey()).orElse(null);
            auditLogService.record("User", "UserPermission", user.getId(), action,
                    user.getUsername(), "USER", true,
                    previous == null ? null : "access=" + previous.getAccess(),
                    "access=" + entry.getValue(),
                    (permission == null ? entry.getKey() : permission.getPermissionCode())
                            + " — changed by " + actor);
        }

        // Overrides dropped entirely fall back to inherited (ROLE) access.
        existing.forEach(up -> {
            if (finalState.containsKey(up.getPermission().getId())) {
                return;
            }
            auditLogService.record("User", "UserPermission", user.getId(),
                    "USER_PERMISSION_REMOVED", user.getUsername(), "USER", true,
                    "access=" + up.getAccess(), "access=INHERITED",
                    up.getPermission().getPermissionCode() + " — removed by " + actor);
        });

        for (UserPermission up : existing) {
            userPermissionRepository.delete(up);
        }
        userPermissionRepository.flush();
        for (Map.Entry<Long, PermissionAccess> entry : finalState.entrySet()) {
            Permission permission = permissionRepository.findById(entry.getKey()).orElseThrow();
            String reason = items.stream()
                    .filter(i -> i.permissionId().equals(entry.getKey()) && i.reason() != null)
                    .map(UserPermissionItem::reason)
                    .findFirst().orElse(null);
            userPermissionRepository.save(UserPermission.builder()
                    .user(user)
                    .permission(permission)
                    .access(entry.getValue())
                    .reason(reason)
                    .createdBy(actor)
                    .build());
        }

        return effectivePermissions(userId);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }
}
