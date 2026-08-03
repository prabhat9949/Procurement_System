package com.procurement.employee.service;

import com.procurement.common.response.PageResponse;
import com.procurement.employee.dto.request.EmployeeRequest;
import com.procurement.employee.dto.response.EmployeeResponse;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {

    EmployeeResponse create(EmployeeRequest request);

    PageResponse<EmployeeResponse> search(String keyword, Long departmentId, Long costCenterId,
                                          Long roleId, Long managerId, Boolean active,
                                          Pageable pageable);

    EmployeeResponse getById(Long id);

    EmployeeResponse update(Long id, EmployeeRequest request);

    void delete(Long id);
}
