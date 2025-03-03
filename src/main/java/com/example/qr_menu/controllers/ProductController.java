package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.ProductDTO;
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
     * 2) Създава продукт чрез multipart/form-data (локално качване на файл).
     *    Файлът се записва в папка "uploads/", а в базата се пази само пътят ("/uploads/filename").
     *    Ако не качите файл, ще се сложи "default_product.png".
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductDTO> createProductMultipart(
            @RequestParam("productName") String productName,
            @RequestParam("productPrice") Double productPrice,
            @RequestParam("productInfo") String productInfo,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "productImage", required = false) MultipartFile productImage
    ) {
        // Подготвяме DTO
        ProductDTO dto = new ProductDTO();
        dto.setProductName(productName);
        dto.setProductPrice(productPrice);
        dto.setProductInfo(productInfo);
        dto.setCategoryId(categoryId);

        // Ако има качен файл
        if (productImage != null && !productImage.isEmpty()) {
            String savedPath = saveImage(productImage);
            dto.setProductImage(savedPath);
        } else {
            // Няма подаден файл -> дефолтна снимка
            dto.setProductImage("default_product.png");
        }

        ProductDTO createdProduct = productService.createProduct(dto);
        return new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    /**
     * Записва качен файл в папка "uploads/" и връща пътя, който ще се пази в базата.
     */
    private String saveImage(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            // Реално място на диска, където пазите качените файлове:
            Path path = Paths.get("uploads/" + file.getOriginalFilename());
            Files.write(path, bytes);

            // Връщаме относителен път, който после ще показвате като "/uploads/ime-na-fajl.jpg"
            return "/uploads/" + file.getOriginalFilename();
        } catch (IOException e) {
            throw new RuntimeException("Неуспешно качване на снимка", e);
        }
    }

    // Ъпдейт
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id, @RequestBody ProductDTO productDTO) {
        ProductDTO updatedProduct = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(updatedProduct);
    }

    // Триене
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

}
