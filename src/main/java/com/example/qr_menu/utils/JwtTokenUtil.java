package com.example.qr_menu.utils;

import com.example.qr_menu.entities.Account;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    // Hard-coded secret for development - never do this in production!
    private static final String SECRET_STRING = "MySuperSecretKeyForJWTGenerationThatIsAtLeast32BytesLongAndMoreForGoodMeasureToMakeSureItWorks";
    
    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Връща полето "subject" от JWT, в което сме записали email-а на потребителя.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Връща имейл адреса от JWT токена (записан като subject).
     * Това е синоним на extractUsername, но с по-ясно име за използване в контекста.
     */
    public String getMailAddressFromToken(String token) {
        return extractUsername(token);
    }

    /**
     * Връща конкретен claim (поле) от токена, ако е валиден.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Парсва токена и връща всички claims от него (subject, expiration, custom claims и т.н.)
     */
    public Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSecretKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            System.out.println("Token has expired: " + e.getMessage());
            throw new IllegalArgumentException("Token has expired", e);
        } catch (MalformedJwtException e) {
            System.out.println("Invalid JWT token: " + e.getMessage());
            throw new IllegalArgumentException("Invalid JWT token", e);
        } catch (Exception e) {
            System.out.println("Error parsing JWT token: " + e.getMessage());
            e.printStackTrace();
            throw new IllegalArgumentException("Error parsing JWT token: " + e.getMessage(), e);
        }
    }

    /**
     * Проверява дали токенът вече е изтекъл (по поле "expiration").
     */
    public Boolean isTokenExpired(String token) {
        try {
            Date expirationDate = extractClaim(token, Claims::getExpiration);
            return expirationDate.before(new Date());
        } catch (Exception e) {
            System.out.println("Error checking token expiration: " + e.getMessage());
            return true; // Consider expired if we can't check
        }
    }

    /**
     * Генерира JWT токен за даден Account.
     * - subject: email
     * - + custom claims: (accountType, accountId, firstName, lastName, profilePicture)
     * - 10 часа валидност
     */
    public String generateToken(Account account) {
        try {
            System.out.println("Generating token for account: " + account.getId());
            
            return Jwts.builder()
                    .setSubject(account.getMailAddress()) // Email as the subject
                    .claim("accountType", account.getAccountType().toString())
                    .claim("accountId", account.getId())
                    .claim("role", account.getAccountType().toString()) // Add role claim for consistency
                    .claim("firstName", account.getFirstName())
                    .claim("lastName", account.getLastName())
                    .claim("profilePicture", account.getProfilePicture())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 10)) // 10 hours
                    .signWith(getSecretKey())
                    .compact();
        } catch (Exception e) {
            System.out.println("Error generating token: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate JWT token: " + e.getMessage(), e);
        }
    }

    /**
     * Валидация:
     * 1) Парсира токена.
     * 2) Проверява дали не е изтекъл.
     * Ако парсването хвърли грешка, или токенът е изтекъл -> false.
     */
    public Boolean validateToken(String token) {
        try {
            // Парсираме, за да проверим подписа и структурата
            getAllClaimsFromToken(token);
            // Ако всичко е ОК до тук, проверяваме и дали не е изтекъл
            return !isTokenExpired(token);
        } catch (Exception e) {
            // При изключение (изтекъл, зле формиран токен) -> невалиден
            System.out.println("Token validation failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Ако искаме да сме сигурни, че този токен принадлежи на конкретен потребител (username = email),
     * може да ползваме този метод. Връща true само ако email от токена съвпада с подадения username
     * и токенът не е изтекъл.
     */
    public Boolean validateToken(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            return (extractedUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            System.out.println("Token validation failed for user " + username + ": " + e.getMessage());
            return false;
        }
    }
}
