package com.procurement.uom.service;

import com.procurement.common.exception.ResourceNotFoundException;
import com.procurement.uom.dto.response.UomResponse;
import com.procurement.uom.entity.UnitOfMeasure;
import com.procurement.uom.repository.UnitOfMeasureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UnitOfMeasureService {

    private final UnitOfMeasureRepository unitOfMeasureRepository;

    public UnitOfMeasureService(UnitOfMeasureRepository unitOfMeasureRepository) {
        this.unitOfMeasureRepository = unitOfMeasureRepository;
    }

    @Transactional(readOnly = true)
    public List<UomResponse> listAll() {
        return unitOfMeasureRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UomResponse getById(Long id) {
        return toResponse(unitOfMeasureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UOM not found: " + id)));
    }

    private UomResponse toResponse(UnitOfMeasure uom) {
        return new UomResponse(uom.getId(), uom.getUomCode(), uom.getUomName(),
                uom.getDescription(), uom.getActive(), uom.getCreatedAt(), uom.getUpdatedAt());
    }
}
