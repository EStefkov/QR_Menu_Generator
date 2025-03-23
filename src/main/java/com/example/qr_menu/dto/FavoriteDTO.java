package com.example.qr_menu.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class FavoriteDTO {
    private Long id;
    private Long accountId;
    private Long productId;
    private String productName;
    private String productImage;
    private Double productPrice;
    private String productInfo;
    private List<String> allergens;
    private LocalDateTime createdAt;
} 