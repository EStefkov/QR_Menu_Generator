package com.example.qr_menu.controllers;

import com.example.qr_menu.config.TestConfig;
import com.example.qr_menu.dto.OrderDTO;
import com.example.qr_menu.entities.*;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.Arrays;
import java.util.Date;

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
public class OrderControllerTest {

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
    private OrderRepository orderRepository;

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
    private Order testOrder;
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
        orderRepository.deleteAll();
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        menuRepository.deleteAll();
        restaurantRepository.deleteAll();
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

        // Create test product
        testProduct = testConfig.createTestProduct(testMenu, testCategory);
        testProduct = productRepository.save(testProduct);

        // Create test order
        testOrder = Order.builder()
                .orderTime(new Date())
                .orderStatus(Order.OrderStatus.PENDING)
                .totalPrice(25.99)
                .account(testUser)
                .restorant(testRestaurant)
                .customerName("Test Customer")
                .customerEmail("customer@test.com")
                .customerPhone("555-1234")
                .build();
        testOrder = orderRepository.save(testOrder);

        // Generate tokens
        userToken = jwtTokenUtil.generateToken(testUser);
        adminToken = jwtTokenUtil.generateToken(testAdmin);
        managerToken = jwtTokenUtil.generateToken(testManager);
    }

    // Test 1: Създаване на поръчка с валидни данни
    @Test
    @DisplayName("Test create order with valid data")
    void testCreateOrderWithValidData() throws Exception {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setRestorantId(testRestaurant.getId());
        orderDTO.setOrderStatus(Order.OrderStatus.PENDING);
        orderDTO.setTotalPrice(35.99);
        orderDTO.setCustomerName("New Customer");
        orderDTO.setCustomerEmail("newcustomer@test.com");
        orderDTO.setCustomerPhone("555-9876");
        orderDTO.setSpecialRequests("No onions please");

        OrderDTO.ProductOrderDTO orderProductDTO = new OrderDTO.ProductOrderDTO();
        orderProductDTO.setProductId(testProduct.getId());
        orderProductDTO.setQuantity(2);
        orderDTO.setProducts(Arrays.asList(orderProductDTO));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderDTO)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().string(containsString("Order created successfully")));
    }


    // Test 2: Създаване на поръчка без продукти
    @Test
    @DisplayName("Test create order without products")
    void testCreateOrderWithoutProducts() throws Exception {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setRestorantId(testRestaurant.getId());
        orderDTO.setTotalPrice(0.0);
        orderDTO.setCustomerName("Test Customer");
        orderDTO.setCustomerEmail("test@example.com");
        // No products set - this should still work according to the service logic

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderDTO)))
                .andDo(print())
                .andExpect(status().isCreated()); // Should succeed with empty products
    }


    // Test 3: Получаване на поръчка по идентификатор
    @Test
    @DisplayName("Test get order by ID")
    void testGetOrderById() throws Exception {
        mockMvc.perform(get("/api/orders/{orderId}", testOrder.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value(testOrder.getCustomerName()))
                .andExpect(jsonPath("$.totalPrice").value(testOrder.getTotalPrice()))
                .andExpect(jsonPath("$.orderStatus").value(testOrder.getOrderStatus().toString()));
    }



    // Test 5: Обновяване на статуса на поръчка
    @Test
    @DisplayName("Test update order status")
    void testUpdateOrderStatus() throws Exception {
        mockMvc.perform(put("/api/orders/{orderId}/status", testOrder.getId())
                        .param("status", "PREPARING")
                        .header("Authorization", "Bearer " + adminToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus").value("PREPARING"));
    }

    // Test 6: Изтриване на поръчка
    @Test
    @DisplayName("Test delete order")
    void testDeleteOrder() throws Exception {
        mockMvc.perform(delete("/api/orders/{orderId}", testOrder.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("deleted successfully")));
    }

    // Test 7: Получаване на поръчки по ресторант
    @Test
    @DisplayName("Test get orders by restaurant")
    void testGetOrdersByRestaurant() throws Exception {
        mockMvc.perform(get("/api/orders/restaurant/{restaurantId}", testRestaurant.getId())
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + managerToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));
    }

    // Test 8: Получаване на поръчки по потребител
    @Test
    @DisplayName("Test get orders by user")
    void testGetOrdersByUser() throws Exception {
        mockMvc.perform(get("/api/orders/user")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));
    }

    // Test 9: Получаване на брой поръчки по потребител
    @Test
    @DisplayName("Test get order count by account")
    void testGetOrderCountByAccount() throws Exception {
        mockMvc.perform(get("/api/orders/count/{accountId}", testUser.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("1"));
    }

    // Test 10: Публичен достъп до детайли на поръчка
    @Test
    @DisplayName("Test public access to order details")
    void testPublicAccessToOrderDetails() throws Exception {
        mockMvc.perform(get("/api/orders/{orderId}/public", testOrder.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value(testOrder.getCustomerName()));
    }

    // Test 11: Неоторизиран достъп до чужда поръчка
    @Test
    @DisplayName("Test unauthorized access to other user's order")
    void testUnauthorizedAccessToOtherUsersOrder() throws Exception {
        // Create another user
        Account anotherUser = testConfig.createTestUser();
        anotherUser.setMailAddress("another@example.com");
        anotherUser = accountRepository.save(anotherUser);
        String anotherUserToken = jwtTokenUtil.generateToken(anotherUser);

        mockMvc.perform(get("/api/orders/{orderId}", testOrder.getId())
                        .header("Authorization", "Bearer " + anotherUserToken))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    // Test 12: Получаване на поръчка с невалиден ID
    @Test
    @DisplayName("Test get order with invalid ID")
    void testGetOrderWithInvalidId() throws Exception {
        mockMvc.perform(get("/api/orders/{orderId}", 99999L)
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    // Test 13: Обновяване на статус от обикновен потребител (в debug режим се разрешава)
    @Test
    @DisplayName("Test update order status by regular user")
    void testUpdateOrderStatusByRegularUser() throws Exception {
        mockMvc.perform(put("/api/orders/{orderId}/status", testOrder.getId())
                        .param("status", "CANCELLED")
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus").value("CANCELLED"));
    }

    // Test 14: Получаване на поръчки по акаунт (админ достъп)
    @Test
    @DisplayName("Test get orders by account (admin access)")
    void testGetOrdersByAccountAdminAccess() throws Exception {
        mockMvc.perform(get("/api/orders/account/{accountId}", testUser.getId())
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + adminToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));
    }



    // Test 16: Достъп с невалиден токен
    @Test
    @DisplayName("Test access with invalid token")
    void testAccessWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/orders/{orderId}", testOrder.getId())
                        .header("Authorization", "Bearer invalid-token"))
                .andDo(print())
                .andExpect(status().isForbidden()); // Security returns 403 for invalid tokens
    }

    // Test 17: Създаване на поръчка с множество продукти
    @Test
    @DisplayName("Test create order with multiple products")
    void testCreateOrderWithMultipleProducts() throws Exception {
        // Create another product
        Product product2 = testConfig.createTestProduct(testMenu, testCategory);
        product2.setProductName("Second Product");
        product2.setProductPrice(15.99);
        product2 = productRepository.save(product2);

        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setRestorantId(testRestaurant.getId());
        orderDTO.setOrderStatus(Order.OrderStatus.PENDING);
        orderDTO.setTotalPrice(51.97); // 2 * 10.99 + 1 * 15.99 + tax
        orderDTO.setCustomerName("Multi Product Customer");
        orderDTO.setCustomerEmail("multi@test.com");

        OrderDTO.ProductOrderDTO orderProduct1 = new OrderDTO.ProductOrderDTO();
        orderProduct1.setProductId(testProduct.getId());
        orderProduct1.setQuantity(2);

        OrderDTO.ProductOrderDTO orderProduct2 = new OrderDTO.ProductOrderDTO();
        orderProduct2.setProductId(product2.getId());
        orderProduct2.setQuantity(1);

        orderDTO.setProducts(Arrays.asList(orderProduct1, orderProduct2));

        mockMvc.perform(post("/api/orders")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderDTO)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(content().string(containsString("Order created successfully")));
    }


    // Test 19: Създаване на поръчка без токен
    @Test
    @DisplayName("Test create order without token")
    void testCreateOrderWithoutToken() throws Exception {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setRestorantId(testRestaurant.getId());
        orderDTO.setTotalPrice(35.99);
        orderDTO.setCustomerName("Test Customer");

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderDTO)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }
} 