package com.procurement.support.service;

import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.support.dto.*;
import com.procurement.support.entity.*;
import com.procurement.support.repository.SupportTicketMessageRepository;
import com.procurement.support.repository.SupportTicketRepository;
import com.procurement.user.entity.User;
import com.procurement.user.repository.UserRepository;
import com.procurement.security.service.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository tickets;
    private final SupportTicketMessageRepository messages;
    private final UserRepository users;

    public SupportTicketServiceImpl(SupportTicketRepository tickets,
                                     SupportTicketMessageRepository messages,
                                     UserRepository users) {
        this.tickets = tickets;
        this.messages = messages;
        this.users = users;
    }

    @Override
    @Transactional
    public SupportTicketResponse create(CreateSupportTicketRequest req, Long currentUserId) {
        User user = users.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        long count = tickets.count();
        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber("SUP-" + java.time.Year.now().getValue() + "-" + String.format("%06d", count + 1))
                .subject(req.subject())
                .description(req.description())
                .priority(req.priority() != null ? req.priority() : SupportTicketPriority.MEDIUM)
                .category(req.category())
                .status(SupportTicketStatus.OPEN)
                .createdByUser(user)
                .build();
        ticket = tickets.save(ticket);
        // Add the first message with the description
        SupportTicketMessage msg = SupportTicketMessage.builder()
                .ticket(ticket)
                .messageText(req.description())
                .sender(user)
                .senderRole(user.getRole() != null ? user.getRole().getRoleCode() : "USER")
                .read(false)
                .build();
        messages.save(msg);
        return toResponse(ticket, 1);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupportTicketResponse> listMyTickets(Long userId, int page, int size) {
        return tickets.findByCreatedByUser_IdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(t -> {
                    long unread = messages.countByTicketIdAndReadFalse(t.getId());
                    return toResponse(t, unread);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupportTicketResponse> listAllTickets(int page, int size) {
        return tickets.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(t -> {
                    long unread = messages.countByTicketIdAndReadFalse(t.getId());
                    return toResponse(t, unread);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public SupportTicketResponse getTicket(Long ticketId) {
        SupportTicket ticket = tickets.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found"));
        long unread = messages.countByTicketIdAndReadFalse(ticket.getId());
        return toResponse(ticket, unread);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketMessageResponse> getMessages(Long ticketId) {
        return messages.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Override
    @Transactional
    public SupportTicketMessageResponse addMessage(Long ticketId, String text, Long currentUserId) {
        SupportTicket ticket = tickets.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found"));
        User user = users.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        SupportTicketMessage msg = SupportTicketMessage.builder()
                .ticket(ticket)
                .messageText(text)
                .sender(user)
                .senderRole(user.getRole() != null ? user.getRole().getRoleCode() : "USER")
                .read(false)
                .build();
        msg = messages.save(msg);
        ticket.setLastMessageAt(LocalDateTime.now());
        // If ticket was RESOLVED or CLOSED, reopen it
        if (ticket.getStatus() == SupportTicketStatus.RESOLVED || ticket.getStatus() == SupportTicketStatus.CLOSED) {
            ticket.setStatus(SupportTicketStatus.OPEN);
        }
        tickets.save(ticket);
        return toMessageResponse(msg);
    }

    @Override
    @Transactional
    public SupportTicketResponse updateStatus(Long ticketId, String status) {
        SupportTicket ticket = tickets.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Support ticket not found"));
        ticket.setStatus(SupportTicketStatus.valueOf(status));
        return toResponse(ticket, messages.countByTicketIdAndReadFalse(ticket.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public long countOpen() {
        return tickets.countByStatus(SupportTicketStatus.OPEN);
    }

    @Override
    @Transactional(readOnly = true)
    public long countInProgress() {
        return tickets.countByStatus(SupportTicketStatus.IN_PROGRESS);
    }

    @Override
    @Transactional(readOnly = true)
    public long countResolved() {
        return tickets.countByStatus(SupportTicketStatus.RESOLVED);
    }

    private SupportTicketResponse toResponse(SupportTicket t, long unread) {
        return new SupportTicketResponse(
                t.getId(), t.getTicketNumber(), t.getSubject(), t.getDescription(),
                t.getStatus().name(), t.getPriority().name(), t.getCategory(),
                t.getCreatedByUser() != null ? t.getCreatedByUser().getUsername() : null,
                t.getCreatedByUser() != null && t.getCreatedByUser().getEmployee() != null
                        ? t.getCreatedByUser().getEmployee().getFirstName() + " " + t.getCreatedByUser().getEmployee().getLastName()
                        : null,
                t.getAssignedToUser() != null ? t.getAssignedToUser().getUsername() : null,
                unread, t.getCreatedAt(), t.getUpdatedAt()
        );
    }

    private SupportTicketMessageResponse toMessageResponse(SupportTicketMessage m) {
        return new SupportTicketMessageResponse(
                m.getId(), m.getTicket().getId(),
                m.getMessageText(),
                m.getSender() != null ? m.getSender().getUsername() : null,
                m.getSender() != null && m.getSender().getEmployee() != null
                        ? m.getSender().getEmployee().getFirstName() + " " + m.getSender().getEmployee().getLastName()
                        : null,
                m.getSenderRole(),
                m.getRead(),
                m.getCreatedAt()
        );
    }
}
