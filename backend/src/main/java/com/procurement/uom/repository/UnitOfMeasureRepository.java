package com.procurement.uom.repository;

import com.procurement.uom.entity.UnitOfMeasure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnitOfMeasureRepository extends JpaRepository<UnitOfMeasure, Long> {

    Optional<UnitOfMeasure> findByUomCode(String uomCode);

    Optional<UnitOfMeasure> findByUomName(String uomName);

    boolean existsByUomCode(String uomCode);

    boolean existsByUomName(String uomName);
}
