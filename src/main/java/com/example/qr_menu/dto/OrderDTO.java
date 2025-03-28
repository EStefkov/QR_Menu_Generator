package com.example.qr_menu.dto;

import com.example.qr_menu.entities.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private Long id;
    private Long accountId;
    private Long restorantId;
    private Order.OrderStatus orderStatus;
    private List<ProductOrderDTO> products;
    private Date orderTime;
    private Double totalPrice;


    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductOrderDTO {
        private Long productId;
        private String productName;
        private String productImage;
        private int quantity;
        private Double productPriceAtOrder;
    }
}

