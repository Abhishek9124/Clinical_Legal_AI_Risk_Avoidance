# CLARA: Clinical Legal AI for Risk Avoidance
## Final Year Project Workbook

---

## Project Information

| Field | Details |
|-------|---------|
| **Project ID** | 11 |
| **Project Title** | CLARA – Clinical Legal AI for Risk Avoidance |
| **Area of Project** | Artificial Intelligence in Healthcare & Clinical Informatics |
| **Internal Guide** | Mrs. Pallavi Nikumbh |
| **Date** | February 2, 2026 |

---

## Team Members

| Sr. No. | Student Name |
|---------|--------------|
| 1 | Abhishek Gangurde |
| 2 | Prajyot Kale |
| 3 | Shriniwas Kulkarni |
| 4 | Pranav Ukhade |

---

## Project Work Schedule

| Day | Time Slot |
|-----|-----------|
| Thursday | 11:00 AM – 4:00 PM |
| Saturday | 11:00 AM – 4:00 PM |
| Sunday | 11:00 AM – 4:00 PM |

---

## 1. Problem Statement

In modern healthcare, clinicians face significant challenges in managing clinical documentation and risk assessment:

1. **Documentation Burden**: Healthcare professionals spend up to 30% of their time on documentation, reducing patient care time.
2. **Unstructured Data**: Clinical notes and patient transcripts exist as unstructured text, making it difficult to extract actionable insights for Electronic Health Records (EHR).
3. **Medical Risk Oversight**: Manual review of drug interactions, contraindications, and patient risk factors is time-consuming and error-prone.
4. **Legal & Compliance Risks**: Inadequate documentation and missed risk factors can lead to medical malpractice claims and regulatory non-compliance.
5. **Lack of Real-Time Decision Support**: Existing tools fail to provide immediate, AI-powered clinical reasoning during patient consultations.

**CLARA addresses these challenges** by providing an AI-powered assistant that automatically extracts medical entities, validates medications, assesses patient risk, and generates standardized clinical outputs (ICD-10 codes, FHIR resources) from unstructured clinical transcripts.

---

## 2. Objectives

### Primary Objectives
1. **Automated Clinical Data Extraction**: Develop a system to extract diseases, tests, and medications from unstructured clinical text using Natural Language Processing (NLP).
2. **Risk Assessment Engine**: Implement an AI-based risk scoring system (0-100 scale) that identifies contributing factors and categorizes risk levels (Low/Medium/High/Critical).
3. **Drug Validation & Interaction Checking**: Provide real-time validation of prescribed medications, including contraindication warnings and side effect management guidance.
4. **Standardized Output Generation**: Automatically map diagnoses to ICD-10 codes and generate HL7 FHIR-compliant clinical resources for EHR interoperability.
5. **Privacy-First Architecture**: Design a system where sensitive patient data is processed client-side, minimizing server-side data exposure.

### Secondary Objectives
1. Enable live voice-to-text patient interviews using Web Audio API.
2. Provide a secure, persistent storage mechanism for historical patient analyses.
3. Demonstrate practical applications of Generative AI (Google Gemini) in healthcare.
4. Create a user-friendly dashboard for clinicians with minimal learning curve.

---

## 3. Mapping of Course Outcomes (CO) with Program Outcomes (PO) & Program Specific Outcomes (PSO)

### Course Outcomes (CO)

| CO | Description |
|----|-------------|
| **CO1** | Understand and apply AI/ML concepts to solve real-world healthcare problems. |
| **CO2** | Design and develop a web-based application using modern technologies (JavaScript, Node.js, MongoDB). |
| **CO3** | Integrate third-party APIs (Google Gemini) for natural language processing tasks. |
| **CO4** | Implement structured data extraction using JSON schemas and validate AI outputs. |
| **CO5** | Apply software engineering principles including requirement analysis, system design, and testing. |
| **CO6** | Demonstrate understanding of healthcare IT standards (ICD-10, FHIR). |

### Program Outcomes (PO)

