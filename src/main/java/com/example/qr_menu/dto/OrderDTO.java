package com.example.qr_menu.dto;

import com.example.qr_menu.entities.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private Long accountId;
    private Long restorantId;
    private Order.OrderStatus orderStatus;
    private List<ProductOrderDTO> products; // New field to track products and quantities

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductOrderDTO {
        private Long productId;
        private int quantity;
    }
}

