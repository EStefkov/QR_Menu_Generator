package com.example.qr_menu.services;

import com.example.qr_menu.dto.FavoriteDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.Favorite;
import com.example.qr_menu.entities.Product;
import com.example.qr_menu.repositories.FavoriteRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final AccountService accountService;
    private final ProductService productService;

    @Transactional
    public FavoriteDTO addFavorite(Long accountId, Long productId) {
        Account account = accountService.getAccountById(accountId);
        Product product = productService.getProductById(productId);

        if (favoriteRepository.existsByAccountIdAndProductId(accountId, productId)) {
            throw new IllegalStateException("Product is already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setAccount(account);
        favorite.setProduct(product);

        Favorite savedFavorite = favoriteRepository.save(favorite);

        return convertToDTO(savedFavorite);
    }


    @Transactional
    public void removeFavorite(Long accountId, Long productId) {
        Favorite favorite = favoriteRepository.findByAccountIdAndProductId(accountId, productId)
                .orElseThrow(() -> new EntityNotFoundException("Favorite not found"));
        favoriteRepository.delete(favorite);
    }


    @Transactional(readOnly = true)
    public List<FavoriteDTO> getAccountFavorites(Long accountId) {
        return favoriteRepository.findByAccountId(accountId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isProductFavorite(Long accountId, Long productId) {
        return favoriteRepository.existsByAccountIdAndProductId(accountId, productId);
    }

    private FavoriteDTO convertToDTO(Favorite favorite) {
        FavoriteDTO dto = new FavoriteDTO();
        dto.setId(favorite.getId());
        dto.setAccountId(favorite.getAccount().getId());
        dto.setProductId(favorite.getProduct().getId());
        dto.setProductName(favorite.getProduct().getProductName());
        dto.setProductImage(favorite.getProduct().getProductImage());
        dto.setProductPrice(favorite.getProduct().getProductPrice());
        dto.setCreatedAt(favorite.getCreatedAt());
        return dto;
    }
} 