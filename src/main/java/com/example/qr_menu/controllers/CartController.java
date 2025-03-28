package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.CartDTO;
import com.example.qr_menu.dto.CartItemDTO;
import com.example.qr_menu.security.SecurityUtils;
import com.example.qr_menu.services.CartService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> getCart() {
        Long currentUserId = securityUtils.getCurrentUserId();
        CartDTO cart = cartService.getCartForUser(currentUserId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<CartDTO> addToCart(@RequestBody CartItemDTO itemDTO) {
        Long accountId = securityUtils.getCurrentUserId();
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cartService.addToCart(accountId, itemDTO));
    }

    @PutMapping("/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> updateCart(@RequestBody CartItemDTO itemDTO) {
        Long accountId = securityUtils.getCurrentUserId();
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return ResponseEntity.ok(cartService.updateCartItem(accountId, itemDTO));
    }

    @DeleteMapping("/remove/{productId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CartDTO> removeFromCart(@PathVariable Long productId) {
        Long accountId = securityUtils.getCurrentUserId();
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return ResponseEntity.ok(cartService.removeFromCart(accountId, productId));
    }

    @DeleteMapping("/clear")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> clearCart() {
        Long accountId = securityUtils.getCurrentUserId();
        if (accountId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        cartService.clearCart(accountId);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (ex instanceof EntityNotFoundException) {
            status = HttpStatus.NOT_FOUND;
        } else if (ex instanceof IllegalArgumentException) {
            status = HttpStatus.BAD_REQUEST;
        }
        
        return new ResponseEntity<>(response, status);
    }
} 