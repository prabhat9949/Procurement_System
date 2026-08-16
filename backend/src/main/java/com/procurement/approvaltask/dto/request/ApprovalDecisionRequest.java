package com.procurement.approvaltask.dto.request; import jakarta.validation.constraints.Size; public record ApprovalDecisionRequest(@Size(max=1000) String comments){}
