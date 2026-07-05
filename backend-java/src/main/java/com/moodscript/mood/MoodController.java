package com.moodscript.mood;

import com.moodscript.auth.AuthUser;
import com.moodscript.mood.dto.MoodDtos.MoodPoint;
import com.moodscript.mood.dto.MoodDtos.MoodSummary;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/moods")
public class MoodController {

    private final MoodService moodService;

    public MoodController(MoodService moodService) {
        this.moodService = moodService;
    }

    @GetMapping("/timeline")
    public List<MoodPoint> timeline(@AuthenticationPrincipal AuthUser user) {
        return moodService.timeline(user.id());
    }

    @GetMapping("/summary")
    public MoodSummary summary(@AuthenticationPrincipal AuthUser user) {
        return moodService.summary(user.id());
    }
}
