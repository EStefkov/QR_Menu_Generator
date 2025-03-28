package com.example.qr_menu.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "carts")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;
    
    @Builder.Default
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();
    
    @Builder.Default
    @Column(nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    // Helper methods
    public void addItem(CartItem item) {
        items.add(item);
        item.setCart(this);
        recalculateTotal();
    }
    
    public void removeItem(CartItem item) {
        items.remove(item);
        recalculateTotal();
    }
    
    public void clearItems() {
        items.clear();
        totalAmount = BigDecimal.ZERO;
    }
    
    public void recalculateTotal() {
        totalAmount = items.stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
} 