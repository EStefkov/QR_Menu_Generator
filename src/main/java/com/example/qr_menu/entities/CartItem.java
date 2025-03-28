package com.example.qr_menu.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;
    
    @Column(name = "product_id", nullable = false)
    private Long productId;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(nullable = false)
    private Integer quantity;
    
    private String image;
    
    @Column(name = "category_id")
    private Long categoryId;
    
    @Column(name = "category_name")
    private String categoryName;
    
    // Helper method for total price calculation
    @Transient
    public BigDecimal getTotalPrice() {
        return price.multiply(new BigDecimal(quantity));
    }
} 