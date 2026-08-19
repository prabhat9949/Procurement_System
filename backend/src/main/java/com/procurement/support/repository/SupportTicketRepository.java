package com.procurement.support.repository;

import com.procurement.support.entity.SupportTicket;
import com.procurement.support.entity.SupportTicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    Optional<SupportTicket> findByTicketNumber(String ticketNumber);
    Page<SupportTicket> findByCreatedByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<SupportTicket> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(SupportTicketStatus status);
    long countByAssignedToUser_Id(Long userId);
}
