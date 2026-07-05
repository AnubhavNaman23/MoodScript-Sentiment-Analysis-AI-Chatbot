package com.moodscript.sentiment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "sentiment_scores")
@Getter
@Setter
public class SentimentScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entry_id", nullable = false, unique = true)
    private Long entryId;

    @Column(nullable = false)
    private String label;

    private double pos;
    private double neg;
    private double neu;
    private double compound;

    @Column(name = "primary_emotion")
    private String primaryEmotion;

    /** JSON object of emotion -> score, stored as text. */
    @Column(name = "emotion_scores", columnDefinition = "text")
    private String emotionScores;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
