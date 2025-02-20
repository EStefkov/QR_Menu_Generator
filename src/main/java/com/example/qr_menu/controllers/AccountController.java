package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.AccountDTO;
import com.example.qr_menu.dto.LoginDTO;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.services.AccountService;
import org.springframework.data.domain.Page;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;




import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    @Autowired
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
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


}
