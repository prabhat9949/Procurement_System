package com.procurement.notification.service;

import com.procurement.common.exception.*;
import com.procurement.common.response.PageResponse;
import com.procurement.notification.dto.request.*;
import com.procurement.notification.dto.response.*;
import com.procurement.notification.entity.*;
import com.procurement.notification.exception.NotificationNotFoundException;
import com.procurement.notification.mapper.NotificationMapper;
import com.procurement.notification.repository.*;
import com.procurement.notification.specification.NotificationSpecification;
import com.procurement.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository repo; private final NotificationRecipientRepository recipientRepo; private final NotificationTemplateRepository templateRepo; private final NotificationPreferenceRepository preferenceRepo; private final UserRepository userRepo; private final NotificationMapper mapper;
    @PersistenceContext private EntityManager em;
    public NotificationServiceImpl(NotificationRepository repo, NotificationRecipientRepository recipientRepo, NotificationTemplateRepository templateRepo, NotificationPreferenceRepository preferenceRepo, UserRepository userRepo, NotificationMapper mapper){this.repo=repo;this.recipientRepo=recipientRepo;this.templateRepo=templateRepo;this.preferenceRepo=preferenceRepo;this.userRepo=userRepo;this.mapper=mapper;}
    private String user(){var a=org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();return a==null?"system":a.getName();}
    private Notification find(Long id){return repo.findById(id).orElseThrow(()->new NotificationNotFoundException(id));}
    private void ensureTemplateNumber(Notification n){if(n.getNotificationNumber()==null||n.getNotificationNumber().isBlank())n.setNotificationNumber("NTF-"+Year.now().getValue()+"-"+String.format("%06d",repo.count()+1));}
    @Transactional public NotificationResponse create(NotificationRequest request){var sender=request.senderId()==null?null:userRepo.findById(request.senderId()).orElseThrow(()->new ResourceNotFoundException("Sender not found"));var n=Notification.builder().notificationNumber("NTF-"+Year.now().getValue()+"-"+String.format("%06d",repo.count()+1)).title(request.title()).message(request.message()).type(request.type()).priority(request.priority()).status(NotificationStatus.PENDING).referenceType(request.referenceType()).referenceId(request.referenceId()).sender(sender).scheduledAt(request.scheduledAt()).expiresAt(request.expiresAt()).createdBy(user()).updatedBy(user()).build();var saved=repo.save(n);return mapper.toResponse(saved);}
    @Transactional(readOnly=true) public PageResponse<NotificationResponse> search(String keyword, Long userId, NotificationStatus status, NotificationPriority priority, NotificationType type, Pageable pageable){var page=repo.findAll(NotificationSpecification.search(keyword,userId,status,priority,type),pageable).map(mapper::toResponse);return new PageResponse<>(page.getContent(),page.getNumber(),page.getSize(),page.getTotalElements(),page.getTotalPages(),page.isLast());}
    @Transactional(readOnly=true) public NotificationResponse get(Long id){return mapper.toResponse(find(id));}
    @Transactional public NotificationResponse send(Long id, NotificationSendRequest request){var n=find(id);if(n.getStatus()==NotificationStatus.EXPIRED)throw new ConflictException("Expired notification is read-only");recipientRepo.deleteAll(recipientRepo.findByNotificationId(id));for(var uid:request.recipientUserIds()){var u=userRepo.findById(uid).orElseThrow(()->new ResourceNotFoundException("User not found: "+uid));for(var channel:request.deliveryChannels()){recipientRepo.save(NotificationRecipient.builder().notification(n).user(u).deliveryChannel(channel).deliveryStatus(DeliveryStatus.SENT).build());}}var old=n.getStatus();n.setStatus(NotificationStatus.SENT);n.setSentAt(LocalDateTime.now());n.setUpdatedBy(user());var saved=repo.save(n);return mapper.toResponse(saved);}
    @Transactional public NotificationResponse markRead(Long id){var n=find(id);if(n.getStatus()==NotificationStatus.EXPIRED)throw new ConflictException("Expired notification is read-only");var old=n.getStatus();n.setStatus(NotificationStatus.READ);n.setUpdatedBy(user());var saved=repo.save(n);return mapper.toResponse(saved);}
    @Transactional public NotificationResponse archive(Long id){var n=find(id);var old=n.getStatus();n.setStatus(NotificationStatus.EXPIRED);n.setUpdatedBy(user());var saved=repo.save(n);return mapper.toResponse(saved);}
    @Transactional(readOnly=true) public PageResponse<NotificationRecipientResponse> recipients(Long id, Pageable pageable){var mapped=recipientRepo.findByNotificationId(id).stream().map(mapper::toRecipientResponse).toList();var page=new PageImpl<>(mapped,pageable,mapped.size());return new PageResponse<>(page.getContent(),page.getNumber(),page.getSize(),page.getTotalElements(),page.getTotalPages(),page.isLast());}
    @Transactional public NotificationTemplateResponse createTemplate(NotificationTemplateRequest request){var t=NotificationTemplate.builder().templateCode(request.templateCode()).titleTemplate(request.titleTemplate()).bodyTemplate(request.bodyTemplate()).notificationType(request.notificationType()).active(request.active()==null||request.active()).build();return mapper.toTemplateResponse(templateRepo.save(t));}
    @Transactional(readOnly=true) public PageResponse<NotificationTemplateResponse> templates(Pageable pageable){var page=templateRepo.findAll(pageable).map(mapper::toTemplateResponse);return new PageResponse<>(page.getContent(),page.getNumber(),page.getSize(),page.getTotalElements(),page.getTotalPages(),page.isLast());}
    @Transactional public NotificationTemplateResponse updateTemplate(Long id, NotificationTemplateRequest request){var t=templateRepo.findById(id).orElseThrow(()->new ResourceNotFoundException("Template not found"));t.setTemplateCode(request.templateCode());t.setTitleTemplate(request.titleTemplate());t.setBodyTemplate(request.bodyTemplate());t.setNotificationType(request.notificationType());if(request.active()!=null)t.setActive(request.active());return mapper.toTemplateResponse(templateRepo.save(t));}
    @Transactional(readOnly=true) public NotificationPreferenceResponse getPreference(Long userId){var pref=preferenceRepo.findByUserId(userId).orElseGet(()->preferenceRepo.save(NotificationPreference.builder().user(userRepo.findById(userId).orElseThrow(()->new ResourceNotFoundException("User not found"))).build()));return mapper.toPreferenceResponse(pref);}
    @Transactional public NotificationPreferenceResponse updatePreference(Long userId, NotificationPreferenceRequest request){var pref=preferenceRepo.findByUserId(userId).orElseGet(()->NotificationPreference.builder().user(userRepo.findById(userId).orElseThrow(()->new ResourceNotFoundException("User not found"))).build());if(request.emailEnabled()!=null)pref.setEmailEnabled(request.emailEnabled());if(request.smsEnabled()!=null)pref.setSmsEnabled(request.smsEnabled());if(request.inAppEnabled()!=null)pref.setInAppEnabled(request.inAppEnabled());if(request.approvalNotifications()!=null)pref.setApprovalNotifications(request.approvalNotifications());if(request.paymentNotifications()!=null)pref.setPaymentNotifications(request.paymentNotifications());if(request.rfqNotifications()!=null)pref.setRfqNotifications(request.rfqNotifications());return mapper.toPreferenceResponse(preferenceRepo.save(pref));}
    @Transactional(readOnly=true) public PageResponse<NotificationPreferenceResponse> preferences(Pageable pageable){var page=preferenceRepo.findAll(pageable).map(mapper::toPreferenceResponse);return new PageResponse<>(page.getContent(),page.getNumber(),page.getSize(),page.getTotalElements(),page.getTotalPages(),page.isLast());}
}
