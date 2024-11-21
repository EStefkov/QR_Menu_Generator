package com.example.qr_menu.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true); // Allows credentials like cookies or authorization headers
        config.addAllowedOriginPattern("*"); // Allows all origins. Change to specific domain in production
        config.addAllowedHeader("*"); // Allows all headers
        config.addAllowedMethod("*"); // Allows all HTTP methods
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
