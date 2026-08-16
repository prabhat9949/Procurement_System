package com.procurement.approvalrule.service;
import com.procurement.approvalrule.dto.request.*; import com.procurement.approvalrule.dto.response.*; import com.procurement.common.response.PageResponse; import org.springframework.data.domain.Pageable;
public interface ApprovalRuleService { ApprovalRuleResponse create(ApprovalRuleRequest r); PageResponse<ApprovalRuleResponse> search(String k,Long d,Boolean a,Pageable p); ApprovalRuleResponse getById(Long id); ApprovalRuleResponse update(Long id,ApprovalRuleRequest r); void delete(Long id); }
