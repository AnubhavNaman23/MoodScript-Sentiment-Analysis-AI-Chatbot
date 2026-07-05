package com.moodscript.stats;

import com.moodscript.entry.JournalEntryRepository;
import com.moodscript.mood.dto.MoodDtos.MoodSummary;
import com.moodscript.mood.MoodService;
import com.moodscript.sentiment.SentimentScore;
import com.moodscript.sentiment.SentimentScoreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatsService {

    public record StatsDto(
            long totalEntries,
            long totalMoodLogs,
            double averageMood,
            String currentMood,
            int writingStreakDays,
            Map<String, Long> emotionDistribution,
            Map<String, Long> sentimentDistribution) {}

    private static final ZoneId ZONE = ZoneId.systemDefault();

    private final JournalEntryRepository entries;
    private final SentimentScoreRepository sentiments;
    private final MoodService moodService;

    public StatsService(JournalEntryRepository entries,
                        SentimentScoreRepository sentiments,
                        MoodService moodService) {
        this.entries = entries;
        this.sentiments = sentiments;
        this.moodService = moodService;
    }

    @Transactional(readOnly = true)
    public StatsDto forUser(Long userId) {
        long total = entries.countByUserId(userId);
        MoodSummary mood = moodService.summary(userId);

        List<Long> entryIds = entries.findIdsByUserId(userId);
        List<SentimentScore> scores = entryIds.isEmpty()
                ? List.of()
                : sentiments.findByEntryIdIn(entryIds);

        Map<String, Long> emotions = scores.stream()
                .map(SentimentScore::getPrimaryEmotion)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(e -> e, LinkedHashMap::new, Collectors.counting()));

        Map<String, Long> sentimentDist = scores.stream()
                .map(SentimentScore::getLabel)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(l -> l, LinkedHashMap::new, Collectors.counting()));

        int streak = writingStreak(entries.findCreatedAtByUserId(userId));

        return new StatsDto(total, mood.totalLogs(), mood.averageScore(),
                mood.currentMood(), streak, emotions, sentimentDist);
    }

    /** Consecutive-day writing streak ending at the most recent entry day. */
    private int writingStreak(List<Instant> createdAts) {
        if (createdAts.isEmpty()) return 0;
        TreeSet<LocalDate> days = createdAts.stream()
                .map(i -> i.atZone(ZONE).toLocalDate())
                .collect(Collectors.toCollection(TreeSet::new));
        LocalDate cursor = days.last();
        int streak = 0;
        while (days.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }
}
