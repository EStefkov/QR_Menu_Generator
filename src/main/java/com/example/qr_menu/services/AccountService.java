package com.example.qr_menu.services;

import com.example.qr_menu.dto.AccountDTO;
import com.example.qr_menu.dto.LoginDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.repositories.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Optional;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registers a new account by encoding the password and saving the account to the database.
     *
     * @param accountDTO the DTO containing account registration data
     */
    public void registerAccount(AccountDTO accountDTO) {
        Account newAccount = Account.builder()
                .accountName(accountDTO.getAccountName())
                .mailAddress(accountDTO.getMailAddress())
                .number(accountDTO.getNumber())
                .password(passwordEncoder.encode(accountDTO.getPassword()))  // Encode password
                .accountType(accountDTO.getAccountType())
                .createdAt(new Timestamp(System.currentTimeMillis()))  // Set createdAt timestamp
                .build();

        accountRepository.save(newAccount);
    }

    /**
     * Authenticates the user by comparing the provided password with the stored password.
     *
     * @param loginDTO the DTO containing login credentials
     * @return true if authentication is successful, false otherwise
     */
    public boolean authenticate(LoginDTO loginDTO) {
        Optional<Account> accountOpt = accountRepository.findByMailAddress(loginDTO.getMailAddress());
        if (accountOpt.isPresent()) {
            Account account = accountOpt.get();
            // Compare provided password with the encoded password in the database
            return passwordEncoder.matches(loginDTO.getPassword(), account.getPassword());
        }
        return false;
    }
}
