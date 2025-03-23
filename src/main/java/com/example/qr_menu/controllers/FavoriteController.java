package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.FavoriteDTO;
import com.example.qr_menu.services.FavoriteService;
import com.example.qr_menu.services.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;
    private final AccountService accountService;

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
} 