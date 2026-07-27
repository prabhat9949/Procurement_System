package com.procurement.approvalstage.repository;
import com.procurement.approvalstage.entity.ApprovalStage;
import org.springframework.data.jpa.repository.*; import org.springframework.stereotype.Repository; import java.util.*;
@Repository public interface ApprovalStageRepository extends JpaRepository<ApprovalStage,Long>,JpaSpecificationExecutor<ApprovalStage>{
 List<ApprovalStage> findByApprovalRuleIdAndActiveTrueOrderBySequenceAsc(Long ruleId);
 boolean existsByApprovalRuleIdAndSequence(Long ruleId,Integer sequence);
}
