package com.procurement.payment.controller;

import com.procurement.common.response.*;
import com.procurement.payment.dto.request.*;
import com.procurement.payment.dto.response.*;
import com.procurement.payment.entity.PaymentStatus;
import com.procurement.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','FINANCE_MANAGER','PROCUREMENT_MANAGER','AUDITOR')")
public class PaymentController {
    private final PaymentService service;
    public PaymentController(PaymentService service){this.service=service;}
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> create(@Valid @RequestBody PaymentRequest request){return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Payment created",service.create(request)));}
    @GetMapping
    public ApiResponse<PageResponse<PaymentResponse>> search(@RequestParam(required=false)String keyword,@RequestParam(required=false)Long vendorId,@RequestParam(required=false)PaymentStatus status,@RequestParam(required=false)String paymentMethod,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size,@RequestParam(defaultValue="paymentDate")String sort,@RequestParam(defaultValue="desc")String direction){var order="asc".equalsIgnoreCase(direction)?Sort.by(sort).ascending():Sort.by(sort).descending();return ApiResponse.success(service.search(keyword,vendorId,status,paymentMethod,PageRequest.of(page,size,order)));}
    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> get(@PathVariable Long id){return ApiResponse.success(service.get(id));}
    @PutMapping("/{id}")
    public ApiResponse<PaymentResponse> update(@PathVariable Long id,@Valid @RequestBody PaymentRequest request){return ApiResponse.success("Payment updated",service.update(id,request));}
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id){service.delete(id);return ApiResponse.success("Payment deleted",null);}
    @PostMapping("/{id}/approve")
    public ApiResponse<PaymentResponse> approve(@PathVariable Long id){return ApiResponse.success("Payment approved",service.approve(id));}
    @PostMapping("/{id}/process")
    public ApiResponse<PaymentResponse> process(@PathVariable Long id){return ApiResponse.success("Payment processing",service.process(id));}
    @PostMapping("/{id}/complete")
    public ApiResponse<PaymentResponse> complete(@PathVariable Long id){return ApiResponse.success("Payment completed",service.complete(id));}
    @PostMapping("/{id}/fail")
    public ApiResponse<PaymentResponse> fail(@PathVariable Long id){return ApiResponse.success("Payment failed",service.fail(id));}
    @PostMapping("/{id}/cancel")
    public ApiResponse<PaymentResponse> cancel(@PathVariable Long id){return ApiResponse.success("Payment cancelled",service.cancel(id));}
    @PostMapping("/{id}/allocations")
    public ResponseEntity<ApiResponse<PaymentAllocationResponse>> allocation(@PathVariable Long id,@Valid @RequestBody PaymentAllocationRequest request){return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Allocation added",service.addAllocation(id,request)));}
    @GetMapping("/{id}/allocations")
    public ApiResponse<PageResponse<PaymentAllocationResponse>> allocations(@PathVariable Long id,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(service.allocations(id,PageRequest.of(page,size)));}
    @PostMapping("/{id}/attachments")
    public ResponseEntity<ApiResponse<PaymentAttachmentResponse>> attachment(@PathVariable Long id,@RequestParam String fileName,@RequestParam String filePath,@RequestParam String fileType){return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Attachment added",service.addAttachment(id,fileName,filePath,fileType)));}
    @GetMapping("/{id}/attachments")
    public ApiResponse<PageResponse<PaymentAttachmentResponse>> attachments(@PathVariable Long id,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(service.attachments(id,PageRequest.of(page,size)));}
    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public ApiResponse<Void> deleteAttachment(@PathVariable Long id,@PathVariable Long attachmentId){service.deleteAttachment(id,attachmentId);return ApiResponse.success("Attachment deleted",null);}
    @GetMapping("/{id}/history")
    public ApiResponse<PageResponse<PaymentHistoryResponse>> history(@PathVariable Long id,@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size){return ApiResponse.success(service.history(id,PageRequest.of(page,size)));}
}
