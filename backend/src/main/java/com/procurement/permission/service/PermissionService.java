package com.procurement.permission.service;

import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.permission.dto.response.PermissionResponse;
import com.procurement.permission.entity.Permission;
import com.procurement.permission.repository.PermissionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> listAll() {
        return permissionRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<PermissionResponse> search(String moduleName, Boolean active, Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<Permission> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (moduleName != null && !moduleName.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("moduleName")), "%" + moduleName.toLowerCase() + "%"));
            }
            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
        Page<PermissionResponse> page = permissionRepository.findAll(spec, pageable).map(this::toResponse);
        return new PageResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Transactional(readOnly = true)
    public PermissionResponse getById(Long id) {
        return toResponse(find(id));
    }

    private Permission find(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + id));
    }

    private PermissionResponse toResponse(Permission p) {
        return new PermissionResponse(
                p.getId(), p.getPermissionCode(), p.getPermissionName(), p.getModuleName(),
                p.getDescription(), p.getActive(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
