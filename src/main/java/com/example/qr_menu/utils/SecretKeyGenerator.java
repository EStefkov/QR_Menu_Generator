package com.example.qr_menu.utils;

import java.security.SecureRandom;
import java.util.Base64;

public class SecretKeyGenerator {

    public static String generateSecretKey(int length) {
        byte[] secretKeyBytes = new byte[length];
        SecureRandom secureRandom = new SecureRandom();
        secureRandom.nextBytes(secretKeyBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(secretKeyBytes);
    }

    public static void main(String[] args) {
        // Generate a 256-bit (32 bytes) secret key for HS256 algorithm
        String secretKey = generateSecretKey(32);
        System.out.println("Generated Secret Key: " + secretKey);
    }
}
