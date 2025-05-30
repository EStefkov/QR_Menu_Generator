package com.example.qr_menu.controllers;

import com.example.qr_menu.config.TestConfig;
import com.example.qr_menu.dto.RestaurantDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.repositories.AccountRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
@Import(TestConfig.class)
public class RestaurantControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private TestConfig testConfig;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private Account testUser;
    private Account testAdmin;
    private Account testManager;
    private Restorant testRestaurant;
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

        // Generate tokens
        userToken = jwtTokenUtil.generateToken(testUser);
        adminToken = jwtTokenUtil.generateToken(testAdmin);
        managerToken = jwtTokenUtil.generateToken(testManager);
    }

    // Test 1: Създаване на ресторант с валидни данни
    @Test
    @DisplayName("Test create restaurant with valid data")
    void testCreateRestaurantWithValidData() throws Exception {
        RestaurantDTO restaurantDTO = new RestaurantDTO();
        restaurantDTO.setRestorantName("New Test Restaurant");
        restaurantDTO.setPhoneNumber("555-9876");
        restaurantDTO.setAddress("456 New Street, New City");
        restaurantDTO.setEmail("newrest@example.com");

        mockMvc.perform(post("/api/restaurants")
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restaurantDTO)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Restaurant created successfully"));
    }


    // Test 3: Получаване на всички ресторанти
    @Test
    @DisplayName("Test get all restaurants")
    void testGetAllRestaurants() throws Exception {
        mockMvc.perform(get("/api/restaurants")
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].restorantName").value(testRestaurant.getRestorantName()));
    }

    // Test 4: Получаване на ресторант по идентификатор
    @Test
    @DisplayName("Test get restaurant by ID")
    void testGetRestaurantById() throws Exception {
        mockMvc.perform(get("/api/restaurants/{id}", testRestaurant.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.restorantName").value(testRestaurant.getRestorantName()))
                .andExpect(jsonPath("$.phoneNumber").value(testRestaurant.getPhoneNumber()))
                .andExpect(jsonPath("$.address").value(testRestaurant.getAddress()))
                .andExpect(jsonPath("$.email").value(testRestaurant.getEmail()));
    }

    // Test 5: Обновяване на ресторант от собственика
    @Test
    @DisplayName("Test update restaurant by owner")
    void testUpdateRestaurantByOwner() throws Exception {
        RestaurantDTO updateDTO = new RestaurantDTO();
        updateDTO.setRestorantName("Updated Restaurant Name");
        updateDTO.setPhoneNumber("555-0000");
        updateDTO.setAddress("999 Updated Street");
        updateDTO.setEmail("updated@restaurant.com");

        mockMvc.perform(put("/api/restaurants/{id}", testRestaurant.getId())
                        .header("Authorization", "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Restaurant updated successfully"));
    }

    // Test 6: Изтриване на ресторант (само админи)
    @Test
    @DisplayName("Test delete restaurant by admin")
    void testDeleteRestaurantByAdmin() throws Exception {
        mockMvc.perform(delete("/api/restaurants/delete/{id}", testRestaurant.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Restaurant deleted successfully"));
    }

    // Test 7: Изтриване на ресторант от неоторизиран потребител
    @Test
    @DisplayName("Test delete restaurant by unauthorized user")
    void testDeleteRestaurantByUnauthorizedUser() throws Exception {
        mockMvc.perform(delete("/api/restaurants/delete/{id}", testRestaurant.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    // Test 8: Получаване на менюто на ресторант
    @Test
    @DisplayName("Test get restaurant menus")
    void testGetRestaurantMenus() throws Exception {
        mockMvc.perform(get("/api/restaurants/{restaurantId}/menus", testRestaurant.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }



    // Test 11: Обновяване на ресторант от друг потребител (неуспешно)
    @Test
    @DisplayName("Test update restaurant by other user (unauthorized)")
    void testUpdateRestaurantByOtherUser() throws Exception {
        RestaurantDTO updateDTO = new RestaurantDTO();
        updateDTO.setRestorantName("Unauthorized Update");
        updateDTO.setPhoneNumber("555-HACK");
        updateDTO.setAddress("Hacker Street");
        updateDTO.setEmail("hack@restaurant.com");

        mockMvc.perform(put("/api/restaurants/{id}", testRestaurant.getId())
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    // Test 12: Създаване на ресторант от обикновен потребител (неуспешно)
    @Test
    @DisplayName("Test create restaurant by regular user (unauthorized)")
    void testCreateRestaurantByRegularUser() throws Exception {
        RestaurantDTO restaurantDTO = new RestaurantDTO();
        restaurantDTO.setRestorantName("Unauthorized Restaurant");
        restaurantDTO.setPhoneNumber("555-1111");
        restaurantDTO.setAddress("Unauthorized Street");
        restaurantDTO.setEmail("unauthorized@restaurant.com");

        mockMvc.perform(post("/api/restaurants")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restaurantDTO)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    // Test 13: Получаване на ресторант с невалиден ID
    @Test
    @DisplayName("Test get restaurant with invalid ID")
    void testGetRestaurantWithInvalidId() throws Exception {
        mockMvc.perform(get("/api/restaurants/{id}", 99999L)
                        .header("Authorization", "Bearer " + userToken))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    // Test 14: Създаване на ресторант от админ
    @Test
    @DisplayName("Test create restaurant by admin")
    void testCreateRestaurantByAdmin() throws Exception {
        RestaurantDTO restaurantDTO = new RestaurantDTO();
        restaurantDTO.setRestorantName("Admin Created Restaurant");
        restaurantDTO.setPhoneNumber("555-ADMIN");
        restaurantDTO.setAddress("Admin Street, Admin City");
        restaurantDTO.setEmail("admin@restaurant.com");

        mockMvc.perform(post("/api/restaurants")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restaurantDTO)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Restaurant created successfully"));
    }

    // Test 15: Обновяване на ресторант от админ
    @Test
    @DisplayName("Test update restaurant by admin")
    void testUpdateRestaurantByAdmin() throws Exception {
        RestaurantDTO updateDTO = new RestaurantDTO();
        updateDTO.setRestorantName("Admin Updated Restaurant");
        updateDTO.setPhoneNumber("555-ADM1");
        updateDTO.setAddress("Updated Admin Street");
        updateDTO.setEmail("adminupdated@restaurant.com");

        mockMvc.perform(put("/api/restaurants/{id}", testRestaurant.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string("Restaurant updated successfully"));
    }

    // Test 16: Достъп без токен
    @Test
    @DisplayName("Test access without token")
    void testAccessWithoutToken() throws Exception {
        mockMvc.perform(get("/api/restaurants"))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    // Test 17: Достъп с невалиден токен
    @Test
    @DisplayName("Test access with invalid token")
    void testAccessWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/restaurants")
                        .header("Authorization", "Bearer invalid-token"))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    // Test 18: Проверка на собственост на ресторант
    @Test
    @DisplayName("Test restaurant ownership validation")
    void testRestaurantOwnershipValidation() throws Exception {
        // Create another manager
        Account anotherManager = testConfig.createTestManager();
        anotherManager.setMailAddress("anothermanager@example.com");
        anotherManager = accountRepository.save(anotherManager);
        String anotherManagerToken = jwtTokenUtil.generateToken(anotherManager);

        // Try to update restaurant owned by different manager
        RestaurantDTO updateDTO = new RestaurantDTO();
        updateDTO.setRestorantName("Unauthorized Update Attempt");

        mockMvc.perform(put("/api/restaurants/{id}", testRestaurant.getId())
                        .header("Authorization", "Bearer " + anotherManagerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }
} 