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
                // Allow public access to registration and login endpoints
                .requestMatchers("/api/accounts/register", "/api/accounts/login").permitAll()
                // Only allow users with 'ADMIN' role to delete,create or update restaurants
                .requestMatchers(HttpMethod.PUT, "api/restaurants/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH,"api/restaurants/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "api/restaurants/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "api/restaurants/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/menus/**").hasAnyRole("ADMIN")  // Create menu
                .requestMatchers(HttpMethod.PUT, "/api/menus/**").hasRole("ADMIN")              // Update menu
                .requestMatchers(HttpMethod.DELETE, "/api/menus/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,"api/orders/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH,"api/orders/**").hasRole("ADMIN")
                // All other requests need authentication
                .anyRequest().authenticated()
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                ;

        // Add JWT request filter before UsernamePasswordAuthenticationFilter
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
