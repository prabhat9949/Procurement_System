package com.procurement.employee.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class EmployeeNotFoundException extends ResourceNotFoundException {

    public EmployeeNotFoundException(Long id) {
        super("Employee not found: " + id);
    }
}
