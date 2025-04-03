package com.example.qr_menu.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString(exclude = {"account", "product"})
@Entity
@Table(name = "favorites", 
       indexes = {
           @Index(name = "idx_favorites_account_product", columnList = "account_id,product_id", unique = true)
       })
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, updatable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, updatable = false)
    private Product product;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Favorite)) return false;
        Favorite favorite = (Favorite) o;
        
        Long accountId = account != null ? account.getId() : null;
        Long productId = product != null ? product.getId() : null;
        Long otherAccountId = favorite.getAccount() != null ? favorite.getAccount().getId() : null;
        Long otherProductId = favorite.getProduct() != null ? favorite.getProduct().getId() : null;
        
        return (accountId != null && accountId.equals(otherAccountId)) &&
               (productId != null && productId.equals(otherProductId));
    }

    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((account != null && account.getId() != null) ? account.getId().hashCode() : 0);
        result = prime * result + ((product != null && product.getId() != null) ? product.getId().hashCode() : 0);
        return result;
    }
} 