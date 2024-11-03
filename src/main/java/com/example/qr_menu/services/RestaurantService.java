package com.example.qr_menu.services;

import com.example.qr_menu.dto.RestaurantDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.AccountRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final AccountRepository accountRepository; // Inject AccountRepository to find accounts

    @Autowired
    public RestaurantService(RestaurantRepository restaurantRepository, AccountRepository accountRepository) {
        this.restaurantRepository = restaurantRepository;
        this.accountRepository = accountRepository;
    }

    public void createRestaurant(RestaurantDTO restaurantDTO, String identifier) {
        // Find account by account name or email (identifier extracted from JWT)
        Account account = accountRepository.findByAccountNameOrMailAddress(identifier, identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // Build restaurant with associated account
        Restorant restaurant = Restorant.builder()
                .restorantName(restaurantDTO.getRestorantName())
                .phoneNumber(restaurantDTO.getPhoneNumber())
                .account(account) // Associate restaurant with account
                .build();

        restaurantRepository.save(restaurant);
    }

    public void updateRestaurant(Long id, RestaurantDTO restaurantDTO) {
        Restorant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        restaurant.setRestorantName(restaurantDTO.getRestorantName());
        restaurant.setPhoneNumber(restaurantDTO.getPhoneNumber());
        restaurantRepository.save(restaurant);
    }

    public void deleteRestaurant(Long id) {
        Restorant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        restaurantRepository.delete(restaurant);
    }

    public List<RestaurantDTO> getAllRestaurants() {
        List<Restorant> restaurants = restaurantRepository.findAll();
        return restaurants.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private RestaurantDTO convertToDTO(Restorant restaurant) {
        RestaurantDTO dto = new RestaurantDTO();
        dto.setId(restaurant.getId());
        dto.setRestorantName(restaurant.getRestorantName());
        dto.setPhoneNumber(restaurant.getPhoneNumber());
        dto.setAccountId(restaurant.getAccount().getId()); // Include account ID in the DTO
        return dto;
    }

    public RestaurantDTO getRestaurantById(Long id) {
        Restorant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return convertToDTO(restaurant);
    }
}