| PO | Description |
|----|-------------|
| **PO1** | Engineering Knowledge: Apply knowledge of mathematics, science, and engineering fundamentals. |
| **PO2** | Problem Analysis: Identify, formulate, and analyze complex engineering problems. |
| **PO3** | Design/Development of Solutions: Design solutions for complex problems meeting specifications. |
| **PO4** | Conduct Investigations: Use research-based knowledge to provide valid conclusions. |
| **PO5** | Modern Tool Usage: Create, select, and apply appropriate techniques and IT tools. |
| **PO6** | Engineer and Society: Apply reasoning to assess societal, health, and safety issues. |
| **PO7** | Environment and Sustainability: Understand impact of solutions in environmental context. |
| **PO8** | Ethics: Apply ethical principles and commit to professional responsibilities. |
| **PO9** | Individual and Team Work: Function effectively as an individual and team member. |
| **PO10** | Communication: Communicate effectively with engineering community and society. |
| **PO11** | Project Management and Finance: Demonstrate knowledge of management principles. |
| **PO12** | Life-long Learning: Engage in independent and life-long learning. |

### Program Specific Outcomes (PSO)

| PSO | Description |
|-----|-------------|
| **PSO1** | Apply computational and programming skills to develop software solutions. |
| **PSO2** | Utilize modern frameworks and tools for application development. |
| **PSO3** | Demonstrate ability to work on interdisciplinary projects (AI + Healthcare). |

### CO-PO-PSO Mapping Matrix

| CO | PO1 | PO2 | PO3 | PO4 | PO5 | PO6 | PO7 | PO8 | PO9 | PO10 | PO11 | PO12 | PSO1 | PSO2 | PSO3 |
|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|------|------|------|------|------|
| **CO1** | 3 | 3 | 2 | 2 | 3 | 2 | 1 | 2 | 2 | 2 | 1 | 3 | 3 | 3 | 3 |
| **CO2** | 2 | 2 | 3 | 2 | 3 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 3 | 3 | 2 |
| **CO3** | 2 | 2 | 3 | 3 | 3 | 1 | 1 | 2 | 2 | 1 | 1 | 3 | 3 | 3 | 3 |
| **CO4** | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 2 | 2 | 2 | 1 | 2 | 3 | 2 | 3 |
| **CO5** | 2 | 3 | 3 | 2 | 2 | 2 | 1 | 2 | 3 | 3 | 3 | 2 | 2 | 3 | 2 |
| **CO6** | 2 | 2 | 2 | 3 | 2 | 3 | 2 | 3 | 2 | 2 | 1 | 3 | 2 | 2 | 3 |

**Legend**: 1 = Low, 2 = Medium, 3 = High

---

## 4. Monthly Planning – January 2026

### Week 1 (January 1 – January 5, 2026)

| Date | Day | Activity | Team Member | Deliverable |
|------|-----|----------|-------------|-------------|
| Jan 2 | Thursday | Project kickoff meeting; Finalize requirements | All | Requirement Document |
| Jan 4 | Saturday | Literature review on Clinical NLP | Abhishek, Prajyot | Research Notes |
| Jan 5 | Sunday | Study Google Gemini API documentation | Shriniwas, Pranav | API Integration Plan |

### Week 2 (January 6 – January 12, 2026)

| Date | Day | Activity | Team Member | Deliverable |
|------|-----|----------|-------------|-------------|
| Jan 9 | Thursday | Design system architecture diagram | All | Architecture Document |
| Jan 11 | Saturday | Setup project environment (Node.js, Vite, MongoDB) | Pranav, Shriniwas | Dev Environment Ready |
| Jan 12 | Sunday | Create JSON schema for clinical output | Abhishek, Prajyot | `claraSchema` Definition |

### Week 3 (January 13 – January 19, 2026)

| Date | Day | Activity | Team Member | Deliverable |
|------|-----|----------|-------------|-------------|
| Jan 16 | Thursday | Develop frontend UI (HTML/Tailwind) | Prajyot, Pranav | index.html Layout |
| Jan 18 | Saturday | Implement Gemini API integration | Abhishek, Shriniwas | `analyzeTranscript()` Function |
| Jan 19 | Sunday | Build dashboard rendering functions | All | Dashboard UI Components |

### Week 4 (January 20 – January 26, 2026)

| Date | Day | Activity | Team Member | Deliverable |
|------|-----|----------|-------------|-------------|
| Jan 23 | Thursday | Develop backend API (Express + MongoDB) | Shriniwas, Pranav | server.js with CRUD APIs |
| Jan 25 | Saturday | Connect frontend to backend for record saving | Abhishek, Prajyot | Save/Load Functionality |
| Jan 26 | Sunday | Implement Live Conversation mode (Audio API) | All | Voice Input Feature |

### Week 5 (January 27 – January 31, 2026)

| Date | Day | Activity | Team Member | Deliverable |
|------|-----|----------|-------------|-------------|
| Jan 30 | Thursday | Unit testing and bug fixes | All | Test Report |
| - | - | Documentation and code review | All | Code Documentation |

