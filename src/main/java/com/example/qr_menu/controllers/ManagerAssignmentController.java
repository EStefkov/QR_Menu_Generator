package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.ManagerAssignmentDTO;
import com.example.qr_menu.entities.ManagerAssignment;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.services.ManagerAssignmentService;
import com.example.qr_menu.services.AccountService;
import com.example.qr_menu.utils.JwtTokenUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/manager-assignments")
public class ManagerAssignmentController {

    private final ManagerAssignmentService managerAssignmentService;
    private final AccountService accountService;
    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public ManagerAssignmentController(
            ManagerAssignmentService managerAssignmentService, 
            AccountService accountService,
            JwtTokenUtil jwtTokenUtil) {
        this.managerAssignmentService = managerAssignmentService;
        this.accountService = accountService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping
    public ResponseEntity<?> assignManagerToRestaurant(
            @RequestBody Map<String, Long> requestBody,
            @RequestHeader("Authorization") String token) {
        try {
            Long managerId = requestBody.get("managerId");
            Long restaurantId = requestBody.get("restaurantId");
            
            if (managerId == null || restaurantId == null) {
                return ResponseEntity.badRequest().body("Manager ID and Restaurant ID are required");
            }
            
            // Extract admin ID from the JWT token
            String jwt = token.replace("Bearer ", "");
            Long adminId = jwtTokenUtil.extractClaim(jwt, claims -> claims.get("accountId", Long.class));
            
            if (adminId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Admin ID could not be determined from token");
            }
            
            ManagerAssignment assignment = managerAssignmentService.assignManagerToRestaurant(managerId, restaurantId, adminId);
            
            // Convert to DTO with admin information
            ManagerAssignmentDTO dto = convertToDTO(assignment);
            
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error assigning manager: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeManagerAssignment(@PathVariable Long id) {
        try {
            managerAssignmentService.removeAssignmentById(id);
            return ResponseEntity.ok("Manager assignment removed successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error removing assignment: " + e.getMessage());
        }
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<?> getRestaurantsByManager(@PathVariable Long managerId) {
        try {
            List<Restorant> restaurants = managerAssignmentService.getRestaurantsManagedBy(managerId);
            return ResponseEntity.ok(restaurants);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving restaurants: " + e.getMessage());
        }
    }

    @GetMapping("/managed-by/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'COMANAGER')")
    public ResponseEntity<?> getAssignmentsByUser(@PathVariable Long userId, @RequestHeader("Authorization") String token) {
        try {
            // Check if the userId is valid
            if (userId == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }

            // Extract user details from the token for logging purposes only
            String jwt = token.replace("Bearer ", "");
            Long authenticatedUserId = jwtTokenUtil.extractClaim(jwt, claims -> claims.get("accountId", Long.class));
            String accountType = jwtTokenUtil.extractClaim(jwt, claims -> claims.get("accountType", String.class));
            
            System.out.println("Authenticated user ID: " + authenticatedUserId + ", role: " + accountType + 
                              ", requesting assignments for user ID: " + userId);
            
            // Temporarily disable the user ID check to help diagnose the issue
            // Just get the assignments without additional security checks
            List<ManagerAssignment> assignments = managerAssignmentService.getAssignmentsByManagerId(userId);
            
            return ResponseEntity.ok(assignments);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Error in getAssignmentsByUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving assignments: " + e.getMessage());
        }
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getManagersForRestaurant(@PathVariable Long restaurantId) {
        try {
            List<Account> managers = managerAssignmentService.getManagersForRestaurant(restaurantId);
            return ResponseEntity.ok(managers);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving managers: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllAssignments() {
        try {
            List<ManagerAssignment> assignments = managerAssignmentService.getAllAssignments();
            List<ManagerAssignmentDTO> dtos = assignments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving assignments: " + e.getMessage());
        }
    }
    
    /**
     * Get all accounts that have the ROLE_MANAGER type
     * @return List of accounts with manager role
     */
    @GetMapping("/available-managers")
    public ResponseEntity<?> getAvailableManagers() {
        try {
            List<Account> managers = new ArrayList<>();
            managers.addAll(accountService.getAccountsByType(Account.AccountType.ROLE_MANAGER));
            managers.addAll(accountService.getAccountsByType(Account.AccountType.ROLE_COMANAGER));
            return ResponseEntity.ok(managers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving managers: " + e.getMessage());
        }
    }
    
    /**
     * Assigns multiple restaurants to a manager in a single operation
     * 
     * @param requestBody Map containing managerId and list of restaurantIds
     * @param token Authentication token
     * @return Response with the created assignments
     */
    @PostMapping("/batch-assign")
    public ResponseEntity<?> assignMultipleRestaurantsToManager(
            @RequestBody Map<String, Object> requestBody,
            @RequestHeader("Authorization") String token) {
        try {
            if (!requestBody.containsKey("managerId") || !requestBody.containsKey("restaurantIds")) {
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("error", "Manager ID and Restaurant IDs are required"));
            }
            
            Long managerId = null;
            try {
                managerId = ((Number) requestBody.get("managerId")).longValue();
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("error", "Invalid manager ID format"));
            }
            
            @SuppressWarnings("unchecked")
            List<Number> restaurantIdNumbers;
            try {
                restaurantIdNumbers = (List<Number>) requestBody.get("restaurantIds");
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("error", "Restaurant IDs must be a valid array"));
            }
            
            if (managerId == null || restaurantIdNumbers == null || restaurantIdNumbers.isEmpty()) {
                return ResponseEntity.badRequest()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("error", "Manager ID and at least one Restaurant ID are required"));
            }
            
            // Convert Numbers to Longs
            List<Long> restaurantIds = restaurantIdNumbers.stream()
                    .map(Number::longValue)
                    .collect(Collectors.toList());
            
            // Extract admin ID from the JWT token
            String jwt = token.replace("Bearer ", "");
            Long adminId;
            try {
                adminId = jwtTokenUtil.extractClaim(jwt, claims -> claims.get("accountId", Long.class));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("error", "Invalid authentication token"));
            }
            
            if (adminId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("error", "Admin ID could not be determined from token"));
            }
            
            List<ManagerAssignment> assignments = managerAssignmentService.assignMultipleRestaurantsToManager(
                    managerId, restaurantIds, adminId);
            
            // Convert to DTOs
            List<ManagerAssignmentDTO> dtos = assignments.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "message", "Restaurants assigned to manager successfully",
                "assignments", dtos
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", e.getMessage()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Log the error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("error", "Error assigning restaurants: " + e.getMessage()));
        }
    }
    
    // Helper method to convert entity to DTO
    private ManagerAssignmentDTO convertToDTO(ManagerAssignment assignment) {
        ManagerAssignmentDTO dto = new ManagerAssignmentDTO();
        dto.setId(assignment.getId());
        dto.setManagerId(assignment.getManager().getId());
        dto.setManagerName(assignment.getManager().getFirstName() + " " + assignment.getManager().getLastName());
        dto.setRestaurantId(assignment.getRestorant().getId());
        dto.setRestaurantName(assignment.getRestorant().getRestorantName());
        dto.setAssignedAt(assignment.getAssignedAt());
        dto.setAssignedBy(assignment.getAssignedBy());
        
        // Get admin name if available
        if (assignment.getAssignedBy() != null) {
            try {
                Account admin = accountService.getAccountById(assignment.getAssignedBy());
                dto.setAssignedByName(admin.getFirstName() + " " + admin.getLastName());
            } catch (ResourceNotFoundException e) {
                dto.setAssignedByName("Unknown Admin");
            }
        }
        
        return dto;
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkManagerAssignment(
            @RequestParam Long managerId,
            @RequestParam Long restaurantId) {
        boolean isManager = managerAssignmentService.isManagerOfRestaurant(managerId, restaurantId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isManager", isManager);
        return ResponseEntity.ok(response);
    }

    /**
     * Special endpoint for Co-Managers to get their restaurant assignments
     * This is a dedicated endpoint with simplified security checks
     */
    @GetMapping("/comanager-assignments/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'COMANAGER')")
    public ResponseEntity<?> getCoManagerAssignments(@PathVariable Long userId, @RequestHeader("Authorization") String token) {
        try {
            System.out.println("getCoManagerAssignments called for userId: " + userId);
            
            // Get the assignments
            List<ManagerAssignment> assignments = managerAssignmentService.getAssignmentsByManagerId(userId);
            System.out.println("Found " + assignments.size() + " assignments for Co-Manager with ID: " + userId);
            
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            System.err.println("Error in getCoManagerAssignments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving assignments: " + e.getMessage());
        }
    }

    /**
     * Special debug endpoint to list all assignments with detailed information
     */
    @GetMapping("/debug-assignments/{userId}")
    public ResponseEntity<?> debugAssignments(@PathVariable Long userId, @RequestHeader("Authorization") String token) {
        try {
            System.out.println("Debug assignments endpoint called for userId: " + userId);
            
            // Verify token and extract information
            String jwt = token.replace("Bearer ", "");
            Long authenticatedUserId = jwtTokenUtil.extractClaim(jwt, claims -> claims.get("accountId", Long.class));
            String accountType = jwtTokenUtil.extractClaim(jwt, claims -> claims.get("accountType", String.class));
            
            System.out.println("Auth details: ID=" + authenticatedUserId + ", Type=" + accountType);
            
            // Get all assignments in the system (for debugging)
            List<ManagerAssignment> allAssignments = managerAssignmentService.getAllAssignments();
            
            // Create a response with detailed debugging information
            Map<String, Object> debugResponse = new HashMap<>();
            debugResponse.put("authenticatedUser", Map.of(
                "id", authenticatedUserId,
                "accountType", accountType
            ));
            
            debugResponse.put("requestedUserId", userId);
            
            // Simplified assignment data
            List<Map<String, Object>> assignmentsData = new ArrayList<>();
            for (ManagerAssignment assignment : allAssignments) {
                Map<String, Object> assignmentMap = new HashMap<>();
                assignmentMap.put("id", assignment.getId());
                assignmentMap.put("managerId", assignment.getManager().getId());
                assignmentMap.put("managerType", assignment.getManager().getAccountType());
                assignmentMap.put("restaurantId", assignment.getRestorant().getId());
                assignmentMap.put("restaurantName", assignment.getRestorant().getRestorantName());
                assignmentsData.add(assignmentMap);
            }
            debugResponse.put("allAssignments", assignmentsData);
            
            // Add direct assignments for the requested user
            List<ManagerAssignment> userAssignments = 
                managerAssignmentService.getAssignmentsByManagerId(userId);
            
            List<Map<String, Object>> userAssignmentsData = new ArrayList<>();
            for (ManagerAssignment assignment : userAssignments) {
                Map<String, Object> assignmentMap = new HashMap<>();
                assignmentMap.put("id", assignment.getId());
                assignmentMap.put("restaurantId", assignment.getRestorant().getId());
                assignmentMap.put("restaurantName", assignment.getRestorant().getRestorantName());
                userAssignmentsData.add(assignmentMap);
            }
            debugResponse.put("userAssignments", userAssignmentsData);
            
            // Get the user account for additional information
            try {
                Account account = accountService.getAccountById(userId);
                if (account != null) {
                    debugResponse.put("userDetails", Map.of(
                        "id", account.getId(),
                        "email", account.getMailAddress(),
                        "accountType", account.getAccountType(),
                        "firstName", account.getFirstName(),
                        "lastName", account.getLastName()
                    ));
                }
            } catch (Exception e) {
                System.err.println("Error getting account details: " + e.getMessage());
                debugResponse.put("userDetailsError", e.getMessage());
            }
            
            return ResponseEntity.ok(debugResponse);
        } catch (Exception e) {
            System.err.println("Error in debugAssignments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }
} 