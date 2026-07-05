package com.moodscript.chat;

import com.moodscript.auth.AuthUser;
import com.moodscript.chat.dto.ChatDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/sessions")
    public List<SessionDto> listSessions(@AuthenticationPrincipal AuthUser user) {
        return chatService.listSessions(user.id());
    }

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public SessionDto createSession(@AuthenticationPrincipal AuthUser user,
                                    @RequestBody(required = false) CreateSessionRequest req) {
        String title = req == null ? null : req.title();
        return chatService.createSession(user.id(), title);
    }

    @GetMapping("/sessions/{id}/messages")
    public List<MessageDto> messages(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return chatService.getMessages(user.id(), id);
    }

    /** Persist a single message. Called by the frontend (user turn) and by the gateway (assistant turn). */
    @PostMapping("/sessions/{id}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageDto addMessage(@AuthenticationPrincipal AuthUser user,
                                 @PathVariable Long id,
                                 @Valid @RequestBody AddMessageRequest req) {
        return chatService.addMessage(user.id(), id, req.role(), req.content());
    }

    @DeleteMapping("/sessions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSession(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        chatService.deleteSession(user.id(), id);
    }
}
