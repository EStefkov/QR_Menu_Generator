package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Restorant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantRepository extends JpaRepository<Restorant, Long> {
    // Custom query methods can be added here if needed
}