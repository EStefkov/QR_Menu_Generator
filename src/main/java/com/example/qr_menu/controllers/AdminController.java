package com.example.qr_menu.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.qr_menu.repositories.*;
import com.example.qr_menu.entities.*;
import com.example.qr_menu.utils.JwtTokenUtil;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    
    /**
     * Endpoint to get admin dashboard statistics
     * @return statistics for admin dashboard
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getAdminStatistics(
            @RequestHeader("Authorization") String token) {
        try {
            // Extract account email from JWT
            String jwtToken = token.substring(7);
            String email = jwtTokenUtil.extractUsername(jwtToken);
            
            // Get all orders
            List<Order> allOrders = orderRepository.findAll();
            
            // Prepare result map
            Map<String, Object> statistics = new HashMap<>();
            
            // 1. Total revenue
            BigDecimal totalRevenue = calculateTotalRevenue(allOrders);
            statistics.put("totalRevenue", totalRevenue);
            
            // 2. Total orders count
            statistics.put("totalOrders", allOrders.size());
            
            // 3. Order status counts
            Map<String, Integer> orderStatusCounts = calculateOrderStatusCounts(allOrders);
            statistics.put("orderStatusCounts", orderStatusCounts);
            
            // 4. Restaurant statistics
            List<Map<String, Object>> restaurantStats = calculateRestaurantStatistics();
            statistics.put("restaurantStats", restaurantStats);
            
            // 5. Popular products
            List<Map<String, Object>> popularProducts = calculatePopularProducts(allOrders);
            statistics.put("popularProducts", popularProducts);
            
            // 6. Recent orders
            List<Map<String, Object>> recentOrders = getRecentOrders(allOrders);
            statistics.put("recentOrders", recentOrders);
            
            // 7. Time period statistics (today, this week, this month)
            Map<String, Object> timeStats = calculateTimePeriodStatistics(allOrders);
            statistics.put("timeStats", timeStats);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    private BigDecimal calculateTotalRevenue(List<Order> orders) {
        return orders.stream()
                .map(order -> BigDecimal.valueOf(order.getTotalPrice() != null ? order.getTotalPrice() : 0))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private Map<String, Integer> calculateOrderStatusCounts(List<Order> orders) {
        Map<String, Integer> statusCounts = new HashMap<>();
        
        for (Order order : orders) {
            String status = order.getOrderStatus().toString();
            statusCounts.put(status, statusCounts.getOrDefault(status, 0) + 1);
        }
        
        return statusCounts;
    }
    
    private List<Map<String, Object>> calculateRestaurantStatistics() {
        List<Restorant> restaurants = restaurantRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Restorant restaurant : restaurants) {
            Map<String, Object> restaurantStat = new HashMap<>();
            
            // Get orders for this restaurant using a query
            List<Order> restaurantOrders = orderRepository.findAll().stream()
                    .filter(order -> order.getRestorant() != null && 
                           order.getRestorant().getId().equals(restaurant.getId()))
                    .collect(Collectors.toList());
            
            // Calculate total revenue
            BigDecimal revenue = calculateTotalRevenue(restaurantOrders);
            
            // Calculate average order value
            BigDecimal averageOrderValue = BigDecimal.ZERO;
            if (!restaurantOrders.isEmpty()) {
                averageOrderValue = revenue.divide(new BigDecimal(restaurantOrders.size()), 2, RoundingMode.HALF_UP);
            }
            
            restaurantStat.put("id", restaurant.getId());
            restaurantStat.put("name", restaurant.getRestorantName());
            restaurantStat.put("totalOrders", restaurantOrders.size());
            restaurantStat.put("totalRevenue", revenue);
            restaurantStat.put("averageOrderValue", averageOrderValue);
            
            result.add(restaurantStat);
        }
        
        return result;
    }
    
    private List<Map<String, Object>> calculatePopularProducts(List<Order> orders) {
        // Count products by occurrence in orders
        Map<Long, Integer> productCounts = new HashMap<>();
        Map<Long, BigDecimal> productRevenue = new HashMap<>();
        Map<Long, String> productNames = new HashMap<>();
        Map<Long, String> productRestaurantNames = new HashMap<>();
        
        for (Order order : orders) {
            if (order.getOrderProducts() != null) {
                for (OrderProduct orderProduct : order.getOrderProducts()) {
                    Product product = orderProduct.getProduct();
                    if (product == null) continue;
                    
                    Long productId = product.getId();
                    Integer quantity = orderProduct.getQuantity();
                    
                    // Update counts
                    productCounts.put(productId, productCounts.getOrDefault(productId, 0) + quantity);
                    
                    // Calculate item price
                    BigDecimal price = BigDecimal.valueOf(product.getProductPrice() != null ? product.getProductPrice() : 0);
                    
                    // Update revenue
                    BigDecimal itemTotal = price.multiply(new BigDecimal(quantity));
                    productRevenue.put(productId, productRevenue.getOrDefault(productId, BigDecimal.ZERO).add(itemTotal));
                    
                    // Store product name and restaurant name
                    productNames.put(productId, product.getProductName());
                    
                    // Try to get restaurant name
                    String restaurantName = "Unknown";
                    if (order.getRestorant() != null) {
                        restaurantName = order.getRestorant().getRestorantName();
                    }
                    productRestaurantNames.put(productId, restaurantName);
                }
            }
        }
        
        // Create result list
        List<Map<String, Object>> result = new ArrayList<>();
        for (Long productId : productCounts.keySet()) {
            Map<String, Object> productStat = new HashMap<>();
            productStat.put("id", productId);
            productStat.put("name", productNames.get(productId));
            productStat.put("restaurantName", productRestaurantNames.get(productId));
            productStat.put("orderCount", productCounts.get(productId));
            productStat.put("revenue", productRevenue.get(productId));
            result.add(productStat);
        }
        
        // Sort by order count descending
        result.sort((a, b) -> ((Integer) b.get("orderCount")).compareTo((Integer) a.get("orderCount")));
        
        // Return top 10 products or all if less than 10
        return result.stream().limit(10).collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> getRecentOrders(List<Order> orders) {
        // Sort orders by date descending
        Collections.sort(orders, (a, b) -> b.getOrderTime().compareTo(a.getOrderTime()));
        
        // Create result list with the 10 most recent orders
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < Math.min(10, orders.size()); i++) {
            Order order = orders.get(i);
            
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("id", order.getId());
            orderMap.put("orderDate", order.getOrderTime());
            orderMap.put("totalAmount", order.getTotalPrice());
            orderMap.put("status", order.getOrderStatus().toString());
            
            // Get customer name
            String customerName = "Unknown";
            if (order.getAccount() != null) {
                customerName = order.getAccount().getFirstName() + " " + order.getAccount().getLastName();
            }
            orderMap.put("customerName", customerName);
            
            // Get restaurant name
            String restaurantName = "Unknown";
            if (order.getRestorant() != null) {
                restaurantName = order.getRestorant().getRestorantName();
            }
            orderMap.put("restaurantName", restaurantName);
            
            result.add(orderMap);
        }
        
        return result;
    }
    
    private Map<String, Object> calculateTimePeriodStatistics(List<Order> orders) {
        Map<String, Object> result = new HashMap<>();
        
        // Get current date
        LocalDate today = LocalDate.now();
        
        // Calculate stats for today
        List<Order> todayOrders = filterOrdersByDate(orders, today, today);
        Map<String, Object> todayStats = new HashMap<>();
        todayStats.put("orders", todayOrders.size());
        todayStats.put("revenue", calculateTotalRevenue(todayOrders));
        
        // Calculate stats for this week
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        List<Order> weekOrders = filterOrdersByDate(orders, weekStart, today);
        Map<String, Object> weekStats = new HashMap<>();
        weekStats.put("orders", weekOrders.size());
        weekStats.put("revenue", calculateTotalRevenue(weekOrders));
        
        // Calculate stats for this month
        LocalDate monthStart = today.withDayOfMonth(1);
        List<Order> monthOrders = filterOrdersByDate(orders, monthStart, today);
        Map<String, Object> monthStats = new HashMap<>();
        monthStats.put("orders", monthOrders.size());
        monthStats.put("revenue", calculateTotalRevenue(monthOrders));
        
        result.put("today", todayStats);
        result.put("thisWeek", weekStats);
        result.put("thisMonth", monthStats);
        
        return result;
    }
    
    private List<Order> filterOrdersByDate(List<Order> orders, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        return orders.stream()
                .filter(order -> {
                    LocalDateTime orderDate = order.getOrderTime().toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime();
                    return !orderDate.isBefore(startDateTime) && !orderDate.isAfter(endDateTime);
                })
                .collect(Collectors.toList());
    }
} 