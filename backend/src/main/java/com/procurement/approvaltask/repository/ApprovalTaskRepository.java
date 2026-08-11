package com.procurement.approvaltask.repository;
import com.procurement.approvaltask.entity.*; import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.*; import org.springframework.stereotype.Repository; import java.util.*;
@Repository public interface ApprovalTaskRepository extends JpaRepository<ApprovalTask,Long>,JpaSpecificationExecutor<ApprovalTask>{
 Optional<ApprovalTask> findFirstByPurchaseRequestIdAndStatusOrderByApprovalStageSequenceAsc(Long id,ApprovalTaskStatus status);
 List<ApprovalTask> findByPurchaseRequestIdOrderByApprovalStageSequenceAsc(Long id);
 Page<ApprovalTask> findByPurchaseRequest_Requester_Id(Long requesterId, Pageable pageable);
 boolean existsByPurchaseRequestIdAndApprovalStageId(Long requestId,Long stageId);
}