### January Milestone Summary

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Requirements Finalized | Jan 5 | ✅ Complete |
| Architecture Design | Jan 9 | ✅ Complete |
| Core AI Integration | Jan 18 | ✅ Complete |
| Backend API Ready | Jan 23 | ✅ Complete |
| Voice Feature | Jan 26 | ✅ Complete |
| Testing Complete | Jan 31 | ✅ Complete |

---

## 5. New Features Implemented (February 2026)

### 5.1 QR Code Based Report Sharing via Email

**Feature Description:**
- Generate unique QR codes for each patient record
- Scan QR code with mobile device to access email form
- Enter email address to receive clinical report as PDF attachment
- Professional HTML email with embedded patient summary

### 5.2 Weekly Statistical Analysis Dashboard

**Feature Description:**
- Track and visualize common diseases across all analyses
- Monitor risk level distribution (Low/Medium/High/Critical)
- View most prescribed medications
- Weekly trend analysis for case volume

### 5.3 PDF Report Generation

**Feature Description:**
- Professional clinical reports in PDF format
- Includes patient info, risk assessment, diagnoses, medications
- Drug validation status with color coding
- AI summary and recommendations

### 5.4 RAG (Retrieval Augmented Generation) System

**Feature Description:**
- Medical Knowledge Base integration for enhanced AI responses
- Drug interaction database with contraindication warnings
- Disease-symptom mapping for intelligent suggestions
- ICD-10 code reference lookup
- Risk factor weight calculation
- Treatment protocol recommendations

**Technical Components:**
- `ragService.js` - RAG query functions and knowledge base
- Drug interaction checker with severity levels (high/medium/low)
- Search across drugs, diseases, and ICD-10 codes
- RAG-enhanced prompts for better AI analysis

### 5.5 Agentic AI System

**Feature Description:**
- Multi-step reasoning and autonomous task execution
- Task planning with dependencies and priorities
- Chain of thought reasoning for transparency
- Agent memory for cross-session context

**Agent Tasks:**
1. Extract entities (diseases, medications, tests)
2. Check drug interactions
3. Validate drugs against patient profile
4. Calculate risk score
5. Generate ICD-10 codes
6. Create FHIR-compliant resources
7. Recommend next steps
8. Summarize findings

### 5.6 Professional Patient Information Form

**Required Fields:**
- Full Name (validated)
- Patient ID (auto-generated: CLR-XXXXXX-XXXX)
- Age (1-150 validation)
- Date of Birth
- Phone Number (format validation)
- Email Address (format validation)
- Gender (optional)
- Blood Group (optional)

**Form Features:**
- Real-time validation with error messages
- Auto-generation of unique patient IDs
- Clear form functionality
- Demo patient quick-load

### 5.7 Demo Patients with Backend Sync

**Feature Description:**
- 5 pre-configured demo patients for testing
- Complete medical histories and transcripts
- Backend synchronization support
- Quick selection dropdown

**Demo Patients:**
1. Rajesh Kumar - 58, Male - Hypertension, Type 2 Diabetes
2. Priya Sharma - 34, Female - Asthma, Anxiety
3. Mohammed Ali - 72, Male - CAD, Previous MI, CKD Stage 3
4. Anita Desai - 45, Female - Hypothyroidism, Migraine, GERD
5. Vikram Patel - 28, Male - Pneumonia (acute)

### 5.8 Patient History Timeline

**Feature Description:**
- Visual timeline of patient's clinical history
- Shows all previous analyses for a patient
- Risk trend visualization over time
- Stored in agent memory for persistence

### 5.9 Advanced Records Management

**Features:**
- Search by patient name or ID
- Filter by risk level
- Export all records as JSON
- Bulk PDF download
- QR code generation per record

---

## 6. System Architecture

The system follows a modern **Client-Server-AI** hybrid architecture with RAG enhancement:

