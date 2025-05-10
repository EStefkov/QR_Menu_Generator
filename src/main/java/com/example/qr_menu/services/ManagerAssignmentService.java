package com.example.qr_menu.services;

import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.ManagerAssignment;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.AccountRepository;
import com.example.qr_menu.repositories.ManagerAssignmentRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ManagerAssignmentService {

    private final ManagerAssignmentRepository managerAssignmentRepository;
    private final AccountRepository accountRepository;
    private final RestaurantRepository restaurantRepository;

    @Autowired
    public ManagerAssignmentService(
            ManagerAssignmentRepository managerAssignmentRepository,
            AccountRepository accountRepository,
            RestaurantRepository restaurantRepository) {
        this.managerAssignmentRepository = managerAssignmentRepository;
        this.accountRepository = accountRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Transactional
    public ManagerAssignment assignManagerToRestaurant(Long managerId, Long restaurantId, Long adminId) {
        // Verify the manager exists and is a ROLE_MANAGER or ROLE_COMANAGER
        Account manager = accountRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));
        
        if (manager.getAccountType() != Account.AccountType.ROLE_MANAGER && 
            manager.getAccountType() != Account.AccountType.ROLE_COMANAGER) {
            throw new IllegalArgumentException("Account must have ROLE_MANAGER or ROLE_COMANAGER to be assigned as a manager");
        }
        
        // Verify the restaurant exists
        Restorant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));
        
        // Check if this assignment already exists
        if (managerAssignmentRepository.existsByManagerIdAndRestorantId(managerId, restaurantId)) {
            throw new IllegalArgumentException("Manager is already assigned to this restaurant");
        }
        
        // Create the assignment
        ManagerAssignment assignment = ManagerAssignment.builder()
                .manager(manager)
                .restorant(restaurant)
                .assignedAt(Timestamp.from(Instant.now()))
                .assignedBy(adminId)
                .build();
        
        return managerAssignmentRepository.save(assignment);
    }
    
    @Transactional
    public void removeManagerFromRestaurant(Long managerId, Long restaurantId) {
        ManagerAssignment assignment = managerAssignmentRepository.findByManagerIdAndRestorantId(managerId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager assignment not found"));
        
        managerAssignmentRepository.delete(assignment);
    }
    
    @Transactional
    public void removeAssignmentById(Long assignmentId) {
        ManagerAssignment assignment = managerAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager assignment not found with id: " + assignmentId));
                
        managerAssignmentRepository.delete(assignment);
    }
    
    @Transactional(readOnly = true)
    public List<Restorant> getRestaurantsManagedBy(Long managerId) {
        Account manager = accountRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));
        
        if (manager.getAccountType() != Account.AccountType.ROLE_MANAGER && 
            manager.getAccountType() != Account.AccountType.ROLE_COMANAGER) {
            throw new AccessDeniedException("Account must have ROLE_MANAGER or ROLE_COMANAGER to access managed restaurants");
        }
        
        return managerAssignmentRepository.findByManagerIdWithRestorant(managerId).stream()
                .map(ManagerAssignment::getRestorant)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ManagerAssignment> getAssignmentsByManager(Account manager) {
        // This works for both ROLE_MANAGER and ROLE_COMANAGER accounts
        if (manager.getAccountType() != Account.AccountType.ROLE_MANAGER &&
            manager.getAccountType() != Account.AccountType.ROLE_COMANAGER) {
            throw new AccessDeniedException("Account must have ROLE_MANAGER or ROLE_COMANAGER to access managed restaurants");
        }
        
        // Use the repository method to find assignments by manager with eagerly fetched restaurants
        return managerAssignmentRepository.findByManagerWithRestorant(manager);
    }
    
    @Transactional(readOnly = true)
    public List<ManagerAssignment> getAssignmentsByManagerId(Long managerId) {
        // Add debugging to check if the method is called and with what parameters
        System.out.println("getAssignmentsByManagerId called with managerId: " + managerId);
        
        // Debug: Count all assignments in the system
        long totalAssignments = managerAssignmentRepository.count();
        System.out.println("Total manager assignments in the system: " + totalAssignments);
        
        // Check if the account exists
        boolean accountExists = accountRepository.existsById(managerId);
        if (!accountExists) {
            System.out.println("Account with ID " + managerId + " does not exist");
            throw new ResourceNotFoundException("Account not found with id: " + managerId);
        }
        
        // Check account type (for debugging only)
        accountRepository.findById(managerId).ifPresent(account -> {
            System.out.println("Account found with ID " + managerId + ", type: " + account.getAccountType());
            
            // Debug: Print all assignments for this manager
            if (account.getAccountType() == Account.AccountType.ROLE_COMANAGER) {
                System.out.println("Co-Manager found, dumping all assignments:");
                List<ManagerAssignment> allAssignments = managerAssignmentRepository.findAll();
                allAssignments.forEach(assignment -> {
                    System.out.println("Assignment ID: " + assignment.getId() + 
                                     ", Manager ID: " + assignment.getManager().getId() + 
                                     ", Manager type: " + assignment.getManager().getAccountType() + 
                                     ", Restaurant ID: " + assignment.getRestorant().getId());
                });
            }
        });
        
        // This is a more direct approach that doesn't check the account type
        // It just retrieves all assignments for the given manager ID
        List<ManagerAssignment> assignments = managerAssignmentRepository.findByManagerIdWithRestorant(managerId);
        System.out.println("Found " + assignments.size() + " assignments for manager ID: " + managerId);
        
        if (assignments.isEmpty()) {
            System.out.println("No assignments found. Directly checking database...");
            
            // Debug: Direct SQL check (log only)
            String sql = "SELECT * FROM manager_assignment WHERE manager_id = " + managerId;
            System.out.println("SQL query that would be executed: " + sql);
        }
        
        return assignments;
    }
    
    @Transactional(readOnly = true)
    public List<Account> getManagersForRestaurant(Long restaurantId) {
        // Verify the restaurant exists
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found with id: " + restaurantId);
        }
        
        return managerAssignmentRepository.findByRestorantId(restaurantId).stream()
                .map(ManagerAssignment::getManager)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public boolean isManagerOfRestaurant(Long managerId, Long restaurantId) {
        return managerAssignmentRepository.existsByManagerIdAndRestorantId(managerId, restaurantId);
    }
    
    @Transactional(readOnly = true)
    public List<ManagerAssignment> getAllAssignments() {
        return managerAssignmentRepository.findAll();
    }

    /**
     * Assigns multiple restaurants to a manager in a single operation
     * 
     * @param managerId ID of the manager
     * @param restaurantIds List of restaurant IDs to assign
     * @param adminId ID of the admin making the assignments
     * @return List of created assignments
     */
    @Transactional
    public List<ManagerAssignment> assignMultipleRestaurantsToManager(Long managerId, List<Long> restaurantIds, Long adminId) {
        // Verify the manager exists and is a ROLE_MANAGER or ROLE_COMANAGER
        Account manager = accountRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + managerId));
        
        if (manager.getAccountType() != Account.AccountType.ROLE_MANAGER && 
            manager.getAccountType() != Account.AccountType.ROLE_COMANAGER) {
            throw new IllegalArgumentException("Account must have ROLE_MANAGER or ROLE_COMANAGER to be assigned as a manager");
        }
        
        List<ManagerAssignment> assignments = new ArrayList<>();
        Timestamp now = Timestamp.from(Instant.now());
        
        for (Long restaurantId : restaurantIds) {
            // Skip if assignment already exists
            if (managerAssignmentRepository.existsByManagerIdAndRestorantId(managerId, restaurantId)) {
                continue;
            }
            
            // Verify the restaurant exists
            Restorant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + restaurantId));
            
            // Create the assignment
            ManagerAssignment assignment = ManagerAssignment.builder()
                    .manager(manager)
                    .restorant(restaurant)
                    .assignedAt(now)
                    .assignedBy(adminId)
                    .build();
            
            assignments.add(managerAssignmentRepository.save(assignment));
        }
        
        return assignments;
    }
} 