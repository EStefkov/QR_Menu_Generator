package com.example.qr_menu.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path to uploads folder
        String uploadPath = Paths.get("uploads").toAbsolutePath().normalize().toString();
        System.out.println("Configured upload path: " + uploadPath);
        
        // Map /uploads/** URL to the physical uploads directory
        // This will handle all subdirectories at any depth
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
