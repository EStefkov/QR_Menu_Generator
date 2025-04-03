package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Order;
import com.example.qr_menu.entities.OrderProduct;
import com.example.qr_menu.entities.OrderProductId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderProductRepository extends JpaRepository<OrderProduct, OrderProductId> {
    List<OrderProduct> findByOrder(Order order);
    List<OrderProduct> findByOrderId(Long orderId);
} 