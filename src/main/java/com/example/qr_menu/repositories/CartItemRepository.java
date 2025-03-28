package com.example.qr_menu.repositories;

import com.example.qr_menu.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.productId = :productId")
    void deleteByCartIdAndProductId(Long cartId, Long productId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId")
    void deleteAllByCartId(Long cartId);
} 