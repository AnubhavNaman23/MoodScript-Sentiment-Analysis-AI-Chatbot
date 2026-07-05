package com.moodscript.entry;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moodscript.common.ApiException;
import com.moodscript.embedding.EmbeddingService;
import com.moodscript.entry.dto.EntryDtos.*;
import com.moodscript.mood.MoodMapper;
import com.moodscript.mood.MoodService;
import com.moodscript.sentiment.SentimentClient;
import com.moodscript.sentiment.SentimentScore;
import com.moodscript.sentiment.SentimentScoreRepository;
import com.moodscript.sentiment.dto.AnalyzeResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EntryService {

    private final JournalEntryRepository entries;
    private final SentimentScoreRepository sentiments;
    private final SentimentClient sentimentClient;
    private final MoodService moodService;
    private final EmbeddingService embeddingService;
    private final ObjectMapper mapper;

    public EntryService(JournalEntryRepository entries,
                        SentimentScoreRepository sentiments,
                        SentimentClient sentimentClient,
                        MoodService moodService,
                        EmbeddingService embeddingService,
                        ObjectMapper mapper) {
        this.entries = entries;
        this.sentiments = sentiments;
        this.sentimentClient = sentimentClient;
        this.moodService = moodService;
        this.embeddingService = embeddingService;
        this.mapper = mapper;
    }

    @Transactional
    public EntryResponse create(Long userId, EntryRequest req) {
        JournalEntry e = new JournalEntry();
        e.setUserId(userId);
        e.setTitle(req.title().trim());
        e.setBody(req.body());
        Instant now = Instant.now();
        e.setCreatedAt(now);
        e.setUpdatedAt(now);
        entries.save(e);

        SentimentScore score = analyzeAndStore(e, false);
        embeddingService.storeForEntry(e.getId(), e.getTitle() + "\n" + e.getBody());
        return toResponse(e, score);
    }

    @Transactional
    public EntryResponse update(Long userId, Long id, EntryRequest req) {
        JournalEntry e = entries.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Entry not found."));
        e.setTitle(req.title().trim());
        e.setBody(req.body());
        e.setUpdatedAt(Instant.now());
        entries.save(e);

        SentimentScore score = analyzeAndStore(e, true);
        embeddingService.storeForEntry(e.getId(), e.getTitle() + "\n" + e.getBody());
        return toResponse(e, score);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        JournalEntry e = entries.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Entry not found."));
        entries.delete(e); // DB cascades to sentiment_scores, entry_embeddings, mood_logs
    }

    @Transactional(readOnly = true)
    public EntryResponse get(Long userId, Long id) {
        JournalEntry e = entries.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Entry not found."));
        return toResponse(e, sentiments.findByEntryId(id).orElse(null));
    }

    @Transactional(readOnly = true)
    public EntryPage list(Long userId, int page, int size) {
        Page<JournalEntry> p = entries.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
        Map<Long, SentimentScore> byEntry = sentimentMap(p.getContent());
        List<EntryResponse> items = p.getContent().stream()
                .map(e -> toResponse(e, byEntry.get(e.getId())))
                .toList();
        return new EntryPage(items, p.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public List<SearchHit> search(Long userId, String query, int topK) {
        Optional<float[]> qv = embeddingService.embed(query);
        if (qv.isPresent()) {
            List<Long> ids = entries.findIdsByUserId(userId);
            if (!ids.isEmpty()) {
                LinkedHashMap<Long, Double> ranked = embeddingService.rank(qv.get(), ids, topK);
                if (!ranked.isEmpty()) {
                    Map<Long, JournalEntry> entryMap = entries.findAllById(ranked.keySet()).stream()
                            .collect(Collectors.toMap(JournalEntry::getId, en -> en));
                    Map<Long, SentimentScore> sentMap = sentimentMap(entryMap.values());
                    List<SearchHit> hits = new ArrayList<>();
                    ranked.forEach((eid, scoreVal) -> {
                        JournalEntry e = entryMap.get(eid);
                        if (e != null) {
                            hits.add(new SearchHit(toResponse(e, sentMap.get(eid)), round(scoreVal)));
                        }
                    });
                    return hits;
                }
            }
        }
        // Fallback: keyword search when embeddings are unavailable
        List<JournalEntry> matches = entries.searchByText(userId, query).stream().limit(topK).toList();
        Map<Long, SentimentScore> sentMap = sentimentMap(matches);
        return matches.stream()
                .map(e -> new SearchHit(toResponse(e, sentMap.get(e.getId())), 0.0))
                .toList();
    }

    // ── helpers ──────────────────────────────────────────────

    private SentimentScore analyzeAndStore(JournalEntry e, boolean isUpdate) {
        Optional<AnalyzeResult> res = sentimentClient.analyze(e.getBody());
        SentimentScore score = sentiments.findByEntryId(e.getId()).orElseGet(SentimentScore::new);
        score.setEntryId(e.getId());
        if (res.isPresent()) {
            AnalyzeResult r = res.get();
            score.setLabel(r.label());
            score.setPos(r.pos());
            score.setNeg(r.neg());
            score.setNeu(r.neu());
            score.setCompound(r.compound());
            score.setPrimaryEmotion(r.primaryEmotion());
            score.setEmotionScores(writeJson(r.emotionScores()));
            score.setModelName(r.modelName());
        } else {
            score.setLabel("neutral");
            score.setPos(0);
            score.setNeg(0);
            score.setNeu(1);
            score.setCompound(0);
            score.setPrimaryEmotion("neutral");
            score.setEmotionScores(null);
            score.setModelName("unavailable");
        }
        score.setCreatedAt(Instant.now());
        sentiments.save(score);

        if (isUpdate) {
            moodService.deleteForEntry(e.getId());
        }
        MoodMapper.Mood mood = MoodMapper.fromAnalysis(score.getPrimaryEmotion(), score.getCompound());
        moodService.log(e.getUserId(), e.getId(), mood.label(), mood.score(), "auto");
        return score;
    }

    private Map<Long, SentimentScore> sentimentMap(Collection<JournalEntry> es) {
        if (es.isEmpty()) return Map.of();
        List<Long> ids = es.stream().map(JournalEntry::getId).toList();
        return sentiments.findByEntryIdIn(ids).stream()
                .collect(Collectors.toMap(SentimentScore::getEntryId, s -> s, (a, b) -> a));
    }

    private EntryResponse toResponse(JournalEntry e, SentimentScore s) {
        SentimentDto dto = null;
        if (s != null) {
            MoodMapper.Mood mood = MoodMapper.fromAnalysis(s.getPrimaryEmotion(), s.getCompound());
            dto = new SentimentDto(
                    s.getLabel(), s.getPos(), s.getNeg(), s.getNeu(), s.getCompound(),
                    s.getPrimaryEmotion(), readEmotions(s.getEmotionScores()),
                    mood.label(), mood.score());
        }
        return new EntryResponse(e.getId(), e.getTitle(), e.getBody(), e.getCreatedAt(), e.getUpdatedAt(), dto);
    }

    private String writeJson(Map<String, Double> map) {
        if (map == null) return null;
        try {
            return mapper.writeValueAsString(map);
        } catch (Exception ex) {
            return null;
        }
    }

    private Map<String, Double> readEmotions(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return mapper.readValue(json, new TypeReference<Map<String, Double>>() {});
        } catch (Exception ex) {
            return Map.of();
        }
    }

    private double round(double v) {
        return Math.round(v * 1000.0) / 1000.0;
    }
}
