package com.example.qr_menu.services;


import com.example.qr_menu.entities.Account;
import com.example.qr_menu.entities.Account.AccountType;
import com.example.qr_menu.repositories.AccountRepository; // Ensure you have this repository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Account createAccount(String accountName, String email, String number, String plainPassword, AccountType accountType) {
        Account account = new Account();
        account.setAccountName(accountName);
        account.setMailAddress(email);
        account.setNumber(number);

        // Hash the password
        String hashedPassword = passwordEncoder.encode(plainPassword);
        account.setPassword(hashedPassword);

        account.setAccountType(accountType);
        return accountRepository.save(account);
    }
}