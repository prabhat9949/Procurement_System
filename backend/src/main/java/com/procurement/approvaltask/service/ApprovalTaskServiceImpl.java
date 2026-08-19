package com.procurement.approvaltask.service;

import com.procurement.approvalhistory.entity.*;
import com.procurement.approvalhistory.repository.ApprovalHistoryRepository;
import com.procurement.approvalrule.repository.ApprovalRuleRepository;
import com.procurement.approvalstage.entity.ApprovalStage;
import com.procurement.approvalstage.repository.ApprovalStageRepository;
import com.procurement.approvaltask.dto.request.ApprovalDecisionRequest;
import com.procurement.approvaltask.dto.response.ApprovalTaskResponse;
import com.procurement.approvaltask.dto.response.ApprovalTaskQueueResponse;
import com.procurement.approvaltask.dto.response.ApprovalAuthorityResponse;
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
import com.procurement.purchaserequestline.repository.PurchaseRequestLineRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.fulfilment.service.InternalFulfilmentService;
import com.procurement.assignment.service.AssignmentService;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ApprovalTaskServiceImpl implements ApprovalTaskService {
    /** Default approval SLA in working hours — approvals pending beyond this are surfaced as OVERDUE. */
    private static final int SLA_HOURS = 72;
    private static final int SLA_DAYS = 3;

    private final ApprovalTaskRepository tasks;
    private final ApprovalStageRepository stages;
    private final ApprovalRuleRepository rules;
    private final ApprovalHistoryRepository history;
    private final PurchaseRequestRepository requests;
    private final PurchaseRequestLineRepository lines;
    private final EmployeeRepository employees;
    private final UserRepository users;
    private final ApprovalTaskMapper mapper;
    private final BusinessEventPublisher eventPublisher;
    private final com.procurement.costcenter.repository.CostCenterRepository costCenters;
    private final com.procurement.workflow.service.WorkflowService workflowService;
    private final com.procurement.workflow.service.TaskRoutingService taskRouting;
    private final InternalFulfilmentService internalFulfilmentService;
private final com.procurement.assignment.service.AssignmentService assignmentService;

    public ApprovalTaskServiceImpl(ApprovalTaskRepository tasks, ApprovalStageRepository stages,
                                   ApprovalRuleRepository rules, ApprovalHistoryRepository history,
                                   PurchaseRequestRepository requests, PurchaseRequestLineRepository lines,
                                   EmployeeRepository employees,
                                   UserRepository users, ApprovalTaskMapper mapper,
                                   BusinessEventPublisher eventPublisher,
                                   com.procurement.costcenter.repository.CostCenterRepository costCenters,
                                   com.procurement.workflow.service.WorkflowService workflowService,
                                   com.procurement.workflow.service.TaskRoutingService taskRouting,
                                   InternalFulfilmentService internalFulfilmentService, com.procurement.assignment.service.AssignmentService assignmentService) {
        this.tasks=tasks; this.stages=stages; this.rules=rules; this.history=history;
        this.requests=requests; this.lines=lines; this.employees=employees; this.users=users; this.mapper=mapper;
        this.eventPublisher = eventPublisher;
        this.costCenters = costCenters;
        this.workflowService = workflowService;
        this.taskRouting = taskRouting;
        this.internalFulfilmentService = internalFulfilmentService;
        this.assignmentService = assignmentService;
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

    /**
     * Flow-based routing: any active employee holding the stage's approver role
     * is part of the flow. Tasks are distributed round-robin by the PR id, so a
     * stage lands on one of the eligible approvers — never on a fixed person.
     */
    private Employee resolveApprover(PurchaseRequest pr, ApprovalStage stage){
        return taskRouting.pickActiveByRole(stage.getApproverRole().getId(), pr.getId())
                .orElseThrow(()->new ConflictException("No active approver found for role: "+stage.getApproverRole().getRoleName()));
    }
    private String usernameOf(Employee employee){
        return users.findByEmployee(employee).map(User::getUsername).orElse(username());
    }

    @Transactional public void submit(PurchaseRequest pr){
        if(pr.getStatus()!=PurchaseRequestStatus.DRAFT)throw new ConflictException("Only draft purchase requests can be submitted");
        var amount = pr.getEstimatedAmount();
        var departmentRules = rules.findByDepartmentIdAndActiveTrue(pr.getDepartment().getId());
        var matching = departmentRules.stream()
                .filter(r -> amount.compareTo(r.getMinimumAmount()) >= 0
                        && (r.getMaximumAmount() == null || amount.compareTo(r.getMaximumAmount()) <= 0))
                .sorted(java.util.Comparator.comparing(com.procurement.approvalrule.entity.ApprovalRule::getMinimumAmount).reversed())
                .toList();
        // Departments may not yet have a complete approval matrix. Use the
        // configured active enterprise rule as a safe fallback rather than
        // rejecting every valid PR with “No active approval rule matches”.
        if (matching.isEmpty()) {
            matching = rules.findByActiveTrue().stream()
                    .filter(r -> amount.compareTo(r.getMinimumAmount()) >= 0
                            && (r.getMaximumAmount() == null || amount.compareTo(r.getMaximumAmount()) <= 0))
                    .sorted(java.util.Comparator.comparing(com.procurement.approvalrule.entity.ApprovalRule::getMinimumAmount).reversed())
                    .toList();
        }
        if(matching.isEmpty())throw new ConflictException("No active approval rule matches this purchase request");
        var stage=stages.findByApprovalRuleIdAndActiveTrueOrderBySequenceAsc(matching.get(0).getId()).stream().findFirst().orElseThrow(()->new ConflictException("Approval rule has no active stages"));
        // Route to the requester's actual manager from the reporting chain (not a role-wide pick).
        var employee=resolveApprover(pr,stage);
        pr.setStatus(PurchaseRequestStatus.UNDER_REVIEW);pr.setApprovalStatus(ApprovalStatus.PENDING);requests.save(pr);var task=newTask(pr,stage,employee);record(pr,task,ApprovalAction.SUBMITTED,currentEmployee(),"Purchase request submitted");
        eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_SUBMITTED,"ApprovalTask","ApprovalTask",task.getId(),task.getTaskNumber(),"Approval task created and assigned to you",usernameOf(employee),NotificationType.APPROVAL);
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
        // Approval-limit validation: the task amount must be within the authority of the rule this stage belongs to.
        var rule=task.getApprovalStage().getApprovalRule();
        if(rule.getMaximumAmount()!=null&&task.getApprovedAmount()!=null&&task.getApprovedAmount().compareTo(rule.getMaximumAmount())>0)
            throw new ForbiddenException("Approval limit exceeded — this request requires higher-level authorization");
        task.setStatus(target);task.setComments(d==null?null:d.comments());task.setCompletedDate(LocalDateTime.now());var pr=task.getPurchaseRequest();record(pr,task,action,employee,task.getComments());
        if(target==ApprovalTaskStatus.REJECTED){releaseBudget(pr);pr.setStatus(PurchaseRequestStatus.REJECTED);pr.setApprovalStatus(ApprovalStatus.REJECTED);requests.save(pr);eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_REJECTED,"ApprovalTask","PurchaseRequest",pr.getId(),pr.getRequestNumber(),"Your PR "+pr.getRequestNumber()+" was rejected by "+employee.getFirstName()+" "+(employee.getLastName()==null?"":employee.getLastName()),usernameOf(pr.getRequester()),NotificationType.APPROVAL);        }else if(target==ApprovalTaskStatus.RETURNED){releaseBudget(pr);pr.setStatus(PurchaseRequestStatus.DRAFT);pr.setApprovalStatus(ApprovalStatus.RETURNED);requests.save(pr);eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_REJECTED,"ApprovalTask","PurchaseRequest",pr.getId(),pr.getRequestNumber(),"Your PR "+pr.getRequestNumber()+" was returned for correction by "+employee.getFirstName()+" "+(employee.getLastName()==null?"":employee.getLastName()),usernameOf(pr.getRequester()),NotificationType.APPROVAL);        }else{var next=stages.findByApprovalRuleIdAndActiveTrueOrderBySequenceAsc(task.getApprovalStage().getApprovalRule().getId()).stream().filter(s->s.getSequence()>task.getApprovalStage().getSequence()).findFirst();if(next.isPresent()){// Route the next stage to the next person in the requester's reporting chain.
            var ae=resolveApprover(pr,next.get());
            var nextTask=newTask(pr,next.get(),ae);
            eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_APPROVED,"ApprovalTask","ApprovalTask",nextTask.getId(),nextTask.getTaskNumber(),"PR "+pr.getRequestNumber()+" has been assigned to you for approval",usernameOf(ae),NotificationType.APPROVAL);
            eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_APPROVED,"ApprovalTask","PurchaseRequest",pr.getId(),pr.getRequestNumber(),"Your PR was approved by "+employee.getFirstName()+" "+(employee.getLastName()==null?"":employee.getLastName()),usernameOf(pr.getRequester()),NotificationType.APPROVAL);}else{pr.setStatus(PurchaseRequestStatus.APPROVED);pr.setApprovalStatus(ApprovalStatus.APPROVED);requests.save(pr);
            // Internal availability check before any external procurement
            var check = internalFulfilmentService.checkAvailability(pr.getId());
            String actionName = check.recommendedAction();
            if ("INTERNAL_FULFILMENT".equalsIgnoreCase(actionName)) {
                pr.setStatus(PurchaseRequestStatus.INTERNAL_FULFILMENT_IN_PROGRESS);
            } else if ("PARTIAL_FULFILMENT_AND_EXTERNAL_PROCUREMENT".equalsIgnoreCase(actionName)) {
                pr.setStatus(PurchaseRequestStatus.PARTIAL_FULFILMENT_PENDING);
            } else if ("EXTERNAL_PROCUREMENT_REQUIRED".equalsIgnoreCase(actionName)) {
                pr.setStatus(PurchaseRequestStatus.EXTERNAL_PROCUREMENT_REQUIRED);
            } else {
                // Fallback to fully approved without internal fulfilment
            }
            requests.save(pr);
            // Create assignment if external procurement needed or partial fulfilment
            if (pr.getStatus() == PurchaseRequestStatus.EXTERNAL_PROCUREMENT_REQUIRED || pr.getStatus() == PurchaseRequestStatus.PARTIAL_FULFILMENT_PENDING) {
                assignmentService.createAssignment(pr);
            }
            // Category routing engine: route the fully approved PR to the team officer
            // that owns the PR's category (database-driven teamRoleCode mapping).
            workflowService.assignToTeam(pr,"PR fully approved — routed via category routing engine");
            eventPublisher.publish(BusinessEventType.PURCHASE_REQUEST_APPROVED,"ApprovalTask","PurchaseRequest",pr.getId(),pr.getRequestNumber(),"Purchase request fully approved",usernameOf(pr.getRequester()),NotificationType.APPROVAL);}}
        return mapper.toResponse(tasks.save(task));
    }
    @Transactional public ApprovalTaskResponse approve(Long id,ApprovalDecisionRequest d){return decide(id,d,ApprovalTaskStatus.APPROVED,ApprovalAction.APPROVED);}
    @Transactional public ApprovalTaskResponse reject(Long id,ApprovalDecisionRequest d){return decide(id,d,ApprovalTaskStatus.REJECTED,ApprovalAction.REJECTED);}
    @Transactional public ApprovalTaskResponse returnTask(Long id,ApprovalDecisionRequest d){return decide(id,d,ApprovalTaskStatus.RETURNED,ApprovalAction.RETURNED);}

    @Transactional(readOnly=true) public PageResponse<ApprovalTaskQueueResponse> myQueue(ApprovalTaskStatus status,Pageable pageable){
        var employee=currentEmployee();
        var spec=ApprovalTaskSpecification.search(null,employee.getId(),status);
        var rows=tasks.findAll(spec,pageable);
        var content=rows.getContent().stream().map(this::enrich).collect(Collectors.toList());
        return new PageResponse<>(content,rows.getNumber(),rows.getSize(),rows.getTotalElements(),rows.getTotalPages(),rows.isLast());
    }

    private ApprovalTaskQueueResponse enrich(ApprovalTask task){
        var pr=task.getPurchaseRequest();
        var requester=pr.getRequester();
        var stage=task.getApprovalStage();
        var rule=stage.getApprovalRule();
        var ruleStages=stages.findByApprovalRuleIdAndActiveTrueOrderBySequenceAsc(rule.getId());
        var previous=ruleStages.stream().filter(s->s.getSequence()<stage.getSequence()).reduce((a,b)->b).orElse(null);
        var next=ruleStages.stream().filter(s->s.getSequence()>stage.getSequence()).findFirst().orElse(null);
        // Who approved the stage before this one (from real approval history records).
        String previousApprover=null,previousApproval=null;
        var events=history.findByPurchaseRequestIdOrderByPerformedAtAsc(pr.getId());
        for(var h:events){
            if(h.getAction()==ApprovalAction.SUBMITTED)continue;
            if(task.getAssignedDate()!=null&&h.getPerformedAt()!=null&&h.getPerformedAt().isAfter(task.getAssignedDate()))break;
            if(h.getPerformedBy()!=null)previousApprover=h.getPerformedBy().getFirstName()+" "+(h.getPerformedBy().getLastName()==null?"":h.getPerformedBy().getLastName());
            previousApproval=h.getAction()==null?null:h.getAction().name();
        }
        String reason;
        if(previous!=null)reason="Amount requires "+stage.getApproverRole().getRoleName()+" approval (exceeds "+previous.getApproverRole().getRoleName()+" authority)";
        else reason="Requires "+stage.getApproverRole().getRoleName()+" approval per "+rule.getRuleName();
        String category=lines.findByPurchaseRequestId(pr.getId()).stream()
                .map(l->l.getProduct().getCategory()==null?null:l.getProduct().getCategory().getCategoryName())
                .filter(Objects::nonNull).findFirst().orElse(null);
        boolean overdue=task.getStatus()==ApprovalTaskStatus.PENDING&&task.getAssignedDate()!=null
                &&task.getAssignedDate().plusHours(SLA_HOURS).isBefore(LocalDateTime.now());
        long pendingDays=task.getAssignedDate()==null?0L:ChronoUnit.DAYS.between(task.getAssignedDate().toLocalDate(),LocalDate.now());
        return new ApprovalTaskQueueResponse(
                task.getId(),task.getTaskNumber(),pr.getId(),pr.getRequestNumber(),
                stage.getId(),stage.getStageName(),task.getStatus()==null?null:task.getStatus().name(),
                task.getAssignedDate(),task.getCompletedDate(),task.getApprovedAmount(),
                requester.getId(),requester.getFirstName()+" "+(requester.getLastName()==null?"":requester.getLastName()),requester.getEmployeeCode(),
                pr.getDepartment()==null?null:pr.getDepartment().getId(),pr.getDepartment()==null?null:pr.getDepartment().getDepartmentName(),
                category,pr.getPriority()==null?null:pr.getPriority().name(),pr.getPurpose(),
                pr.getCreatedAt(),pr.getRequiredDate(),
                previousApprover,previousApproval,reason,
                next==null?null:next.getStageName(),next==null?null:next.getApproverRole().getRoleName(),
                overdue,pendingDays);
    }

    @Transactional(readOnly=true) public ApprovalAuthorityResponse myAuthority(){
        var user=users.findByUsername(username()).orElseThrow(()->new ForbiddenException("Authenticated user not found"));
        var role=user.getRole();
        if(role==null)throw new ForbiddenException("No role assigned to this account");
        var myStages=stages.findByApproverRoleIdAndActiveTrue(role.getId());
        if(myStages.isEmpty())return new ApprovalAuthorityResponse(role.getRoleCode(),role.getRoleName(),null,null,SLA_DAYS,null,null);
        BigDecimal min=myStages.stream().map(s->s.getApprovalRule().getMinimumAmount()).min(Comparator.naturalOrder()).orElse(null);
        BigDecimal max=myStages.stream().map(s->s.getApprovalRule().getMaximumAmount()).filter(Objects::nonNull).max(Comparator.naturalOrder()).orElse(null);
        String higherCode=null,higherName=null;
        for(var s:myStages){
            var ruleStages=stages.findByApprovalRuleIdAndActiveTrueOrderBySequenceAsc(s.getApprovalRule().getId());
            var next=ruleStages.stream().filter(x->x.getSequence()>s.getSequence()).findFirst().orElse(null);
            if(next!=null){higherCode=next.getApproverRole().getRoleCode();higherName=next.getApproverRole().getRoleName();break;}
        }
        return new ApprovalAuthorityResponse(role.getRoleCode(),role.getRoleName(),min,max,SLA_DAYS,higherCode,higherName);
    }
}
