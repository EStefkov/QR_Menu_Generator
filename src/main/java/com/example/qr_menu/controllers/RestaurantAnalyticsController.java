package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.PopularProductDTO;
import com.example.qr_menu.services.PopularProductsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

/**
 * Controller for restaurant analytics endpoints
 */
@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RestaurantAnalyticsController {

    private static final Logger logger = Logger.getLogger(RestaurantAnalyticsController.class.getName());
    private final PopularProductsService popularProductsService;

    @Autowired
    public RestaurantAnalyticsController(PopularProductsService popularProductsService) {
        this.popularProductsService = popularProductsService;
    }

    /**
     * Get the most popular products for a restaurant
     * @param restaurantId ID of the restaurant
     * @param limit Maximum number of products to return (optional, defaults to 10)
     * @return List of popular products
     */
    @GetMapping("/{restaurantId}/popular-products")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('COMANAGER')")
    public ResponseEntity<?> getPopularProducts(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) Integer limit) {
        
        logger.info("Received request for popular products for restaurant ID: " + restaurantId);
        
        try {
            List<PopularProductDTO> popularProducts = 
                popularProductsService.getPopularProductsByRestaurantId(restaurantId, limit);
            
            logger.info("Returning " + popularProducts.size() + " popular products");
            return ResponseEntity.ok(popularProducts);
        } catch (Exception e) {
            logger.severe("Error processing popular products request: " + e.getMessage());
            if (e.getCause() != null) {
                logger.severe("Caused by: " + e.getCause().getMessage());
            }
            
            // Return empty list on error
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
} 