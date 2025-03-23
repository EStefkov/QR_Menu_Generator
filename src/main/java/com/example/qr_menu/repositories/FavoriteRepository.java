package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByAccountId(Long accountId);
    Optional<Favorite> findByAccountIdAndProductId(Long accountId, Long productId);
    boolean existsByAccountIdAndProductId(Long accountId, Long productId);
} 