package com.procurement.product.mapper;

import com.procurement.category.entity.Category;
import com.procurement.product.dto.request.ProductRequest;
import com.procurement.product.dto.response.ProductResponse;
import com.procurement.product.entity.Product;
import com.procurement.uom.entity.UnitOfMeasure;
import com.procurement.vendor.entity.Vendor;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequest request, Category category, Vendor vendor,
                            UnitOfMeasure unitOfMeasure) {
        Product product = new Product();
        updateEntity(product, request, category, vendor, unitOfMeasure);
        return product;
    }

    public void updateEntity(Product product, ProductRequest request, Category category,
                             Vendor vendor, UnitOfMeasure unitOfMeasure) {
        product.setProductCode(request.productCode());
        product.setSku(request.sku());
        product.setProductName(request.productName());
        product.setDescription(request.description());
        product.setBrand(request.brand());
        product.setManufacturer(request.manufacturer());
        product.setCategory(category);
        product.setVendor(vendor);
        product.setUnitOfMeasure(unitOfMeasure);
        product.setUnitPrice(request.unitPrice());
        product.setCurrency(request.currency().trim().toUpperCase());
        product.setMinimumStock(request.minimumStock());
        product.setMaximumStock(request.maximumStock());
        product.setReorderLevel(request.reorderLevel());
        product.setLeadTimeDays(request.leadTimeDays());
        product.setTaxPercentage(request.taxPercentage());
        product.setActive(request.active());
    }

    public ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(), product.getProductCode(), product.getSku(),
                product.getProductName(), product.getDescription(), product.getBrand(),
                product.getManufacturer(), product.getCategory().getId(),
                product.getCategory().getCategoryName(), product.getVendor().getId(),
                product.getVendor().getVendorName(), product.getUnitOfMeasure().getId(),
                product.getUnitOfMeasure().getUomCode(), product.getUnitOfMeasure().getUomName(),
                product.getUnitPrice(), product.getCurrency(), product.getMinimumStock(),
                product.getMaximumStock(), product.getReorderLevel(), product.getLeadTimeDays(),
                product.getTaxPercentage(), product.getActive(), product.getCreatedBy(),
                product.getUpdatedBy(), product.getCreatedAt(), product.getUpdatedAt());
    }
}
