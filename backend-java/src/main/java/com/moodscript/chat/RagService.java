package com.moodscript.chat;

import com.moodscript.chat.dto.ChatDtos.*;
import com.moodscript.entry.EntryService;
import com.moodscript.entry.dto.EntryDtos.SearchHit;
import com.moodscript.mood.MoodLogRepository;
import com.moodscript.mood.MoodService;
import com.moodscript.mood.dto.MoodDtos.MoodSummary;
import com.moodscript.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.List;

/**
 * Assembles retrieval-augmented context for Rant AI: the user's current/average mood,
 * a few recent mood labels, the journal entries most relevant to the message, and the
 * recent turns of the current conversation.
 */
@Service
public class RagService {

    private static final ZoneId ZONE = ZoneId.systemDefault();

    private final UserRepository users;
    private final MoodService moodService;
    private final MoodLogRepository moodLogs;
    private final EntryService entryService;
    private final ChatSessionRepository sessions;
    private final ChatMessageRepository messages;

    public RagService(UserRepository users, MoodService moodService, MoodLogRepository moodLogs,
                      EntryService entryService, ChatSessionRepository sessions,
                      ChatMessageRepository messages) {
        this.users = users;
        this.moodService = moodService;
        this.moodLogs = moodLogs;
        this.entryService = entryService;
        this.sessions = sessions;
        this.messages = messages;
    }

    @Transactional(readOnly = true)
    public RagContext build(Long userId, String query, Long sessionId) {
        String name = users.findById(userId).map(u -> u.getDisplayName()).orElse("there");

        MoodSummary summary = moodService.summary(userId);

        List<String> recentMoods = moodLogs.findTop10ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(m -> m.getMoodLabel())
                .limit(6)
                .toList();

        List<RelevantEntry> relevant = List.of();
        if (query != null && !query.isBlank()) {
            List<SearchHit> hits = entryService.search(userId, query, 3);
            relevant = hits.stream().map(h -> {
                var e = h.entry();
                String mood = e.sentiment() != null ? e.sentiment().moodLabel() : "neutral";
                return new RelevantEntry(
                        e.createdAt().atZone(ZONE).toLocalDate().toString(),
                        e.title(),
                        snippet(e.body()),
                        mood);
            }).toList();
        }

        List<MessageDto> recentMessages = List.of();
        if (sessionId != null && sessions.findByIdAndUserId(sessionId, userId).isPresent()) {
            List<ChatMessage> all = messages.findBySessionIdOrderByCreatedAtAsc(sessionId);
            int from = Math.max(0, all.size() - 6);
            recentMessages = all.subList(from, all.size()).stream()
                    .map(m -> new MessageDto(m.getId(), m.getRole(), m.getContent(), m.getCreatedAt()))
                    .toList();
        }

        return new RagContext(name, summary.currentMood(), summary.averageScore(),
                recentMoods, relevant, recentMessages);
    }

    private String snippet(String body) {
        String clean = body.replaceAll("\\s+", " ").trim();
        return clean.length() > 220 ? clean.substring(0, 220).trim() + "…" : clean;
    }
}
