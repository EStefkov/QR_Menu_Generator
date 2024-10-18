package com.example.qr_menu.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()  // Disable CSRF for Postman testing (re-enable in production)
                .authorizeHttpRequests()
                .requestMatchers("/api/accounts/register", "/api/accounts/login").permitAll()  // Allow unauthenticated access to register/login
                .anyRequest().authenticated()  // All other requests need authentication
                .and()
                .httpBasic();  // Basic authentication for testing purposes (you can replace it with JWT or other methods)

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}

