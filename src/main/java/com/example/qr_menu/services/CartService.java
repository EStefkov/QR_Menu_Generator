package com.example.qr_menu.services;

import com.example.qr_menu.dto.CartDTO;
import com.example.qr_menu.dto.CartItemDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.Cart;
import com.example.qr_menu.entities.CartItem;
import com.example.qr_menu.entities.Product;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.CartItemRepository;
import com.example.qr_menu.repositories.CartRepository;
import com.example.qr_menu.repositories.ProductRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import com.example.qr_menu.repositories.AccountRepository;
//import jakarta.transaction.Transactional;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final RestaurantRepository restaurantRepository;
    private final AccountRepository accountRepository;
    
    /**
     * Get the current cart for a user at a specific restaurant
     */
    @Transactional(readOnly = true)
    public CartDTO getCartByAccountId(Long accountId) {
        Cart cart = getOrCreateCart(accountId);
        return mapToCartDTO(cart);
    }
    
    /**
     * Add a product to the cart
     */
    @Transactional
    public CartDTO addItemToCart(Long accountId, CartItemDTO itemDTO) {
        Cart cart = getOrCreateCart(accountId);
         // Check if the item already exists in the cart
         CartItem existingItem = null;
         for (CartItem item : cart.getItems()) {
             if (item.getProductId().equals(itemDTO.getProductId())) {
                 existingItem = item;
                 break;
             }
         }
         
         if (existingItem != null) {
             // Update quantity if item exists
             existingItem.setQuantity(existingItem.getQuantity() + itemDTO.getQuantity());
         } else {
             // Add new item to cart
             CartItem newItem = CartItem.builder()
                     .productId(itemDTO.getProductId())
                     .name(itemDTO.getName())
                     .price(itemDTO.getPrice())
                     .quantity(itemDTO.getQuantity())
                     .image(itemDTO.getImage())
                     .categoryId(itemDTO.getCategoryId())
                     .categoryName(itemDTO.getCategoryName())
                     .cart(cart)
                     .build();
             
             cart.getItems().add(newItem);
         }
         
         cart.recalculateTotal();
         Cart savedCart = cartRepository.save(cart);
         
         return mapToCartDTO(savedCart);
     }
    
    /**
     * Update cart item quantity
     */
    @Transactional
    public CartDTO updateCartItem(Long accountId, CartItemDTO itemDTO) {
        Cart cart = getOrCreateCart(accountId);
        
        CartItem cartItem = null;
        for (CartItem item : cart.getItems()) {
            if (item.getProductId().equals(itemDTO.getProductId())) {
                cartItem = item;
                break;
            }
        }
        if (cartItem == null) {
            throw new EntityNotFoundException("Item not found in cart");
        }
        
        // Update the cart item
        cartItem.setQuantity(itemDTO.getQuantity());
        
        // If quantity is 0 or less, remove the item
        if (itemDTO.getQuantity() <= 0) {
            cart.getItems().remove(cartItem);
        }
        cart.recalculateTotal();
        Cart savedCart = cartRepository.save(cart);
        
        return mapToCartDTO(savedCart);
    }
    
    /**
     * Remove an item from the cart
     */
    @Transactional
    public CartDTO removeItemFromCart(Long accountId, Long productId) {
        Cart cart = getOrCreateCart(accountId);
        
        // Find the item
        CartItem itemToRemove = null;
        for (CartItem item : cart.getItems()) {
            if (item.getProductId().equals(productId)) {
                itemToRemove = item;
                break;
            }
        }
        
        if (itemToRemove == null) {
            throw new EntityNotFoundException("Item not found in cart");
        }
        
        cart.getItems().remove(itemToRemove);
        cart.recalculateTotal();
        Cart savedCart = cartRepository.save(cart);
        
        return mapToCartDTO(savedCart);
    }
    
    /**
     * Clear all items from a cart
     */
    @Transactional
    public void clearCart(Long accountId) {
        Cart cart = getOrCreateCart(accountId);
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
    }
    
    /**
     * Helper method to get account ID from username
     */
    
     private Cart getOrCreateCart(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with ID: " + accountId));
        
        return cartRepository.findByAccountId(accountId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .account(account)
                            .totalAmount(BigDecimal.ZERO)
                            .items(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }


   

    

    private CartDTO mapToCartDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(item -> CartItemDTO.builder()
                        .productId(item.getProductId())
                        .name(item.getName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .image(item.getImage())
                        .categoryId(item.getCategoryId())
                        .categoryName(item.getCategoryName())
                        .build())
                .collect(Collectors.toList());
        
        return CartDTO.builder()
                .accountId(cart.getAccount().getId())
                .items(itemDTOs)
                .totalAmount(cart.getTotalAmount())
                .itemCount(cart.getItems().size())
                .build();
    }

} 