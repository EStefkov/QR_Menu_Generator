package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.FavoriteDTO;
import com.example.qr_menu.services.FavoriteService;
import com.example.qr_menu.services.AccountService;
import com.example.qr_menu.repositories.FavoriteRepository;
import com.example.qr_menu.utils.JwtTokenUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    private final FavoriteService favoriteService;
    private final AccountService accountService;
    private final FavoriteRepository favoriteRepository;
    private final JwtTokenUtil jwtTokenUtil;
    
    public FavoriteController(
            FavoriteService favoriteService, 
            AccountService accountService,
            FavoriteRepository favoriteRepository,
            JwtTokenUtil jwtTokenUtil) {
        this.favoriteService = favoriteService;
        this.accountService = accountService;
        this.favoriteRepository = favoriteRepository;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping("/{productId}")
    public ResponseEntity<FavoriteDTO> addFavorite(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long accountId = accountService.getAccountByMailAddress(userDetails.getUsername()).getId();
        return ResponseEntity.ok(favoriteService.addFavorite(accountId, productId));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long accountId = accountService.getAccountByMailAddress(userDetails.getUsername()).getId();
        favoriteService.removeFavorite(accountId, productId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<FavoriteDTO>> getAccountFavorites(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long accountId = accountService.getAccountByMailAddress(userDetails.getUsername()).getId();
        return ResponseEntity.ok(favoriteService.getAccountFavorites(accountId));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<Boolean> isProductFavorite(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long accountId = accountService.getAccountByMailAddress(userDetails.getUsername()).getId();
        return ResponseEntity.ok(favoriteService.isProductFavorite(accountId, productId));
    }

    @GetMapping("/count/{accountId}")
    public ResponseEntity<Long> getFavoriteCountByAccountId(
            @PathVariable Long accountId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            // Check if token exists
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(0L);
            }
            
            // Extract user info from JWT token
            String jwtToken = token.substring(7); // Remove "Bearer " prefix
            Claims claims = jwtTokenUtil.getAllClaimsFromToken(jwtToken);
            
            // Get the user role from token
            String role = claims.get("role", String.class);
            if (role == null) {
                role = "ROLE_USER"; // Default role if not found
            }
            
            Long tokenAccountId = claims.get("accountId", Long.class);
            
            // Security check: Only admin users or the owner of the account can get favorite count
            boolean isAdmin = "ROLE_ADMIN".equals(role);
            boolean isAccountOwner = tokenAccountId != null && tokenAccountId.equals(accountId);
            
            if (!isAdmin && !isAccountOwner) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(0L);
            }
            
            // Get the count of favorites for the specified accountId
            long favoriteCount = favoriteRepository.countByAccountId(accountId);
            
            return ResponseEntity.ok(favoriteCount);
            
        } catch (Exception e) {
            System.out.println("Error getting favorite count: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(0L);
        }
    }
} 