package com.example.qr_menu.services;

import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.ManagerAssignment;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.repositories.AccountRepository;
import com.example.qr_menu.repositories.ManagerAssignmentRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RestaurantAccessService {

    private final ManagerAssignmentRepository managerAssignmentRepository;
    private final AccountRepository accountRepository;
    private final RestaurantRepository restorantRepository;

    @Autowired
    public RestaurantAccessService(
            ManagerAssignmentRepository managerAssignmentRepository,
            AccountRepository accountRepository,
            RestaurantRepository restorantRepository) {
        this.managerAssignmentRepository = managerAssignmentRepository;
        this.accountRepository = accountRepository;
        this.restorantRepository = restorantRepository;
    }

    /**
     * Checks if the user with the given email can manage the restaurant with the given ID.
     * A user can manage a restaurant if they created it or if they are assigned to it.
     *
     * @param email The email of the user
     * @param restaurantId The ID of the restaurant
     * @return true if the user can manage the restaurant, false otherwise
     */
    public boolean canManageRestaurant(String email, Long restaurantId) {
        // Get the account for the user
        Optional<Account> accountOpt = accountRepository.findByMailAddress(email);
        if (accountOpt.isEmpty()) {
            return false;
        }
        
        Account account = accountOpt.get();
        
        // If the account is not a manager or co-manager, they can't manage any restaurant
        if (account.getAccountType() != Account.AccountType.ROLE_MANAGER && 
            account.getAccountType() != Account.AccountType.ROLE_COMANAGER) {
            return false;
        }
        
        // Check if the user is the one who created the restaurant
        Optional<Restorant> restorantOpt = restorantRepository.findById(restaurantId);
        if (restorantOpt.isEmpty()) {
            return false;
        }
        
        Restorant restorant = restorantOpt.get();
        // The creator of the restaurant can always manage it
        if (restorant.getAccount() != null && restorant.getAccount().getId().equals(account.getId())) {
            return true;
        }
        
        // Check if the user is assigned to the restaurant as a manager
        return managerAssignmentRepository.existsByManagerIdAndRestorantId(account.getId(), restaurantId);
    }
} 