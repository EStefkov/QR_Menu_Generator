package com.example.qr_menu.services;

import com.example.qr_menu.dto.AccountDTO;
import com.example.qr_menu.dto.LoginDTO;
import com.example.qr_menu.dto.RestaurantDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.exceptions.ResourceNotFoundException;
import com.example.qr_menu.repositories.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.qr_menu.utils.JwtTokenUtil;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    /**
     * Registers a new account by encoding the password and saving the account to the database.
     *
     * @param accountDTO the DTO containing account registration data
     */
    public void registerAccount(AccountDTO accountDTO) {

        // Check if the accountName or mailAddress is already in use
        boolean accountExists = accountRepository.existsByAccountNameOrMailAddress(
                accountDTO.getAccountName(),
                accountDTO.getMailAddress()
        );

        if (accountExists) {
            throw new IllegalArgumentException("Username or email is already in use.");
        }

        // Set default profile picture if not provided
        String defaultProfilePicture = "https://img.freepik.com/premium-vector/account-icon-user-icon-vector-graphics_292645-552.jpg";
        String profilePicture = accountDTO.getProfilePicture() != null ? accountDTO.getProfilePicture() : defaultProfilePicture;



        Account newAccount = Account.builder()
                .accountName(accountDTO.getAccountName())
                .mailAddress(accountDTO.getMailAddress())
                .number(accountDTO.getNumber())
                .password(passwordEncoder.encode(accountDTO.getPassword()))  // Encode password
                .accountType(accountDTO.getAccountType())
                .firstName(Optional.ofNullable(accountDTO.getFirstName()).orElse("Unknown"))
                .lastName(Optional.ofNullable(accountDTO.getLastName()).orElse("Unknown"))
                .profilePicture(profilePicture)
                .createdAt(new Timestamp(System.currentTimeMillis()))  // Set createdAt timestamp
                .build();

        accountRepository.save(newAccount);
    }


    @Autowired
    public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    public String login(LoginDTO loginDTO) {
        Optional<Account> accountOpt = accountRepository.findByAccountNameOrMailAddress(
                loginDTO.getAccountName(), loginDTO.getMailAddress());

        if (accountOpt.isPresent()) {
            Account account = accountOpt.get();
            if (passwordEncoder.matches(loginDTO.getPassword(), account.getPassword())) {
                // Pass the entire Account object while generating the token
                return jwtTokenUtil.generateToken(account);
            }
        }
        throw new IllegalArgumentException("Invalid username or password");
    }


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
                        .accountType(account.getAccountType()) // Include accountType
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


    public List<AccountDTO> getAllAccounts() {
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
                        .accountType(account.getAccountType()) // Include accountType
                        .build())
                .collect(Collectors.toList());
    }

    public Page<AccountDTO> getPagedAccounts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Account> accountsPage = accountRepository.findAll(pageable);

        // Transform to DTO
        return accountsPage.map(account -> AccountDTO.builder()
                .id(account.getId())
                .accountName(account.getAccountName())
                .mailAddress(account.getMailAddress())
                .firstName(account.getFirstName())
                .lastName(account.getLastName())
                .profilePicture(account.getProfilePicture())
                .number(account.getNumber())
                .accountType(account.getAccountType())
                .build());
    }


    public void deleteAccount(Long id) {
        if (accountRepository.existsById(id)) {
            accountRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Account with ID " + id + " does not exist.");
        }
    }


    public void updateAccount(Long id, AccountDTO accountDTO) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));

        account.setFirstName(accountDTO.getFirstName());
        account.setLastName(accountDTO.getLastName());
        account.setMailAddress(accountDTO.getMailAddress());
        account.setNumber(accountDTO.getNumber());
        account.setAccountType(accountDTO.getAccountType());
        account.setProfilePicture(account.getProfilePicture());
        account.setUpdatedAt(new Timestamp(System.currentTimeMillis())); // Update timestamp

        accountRepository.save(account);
    }




}
