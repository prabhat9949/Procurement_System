package com.procurement.category.repository;

import com.procurement.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {

    Optional<Category> findByCategoryCode(String categoryCode);

    boolean existsByCategoryCode(String categoryCode);

    List<Category> findByActiveTrue();

    java.util.List<Category> findByParentCategoryId(Long parentCategoryId);

    long countByParentCategoryId(Long parentCategoryId);

    long countByActiveTrue();
}
