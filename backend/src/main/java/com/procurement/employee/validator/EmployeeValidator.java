package com.procurement.employee.validator;

import com.procurement.common.exception.BadRequestException;
import com.procurement.employee.dto.request.EmployeeRequest;
import org.springframework.stereotype.Component;

@Component
public class EmployeeValidator {

    public void validate(EmployeeRequest request) {
        if (request.managerId() != null && request.managerId().equals(request.roleId())) {
            // This guards a common UI mistake where roleId is accidentally sent as managerId.
            throw new BadRequestException("Manager selection is invalid");
        }
    }
}
