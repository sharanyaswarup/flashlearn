# FlashLearn 🎴

**AI-powered flashcard generator from study notes**

Upload your PDF notes → AI generates flashcards → Swipe to learn → Revise only weak topics.

---

## 🚀 Features

* 📄 Upload PDF notes
* 🤖 AI-generated flashcards (Q&A)
* 👉 Swipe-based learning (know / don’t know)
* 🔁 Revision mode (focus on weak areas only)
* ⚡ Fast and interactive learning experience

---

## 🛠 Tech Stack

* **Frontend**: React
* **Backend**: Flask (Python 3.11)
* **AI**: Google Gemini API (`models/gemini-2.5-flash`)
* **PDF Parsing**: PyPDF2

---

## 📁 Project Structure

```
flashlearn/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   └── public/
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Create API key
3. Ensure billing is enabled in Google Cloud
4. Copy the key

---

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment (Python 3.11 recommended)
py -3.11 -m venv venv

# Activate
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Install latest Gemini SDK
pip install google-genai

# Create .env file
copy .env.example .env
```

Edit `.env`:

```
GEMINI_API_KEY=your_api_key_here
```

Run backend:

```bash
python app.py
```

Backend runs at: http://localhost:5000

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: http://localhost:3000

---

## 🧠 How It Works

1. Upload a PDF of your notes
2. AI extracts key concepts and generates flashcards
3. Go through cards:

   * Tap to reveal answer
   * Swipe right → you know it
   * Swipe left → mark for revision
4. After completion:

   * Revision mode unlocks
   * AI generates short notes for weak topics

---

## 🔐 Environment Variables

```
GEMINI_API_KEY=your_api_key
```

> ⚠️ Never commit your `.env` file

---

## 📌 Notes

* Requires Python **3.11+**
* Uses latest Gemini API (google-genai SDK)
* Model used: `models/gemini-2.5-flash`

---

## 🚀 Future Improvements

* User authentication
* Save decks
* Spaced repetition algorithm
* Mobile responsiveness

---

## 👨‍💻 Author

Built as an AI-powered learning tool project.
