package com.moodscript.auth;

import com.moodscript.auth.dto.AuthDtos.*;
import com.moodscript.common.ApiException;
import com.moodscript.user.User;
import com.moodscript.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("An account with that email already exists.");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(req.password()));
        user.setDisplayName(req.displayName().trim());
        users.save(user);
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        User user = users.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password."));
        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password.");
        }
        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDto me(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Session no longer valid."));
        return new UserDto(user.getId(), user.getEmail(), user.getDisplayName());
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwt.generate(user.getId(), user.getEmail(), user.getDisplayName());
        return new AuthResponse(token, new UserDto(user.getId(), user.getEmail(), user.getDisplayName()));
    }
}
