package com.moodscript.chat;

import com.moodscript.auth.AuthUser;
import com.moodscript.chat.dto.ChatDtos.RagContext;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Consumed by the Node AI gateway (forwarding the user's JWT) to ground Rant AI replies. */
@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @GetMapping("/context")
    public RagContext context(@AuthenticationPrincipal AuthUser user,
                              @RequestParam("query") String query,
                              @RequestParam(value = "sessionId", required = false) Long sessionId) {
        return ragService.build(user.id(), query, sessionId);
    }
}
