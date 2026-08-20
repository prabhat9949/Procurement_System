package com.procurement.security.service;

import com.procurement.role.entity.RolePermission;
import com.procurement.role.repository.RolePermissionRepository;
import com.procurement.user.entity.PermissionAccess;
import com.procurement.user.entity.User;
import com.procurement.user.entity.UserPermission;
import com.procurement.user.repository.UserPermissionRepository;
import com.procurement.user.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserPermissionRepository userPermissionRepository;

    public CustomUserDetailsService(UserRepository userRepository,
                                    RolePermissionRepository rolePermissionRepository,
                                    UserPermissionRepository userPermissionRepository) {
        this.userRepository = userRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userPermissionRepository = userPermissionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Effective permissions = role permissions + user ALLOW overrides − user DENY
        // overrides (DENY wins). Reloaded from the database on every request, so
        // Admin role/permission changes apply on the next API call without re-login.
        Set<String> permissionCodes = new LinkedHashSet<>();
        for (RolePermission rolePermission
                : rolePermissionRepository.findWithPermissionsByRoleId(user.getRole().getId())) {
            permissionCodes.add(rolePermission.getPermission().getPermissionCode());
        }
        List<UserPermission> overrides = userPermissionRepository.findWithPermissionsByUserId(user.getId());
        for (UserPermission override : overrides) {
            String code = override.getPermission().getPermissionCode();
            if (override.getAccess() == PermissionAccess.ALLOW) {
                permissionCodes.add(code);
            } else {
                permissionCodes.remove(code);
            }
        }

        List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleCode()));
        permissionCodes.forEach(code -> authorities.add(new SimpleGrantedAuthority(code)));

        return new CustomUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                user.getRole().getRoleCode(),
                user.getRole().getRoleName(),
                user.getEmployee().getFirstName() + " " + user.getEmployee().getLastName(),
                Boolean.TRUE.equals(user.getEnabled()),
                Boolean.TRUE.equals(user.getAccountLocked()),
                authorities);
    }
}
