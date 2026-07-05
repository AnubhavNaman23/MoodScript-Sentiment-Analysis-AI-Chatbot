package com.moodscript.embedding;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface EntryEmbeddingRepository extends JpaRepository<EntryEmbedding, Long> {
    List<EntryEmbedding> findByEntryIdIn(Collection<Long> entryIds);
}
