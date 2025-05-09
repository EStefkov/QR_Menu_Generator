package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.MenuDTO;
import com.example.qr_menu.dto.RestaurantDTO;
import com.example.qr_menu.services.RestaurantService;
import com.example.qr_menu.utils.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public RestaurantController(RestaurantService restaurantService, JwtTokenUtil jwtTokenUtil) {
        this.restaurantService = restaurantService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> createRestaurant(
            @RequestBody RestaurantDTO restaurantDTO,
            @RequestHeader("Authorization") String token) {
        // Log incoming restaurant data for debugging
        System.out.println("Restaurant creation request received with data: " + restaurantDTO);
        
        // Log detailed field information
        System.out.println("Restaurant name: " + restaurantDTO.getRestorantName());
        System.out.println("Phone number: " + restaurantDTO.getPhoneNumber());
        System.out.println("Address: " + restaurantDTO.getAddress());
        System.out.println("Email: " + restaurantDTO.getEmail());
        
        String email = jwtTokenUtil.extractUsername(token.substring(7));
        restaurantService.createRestaurant(restaurantDTO, email);
        
        Map<String, String> response = Map.of("message", "Restaurant created successfully");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN') or (hasRole('MANAGER') and @restaurantAccessService.canManageRestaurant(authentication.name, #id))")
    public ResponseEntity<String> updateRestaurant(@PathVariable Long id, @RequestBody RestaurantDTO restaurantDTO) {
        restaurantService.updateRestaurant(id, restaurantDTO);
        return new ResponseEntity<>("Restaurant updated successfully", HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'MANAGER', 'COMANAGER')")
    public ResponseEntity<RestaurantDTO> getRestaurantById(@PathVariable Long id) {
        RestaurantDTO restaurantDTO = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(restaurantDTO);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasAnyRole('MANAGER', 'COMANAGER') and @restaurantAccessService.canManageRestaurant(authentication.name, #id))")
    public ResponseEntity<String> deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return new ResponseEntity<>("Restaurant deleted successfully", HttpStatus.OK);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'MANAGER', 'COMANAGER')")
    public ResponseEntity<List<RestaurantDTO>> getAllRestaurants() {
        List<RestaurantDTO> restaurants = restaurantService.getAllRestaurants();
        return new ResponseEntity<>(restaurants, HttpStatus.OK);
    }

    @GetMapping("/paged")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'MANAGER', 'COMANAGER')")
    public ResponseEntity<Page<RestaurantDTO>> getPagedRestaurants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Page<RestaurantDTO> restaurants = restaurantService.getPagedRestaurants(page, size);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/{restaurantId}/menus")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'MANAGER', 'COMANAGER')")
    public ResponseEntity<List<MenuDTO>> getMenusByRestaurant(@PathVariable Long restaurantId) {
        List<MenuDTO> menus = restaurantService.getMenusByRestaurant(restaurantId);
        return ResponseEntity.ok(menus);
    }
    
    /**
     * Get all restaurants managed by the authenticated manager.
     * This includes both restaurants created by the manager and 
     * restaurants they have been assigned to manage.
     * 
     * @param token JWT authorization token
     * @return List of restaurants managed by the user
     */
    @GetMapping("/managed")
    @PreAuthorize("hasAnyRole('MANAGER', 'COMANAGER')")
    public ResponseEntity<List<RestaurantDTO>> getManagedRestaurants(
            @RequestHeader("Authorization") String token) {
        System.out.println("Getting restaurants managed by user from token");
        String email = jwtTokenUtil.extractUsername(token.substring(7));
        List<RestaurantDTO> restaurants = restaurantService.getRestaurantsManagedByUser(email);
        return ResponseEntity.ok(restaurants);
    }
}