package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Allergen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AllergenRepository extends JpaRepository<Allergen, Long> {
}
