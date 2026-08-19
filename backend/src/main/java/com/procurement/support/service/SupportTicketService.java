package com.procurement.support.service;

import com.procurement.support.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

public interface SupportTicketService {
    SupportTicketResponse create(CreateSupportTicketRequest req, Long currentUserId);
    Page<SupportTicketResponse> listMyTickets(Long userId, int page, int size);
    Page<SupportTicketResponse> listAllTickets(int page, int size);
    SupportTicketResponse getTicket(Long ticketId);
    List<SupportTicketMessageResponse> getMessages(Long ticketId);
    SupportTicketMessageResponse addMessage(Long ticketId, String text, Long currentUserId);
    SupportTicketResponse updateStatus(Long ticketId, String status);
    long countOpen();
    long countInProgress();
    long countResolved();
}
