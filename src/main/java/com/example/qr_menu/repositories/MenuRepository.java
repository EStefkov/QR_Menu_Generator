package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    // Custom query methods can be added here if needed

    @Query("SELECT m FROM Menu m JOIN m.products p WHERE m.restorant.id = :restorantId")
    List<Menu> findMenusWithProductsByRestorantId(@Param("restorantId") Long restorantId);

    List<Menu> findByRestorantId(Long restorantId);

    @Query("SELECT m FROM Menu m JOIN FETCH m.restorant WHERE m.restorant.id = :restorantId")
    List<Menu> findByRestorantIdWithRestorant(@Param("restorantId") Long restorantId);
}
