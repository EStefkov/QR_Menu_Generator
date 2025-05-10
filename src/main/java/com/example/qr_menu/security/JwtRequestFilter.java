package com.example.qr_menu.security;

import com.example.qr_menu.utils.JwtTokenUtil;
import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Allow unauthenticated access to public endpoints
        if (isPublicEndpoint(request)) {
            chain.doFilter(request, response);
            return;
        }

        final String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtTokenUtil.extractUsername(jwt);
            } catch (ExpiredJwtException e) {
                logger.warn("JWT Token has expired: " + e.getMessage());
            } catch (Exception e) {
                logger.error("Error while parsing JWT Token: " + e.getMessage());
                logger.error("JWT Token: " + jwt); // Логнете токена за анализ
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtTokenUtil.validateToken(jwt, userDetails.getUsername())) {
                // Extract and process the account type
                String accountType = jwtTokenUtil.extractClaim(jwt, claims -> claims.get("accountType", String.class));
                if (accountType != null && accountType.startsWith("ROLE_")) {
                    accountType = accountType.substring(5); // Strip "ROLE_" prefix
                }

                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + accountType);
                
                // Debug log
                System.out.println("JWT Authentication - Username: " + username + 
                                  ", AccountType: " + accountType + 
                                  ", Authority: " + authority.getAuthority() + 
                                  ", Request URI: " + request.getRequestURI());

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, Collections.singletonList(authority));
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(request, response);
    }

    /**
     * Determines if the given request is for a public endpoint.
     *
     * @param request The HTTP request.
     * @return True if the endpoint is public, false otherwise.
     */
    private boolean isPublicEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Allow unauthenticated access to GET requests for menus
        if (method.equalsIgnoreCase("GET") && path.startsWith("/api/menus")) {
            return true;
        }

        // Add other public endpoints here if needed

        return false;
    }
}