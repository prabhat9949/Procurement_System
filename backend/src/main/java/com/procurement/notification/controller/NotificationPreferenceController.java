package com.procurement.notification.controller;

import com.procurement.common.response.ApiResponse;
import com.procurement.common.response.PageResponse;
import com.procurement.notification.dto.request.NotificationPreferenceRequest;
import com.procurement.notification.dto.response.NotificationPreferenceResponse;
import com.procurement.notification.service.NotificationService;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification-preferences")
public class NotificationPreferenceController {
    private final NotificationService service;
    public NotificationPreferenceController(NotificationService service){this.service=service;}
    @GetMapping
    public ApiResponse<PageResponse<NotificationPreferenceResponse>> list(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(service.preferences(PageRequest.of(page,size)));}
    @PutMapping("/{userId}")
    public ApiResponse<NotificationPreferenceResponse> update(@PathVariable Long userId,@RequestBody NotificationPreferenceRequest request){return ApiResponse.success("Preference updated",service.updatePreference(userId,request));}
}
