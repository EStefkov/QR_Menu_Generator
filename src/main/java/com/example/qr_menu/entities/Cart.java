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
    
    @Column(name = "total_amount")
    private Double totalAmount = 0.0;
    
    // Helper methods
    public void addItem(CartItem item) {
        items.add(item);
        item.setCart(this);
        updateTotalAmount();
    }
    
    public void removeItem(CartItem item) {
        items.remove(item);
        item.setCart(null);
        updateTotalAmount();
    }
    
    public void clearItems() {
        items.clear();
        totalAmount = 0.0;
    }
    
    public void updateTotalAmount() {
        this.totalAmount = calculateTotal();
    }

    public Double calculateTotal() {
        if (items == null || items.isEmpty()) {
            return 0.0;
        }
        
        return items.stream()
            .mapToDouble(item -> item.getPrice() * item.getQuantity())
            .sum();
    }

    public BigDecimal calculateTotalBigDecimal() {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        return items.stream()
            .map(item -> BigDecimal.valueOf(item.getPrice())
                .multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateTotalAsBigDecimal() {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : items) {
            BigDecimal price = BigDecimal.valueOf(item.getPrice());
            BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());
            BigDecimal itemTotal = price.multiply(quantity);
            total = total.add(itemTotal);
        }
        
        return total;
    }

    // Алтернативно име за updateTotalAmount
    public void recalculateTotal() {
        this.totalAmount = calculateTotal();
    }
} 