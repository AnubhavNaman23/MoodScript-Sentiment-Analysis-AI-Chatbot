package com.moodscript.mood;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MoodLogRepository extends JpaRepository<MoodLog, Long> {
    List<MoodLog> findByUserIdOrderByCreatedAtAsc(Long userId);
    List<MoodLog> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
    void deleteByEntryId(Long entryId);
    long countByUserId(Long userId);
}
