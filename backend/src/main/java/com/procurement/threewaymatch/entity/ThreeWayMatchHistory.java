package com.procurement.threewaymatch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="three_way_match_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThreeWayMatchHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="three_way_match_history_id")
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name="three_way_match_id",nullable=false)
    private ThreeWayMatch threeWayMatch;
    @Column(nullable=false,length=50)
    private String action;
    @Column(name="performed_by",nullable=false)
    private String performedBy;
    @Enumerated(EnumType.STRING)
    @Column(name="old_status",length=20)
    private ThreeWayMatchStatus oldStatus;
    @Enumerated(EnumType.STRING)
    @Column(name="new_status",length=20)
    private ThreeWayMatchStatus newStatus;
    @Column(length=1000)
    private String remarks;
    @Column(name="performed_at",nullable=false)
    private LocalDateTime performedAt;
    @PrePersist void pre(){if(performedAt==null)performedAt=LocalDateTime.now();}
}
