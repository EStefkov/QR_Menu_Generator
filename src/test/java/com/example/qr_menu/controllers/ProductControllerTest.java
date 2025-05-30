package com.example.qr_menu.controllers;

import com.example.qr_menu.config.TestConfig;
import com.example.qr_menu.dto.ProductDTO;
import com.example.qr_menu.entities.*;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.*;
import com.example.qr_menu.utils.JwtTokenUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
@Import(TestConfig.class)
public class ProductControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private TestConfig testConfig;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AllergenRepository allergenRepository;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private Account testUser;
    private Account testAdmin;
    private Account testManager;
    private Restorant testRestaurant;
    private Menu testMenu;
    private Category testCategory;
    private Product testProduct;
    private Allergen testAllergen;
    private String userToken;
    private String adminToken;
    private String managerToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        objectMapper = new ObjectMapper();

        // Clear database
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        menuRepository.deleteAll();
        restaurantRepository.deleteAll();
        allergenRepository.deleteAll();
        accountRepository.deleteAll();

        // Create test accounts
        testUser = testConfig.createTestUser();
        testAdmin = testConfig.createTestAdmin();
        testManager = testConfig.createTestManager();

        testUser = accountRepository.save(testUser);
        testAdmin = accountRepository.save(testAdmin);
        testManager = accountRepository.save(testManager);

        // Create test restaurant
        testRestaurant = testConfig.createTestRestaurant(testManager);
        testRestaurant = restaurantRepository.save(testRestaurant);

        // Create test menu
        testMenu = testConfig.createTestMenu(testRestaurant);
        testMenu = menuRepository.save(testMenu);

        // Create test category
        testCategory = testConfig.createTestCategory(testMenu);
        testCategory = categoryRepository.save(testCategory);

        // Create test allergen
        testAllergen = testConfig.createTestAllergen();
        testAllergen = allergenRepository.save(testAllergen);

        // Create test product
        testProduct = testConfig.createTestProduct(testMenu, testCategory);
        testProduct = productRepository.save(testProduct);

        // Generate tokens
        userToken = jwtTokenUtil.generateToken(testUser);
        adminToken = jwtTokenUtil.generateToken(testAdmin);
        managerToken = jwtTokenUtil.generateToken(testManager);
    }

    @Test
    @DisplayName("Test create product with JSON")
    void testCreateProductWithJson() throws Exception {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setProductName("New Test Product");
        productDTO.setProductPrice(15.99);
        productDTO.setProductInfo("A new delicious test product");
        productDTO.setCategoryId(testCategory.getId());
        productDTO.setAllergenIds(Arrays.asList(testAllergen.getId()));

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productDTO)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productName").value("New Test Product"))
                .andExpect(jsonPath("$.productPrice").value(15.99))
                .andExpect(jsonPath("$.allergens", hasSize(1)));
    }

    @Test
    @DisplayName("Test create product with multipart form data")
    void testCreateProductWithMultipart() throws Exception {
        MockMultipartFile productImage = new MockMultipartFile(
                "productImage",
                "test.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes()
        );

        mockMvc.perform(multipart("/api/products")
                        .file(productImage)
                        .param("productName", "Multipart Product")
                        .param("productPrice", "19.99")
                        .param("productInfo", "Product with image")
                        .param("categoryId", testCategory.getId().toString())
                        .param("allergenIds", testAllergen.getId().toString())
                        .header("Authorization", "Bearer " + managerToken))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productName").value("Multipart Product"))
                .andExpect(jsonPath("$.productPrice").value(19.99));
    }

    @Test
    @DisplayName("Test get products by menu ID")
    void testGetProductsByMenuId() throws Exception {
        mockMvc.perform(get("/api/products/menu/{menuId}", testMenu.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].productName").value(testProduct.getProductName()));
    }

    @Test
    @DisplayName("Test get products by category ID")
    void testGetProductsByCategoryId() throws Exception {
        mockMvc.perform(get("/api/products/category/{categoryId}", testCategory.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].productName").value(testProduct.getProductName()));
    }

    @Test
    @DisplayName("Test get product by ID")
    void testGetProductById() throws Exception {
        mockMvc.perform(get("/api/products/{id}", testProduct.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productName").value(testProduct.getProductName()))
                .andExpect(jsonPath("$.productPrice").value(testProduct.getProductPrice()))
                .andExpect(jsonPath("$.productInfo").value(testProduct.getProductInfo()));
    }

    @Test
    @DisplayName("Test update product allergens")
    void testUpdateProductAllergens() throws Exception {
        ProductDTO allergenUpdateDTO = new ProductDTO();
        allergenUpdateDTO.setAllergenIds(Arrays.asList(testAllergen.getId()));

        mockMvc.perform(put("/api/products/{id}/allergens", testProduct.getId())
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(allergenUpdateDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allergens", hasSize(1)));
    }

    @Test
    @DisplayName("Test delete product")
    void testDeleteProduct() throws Exception {
        mockMvc.perform(delete("/api/products/{id}", testProduct.getId())
                        .header("Authorization", "Bearer " + managerToken))
                .andDo(print())
                .andExpect(status().isNoContent());

        // Verify product is deleted
        mockMvc.perform(get("/api/products/{id}", testProduct.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Test unauthorized access to create product")
    void testUnauthorizedAccessToCreateProduct() throws Exception {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setProductName("Unauthorized Product");
        productDTO.setProductPrice(10.99);
        productDTO.setCategoryId(testCategory.getId());

        mockMvc.perform(post("/api/products")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productDTO)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Test access without token")
    void testAccessWithoutToken() throws Exception {
        mockMvc.perform(get("/api/products/{id}", testProduct.getId()))
                .andDo(print())
                .andExpect(status().isForbidden());
    }



    @Test
    @DisplayName("Test get non-existent product")
    void testGetNonExistentProduct() throws Exception {
        mockMvc.perform(get("/api/products/{id}", 99999L)
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof ResourceNotFoundException))
                .andExpect(result -> assertEquals("Product not found with id: 99999",
                        result.getResolvedException().getMessage()));
    }

    @Test
    @DisplayName("Test update product with invalid ID")
    void testUpdateProductWithInvalidId() throws Exception {
        ProductDTO updateDTO = new ProductDTO();
        updateDTO.setProductName("Updated Product");
        updateDTO.setProductPrice(25.99);

        mockMvc.perform(put("/api/products/{id}/allergens", 99999L)
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
} 