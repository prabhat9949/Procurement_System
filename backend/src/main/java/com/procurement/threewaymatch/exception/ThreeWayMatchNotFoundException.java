package com.procurement.threewaymatch.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class ThreeWayMatchNotFoundException extends ResourceNotFoundException {
    public ThreeWayMatchNotFoundException(Long id) { super("Three-way match not found: " + id); }
}
