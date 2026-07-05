package com.moodscript.chat;

import com.moodscript.chat.dto.ChatDtos.*;
import com.moodscript.common.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

    private final ChatSessionRepository sessions;
    private final ChatMessageRepository messages;

    public ChatService(ChatSessionRepository sessions, ChatMessageRepository messages) {
        this.sessions = sessions;
        this.messages = messages;
    }

    @Transactional
    public SessionDto createSession(Long userId, String title) {
        ChatSession s = new ChatSession();
        s.setUserId(userId);
        if (title != null && !title.isBlank()) {
            s.setTitle(title.trim());
        }
        sessions.save(s);
        return new SessionDto(s.getId(), s.getTitle(), s.getCreatedAt(), 0);
    }

    @Transactional(readOnly = true)
    public List<SessionDto> listSessions(Long userId) {
        return sessions.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(s -> new SessionDto(s.getId(), s.getTitle(), s.getCreatedAt(),
                        messages.countBySessionId(s.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getMessages(Long userId, Long sessionId) {
        assertOwned(userId, sessionId);
        return messages.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(m -> new MessageDto(m.getId(), m.getRole(), m.getContent(), m.getCreatedAt()))
                .toList();
    }

    @Transactional
    public MessageDto addMessage(Long userId, Long sessionId, String role, String content) {
        ChatSession session = assertOwned(userId, sessionId);
        ChatMessage m = new ChatMessage();
        m.setSessionId(sessionId);
        m.setRole(role);
        m.setContent(content);
        messages.save(m);

        // Give the session a human title from the first user message.
        if ("user".equals(role) && "New conversation".equals(session.getTitle())) {
            String title = content.strip();
            if (title.length() > 48) {
                title = title.substring(0, 48).trim() + "…";
            }
            session.setTitle(title);
            sessions.save(session);
        }
        return new MessageDto(m.getId(), m.getRole(), m.getContent(), m.getCreatedAt());
    }

    @Transactional
    public void deleteSession(Long userId, Long sessionId) {
        assertOwned(userId, sessionId);
        sessions.deleteById(sessionId); // cascades to chat_messages
    }

    private ChatSession assertOwned(Long userId, Long sessionId) {
        return sessions.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> ApiException.notFound("Conversation not found."));
    }
}
