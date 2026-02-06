# CLARA Project Planning (Detailed)

**Date:** January 31, 2026

## 1) Project Summary
CLARA is a browser-based clinical assistant that analyzes unstructured clinical transcripts and produces structured medical insights. It supports two workflows: transcript analysis and live conversation. The system uses the Gemini API with a JSON schema to ensure predictable, structured outputs.

## 2) Objectives
### Primary
- Convert unstructured clinical text into structured medical data.
- Provide clear, clinician-friendly summaries and risk insights.
- Generate ICD-10 codes and FHIR-ready output.
- Keep patient data in the browser (privacy-first).

### Secondary
- Improve clinician efficiency and reduce manual documentation.
- Provide medication validation and side-effect guidance.
- Offer a simple record-saving experience for recent cases.

## 3) Assumptions & Constraints
- The system runs fully in the browser (no server-side storage).
- API key is provided by the user via env.js (local only).
- Output quality depends on transcript clarity and model performance.
- This is a demo/prototype; clinical validation is not a substitute for medical judgment.

## 4) Target Users & Use Cases
### Users
- Clinicians reviewing transcripts.
- Researchers analyzing medical conversations.
- Students learning clinical documentation patterns.

### Core Use Cases
1. Paste a transcript, input age, analyze results.
2. Run a live interview, collect transcript, analyze results.
3. Save an analysis for later review in the same session.

## 5) Functional Requirements
### A. Transcript Analysis
- Accept patient age and transcript text.
- Validate required inputs.
- Send prompt + schema to Gemini.
- Parse JSON response and display results by section.

### B. Live Conversation
- Start/stop a voice interaction session.
- Build a transcript in real time.
- Allow analysis of the captured transcript.

### C. Medical Output
- Extract diseases, tests, and drugs.
- Map diagnoses to ICD-10 codes.
- Provide risk score, risk level, and contributing factors.
- Provide medication validation and side effects.
- Provide FHIR output for interoperability.

### D. Records
- Save analysis snapshot with timestamp.
- Display saved records in Patient Records view.
- Allow viewing full saved analysis.

## 6) Non-Functional Requirements
- **Privacy:** No server-side storage of patient data.
- **Reliability:** Handle API errors gracefully.
- **Usability:** Clear UX for all modes, minimal clicks.
- **Performance:** Reasonable response time for long transcripts.
- **Maintainability:** Modular code and clear schema.

## 7) System Architecture (Detailed)
### UI Layer
- HTML layout and Tailwind for styling.
- Mode tabs: Transcript, Live, Records.
- Responsive layout with a sticky input column and multi-panel results.

### Logic Layer
- Central `state` object holds UI and analysis state.
- Event handlers for all inputs and buttons.
- Render functions for each dashboard section.

### AI Layer
- Gemini API called with a JSON schema for strict structure.
- Schema includes entities, ICD-10 codes, risk profile, drug validation, side effects, chatbot response, and FHIR output.

## 8) Detailed Data Flow
1. User selects Transcript Analysis mode.
2. User inputs age and transcript.
3. Validate inputs (age > 0, transcript not empty).
4. Show loading state.
5. Call Gemini with schema.
6. Parse JSON response.
7. Render each dashboard section.
8. Allow user to save record.

Live Conversation:
1. User selects Live Conversation mode.
2. Start microphone capture.
3. Stream and build transcript.
4. Stop session when complete.
5. Run analysis on transcript.

## 9) UI/UX Plan
- **Input panel**: age input, transcript textarea, analyze button.
- **Dashboard sections**:
   - Overview (patient + risk)
   - Clinical findings
   - Pharmacology (validation + side effects)
   - Raw JSON
- **Status messages**: loading, error, empty state.

## 10) Error Handling Plan
- Missing API key: show clear error and instructions.
- Invalid JSON from API: show recovery message.
- Network errors: show retry option.
- Live conversation permission denial: show guidance.

## 11) Security & Privacy Plan
- Use local env.js for API key.
- Do not send data to any custom backend.
- Do not store sensitive data beyond the in-memory UI state.
- Show disclaimer in output.

## 12) Record Storage Strategy
- Save records in memory (session-only).
- Each record contains:
   - Patient ID, name, age
   - Timestamp
   - Full analysis JSON
- Future option: localStorage export or download.

## 13) Step-by-Step Implementation Plan
### Phase 1: Transcript Analysis (Core)
1. Input validation logic.
2. Gemini API call with schema.
3. Parse JSON response.
4. Render results in dashboard.

### Phase 2: Live Conversation
1. Microphone start/stop logic.
2. Transcript capture and display.
3. Trigger analysis of transcript.

### Phase 3: Records
1. Save button behavior.
2. Render list of saved records.
3. Open saved record details.

### Phase 4: Quality & Polish
1. Error states & empty states.
2. UI refinements.
3. Test with diverse transcripts.

## 14) Testing Plan (Detailed)
### Functional Tests
- Transcript analysis with valid input.
- Empty age input → validation error.
- Empty transcript input → validation error.
- Missing API key → error message.
- Save record → appears in records list.
- Live conversation start/stop.

### Edge Cases
- Very short transcript.
- Very long transcript (latency check).
- Unknown or misspelled drugs.
- Multiple diagnoses with overlapping codes.

### UX Tests
- Tab switching between modes.
- Scrolling behavior with sticky input.
- Readability on mobile screens.

## 15) Acceptance Criteria
- Transcript analysis returns a structured dashboard.
- ICD-10 codes are listed with diagnosis names.
- Risk assessment shown with level and score.
- Medication validation and side effects visible.
- Records can be saved and viewed.
- Errors are shown clearly and do not break the app.

## 16) Deployment Plan
- Use Vite for local dev and production build.
- Deploy static build to a static host (Vercel/Netlify/GitHub Pages).
- Keep API key local and not bundled into public builds.

## 17) Future Enhancements
- Export analysis to PDF/CSV.
- Add advanced ICD-10 validation rules.
- Add local storage with encryption.
- Add multi-language transcript support.
- Improve live transcription accuracy.

---

## Quick Checklist (Summary)
- [ ] Transcript analysis workflow complete.
- [ ] Live conversation workflow complete.
- [ ] Records save/view complete.
- [ ] Error handling in place.
- [ ] UI polished and responsive.
- [ ] Tested with multiple transcript types.
