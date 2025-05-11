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
    private String restorantName;
    private Order.OrderStatus orderStatus;
    private List<ProductOrderDTO> products;
    private Date orderTime;
    private Double totalPrice;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String specialRequests;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductOrderDTO {
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private Double productPriceAtOrder;
    }
}

