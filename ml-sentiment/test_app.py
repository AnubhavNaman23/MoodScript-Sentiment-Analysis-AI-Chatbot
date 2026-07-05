"""Route tests that stub out the heavy model so no weights are downloaded."""
import app as app_module


def _fake_analyze(text):
    return {
        "label": "positive",
        "pos": 0.9, "neg": 0.05, "neu": 0.05,
        "compound": 0.85,
        "primary_emotion": "joy",
        "emotion_scores": {"joy": 0.9, "neutral": 0.1},
        "model_name": "test-stub",
    }


def test_health():
    client = app_module.app.test_client()
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"


def test_analyze_returns_expected_shape(monkeypatch):
    monkeypatch.setattr(app_module.models, "analyze", _fake_analyze)
    client = app_module.app.test_client()
    resp = client.post("/analyze", json={"text": "I feel wonderful today!"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["label"] == "positive"
    assert data["primary_emotion"] == "joy"
    assert "emotion_scores" in data
    assert -1.0 <= data["compound"] <= 1.0
