package com.example.qr_menu.services;

import com.example.qr_menu.dto.OrderDTO;
import com.example.qr_menu.entities.*;
import com.example.qr_menu.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final RestaurantRepository restorantRepository;
    private final ProductRepository productRepository;
    private final OrderProductRepository orderProductRepository;

    public OrderService(OrderRepository orderRepository, AccountRepository accountRepository,
                        RestaurantRepository restorantRepository, ProductRepository productRepository,
                        OrderProductRepository orderProductRepository) {
        this.orderRepository = orderRepository;
        this.accountRepository = accountRepository;
        this.restorantRepository = restorantRepository;
        this.productRepository = productRepository;
        this.orderProductRepository = orderProductRepository;
    }

    @Transactional
    public Order createOrder(OrderDTO orderDTO) {
        Account account = accountRepository.findById(orderDTO.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        Restorant restorant = restorantRepository.findById(orderDTO.getRestorantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        double totalPrice = 0.0;
        Set<OrderProduct> orderProducts = new HashSet<>();

        // Create and save order first
        Order order = Order.builder()
                .orderStatus(orderDTO.getOrderStatus())
                .totalPrice(orderDTO.getTotalPrice() != null ? orderDTO.getTotalPrice() : 0.0)
                .account(account)
                .restorant(restorant)
                .orderTime(new Date())
                .orderProducts(orderProducts)
                .build();
        
        Order savedOrder = orderRepository.save(order);

        // Process order products
        if (orderDTO.getProducts() != null && !orderDTO.getProducts().isEmpty()) {
            Date now = new Date();
            
            for (OrderDTO.ProductOrderDTO productOrderDTO : orderDTO.getProducts()) {
                Product product = productRepository.findById(productOrderDTO.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productOrderDTO.getProductId()));

                double priceAtOrder = product.getProductPrice();
                totalPrice += priceAtOrder * productOrderDTO.getQuantity();
                
                // Create order-product relationship
                OrderProductId orderProductId = new OrderProductId(savedOrder.getId(), product.getId());
                OrderProduct orderProduct = OrderProduct.builder()
                        .id(orderProductId)
                        .order(savedOrder)
                        .product(product)
                        .quantity(productOrderDTO.getQuantity())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();
                
                orderProducts.add(orderProduct);
                orderProductRepository.save(orderProduct);
            }
            
            // Update total price
            savedOrder.setTotalPrice(totalPrice);
            savedOrder = orderRepository.save(savedOrder);
        }

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderWithDetails(Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        
        if (orderOpt.isEmpty()) {
            return null;
        }
        
        Order order = orderOpt.get();
        
        // Convert to DTO
        OrderDTO orderDTO = OrderDTO.builder()
                .id(order.getId())
                .accountId(order.getAccount().getId())
                .restorantId(order.getRestorant().getId())
                .restorantName(order.getRestorant().getRestorantName())
                .orderStatus(order.getOrderStatus())
                .orderTime(order.getOrderTime())
                .totalPrice(order.getTotalPrice()) // Now Double instead of Long
                .build();
        
        // Get actual ordered products
        List<OrderProduct> orderProducts = orderProductRepository.findByOrderId(orderId);
        List<OrderDTO.ProductOrderDTO> productDTOs = new ArrayList<>();
        
        for (OrderProduct orderProduct : orderProducts) {
            Product product = orderProduct.getProduct();
            
            productDTOs.add(OrderDTO.ProductOrderDTO.builder()
                    .productId(product.getId())
                    .productName(product.getProductName())
                    .productImage(product.getProductImage())
                    .quantity(orderProduct.getQuantity())
                    .productPriceAtOrder(product.getProductPrice())
                    .build());
        }
        
        // If no products found (shouldn't happen), add dummy for backward compatibility
        if (productDTOs.isEmpty()) {
            productDTOs.add(OrderDTO.ProductOrderDTO.builder()
                    .productId(1L)
                    .productName("Product")
                    .productImage("/uploads/default_product.png")
                    .quantity(1)
                    .productPriceAtOrder(order.getTotalPrice())
                    .build());
        }
        
        orderDTO.setProducts(productDTOs);
        
        return orderDTO;
    }

    @Transactional
    public boolean deleteOrder(Long orderId) {
        if (orderRepository.existsById(orderId)) {
            orderRepository.deleteById(orderId);
            return true;
        } else {
            return false;
        }
    }
}
