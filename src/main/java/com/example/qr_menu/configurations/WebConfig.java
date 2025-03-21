package com.example.qr_menu.configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path to uploads directory
        String uploadPath = Paths.get("uploads")
                .toFile()
                .getAbsolutePath()
                .replace("\\", "/");

        // Add both relative and absolute paths
        registry.addResourceHandler("/uploads/**")
                //  .addResourceLocations("file:uploads/")
                // .addResourceLocations("file:C:/JavaEEApachi/CRUDMavenApp/QR_Menu_Generator/uploads/");
                .addResourceLocations("file:" + uploadPath + "/")
                .setCachePeriod(0); // Disable cache for development
                
        System.out.println("Configured upload path: " + uploadPath); // Debug log
    }
}
