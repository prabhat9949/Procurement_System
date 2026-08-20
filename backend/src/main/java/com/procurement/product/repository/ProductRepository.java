package com.procurement.product.repository;

import com.procurement.category.entity.Category;
import com.procurement.product.entity.Product;
import com.procurement.vendor.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findByProductCode(String productCode);

    Optional<Product> findBySku(String sku);

    List<Product> findByCategory(Category category);

    List<Product> findByVendor(Vendor vendor);

    boolean existsByProductCode(String productCode);

    boolean existsBySku(String sku);

    long countByCategoryId(Long categoryId);

    long countByActiveTrue();
}
