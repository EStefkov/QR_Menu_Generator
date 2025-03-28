package com.example.qr_menu.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    // Handle cases where the principal might not be an AccountPrincipal
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        
        if (authentication.getPrincipal() instanceof UserDetails userDetails) {
            // Extract account ID from the UserDetails implementation
            // You may need to modify this based on your actual UserDetails implementation
            try {
                // If using JWT, the account ID might be in the claims
                return Long.parseLong(userDetails.getUsername());
            } catch (NumberFormatException e) {
                // If the username is not the ID, you'll need another way to get the ID
                return null;
            }
        }
        
        return null;
    }
} 