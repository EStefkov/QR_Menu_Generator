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
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication required)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/accounts/register", "/api/accounts/login", "/api/accounts/validate").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        
                        // Static resources - make sure to include all possible paths
                        .requestMatchers("/uploads/**", "/uploads/profilePictures/**", "/uploads/profilePictures/*/**").permitAll()
                        .requestMatchers("/uploads/menuImages/**", "/uploads/menuImages/*/**").permitAll()
                        .requestMatchers("/uploads/defaultProductImages/**", "/uploads/defaultProductImages/*/**").permitAll()
                        .requestMatchers("/uploads/default_product.png").permitAll()
                        // Allow access to all menu uploads directories 
                        .requestMatchers("/uploads/*/**").permitAll()
                        
                        // Public API endpoints
                        .requestMatchers(HttpMethod.GET, "/api/products/menu/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/menus/restaurant/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/menus/{id}/qrcode").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/menus/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/menus/**").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/menus/**").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/menus/{id}/with-images").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/products/category/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/manager-assignments/check").hasAnyRole("MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/menus/{id}/default-product-image").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/menus/{id}/image").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/menus").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/qrcode/generate").permitAll()

                        
                        // Account management endpoints
                        .requestMatchers("/api/accounts/validate").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/accounts/{id}").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/accounts/uploadProfilePicture/**").hasAnyRole("ADMIN", "USER", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/accounts/update/**").hasAnyRole("ADMIN", "USER", "MANAGER")

                        // Favorites endpoints - allow all authenticated users
                        .requestMatchers("/api/favorites/**").authenticated()

                        // Cart endpoints - allow all authenticated users
                        .requestMatchers("/api/cart/**").authenticated()
                        
                        // Order endpoints - allow all authenticated users
                        .requestMatchers("/api/orders/**").authenticated()

                        // Restaurant management endpoints - let the @PreAuthorize annotations handle these
                        .requestMatchers("/api/restaurants/**").authenticated()
                        
                        // Require authentication for all other requests
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

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
