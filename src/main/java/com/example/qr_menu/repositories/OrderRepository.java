package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Custom query methods (if needed) can be added here

    Page<Order> findAll(Pageable pageable);
    
    // Count orders by account ID
    @Query("SELECT COUNT(o) FROM Order o WHERE o.account.id = :accountId")
    long countByAccountId(@Param("accountId") Long accountId);
}
