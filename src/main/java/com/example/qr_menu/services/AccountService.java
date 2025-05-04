package com.example.qr_menu.services;

import com.example.qr_menu.dto.AccountDTO;
import com.example.qr_menu.dto.ChangePasswordDTO;
import com.example.qr_menu.dto.LoginDTO;
import com.example.qr_menu.dto.RestaurantDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.ManagerAssignment;
import com.example.qr_menu.entities.Restorant;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.AccountRepository;
import com.example.qr_menu.repositories.RestaurantRepository;
import com.example.qr_menu.repositories.ManagerAssignmentRepository;
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
    private final RestaurantRepository restaurantRepository;
    private final ManagerAssignmentRepository managerAssignmentRepository;

    @Autowired
    public AccountService(AccountRepository accountRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenUtil jwtTokenUtil,
                          RestaurantRepository restaurantRepository,
                          ManagerAssignmentRepository managerAssignmentRepository) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.restaurantRepository = restaurantRepository;
        this.managerAssignmentRepository = managerAssignmentRepository;
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
     * Метод за смяна на паролата на потребител.
     * Проверява дали текущата парола е вярна и обновява с новата парола.
     * 
     * @param accountId ID на потребителя
     * @param passwordDTO DTO с текуща и нова парола
     * @param loggedInUserEmail Email на логнатия потребител (за проверка на правата)
     * @return true ако паролата е сменена успешно
     * @throws IllegalArgumentException ако текущата парола е грешна или потребителят няма права
     */
    @Transactional
    public boolean changePassword(Long accountId, ChangePasswordDTO passwordDTO, String loggedInUserEmail) {
        // 1. Намираме акаунта, чиято парола се сменя
        Account accountToUpdate = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));

        // 2. Намираме текущо логнатия потребител по имейл
        Optional<Account> loggedInUserOpt = accountRepository.findByAccountNameOrMailAddress(null, loggedInUserEmail);
        if (loggedInUserOpt.isEmpty()) {
            throw new ResourceNotFoundException("Logged-in user not found.");
        }

        Account loggedInUser = loggedInUserOpt.get();

        // 3. Проверяваме дали логнатият потребител има право да променя паролата
        boolean isAdmin = loggedInUser.getAccountType() == Account.AccountType.ROLE_ADMIN;
        boolean isSameUser = loggedInUser.getId().equals(accountToUpdate.getId());

        if (!isAdmin && !isSameUser) {
            throw new SecurityException("You are not allowed to change this user's password.");
        }

        // 4. Проверяваме дали текущата парола е вярна
        if (!passwordEncoder.matches(passwordDTO.getCurrentPassword(), accountToUpdate.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        // 5. Проверяваме дали новата парола и потвърждението съвпадат
        if (!passwordDTO.getNewPassword().equals(passwordDTO.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match.");
        }

        // 6. Проверка за минимална дължина на паролата (напр. 6 символа)
        if (passwordDTO.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        // 7. Кодираме и запазваме новата парола
        accountToUpdate.setPassword(passwordEncoder.encode(passwordDTO.getNewPassword()));
        accountToUpdate.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        accountRepository.save(accountToUpdate);

        return true;
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
        if (accountDTO.getAccountType() != null) {
            account.setAccountType(accountDTO.getAccountType());
            // Save which admin performed the role change
            if (accountDTO.getUpdatedBy() != null) {
                account.setUpdatedBy(accountDTO.getUpdatedBy());
            }
        }

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
        return accountRepository.findByAccountNameOrMailAddress(null, mailAddress)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found with email: " + mailAddress));
    }

    /**
     * Updates a user's role. Only ROLE_ADMIN accounts can perform this operation.
     * 
     * @param accountId ID of the account to update
     * @param newRole The new role to assign
     * @param adminEmail Email of the admin performing the operation
     * @return The updated AccountDTO
     * @throws SecurityException if the user is not an admin
     * @throws ResourceNotFoundException if accounts not found
     */
    @Transactional
    public AccountDTO updateUserRole(Long accountId, Account.AccountType newRole, String adminEmail) {
        // Check if admin user exists and has admin privileges
        Account adminAccount = accountRepository.findByAccountNameOrMailAddress(null, adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));
        
        if (adminAccount.getAccountType() != Account.AccountType.ROLE_ADMIN) {
            throw new SecurityException("Only administrators can change user roles");
        }
        
        // Find the target account
        Account targetAccount = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Target account not found with id: " + accountId));
        
        // Update the role
        targetAccount.setAccountType(newRole);
        targetAccount.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        targetAccount.setUpdatedBy(adminAccount.getId());
        
        Account updated = accountRepository.save(targetAccount);
        return mapToDTO(updated);
    }

    /**
     * Updates a user's role to COMANAGER by a MANAGER account.
     * Only ROLE_MANAGER accounts can promote users to COMANAGER.
     * The manager can only update users to ROLE_USER or ROLE_COMANAGER.
     * 
     * @param accountId ID of the account to update
     * @param newRole The new role to assign (must be ROLE_USER or ROLE_COMANAGER)
     * @param managerEmail Email of the manager performing the operation
     * @param restaurantId ID of the restaurant for which the user will be a COMANAGER (required for ROLE_COMANAGER)
     * @return The updated AccountDTO
     * @throws SecurityException if the user doesn't have manager rights
     * @throws ResourceNotFoundException if accounts not found
     * @throws IllegalArgumentException if invalid role assignment is attempted
     */
    @Transactional
    public AccountDTO updateUserRoleByManager(Long accountId, Account.AccountType newRole, String managerEmail, Long restaurantId) {
        // Check if manager user exists and has manager privileges
        Account managerAccount = accountRepository.findByAccountNameOrMailAddress(null, managerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Manager account not found"));
        
        if (managerAccount.getAccountType() != Account.AccountType.ROLE_MANAGER) {
            throw new SecurityException("Only managers can assign COMANAGER roles");
        }
        
        // Find the target account
        Account targetAccount = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Target account not found with id: " + accountId));
        
        // Validate role - managers can only set users to ROLE_USER or ROLE_COMANAGER
        if (newRole != Account.AccountType.ROLE_USER && newRole != Account.AccountType.ROLE_COMANAGER) {
            throw new IllegalArgumentException("Managers can only set accounts to USER or COMANAGER roles");
        }
        
        // For COMANAGER role, we need a restaurant ID and to verify manager has access to it
        if (newRole == Account.AccountType.ROLE_COMANAGER) {
            if (restaurantId == null) {
                throw new IllegalArgumentException("Restaurant ID is required when setting COMANAGER role");
            }
            
            // Check if manager is associated with this restaurant
            boolean canManageRestaurant = managerAccount.managesRestaurant(restaurantId);
            if (!canManageRestaurant) {
                throw new SecurityException("Manager does not have rights to this restaurant");
            }
            
            // If user is already a COMANAGER for other restaurants, keep that status
            // Just add the new restaurant assignment
            if (targetAccount.getAccountType() == Account.AccountType.ROLE_COMANAGER) {
                // We don't need to change the role, just add a new assignment if it doesn't exist
                boolean assignmentExists = managerAssignmentRepository
                    .existsByManagerIdAndRestorantId(targetAccount.getId(), restaurantId);
                
                if (!assignmentExists) {
                    // Create manager assignment for the new restaurant
                    Restorant restaurant = restaurantRepository.findById(restaurantId)
                        .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
                    
                    ManagerAssignment assignment = ManagerAssignment.builder()
                        .manager(targetAccount)
                        .restorant(restaurant)
                        .assignedAt(new Timestamp(System.currentTimeMillis()))
                        .assignedBy(managerAccount.getId())
                        .build();
                    
                    managerAssignmentRepository.save(assignment);
                }
                
                // Since the user is already a COMANAGER, we don't need to update the role
                // Just return the current account
                return mapToDTO(targetAccount);
            } 
            else {
                // User is not a COMANAGER yet, so set the role and create assignment
                targetAccount.setAccountType(Account.AccountType.ROLE_COMANAGER);
                
                // Create manager assignment
                Restorant restaurant = restaurantRepository.findById(restaurantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
                
                ManagerAssignment assignment = ManagerAssignment.builder()
                    .manager(targetAccount)
                    .restorant(restaurant)
                    .assignedAt(new Timestamp(System.currentTimeMillis()))
                    .assignedBy(managerAccount.getId())
                    .build();
                
                managerAssignmentRepository.save(assignment);
            }
        } 
        else if (newRole == Account.AccountType.ROLE_USER && targetAccount.getAccountType() == Account.AccountType.ROLE_COMANAGER) {
            // When changing from COMANAGER to USER, we only remove the association for the restaurants
            // that this manager has rights to
            
            // Get all restaurant assignments for this co-manager
            List<ManagerAssignment> coManagerAssignments = managerAssignmentRepository.findByManagerId(targetAccount.getId());
            
            if (restaurantId == null) {
                // No specific restaurant ID provided, check if manager has rights to any of the co-manager's restaurants
                boolean hasRightsToAny = coManagerAssignments.stream()
                    .anyMatch(assignment -> managerAccount.managesRestaurant(assignment.getRestorant().getId()));
                    
                if (!hasRightsToAny) {
                    throw new SecurityException("You do not have permission to modify this co-manager's role");
                }
                
                // Remove only the assignments that this manager has rights to
                List<ManagerAssignment> assignmentsToRemove = coManagerAssignments.stream()
                    .filter(assignment -> managerAccount.managesRestaurant(assignment.getRestorant().getId()))
                    .toList();
                    
                for (ManagerAssignment assignment : assignmentsToRemove) {
                    managerAssignmentRepository.delete(assignment);
                }
                
                // Check if user still has other co-manager assignments
                List<ManagerAssignment> remainingAssignments = managerAssignmentRepository
                    .findByManagerId(targetAccount.getId());
                    
                // If no more assignments, change role to USER
                if (remainingAssignments.isEmpty()) {
                    targetAccount.setAccountType(Account.AccountType.ROLE_USER);
                } else {
                    // User still has other co-manager assignments, don't change the role
                    // Just return current account
                    return mapToDTO(targetAccount);
                }
            } else {
                // Specific restaurant ID provided
                // Check if manager has rights to this restaurant
                boolean canManageRestaurant = managerAccount.managesRestaurant(restaurantId);
                if (!canManageRestaurant) {
                    throw new SecurityException("Manager does not have rights to this restaurant");
                }
                
                // Check if target account is a co-manager for this specific restaurant
                boolean isCoManagerForThisRestaurant = managerAssignmentRepository
                    .existsByManagerIdAndRestorantId(targetAccount.getId(), restaurantId);
                    
                if (!isCoManagerForThisRestaurant) {
                    throw new IllegalArgumentException("This user is not a co-manager for the specified restaurant");
                }
                
                // Only remove the co-manager assignment for this specific restaurant
                Optional<ManagerAssignment> assignment = managerAssignmentRepository
                    .findByManagerIdAndRestorantId(targetAccount.getId(), restaurantId);
                    
                if (assignment.isPresent()) {
                    managerAssignmentRepository.delete(assignment.get());
                }
                
                // Check if user still has other co-manager assignments
                List<ManagerAssignment> remainingAssignments = managerAssignmentRepository
                    .findByManagerId(targetAccount.getId());
                    
                // If no more assignments, change role to USER
                if (remainingAssignments.isEmpty()) {
                    targetAccount.setAccountType(Account.AccountType.ROLE_USER);
                } else {
                    // User still has other co-manager assignments, don't change the role
                    // Just return current account
                    return mapToDTO(targetAccount);
                }
            }
        }
        
        // Save changes to the account (role changes, etc.)
        targetAccount.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        targetAccount.setUpdatedBy(managerAccount.getId());
        
        Account updated = accountRepository.save(targetAccount);
        return mapToDTO(updated);
    }

    /**
     * Retrieves all accounts with a specific account type
     * 
     * @param accountType The account type to filter by
     * @return List of accounts with the specified type
     */
    @Transactional(readOnly = true)
    public List<Account> getAccountsByType(Account.AccountType accountType) {
        return accountRepository.findByAccountType(accountType);
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
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
