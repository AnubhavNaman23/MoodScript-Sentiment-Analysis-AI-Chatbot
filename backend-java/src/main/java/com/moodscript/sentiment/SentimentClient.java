package com.moodscript.sentiment;

import com.moodscript.sentiment.dto.AnalyzeResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Optional;

/** Calls the Python Flask ML service for transformer-based sentiment + emotion. */
@Component
public class SentimentClient {

    private static final Logger log = LoggerFactory.getLogger(SentimentClient.class);

    private final RestClient flask;

    public SentimentClient(@Qualifier("flaskClient") RestClient flask) {
        this.flask = flask;
    }

    /** Returns analysis, or empty if the ML service is unavailable (caller degrades gracefully). */
    public Optional<AnalyzeResult> analyze(String text) {
        try {
            AnalyzeResult result = flask.post()
                    .uri("/analyze")
                    .body(Map.of("text", text))
                    .retrieve()
                    .body(AnalyzeResult.class);
            return Optional.ofNullable(result);
        } catch (Exception e) {
            log.warn("Sentiment service unavailable: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
