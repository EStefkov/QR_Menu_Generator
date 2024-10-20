package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    // Custom query methods can be added here if needed
}
