package com.moodscript.auth;

import com.moodscript.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Issues and validates HS256 JWTs. The signing secret is shared with the
 * Node gateway (via .env JWT_SECRET) so it can verify the same tokens.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expiresMinutes;

    public JwtService(AppProperties props) {
        this.key = Keys.hmacShaKeyFor(props.jwt().secret().getBytes(StandardCharsets.UTF_8));
        this.expiresMinutes = props.jwt().expiresMinutes();
    }

    public String generate(Long userId, String email, String displayName) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("name", displayName)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiresMinutes, ChronoUnit.MINUTES)))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpiresMinutes() {
        return expiresMinutes;
    }
}
