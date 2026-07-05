package com.moodscript.entry.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public final class EntryDtos {

    public record EntryRequest(
            @NotBlank @Size(max = 200) String title,
            @NotBlank String body) {}

    public record SentimentDto(
            String label,
            double pos,
            double neg,
            double neu,
            double compound,
            String primaryEmotion,
            Map<String, Double> emotionScores,
            String moodLabel,
            double moodScore) {}

    public record EntryResponse(
            Long id,
            String title,
            String body,
            Instant createdAt,
            Instant updatedAt,
            SentimentDto sentiment) {}

    public record EntryPage(List<EntryResponse> items, long total, int page, int size) {}

    public record SearchHit(EntryResponse entry, double score) {}

    private EntryDtos() {}
}
