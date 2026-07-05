package com.moodscript.sentiment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SentimentScoreRepository extends JpaRepository<SentimentScore, Long> {
    Optional<SentimentScore> findByEntryId(Long entryId);
    List<SentimentScore> findByEntryIdIn(Collection<Long> entryIds);
    void deleteByEntryId(Long entryId);
}
