package com.example.qr_menu.utils;

import com.example.qr_menu.entities.Account;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    // Generate a secure 512-bit key for HS512 algorithm
    private final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    // Method to extract the subject (email) from the JWT token
    public String extractEmailFromToken(String token) {
        return getAllClaimsFromToken(token).getSubject(); // Assuming email is stored as the subject
    }

    // Helper method to get all claims from the JWT token
    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Retrieve email (subject) from JWT token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Retrieve expiration date from JWT token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Helper method to extract claims
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Helper method to extract all claims from the token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Check if the token is expired
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Generate a token for the user
    public String generateToken(String email, Account.AccountType accountType, Long accountId,
                                String firstName, String lastName, String profilePicture) {

        return Jwts.builder()
                .setSubject(email) // Store the email as the subject
                .claim("accountType", accountType.toString()) // Add accountType as a claim
                .claim("accountId", accountId) // Add accountId as a claim
                .claim("firstName", firstName) // Add firstName as a claim
                .claim("lastName", lastName) // Add lastName as a claim
                .claim("profilePicture", profilePicture) // Add profilePicture as a claim
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Token valid for 10 hours
                .signWith(SECRET_KEY) // Use the secure key generated earlier
                .compact();
    }


    // Validate the token
    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
