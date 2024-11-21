package com.example.qr_menu.controllers;

import com.example.qr_menu.dto.AccountDTO;
import com.example.qr_menu.dto.LoginDTO;
import com.example.qr_menu.services.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    @Autowired
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AccountDTO accountDTO) {
        accountService.registerAccount(accountDTO);
        return new ResponseEntity<>("Account successfully created", HttpStatus.CREATED);
    }
    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO loginDTO) {
        String token = accountService.login(loginDTO);
        if (token != null) {
            return new ResponseEntity<>(token, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
    }
}
