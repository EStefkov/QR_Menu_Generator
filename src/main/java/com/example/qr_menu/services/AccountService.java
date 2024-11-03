package com.example.qr_menu.services;

import com.example.qr_menu.dto.AccountDTO;
import com.example.qr_menu.dto.LoginDTO;
import com.example.qr_menu.entities.Account;
import com.example.qr_menu.repositories.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
                return jwtTokenUtil.generateToken(
                        account.getMailAddress(),
                        account.getAccountType()
                );
            }
        }
        return null; // Return null or throw an exception if login fails
    }

}
