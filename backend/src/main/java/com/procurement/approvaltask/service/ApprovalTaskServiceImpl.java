package com.procurement.approvaltask.service;

import com.procurement.approvalhistory.entity.*;
import com.procurement.approvalhistory.repository.ApprovalHistoryRepository;
import com.procurement.approvalrule.repository.ApprovalRuleRepository;
import com.procurement.approvalstage.entity.ApprovalStage;
import com.procurement.approvalstage.repository.ApprovalStageRepository;
import com.procurement.approvaltask.dto.request.ApprovalDecisionRequest;
import com.procurement.approvaltask.dto.response.ApprovalTaskResponse;
import com.procurement.approvaltask.entity.*;
import com.procurement.approvaltask.exception.ApprovalTaskNotFoundException;
import com.procurement.approvaltask.mapper.ApprovalTaskMapper;
import com.procurement.approvaltask.repository.ApprovalTaskRepository;
import com.procurement.approvaltask.specification.ApprovalTaskSpecification;
import com.procurement.common.exception.*;
import com.procurement.common.response.PageResponse;
import com.procurement.employee.entity.Employee;
import com.procurement.employee.repository.EmployeeRepository;
import com.procurement.event.BusinessEventPublisher;
import com.procurement.event.BusinessEventType;
import com.procurement.notification.entity.NotificationType;
import com.procurement.purchaserequest.entity.*;
import com.procurement.purchaserequest.repository.PurchaseRequestRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;

@Service
public class ApprovalTaskServiceImpl implements ApprovalTaskService {
    private final ApprovalTaskRepository tasks;
    private final ApprovalStageRepository stages;
    private final ApprovalRuleRepository rules;
    private final ApprovalHistoryRepository history;
    private final PurchaseRequestRepository requests;
    private final EmployeeRepository employees;
    private final UserRepository users;
    private final ApprovalTaskMapper mapper;
    private final BusinessEventPublisher eventPublisher;
    private final com.procurement.costcenter.repository.CostCenterRepository costCenters;

    public ApprovalTaskServiceImpl(ApprovalTaskRepository tasks, ApprovalStageRepository stages,
                                   ApprovalRuleRepository rules, ApprovalHistoryRepository history,
                                   PurchaseRequestRepository requests, EmployeeRepository employees,
                                   UserRepository users, ApprovalTaskMapper mapper,
                                   BusinessEventPublisher eventPublisher,
                                   com.procurement.costcenter.repository.CostCenterRepository costCenters) {
        this.tasks=tasks; this.stages=stages; this.rules=rules; this.history=history;
        this.requests=requests; this.employees=employees; this.users=users; this.mapper=mapper;
        this.eventPublisher = eventPublisher;
        this.costCenters = costCenters;
    }
    private void releaseBudget(com.procurement.purchaserequest.entity.PurchaseRequest pr){
        if(!Boolean.TRUE.equals(pr.getBudgetCommitted()))return;
        var cc=pr.getCostCenter();
        var used=cc.getUsedBudget()==null?java.math.BigDecimal.ZERO:cc.getUsedBudget();
        var remaining=cc.getRemainingBudget()==null?cc.getBudget():cc.getRemainingBudget();
        cc.setUsedBudget(used.subtract(pr.getEstimatedAmount()).max(java.math.BigDecimal.ZERO));
        cc.setRemainingBudget(remaining.add(pr.getEstimatedAmount()));
        costCenters.save(cc);
        pr.setBudgetCommitted(false);
    }
    private String username(){var a=SecurityContextHolder.getContext().getAuthentication();return a==null?"system":a.getName();}
    private Employee currentEmployee(){return users.findByUsername(username()).map(User::getEmployee).orElseThrow(()->new ForbiddenException("Authenticated user is not linked to an employee"));}
    private ApprovalTask find(Long id){return tasks.findById(id).orElseThrow(()->new ApprovalTaskNotFoundException(id));}
    private void record(PurchaseRequest pr,ApprovalTask task,ApprovalAction action,Employee employee,String comments){history.save(ApprovalHistory.builder().purchaseRequest(pr).approvalTask(task).action(action).performedBy(employee).comments(comments).build());}
    private ApprovalTask newTask(PurchaseRequest pr,ApprovalStage stage,Employee employee){return tasks.save(ApprovalTask.builder().taskNumber("AT-"+Year.now().getValue()+"-"+String.format("%06d",tasks.count()+1)).purchaseRequest(pr).approvalStage(stage).assignedEmployee(employee).assignedRole(stage.getApproverRole()).status(ApprovalTaskStatus.PENDING).approvedAmount(pr.getEstimatedAmount()).build());}

