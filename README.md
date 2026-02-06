# 🩺 CLARA — Clinical Legal AI for Risk Avoidance

**Version:** 2.0.0  
**Academic Year:** 2025–26  
**Department:** Computer Science & Engineering (AI–ML), PCCoE, Pune

CLARA is a full-stack, AI-powered healthcare platform that converts unstructured clinical conversations into structured medical records, provides risk assessments, manages appointments, generates prescriptions, and delivers ML-based analytics — all through a modern web dashboard.

---

## 📑 Table of Contents

- [Features Overview](#-features-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Feature Details](#-feature-details)
  - [1. Transcript Analysis](#1-transcript-analysis)
  - [2. Live Conversation](#2-live-conversation)
  - [3. Patient Records](#3-patient-records)
  - [4. Statistics Dashboard](#4-statistics-dashboard)
  - [5. RAG Knowledge Base](#5-rag-knowledge-base)
  - [6. Appointment System](#6-appointment-system)
  - [7. Doctor Directory](#7-doctor-directory)
  - [8. Prescriptions](#8-prescriptions)
  - [9. ML Analytics (Python)](#9-ml-analytics-python)
  - [10. Impact Dashboard](#10-impact-dashboard)
  - [11. Authentication & Roles](#11-authentication--roles)
  - [12. QR Code & PDF Reports](#12-qr-code--pdf-reports)
  - [13. Agentic AI](#13-agentic-ai)
  - [14. Demo Patients](#14-demo-patients)
- [File-by-File Breakdown](#-file-by-file-breakdown)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [How to Run](#-how-to-run)

---

## ✨ Features Overview

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Transcript Analysis** | Paste a clinical transcript → get structured medical output (entities, ICD-10, FHIR, risk) via Gemini AI |
| 2 | **Live Conversation** | Real-time voice-based doctor-patient interview with automatic transcript generation |
| 3 | **Patient Records** | Save, search, filter, export, and manage past analysis records (MongoDB) |
| 4 | **Statistics Dashboard** | Charts for disease frequency, risk distribution, medication trends, weekly activity |
| 5 | **RAG Knowledge Base** | Searchable medical knowledge base with drug interactions, disease-symptom mapping, ICD-10 codes |
| 6 | **Appointments** | Book, reschedule, cancel appointments; check doctor availability and time slots |
| 7 | **Doctor Directory** | Browse, search, and filter doctors by specialization; view profiles and reviews |
| 8 | **Prescriptions** | Doctors create digital prescriptions with diagnosis, medications, advice; patients view and download PDF |
| 9 | **ML Analytics** | Python-powered risk prediction, NLP transcript analysis, outcome predictions, trend charts |
| 10 | **Impact Dashboard** | Before/after comparisons, impact scores, clinical metric calculators (NNT, Odds Ratio, Sensitivity/Specificity) |
| 11 | **Authentication** | JWT-based login/register with role-based access (patient, doctor, admin) |
| 12 | **QR & PDF** | Generate QR codes for records, download PDF clinical reports, email reports |
| 13 | **Agentic AI** | Multi-step reasoning engine that plans, executes, and traces AI tasks transparently |
| 14 | **Demo Patients** | Pre-loaded realistic patient profiles for instant testing |

---

## 🏗 Architecture

```
┌────────────────────────────────────────────────────┐
│                  Frontend (Browser)                │
│  index.html + index.js + Tailwind CSS              │
│  Modules: Analysis, Live, Records, Stats, RAG,     │
│           Appointments, Doctors, Prescriptions,     │
│           ML Analytics, Impact Dashboard            │
└──────────┬──────────────────────┬──────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌──────────────────────┐
│  clara-backend   │   │  python-services     │
│  (Node/Express)  │   │  (Flask)             │
│  Port 3001       │   │  Port 5000           │
│                  │   │                      │
│ • Auth (JWT)     │   │ • ML Risk Prediction │
│ • Records CRUD   │   │ • NLP Analysis       │
│ • Appointments   │   │ • Trend Analytics    │
│ • Prescriptions  │   │ • Clinical Insights  │
│ • Doctors        │   │ • Outcome Prediction │
│ • Statistics     │   │ • Dashboard Data     │
│ • QR / PDF       │   │ • Clinical Metrics   │
│ • Email          │   │                      │
└────────┬─────────┘   └──────────────────────┘
         │
         ▼
┌──────────────────┐       ┌──────────────────┐
│    MongoDB       │       │  Google Gemini    │
│  (Database)      │       │  API (LLM)       │
└──────────────────┘       └──────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 + Tailwind CSS | Layout and styling |
| Vanilla JavaScript (ES Modules) | Application logic |
| Google Gemini API (`@google/genai`) | AI transcript analysis |
| Vite | Dev server and bundler |
| React (imported) | Available for component use |

### Backend (Node.js)
| Technology | Purpose |
|------------|---------|
| Express 5 | REST API server |
| Mongoose / MongoDB | Database |
| JWT + bcrypt | Authentication |
| PDFKit | PDF report generation |
| QRCode | QR code generation |
| Nodemailer | Email delivery |
| node-cron | Scheduled tasks |

### Python Services
| Technology | Purpose |
|------------|---------|
| Flask + Flask-CORS | REST API |
| scikit-learn | ML risk prediction |
| spaCy / NLTK | NLP entity extraction |
| NumPy / Pandas | Data processing |
| TextBlob | Sentiment analysis |

---

## 📁 Project Structure

```
Clara/
├── index.html              # Main UI (all views, modals, forms)
├── index.js                # Core application logic (~2590 lines)
├── env.js                  # API key configuration
├── package.json            # Frontend dependencies & scripts
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript configuration
├── types.ts                # Type definitions
├── metadata.json           # App metadata (microphone permission)
│
├── services/               # Frontend service modules
│   ├── ragService.js       # RAG knowledge base & drug interaction checker
│   ├── agenticService.js   # Agentic AI multi-step reasoning engine
│   ├── appointmentService.js # Auth, Appointment, Doctor, Prescription APIs
│   ├── demoPatients.js     # Pre-loaded demo patient data
│   ├── pythonIntegration.js # Python ML/NLP API client
│   └── geminiService.ts    # Gemini service (logic currently in index.js)
│
├── clara-backend/          # Node.js backend server
│   ├── server.js           # Express server (~3133 lines)
│   └── package.json        # Backend dependencies
│
├── python-services/        # Python ML & analytics service
│   ├── app.py              # Flask server (~1037 lines)
│   ├── clinical_insights.py # Clinical insight logic
│   ├── dashboard_service.py # Dashboard data service
│   ├── requirements.txt    # Python dependencies
│   └── start.bat           # Windows launcher
│
└── README/                 # Documentation folder
    ├── README1.md          # Full project analysis report
    ├── README2.md          # Academic presentation document
    ├── Explan.md           # File-by-file explanation
    ├── review.md           # Project proposal report
    ├── planning.md         # Project planning document
    └── workbook.md         # Workbook notes
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Google Gemini API key

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd Clara

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd clara-backend
npm install
cd ..

# 4. Install Python dependencies
cd python-services
pip install -r requirements.txt
cd ..

# 5. Configure API key
# Edit env.js and set your Gemini API key:
#   window.process = { env: { API_KEY: 'YOUR_KEY' } };

# 6. Configure backend .env (in clara-backend/)
# MONGO_URI=mongodb://localhost:27017/clara
# JWT_SECRET=your-secret
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password
```

---

## 📖 Feature Details

### 1. Transcript Analysis

The core feature. Paste a doctor-patient conversation and get a full structured analysis.

**How it works:**
1. User fills in patient info (name, age, DOB, phone, email, gender, blood group).
2. Pastes a clinical transcript into the textarea.
3. Clicks **Analyze**.
4. The transcript + a JSON schema are sent to Google Gemini (`gemini-2.5-flash`).
5. Gemini returns a schema-constrained JSON with all medical data.
6. Results render in a 4-tab dashboard.

**Output includes:**
- **Overview**: Patient header, risk score (0–100), risk level (Low/Medium/High/Critical), contributing factors, AI summary, recommended next steps.
- **Clinical Findings**: Detected diseases/conditions (tags), ICD-10 codes with descriptions, tests mentioned.
- **Pharmacology**: Medications list, drug validation (Appropriate / Use with Caution / Contraindicated + reasoning), side effects with management strategies (expandable).
- **Raw Data**: Full JSON output with copy-to-clipboard.

**Key technical details:**
- Schema uses `@google/genai` Type system for strict JSON output.
- RAG context (drug interactions) is injected into the prompt before calling Gemini.
- Patient info fields are validated (name, age, DOB, phone, email required).

---

### 2. Live Conversation

Voice-powered real-time doctor-patient interview.

**How it works:**
1. Set patient age.
2. Click **Start Conversation**.
3. Browser requests microphone permission.
4. Audio is captured via Web Audio API, encoded as PCM, and streamed to Gemini.
5. AI generates contextual medical questions.
6. Transcript builds live in the UI (Doctor/Patient turns with avatars).
7. Click **Stop** to end and optionally analyze the resulting transcript.

---

### 3. Patient Records

Persistent record storage with full CRUD via the backend.

**Features:**
- **Save**: After analysis, click the save button to store the record in MongoDB.
- **Search**: Filter records by patient name or ID.
- **Risk Filter**: Show only Low / Medium / High / Critical risk records.
- **View**: Click to reload a saved analysis into the dashboard.
- **QR Code**: Generate a QR code that links to the record for sharing/email.
- **PDF Download**: Download a formatted PDF clinical report.
- **Delete**: Remove a record permanently.
- **Export All**: Download all records as a JSON file.

---

### 4. Statistics Dashboard

Aggregate analytics from all stored records.

**Displays:**
- Total Analyses count
- Average Risk Score (%)
- Analyses This Week
- High Risk Cases count
- **Most Common Diseases** (horizontal bar chart)
- **Risk Level Distribution** (color-coded bar chart)
- **Most Prescribed Medications** (horizontal bar chart)
- **Weekly Analysis Trend** (bar chart over recent weeks)

Data is fetched from the backend statistics endpoint.

---

### 5. RAG Knowledge Base

A local, searchable medical knowledge base that also enhances AI prompts.

**Capabilities:**
- **Search**: Type a drug name, disease, or ICD-10 code to get instant results from the built-in knowledge base.
- **Drug Interaction Checker**: Enter two drug names to check for contraindications (High / Medium / Low risk).
- **Data included**: Drug info & contraindications (Warfarin, Metformin, Lisinopril, Atorvastatin, Amlodipine), disease-symptom maps, ICD-10 code lookup, risk factor weights, treatment protocols.
- **RAG Enhancement**: When a transcript is analyzed, relevant knowledge base data is injected into the Gemini prompt for better accuracy.

---

### 6. Appointment System

Full appointment lifecycle management.

**Patient features:**
- Browse available doctors and their time slots.
- Select doctor, date, and available slot.
- Choose appointment type (Regular, Follow-up, Emergency, Telemedicine).
- Enter reason and symptoms.
- See consultation fee before booking.
- View upcoming / completed / cancelled appointments.
- Reschedule or cancel with a reason.

**Doctor features:**
- Manage weekly schedule with configurable slots.
- View patient appointments.
- Confirm, complete, or update appointment status.

**Technical details:**
- Slot availability is computed dynamically from the doctor's weekly schedule and existing bookings.
- Schedule overrides allow holidays and special hours.
- Appointment reminders via email (node-cron scheduled).

---

### 7. Doctor Directory

Browse and discover doctors.

**Features:**
- Search by name.
- Filter by specialization (loaded dynamically with counts).
- Filter by date availability.
- Doctor cards show: name, specialization, experience, rating, fee.
- Click a card to open a detail modal with: bio, qualifications, reviews, and a **Book Appointment** shortcut.

---

### 8. Prescriptions

Digital prescriptions with drug interaction warnings.

**Patient view:**
- View all prescriptions issued by doctors.
- Search by prescription ID, condition, or medication.
- Open full prescription detail (diagnosis, medications, advice, follow-up).
- Download prescription as PDF.
- Print prescription.

**Doctor view:**
- Select a patient and optionally link to an appointment.
- Add multiple diagnoses (condition + ICD-10 code + severity).
- Add multiple medications (name, dosage, frequency, duration).
- Add medical advice and follow-up instructions.
- AI-powered drug interaction warnings appear before creating.
- Digitally sign and create the prescription.

---

### 9. ML Analytics (Python)

Python-powered machine learning and NLP features.

**ML Risk Prediction:**
- Enter patient age, conditions, medications, and symptoms.
- Python model calculates a weighted risk score using clinically-derived factor weights.
- Returns: score (0–100), level, confidence %, contributing factors.

**NLP Transcript Analysis:**
- Paste a transcript for Python-based entity extraction.
- Uses keyword matching for diseases, medications, tests, and symptoms.
- Returns: extracted entities, urgency level, complexity score (0–10), sentiment analysis.

**Clinical Outcome Predictions:**
- 30-day hospitalization risk
- 30-day readmission risk
- Overall prognosis score

**Weekly Trend Analysis:**
- Load trend data showing daily analyses, average risk, and high-risk counts.

**Dashboard cards:**
- Total Analyses, Avg Risk Score, High Risk Cases, ML Accuracy.

---

### 10. Impact Dashboard

Measure and visualize the clinical impact of using CLARA.

**Features:**
- **Impact Score**: Overall computed score based on improvements.
- **Before/After Comparison**: Compare metrics across two time periods (analyses, risk, high-risk rate).
- **Improvements List**: Auto-detected improvements.
- **Focus Areas**: Areas needing attention.
- **Cases Tracked**: Total cases in the impact tracker.

**Clinical Metrics Calculator:**
- **NNT (Number Needed to Treat)**: Enter risk reduction and baseline risk.
- **Odds Ratio**: Enter exposed/control event counts with 95% CI.
- **Diagnostic Accuracy**: Enter TP/FP/TN/FN to get Sensitivity, Specificity, PPV, NPV, Accuracy.

---

### 11. Authentication & Roles

JWT-based authentication with role-based access.

**Roles:**
- **Patient**: Book appointments, view prescriptions, view records.
- **Doctor**: Manage appointments, create prescriptions, view patients.
- **Admin**: Full access.

**Features:**
- Register with name, email, phone, password, role.
- Login with email and password.
- Token stored in localStorage.
- All protected API endpoints require `Authorization: Bearer <token>`.
- Passwords hashed with bcrypt (12 rounds).
- Token expiry: 7 days.

---

### 12. QR Code & PDF Reports

Share and download clinical reports.

**QR Code:**
- Generate a QR code for any saved record.
- Scan to receive the report via email.
- Shareable link displayed alongside the QR.

**PDF Report:**
- Download a full clinical report as a formatted PDF.
- Generated server-side using PDFKit.

---

### 13. Agentic AI

A transparent, multi-step AI reasoning engine.

**How it works:**
1. When analysis runs, the agent **plans** a sequence of tasks (extract entities → check interactions → validate drugs → calculate risk → generate ICD-10 → create FHIR → recommend actions → summarize).
2. Tasks have priorities and dependencies.
3. Each task executes with timing and status tracking.
4. A **Chain of Thought** trace shows the agent's reasoning step by step.
5. The execution trace is visible in the **Knowledge Base → AI Agent Activity** section.

---

### 14. Demo Patients

Pre-loaded patient profiles for quick testing.

**Available demo patients:**
1. **Rajesh Kumar** (58, Male) — Hypertension, Type 2 Diabetes, chest pain, ECG changes.
2. **Priya Sharma** (34, Female) — Asthma, Anxiety, worsening breathing.
3. **Mohammed Ali** (72, Male) — CAD, Previous MI, CKD Stage 3, Atrial Fibrillation.
4. **Anita Desai** (45, Female) — Hypothyroidism, Migraine, GERD.

Select a demo patient from the dropdown → all form fields auto-fill → click Analyze.

Demo patients can also be synced to the backend database.

---

## 📋 File-by-File Breakdown

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | ~1200 | All views, modals, forms, and layout |
| `index.js` | ~2590 | Core logic: state, AI calls, renderers, event handlers, all managers |
| `env.js` | 6 | Gemini API key config |
| `vite.config.ts` | 22 | Vite dev server (port 3000), env loading, React plugin |
| `tsconfig.json` | 25 | TypeScript compiler settings (ES2022, JSX, bundler resolution) |
| `package.json` | 20 | Frontend deps: `@google/genai`, `react`, `vite`, `typescript` |
| `metadata.json` | 6 | App metadata (microphone permission) |
| `services/ragService.js` | 227 | Medical knowledge base, drug interaction checker, RAG prompt builder |
| `services/agenticService.js` | 281 | Agentic AI task planner, executor, chain-of-thought generator |
| `services/appointmentService.js` | 565 | Auth state, Auth/Appointment/Doctor/Prescription/Dashboard API clients |
| `services/demoPatients.js` | 163 | 4 pre-loaded demo patient profiles with transcripts |
| `services/pythonIntegration.js` | 459 | Python API client (risk, NLP, alerts, trends, dashboard, metrics) |
| `clara-backend/server.js` | ~3133 | Express server: schemas, auth, CRUD, appointments, prescriptions, stats, QR, PDF, email |
| `clara-backend/package.json` | 36 | Backend deps: express, mongoose, jwt, bcrypt, pdfkit, qrcode, nodemailer |
| `python-services/app.py` | ~1037 | Flask server: ML risk model, NLP analyzer, dashboard, trends, clinical metrics |
| `python-services/requirements.txt` | 30 | Python deps: flask, sklearn, spacy, numpy, pandas, reportlab |

---

## 🔌 API Endpoints

### Backend (Node.js — Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| GET | `/api/records` | List records |
| POST | `/api/records` | Save analysis record |
| DELETE | `/api/records/:id` | Delete record |
| GET | `/api/records/:id/qr` | Generate QR code |
| GET | `/api/records/:id/pdf` | Download PDF report |
| GET | `/api/statistics/dashboard` | Get aggregate stats |
| GET | `/api/doctors` | List doctors |
| GET | `/api/doctors/:id` | Doctor detail + reviews |
| GET | `/api/doctors/:id/availability` | Check slot availability |
| GET | `/api/doctors/specializations` | List specializations |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments` | List user appointments |
| PUT | `/api/appointments/:id/reschedule` | Reschedule |
| PUT | `/api/appointments/:id/cancel` | Cancel |
| POST | `/api/prescriptions` | Create prescription |
| GET | `/api/prescriptions` | List prescriptions |
| GET | `/api/prescriptions/:id` | Prescription detail |
| GET | `/api/prescriptions/:id/pdf` | Download prescription PDF |

### Python Service (Flask — Port 5000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/predict-risk` | ML risk prediction |
| POST | `/api/analyze-nlp` | NLP transcript analysis |
| POST | `/api/generate-alerts` | Dynamic clinical alerts |
| POST | `/api/comprehensive-analysis` | Combined analysis |
| GET | `/api/dashboard` | Dashboard summary data |
| GET | `/api/trends/:period` | Trend analytics |
| POST | `/api/predict-outcomes` | Outcome predictions |
| POST | `/api/calculate-nnt` | NNT calculator |
| POST | `/api/calculate-odds-ratio` | Odds ratio calculator |
| POST | `/api/diagnostic-accuracy` | Sensitivity/Specificity |

---

## 🔐 Environment Variables

### Frontend (`env.js`)
```javascript
window.process = { env: { API_KEY: 'YOUR_GEMINI_API_KEY' } };
```

### Backend (`clara-backend/.env`)
```
PORT=3001
MONGO_URI=mongodb://localhost:27017/clara
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## ▶ How to Run

### Option 1: Run all services separately

```bash
# Terminal 1 — Frontend
npm run dev
# → http://localhost:3000

# Terminal 2 — Backend
cd clara-backend
npm run dev
# → http://localhost:3001

# Terminal 3 — Python
cd python-services
python app.py
# → http://localhost:5000
```

### Option 2: Use the combined script

```bash
npm run start:all
```

This starts the Python service and the Vite dev server together.

---


