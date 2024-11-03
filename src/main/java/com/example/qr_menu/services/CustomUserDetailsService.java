package com.example.qr_menu.services;

import com.example.qr_menu.entities.Account;
import com.example.qr_menu.repositories.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account account = accountRepository.findByAccountNameOrMailAddress(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with account name or email: " + username));

        return new org.springframework.security.core.userdetails.User(account.getMailAddress(),
                account.getPassword(), new ArrayList<>());
    }
}

