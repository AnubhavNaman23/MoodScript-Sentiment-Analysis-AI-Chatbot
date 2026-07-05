package com.moodscript.embedding;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/** One embedding vector per journal entry, stored as a JSON float array (pgvector-optional). */
@Entity
@Table(name = "entry_embeddings")
@Getter
@Setter
public class EntryEmbedding {

    @Id
    @Column(name = "entry_id")
    private Long entryId;

    @Column(nullable = false, columnDefinition = "text")
    private String embedding;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
