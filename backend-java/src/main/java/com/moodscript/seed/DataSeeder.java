package com.moodscript.seed;

import com.moodscript.embedding.EmbeddingService;
import com.moodscript.entry.JournalEntry;
import com.moodscript.entry.JournalEntryRepository;
import com.moodscript.mood.MoodLog;
import com.moodscript.mood.MoodLogRepository;
import com.moodscript.mood.MoodMapper;
import com.moodscript.sentiment.SentimentClient;
import com.moodscript.sentiment.SentimentScore;
import com.moodscript.sentiment.SentimentScoreRepository;
import com.moodscript.sentiment.dto.AnalyzeResult;
import com.moodscript.user.User;
import com.moodscript.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.*;
import java.util.*;

/**
 * Seeds a demo account with 500+ realistic journal entries spread across a year,
 * each with sentiment, an emotion, a mood log (back-dated), and an embedding.
 * Runs only when the app is started with the "--seed" argument, then exits.
 */
@Component
@Order(1)
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEMO_EMAIL = "demo@moodscript.app";
    private static final int TARGET_ENTRIES = 520;

    private final UserRepository users;
    private final JournalEntryRepository entries;
    private final SentimentScoreRepository sentiments;
    private final MoodLogRepository moodLogs;
    private final SentimentClient sentimentClient;
    private final EmbeddingService embeddingService;
    private final PasswordEncoder encoder;

    private final Random rnd = new Random(42);

    public DataSeeder(UserRepository users, JournalEntryRepository entries,
                      SentimentScoreRepository sentiments, MoodLogRepository moodLogs,
                      SentimentClient sentimentClient, EmbeddingService embeddingService,
                      PasswordEncoder encoder) {
        this.users = users;
        this.entries = entries;
        this.sentiments = sentiments;
        this.moodLogs = moodLogs;
        this.sentimentClient = sentimentClient;
        this.embeddingService = embeddingService;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        boolean seed = Arrays.asList(args).contains("--seed");
        if (!seed) {
            return;
        }
        try {
            doSeed();
        } finally {
            // Started only to seed — shut down so the script returns.
            log.info("Seeding finished. Exiting.");
            System.exit(0);
        }
    }

    private void doSeed() {
        User demo = users.findByEmail(DEMO_EMAIL).orElseGet(() -> {
            User u = new User();
            u.setEmail(DEMO_EMAIL);
            u.setPasswordHash(encoder.encode("password123"));
            u.setDisplayName("Anubhav");
            return users.save(u);
        });

        if (entries.countByUserId(demo.getId()) > 0) {
            log.info("Demo user already has entries — skipping seed. (Delete them to re-seed.)");
            return;
        }

        log.info("Seeding {} journal entries for {} ...", TARGET_ENTRIES, DEMO_EMAIL);
        ZoneId zone = ZoneId.systemDefault();
        LocalDate start = LocalDate.now().minusDays(364);

        int created = 0;
        LocalDate day = start;
        while (created < TARGET_ENTRIES) {
            int perDay = rnd.nextInt(3); // 0..2 entries most days
            if (day.equals(LocalDate.now())) perDay = Math.max(perDay, 1);
            for (int i = 0; i < perDay && created < TARGET_ENTRIES; i++) {
                LocalTime t = LocalTime.of(6 + rnd.nextInt(17), rnd.nextInt(60));
                Instant when = day.atTime(t).atZone(zone).toInstant();
                createEntry(demo, when);
                created++;
                if (created % 50 == 0) {
                    log.info("  ... {} / {} entries", created, TARGET_ENTRIES);
                }
            }
            day = day.plusDays(1);
            if (day.isAfter(LocalDate.now())) {
                day = start.plusDays(rnd.nextInt(300)); // wrap to fill remaining
            }
        }
        log.info("Seed complete: {} entries created for demo account.", created);
    }

    private void createEntry(User user, Instant when) {
        int moodIdx = weightedMoodIndex();
        MoodTemplate mt = MOODS[moodIdx];
        String title = pick(mt.titles);
        String body = buildBody(mt);

        JournalEntry e = new JournalEntry();
        e.setUserId(user.getId());
        e.setTitle(title);
        e.setBody(body);
        e.setCreatedAt(when);
        e.setUpdatedAt(when);
        entries.save(e);

        AnalyzeResult r = sentimentClient.analyze(body).orElseGet(() -> synth(mt));
        SentimentScore s = new SentimentScore();
        s.setEntryId(e.getId());
        s.setLabel(r.label());
        s.setPos(r.pos());
        s.setNeg(r.neg());
        s.setNeu(r.neu());
        s.setCompound(r.compound());
        s.setPrimaryEmotion(r.primaryEmotion());
        s.setModelName(r.modelName());
        s.setCreatedAt(when);
        sentiments.save(s);

        MoodMapper.Mood mood = MoodMapper.fromAnalysis(r.primaryEmotion(), r.compound());
        MoodLog m = new MoodLog();
        m.setUserId(user.getId());
        m.setEntryId(e.getId());
        m.setMoodLabel(mood.label());
        m.setMoodScore(mood.score());
        m.setSource("auto");
        m.setCreatedAt(when);
        moodLogs.save(m);

        embeddingService.storeForEntry(e.getId(), title + "\n" + body); // best-effort
    }

    // ── content generation ───────────────────────────────────

    private String buildBody(MoodTemplate mt) {
        StringBuilder sb = new StringBuilder();
        sb.append(pick(mt.openers)).append(' ');
        sb.append(pick(TOPICS)).append(' ');
        sb.append(pick(mt.reflections));
        return sb.toString();
    }

    private String pick(String[] arr) {
        return arr[rnd.nextInt(arr.length)];
    }

    /** Weighted toward neutral/positive but with a realistic spread of lows. */
    private int weightedMoodIndex() {
        int[] weights = {26, 22, 14, 12, 12, 8, 6}; // joyful, calm, neutral, sad, anxious, angry, surprised
        int total = Arrays.stream(weights).sum();
        int r = rnd.nextInt(total);
        int acc = 0;
        for (int i = 0; i < weights.length; i++) {
            acc += weights[i];
            if (r < acc) return i;
        }
        return 2;
    }

    private AnalyzeResult synth(MoodTemplate mt) {
        double jitter = (rnd.nextDouble() - 0.5) * 0.2;
        double compound = Math.max(-1, Math.min(1, mt.valence + jitter));
        double pos, neg, neu;
        if (compound > 0.15) { pos = 0.6 + jitter; neg = 0.1; neu = 1 - pos - neg; }
        else if (compound < -0.15) { neg = 0.6 - jitter; pos = 0.1; neu = 1 - pos - neg; }
        else { neu = 0.6; pos = 0.2; neg = 0.2; }
        String label = compound > 0.15 ? "positive" : compound < -0.15 ? "negative" : "neutral";
        return new AnalyzeResult(label, round(pos), round(neg), round(neu), round(compound),
                mt.emotion, Map.of(mt.emotion, 0.8, "neutral", 0.2), "seed-synth");
    }

    private double round(double v) {
        return Math.round(Math.max(0, v) * 1000.0) / 1000.0;
    }

    // ── templates ────────────────────────────────────────────

    private record MoodTemplate(String emotion, double valence,
                                String[] titles, String[] openers, String[] reflections) {}

    private static final String[] TOPICS = {
            "Work was the main thing on my mind — deadlines, a code review, the usual grind.",
            "Spent time with family today and it shaped how the whole day felt.",
            "Caught up with a friend I hadn't spoken to in a while.",
            "Went for a long walk and let my thoughts wander.",
            "Tried to make progress on a personal project I care about.",
            "The weather really set the tone for everything.",
            "Thought a lot about where I want to be a year from now.",
            "Cooked something new and it was a small win in an ordinary day.",
            "Sleep has been off lately and I can feel it in everything.",
            "Scrolled too long, then finally put the phone down and breathed.",
            "A conversation earlier stuck with me longer than I expected.",
            "Studied for a few hours and my brain feels full."
    };

    private static final MoodTemplate[] MOODS = {
            new MoodTemplate("joy", 0.8,
                    new String[]{"A really good day", "Feeling light", "Small wins", "Grateful today", "This felt like me"},
                    new String[]{"Honestly, today was wonderful and I feel genuinely happy.",
                            "I woke up with this quiet excitement and it stayed all day.",
                            "Something clicked today and I feel so proud of myself."},
                    new String[]{"I want to remember this feeling next time things get hard.",
                            "Days like this remind me it does get better.",
                            "I feel hopeful, and that's not nothing."}),
            new MoodTemplate("neutral", 0.55,
                    new String[]{"Calm and steady", "A soft day", "Just breathing", "Quiet evening", "Settled"},
                    new String[]{"Today was calm, nothing dramatic, and I'm okay with that.",
                            "I feel pretty balanced right now, steady and unhurried.",
                            "A slow, peaceful sort of day that I actually needed."},
                    new String[]{"Peace is underrated. I'll take a boring, gentle day.",
                            "Nothing to fix tonight — just being here is enough.",
                            "I feel grounded, and I want more days like this."}),
            new MoodTemplate("neutral", 0.5,
                    new String[]{"Ordinary day", "Nothing much", "Getting through it", "Same as usual", "Just notes"},
                    new String[]{"Not much happened today, just the regular routine.",
                            "An average day, neither good nor bad, just... a day.",
                            "I don't have strong feelings about today either way."},
                    new String[]{"Some days are just for showing up, and that's fine.",
                            "I'll try to make tomorrow a little more intentional.",
                            "Writing it down anyway so I don't lose the thread."}),
            new MoodTemplate("sadness", 0.22,
                    new String[]{"Heavy today", "A low day", "Tired of it", "Missing something", "Grey"},
                    new String[]{"I've felt down all day and I can't quite shake it.",
                            "There's this weight on my chest and everything feels harder.",
                            "I'm sad and a little lonely, even if I can't say exactly why."},
                    new String[]{"I know this passes, but right now it just hurts.",
                            "I'm trying to be gentle with myself tonight.",
                            "Maybe tomorrow feels lighter. I hope so."}),
            new MoodTemplate("fear", 0.3,
                    new String[]{"Anxious again", "Racing thoughts", "On edge", "Too much at once", "Worried"},
                    new String[]{"My mind won't stop spinning and I feel so anxious.",
                            "There's this knot of worry I can't untangle today.",
                            "I'm nervous about everything coming up and it's overwhelming."},
                    new String[]{"I need to slow down and take one thing at a time.",
                            "Breathing helps a little. I'll keep reminding myself.",
                            "The fear is loud, but it isn't the whole truth."}),
            new MoodTemplate("anger", 0.25,
                    new String[]{"Frustrated", "So done today", "Fed up", "This again", "Irritated"},
                    new String[]{"I'm angry and frustrated and I just needed to vent it out.",
                            "Everything rubbed me the wrong way today and I snapped inside.",
                            "I feel unheard and it's making me resentful."},
                    new String[]{"I don't want to carry this into tomorrow.",
                            "Naming it helps me not act on it. That's something.",
                            "I deserve to feel heard, and I'll figure out how."}),
            new MoodTemplate("surprise", 0.65,
                    new String[]{"Didn't see that coming", "Unexpected", "Whoa", "A twist today", "Surprised"},
                    new String[]{"Today took a turn I really wasn't expecting.",
                            "Something surprising happened and I'm still processing it.",
                            "Life threw a curveball and honestly it woke me up a bit."},
                    new String[]{"Change is strange but maybe this is a good one.",
                            "I'm curious where this goes now.",
                            "Keeping an open mind, even if it's a lot to take in."})
    };
}