```
┌─────────────────────────────────────────────────────────────┐
│                     USER (Clinician)                        │
│                    (Browser Interface)                      │
└─────────────────────────────┬───────────────────────────────┘
                              │ Text / Voice Input
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Modular JavaScript)              │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │ Analysis  │ │   Live    │ │  Records  │ │Statistics │   │
│  │   View    │ │Conversation│ │   View   │ │  View     │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│                     ┌─────────────────┐                     │
│                     │ RAG Knowledge   │                     │
│                     │     View        │                     │
│                     └─────────────────┘                     │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌──────────────────┐   ┌───────────────┐
│  RAG Service  │   │  Agentic AI      │   │ Demo Patients │
│  (Knowledge)  │   │  (Task Planning) │   │   Service     │
│ - Drug DBs    │   │ - Chain of       │   │ - 5 Patients  │
│ - ICD-10      │   │   Thought        │   │ - Sync API    │
│ - Treatments  │   │ - Memory         │   │ - Histories   │
└───────┬───────┘   └────────┬─────────┘   └───────┬───────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             │ RAG-Enhanced Prompt
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  GOOGLE GEMINI API                          │
│              (gemini-2.5-flash Model)                       │
│         Structured JSON Output with Schema                  │
└─────────────────────────────┬───────────────────────────────┘
                              │ JSON Response
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Express.js)                        │
│                   PORT: 3001                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Records │ QR Code │ Email │ Statistics │ Demo Sync  │   │
│  │ CRUD    │ /qr     │ /email│ /stats     │ /demo      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Knowledge API │ Drug Interactions │ ICD-10 Lookup   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                         │
│    Collections: records, statistics, demoPatients           │
│    { analysis, patientInfo, qrToken, timestamps }           │
└─────────────────────────────────────────────────────────────┘
```
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Technology Stack

| Component | Technology | Version | Description |
|-----------|------------|---------|-------------|
| **Frontend** | HTML/JS/CSS | ES6+ | Vanilla JS with DOM manipulation |
| **Build Tool** | Vite | 6.2.0 | Fast frontend build tool |
| **AI Model** | Google Gemini | 2.5 Flash | Multimodal LLM via `@google/genai` SDK |
| **Backend** | Express.js | 5.1.0 | RESTful API server |
| **Database** | MongoDB | 8.x | NoSQL database for JSON storage |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **Runtime** | Node.js | 22.x | JavaScript runtime |
| **QR Code** | qrcode | 1.5.4 | QR code generation library |
| **Email** | nodemailer | 6.9.14 | SMTP email sending |
| **PDF** | pdfkit | 0.15.0 | PDF document generation |

---

## 8. Testing & Validation

### Test Cases

| Test ID | Description | Expected Outcome | Status |
|---------|-------------|------------------|--------|
| TC-01 | Analyze transcript with diseases and medications | Correct entity extraction | ✅ Pass |
| TC-02 | Drug interaction detection (Warfarin + Aspirin) | Warning displayed | ✅ Pass |
| TC-03 | Empty transcript submission | Error message shown | ✅ Pass |
| TC-04 | Save analysis record to database | HTTP 201, record stored | ✅ Pass |
| TC-05 | Invalid API key handling | Graceful error message | ✅ Pass |
| TC-06 | Generate QR code for saved record | QR code image displayed | ✅ Pass |
| TC-07 | Send report via email (QR scan) | PDF attachment received | ✅ Pass |
| TC-08 | Download PDF report | PDF file downloaded | ✅ Pass |
| TC-09 | View weekly statistics dashboard | Charts and data displayed | ✅ Pass |
| TC-10 | Track disease frequency across records | Correct count aggregation | ✅ Pass |

---

## 9. Conclusion

CLARA (Clinical Legal AI for Risk Avoidance) successfully demonstrates that Generative AI can reliably produce structured, safe, and professional clinical data from unstructured transcripts. By combining the flexibility of Large Language Models with the rigidity of JSON Schemas, we have addressed the "Hallucination" problem to a degree suitable for a "human-in-the-loop" clinical decision support system.

### Key Achievements:
1. **Automated Clinical Data Extraction** - NLP-powered entity extraction for diseases, tests, and medications
2. **Risk Assessment Engine** - AI-based scoring (0-100) with categorization and contributing factors
3. **Drug Validation & Interaction Checking** - Real-time validation with contraindication warnings
4. **Standardized Output** - ICD-10 codes and FHIR-compliant resources for EHR interoperability
5. **Privacy-First Architecture** - Client-side processing minimizes server data exposure
6. **QR Code Report Sharing** - Scan and email reports instantly
7. **Weekly Statistical Analysis** - Identify common diseases and track trends

---

## Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Team Member 1** | Abhishek Gangurde | _____________ | _______ |
| **Team Member 2** | Prajyot Kale | _____________ | _______ |
| **Team Member 3** | Shriniwas Kulkarni | _____________ | _______ |
| **Team Member 4** | Pranav Ukhade | _____________ | _______ |
| **Internal Guide** | Mrs. Pallavi Nikumbh | _____________ | _______ |
