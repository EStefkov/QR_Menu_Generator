package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.OrderDTO;
import com.example.qr_menu.entities.Order;
import com.example.qr_menu.repositories.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Optional;

@RestController
@RequestMapping("/api/debug/orders")
@CrossOrigin(origins = "*")
public class OrderDebugController {

    private final OrderRepository orderRepository;
    
    public OrderDebugController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
    
    @GetMapping("/status-values")
    public ResponseEntity<?> getOrderStatusValues() {
        return ResponseEntity.ok(Arrays.toString(Order.OrderStatus.values()));
    }
    
    /**
     * Debug endpoint to update order status without authentication
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        
        System.out.println("[DEBUG] Updating order " + orderId + " status to " + status);
        
        try {
            // Find the order
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            
            if (orderOpt.isEmpty()) {
                System.out.println("[DEBUG] Order not found with ID: " + orderId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Order not found with ID: " + orderId);
            }
            
            Order order = orderOpt.get();
            System.out.println("[DEBUG] Found order: ID=" + order.getId() + ", Current status=" + order.getOrderStatus());
            
            // Convert String status to OrderStatus enum
            try {
                Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
                System.out.println("[DEBUG] Status converted successfully to: " + orderStatus);
                
                // Update order status
                order.setOrderStatus(orderStatus);
                Order savedOrder = orderRepository.save(order);
                System.out.println("[DEBUG] Order status updated successfully to: " + savedOrder.getOrderStatus());
                
                // Return simple response
                return ResponseEntity.ok("Order status updated successfully to: " + savedOrder.getOrderStatus());
                
            } catch (IllegalArgumentException e) {
                System.out.println("[DEBUG] Invalid status value: " + status);
                System.out.println("[DEBUG] Valid values are: " + Arrays.toString(Order.OrderStatus.values()));
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid order status: " + status + ". Valid values are: " 
                             + Arrays.toString(Order.OrderStatus.values()));
            }
            
        } catch (Exception e) {
            System.out.println("[DEBUG] Unexpected error occurred: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating order status: " + e.getMessage());
        }
    }
} 