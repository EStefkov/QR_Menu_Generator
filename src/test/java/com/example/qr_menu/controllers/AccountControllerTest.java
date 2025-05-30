package com.example.qr_menu.controllers;

import com.example.qr_menu.config.TestConfig;
import com.example.qr_menu.dto.AccountDTO;
import com.example.qr_menu.dto.ChangePasswordDTO;
import com.example.qr_menu.dto.LoginDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.repositories.AccountRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import com.example.qr_menu.utils.JwtTokenUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Import(TestConfig.class)
@Transactional

public class AccountControllerTest {

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

        // Clear repositories
        accountRepository.deleteAll();
        restaurantRepository.deleteAll();

        // Create test accounts
        testUser = testConfig.createTestUser();
        testAdmin = testConfig.createTestAdmin();
        testManager = testConfig.createTestManager();

        // Save accounts
        testUser = accountRepository.save(testUser);
        testAdmin = accountRepository.save(testAdmin);
        testManager = accountRepository.save(testManager);

        // Generate JWT tokens
        userToken = jwtTokenUtil.generateToken(testUser);
        adminToken = jwtTokenUtil.generateToken(testAdmin);
        managerToken = jwtTokenUtil.generateToken(testManager);
    }

    @Test
    void testRegisterAccount_Success() throws Exception {
        AccountDTO newAccount = AccountDTO.builder()
                .accountName("Test")
                .firstName("New")
                .lastName("User")
                .mailAddress("newusers@example.com")
                .password("Password123")
                .number("1111111111")
                .accountType(Account.AccountType.ROLE_USER)
                .build();

        mockMvc.perform(post("/api/accounts/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newAccount)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Account successfully created"));
    }

    @Test
    void testRegisterAccount_DuplicateEmail() throws Exception {
        AccountDTO duplicateAccount = AccountDTO.builder()
                .accountName("duplicate")
                .firstName("Duplicate")
                .lastName("User")
                .mailAddress(testUser.getMailAddress()) // Using existing email
                .password("password123")
                .number("2222222222")
                .build();

        mockMvc.perform(post("/api/accounts/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateAccount)))
                .andExpect(status().isConflict());
    }

    @Test
    void testRegisterAccount_InvalidData() throws Exception {
        AccountDTO invalidAccount = AccountDTO.builder()
                .accountName("") // Empty name
                .firstName("Test")
                .lastName("User")
                .mailAddress("invalid-email") // Invalid email format
                .password("123") // Too short password
                .build();

        mockMvc.perform(post("/api/accounts/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidAccount)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void testLogin_Success() throws Exception {
        LoginDTO loginDTO = LoginDTO.builder()
                .mailAddress(testUser.getMailAddress())
                .password("password123")
                .build();

        mockMvc.perform(post("/api/accounts/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string(not(emptyString())));
    }

    @Test
    void testLogin_InvalidCredentials() throws Exception {
        LoginDTO loginDTO = LoginDTO.builder()
                .mailAddress(testUser.getMailAddress())
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/accounts/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid email or password"));
    }

    @Test
    void testLogin_NonExistentUser() throws Exception {
        LoginDTO loginDTO = LoginDTO.builder()
                .mailAddress("nonexistent@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/accounts/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginDTO)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid email or password"));
    }

    @Test
    void testValidateToken_Success() throws Exception {
        mockMvc.perform(get("/api/accounts/validate")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mailAddress", is(testUser.getMailAddress())))
                .andExpect(jsonPath("$.firstName", is(testUser.getFirstName())))
                .andExpect(jsonPath("$.lastName", is(testUser.getLastName())));
    }

    @Test
    void testValidateToken_InvalidToken() throws Exception {
        mockMvc.perform(get("/api/accounts/validate")
                .header("Authorization", "Bearer invalidtoken"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Token validation failed"));
    }

    @Test
    void testValidateToken_MissingToken() throws Exception {
        mockMvc.perform(get("/api/accounts/validate"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetCurrentUser_Success() throws Exception {
        mockMvc.perform(get("/api/accounts/current")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mailAddress", is(testUser.getMailAddress())))
                .andExpect(jsonPath("$.firstName", is(testUser.getFirstName())))
                .andExpect(jsonPath("$.accountType", is(testUser.getAccountType().name())));
    }

    @Test
    void testGetCurrentUser_InvalidToken() throws Exception {
        mockMvc.perform(get("/api/accounts/current")
                .header("Authorization", "Bearer invalidtoken"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Authentication failed")));
    }

    @Test
    void testChangePassword_Success() throws Exception {
        ChangePasswordDTO passwordDTO = ChangePasswordDTO.builder()
                .currentPassword("password123")
                .newPassword("newpassword123")
                .confirmPassword("newpassword123")
                .build();

        mockMvc.perform(post("/api/accounts/{id}/change-password", testUser.getId())
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(passwordDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("Password changed successfully")));
    }

    @Test
    void testChangePassword_WrongCurrentPassword() throws Exception {
        ChangePasswordDTO passwordDTO = ChangePasswordDTO.builder()
                .currentPassword("wrongpassword")
                .newPassword("newpassword123")
                .confirmPassword("newpassword123")
                .build();

        mockMvc.perform(post("/api/accounts/{id}/change-password", testUser.getId())
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(passwordDTO)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("password")));
    }

    @Test
    void testChangePassword_UnauthorizedUser() throws Exception {
        ChangePasswordDTO passwordDTO = ChangePasswordDTO.builder()
                .currentPassword("password123")
                .newPassword("newpassword123")
                .confirmPassword("newpassword123")
                .build();

        // Try to change another user's password
        mockMvc.perform(post("/api/accounts/{id}/change-password", testAdmin.getId())
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(passwordDTO)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("You are not allowed to change this user's password.")));
    }

    @Test
    void testUploadProfilePicture_Success() throws Exception {
        MockMultipartFile profilePicture = new MockMultipartFile(
                "profilePicture",
                "profile.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        mockMvc.perform(multipart("/api/accounts/uploadProfilePicture/{accountId}", testUser.getId())
                .file(profilePicture)
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(content().string("Profile picture uploaded successfully!"));
    }

    @Test
    void testUploadProfilePicture_UnauthorizedUser() throws Exception {
        MockMultipartFile profilePicture = new MockMultipartFile(
                "profilePicture",
                "profile.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        // Try to upload profile picture for another user
        mockMvc.perform(multipart("/api/accounts/uploadProfilePicture/{accountId}", testAdmin.getId())
                .file(profilePicture)
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden())
                .andExpect(content().string(containsString("You are not allowed to change this profile picture.")));
    }

    @Test
    void testUpdateUserRole_AdminSuccess() throws Exception {
        Map<String, String> roleUpdate = Map.of("role", "ROLE_MANAGER");

        mockMvc.perform(put("/api/accounts/{id}/update-role", testUser.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(roleUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", is("User role updated successfully")))
                .andExpect(jsonPath("$.account.accountType", is("ROLE_MANAGER")));
    }

    @Test
    void testUpdateUserRole_NonAdminForbidden() throws Exception {
        Map<String, String> roleUpdate = Map.of("role", "ROLE_ADMIN");

        mockMvc.perform(put("/api/accounts/{id}/update-role", testUser.getId())
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(roleUpdate)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("administrator")));
    }

    @Test
    void testUpdateUserRole_InvalidRole() throws Exception {
        Map<String, String> roleUpdate = Map.of("role", "INVALID_ROLE");

        mockMvc.perform(put("/api/accounts/{id}/update-role", testUser.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(roleUpdate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Invalid role")));
    }



    @Test
    void testGetAllAccounts_Success() throws Exception {
        mockMvc.perform(get("/api/accounts")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(3))))
                .andExpect(jsonPath("$[*].mailAddress", hasItems(
                        testUser.getMailAddress(),
                        testAdmin.getMailAddress(),
                        testManager.getMailAddress()
                )));
    }



    @Test
    void testDeleteAccount_AdminSuccess() throws Exception {
        // Create a new account to delete
        Account accountToDelete = testConfig.createTestUser();
        accountToDelete.setMailAddress("delete@example.com");
        accountToDelete = accountRepository.save(accountToDelete);

        mockMvc.perform(delete("/api/accounts/delete/{id}", accountToDelete.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().string("Account deleted successfully"));
    }

    @Test
    void testUpdateAccount_Success() throws Exception {
        AccountDTO updateDTO = AccountDTO.builder()
                .firstName("Updated")
                .lastName("Name")
                .number("9999999999")
                .build();

        mockMvc.perform(put("/api/accounts/update/{id}", testUser.getId())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Account updated successfully"));
    }

    @Test
    void testUpdateAccount_NotFound() throws Exception {
        AccountDTO updateDTO = AccountDTO.builder()
                .firstName("Updated")
                .lastName("Name")
                .build();

        mockMvc.perform(put("/api/accounts/update/{id}", 99999L)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testLogout_Success() throws Exception {
        mockMvc.perform(post("/api/accounts/logout")
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(content().string("Logged out successfully"));
    }
} 