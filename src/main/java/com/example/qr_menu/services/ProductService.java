package com.example.qr_menu.services;

import com.example.qr_menu.dto.ProductDTO;
import com.example.qr_menu.entities.Category;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Product;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.CategoryRepository;
import com.example.qr_menu.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public ProductDTO createProduct(ProductDTO productDTO) {
        // Намери категорията
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Автоматично вземи менюто от категорията
        Menu menu = category.getMenu();

        // Създай нов продукт
        Product product = Product.builder()
                .productName(productDTO.getProductName())
                .productPrice(productDTO.getProductPrice())
                .productInfo(productDTO.getProductInfo())
                .category(category) // Свързва се с категорията
                .menu(menu) // Свързва се с менюто, извлечено от категорията
                .build();

        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }



    public List<ProductDTO> getProductsByCategoryId(Long categoryId) {
        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    public List<ProductDTO> getProductsByMenuId(Long menuId) {
        return productRepository.findByMenuId(menuId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    private ProductDTO convertToDto(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .productPrice(product.getProductPrice())
                .productInfo(product.getProductInfo())
                .categoryId(product.getCategory().getId())
                .build();
    }

    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setProductName(productDTO.getProductName());
        product.setProductPrice(productDTO.getProductPrice());
        product.setProductInfo(productDTO.getProductInfo());

        Product updatedProduct = productRepository.save(product);
        return convertToDto(updatedProduct);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

}
