package com.edoc.userservice.security;

import com.edoc.userservice.config.JwtProperties;
import com.edoc.userservice.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final ResourceLoader resourceLoader;

    public JwtService(JwtProperties jwtProperties, ResourceLoader resourceLoader) {
        this.jwtProperties = jwtProperties;
        this.resourceLoader = resourceLoader;
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("uid", user.getUserId());
        claims.put("role", user.getRole().name());

        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.expiration());

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(now)
                .expiration(expiry)
            .signWith(getSigningKey(), Jwts.SIG.RS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public long getExpiration() {
        return jwtProperties.expiration();
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getVerificationKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private PrivateKey getSigningKey() {
        try {
            String pem = readPemOrRaw(jwtProperties.privateKey());
            byte[] keyBytes = decodePemContent(pem);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
            return KeyFactory.getInstance("RSA").generatePrivate(spec);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to load JWT private key", ex);
        }
    }

    private PublicKey getVerificationKey() {
        try {
            String pem = readPemOrRaw(jwtProperties.publicKey());
            byte[] keyBytes = decodePemContent(pem);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            return KeyFactory.getInstance("RSA").generatePublic(spec);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to load JWT public key", ex);
        }
    }

    private String readPemOrRaw(String keyOrPath) {
        if (keyOrPath == null) {
            throw new IllegalStateException("JWT key must not be null");
        }
        try {
            if (keyOrPath.startsWith("file:") || keyOrPath.startsWith("classpath:")) {
                Resource resource = resourceLoader.getResource(keyOrPath);
                try (InputStream inputStream = resource.getInputStream()) {
                    return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
                }
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to read JWT key resource: " + keyOrPath, ex);
        }
        // treat as raw PEM content
        return keyOrPath;
    }

    private byte[] decodePemContent(String pem) {
        String normalized = pem
                .replaceAll("-----BEGIN [A-Z ]+-----", "")
                .replaceAll("-----END [A-Z ]+-----", "")
                .replaceAll("\\s", "");
        return Base64.getDecoder().decode(normalized);
    }
}
