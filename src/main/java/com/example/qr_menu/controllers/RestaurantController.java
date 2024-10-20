package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.RestaurantDTO;
import com.example.qr_menu.services.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @Autowired
    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @PostMapping
    public ResponseEntity<String> createRestaurant(@RequestBody RestaurantDTO restaurantDTO) {
        restaurantService.createRestaurant(restaurantDTO);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return new ResponseEntity<>("Restaurant deleted successfully", HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<RestaurantDTO>> getAllRestaurants() {
        List<RestaurantDTO> restaurants = restaurantService.getAllRestaurants();
        return new ResponseEntity<>(restaurants, HttpStatus.OK);
    }
}