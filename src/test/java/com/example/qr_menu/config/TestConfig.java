package com.example.qr_menu.config;

import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.Allergen;
import com.example.qr_menu.entities.Category;
import com.example.qr_menu.entities.Menu;
import com.example.qr_menu.entities.Product;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.repositories.AccountRepository;
import com.example.qr_menu.repositories.AllergenRepository;
import com.example.qr_menu.repositories.CategoryRepository;
import com.example.qr_menu.repositories.MenuRepository;
import com.example.qr_menu.repositories.ProductRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;

import java.sql.Timestamp;
import java.util.Date;

@TestConfiguration
@TestPropertySource(locations = "classpath:application-test.properties")
public class TestConfig {

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    public Account createTestUser() {
        return Account.builder()
                .accountName("testuser")
                .firstName("Test")
                .lastName("User")
                .mailAddress("test@example.com")
                .password(passwordEncoder.encode("password123"))
                .accountType(Account.AccountType.ROLE_USER)
                .number("1234567890")
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .build();
    }

    public Account createTestAdmin() {
        return Account.builder()
                .accountName("testadmin")
                .firstName("Test")
                .lastName("Admin")
                .mailAddress("admin@example.com")
                .password(passwordEncoder.encode("admin123"))
                .accountType(Account.AccountType.ROLE_ADMIN)
                .number("0987654321")
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .build();
    }

    public Account createTestManager() {
        return Account.builder()
                .accountName("testmanager")
                .firstName("Test")
                .lastName("Manager")
                .mailAddress("manager@example.com")
                .password(passwordEncoder.encode("manager123"))
                .accountType(Account.AccountType.ROLE_MANAGER)
                .number("1122334455")
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .build();
    }

    public Restorant createTestRestaurant(Account owner) {
        return Restorant.builder()
                .restorantName("Test Restaurant")
                .phoneNumber("555-0123")
                .address("123 Test Street, Test City")
                .email("test@restaurant.com")
                .account(owner)
                .build();
    }

    public Menu createTestMenu(Restorant restaurant) {
        return Menu.builder()
                .category("Test Menu")
                .createdAt(new Date())
                .updatedAt(new Date())
                .restorant(restaurant)
                .menuUrl("http://localhost:8080/menu/" + restaurant.getId())
                .menuImage("default_menu.png")
                .textColor("text-white")
                .defaultProductImage("default_product.png")
                .build();
    }

    public Category createTestCategory(Menu menu) {
        return Category.builder()
                .name("Test Category")
                .categoryImage("default_category.png")
                .menu(menu)
                .build();
    }

    public Product createTestProduct(Menu menu, Category category) {
        return Product.builder()
                .productName("Test Product")
                .productPrice(10.99)
                .productInfo("A delicious test product")
                .productImage("default_product.png")
                .menu(menu)
                .category(category)
                .build();
    }

    public Allergen createTestAllergen() {
        return Allergen.builder()
                .allergenName("Nuts")
                .build();
    }
} 