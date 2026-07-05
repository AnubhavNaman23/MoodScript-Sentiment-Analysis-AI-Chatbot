package com.moodscript.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Request/response payloads for authentication. */
public final class AuthDtos {

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 6, max = 100) String password,
            @NotBlank @Size(max = 120) String displayName) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password) {}

    public record UserDto(Long id, String email, String displayName) {}

    public record AuthResponse(String token, UserDto user) {}

    private AuthDtos() {}
}
