package com.moodscript.mood.dto;

import java.util.List;
import java.util.Map;

public final class MoodDtos {

    /** One point on the mood timeline (already aggregated per day). */
    public record MoodPoint(String date, double score, String label, long count) {}

    public record MoodSummary(
            String currentMood,
            double currentScore,
            double averageScore,
            long totalLogs,
            Map<String, Long> distribution,
            List<MoodPoint> recent) {}

    private MoodDtos() {}
}
