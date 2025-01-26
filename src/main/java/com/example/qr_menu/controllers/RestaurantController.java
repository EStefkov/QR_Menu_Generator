package com.example.qr_menu.controllers;

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
        public ResponseEntity<String> createRestaurant(
                @RequestBody RestaurantDTO restaurantDTO,
                @RequestHeader("Authorization") String token) {

            // Extract email from the token (remove "Bearer " prefix)
            String email = jwtTokenUtil.extractEmailFromToken(token.substring(7));

            // Pass email to the service
            restaurantService.createRestaurant(restaurantDTO, email);

            return new ResponseEntity<>("Restaurant created successfully", HttpStatus.CREATED);
        }

        @PutMapping("/{id}")
        public ResponseEntity<String> updateRestaurant(@PathVariable Long id, @RequestBody RestaurantDTO restaurantDTO) {
            restaurantService.updateRestaurant(id, restaurantDTO);
            return new ResponseEntity<>("Restaurant updated successfully", HttpStatus.OK);
        }

        @GetMapping("/{id}")
        public ResponseEntity<RestaurantDTO> getRestaurantById(@PathVariable Long id) {
            RestaurantDTO restaurantDTO = restaurantService.getRestaurantById(id);
            return ResponseEntity.ok(restaurantDTO);
        }
        @PreAuthorize("hasRole('ADMIN')")
        @DeleteMapping("/delete/{id}")
        public ResponseEntity<String> deleteRestaurant(@PathVariable Long id) {
            restaurantService.deleteRestaurant(id);
            return new ResponseEntity<>("Restaurant deleted successfully", HttpStatus.OK);
        }

        @GetMapping
        public ResponseEntity<List<RestaurantDTO>> getAllRestaurants() {
            List<RestaurantDTO> restaurants = restaurantService.getAllRestaurants();
            return new ResponseEntity<>(restaurants, HttpStatus.OK);
        }

        @GetMapping("/paged")
        public ResponseEntity<Page<RestaurantDTO>> getPagedRestaurants(
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "5") int size) {
            Page<RestaurantDTO> restaurants = restaurantService.getPagedRestaurants(page, size);
            return ResponseEntity.ok(restaurants);
        }

    }