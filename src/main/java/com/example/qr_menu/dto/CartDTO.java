package com.example.qr_menu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {
    private Long accountId;
    private List<CartItemDTO> items;
    private BigDecimal totalAmount;
    private int itemCount;
} 