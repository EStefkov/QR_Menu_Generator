package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.OrderDTO;
import com.example.qr_menu.entities.Order;
import com.example.qr_menu.repositories.OrderRepository;
import com.example.qr_menu.services.OrderService;
import com.example.qr_menu.utils.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final JwtTokenUtil jwtTokenUtil;  // Inject JwtTokenUtil

    public OrderController(OrderService orderService, OrderRepository orderRepository,JwtTokenUtil jwtTokenUtil) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderDTO orderDTO, @RequestHeader("Authorization") String token) {
        // Extract the accountId from the JWT token
        String jwtToken = token.substring(7); // Remove "Bearer " prefix from the token
        Claims claims = jwtTokenUtil.getAllClaimsFromToken(jwtToken); // Get claims from the token
        Long accountId = claims.get("accountId", Long.class); // Extract accountId

        // Set accountId from JWT token into the orderDTO
        orderDTO.setAccountId(accountId);

        // Create the order using the OrderService
        Order createdOrder = orderService.createOrder(orderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }


    // New GET endpoint for paginated order retrieval
    @GetMapping
    public ResponseEntity<Page<OrderDTO>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderTime") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Pageable pageable = PageRequest.of(page, size,
                "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending());

        Page<Order> orders = orderRepository.findAll(pageable);

        Page<OrderDTO> orderDTOs = orders.map(order -> OrderDTO.builder()
                .accountId(order.getAccount().getId())
                .restorantId(order.getRestorant().getId())
                .orderStatus(order.getOrderStatus())
                .orderTime(order.getOrderTime())
                .totalPrice(order.getTotalPrice())
                .build());

        return ResponseEntity.ok(orderDTOs);
    }

}
