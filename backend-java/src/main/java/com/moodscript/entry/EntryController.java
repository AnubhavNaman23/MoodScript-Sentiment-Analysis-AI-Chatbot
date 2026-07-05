package com.moodscript.entry;

import com.moodscript.auth.AuthUser;
import com.moodscript.entry.dto.EntryDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entries")
public class EntryController {

    private final EntryService entryService;

    public EntryController(EntryService entryService) {
        this.entryService = entryService;
    }

    @GetMapping
    public EntryPage list(@AuthenticationPrincipal AuthUser user,
                          @RequestParam(defaultValue = "0") int page,
                          @RequestParam(defaultValue = "20") int size) {
        return entryService.list(user.id(), page, Math.min(size, 100));
    }

    @GetMapping("/search")
    public List<SearchHit> search(@AuthenticationPrincipal AuthUser user,
                                  @RequestParam("q") String q,
                                  @RequestParam(defaultValue = "10") int topK) {
        return entryService.search(user.id(), q, Math.min(topK, 25));
    }

    @GetMapping("/{id}")
    public EntryResponse get(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return entryService.get(user.id(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EntryResponse create(@AuthenticationPrincipal AuthUser user,
                                @Valid @RequestBody EntryRequest req) {
        return entryService.create(user.id(), req);
    }

    @PutMapping("/{id}")
    public EntryResponse update(@AuthenticationPrincipal AuthUser user,
                                @PathVariable Long id,
                                @Valid @RequestBody EntryRequest req) {
        return entryService.update(user.id(), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        entryService.delete(user.id(), id);
    }
}
