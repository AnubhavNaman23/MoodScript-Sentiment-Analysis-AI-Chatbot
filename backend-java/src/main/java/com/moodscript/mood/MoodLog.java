package com.moodscript.mood;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "mood_logs")
@Getter
@Setter
public class MoodLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "entry_id")
    private Long entryId;

    @Column(name = "mood_label", nullable = false)
    private String moodLabel;

    @Column(name = "mood_score", nullable = false)
    private double moodScore;

    @Column(nullable = false)
    private String source = "auto";

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
