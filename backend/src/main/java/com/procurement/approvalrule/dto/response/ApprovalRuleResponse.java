package com.procurement.approvalrule.dto.response;
import java.math.BigDecimal; import java.time.LocalDateTime;
public record ApprovalRuleResponse(Long id,String ruleCode,String ruleName,Long departmentId,String departmentName,BigDecimal minimumAmount,BigDecimal maximumAmount,Boolean active,String description,String createdBy,String updatedBy,LocalDateTime createdAt,LocalDateTime updatedAt) {}
