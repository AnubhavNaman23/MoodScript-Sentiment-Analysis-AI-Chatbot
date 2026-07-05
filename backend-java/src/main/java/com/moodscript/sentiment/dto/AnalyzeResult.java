package com.moodscript.sentiment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/** Flat result returned by the Flask {@code /analyze} endpoint. */
public record AnalyzeResult(
        String label,
        double pos,
        double neg,
        double neu,
        double compound,
        @JsonProperty("primary_emotion") String primaryEmotion,
        @JsonProperty("emotion_scores") Map<String, Double> emotionScores,
        @JsonProperty("model_name") String modelName) {
}
