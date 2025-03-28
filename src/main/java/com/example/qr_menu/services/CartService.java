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
             if (item.getProduct().getId().equals(itemDTO.getProductId())) {
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
                     .id(itemDTO.getProductId())
                     .name(itemDTO.getName())
                     .price(itemDTO.getProductPrice())
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
            if (item.getProduct().getId().equals(itemDTO.getProductId())) {
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
            if (item.getProduct().getId().equals(productId)) {
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
        cart.setTotalAmount(0.0);
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
                            .totalAmount(0.0)
                            .items(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    // Метод за намиране или създаване на количка за конкретен потребител
    public Cart getOrCreateCartForUser(Long accountId) {
        Optional<Cart> existingCart = cartRepository.findByAccountId(accountId);
        
        if (existingCart.isPresent()) {
            return existingCart.get();
        } else {
            // Създаваме нова количка
            Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
            
            Cart newCart = new Cart();
            newCart.setAccount(account);
            newCart.setItems(new ArrayList<>());
            return cartRepository.save(newCart);
        }
    }

    // Получаване на количката за потребител
    public CartDTO getCartForUser(Long accountId) {
        Cart cart = getOrCreateCartForUser(accountId);
        return convertToCartDTO(cart);
    }
    
    // Добавяне на продукт в количката
    public CartDTO addToCart(Long accountId, CartItemDTO itemDto) {
        // Намираме или създаваме количка за този потребител
        Cart cart = getOrCreateCartForUser(accountId);
        
        // Намираме продукта
        Product product = productRepository.findById(itemDto.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Проверяваме дали продуктът вече е в количката
        Optional<CartItem> existingItem = cart.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(itemDto.getProductId()))
            .findFirst();
        
        if (existingItem.isPresent()) {
            // Обновяваме количеството
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + itemDto.getQuantity());
            cartItemRepository.save(item);
        } else {
            // Добавяме нов елемент
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(itemDto.getQuantity());
            
            // Добавяме допълнителна информация
            newItem.setName(product.getProductName());
            newItem.setPrice(product.getProductPrice());
            newItem.setImage(product.getProductImage());
            
            // Ако имате категория
            if (product.getCategory() != null) {
                newItem.setCategoryId(product.getCategory().getId());
                newItem.setCategoryName(product.getCategory().getName());
            }
            
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }
        
        // Тук е грешката - променете recalculateTotal() на updateTotalAmount()
        cart.updateTotalAmount();
        
        // Запазваме количката и връщаме DTO
        Cart savedCart = cartRepository.save(cart);
        return convertToCartDTO(savedCart);
    }
    
    // Премахване на продукт от количката
    public CartDTO removeFromCart(Long accountId, Long productId) {
        Cart cart = getOrCreateCartForUser(accountId);
        
        List<CartItem> itemsToRemove = new ArrayList<>();
        for (CartItem item : cart.getItems()) {
            if (item.getProduct().getId().equals(productId)) {
                itemsToRemove.add(item);
            }
        }
        
        if (!itemsToRemove.isEmpty()) {
            cart.getItems().removeAll(itemsToRemove);
            cartItemRepository.deleteAll(itemsToRemove);
            cartRepository.save(cart);
        }
        
        return convertToCartDTO(cart);
    }
    
    // Обновяване на количеството на продукт в количката
    public CartDTO updateCart(Long accountId, CartItemDTO itemDto) {
        Cart cart = getOrCreateCartForUser(accountId);
        
        Optional<CartItem> optionalItem = cart.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(itemDto.getProductId()))
            .findFirst();
            
        if (optionalItem.isPresent()) {
            CartItem item = optionalItem.get();
            item.setQuantity(itemDto.getQuantity());
            cartItemRepository.save(item);
            cartRepository.save(cart);
        }
        
        return convertToCartDTO(cart);
    }
    

    
    // Конвертиране на Cart в CartDTO
    private CartDTO convertToCartDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        List<CartItemDTO> itemDTOs = new ArrayList<>();
        
        if (cart.getItems() != null) {
            for (CartItem item : cart.getItems()) {
                CartItemDTO itemDTO = new CartItemDTO();
                itemDTO.setId(item.getId());
                
                Product product = item.getProduct();
                if (product != null) {
                    itemDTO.setProductId(product.getId());
                    itemDTO.setProductName(product.getProductName());
                    itemDTO.setProductPrice(product.getProductPrice());
                    itemDTO.setProductImage(product.getProductImage());
                }
                
                itemDTO.setQuantity(item.getQuantity());
                itemDTOs.add(itemDTO);
            }
        }
        
        dto.setItems(itemDTOs);
        return dto;
    }

    private CartDTO mapToCartDTO(Cart cart) {
        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(item -> CartItemDTO.builder()
                        .productId(item.getId())
                        .name(item.getName())
                        .price(BigDecimal.valueOf(item.getPrice()))
                        .quantity(item.getQuantity())
                        .image(item.getImage())
                        .categoryId(item.getCategoryId())
                        .categoryName(item.getCategoryName())
                        .build())
                .collect(Collectors.toList());
        
        return CartDTO.builder()
                .accountId(cart.getAccount().getId())
                .items(itemDTOs)
                .totalAmount(BigDecimal.valueOf(cart.getTotalAmount()))
                .itemCount(cart.getItems().size())
                .build();
    }

    // Метод за обновяване на общата сума на количката
    private void updateCartTotal(Cart cart) {
        double total = 0.0;
        for (CartItem item : cart.getItems()) {
            total += item.getPrice() * item.getQuantity();
        }
        cart.setTotalAmount(total);
    }

} 