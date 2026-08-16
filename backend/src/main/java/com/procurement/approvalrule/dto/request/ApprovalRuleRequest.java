package com.procurement.approvalrule.dto.request;
import jakarta.validation.constraints.*; import java.math.BigDecimal;
public record ApprovalRuleRequest(@NotBlank @Size(max=50) String ruleCode,@NotBlank @Size(max=150) String ruleName,@NotNull Long departmentId,@NotNull @DecimalMin("0.0") BigDecimal minimumAmount,@DecimalMin("0.0") BigDecimal maximumAmount,Boolean active,@Size(max=500) String description) {}
