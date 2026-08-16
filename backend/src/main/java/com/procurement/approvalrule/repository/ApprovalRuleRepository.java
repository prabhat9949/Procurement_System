package com.procurement.approvalrule.repository;
import com.procurement.approvalrule.entity.ApprovalRule;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository public interface ApprovalRuleRepository extends JpaRepository<ApprovalRule,Long>, JpaSpecificationExecutor<ApprovalRule> {
    Optional<ApprovalRule> findByRuleCode(String code);
    boolean existsByRuleCode(String code);
    List<ApprovalRule> findByDepartmentIdAndActiveTrue(Long departmentId);
    List<ApprovalRule> findByDepartmentId(Long departmentId);
    List<ApprovalRule> findByActiveTrue();
}
