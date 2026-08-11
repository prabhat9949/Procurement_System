package com.procurement.approvalhistory.service;
import com.procurement.approvalhistory.dto.response.*;
import com.procurement.approvalhistory.entity.ApprovalHistory;
import com.procurement.approvalhistory.mapper.*;
import com.procurement.approvalhistory.repository.*;
import com.procurement.common.exception.*;
import com.procurement.common.response.*;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.user.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service public class ApprovalHistoryServiceImpl implements ApprovalHistoryService{
    private final ApprovalHistoryRepository repo;
    private final ApprovalHistoryMapper mapper;
    private final UserRepository userRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    public ApprovalHistoryServiceImpl(ApprovalHistoryRepository r,ApprovalHistoryMapper m,UserRepository userRepository,PurchaseRequestRepository purchaseRequestRepository){repo=r;mapper=m;this.userRepository=userRepository;this.purchaseRequestRepository=purchaseRequestRepository;}
    @Transactional(readOnly=true)public PageResponse<ApprovalHistoryResponse>search(Long requestId,Pageable p){
        if(isEmployeeOnly()){
            if(requestId==null)return new PageResponse<>(java.util.List.of(),p.getPageNumber(),p.getPageSize(),0,0,true);
            var pr=purchaseRequestRepository.findById(requestId).orElseThrow(()->new ResourceNotFoundException("Purchase request not found: "+requestId));
            if(!pr.getRequester().getId().equals(currentEmployeeId()))throw new ForbiddenException("You can only view history for your own requests");
        }
        Specification<ApprovalHistory>s=requestId==null?null:(r,q,b)->b.equal(r.get("purchaseRequest").get("id"),requestId);
        Page<ApprovalHistoryResponse>x=repo.findAll(s,p).map(mapper::toResponse);
        return new PageResponse<>(x.getContent(),x.getNumber(),x.getSize(),x.getTotalElements(),x.getTotalPages(),x.isLast());
    }
    @Transactional(readOnly=true)public ApprovalHistoryResponse getById(Long id){return repo.findById(id).map(mapper::toResponse).orElseThrow(()->new ResourceNotFoundException("Approval history not found: "+id));}
    private String username(){var a=SecurityContextHolder.getContext().getAuthentication();return a==null?"system":a.getName();}
    private boolean isEmployeeOnly(){return userRepository.findByUsername(username()).map(u->u.getRole()!=null&&"EMPLOYEE".equals(u.getRole().getRoleCode())).orElse(false);}
    private Long currentEmployeeId(){return userRepository.findByUsername(username()).map(u->u.getEmployee()==null?null:u.getEmployee().getId()).orElseThrow(()->new ForbiddenException("Authenticated user is not linked to an employee"));}
}
