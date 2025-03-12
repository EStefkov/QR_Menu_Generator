package com.example.qr_menu.services;

import com.example.qr_menu.dto.AllergenDTO;
import com.example.qr_menu.dto.ProductDTO;
import com.example.qr_menu.entities.Allergen;
import com.example.qr_menu.entities.Category;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Product;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.AllergenRepository;
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

    @Autowired
    private AllergenRepository allergenRepository;

    /**
     * Създава продукт. Ако productImage не е зададено,
     * поставяме "default_product.png".
     * Ако не подадеш allergenIds, няма да има алергени (не е задължително).
     */
    public ProductDTO createProduct(ProductDTO productDTO) {
        // Ако няма снимка, задаваме "default_product.png"
        if (productDTO.getProductImage() == null || productDTO.getProductImage().isBlank()) {
            productDTO.setProductImage("default_product.png");
        }

        // Намираме категорията
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        // Менюто идва от категорията
        Menu menu = category.getMenu();

        // Създаваме Product
        Product product = Product.builder()
                .productName(productDTO.getProductName())
                .productPrice(productDTO.getProductPrice())
                .productInfo(productDTO.getProductInfo())
                .productImage(productDTO.getProductImage())
                .category(category)
                .menu(menu)
                .build();

        // Проверяваме allergenIds: ако е != null и не е празен
        if (productDTO.getAllergenIds() != null && !productDTO.getAllergenIds().isEmpty()) {
            List<Allergen> allergens = allergenRepository.findAllById(productDTO.getAllergenIds());
            product.setAllergens(allergens);
        }

        Product savedProduct = productRepository.save(product);
        return convertToDto(savedProduct);
    }

    /**
     * Връща списък продукти за дадена категория.
     */
    public List<ProductDTO> getProductsByCategoryId(Long categoryId) {
        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Връща списък продукти за дадено меню.
     */
    public List<ProductDTO> getProductsByMenuId(Long menuId) {
        return productRepository.findByMenuId(menuId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Конвертира ентити в ProductDTO.
     * Връщаме и:
     *  - allergenIds (за форми/ъпдейти)
     *  - пълен списък от AllergenDTO (за визуализация).
     */
    private ProductDTO convertToDto(Product product) {
        // Списък с ID-тата на алергените
        List<Long> allergenIds = product.getAllergens().stream()
                .map(Allergen::getId)
                .collect(Collectors.toList());

        // Пълен списък от обекти (AllergenDTO), например:
        List<AllergenDTO> allergenDTOs = product.getAllergens().stream()
                .map(allergen -> new AllergenDTO(allergen.getId(), allergen.getAllergenName()))
                .collect(Collectors.toList());

        return ProductDTO.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .productPrice(product.getProductPrice())
                .productInfo(product.getProductInfo())
                .categoryId(product.getCategory().getId())
                .productImage(product.getProductImage())

                // Слагаме и двата списъка:
                .allergenIds(allergenIds)
                .allergens(allergenDTOs)

                .build();
    }

    /**
     * Ъпдейт на продукт. Ако allergenIds е null, не пипаме алергените.
     * Ако allergenIds е празен списък, изчистваме всички алергени.
     * Ако съдържа ID-та, зареждаме ги и сетваме.
     */
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setProductName(productDTO.getProductName());
        product.setProductPrice(productDTO.getProductPrice());
        product.setProductInfo(productDTO.getProductInfo());

        // Ако productImage != null => можем да променим снимката
        if (productDTO.getProductImage() != null) {
            // Ако е празен стринг, задаваме default_product.png
            if (productDTO.getProductImage().isEmpty()) {
                product.setProductImage("default_product.png");
            } else {
                product.setProductImage(productDTO.getProductImage());
            }
        }

        // Обновяване на алергени само ако allergenIds не е null
        if (productDTO.getAllergenIds() != null) {
            if (productDTO.getAllergenIds().isEmpty()) {
                // Празен => махаме всички алергени
                product.getAllergens().clear();
            } else {
                // Задаваме новия списък
                List<Allergen> allergens = allergenRepository.findAllById(productDTO.getAllergenIds());
                product.setAllergens(allergens);
            }
        }

        Product updated = productRepository.save(product);
        return convertToDto(updated);
    }

    /**
     * Изтрива продукт по ID.
     */
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
