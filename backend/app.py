from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os
import json
import re
import PyPDF2
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# ✅ NEW GENAI CLIENT (correct way)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text.strip()


def parse_json_response(text):
    clean = re.sub(r"```json|```", "", text).strip()
    return json.loads(clean)


@app.route("/generate-flashcards", methods=["POST"])
def generate_flashcards():
    if "pdf" not in request.files:
        return jsonify({"error": "No PDF file uploaded"}), 400

    pdf_file = request.files["pdf"]
    if not pdf_file.filename.endswith(".pdf"):
        return jsonify({"error": "File must be a PDF"}), 400

    try:
        pdf_text = extract_text_from_pdf(pdf_file)
        if not pdf_text:
            return jsonify({"error": "Could not extract text from PDF"}), 400

        prompt = f"""Analyze the following study notes and generate exactly 10 flashcard question-answer pairs from the key concepts.

Return ONLY a valid JSON array with no preamble, no explanation, no markdown fences.
Format: [{{"q": "question here", "a": "concise answer in 1-2 sentences"}}]

Study Notes:
{pdf_text[:8000]}"""

        # ✅ NEW API CALL
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        cards = parse_json_response(response.text)

        if not isinstance(cards, list) or len(cards) == 0:
            return jsonify({"error": "Failed to generate flashcards"}), 500

        return jsonify({"cards": cards})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generate-revision", methods=["POST"])
def generate_revision():
    data = request.json
    left_swiped = data.get("leftSwiped", [])

    if not left_swiped:
        return jsonify({"error": "No cards to revise"}), 400

    try:
        card_list = "\n".join(
            [f"{i+1}. Q: {c['q']} | A: {c['a']}" for i, c in enumerate(left_swiped)]
        )

        prompt = f"""The student struggled with these flashcard topics:
{card_list}

Generate short revision notes for each topic to help them understand better.
Return ONLY a valid JSON array with no preamble, no markdown fences.
Format: [{{"topic": "short topic title", "notes": "2-3 sentence explanation"}}]
One entry per card in the list above."""

        # ✅ NEW API CALL
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        notes = parse_json_response(response.text)

        return jsonify({"notes": notes})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)