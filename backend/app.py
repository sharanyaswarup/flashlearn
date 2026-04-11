from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
import os
import json
import re
import PyPDF2
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
import jwt
import datetime
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

mongo_client = MongoClient(os.getenv("MONGODB_URI", "mongodb://localhost:27017/"))
db = mongo_client["flashlearn"]
users_col = db["users"]
sessions_col = db["sessions"]

JWT_SECRET = os.getenv("JWT_SECRET", "flashlearn_secret_change_in_production")


def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text.strip()


def parse_json_response(text):
    try:
        clean = re.sub(r"```json|```", "", text).strip()
        return json.loads(clean)
    except Exception:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            current_user = users_col.find_one({"_id": ObjectId(data["user_id"])})
            if not current_user:
                return jsonify({"error": "User not found"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401
        return f(current_user, *args, **kwargs)
    return decorated


def serialize_session(s):
    created = s.get("created_at", "")
    created_str = created.isoformat() if hasattr(created, "isoformat") else str(created)
    return {
        "id": str(s["_id"]),
        "pdf_name": s.get("pdf_name", ""),
        "complexity": s.get("complexity", 1),
        "complexity_label": s.get("complexity_label", "Easy"),
        "cards": s.get("cards", []),
        "score": s.get("score"),
        "total": s.get("total"),
        "left_swiped_count": s.get("left_swiped_count", 0),
        "completed": s.get("completed", False),
        "created_at": created_str,
    }


# ── AUTH ROUTES ────────────────────────────────────────────────────────────────

@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if users_col.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    user = {"name": name, "email": email, "password": hashed, "created_at": datetime.datetime.utcnow()}
    result = users_col.insert_one(user)
    token = jwt.encode(
        {"user_id": str(result.inserted_id), "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        JWT_SECRET, algorithm="HS256"
    )
    return jsonify({"token": token, "name": name, "email": email}), 201


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    user = users_col.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401
    token = jwt.encode(
        {"user_id": str(user["_id"]), "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        JWT_SECRET, algorithm="HS256"
    )
    return jsonify({"token": token, "name": user["name"], "email": user["email"]}), 200


@app.route("/auth/me", methods=["GET"])
@token_required
def me(current_user):
    joined = current_user.get("created_at", "")
    joined_str = joined.isoformat() if hasattr(joined, "isoformat") else str(joined)
    return jsonify({"name": current_user["name"], "email": current_user["email"], "joined": joined_str})


@app.route("/auth/change-password", methods=["POST"])
@token_required
def change_password(current_user):
    data = request.json
    current_pw = data.get("currentPassword", "")
    new_pw = data.get("newPassword", "")
    if not current_pw or not new_pw:
        return jsonify({"error": "Both current and new password are required"}), 400
    if len(new_pw) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400
    if not bcrypt.checkpw(current_pw.encode("utf-8"), current_user["password"]):
        return jsonify({"error": "Current password is incorrect"}), 401
    hashed = bcrypt.hashpw(new_pw.encode("utf-8"), bcrypt.gensalt())
    users_col.update_one({"_id": current_user["_id"]}, {"$set": {"password": hashed}})
    return jsonify({"success": True})


@app.route("/auth/account", methods=["DELETE"])
@token_required
def delete_account(current_user):
    user_id = str(current_user["_id"])
    sessions_col.delete_many({"user_id": user_id})
    users_col.delete_one({"_id": current_user["_id"]})
    return jsonify({"success": True})


# ── SESSION ROUTES ─────────────────────────────────────────────────────────────

@app.route("/generate-flashcards", methods=["POST"])
@token_required
def generate_flashcards(current_user):
    if "pdf" not in request.files:
        return jsonify({"error": "No PDF file uploaded"}), 400
    pdf_file = request.files["pdf"]
    if not pdf_file.filename.endswith(".pdf"):
        return jsonify({"error": "File must be a PDF"}), 400
    complexity = int(request.form.get("complexity", 1))
    if complexity not in [1, 2, 3]:
        complexity = 1
    complexity_map = {
        1: {"label": "Easy", "instruction": "Generate basic recall questions with straightforward, factual answers. Focus on definitions, key terms, and simple concepts."},
        2: {"label": "Medium", "instruction": "Generate questions requiring understanding and application of concepts. Include questions about how and why things work, relationships between concepts."},
        3: {"label": "Hard", "instruction": "Generate advanced analytical questions requiring deep understanding, critical thinking, and synthesis across multiple concepts."},
    }
    try:
        pdf_text = extract_text_from_pdf(pdf_file)
        if not pdf_text:
            return jsonify({"error": "Could not extract text from PDF"}), 400
        complexity_info = complexity_map[complexity]
        prompt = f"""Analyze the following study notes and generate exactly 10 flashcard question-answer pairs.

Difficulty Level: {complexity_info['label']} (Level {complexity}/3)
Instructions: {complexity_info['instruction']}

Return ONLY a valid JSON array with no preamble, no explanation, no markdown fences.
Format: [{{"q": "question here", "a": "concise answer in 1-2 sentences"}}]

Study Notes:
{pdf_text[:8000]}"""
        response = client.models.generate_content(model="models/gemini-2.5-flash", contents=prompt)
        cards = parse_json_response(response.text)
        if not cards:
            return jsonify({"error": "Failed to parse AI response", "raw": response.text}), 500
        session_doc = {
            "user_id": str(current_user["_id"]),
            "pdf_name": pdf_file.filename,
            "complexity": complexity,
            "complexity_label": complexity_info["label"],
            "cards": cards,
            "score": None,
            "total": len(cards),
            "left_swiped_count": 0,
            "completed": False,
            "created_at": datetime.datetime.utcnow(),
        }
        result = sessions_col.insert_one(session_doc)
        return jsonify({"cards": cards, "session_id": str(result.inserted_id)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/session/<session_id>/complete", methods=["POST"])
@token_required
def complete_session(current_user, session_id):
    data = request.json
    left_swiped = data.get("leftSwiped", [])
    total = data.get("total", 0)
    known_count = total - len(left_swiped)
    score = round((known_count / total) * 100) if total > 0 else 0
    sessions_col.update_one(
        {"_id": ObjectId(session_id), "user_id": str(current_user["_id"])},
        {"$set": {"score": score, "left_swiped_count": len(left_swiped), "completed": True, "completed_at": datetime.datetime.utcnow()}}
    )
    return jsonify({"score": score, "known": known_count, "total": total})


@app.route("/session/<session_id>", methods=["DELETE"])
@token_required
def delete_session(current_user, session_id):
    try:
        result = sessions_col.delete_one({"_id": ObjectId(session_id), "user_id": str(current_user["_id"])})
        if result.deleted_count == 0:
            return jsonify({"error": "Session not found"}), 404
        return jsonify({"success": True})
    except Exception:
        return jsonify({"error": "Invalid session ID"}), 400


@app.route("/generate-revision", methods=["POST"])
@token_required
def generate_revision(current_user):
    data = request.json
    left_swiped = data.get("leftSwiped", [])
    if not left_swiped:
        return jsonify({"error": "No cards to revise"}), 400
    try:
        card_list = "\n".join([f"{i+1}. Q: {c['q']} | A: {c['a']}" for i, c in enumerate(left_swiped)])
        prompt = f"""The student struggled with these flashcard topics:
{card_list}

Generate short revision notes for each topic to help them understand better.
Return ONLY a valid JSON array with no preamble, no markdown fences.
Format: [{{"topic": "short topic title", "notes": "2-3 sentence explanation"}}]
One entry per card in the list above."""
        response = client.models.generate_content(model="models/gemini-2.5-flash", contents=prompt)
        notes = parse_json_response(response.text)
        if not notes:
            return jsonify({"error": "Failed to parse AI response", "raw": response.text}), 500
        return jsonify({"notes": notes})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── PROGRESS ROUTES ────────────────────────────────────────────────────────────

@app.route("/progress", methods=["GET"])
@token_required
def get_progress(current_user):
    sessions = list(sessions_col.find({"user_id": str(current_user["_id"])}, sort=[("created_at", -1)]))
    return jsonify({"sessions": [serialize_session(s) for s in sessions]})


@app.route("/progress/<session_id>", methods=["GET"])
@token_required
def get_session_detail(current_user, session_id):
    try:
        session = sessions_col.find_one({"_id": ObjectId(session_id), "user_id": str(current_user["_id"])})
        if not session:
            return jsonify({"error": "Session not found"}), 404
        return jsonify(serialize_session(session))
    except Exception:
        return jsonify({"error": "Invalid session ID"}), 400


# ── HEALTH ─────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
