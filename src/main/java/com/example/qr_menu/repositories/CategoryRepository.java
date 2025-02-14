package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByMenuId(Long menuId);
}
