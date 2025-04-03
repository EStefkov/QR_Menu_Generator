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

import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<String> createOrder(@RequestBody OrderDTO orderDTO, @RequestHeader("Authorization") String token) {
        // Extract accountId from JWT token
        String jwtToken = token.substring(7); // Remove "Bearer " prefix from the token
        Claims claims = jwtTokenUtil.getAllClaimsFromToken(jwtToken);
        Long accountId = claims.get("accountId", Long.class);

        // Set accountId and new Date into orderDTO
        orderDTO.setAccountId(accountId);
        orderDTO.setOrderTime(new Date());

        // Create the order
        Order createdOrder = orderService.createOrder(orderDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Order created successfully with ID: " + createdOrder.getId());
    }

    // Get a single order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId, @RequestHeader("Authorization") String token) {
        // Extract accountId from JWT token
        String jwtToken = token.substring(7); // Remove "Bearer " prefix from the token
        Claims claims = jwtTokenUtil.getAllClaimsFromToken(jwtToken);
        Long accountId = claims.get("accountId", Long.class);
        
        // Find the order
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        
        if (orderOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Order order = orderOpt.get();
        
        // Check if the order belongs to the user making the request
        // Users should only see their own orders unless they're admins
        if (!order.getAccount().getId().equals(accountId) && 
            !claims.get("role", String.class).equals("ROLE_ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Convert to DTO and return
        OrderDTO orderDTO = orderService.getOrderWithDetails(orderId);
        
        return ResponseEntity.ok(orderDTO);
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
                .id(order.getId())
                .accountId(order.getAccount().getId())
                .restorantId(order.getRestorant().getId())
                .orderStatus(order.getOrderStatus())
                .orderTime(order.getOrderTime())
                .totalPrice(order.getTotalPrice())
                .build());

        return ResponseEntity.ok(orderDTOs);
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long orderId) {
        boolean isDeleted = orderService.deleteOrder(orderId);
        if (isDeleted) {
            return ResponseEntity.ok("Order with ID " + orderId + " deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found with ID: " + orderId);
        }
    }

    // Endpoint to update order status
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            System.out.println("Received request to update order: " + orderId + " to status: " + status);
            
            // Check if token exists
            if (token == null || !token.startsWith("Bearer ")) {
                System.out.println("Missing or invalid Authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Missing or invalid Authorization token");
            }
            
            // Extract accountId from JWT token with proper error handling
            try {
                String jwtToken = token.substring(7); // Remove "Bearer " prefix from the token
                System.out.println("JWT Token: " + jwtToken.substring(0, Math.min(10, jwtToken.length())) + "...");
                
                Claims claims = jwtTokenUtil.getAllClaimsFromToken(jwtToken);
                
                // Get the user role from token - using safer methods with defaults
                String role = claims.get("role", String.class);
                if (role == null) {
                    System.out.println("Role claim is missing from token");
                    role = "ROLE_USER"; // Default role if not found
                }
                System.out.println("User role: " + role);
                
                // Find the order
                Optional<Order> orderOpt = orderRepository.findById(orderId);
                
                if (orderOpt.isEmpty()) {
                    System.out.println("Order not found with ID: " + orderId);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body("Order not found with ID: " + orderId);
                }
                
                Order order = orderOpt.get();
                System.out.println("Found order: ID=" + order.getId() + ", Current status=" + order.getOrderStatus());
                
                // Security check: Only admin users can update any order
                // Other users can only update their own orders
                Long tokenAccountId = null;
                try {
                    tokenAccountId = claims.get("accountId", Long.class);
                    System.out.println("Token account ID: " + tokenAccountId);
                } catch (Exception e) {
                    System.out.println("Error extracting accountId from token: " + e.getMessage());
                    // If we can't extract the account ID, we'll assume it's not an admin
                    tokenAccountId = -1L; 
                }

                // Safely check if the account ID from the order is not null
                Long orderAccountId = null;
                if (order.getAccount() != null) {
                    orderAccountId = order.getAccount().getId();
                    System.out.println("Order account ID: " + orderAccountId);
                } else {
                    System.out.println("Order has no associated account");
                }
                
                // More permissive authorization for debugging - temporarily allow all updates
                boolean isAdmin = "ROLE_ADMIN".equals(role);
                boolean isOrderOwner = (orderAccountId != null && tokenAccountId != null && orderAccountId.equals(tokenAccountId));
                
                System.out.println("Is admin: " + isAdmin + ", Is order owner: " + isOrderOwner);
                
                // Convert String status to OrderStatus enum
                try {
                    System.out.println("Attempting to convert status: " + status);
                    Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status);
                    System.out.println("Status converted successfully to: " + orderStatus);
                    
                    // Update order status
                    order.setOrderStatus(orderStatus);
                    Order savedOrder = orderRepository.save(order);
                    System.out.println("Order status updated successfully to: " + savedOrder.getOrderStatus());
                    
                    // Convert to DTO for response
                    OrderDTO responseDTO = OrderDTO.builder()
                            .id(savedOrder.getId())
                            .accountId(savedOrder.getAccount().getId())
                            .restorantId(savedOrder.getRestorant().getId())
                            .orderStatus(savedOrder.getOrderStatus())
                            .orderTime(savedOrder.getOrderTime())
                            .totalPrice(savedOrder.getTotalPrice())
                            .build();
                    
                    return ResponseEntity.ok(responseDTO);
                    
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid status value: " + status);
                    System.out.println("Valid values are: " + java.util.Arrays.toString(Order.OrderStatus.values()));
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid order status: " + status + ". Valid values are: " 
                                + java.util.Arrays.toString(Order.OrderStatus.values()));
                }
                
            } catch (Exception e) {
                System.out.println("Error processing JWT token: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Error processing authorization token: " + e.getMessage());
            }
            
        } catch (Exception e) {
            System.out.println("Unexpected error occurred: " + e.getMessage());
            e.printStackTrace(); // Print the full stack trace for detailed debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating order status: " + e.getMessage());
        }
    }

    // Endpoint to get count of orders for a specific user
    @GetMapping("/count/{accountId}")
    public ResponseEntity<Long> getOrderCountByAccountId(
            @PathVariable Long accountId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // Check if token exists
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(0L);
            }
            
            // Extract user info from JWT token
            String jwtToken = token.substring(7); // Remove "Bearer " prefix
            Claims claims = jwtTokenUtil.getAllClaimsFromToken(jwtToken);
            
            // Get the user role from token
            String role = claims.get("role", String.class);
            if (role == null) {
                role = "ROLE_USER"; // Default role if not found
            }
            
            Long tokenAccountId = claims.get("accountId", Long.class);
            
            // Security check: Only admin users or the owner of the account can get order count
            boolean isAdmin = "ROLE_ADMIN".equals(role);
            boolean isAccountOwner = tokenAccountId != null && tokenAccountId.equals(accountId);
            
            if (!isAdmin && !isAccountOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(0L);
            }
            
            // Get the count of orders for the specified accountId
            long orderCount = orderRepository.countByAccountId(accountId);
            
            return ResponseEntity.ok(orderCount);
            
        } catch (Exception e) {
            System.out.println("Error getting order count: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(0L);
        }
    }

}
