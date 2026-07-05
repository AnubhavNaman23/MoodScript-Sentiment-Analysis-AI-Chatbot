"""MoodScript sentiment/emotion microservice (Flask + Hugging Face transformers)."""
import os

from flask import Flask, request, jsonify
from flask_cors import CORS

import models

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify(status="ok", service="ml-sentiment")


@app.post("/analyze")
def analyze_route():
    data = request.get_json(force=True, silent=True) or {}
    text = data.get("text", "")
    return jsonify(models.analyze(text))


def main():
    port = int(os.environ.get("FLASK_PORT", "8000"))
    print(f"[ml-sentiment] loading transformer models (first run downloads ~500MB)...")
    try:
        models.warmup()
        print("[ml-sentiment] models ready.")
    except Exception as e:  # pragma: no cover - startup diagnostics
        print(f"[ml-sentiment] warmup failed ({e}); models will load on first request.")
    from waitress import serve
    print(f"[ml-sentiment] serving on http://0.0.0.0:{port}")
    serve(app, host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
