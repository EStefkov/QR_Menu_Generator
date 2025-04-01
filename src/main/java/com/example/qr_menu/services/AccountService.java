package com.example.qr_menu.services;

import com.example.qr_menu.dto.AccountDTO;
import com.example.qr_menu.dto.LoginDTO;
import com.example.qr_menu.dto.RestaurantDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.AccountRepository;
import com.example.qr_menu.utils.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public AccountService(AccountRepository accountRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenUtil jwtTokenUtil) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    /**
     * Регистрира нов акаунт, като кодира паролата и записва данните в базата.
     * Връща създадения AccountDTO.
     */
    public AccountDTO registerAccount(AccountDTO accountDTO) {

        // Проверка дали съществува потребител със същото име или email
        if (accountRepository.existsByAccountNameOrMailAddress(
                accountDTO.getAccountName(),
                accountDTO.getMailAddress())) {
            throw new IllegalArgumentException("Username or email is already in use.");
        }

        // Някои полета може да са null - слагаме им стойности по подразбиране
        String firstName = (accountDTO.getFirstName() != null) ? accountDTO.getFirstName() : "Unknown";
        String lastName  = (accountDTO.getLastName()  != null) ? accountDTO.getLastName()  : "Unknown";
        String profile   = (accountDTO.getProfilePicture() != null)
                ? accountDTO.getProfilePicture()
                : "default_profile.png";

        // Създаваме новия акаунт
        Account newAccount = Account.builder()
                .accountName(accountDTO.getAccountName())
                .mailAddress(accountDTO.getMailAddress())
                .number(accountDTO.getNumber())
                .password(passwordEncoder.encode(accountDTO.getPassword()))
                .accountType(accountDTO.getAccountType())
                .firstName(firstName)
                .lastName(lastName)
                .profilePicture(profile)
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .build();

        Account saved = accountRepository.save(newAccount);
        return mapToDTO(saved);
    }

    /**
     * Логин, който проверява потребител/парола и връща JWT токен, ако е валиден.
     */
    public String login(LoginDTO loginDTO) {
        try {
            System.out.println("Attempting login for: " + loginDTO.getAccountName() + " or " + loginDTO.getMailAddress());
            
            Optional<Account> accountOpt = accountRepository.findByAccountNameOrMailAddress(
                    loginDTO.getAccountName(), loginDTO.getMailAddress());

            if (accountOpt.isEmpty()) {
                System.out.println("Account not found");
                throw new IllegalArgumentException("Invalid username or password");
            }

            Account account = accountOpt.get();
            System.out.println("Found account: ID=" + account.getId() + ", Name=" + account.getAccountName());
            
            if (passwordEncoder.matches(loginDTO.getPassword(), account.getPassword())) {
                // Log account details before generating the token
                System.out.println("Password match for account: " + account.getId());
                System.out.println("Account type: " + account.getAccountType());
                System.out.println("Account first name: " + account.getFirstName());
                
                try {
                    // Generate JWT token
                    String token = jwtTokenUtil.generateToken(account);
                    System.out.println("Token generated successfully with length: " + token.length());
                    return token;
                } catch (Exception e) {
                    System.out.println("Error generating token: " + e.getMessage());
                    e.printStackTrace();
                    throw new RuntimeException("Error generating JWT token: " + e.getMessage(), e);
                }
            } else {
                System.out.println("Password does not match");
                throw new IllegalArgumentException("Invalid username or password");
            }
        } catch (Exception e) {
            if (!(e instanceof IllegalArgumentException)) {
                System.out.println("Unexpected error during login: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Login failed due to an unexpected error", e);
            }
            throw e;
        }
    }

    /**
     * Връща всички акаунти с техните ресторанти (join fetch).
     */
    public List<AccountDTO> getAllAccountsWithRestaurants() {
        List<Account> accounts = accountRepository.findAll();
        return accounts.stream()
                .map(account -> AccountDTO.builder()
                        .id(account.getId())
                        .accountName(account.getAccountName())
                        .mailAddress(account.getMailAddress())
                        .firstName(account.getFirstName())
                        .lastName(account.getLastName())
                        .profilePicture(account.getProfilePicture())
                        .number(account.getNumber())
                        .accountType(account.getAccountType())
                        .restaurants(account.getRestorants().stream()
                                .map(restaurant -> RestaurantDTO.builder()
                                        .id(restaurant.getId())
                                        .restorantName(restaurant.getRestorantName())
                                        .address(restaurant.getAddress())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Връща всички акаунти (без ресторанти).
     */
    public List<AccountDTO> getAllAccounts() {
        List<Account> accounts = accountRepository.findAll();
        return accounts.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Пагинация на акаунти.
     */
    public Page<AccountDTO> getPagedAccounts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Account> accountsPage = accountRepository.findAll(pageable);

        // Трансформация към DTO
        return accountsPage.map(this::mapToDTO);
    }

    /**
     * Триене на акаунт по ID.
     */
    public void deleteAccount(Long id) {
        if (accountRepository.existsById(id)) {
            accountRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Account with ID " + id + " does not exist.");
        }
    }

    /**
     * Ъпдейтва акаунт (с JSON), връща обновения AccountDTO.
     */
    public AccountDTO updateAccount(Long id, AccountDTO accountDTO) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));

        // Ако някои полета в DTO не са null, ги обновяваме
        if (accountDTO.getFirstName() != null) account.setFirstName(accountDTO.getFirstName());
        if (accountDTO.getLastName() != null)  account.setLastName(accountDTO.getLastName());
        if (accountDTO.getMailAddress() != null) account.setMailAddress(accountDTO.getMailAddress());
        if (accountDTO.getNumber() != null) account.setNumber(accountDTO.getNumber());
        if (accountDTO.getAccountType() != null) account.setAccountType(accountDTO.getAccountType());

        // Ако имаме нова снимка, я слагаме; иначе не пипаме старата
        if (accountDTO.getProfilePicture() != null) {
            account.setProfilePicture(accountDTO.getProfilePicture());
        }

        account.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        Account updated = accountRepository.save(account);
        return mapToDTO(updated);
    }

    /**
     * Качва профилна снимка (Multipart), записва я в папка "uploads/profilePictures/{userId}/" и ъпдейтва полето profilePicture.
     */
    public void uploadProfilePicture(Long accountId, MultipartFile profilePicture, String loggedInUserEmail) throws IOException {
        // 1. Намираме акаунта, чиято снимка се сменя
        Account accountToUpdate = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));

        // 2. Намираме текущо логнатия потребител по имейл
        Optional<Account> loggedInUserOpt = accountRepository.findByAccountNameOrMailAddress(null, loggedInUserEmail);
        if (loggedInUserOpt.isEmpty()) {
            throw new ResourceNotFoundException("Logged-in user not found.");
        }

        Account loggedInUser = loggedInUserOpt.get();

        // 3. Проверяваме дали логнатият потребител има право да променя снимката
        boolean isAdmin = loggedInUser.getAccountType() == Account.AccountType.ROLE_ADMIN;
        boolean isSameUser = loggedInUser.getId().equals(accountToUpdate.getId());

        if (!isAdmin && !isSameUser) {
            throw new SecurityException("You are not allowed to change this profile picture.");
        }

        // 4. Create base upload directory
        Path baseUploadPath = Paths.get("uploads", "profilePictures");
        if (!Files.exists(baseUploadPath)) {
            Files.createDirectories(baseUploadPath);
        }

        // 5. Create user-specific directory
        Path userUploadPath = baseUploadPath.resolve(accountId.toString());
        if (!Files.exists(userUploadPath)) {
            Files.createDirectories(userUploadPath);
        }

        // 6. Generate unique filename with timestamp and original extension
        String originalFilename = StringUtils.cleanPath(profilePicture.getOriginalFilename());
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = System.currentTimeMillis() + fileExtension;

        // 7. Save the file
        Path filePath = userUploadPath.resolve(newFilename);
        try (InputStream inputStream = profilePicture.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
        }

        // 8. Delete old profile picture if it exists and is not the default
        String oldProfilePicture = accountToUpdate.getProfilePicture();
        if (oldProfilePicture != null && !oldProfilePicture.equals("default_profile.png")) {
            try {
                Path oldFilePath = Paths.get(oldProfilePicture.substring(1)); // Remove leading slash
                Files.deleteIfExists(oldFilePath);
            } catch (IOException e) {
                // Log error but continue with the update
                System.err.println("Failed to delete old profile picture: " + e.getMessage());
            }
        }

        // 9. Update profile picture path in database
        String profilePicturePath = "/uploads/profilePictures/" + accountId + "/" + newFilename;
        accountToUpdate.setProfilePicture(profilePicturePath);
        accountToUpdate.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        // 10. Save to database
        accountRepository.save(accountToUpdate);
    }

    /**
     * Връща AccountDTO по зададен email (ако съществува).
     * Хвърля ResourceNotFoundException, ако няма такъв потребител.
     */
    public AccountDTO getAccountDtoByEmail(String email) {
        // Тук вие вече имате метод findByAccountNameOrMailAddress
        // Може да подадете null за името и да търсите само по email
        Optional<Account> accountOpt = accountRepository.findByAccountNameOrMailAddress(null, email);

        if (accountOpt.isEmpty()) {
            throw new ResourceNotFoundException("No account found for email: " + email);
        }

        Account account = accountOpt.get();
        return mapToDTO(account);
    }

    @Transactional(readOnly = true)
    public Account getAccountById(Long id) {
        return accountRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Account getAccountByMailAddress(String mailAddress) {
        return accountRepository.findByMailAddress(mailAddress)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found with email: " + mailAddress));
    }

    /**
     * Помощен метод за конверсия на Entity -> DTO.
     */
    private AccountDTO mapToDTO(Account entity) {
        return AccountDTO.builder()
                .id(entity.getId())
                .accountName(entity.getAccountName())
                .mailAddress(entity.getMailAddress())
                .firstName(entity.getFirstName())
                .lastName(entity.getLastName())
                .profilePicture(entity.getProfilePicture())
                .number(entity.getNumber())
                .accountType(entity.getAccountType())
                .build();
    }
}
