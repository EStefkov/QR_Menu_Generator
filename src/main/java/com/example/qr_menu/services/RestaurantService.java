package com.example.qr_menu.services;

import com.example.qr_menu.dto.MenuDTO;
import com.example.qr_menu.dto.RestaurantDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.entities.ManagerAssignment;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.AccountRepository;
import com.example.qr_menu.repositories.MenuRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import com.example.qr_menu.repositories.ManagerAssignmentRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final AccountRepository accountRepository; // Inject AccountRepository to find accounts

    private final MenuRepository menuRepository;
    private final ManagerAssignmentRepository managerAssignmentRepository;

    @Autowired
    public RestaurantService(RestaurantRepository restaurantRepository,
                             AccountRepository accountRepository,
                             MenuRepository menuRepository,
                             ManagerAssignmentRepository managerAssignmentRepository) {
        this.menuRepository = menuRepository;
        this.restaurantRepository = restaurantRepository;
        this.accountRepository = accountRepository;
        this.managerAssignmentRepository = managerAssignmentRepository;
    }

    public void createRestaurant(RestaurantDTO restaurantDTO, String identifier) {
        // Find account by account name or email (identifier extracted from JWT)
        Account account = accountRepository.findByAccountNameOrMailAddress(identifier, identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // Log incoming restaurant data for debugging
        System.out.println("Creating restaurant with data: " + restaurantDTO);
        
        // Extract address from contactInfo if direct address is null
        String address = restaurantDTO.getAddress();
        if ((address == null || address.trim().isEmpty()) && restaurantDTO.getContactInfo() != null) {
            try {
                // Try to get address from contactInfo if it's a map
                if (restaurantDTO.getContactInfo() instanceof java.util.Map) {
                    java.util.Map<?, ?> contactInfo = (java.util.Map<?, ?>) restaurantDTO.getContactInfo();
                    Object contactAddress = contactInfo.get("address");
                    if (contactAddress != null && !contactAddress.toString().trim().isEmpty()) {
                        address = contactAddress.toString();
                        System.out.println("Extracted address from contactInfo: " + address);
                    }
                }
            } catch (Exception e) {
                System.err.println("Error extracting address from contactInfo: " + e.getMessage());
            }
        }

        // Build restaurant with associated account
        Restorant restaurant = Restorant.builder()
                .restorantName(restaurantDTO.getRestorantName())
                .phoneNumber(restaurantDTO.getPhoneNumber())
                .address(address)  // Set the extracted address field
                .email(restaurantDTO.getEmail())
                .account(account) // Associate restaurant with account
                .build();

        // Log the restaurant object before saving
        System.out.println("Restaurant object before saving: " + restaurant);

        // Save the restaurant to get its ID
        restaurant = restaurantRepository.save(restaurant);
        
        // If the account is a manager, automatically assign them as manager to this restaurant
        if (account.getAccountType() == Account.AccountType.ROLE_MANAGER) {
            // Create manager assignment
            ManagerAssignment managerAssignment = ManagerAssignment.builder()
                    .manager(account)
                    .restorant(restaurant)
                    .assignedAt(new Timestamp(System.currentTimeMillis()))
                    .assignedBy(account.getId()) // Self-assigned
                    .build();
                    
            // Get the ManagerAssignmentRepository or use a service
            try {
                managerAssignmentRepository.save(managerAssignment);
                System.out.println("Auto-assigned manager (creator) to restaurant: " + restaurant.getId());
            } catch (Exception e) {
                System.err.println("Failed to auto-assign manager to restaurant: " + e.getMessage());
                // Continue without failing the whole operation
            }
        }
    }

    public void updateRestaurant(Long id, RestaurantDTO restaurantDTO) {
        Restorant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        restaurant.setRestorantName(restaurantDTO.getRestorantName());
        restaurant.setPhoneNumber(restaurantDTO.getPhoneNumber());
        restaurant.setAddress(restaurantDTO.getAddress());
        restaurant.setEmail(restaurantDTO.getEmail());
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

    public Page<RestaurantDTO> getPagedRestaurants(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Restorant> restaurantsPage = restaurantRepository.findAll(pageable);
        return restaurantsPage.map(restaurant -> RestaurantDTO.builder()
                .id(restaurant.getId())
                .restorantName(restaurant.getRestorantName())
                .phoneNumber(restaurant.getPhoneNumber())
                .accountId(restaurant.getAccount() != null ? restaurant.getAccount().getId() : null)
                .address(restaurant.getAddress())
                .email(restaurant.getEmail())
                .build());
    }

    private RestaurantDTO convertToDTO(Restorant restaurant) {
        return RestaurantDTO.builder()
                .id(restaurant.getId())
                .restorantName(restaurant.getRestorantName())
                .phoneNumber(restaurant.getPhoneNumber())
                .accountId(restaurant.getAccount() != null ? restaurant.getAccount().getId() : null)
                .address(restaurant.getAddress())
                .email(restaurant.getEmail())
                .build();
    }

    public RestaurantDTO getRestaurantById(Long id) {
        Restorant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return convertToDTO(restaurant);
    }

    public List<MenuDTO> getMenusByRestaurant(Long restaurantId) {
        Restorant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));

        return menuRepository.findByRestorant(restaurant).stream()
                .map(menu -> MenuDTO.builder()
                    .id(menu.getId())
                    .category(menu.getCategory())
                    .restaurantId(restaurant.getId())
                    .createdAt(menu.getCreatedAt())
                    .updatedAt(menu.getUpdatedAt())
                    .menuUrl(menu.getMenuUrl())
                    .qrCodeImage(menu.getQrCodeImage())
                    .menuImage(menu.getMenuImage())
                    .textColor(menu.getTextColor())
                    .build())
                .collect(Collectors.toList());
    }

    private MenuDTO convertToMenuDTO(Menu menu) {
        return MenuDTO.builder()
                .id(menu.getId())
                .category(menu.getCategory())
                .restaurantId(menu.getRestorant().getId())
                .createdAt(menu.getCreatedAt())
                .updatedAt(menu.getUpdatedAt())
                .menuUrl(menu.getMenuUrl())
                .qrCodeImage(menu.getQrCodeImage())
                .menuImage(menu.getMenuImage())
                .textColor(menu.getTextColor())
                .build();
    }

    /**
     * Get all restaurants managed by a user (for ROLE_MANAGER users)
     * 
     * @param email Email of the manager
     * @return List of RestaurantDTOs managed by the user
     */
    public List<RestaurantDTO> getRestaurantsManagedByUser(String email) {
        // Get the account
        Account account = accountRepository.findByAccountNameOrMailAddress(null, email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with email: " + email));
        
        // Check if the account is a manager or co-manager
        if (account.getAccountType() != Account.AccountType.ROLE_MANAGER && 
            account.getAccountType() != Account.AccountType.ROLE_COMANAGER) {
            throw new IllegalArgumentException("Only managers and co-managers can access managed restaurants");
        }
        
        // Get the restaurants created by this account (only for ROLE_MANAGER)
        List<Restorant> createdRestaurants = new ArrayList<>();
        if (account.getAccountType() == Account.AccountType.ROLE_MANAGER) {
            createdRestaurants = restaurantRepository.findByAccount(account);
        }
        
        // Get the restaurants managed by this account through ManagerAssignment
        List<Restorant> assignedRestaurants = account.getManagedRestaurants();
        
        // Combine both lists, avoiding duplicates
        List<Restorant> allManagedRestaurants = new java.util.ArrayList<>(createdRestaurants);
        
        // Add restaurants that were assigned but not created by this manager
        for (Restorant restaurant : assignedRestaurants) {
            if (!allManagedRestaurants.contains(restaurant)) {
                allManagedRestaurants.add(restaurant);
            }
        }
        
        // Convert to DTOs
        return allManagedRestaurants.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

}
