package com.example.qr_menu.configurations;

import com.example.qr_menu.security.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .cors().and()
                .authorizeHttpRequests()
                // Publicly accessible endpoints
                .requestMatchers("/api/accounts/register", "/api/accounts/login").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/menu/**").permitAll() // Allow GET requests for menus
                .requestMatchers(HttpMethod.GET, "/api/menus/restaurant/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/menus/{id}/qrcode").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/menus/**").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/accounts/uploadProfilePicture/**").permitAll()


                // Restricted endpoints for ADMIN role

                .requestMatchers(HttpMethod.PUT, "/api/restaurants/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/restaurants/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "api/restaurants/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/restaurants/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/menus/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/menus/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/menus/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/orders/**").hasRole("ADMIN")

                // All other endpoints require authentication
                .anyRequest().authenticated()
                .and()

                // Stateless session management
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        // Attach the JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
