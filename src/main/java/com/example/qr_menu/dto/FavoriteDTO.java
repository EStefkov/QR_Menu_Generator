package com.example.qr_menu.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FavoriteDTO {
    private Long id;
    private Long accountId;
    private Long productId;
    private String productName;
    private String productImage;
    private Double productPrice;
    private LocalDateTime createdAt;
} 