package com.procurement.approvalrule.service;

import com.procurement.approvalrule.dto.request.ApprovalRuleRequest;
import com.procurement.approvalrule.dto.response.ApprovalRuleResponse;
import com.procurement.approvalrule.entity.ApprovalRule;
import com.procurement.approvalrule.exception.ApprovalRuleNotFoundException;
import com.procurement.approvalrule.mapper.ApprovalRuleMapper;
import com.procurement.approvalrule.repository.ApprovalRuleRepository;
import com.procurement.approvalrule.specification.ApprovalRuleSpecification;
import com.procurement.approvalrule.validator.ApprovalRuleValidator;
import com.procurement.common.exception.ConflictException;
import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.common.response.PageResponse;
import com.procurement.department.entity.Department;
import com.procurement.department.repository.DepartmentRepository;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class ApprovalRuleServiceImpl implements ApprovalRuleService {
    private final ApprovalRuleRepository repo; private final DepartmentRepository departments;
    private final ApprovalRuleMapper mapper; private final ApprovalRuleValidator validator;
    public ApprovalRuleServiceImpl(ApprovalRuleRepository repo, DepartmentRepository departments,
                                   ApprovalRuleMapper mapper, ApprovalRuleValidator validator){this.repo=repo;this.departments=departments;this.mapper=mapper;this.validator=validator;}
    private String user(){var a=SecurityContextHolder.getContext().getAuthentication();return a==null?"system":a.getName();}
    private ApprovalRule find(Long id){return repo.findById(id).orElseThrow(()->new ApprovalRuleNotFoundException(id));}
    private Department department(Long id){return departments.findById(id).orElseThrow(()->new ResourceNotFoundException("Department not found: "+id));}
    private boolean overlaps(BigDecimal min1,BigDecimal max1,BigDecimal min2,BigDecimal max2){return (max1==null||min2.compareTo(max1)<=0)&&(max2==null||min1.compareTo(max2)<=0);}
    private void ensureNoOverlap(ApprovalRuleRequest request,Long ignore){for(var existing:repo.findByDepartmentId(request.departmentId())){if(ignore!=null&&existing.getId().equals(ignore))continue;if(overlaps(request.minimumAmount(),request.maximumAmount(),existing.getMinimumAmount(),existing.getMaximumAmount()))throw new ConflictException("Approval amount range overlaps rule "+existing.getRuleCode());}}
    @Transactional public ApprovalRuleResponse create(ApprovalRuleRequest request){validator.validate(request);if(repo.existsByRuleCode(request.ruleCode()))throw new ConflictException("Rule code already exists");ensureNoOverlap(request,null);var e=mapper.toEntity(request,department(request.departmentId()));e.setCreatedBy(user());e.setUpdatedBy(user());return mapper.toResponse(repo.save(e));}
    @Transactional(readOnly=true) public PageResponse<ApprovalRuleResponse> search(String keyword,Long departmentId,Boolean active,Pageable pageable){Page<ApprovalRuleResponse>x=repo.findAll(ApprovalRuleSpecification.search(keyword,departmentId,active),pageable).map(mapper::toResponse);return new PageResponse<>(x.getContent(),x.getNumber(),x.getSize(),x.getTotalElements(),x.getTotalPages(),x.isLast());}
    @Transactional(readOnly=true) public ApprovalRuleResponse getById(Long id){return mapper.toResponse(find(id));}
    @Transactional public ApprovalRuleResponse update(Long id,ApprovalRuleRequest request){validator.validate(request);var e=find(id);if(!e.getRuleCode().equals(request.ruleCode())&&repo.existsByRuleCode(request.ruleCode()))throw new ConflictException("Rule code already exists");ensureNoOverlap(request,id);mapper.update(e,request,department(request.departmentId()));e.setUpdatedBy(user());return mapper.toResponse(repo.save(e));}
    @Transactional public void delete(Long id){repo.delete(find(id));}
}
