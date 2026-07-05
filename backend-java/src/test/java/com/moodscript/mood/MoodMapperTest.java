package com.moodscript.mood;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MoodMapperTest {

    @Test
    void mapsJoyToJoyfulWithHighScore() {
        MoodMapper.Mood mood = MoodMapper.fromAnalysis("joy", 0.8);
        assertThat(mood.label()).isEqualTo("joyful");
        assertThat(mood.score()).isEqualTo(0.9);
    }

    @Test
    void mapsSadnessToSad() {
        assertThat(MoodMapper.fromAnalysis("sadness", -0.6).label()).isEqualTo("sad");
    }

    @Test
    void clampsScoreToUnitRange() {
        assertThat(MoodMapper.fromAnalysis("fear", -5).score()).isEqualTo(0.0);
        assertThat(MoodMapper.fromAnalysis("joy", 5).score()).isEqualTo(1.0);
    }

    @Test
    void fallsBackToValenceWhenEmotionUnknown() {
        assertThat(MoodMapper.fromAnalysis(null, 0.5).label()).isEqualTo("positive");
        assertThat(MoodMapper.fromAnalysis(null, -0.5).label()).isEqualTo("low");
        assertThat(MoodMapper.fromAnalysis(null, 0.0).label()).isEqualTo("neutral");
    }
}
