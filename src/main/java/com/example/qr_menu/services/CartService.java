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
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
//import jakarta.transaction.Transactional;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

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
     * Get the current cart for a user
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
    public CartDTO addToCart(Long accountId, CartItemDTO itemDTO) {
        Cart cart = getOrCreateCart(accountId);
        Product product = productRepository.findById(itemDTO.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemDTO.getProductId()));
        
        // Ensure quantity is at least 1
        int quantity = Math.max(1, itemDTO.getQuantity());
        itemDTO.setQuantity(quantity);
        
        // Check if the item already exists in the cart
        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        
        if (existingItemOpt.isPresent()) {
            // Update quantity if item exists
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            // Add new item to cart
            CartItem newItem = CartItem.builder()
                .cart(cart)
                .product(product)
                .name(product.getProductName())
                .price(BigDecimal.valueOf(product.getProductPrice()))
                .quantity(quantity)
                .image(product.getProductImage())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .restaurantId(itemDTO.getRestaurantId() != null ? itemDTO.getRestaurantId() : 
                    (product.getCategory() != null && product.getCategory().getMenu() != null && 
                     product.getCategory().getMenu().getRestorant() != null ? 
                     product.getCategory().getMenu().getRestorant().getId() : null))
                .build();
            
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }
        
        cart.updateTotalAmount();
        cartRepository.save(cart);
        
        return mapToCartDTO(cart);
    }
    
    /**
     * Update cart item quantity
     */
    @Transactional
    public CartDTO updateCartItem(Long accountId, CartItemDTO itemDTO) {
        Cart cart = getOrCreateCart(accountId);
        
        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), itemDTO.getProductId())
            .orElseThrow(() -> new EntityNotFoundException("Item not found in cart"));
        
        // If quantity is 0 or less, remove the item
        if (itemDTO.getQuantity() <= 0) {
            cart.getItems().remove(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            // Ensure quantity is at least 1
            int quantity = Math.max(1, itemDTO.getQuantity());
            
            // Update the cart item quantity
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }
        
        cart.updateTotalAmount();
        cartRepository.save(cart);
        
        return mapToCartDTO(cart);
    }
    
    /**
     * Remove an item from the cart
     */
    @Transactional
    public CartDTO removeFromCart(Long accountId, Long productId) {
        Cart cart = getOrCreateCart(accountId);
        
        CartItem itemToRemove = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
            .orElseThrow(() -> new EntityNotFoundException("Item not found in cart"));
        
        cart.getItems().remove(itemToRemove);
        cartItemRepository.delete(itemToRemove);
        
        cart.updateTotalAmount();
        cartRepository.save(cart);
        
        return mapToCartDTO(cart);
    }
    
    /**
     * Clear all items from a cart
     */
    @Transactional
    public void clearCart(Long accountId) {
        Cart cart = getOrCreateCart(accountId);
        cartItemRepository.deleteAllByCartId(cart.getId());
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);
    }
    
    /**
     * Helper method to get or create a cart for an account
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
    
    /**
     * Get cart for a user
     */
    public CartDTO getCartForUser(Long accountId) {
        Cart cart = getOrCreateCart(accountId);
        return mapToCartDTO(cart);
    }
    
    /**
     * Map Cart entity to CartDTO
     */
    private CartDTO mapToCartDTO(Cart cart) {
        if (cart == null) {
            return new CartDTO();
        }
        
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
            .map(item -> {
                CartItemDTO dto = new CartItemDTO();
                dto.setId(item.getId());
                dto.setProductId(item.getProduct().getId());
                dto.setName(item.getName());
                dto.setProductPrice(item.getPrice().doubleValue());
                dto.setQuantity(item.getQuantity());
                dto.setImage(item.getImage());
                dto.setCategoryId(item.getCategoryId());
                dto.setCategoryName(item.getCategoryName());
                dto.setRestaurantId(item.getRestaurantId());
                return dto;
            })
            .collect(Collectors.toList());
        
        return CartDTO.builder()
            .accountId(cart.getAccount().getId())
            .items(itemDTOs)
            .totalAmount(cart.getTotalAmount())
            .itemCount(itemDTOs.size())
            .build();
    }

    // Метод за обновяване на общата сума на количката
    private void updateCartTotal(Cart cart) {
        BigDecimal total = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        cart.setTotalAmount(total);
    }

} 