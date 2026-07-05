package com.moodscript.mood;

import com.moodscript.mood.dto.MoodDtos.MoodPoint;
import com.moodscript.mood.dto.MoodDtos.MoodSummary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MoodService {

    private final MoodLogRepository moodLogs;
    private static final ZoneId ZONE = ZoneId.systemDefault();

    public MoodService(MoodLogRepository moodLogs) {
        this.moodLogs = moodLogs;
    }

    @Transactional
    public void deleteForEntry(Long entryId) {
        moodLogs.deleteByEntryId(entryId);
    }

    @Transactional
    public MoodLog log(Long userId, Long entryId, String label, double score, String source) {
        MoodLog m = new MoodLog();
        m.setUserId(userId);
        m.setEntryId(entryId);
        m.setMoodLabel(label);
        m.setMoodScore(score);
        m.setSource(source);
        return moodLogs.save(m);
    }

    @Transactional(readOnly = true)
    public List<MoodPoint> timeline(Long userId) {
        return aggregateByDay(moodLogs.findByUserIdOrderByCreatedAtAsc(userId));
    }

    @Transactional(readOnly = true)
    public MoodSummary summary(Long userId) {
        List<MoodLog> logs = moodLogs.findByUserIdOrderByCreatedAtAsc(userId);
        if (logs.isEmpty()) {
            return new MoodSummary("neutral", 0.5, 0.5, 0, Map.of(), List.of());
        }
        MoodLog latest = logs.get(logs.size() - 1);
        double avg = logs.stream().mapToDouble(MoodLog::getMoodScore).average().orElse(0.5);
        Map<String, Long> distribution = logs.stream()
                .collect(Collectors.groupingBy(MoodLog::getMoodLabel, LinkedHashMap::new, Collectors.counting()));
        List<MoodPoint> daily = aggregateByDay(logs);
        List<MoodPoint> recent = daily.size() > 30 ? daily.subList(daily.size() - 30, daily.size()) : daily;
        return new MoodSummary(
                latest.getMoodLabel(),
                round(latest.getMoodScore()),
                round(avg),
                logs.size(),
                distribution,
                recent);
    }

    /** Groups mood logs by calendar day, averaging score and picking the dominant label. */
    private List<MoodPoint> aggregateByDay(List<MoodLog> logs) {
        Map<LocalDate, List<MoodLog>> byDay = logs.stream()
                .collect(Collectors.groupingBy(l -> l.getCreatedAt().atZone(ZONE).toLocalDate(),
                        TreeMap::new, Collectors.toList()));
        List<MoodPoint> points = new ArrayList<>();
        for (var e : byDay.entrySet()) {
            List<MoodLog> dayLogs = e.getValue();
            double avg = dayLogs.stream().mapToDouble(MoodLog::getMoodScore).average().orElse(0.5);
            String dominant = dayLogs.stream()
                    .collect(Collectors.groupingBy(MoodLog::getMoodLabel, Collectors.counting()))
                    .entrySet().stream().max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey).orElse("neutral");
            points.add(new MoodPoint(e.getKey().toString(), round(avg), dominant, dayLogs.size()));
        }
        return points;
    }

    private double round(double v) {
        return Math.round(v * 1000.0) / 1000.0;
    }
}
