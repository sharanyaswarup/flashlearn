# FlashLearn 🎴
**Smart AI-powered flashcard curator**

Upload your PDF notes → AI generates flashcards → Swipe to learn → Revise only what you struggle with.

---

## Tech Stack
- **Frontend**: React
- **Backend**: Python Flask
- **AI**: Google Gemini API (`gemini-1.5-flash`)

---

## Project Structure
```
flashlearn/
├── backend/
│   ├── app.py              # Flask API
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadScreen.js
│   │   │   ├── LoadingScreen.js
│   │   │   ├── ModeScreen.js
│   │   │   ├── CardScreen.js
│   │   │   └── RevisionScreen.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .gitignore
└── README.md
```

---

## Setup Instructions

### 1. Get a Gemini API Key
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Set up billing
4. Copy the key
---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
# Open .env and paste your Gemini API key

pip uninstall google-generativeai -y
pip install google-genai

```

Your `backend/.env` should look like:
```
GEMINI_API_KEY=AIzaSy...your_key_here
```

Start the backend:
```bash
python app.py
```
Backend runs at `http://localhost:5000`

---

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the app
npm start
```

Frontend runs at `http://localhost:3000`  
The `"proxy": "http://localhost:5000"` in `package.json` routes API calls automatically.

---

### 4. Using the App

1. Open `http://localhost:3000`
2. Upload a PDF of your notes
3. Wait ~10-20 seconds for AI to generate 10 flashcards
4. **Curated Questions**: Go through all cards
   - Tap card to reveal the answer
   - Swipe **Right** (Yes) if you knew it
   - Swipe **Left** (No) to mark for revision
5. After finishing Deck 1, **Revision Mode** unlocks
6. **Revision**: See AI-generated short notes for only the topics you struggled with

---

## GitHub Setup

```bash
# From the flashlearn/ root folder:
git init
git add .
git commit -m "initial commit - FlashLearn app"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/flashlearn.git
git branch -M main
git push -u origin main
```

> **Important**: Never commit your `.env` file. It's in `.gitignore` already.

---

## Running Both Servers (Quick Reference)

| Terminal | Command | URL |
|----------|---------|-----|
| Terminal 1 | `cd backend && python app.py` | http://localhost:5000 |
| Terminal 2 | `cd frontend && npm start` | http://localhost:3000 |
