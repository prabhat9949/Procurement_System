package com.procurement.notification.exception;

import com.procurement.common.exception.ResourceNotFoundException;

public class NotificationNotFoundException extends ResourceNotFoundException {
    public NotificationNotFoundException(Long id){super("Notification not found: "+id);}
}
