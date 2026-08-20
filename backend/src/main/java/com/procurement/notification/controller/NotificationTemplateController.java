package com.procurement.notification.controller;

import com.procurement.common.response.*;
import com.procurement.notification.dto.request.NotificationTemplateRequest;
import com.procurement.notification.dto.response.NotificationTemplateResponse;
import com.procurement.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification-templates")
public class NotificationTemplateController {
    private final NotificationService service;
    public NotificationTemplateController(NotificationService service){this.service=service;}
    @PostMapping
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> create(@Valid @RequestBody NotificationTemplateRequest request){return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Template created",service.createTemplate(request)));}
    @GetMapping
    public ApiResponse<PageResponse<NotificationTemplateResponse>> list(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size,@RequestParam(defaultValue="id")String sort,@RequestParam(defaultValue="desc")String direction){var order="asc".equalsIgnoreCase(direction)?Sort.by(sort).ascending():Sort.by(sort).descending();return ApiResponse.success(service.templates(PageRequest.of(page,size,order)));}
    @PutMapping("/{id}")
    public ApiResponse<NotificationTemplateResponse> update(@PathVariable Long id,@Valid @RequestBody NotificationTemplateRequest request){return ApiResponse.success("Template updated",service.updateTemplate(id,request));}
}
