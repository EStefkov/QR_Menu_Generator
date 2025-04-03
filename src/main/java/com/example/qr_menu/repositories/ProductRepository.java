package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByMenuId(Long menuId);

    @Query("SELECT p FROM Product p WHERE p.menu = :menu AND p.productImage = :oldImage")
    List<Product> findByMenuAndOldDefaultImage(@Param("menu") Menu menu, @Param("oldImage") String oldImage);
    
    @Query("SELECT p FROM Product p WHERE p.menu = :menu AND p.productImage = :imagePath")
    List<Product> findByMenuAndProductImage(@Param("menu") Menu menu, @Param("imagePath") String imagePath);
}
