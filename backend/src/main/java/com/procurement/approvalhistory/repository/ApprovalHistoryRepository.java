package com.procurement.approvalhistory.repository;
import com.procurement.approvalhistory.entity.*; import org.springframework.data.jpa.repository.*; import org.springframework.stereotype.Repository; import java.util.*;
@Repository public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory,Long>,JpaSpecificationExecutor<ApprovalHistory>{ List<ApprovalHistory> findByPurchaseRequestIdOrderByPerformedAtAsc(Long id); }
