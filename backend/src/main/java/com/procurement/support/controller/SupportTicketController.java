package com.procurement.support.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.security.service.CustomUserDetails;
import com.procurement.support.dto.*;
import com.procurement.support.service.SupportTicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support-tickets")
public class SupportTicketController {

    private final SupportTicketService service;

    public SupportTicketController(SupportTicketService service) {
        this.service = service;
    }

    /** Any authenticated user can create a support ticket. */
    @PostMapping
    public ApiResponse<SupportTicketResponse> create(
            @Valid @RequestBody CreateSupportTicketRequest req,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ApiResponse.success("Support ticket created", service.create(req, user.userId()));
    }

    /** Current user's own tickets. */
    @GetMapping("/my")
    public ApiResponse<Page<SupportTicketResponse>> myTickets(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(service.listMyTickets(user.userId(), page, size));
    }

    /** Admin/support can see all tickets. */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','SUPPORT_TEAM') or hasAuthority('CAN_VIEW_ALL_SUPPORT_TICKETS')")
    public ApiResponse<Page<SupportTicketResponse>> allTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(service.listAllTickets(page, size));
    }

    /** Get a specific ticket. */
    @GetMapping("/{ticketId}")
    public ApiResponse<SupportTicketResponse> getTicket(@PathVariable Long ticketId) {
        return ApiResponse.success(service.getTicket(ticketId));
    }

    /** Get messages for a ticket. */
    @GetMapping("/{ticketId}/messages")
    public ApiResponse<List<SupportTicketMessageResponse>> getMessages(@PathVariable Long ticketId) {
        return ApiResponse.success(service.getMessages(ticketId));
    }

    /** Add a reply/message to a ticket. */
    @PostMapping("/{ticketId}/messages")
    public ApiResponse<SupportTicketMessageResponse> addMessage(
            @PathVariable Long ticketId,
            @Valid @RequestBody AddMessageRequest req,
            @AuthenticationPrincipal CustomUserDetails user) {
        return ApiResponse.success("Message sent", service.addMessage(ticketId, req.messageText(), user.userId()));
    }

    /** Update ticket status. */
    @PutMapping("/{ticketId}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','SUPPORT_TEAM')")
    public ApiResponse<SupportTicketResponse> updateStatus(
            @PathVariable Long ticketId,
            @RequestParam String status) {
        return ApiResponse.success("Status updated", service.updateStatus(ticketId, status));
    }

    /** Support ticket counts for dashboard overview. */
    @GetMapping("/counts")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','SUPPORT_TEAM')")
    public ApiResponse<Object> counts() {
        return ApiResponse.success(new java.util.HashMap<>() {{
            put("open", service.countOpen());
            put("inProgress", service.countInProgress());
            put("resolved", service.countResolved());
        }});
    }
}
