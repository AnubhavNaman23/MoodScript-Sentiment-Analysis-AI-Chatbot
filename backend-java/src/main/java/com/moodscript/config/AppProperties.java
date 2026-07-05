package com.moodscript.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Strongly-typed view of the {@code app.*} section of application.yml.
 * Populated from the shared .env via environment variables.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Flask flask, Ollama ollama, Cors cors) {

    public record Jwt(String secret, long expiresMinutes) {}

    public record Flask(String url) {}

    public record Ollama(String url, String embedModel) {}

    public record Cors(String origins) {}
}
