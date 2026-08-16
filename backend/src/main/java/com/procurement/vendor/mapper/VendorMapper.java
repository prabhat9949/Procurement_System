package com.procurement.vendor.mapper;

import com.procurement.vendor.dto.request.VendorRequest;
import com.procurement.vendor.dto.response.VendorResponse;
import com.procurement.vendor.entity.Vendor;
import org.springframework.stereotype.Component;

@Component
public class VendorMapper {

    public Vendor toEntity(VendorRequest request) {
        Vendor vendor = new Vendor();
        updateEntity(vendor, request);
        return vendor;
    }

    public void updateEntity(Vendor vendor, VendorRequest request) {
        vendor.setVendorCode(request.vendorCode());
        vendor.setVendorName(request.vendorName());
        vendor.setContactPerson(request.contactPerson());
        vendor.setEmail(request.email());
        vendor.setPhone(request.phone());
        vendor.setMobile(request.mobile());
        vendor.setGstNumber(request.gstNumber());
        vendor.setPanNumber(request.panNumber());
        vendor.setRegistrationNumber(request.registrationNumber());
        vendor.setVendorType(request.vendorType());
        vendor.setPaymentTerms(request.paymentTerms());
        vendor.setPaymentMethod(request.paymentMethod());
        vendor.setCreditLimit(request.creditLimit());
        vendor.setCurrency(request.currency());
        vendor.setBankName(request.bankName());
        vendor.setBankAccountNumber(request.bankAccountNumber());
        vendor.setIfscCode(request.ifscCode());
        vendor.setWebsite(request.website());
        vendor.setAddressLine1(request.addressLine1());
        vendor.setAddressLine2(request.addressLine2());
        vendor.setCity(request.city());
        vendor.setState(request.state());
        vendor.setCountry(request.country());
        vendor.setPostalCode(request.postalCode());
        vendor.setStatus(request.status());
        vendor.setRating(request.rating());
        vendor.setApproved(request.approved());
    }

    public VendorResponse toResponse(Vendor vendor) {
        return new VendorResponse(
                vendor.getId(), vendor.getVendorCode(), vendor.getVendorName(),
                vendor.getContactPerson(), vendor.getEmail(), vendor.getPhone(),
                vendor.getMobile(), vendor.getGstNumber(), vendor.getPanNumber(),
                vendor.getRegistrationNumber(), vendor.getVendorType(),
                vendor.getPaymentTerms(), vendor.getPaymentMethod(), vendor.getCreditLimit(),
                vendor.getCurrency(), vendor.getBankName(), vendor.getBankAccountNumber(),
                vendor.getIfscCode(), vendor.getWebsite(), vendor.getAddressLine1(),
                vendor.getAddressLine2(), vendor.getCity(), vendor.getState(),
                vendor.getCountry(), vendor.getPostalCode(), vendor.getStatus(),
                vendor.getRating(), vendor.getApproved(), vendor.getCreatedAt(),
                vendor.getUpdatedAt(), vendor.getCreatedBy(), vendor.getUpdatedBy());
    }
}
