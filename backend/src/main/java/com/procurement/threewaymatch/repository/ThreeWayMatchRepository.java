package com.procurement.threewaymatch.repository;

import com.procurement.threewaymatch.entity.ThreeWayMatch;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThreeWayMatchRepository extends JpaRepository<ThreeWayMatch,Long>, JpaSpecificationExecutor<ThreeWayMatch> {
    Optional<ThreeWayMatch> findByMatchNumber(String matchNumber);
    boolean existsByMatchNumber(String matchNumber);
}
