package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.AccountDTO;
import com.example.qr_menu.dto.LoginDTO;
import com.example.qr_menu.dto.ChangePasswordDTO;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.services.AccountService;
import com.example.qr_menu.utils.JwtTokenUtil;
import org.springframework.data.domain.Page;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public AccountController(AccountService accountService, JwtTokenUtil jwtTokenUtil) {
        this.accountService = accountService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    /**
     * Registers a new account.
     *
     * @param accountDTO the account data transfer object
     * @return a response indicating the outcome
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AccountDTO accountDTO) {
        try {
            accountService.registerAccount(accountDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("Account successfully created");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    /**
     * Authenticates a user and generates a JWT token.
     *
     * @param loginDTO the login data transfer object
     * @return a JWT token if authentication is successful
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            String token = accountService.login(loginDTO);
            if (token != null) {
                return ResponseEntity.ok(token);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error occurred");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // The logout endpoint can clear the frontend-stored token.
        return ResponseEntity.ok("Logged out successfully");
    }


    /**
     * Fetches all accounts with their associated restaurants.
     *
     * @return a list of accounts with restaurant information
     */
    @GetMapping("/with-restaurants")
    public ResponseEntity<List<AccountDTO>> getAllAccountsWithRestaurants() {
        List<AccountDTO> accounts = accountService.getAllAccountsWithRestaurants();
        return ResponseEntity.ok(accounts);
    }

    /**
     * Fetches all accounts without additional relationships.
     *
     * @return a list of accounts
     */
    @GetMapping
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        List<AccountDTO> accounts = accountService.getAllAccounts();
        return ResponseEntity.ok(accounts);
    }

    /**
     * Deletes an account by ID.
     *
     * @param id the ID of the account to delete
     * @return a response indicating the outcome
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id) {
        try {
            accountService.deleteAccount(id);
            return ResponseEntity.ok("Account deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete account");
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<String> updateAccount(@PathVariable Long id, @RequestBody AccountDTO accountDTO) {
        try {
            accountService.updateAccount(id, accountDTO);
            return ResponseEntity.ok("Account updated successfully");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update account");
        }
    }


    @GetMapping("/paged")
    public ResponseEntity<Page<AccountDTO>> getPagedAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AccountDTO> pagedAccounts = accountService.getPagedAccounts(page, size);
        return ResponseEntity.ok(pagedAccounts);
    }

    @PostMapping("/uploadProfilePicture/{accountId}")
    public ResponseEntity<String> uploadProfilePicture(
            @PathVariable Long accountId,
            @RequestParam("profilePicture") MultipartFile profilePicture,
            @RequestHeader("Authorization") String token
    ) {
        try {
            // Извличаме email от JWT токена
            String loggedInUserEmail = jwtTokenUtil.extractUsername(token.replace("Bearer ", ""));

            accountService.uploadProfilePicture(accountId, profilePicture, loggedInUserEmail);
            return ResponseEntity.ok("Profile picture uploaded successfully!");
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload profile picture");
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            // 1. Извличаме самия JWT без "Bearer "
            String token = authorizationHeader.replace("Bearer ", "");

            // 2. Проверяваме дали е валиден
            if (!jwtTokenUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
            }

            // 3. Извличаме email от токена
            String email = jwtTokenUtil.extractUsername(token);

            // 4. Намираме потребителя по email (може да върнете AccountDTO, entity, т.н.)
            AccountDTO accountDTO = accountService.getAccountDtoByEmail(email);

            if (accountDTO == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found");
            }

            // 5. Връщаме данните за потребителя (примерно {id, firstName, lastName, profilePicture, accountType...})
            return ResponseEntity.ok(accountDTO);

        } catch (Exception e) {
            // Ако нещо друго гръмне (например проблем при парсване на токена)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token validation failed");
        }
    }

    /**
     * Endpoint за смяна на парола
     */
    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordDTO passwordDTO,
            @RequestHeader("Authorization") String token) {
        
        try {
            // 1. Извличаме имейла на потребителя от JWT токена
            String jwtToken = token.substring(7); // Премахваме "Bearer " от началото
            String userEmail = jwtTokenUtil.getMailAddressFromToken(jwtToken);
            
            // 2. Извикваме сървиса за смяна на паролата
            boolean success = accountService.changePassword(id, passwordDTO, userEmail);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to change password"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

}


