package com.example.qr_menu.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Allows credentials (e.g., cookies or authorization headers)
        config.setAllowCredentials(true);

        // Replace "*" with specific domains for production
        config.setAllowedOriginPatterns(Arrays.asList(
                "http://192.168.240.140:5173", // Frontend in development
                "http://localhost:5173" // Frontend in production
        ));

        // Allows all headers
        config.addAllowedHeader("*");

        // Allows specific HTTP methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Optionally set maximum age for pre-flight requests
        config.setMaxAge(3600L); // 1 hour

        // Apply the configuration to all endpoints
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
