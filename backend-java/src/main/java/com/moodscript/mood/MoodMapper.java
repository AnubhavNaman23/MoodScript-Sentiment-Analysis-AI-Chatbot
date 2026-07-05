package com.moodscript.mood;

/** Maps transformer output (primary emotion + compound valence) to a MoodScript mood. */
public final class MoodMapper {

    public record Mood(String label, double score) {}

    /**
     * @param primaryEmotion emotion label from the classifier (may be null)
     * @param compound       valence in [-1, 1]
     * @return a mood label + a 0..1 valence score
     */
    public static Mood fromAnalysis(String primaryEmotion, double compound) {
        double score = Math.max(0.0, Math.min(1.0, (compound + 1.0) / 2.0));
        String emotion = primaryEmotion == null ? "" : primaryEmotion.toLowerCase();
        String label = switch (emotion) {
            case "joy" -> "joyful";
            case "sadness" -> "sad";
            case "anger" -> "angry";
            case "fear" -> "anxious";
            case "surprise" -> "surprised";
            case "disgust" -> "disgusted";
            case "neutral" -> "neutral";
            default -> compound > 0.25 ? "positive" : compound < -0.25 ? "low" : "neutral";
        };
        return new Mood(label, score);
    }

    private MoodMapper() {}
}
