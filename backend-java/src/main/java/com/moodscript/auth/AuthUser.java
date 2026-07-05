package com.moodscript.auth;

/** The authenticated principal placed in the SecurityContext by {@code JwtAuthFilter}. */
public record AuthUser(Long id, String email, String displayName) {}
