package com.procurement.notification.controller;

import com.procurement.common.response.*;
import com.procurement.notification.dto.request.*;
import com.procurement.notification.dto.response.*;
import com.procurement.notification.entity.*;
import com.procurement.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;
    public NotificationController(NotificationService service){this.service=service;}
    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> create(@Valid @RequestBody NotificationRequest request){return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Notification created",service.create(request)));}
    @GetMapping
    public ApiResponse<PageResponse<NotificationResponse>> search(@RequestParam(required=false)String keyword,@RequestParam(required=false)Long userId,@RequestParam(required=false)NotificationStatus status,@RequestParam(required=false)NotificationPriority priority,@RequestParam(required=false)NotificationType type,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size,@RequestParam(defaultValue="createdAt")String sort,@RequestParam(defaultValue="desc")String direction){var order="asc".equalsIgnoreCase(direction)?Sort.by(sort).ascending():Sort.by(sort).descending();return ApiResponse.success(service.search(keyword,userId,status,priority,type,PageRequest.of(page,size,order)));}
    @GetMapping("/{id}")
    public ApiResponse<NotificationResponse> get(@PathVariable Long id){return ApiResponse.success(service.get(id));}
    @PostMapping("/{id}/send")
    public ApiResponse<NotificationResponse> send(@PathVariable Long id,@Valid @RequestBody NotificationSendRequest request){return ApiResponse.success("Notification sent",service.send(id,request));}
    @PostMapping("/{id}/mark-read")
    public ApiResponse<NotificationResponse> markRead(@PathVariable Long id){return ApiResponse.success("Notification marked as read",service.markRead(id));}
    @PostMapping("/{id}/archive")
    public ApiResponse<NotificationResponse> archive(@PathVariable Long id){return ApiResponse.success("Notification archived",service.archive(id));}
    @GetMapping("/{id}/recipients")
    public ApiResponse<PageResponse<NotificationRecipientResponse>> recipients(@PathVariable Long id,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(service.recipients(id,PageRequest.of(page,size)));}
}
