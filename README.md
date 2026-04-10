# FlashLearn — Enhanced

AI-powered flashcard generator with authentication, smart revision, and progress tracking.

## ✨ New Features (This Update)

- 🎨 **Complete UI Overhaul** — Soft blue/purple/cream theme matching the original design mockups
- 👆 **Swipe Gestures** — Swipe left/right on cards (touch + click) after answer is revealed
- 🗑️ **Delete Sessions** — Remove past sessions from the dashboard
- 👤 **User Profile** — View profile info and delete your account
- 🔄 **CI/CD Pipeline** — GitHub Actions with automated tests, build, lint, and Docker deploy

## Tech Stack

- **Frontend**: React 18, Nunito + Space Grotesk fonts
- **Backend**: Flask, PyMongo, PyJWT, bcrypt, Google Gemini AI
- **Database**: MongoDB
- **CI/CD**: GitHub Actions + Docker

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/
JWT_SECRET=any_long_random_string_here
```

```bash
python app.py
# Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### 3. Docker (all-in-one)

```bash
cp .env.example .env   # set your keys
docker-compose up --build
# App at http://localhost:3000
```

## CI/CD Pipeline

GitHub Actions workflows in `.github/workflows/`:

| Workflow | Trigger | Jobs |
|---|---|---|
| `ci.yml` | Push to main/develop, PRs | Backend tests → Frontend build → Docker build → Deploy |
| `pr-checks.yml` | Pull Requests | Lint frontend, Lint backend, Bundle size check |

### Setup for Deployment

Add these GitHub repository secrets:
- `DOCKER_USERNAME` — Docker Hub username
- `DOCKER_PASSWORD` — Docker Hub access token
- `GEMINI_API_KEY` — Your Gemini API key
- `JWT_SECRET` — Strong random string for JWT signing

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for JWT tokens |

## Getting a Gemini API Key

Free key at: https://aistudio.google.com/apikey

## MongoDB Options

**Local:** Install MongoDB Community and start `mongod`  
**Cloud (free):** https://mongodb.com/atlas — get a free M0 cluster

