package com.example.qr_menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private Long id;
    private String productName;
    private Double productPrice;
    private String productInfo;
    private Long categoryId; // To associate the product with a menu by ID
    private String productImage;
}
