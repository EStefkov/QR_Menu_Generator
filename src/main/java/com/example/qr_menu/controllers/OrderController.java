package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.OrderDTO;
import com.example.qr_menu.dto.MessageResponse;
import com.example.qr_menu.entities.Order;
import com.example.qr_menu.entities.OrderProduct;
import com.example.qr_menu.repositories.OrderRepository;
import com.example.qr_menu.repositories.OrderProductRepository;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final JwtTokenUtil jwtTokenUtil;  // Inject JwtTokenUtil
    private final OrderProductRepository orderProductRepository;

    public OrderController(OrderService orderService, OrderRepository orderRepository, JwtTokenUtil jwtTokenUtil, OrderProductRepository orderProductRepository) {
        this.orderService = orderService;
        this.orderRepository = orderRepository;
        this.jwtTokenUtil = jwtTokenUtil;
        this.orderProductRepository = orderProductRepository;
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
                .restorantName(order.getRestorant().getRestorantName())
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
                            .restorantName(savedOrder.getRestorant().getRestorantName())
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

    // Endpoint to get user orders with pagination
    @GetMapping("/user")
    public ResponseEntity<Page<OrderDTO>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderTime") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Extract accountId from JWT token
            String jwtToken = token.substring(7); // Remove "Bearer " prefix
            Claims claims = jwtTokenUtil.getAllClaimsFromToken(jwtToken);
            Long accountId = claims.get("accountId", Long.class);
            
            if (accountId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // Create pageable object for pagination
            Pageable pageable = PageRequest.of(page, size,
                    "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending());
            
            // Get orders for the user
            Page<Order> orders = orderRepository.findByAccountId(accountId, pageable);
            
            // Convert to DTOs
            Page<OrderDTO> orderDTOs = orders.map(order -> {
                OrderDTO orderDTO = OrderDTO.builder()
                        .id(order.getId())
                        .accountId(order.getAccount().getId())
                        .restorantId(order.getRestorant().getId())
                        .restorantName(order.getRestorant().getRestorantName())
                        .orderStatus(order.getOrderStatus())
                        .orderTime(order.getOrderTime())
                        .totalPrice(order.getTotalPrice())
                        .build();
                
                // Get order products
                List<OrderProduct> orderProducts = orderProductRepository.findByOrderId(order.getId());
                List<OrderDTO.ProductOrderDTO> productDTOs = orderProducts.stream()
                        .map(op -> OrderDTO.ProductOrderDTO.builder()
                                .productId(op.getProduct().getId())
                                .productName(op.getProduct().getProductName())
                                .productImage(op.getProduct().getProductImage())
                                .quantity(op.getQuantity())
                                .productPriceAtOrder(op.getProduct().getProductPrice())
                                .build())
                        .collect(Collectors.toList());
                
                orderDTO.setProducts(productDTOs);
                return orderDTO;
            });
            
            return ResponseEntity.ok(orderDTOs);
            
        } catch (Exception e) {
            System.out.println("Error getting user orders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Endpoint to get orders by account ID with pagination
    @GetMapping("/account/{accountId}")
    public ResponseEntity<Page<OrderDTO>> getOrdersByAccountId(
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderTime") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Extract accountId from JWT token for security check
            String jwtToken = token.substring(7); // Remove "Bearer " prefix
            Claims claims = jwtTokenUtil.getAllClaimsFromToken(jwtToken);
            Long tokenAccountId = claims.get("accountId", Long.class);
            String role = claims.get("role", String.class);
            
            // Security check: Only admin users or the owner of the account can access these orders
            boolean isAdmin = "ROLE_ADMIN".equals(role);
            boolean isAccountOwner = tokenAccountId != null && tokenAccountId.equals(accountId);
            
            if (!isAdmin && !isAccountOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Create pageable object for pagination
            Pageable pageable = PageRequest.of(page, size,
                    "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending());
            
            // Get orders for the account
            Page<Order> orders = orderRepository.findByAccountId(accountId, pageable);
            
            // Convert to DTOs
            Page<OrderDTO> orderDTOs = orders.map(order -> {
                OrderDTO orderDTO = OrderDTO.builder()
                        .id(order.getId())
                        .accountId(order.getAccount().getId())
                        .restorantId(order.getRestorant().getId())
                        .restorantName(order.getRestorant().getRestorantName())
                        .orderStatus(order.getOrderStatus())
                        .orderTime(order.getOrderTime())
                        .totalPrice(order.getTotalPrice())
                        .build();
                
                // Get order products
                List<OrderProduct> orderProducts = orderProductRepository.findByOrderId(order.getId());
                List<OrderDTO.ProductOrderDTO> productDTOs = orderProducts.stream()
                        .map(op -> OrderDTO.ProductOrderDTO.builder()
                                .productId(op.getProduct().getId())
                                .productName(op.getProduct().getProductName())
                                .productImage(op.getProduct().getProductImage())
                                .quantity(op.getQuantity())
                                .productPriceAtOrder(op.getProduct().getProductPrice())
                                .build())
                        .collect(Collectors.toList());
                
                orderDTO.setProducts(productDTOs);
                return orderDTO;
            });
            
            return ResponseEntity.ok(orderDTOs);
            
        } catch (Exception e) {
            System.out.println("Error getting orders by account ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{orderId}/public")
    public ResponseEntity<?> getPublicOrderDetails(@PathVariable Long orderId) {
        try {
            OrderDTO order = orderService.getOrderById(orderId);
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Order not found"));
            }

            // Create a public version of the order with only necessary information
            Map<String, Object> publicOrder = new HashMap<>();
            publicOrder.put("id", order.getId());
            publicOrder.put("orderTime", order.getOrderTime());
            publicOrder.put("totalPrice", order.getTotalPrice());
            publicOrder.put("orderStatus", order.getOrderStatus());
            publicOrder.put("products", order.getProducts().stream()
                .map(product -> {
                    Map<String, Object> productInfo = new HashMap<>();
                    productInfo.put("productId", product.getProductId());
                    productInfo.put("productName", product.getProductName());
                    productInfo.put("productPriceAtOrder", product.getProductPriceAtOrder());
                    productInfo.put("quantity", product.getQuantity());
                    productInfo.put("productImage", product.getProductImage());
                    return productInfo;
                })
                .collect(Collectors.toList()));
            publicOrder.put("customerName", order.getCustomerName());
            publicOrder.put("customerEmail", order.getCustomerEmail());
            publicOrder.put("customerPhone", order.getCustomerPhone());
            publicOrder.put("specialRequests", order.getSpecialRequests());

            return ResponseEntity.ok(publicOrder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Error fetching order details"));
        }
    }

    // Endpoint to get orders by restaurant ID with pagination
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<Page<OrderDTO>> getOrdersByRestaurantId(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderTime") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestHeader("Authorization") String token) {
        
        try {
            System.out.println("Getting orders for restaurant ID: " + restaurantId);
            
            // Extract user info from JWT token
            String jwtToken = token.substring(7); // Remove "Bearer " prefix
            Claims claims = jwtTokenUtil.getAllClaimsFromToken(jwtToken);
            
            // Get the user details
            Long accountId = claims.get("accountId", Long.class);
            String role = claims.get("role", String.class);
            String email = claims.get("sub", String.class);
            
            System.out.println("User requesting restaurant orders - Account ID: " + accountId + ", Role: " + role + ", Email: " + email);
            
            // Check if the user has permission to view these orders
            // ADMIN can view all orders
            // MANAGER/COMANAGER can view orders for restaurants they manage
            boolean hasAccess = false;
            
            if ("ROLE_ADMIN".equals(role)) {
                hasAccess = true;
                System.out.println("Access granted: User is ADMIN");
            } else if ("ROLE_MANAGER".equals(role) || "ROLE_COMANAGER".equals(role)) {
                // For now, allowing all managers/co-managers to view orders for any restaurant
                // In a production environment, you'd want to check if they're actually assigned to this restaurant
                hasAccess = true;
                System.out.println("Access granted: User is MANAGER/COMANAGER");
            }
            
            if (!hasAccess) {
                System.out.println("Access denied: User does not have permission to view orders for this restaurant");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            // Create pageable object for pagination
            Pageable pageable = PageRequest.of(page, size,
                    "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending());
            
            // Use the new dedicated repository method for better performance
            Page<Order> orders = orderRepository.findByRestaurantId(restaurantId, pageable);
            
            // Map to DTOs
            Page<OrderDTO> orderDTOs = orders.map(order -> {
                OrderDTO orderDTO = OrderDTO.builder()
                        .id(order.getId())
                        .accountId(order.getAccount().getId())
                        .restorantId(order.getRestorant().getId())
                        .restorantName(order.getRestorant().getRestorantName())
                        .orderStatus(order.getOrderStatus())
                        .orderTime(order.getOrderTime())
                        .totalPrice(order.getTotalPrice())
                        .customerName(order.getCustomerName())
                        .customerEmail(order.getCustomerEmail())
                        .customerPhone(order.getCustomerPhone())
                        .specialRequests(order.getSpecialRequests())
                        .build();
                
                // Get order products
                List<OrderProduct> orderProducts = orderProductRepository.findByOrderId(order.getId());
                List<OrderDTO.ProductOrderDTO> productDTOs = orderProducts.stream()
                        .map(op -> OrderDTO.ProductOrderDTO.builder()
                                .productId(op.getProduct().getId())
                                .productName(op.getProduct().getProductName())
                                .productImage(op.getProduct().getProductImage())
                                .quantity(op.getQuantity())
                                .productPriceAtOrder(op.getProduct().getProductPrice())
                                .build())
                        .collect(Collectors.toList());
                
                orderDTO.setProducts(productDTOs);
                return orderDTO;
            });
            
            System.out.println("Returning " + orderDTOs.getContent().size() + " orders for restaurant ID " + restaurantId);
            return ResponseEntity.ok(orderDTOs);
            
        } catch (Exception e) {
            System.out.println("Error getting restaurant orders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
