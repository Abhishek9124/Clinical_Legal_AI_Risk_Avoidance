# How to Run CLARA

## Prerequisites

- **Node.js** 18+ → [https://nodejs.org](https://nodejs.org)
- **Python** 3.9+ → [https://python.org](https://python.org)
- **MongoDB** running locally or a MongoDB Atlas URI → [https://www.mongodb.com](https://www.mongodb.com)
- **Google Gemini API Key** → [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## Step 1 — Install Frontend Dependencies

Open a terminal in the project root folder (`Clara/`):

```bash
npm install
```

---

## Step 2 — Install Backend Dependencies

```bash
cd clara-backend
npm install
cd ..
```

---

## Step 3 — Install Python Dependencies

```bash
cd python-services
pip install -r requirements.txt
cd ..
```

---

## Step 4 — Set Up the Gemini API Key

Open `env.js` in the root folder and paste your key:

```javascript
window.process = {
  env: {
    API_KEY: 'PASTE_YOUR_GEMINI_API_KEY_HERE'
  }
};
```

---

## Step 5 — Set Up Backend Environment

Create a file called `.env` inside the `clara-backend/` folder:

```
PORT=3001
MONGO_URI=mongodb://localhost:27017/clara
JWT_SECRET=any-secret-string-you-choose
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

> If using MongoDB Atlas, replace the `MONGO_URI` with your Atlas connection string.

---

## Step 6 — Start MongoDB

Make sure MongoDB is running. If installed locally:

```bash
mongod
```

Or if using MongoDB Atlas, no action needed — just ensure the URI in `.env` is correct.

---

## Step 7 — Start the Backend Server

Open **Terminal 1**:

```bash
cd clara-backend
npm run dev
```

You should see:
```
Successfully connected to local MongoDB
Server running on port 3001
```

---

## Step 8 — Start the Python Service

Open **Terminal 2**:

```bash
cd python-services
python app.py
```

You should see:
```
CLARA Python Analytics Service running on port 5000
```

> **Windows shortcut:** You can also double-click `python-services/start.bat`.

---

## Step 9 — Start the Frontend

Open **Terminal 3** (in the project root):

```bash
npm run dev
```

You should see:
```
VITE vx.x.x  ready in xxx ms
➜  Local:   http://localhost:3000/
```

---

## Step 10 — Open in Browser

Go to:

```
http://localhost:3000
```

CLARA is now running. Select a demo patient or enter your own transcript and click **Analyze**.

---

## Quick Start (All at Once)

If you want to start the Python service and frontend together:

```bash
npm run start:all
```

> This only starts Python + Frontend. You still need to start the backend separately (Step 7).

---

## Ports Summary

| Service | Port | Command |
|---------|------|---------|
| Frontend | `http://localhost:3000` | `npm run dev` |
| Backend | `http://localhost:3001` | `cd clara-backend && npm run dev` |
| Python | `http://localhost:5000` | `cd python-services && python app.py` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `API Key not configured` | Add your Gemini key to `env.js` |
| `Cannot connect to MongoDB` | Make sure `mongod` is running or Atlas URI is correct |
| `Python service not available` | Run `pip install -r requirements.txt` then `python app.py` |
| `Port already in use` | Kill the process using that port or change the port in config |
| `Module not found` | Run `npm install` in the correct folder |
