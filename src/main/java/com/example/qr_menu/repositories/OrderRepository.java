package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Custom query methods (if needed) can be added here

    Page<Order> findAll(Pageable pageable);
}
