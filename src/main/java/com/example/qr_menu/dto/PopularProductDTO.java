package com.example.qr_menu.dto;

import java.math.BigDecimal;

/**
 * Data Transfer Object for popular products
 * Contains information about products and their order count
 */
public class PopularProductDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private Long orderCount;
    
    public PopularProductDTO() {
        // Default constructor required for serialization
    }
    
    public PopularProductDTO(Long id, String name, BigDecimal price, Long orderCount) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.orderCount = orderCount;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Long getOrderCount() {
        return orderCount;
    }
    
    public void setOrderCount(Long orderCount) {
        this.orderCount = orderCount;
    }
    
    @Override
    public String toString() {
        return "PopularProductDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", orderCount=" + orderCount +
                '}';
    }
} 