    @Transactional public void submit(PurchaseRequest pr){
        if(pr.getStatus()!=PurchaseRequestStatus.DRAFT)throw new ConflictException("Only draft purchase requests can be submitted");
        var matching=rules.findByDepartmentIdAndActiveTrue(pr.getDepartment().getId()).stream().filter(r->pr.getEstimatedAmount().compareTo(r.getMinimumAmount())>=0&&(r.getMaximumAmount()==null||pr.getEstimatedAmount().compareTo(r.getMaximumAmount())<=0)).toList();
        if(matching.isEmpty())throw new ConflictException("No active approval rule matches this purchase request");
        var stage=stages.findByApprovalRuleIdAndActiveTrueOrderBySequenceAsc(matching.get(0).getId()).stream().findFirst().orElseThrow(()->new ConflictException("Approval rule has no active stages"));
        var employee=employees.findFirstByRoleIdAndActiveTrue(stage.getApproverRole().getId()).orElseThrow(()->new ConflictException("No active approver found for role"));
        pr.setStatus(PurchaseRequestStatus.UNDER_REVIEW);pr.setApprovalStatus(ApprovalStatus.PENDING);requests.save(pr);var task=newTask(pr,stage,employee);record(pr,task,ApprovalAction.SUBMITTED,currentEmployee(),"Purchase request submitted");
        eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_SUBMITTED,"ApprovalTask","ApprovalTask",task.getId(),task.getTaskNumber(),"Approval task created for purchase request submission",username(),NotificationType.APPROVAL);
    }
    @Transactional(readOnly=true) public PageResponse<ApprovalTaskResponse> search(Long requestId,Long employeeId,ApprovalTaskStatus status,Pageable pageable){
        if(isEmployeeOnly()){
            var emp=currentEmployee();
            if(requestId!=null){var pr=requests.findById(requestId).orElseThrow(()->new com.procurement.common.exception.ResourceNotFoundException("Purchase request not found: "+requestId));if(!pr.getRequester().getId().equals(emp.getId()))throw new ForbiddenException("You can only view approval tasks for your own requests");}
            else{Page<ApprovalTaskResponse>x=tasks.findByPurchaseRequest_Requester_Id(emp.getId(),pageable).map(mapper::toResponse);return new PageResponse<>(x.getContent(),x.getNumber(),x.getSize(),x.getTotalElements(),x.getTotalPages(),x.isLast());}
        }
        Page<ApprovalTaskResponse>x=tasks.findAll(ApprovalTaskSpecification.search(requestId,employeeId,status),pageable).map(mapper::toResponse);return new PageResponse<>(x.getContent(),x.getNumber(),x.getSize(),x.getTotalElements(),x.getTotalPages(),x.isLast());
    }
    private boolean isEmployeeOnly(){return users.findByUsername(username()).map(u->u.getRole()!=null&&"EMPLOYEE".equals(u.getRole().getRoleCode())).orElse(false);}
    @Transactional(readOnly=true) public ApprovalTaskResponse getById(Long id){return mapper.toResponse(find(id));}
    private ApprovalTaskResponse decide(Long id,ApprovalDecisionRequest d,ApprovalTaskStatus target,ApprovalAction action){
        var task=find(id);if(task.getStatus()!=ApprovalTaskStatus.PENDING)throw new ConflictException("Completed approval tasks cannot be modified");var employee=currentEmployee();if(!task.getAssignedEmployee().getId().equals(employee.getId()))throw new ForbiddenException("Only the assigned approver can decide this task");
        task.setStatus(target);task.setComments(d==null?null:d.comments());task.setCompletedDate(LocalDateTime.now());var pr=task.getPurchaseRequest();record(pr,task,action,employee,task.getComments());
        if(target==ApprovalTaskStatus.REJECTED){releaseBudget(pr);pr.setStatus(PurchaseRequestStatus.REJECTED);pr.setApprovalStatus(ApprovalStatus.REJECTED);requests.save(pr);eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_REJECTED,"ApprovalTask","PurchaseRequest",pr.getId(),pr.getRequestNumber(),"Purchase request rejected",username(),NotificationType.APPROVAL);}else if(target==ApprovalTaskStatus.RETURNED){releaseBudget(pr);pr.setStatus(PurchaseRequestStatus.DRAFT);pr.setApprovalStatus(ApprovalStatus.RETURNED);requests.save(pr);}else{var next=stages.findByApprovalRuleIdAndActiveTrueOrderBySequenceAsc(task.getApprovalStage().getApprovalRule().getId()).stream().filter(s->s.getSequence()>task.getApprovalStage().getSequence()).findFirst();if(next.isPresent()){var ae=employees.findFirstByRoleIdAndActiveTrue(next.get().getApproverRole().getId()).orElseThrow(()->new ConflictException("No active approver found for next stage"));var nextTask=newTask(pr,next.get(),ae);eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_APPROVED,"ApprovalTask","ApprovalTask",nextTask.getId(),nextTask.getTaskNumber(),"Approval stage completed and routed to next approver",username(),NotificationType.APPROVAL);}else{pr.setStatus(PurchaseRequestStatus.APPROVED);pr.setApprovalStatus(ApprovalStatus.APPROVED);requests.save(pr);eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_APPROVED,"ApprovalTask","PurchaseRequest",pr.getId(),pr.getRequestNumber(),"Purchase request fully approved",username(),NotificationType.APPROVAL);}}
        return mapper.toResponse(tasks.save(task));
    }
    @Transactional public ApprovalTaskResponse approve(Long id,ApprovalDecisionRequest d){return decide(id,d,ApprovalTaskStatus.APPROVED,ApprovalAction.APPROVED);}
    @Transactional public ApprovalTaskResponse reject(Long id,ApprovalDecisionRequest d){return decide(id,d,ApprovalTaskStatus.REJECTED,ApprovalAction.REJECTED);}
    @Transactional public ApprovalTaskResponse returnTask(Long id,ApprovalDecisionRequest d){return decide(id,d,ApprovalTaskStatus.RETURNED,ApprovalAction.RETURNED);}
}
