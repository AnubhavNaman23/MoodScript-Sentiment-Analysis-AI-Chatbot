package com.moodscript.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;
import java.util.List;

public final class ChatDtos {

    public record SessionDto(Long id, String title, Instant createdAt, long messageCount) {}

    public record MessageDto(Long id, String role, String content, Instant createdAt) {}

    public record CreateSessionRequest(String title) {}

    public record AddMessageRequest(
            @NotBlank @Pattern(regexp = "user|assistant") String role,
            @NotBlank String content) {}

    // ── RAG context returned to the Node gateway ──
    public record RelevantEntry(String date, String title, String snippet, String mood) {}

    public record RagContext(
            String displayName,
            String currentMood,
            double averageMood,
            List<String> recentMoods,
            List<RelevantEntry> relevantEntries,
            List<MessageDto> recentMessages) {}

    private ChatDtos() {}
}
