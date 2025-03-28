package com.example.qr_menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long productId;
    private String name;
    private BigDecimal price;
    private Integer quantity;
    private String image;
    private Long categoryId;
    private String categoryName;
    
    // Explicit getters to ensure they exist
    public Long getProductId() {
        return productId;
    }
    
    public String getName() {
        return name != null ? name : "";
    }
    
    public BigDecimal getPrice() {
        return price != null ? price : BigDecimal.ZERO;
    }
    
    public Integer getQuantity() {
        return quantity != null ? quantity : 0;
    }
    
    public String getImage() {
        return image;
    }
    
    public Long getCategoryId() {
        return categoryId;
    }
    
    public String getCategoryName() {
        return categoryName != null ? categoryName : "";
    }
} 