"""
Transformer-based sentiment + emotion analysis.

Two Hugging Face models, loaded lazily and cached in-process:
  - Sentiment: cardiffnlp/twitter-roberta-base-sentiment-latest  (negative/neutral/positive)
  - Emotion:   j-hartmann/emotion-english-distilroberta-base     (7 emotions)

The first call downloads the weights (~500MB) into HF's cache; subsequent runs are offline.
"""
import os
import threading

SENTIMENT_MODEL = os.environ.get("SENTIMENT_MODEL", "cardiffnlp/twitter-roberta-base-sentiment-latest")
EMOTION_MODEL = os.environ.get("EMOTION_MODEL", "j-hartmann/emotion-english-distilroberta-base")

# Keep model cache inside the project so it is easy to find / clear.
os.environ.setdefault("HF_HOME", os.path.join(os.path.dirname(__file__), "models_cache"))

_lock = threading.Lock()
_sentiment = None
_emotion = None


def _load():
    global _sentiment, _emotion
    if _sentiment is not None and _emotion is not None:
        return
    with _lock:
        if _sentiment is None or _emotion is None:
            from transformers import pipeline  # imported lazily to keep startup light
            _sentiment = pipeline("text-classification", model=SENTIMENT_MODEL, top_k=None)
            _emotion = pipeline("text-classification", model=EMOTION_MODEL, top_k=None)


def warmup():
    """Trigger download + load so the first real request is fast."""
    analyze("Warming up the models.")


def _scores(pipe, text):
    """Normalise a pipeline result (which may be nested) into {label_lower: score}."""
    out = pipe(text, truncation=True, max_length=512)
    if out and isinstance(out[0], list):
        out = out[0]
    return {d["label"].lower(): float(d["score"]) for d in out}


def _neutral():
    return {
        "label": "neutral",
        "pos": 0.0, "neg": 0.0, "neu": 1.0,
        "compound": 0.0,
        "primary_emotion": "neutral",
        "emotion_scores": {"neutral": 1.0},
        "model_name": "empty-input",
    }


def analyze(text: str) -> dict:
    text = (text or "").strip()
    if not text:
        return _neutral()

    _load()
    sent = _scores(_sentiment, text)
    emo = _scores(_emotion, text)

    pos = sent.get("positive", 0.0)
    neg = sent.get("negative", 0.0)
    neu = sent.get("neutral", 0.0)
    label = max(sent, key=sent.get) if sent else "neutral"
    compound = round(pos - neg, 4)

    emo_rounded = {k: round(v, 4) for k, v in emo.items()}
    primary = max(emo, key=emo.get) if emo else "neutral"

    return {
        "label": label,
        "pos": round(pos, 4),
        "neg": round(neg, 4),
        "neu": round(neu, 4),
        "compound": compound,
        "primary_emotion": primary,
        "emotion_scores": emo_rounded,
        "model_name": "roberta-sentiment+distilroberta-emotion",
    }
