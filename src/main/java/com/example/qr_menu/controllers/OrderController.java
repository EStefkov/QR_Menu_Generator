package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.OrderDTO;
import com.example.qr_menu.entities.Order;
import com.example.qr_menu.repositories.OrderRepository;
import com.example.qr_menu.services.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    public OrderController(OrderService orderService, OrderRepository orderRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderDTO orderDTO) {
        Order createdOrder = orderService.createOrder(orderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    // New GET endpoint for paginated order retrieval
    @GetMapping
    public ResponseEntity<Page<OrderDTO>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findAll(pageable);

        Page<OrderDTO> orderDTOs = orders.map(order -> {
            OrderDTO orderDTO = OrderDTO.builder()
                    .accountId(order.getAccount().getId())
                    .restorantId(order.getRestorant().getId())
                    .orderStatus(order.getOrderStatus())
                    .build();
            // Map other fields as needed
            return orderDTO;
        });

        return ResponseEntity.ok(orderDTOs);
    }

}
