package com.moodscript.embedding;

import com.moodscript.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Optional;

/** Generates embeddings via Ollama's nomic-embed-text model. */
@Component
public class EmbeddingClient {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingClient.class);

    private final RestClient ollama;
    private final String model;

    public EmbeddingClient(@Qualifier("ollamaClient") RestClient ollama, AppProperties props) {
        this.ollama = ollama;
        this.model = props.ollama().embedModel();
    }

    public String modelName() {
        return model;
    }

    /** Returns the embedding vector, or empty if Ollama is unreachable. */
    public Optional<float[]> embed(String text) {
        try {
            EmbedResponse resp = ollama.post()
                    .uri("/api/embeddings")
                    .body(Map.of("model", model, "prompt", text))
                    .retrieve()
                    .body(EmbedResponse.class);
            if (resp == null || resp.embedding() == null || resp.embedding().length == 0) {
                return Optional.empty();
            }
            double[] d = resp.embedding();
            float[] f = new float[d.length];
            for (int i = 0; i < d.length; i++) {
                f[i] = (float) d[i];
            }
            return Optional.of(f);
        } catch (Exception e) {
            log.warn("Embedding service unavailable: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private record EmbedResponse(double[] embedding) {}
}
