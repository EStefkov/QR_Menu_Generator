package com.example.qr_menu.services;

import com.example.qr_menu.dto.ProductDTO;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Product;
import com.example.qr_menu.repositories.MenuRepository;
import com.example.qr_menu.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MenuRepository menuRepository;

    public List<ProductDTO> getProductsByMenuId(Long menuId) {
        return productRepository.findAll().stream()
                .filter(product -> product.getMenu().getId().equals(menuId))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ProductDTO createProduct(ProductDTO productDTO) {
        Menu menu = menuRepository.findById(productDTO.getMenuId())
                .orElseThrow(() -> new RuntimeException("Menu not found"));

        Product product = Product.builder()
                .productName(productDTO.getProductName())
                .productPrice(productDTO.getProductPrice())
                .productInfo(productDTO.getProductInfo())
                .menu(menu)
                .build();

        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setProductName(productDTO.getProductName());
        product.setProductPrice(productDTO.getProductPrice());
        product.setProductInfo(productDTO.getProductInfo());

        Product updatedProduct = productRepository.save(product);
        return convertToDto(updatedProduct);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private ProductDTO convertToDto(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .productPrice(product.getProductPrice())
                .productInfo(product.getProductInfo())
                .menuId(product.getMenu().getId())
                .build();
    }
}
