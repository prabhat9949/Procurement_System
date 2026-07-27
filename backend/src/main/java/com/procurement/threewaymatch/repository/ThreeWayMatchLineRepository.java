package com.procurement.threewaymatch.repository;

import com.procurement.threewaymatch.entity.ThreeWayMatchLine;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThreeWayMatchLineRepository extends JpaRepository<ThreeWayMatchLine,Long> {
    List<ThreeWayMatchLine> findByThreeWayMatchId(Long id);
}
