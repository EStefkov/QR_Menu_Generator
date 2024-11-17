package com.example.qr_menu.services;

import com.example.qr_menu.dto.OrderDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.Order;
import com.example.qr_menu.entities.Product;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.repositories.AccountRepository;
import com.example.qr_menu.repositories.OrderRepository;
import com.example.qr_menu.repositories.ProductRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final RestaurantRepository restorantRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, AccountRepository accountRepository,
                        RestaurantRepository restorantRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.accountRepository = accountRepository;
        this.restorantRepository = restorantRepository;
        this.productRepository = productRepository;
    }

    public Order createOrder(OrderDTO orderDTO) {
        Account account = accountRepository.findById(orderDTO.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        Restorant restorant = restorantRepository.findById(orderDTO.getRestorantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        double totalPrice = 0.0;

        for (OrderDTO.ProductOrderDTO productOrder : orderDTO.getProducts()) {
            Product product = productRepository.findById(productOrder.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productOrder.getProductId()));

            totalPrice += product.getProductPrice() * productOrder.getQuantity();
        }

        Order order = Order.builder()
                .orderStatus(orderDTO.getOrderStatus())
                .totalPrice((long) totalPrice) // Corrected total price type
                .account(account)
                .restorant(restorant)
                .orderTime(new Date())
                .build();

        return orderRepository.save(order);
    }
}
