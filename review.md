# B. TECH PROJECT PROPOSAL REPORT

## CLARA – Clinical Legal AI for Risk Avoidance

Project Guide: Prof. Pallavi Nikumbh  
Department of Computer Science & Engineering (AI–ML)  
PCCoE, Pune  
Academic Year: 2025–26

Project Group Members:  
Abhishek Gangurde  
Pranav Ukhade  
Prajyot Kale  
Shriniwas Kulkarni

---

# ABSTRACT

Healthcare professionals spend a significant portion of their time documenting patient interactions, which leads to fatigue, reduced efficiency, and potential medical errors. Most doctor–patient conversations are unstructured, making it difficult to convert them into standardized electronic medical records.

This project proposes CLARA (Clinical Legal AI for Risk Avoidance) — an AI-powered assistant that converts real-time clinical conversations into structured medical records. The system uses Natural Language Processing (NLP), Large Language Models (LLMs), and healthcare standards like ICD-10 and FHIR to extract symptoms, diagnoses, medications, and clinical observations.

CLARA aims to reduce documentation burden, improve clinical accuracy, ensure standardization, and support legal compliance in medical documentation.

---

# 1. Problem Identification, Novelty and Relevance

## 1.1 Practical Observation

Clinical documentation is largely manual. Doctors must listen, analyze, and type notes during consultations, which:

- Reduces time spent on patient care
- Causes documentation errors
- Leads to incomplete records
- Increases legal and compliance risks
- Creates delayed or inconsistent updates in electronic systems
- Reduces the quality of care due to cognitive overload

---

## 1.2 Problem Identification

Current clinical documentation systems face these challenges:

- Unstructured conversations with varied vocabulary and style
- Time-consuming manual entry and review
- Human errors in notes and omissions of key details
- Lack of real-time decision support for clinicians
- Non-standardized records across departments
- High cognitive load on doctors and staff
- Limited ability to map notes into standardized codes

---

## 1.3 Importance of Structured Clinical Documentation

Structured documentation is essential because it:

- Improves diagnosis accuracy and repeatability
- Supports evidence-based treatment planning
- Enables EHR interoperability and data exchange
- Reduces legal risk through auditable records
- Enhances analytics for hospital quality audits
- Improves clinical continuity across departments

---

## 1.4 Purpose of the System

The purpose of CLARA is to:

- Convert speech → structured clinical data
- Extract medical entities such as symptoms, diseases, and medications
- Map to standardized medical codes (ICD-10)
- Structure outputs according to FHIR
- Provide decision support insights and risk indicators
- Store secure patient records for later review

---

## 1.5 Novelty and Relevance

The novelty of CLARA lies in:

- Real-time AI understanding of clinical conversations
- Combining NLP entity extraction with LLM reasoning
- ICD-10 and FHIR standard integration in one pipeline
- Legal-risk-aware documentation for compliance
- Web-based, cloud-deployable architecture
- A structured JSON schema enforced at the model output

---

# 2. Literature Survey

## 2.1 Introduction

The literature on AI in healthcare documentation, NLP in medical text, and LLM-based assistants was reviewed. The focus was on automation of clinical documentation, accuracy of entity extraction, interoperability standards, and legal compliance in healthcare records.

---

## 2.2 Key Findings

- NLP improves medical text processing and entity extraction.
- Speech-to-text systems assist transcription but require clinical context.
- LLMs enhance understanding of context and multi-sentence reasoning.
- Existing tools lack standardized medical coding and structured output.
- Few systems address compliance and medico-legal documentation risks.

---

## 2.3 Research Gaps Identified

- Most systems only transcribe conversations, not interpret them.
- ICD and FHIR mapping are rarely integrated end-to-end.
- Real-time decision support is limited or absent.
- Legal-risk awareness is not embedded in documentation tools.
- Minimal focus on privacy-first, client-side processing.

---

# 3. Objectives and Methodology

## 3.1 Project Objectives

1. Develop an AI assistant for clinical conversations.
2. Extract symptoms, diseases, and medications from text.
3. Map clinical terms to ICD-10 codes.
4. Structure outputs in FHIR format for interoperability.
5. Provide decision support and legal-risk guidance.
6. Ensure data privacy and secure handling of patient data.

---

## 3.2 Proposed Methodology

1. Capture doctor–patient conversation (voice or text).
2. Convert speech to text using audio processing.
3. Preprocess text and normalize clinical terms.
4. Apply NLP for entity extraction.
5. Use LLM reasoning for context, severity, and risk.
6. Map diagnoses to ICD-10 codes.
7. Build structured output in FHIR resource format.
8. Store results in MongoDB for retrieval.
9. Display the final report on the web dashboard.

---

## 3.2.1 Block Diagram

Input → Speech Processing → NLP → AI Reasoning (Gemini) → Code Mapping → FHIR Structuring → Database → Output Dashboard

---

## 3.2.2 Flow Chart

Conversation  
→ Speech to Text  
→ Entity Extraction  
→ AI Reasoning  
→ Code Mapping  
→ Structured Record  
→ Storage  
→ Dashboard Output

---

## 3.3 Proposed AI Techniques

- Named Entity Recognition (NER)
- Transformer-based LLM (Gemini)
- Retrieval Augmented Generation (RAG) for clinical references
- Schema-constrained JSON output to ensure structural consistency

---

# 4. Requirement Analysis

## 4.1 Functional Requirements

- Capture conversation or accept transcript text.
- Extract clinical entities (symptoms, diseases, medications).
- Map medical codes (ICD-10).
- Generate structured output (FHIR).
- Store records securely in database.
- Display structured results on the dashboard.

---

## 4.2 Non-Functional Requirements

- High accuracy in entity extraction and coding.
- Low latency response for real-time use.
- Strong data security and patient privacy.
- Scalability for multiple concurrent users.
- Reliability and graceful error handling.

---

## 4.3 Hardware Requirements

- Microphone and audio capture device for live conversations.
- Standard server or cloud instance for storage.
- Client device capable of running a modern browser.

---

## 4.4 Software Requirements

- Python for NLP and preprocessing (optional integration).
- NLP libraries: spaCy, Transformers.
- Gemini API for LLM reasoning.
- MongoDB Atlas for record storage.
- Web frontend (HTML, Tailwind, JavaScript).

---

## 4.5 Summary

This requirement analysis provides the foundation for implementing CLARA as a real-time clinical AI assistant with structured outputs, interoperability, and compliance support.

---

# REFERENCES

1. NLP in Healthcare Documentation – IEEE
2. FHIR Standards – HL7
3. ICD-10 Coding Guidelines
4. LLM Applications in Medicine
5. AI for Clinical Decision Support
