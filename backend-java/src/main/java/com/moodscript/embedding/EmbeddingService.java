package com.moodscript.embedding;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/** Persists entry embeddings and performs cosine-similarity semantic search. */
@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    private final EntryEmbeddingRepository repo;
    private final EmbeddingClient client;
    private final ObjectMapper mapper;

    public EmbeddingService(EntryEmbeddingRepository repo, EmbeddingClient client, ObjectMapper mapper) {
        this.repo = repo;
        this.client = client;
        this.mapper = mapper;
    }

    public Optional<float[]> embed(String text) {
        return client.embed(text);
    }

    @Transactional
    public void storeForEntry(Long entryId, String text) {
        client.embed(text).ifPresent(vec -> store(entryId, vec));
    }

    @Transactional
    public void store(Long entryId, float[] vec) {
        try {
            EntryEmbedding e = repo.findById(entryId).orElseGet(EntryEmbedding::new);
            e.setEntryId(entryId);
            e.setEmbedding(mapper.writeValueAsString(vec));
            e.setModelName(client.modelName());
            e.setCreatedAt(Instant.now());
            repo.save(e);
        } catch (Exception ex) {
            log.warn("Failed to store embedding for entry {}: {}", entryId, ex.getMessage());
        }
    }

    /**
     * Ranks the given candidate entries by cosine similarity to the query vector.
     * @return entryId -> similarity score, sorted descending, limited to {@code topK}
     */
    public LinkedHashMap<Long, Double> rank(float[] query, Collection<Long> candidateEntryIds, int topK) {
        List<EntryEmbedding> embeddings = repo.findByEntryIdIn(candidateEntryIds);
        List<Map.Entry<Long, Double>> scored = new ArrayList<>();
        for (EntryEmbedding e : embeddings) {
            float[] vec = parse(e.getEmbedding());
            if (vec != null && vec.length == query.length) {
                scored.add(Map.entry(e.getEntryId(), cosine(query, vec)));
            }
        }
        scored.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));
        LinkedHashMap<Long, Double> result = new LinkedHashMap<>();
        scored.stream().limit(topK).forEach(en -> result.put(en.getKey(), en.getValue()));
        return result;
    }

    private float[] parse(String json) {
        try {
            return mapper.readValue(json, float[].class);
        } catch (Exception e) {
            return null;
        }
    }

    public static double cosine(float[] a, float[] b) {
        double dot = 0, na = 0, nb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na == 0 || nb == 0) return 0;
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }
}
