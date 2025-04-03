package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.ProductDTO;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Product;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.CategoryRepository;
import com.example.qr_menu.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private CategoryRepository categoryRepository;

    // Продукти според меню
    @GetMapping("/menu/{menuId}")
    public ResponseEntity<List<ProductDTO>> getProductsByMenuId(@PathVariable Long menuId) {
        List<ProductDTO> products = productService.getProductsByMenuId(menuId);
        return ResponseEntity.ok(products);
    }

    /**
     * 1) Създава продукт чрез JSON (application/json).
     *    Ако `productImage` е празно/null, задава "default_product.png".
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProductDTO> createProductJson(@RequestBody ProductDTO productDTO) {
        ProductDTO createdProduct = productService.createProduct(productDTO);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    /**
     * 2) Създава продукт чрез multipart/form-data.
     *    Файлът се записва в папка "uploads/", а в базата се пази само пътят ("/uploads/filename").
     *    Ако не качите файл, ще се сложи "default_product.png".
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProductMultipart(
            @RequestParam("productName") String productName,
            @RequestParam("productPrice") Double productPrice,
            @RequestParam("productInfo") String productInfo,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "allergenIds", required = false) List<Long> allergenIds,
            @RequestParam(value = "productImage", required = false) MultipartFile productImage
    ) {
        // Подготвяме DTO от параметрите
        ProductDTO dto = new ProductDTO();
        dto.setProductName(productName);
        dto.setProductPrice(productPrice);
        dto.setProductInfo(productInfo);
        dto.setCategoryId(categoryId);
        dto.setAllergenIds(allergenIds);

        // Проверява дали е подаден файл
        if (productImage == null || productImage.isEmpty()) {
            // Сетва дефолтна снимка на продукта
            Menu menu = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"))
                    .getMenu();
                    
            // Get the menu's default product image or create a standard path
            String defaultImage = menu.getDefaultProductImage();
            if (defaultImage != null && !defaultImage.isBlank()) {
                dto.setProductImage(defaultImage);
            } else {
                dto.setProductImage("http://localhost:8080/uploads/" + menu.getId() + "/default_product.png");
            }
        } else {
            // Ако има качен файл, записваме го в папка "uploads/"
            String savedPath = saveImage(productImage);
            dto.setProductImage(savedPath);
        }

        ProductDTO createdProduct = productService.createProduct(dto);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    /**
     * 3) Ъпдейт на продукт (PUT) чрез multipart/form-data.
     *    Подобен подход като create: ако не се качи нов файл, можем да запазим старата снимка
     *    или да сложим "default_product.png". Тук за пример ще покажем вариант с "updateProduct".
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> updateProductMultipart(
            @PathVariable Long id,
            @RequestParam("productName") String productName,
            @RequestParam("productPrice") Double productPrice,
            @RequestParam("productInfo") String productInfo,
            @RequestParam(value = "productImage", required = false) MultipartFile productImage
    ) {
        // Взимаме текущия продукт от базата (чрез сервиза) - за да видим старата снимка
        // или директно минаваме през service.updateProduct(...)
        // Тук, за пример, ще си създадем DTO и ще го дадем на service.updateProduct

        // Подготвяме DTO
        ProductDTO dto = new ProductDTO();
        dto.setProductName(productName);
        dto.setProductPrice(productPrice);
        dto.setProductInfo(productInfo);

        if (productImage != null && !productImage.isEmpty()) {
            // Качваме нова снимка
            String savedPath = saveImage(productImage);
            dto.setProductImage(savedPath);
        } else {
            // Ако не качим нов файл, логиката в service може да реши дали да запази старото
            // или да сложи "default_product.png". За пример, може да кажем:
            dto.setProductImage(null);
            // => service.updateProduct() ще запази старата снимка, ако в dto image е null.
        }

        ProductDTO updatedProduct = productService.updateProduct(id, dto);
        return ResponseEntity.ok(updatedProduct);
    }

    /**
     * Записва качения файл в папка "uploads/" и връща относителния път
     * ("/uploads/filename"), който да се пази в базата.
     */
    private String saveImage(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            Path path = Paths.get("uploads/" + file.getOriginalFilename());
            Files.write(path, bytes);
            return "/uploads/" + file.getOriginalFilename();
        } catch (IOException e) {
            throw new RuntimeException("Неуспешно качване на снимка", e);
        }
    }

    // Триене
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // Ако искаш да запазиш и JSON ъпдейт (без файл):
    // @PutMapping("/{id}")
    // public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
    //     ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
    //     return ResponseEntity.ok(updatedProduct);
    // }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategoryId(@PathVariable Long categoryId) {
        List<ProductDTO> products = productService.getProductsByCategoryId(categoryId);
        return ResponseEntity.ok(products);
    }

    // Get single product by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(product.getId());
        productDTO.setProductName(product.getProductName());
        productDTO.setProductPrice(product.getProductPrice());
        productDTO.setProductInfo(product.getProductInfo());
        productDTO.setProductImage(product.getProductImage());
        productDTO.setCategoryId(product.getCategory().getId());
        return ResponseEntity.ok(productDTO);
    }
}
