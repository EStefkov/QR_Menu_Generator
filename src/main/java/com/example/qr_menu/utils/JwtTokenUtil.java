package com.example.qr_menu.utils;

import com.example.qr_menu.entities.Account;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    private final SecretKey SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS512);


    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public String extractEmailFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    public Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            throw new IllegalArgumentException("Token has expired", e);
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            throw new IllegalArgumentException("Invalid JWT token", e);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error parsing JWT token", e);
        }
    }


    public Boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    public String generateToken(Account account) {
        return Jwts.builder()
                .setSubject(account.getMailAddress()) // Email as the subject
                .claim("accountType", account.getAccountType().toString())
                .claim("accountId", account.getId())
                .claim("firstName", account.getFirstName())
                .claim("lastName", account.getLastName())
                .claim("profilePicture", account.getProfilePicture())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours validity
                .signWith(SECRET_KEY)
                .compact();
    }




    public Boolean validateToken(String token, String username) {
        final String extractedUsername = extractEmailFromToken(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }
}
