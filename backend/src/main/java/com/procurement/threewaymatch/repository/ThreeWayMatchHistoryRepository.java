package com.procurement.threewaymatch.repository;

import com.procurement.threewaymatch.entity.ThreeWayMatchHistory;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThreeWayMatchHistoryRepository extends JpaRepository<ThreeWayMatchHistory,Long> {
    List<ThreeWayMatchHistory> findByThreeWayMatchIdOrderByPerformedAtDesc(Long id);
}
