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

    /**
     * Създава продукт. Ако productImage не е зададено,
     * ще му сложим "default_product.png".
     */
    public ProductDTO createProduct(ProductDTO productDTO) {
        if (productDTO.getProductImage() == null || productDTO.getProductImage().isBlank()) {
            productDTO.setProductImage("default_product.png");
        }

        // Проверяваме дали съществува категорията
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Менюто е свързано през категорията
        Menu menu = category.getMenu();

        String defaultProfilePicture = "https://www.tiffincurry.ca/wp-content/uploads/2021/02/default-product.png";
        String productPicture = productDTO.getProductImage() != null ? productDTO.getProductImage() : defaultProfilePicture;

        // Създаваме ентити обект
        Product product = Product.builder()
                .productName(productDTO.getProductName())
                .productPrice(productDTO.getProductPrice())
                .productInfo(productDTO.getProductInfo())
                .productImage(productPicture) // път или URL
                .category(category)
                .menu(menu)
                .build();

        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    // Връща списък продукти за дадена категория (ако ви трябва)
    public List<ProductDTO> getProductsByCategoryId(Long categoryId) {
        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Връща списък продукти за дадено меню
    public List<ProductDTO> getProductsByMenuId(Long menuId) {
        return productRepository.findByMenuId(menuId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Конвертира ентити в DTO
    private ProductDTO convertToDto(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .productPrice(product.getProductPrice())
                .productInfo(product.getProductInfo())
                .categoryId(product.getCategory().getId())
                .productImage(product.getProductImage())
                // Ако искате да върнете и пътя на снимката, добавете:
                // .productImage(product.getProductImage())
                .build();
    }

    // Ъпдейт
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setProductName(productDTO.getProductName());
        product.setProductPrice(productDTO.getProductPrice());
        product.setProductInfo(productDTO.getProductInfo());

        // Ако productImage e null => не пипаме снимката
        // Ако productImage e нещо != null, тогава задаваме новата
        if (productDTO.getProductImage() != null) {
            // ако е "" (празен стринг), може да сложим default. Или остави така.
            if (productDTO.getProductImage().isEmpty()) {
                product.setProductImage("default_product.png");
            } else {
                product.setProductImage(productDTO.getProductImage());
            }
        }

        Product updated = productRepository.save(product);
        return convertToDto(updated);
    }

    // Изтриване
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

}
