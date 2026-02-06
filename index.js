// CLARA v2.0 - Modular Application Entry Point
// =============================================

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ragQuery, buildRAGEnhancedPrompt, MedicalKnowledgeBase } from './services/ragService.js';
import { AgenticAI, agentMemory } from './services/agenticService.js';
import { demoPatients, getDemoPatientById, getDemoPatientOptions } from './services/demoPatients.js';
import { PythonAPI, EnhancedAnalysis, ImpactTracker, DynamicFeatures } from './services/pythonIntegration.js';
import { AuthState, AuthAPI, DoctorAPI, AppointmentAPI, PrescriptionAPI, NotificationAPI, DashboardAPI, AppointmentUI } from './services/appointmentService.js';

// ============================================
// MODULE: Python Service Status
// ============================================
let pythonServiceOnline = false;

async function checkPythonService() {
    try {
        const health = await PythonAPI.healthCheck();
        pythonServiceOnline = health.status === 'healthy';
        updatePythonStatusUI();
        return pythonServiceOnline;
    } catch {
        pythonServiceOnline = false;
        updatePythonStatusUI();
        return false;
    }
}

function updatePythonStatusUI() {
    const statusDot = document.getElementById('python-status-dot');
    const statusText = document.getElementById('python-status-text');
    
    if (statusDot && statusText) {
        if (pythonServiceOnline) {
            statusDot.className = 'w-2 h-2 rounded-full bg-green-500';
            statusText.textContent = 'Python ML';
            statusText.className = 'text-xs text-green-600';
        } else {
            statusDot.className = 'w-2 h-2 rounded-full bg-red-500';
            statusText.textContent = 'Python Offline';
            statusText.className = 'text-xs text-red-600';
        }
    }
}

// ============================================
// MODULE: Icons
// ============================================
const Icons = {
    Overview: () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>`,
    Findings: () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h5m-5 4h5" /></svg>`,
    Pharmacology: () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>`,
    Data: () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>`,
    Risk: () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
    Chatbot: () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>`,
    Start: () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 10.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-4.5 4.975V19h3a.5.5 0 010 1h-7a.5.5 0 010-1h3v-1.525A5 5 0 014.5 11.5v-1a.5.5 0 01.5-.5z" /></svg>`,
    Stop: () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`,
    Save: () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>`,
    Check: () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>`,
    QRCode: () => `📱`,
    Download: () => `📥`,
    Timeline: () => `📅`
};

// ============================================
// MODULE: Schema Definition
// ============================================
const claraSchema = {
    type: Type.OBJECT,
    properties: {
        patient_id: { type: Type.STRING, description: "A unique patient identifier" },
        patient_name: { type: Type.STRING, description: "The patient's full name" },
        age: { type: Type.INTEGER, description: "The patient's age in years" },
        entities: {
            type: Type.OBJECT,
            properties: {
                DISEASE: { type: Type.ARRAY, items: { type: Type.STRING } },
                TEST: { type: Type.ARRAY, items: { type: Type.STRING } },
                DRUG: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["DISEASE", "TEST", "DRUG"],
        },
        icd10_codes: { type: Type.ARRAY, items: { type: Type.STRING } },
        risk_assessment: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER },
                level: { type: Type.STRING },
                factors: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["score", "level", "factors"],
        },
        drug_validation: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    drug_name: { type: Type.STRING },
                    validation_status: { type: Type.STRING },
                    reasoning: { type: Type.STRING }
                },
                required: ["drug_name", "validation_status", "reasoning"]
            }
        },
        side_effects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    drug_name: { type: Type.STRING },
                    effects: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                effect: { type: Type.STRING },
                                management: { type: Type.STRING }
                            },
                            required: ["effect", "management"]
                        }
                    }
                },
                required: ["drug_name", "effects"]
            }
        },
        fhir_output: {
            type: Type.OBJECT,
            properties: {
                resourceType: { type: Type.STRING },
                id: { type: Type.STRING },
                conditions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { code: { type: Type.STRING }, display: { type: Type.STRING } }, required: ["code", "display"] } },
                medications: { type: Type.ARRAY, items: { type: Type.STRING } },
                risk: { type: Type.OBJECT, properties: { level: { type: Type.STRING }, score: { type: Type.INTEGER } }, required: ["level", "score"] }
            },
            required: ["resourceType", "id", "conditions", "medications", "risk"]
        },
        chatbot_response: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                advice: { type: Type.STRING },
                disclaimer: { type: Type.STRING },
            },
            required: ["summary", "advice", "disclaimer"],
        },
        next_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["patient_id", "patient_name", "age", "entities", "icd10_codes", "risk_assessment", "drug_validation", "side_effects", "fhir_output", "chatbot_response", "next_steps"],
};

// ============================================
// MODULE: Application State
// ============================================
const AppState = {
    // Patient Information
    patientInfo: {
        name: '',
        id: '',
        age: '',
        dob: '',
        phone: '',
        email: '',
        gender: '',
        bloodGroup: ''
    },
    transcript: '',
    analysis: null,
    isLoading: false,
    error: null,
    activeView: 'overview',
    appMode: 'transcript',
    
    // Live Conversation
    isConversing: false,
    liveTranscript: [],
    liveSession: null,
    micStream: null,
    inputAudioContext: null,
    outputAudioContext: null,
    scriptProcessor: null,
    
    // Records & Stats
    records: [],
    statistics: null,
    currentRecordId: null,
    
    // RAG & Agent
    ragResults: [],
    agentTrace: []
};

// ============================================
// MODULE: Validation Utilities
// ============================================
const Validators = {
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isValidPhone: (phone) => /^[\d\s\+\-\(\)]{10,}$/.test(phone),
    isValidAge: (age) => age > 0 && age <= 150,
    isValidName: (name) => name.trim().length >= 2,
    
    validatePatientInfo: (info) => {
        const errors = {};
        if (!Validators.isValidName(info.name)) errors.name = 'Valid name required';
        if (!Validators.isValidAge(parseInt(info.age))) errors.age = 'Valid age required (1-150)';
        if (!info.dob) errors.dob = 'Date of birth required';
        if (!Validators.isValidPhone(info.phone)) errors.phone = 'Valid phone required';
        if (!Validators.isValidEmail(info.email)) errors.email = 'Valid email required';
        return { isValid: Object.keys(errors).length === 0, errors };
    },
    
    showFieldError: (fieldId, show = true) => {
        const errorEl = document.getElementById(`${fieldId}-error`);
        const inputEl = document.getElementById(`patient-${fieldId}-input`);
        if (errorEl) errorEl.classList.toggle('hidden', !show);
        if (inputEl) inputEl.classList.toggle('input-error', show);
    }
};

// ============================================
// MODULE: Patient ID Generator
// ============================================
const generatePatientId = () => {
    const prefix = 'CLR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

// ============================================
// MODULE: API Configuration
// ============================================
const API_URL = 'http://localhost:3001/api/records';

// ============================================
// MODULE: DOM Elements
// ============================================
let DOM = {};

const initDOM = () => {
    DOM = {
        // Views
        transcriptView: document.getElementById('transcript-analysis-view'),
        liveView: document.getElementById('live-conversation-view'),
        recordsView: document.getElementById('patient-records-view'),
        statisticsView: document.getElementById('statistics-view'),
        ragView: document.getElementById('rag-view'),
        
        // Mode Buttons
        transcriptModeBtn: document.getElementById('transcript-mode-btn'),
        liveModeBtn: document.getElementById('live-mode-btn'),
        recordsModeBtn: document.getElementById('records-mode-btn'),
        statisticsModeBtn: document.getElementById('statistics-mode-btn'),
        ragModeBtn: document.getElementById('rag-mode-btn'),
        
        // Patient Form
        patientNameInput: document.getElementById('patient-name-input'),
        patientIdInput: document.getElementById('patient-id-input'),
        patientAgeInput: document.getElementById('patient-age-input'),
        patientDobInput: document.getElementById('patient-dob-input'),
        patientPhoneInput: document.getElementById('patient-phone-input'),
        patientEmailInput: document.getElementById('patient-email-input'),
        patientGenderInput: document.getElementById('patient-gender-input'),
        patientBloodInput: document.getElementById('patient-blood-input'),
        transcriptInput: document.getElementById('transcript-input'),
        
        // Demo Patient
        demoPatientSelect: document.getElementById('demo-patient-select'),
        syncDemoBtn: document.getElementById('sync-demo-btn'),
        
        // Buttons
        analyzeButton: document.getElementById('analyze-button'),
        clearFormBtn: document.getElementById('clear-form-btn'),
        
        // Analysis
        analysisSection: document.getElementById('analysis-section'),
        analysisNav: document.getElementById('analysis-nav'),
        analysisOutput: document.getElementById('analysis-output'),
        placeholderSection: document.getElementById('placeholder-section'),
        
        // Live
        livePatientAgeInput: document.getElementById('live-patient-age-input'),
        liveConversationBtn: document.getElementById('live-conversation-btn'),
        liveTranscriptOutput: document.getElementById('live-transcript-output'),
        
        // Records
        recordsList: document.getElementById('records-list'),
        recordsSearch: document.getElementById('records-search'),
        recordsFilterRisk: document.getElementById('records-filter-risk'),
        exportAllBtn: document.getElementById('export-all-btn'),
        
        // Statistics
        statTotalAnalyses: document.getElementById('stat-total-analyses'),
        statAvgRisk: document.getElementById('stat-avg-risk'),
        statThisWeek: document.getElementById('stat-this-week'),
        statHighRisk: document.getElementById('stat-high-risk'),
        commonDiseasesChart: document.getElementById('common-diseases-chart'),
        riskDistributionChart: document.getElementById('risk-distribution-chart'),
        topMedicationsChart: document.getElementById('top-medications-chart'),
        weeklyTrendChart: document.getElementById('weekly-trend-chart'),
        
        // RAG
        ragSearchInput: document.getElementById('rag-search-input'),
        ragSearchBtn: document.getElementById('rag-search-btn'),
        ragResults: document.getElementById('rag-results'),
        drug1Input: document.getElementById('drug1-input'),
        drug2Input: document.getElementById('drug2-input'),
        checkInteractionBtn: document.getElementById('check-interaction-btn'),
        interactionResult: document.getElementById('interaction-result'),
        agentTrace: document.getElementById('agent-trace'),
        
        // Modals
        qrModal: document.getElementById('qr-modal'),
        qrCodeContainer: document.getElementById('qr-code-container'),
        qrLinkInput: document.getElementById('qr-link-input'),
        copyQrLinkBtn: document.getElementById('copy-qr-link'),
        closeQrModalBtn: document.getElementById('close-qr-modal'),
        timelineModal: document.getElementById('timeline-modal'),
        timelineContent: document.getElementById('timeline-content'),
        closeTimelineModalBtn: document.getElementById('close-timeline-modal')
    };
};

// ============================================
// MODULE: Render Utilities
// ============================================
const Renderer = {
    loading: () => `
        <div class="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-xl shadow-md border border-slate-200 p-8 fade-in">
            <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 class="text-xl font-semibold text-slate-700 mt-4">Analyzing with AI Agent...</h2>
            <p class="text-slate-500 mt-2 text-center">CLARA is processing clinical data using RAG-enhanced analysis.</p>
            <div id="agent-progress" class="mt-4 w-full max-w-md"></div>
        </div>`,
    
    error: (message) => `
        <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg shadow-sm fade-in" role="alert">
            <div class="flex">
                <div class="py-1">
                    <svg class="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1zM10 4a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1z" /></svg>
                </div>
                <div><p class="font-bold">Error</p><p class="text-sm">${message}</p></div>
            </div>
        </div>`,
    
    initialState: () => `
        <div class="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center fade-in">
            <div class="text-6xl mb-4">🩺</div>
            <h2 class="text-xl font-semibold text-slate-700">Ready to Analyze</h2>
            <p class="text-slate-500 mt-2">Fill in patient information and clinical transcript, then click "Analyze".</p>
            <div class="mt-4 grid grid-cols-3 gap-4 text-center">
                <div class="p-3 bg-blue-50 rounded-lg">
                    <div class="text-2xl">📝</div>
                    <p class="text-xs text-slate-600 mt-1">Enter Data</p>
                </div>
                <div class="p-3 bg-green-50 rounded-lg">
                    <div class="text-2xl">🤖</div>
                    <p class="text-xs text-slate-600 mt-1">AI Analysis</p>
                </div>
                <div class="p-3 bg-purple-50 rounded-lg">
                    <div class="text-2xl">📊</div>
                    <p class="text-xs text-slate-600 mt-1">Get Insights</p>
                </div>
            </div>
        </div>`,
    
    riskIndicator: (level, score) => {
        const levelLower = level ? level.toLowerCase() : '';
        const colors = {
            low: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
            medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
            high: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
            critical: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' }
        };
        const c = colors[levelLower] || colors.medium;
        return `<div class="inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm ${c.bg} ${c.text}"><span class="w-3 h-3 rounded-full mr-2 ${c.dot}"></span>${level} (${score}%)</div>`;
    },
    
    card: (title, icon, content) => `
        <div class="bg-white p-6 rounded-xl shadow-md border border-slate-200 fade-in">
            <div class="flex items-center mb-4">
                <div class="flex-shrink-0 bg-blue-100 text-blue-600 rounded-lg p-2 mr-4">${icon}</div>
                <h3 class="text-lg font-semibold text-slate-700">${title}</h3>
            </div>
            <div class="space-y-4">${content}</div>
        </div>`
};

// ============================================
// MODULE: Analysis Views
// ============================================
const AnalysisViews = {
    overview: (data) => {
        const saveBtn = data.isSaved
            ? `<button class="bg-green-600 text-white font-semibold py-2 px-4 rounded-md flex items-center cursor-not-allowed" disabled>${Icons.Check()} Saved</button>`
            : `<button id="save-record-btn" class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center">${Icons.Save()} Save</button>`;
        
        const actionBtns = AppState.currentRecordId ? `
            <button id="qr-code-btn" class="bg-purple-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-purple-700 transition-colors">${Icons.QRCode()}</button>
            <button id="download-pdf-btn" class="bg-slate-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-slate-700 transition-colors">${Icons.Download()}</button>
            <button id="timeline-btn" class="bg-indigo-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-indigo-700 transition-colors">${Icons.Timeline()}</button>
        ` : '';
        
        const header = `
            <div class='bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 fade-in'>
                <div class="flex justify-between items-start flex-wrap gap-3">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-800">${data.patient_name}</h2>
                        <p class="text-slate-600">ID: ${data.patient_id} · Age: ${data.age}</p>
                        ${AppState.patientInfo.email ? `<p class="text-sm text-slate-500">📧 ${AppState.patientInfo.email} · 📱 ${AppState.patientInfo.phone}</p>` : ''}
                    </div>
                    <div class="flex gap-2 flex-wrap">${saveBtn}${actionBtns}</div>
                </div>
            </div>`;
        
        const risk = Renderer.card("Risk Assessment", Icons.Risk(), `
            <div class="flex items-start space-x-4">
                ${Renderer.riskIndicator(data.risk_assessment.level, data.risk_assessment.score)}
                <div>
                    <p class="font-semibold text-slate-800">Contributing Factors:</p>
                    <ul class="list-disc list-inside text-slate-600 text-sm">
                        ${data.risk_assessment.factors.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
            </div>`);
        
        const summary = Renderer.card("AI Clinical Summary", Icons.Chatbot(), `
            <div class="space-y-3 text-slate-700">
                <p class="italic border-l-4 border-blue-400 pl-4">"${data.chatbot_response.summary}"</p>
                <p><span class="font-semibold text-blue-600">Advice:</span> ${data.chatbot_response.advice}</p>
                <p class="text-xs text-slate-500 pt-2 border-t border-slate-200 mt-2">${data.chatbot_response.disclaimer}</p>
            </div>`);
        
        const nextSteps = data.next_steps?.length > 0 ? Renderer.card("Recommended Next Steps", `📋`, `
            <ol class="list-decimal list-inside space-y-2 text-slate-700">
                ${data.next_steps.map(step => `<li class="text-sm">${step}</li>`).join('')}
            </ol>`) : '';
        
        return [header, risk, summary, nextSteps].join('');
    },
    
    findings: (data) => {
        const diseases = Renderer.card("Conditions Detected", Icons.Risk(), `
            <div class="flex flex-wrap gap-2">
                ${(data.entities.DISEASE || []).map(d => `<span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">${d}</span>`).join('')}
            </div>`);
        
        const diagnoses = Renderer.card("ICD-10 Diagnoses", Icons.Findings(), `
            <div class="space-y-2">
                ${(data.icd10_codes || []).map(code => {
                    const condition = data.fhir_output?.conditions?.find(c => c.code === code);
                    return `<div class="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                        <span class="font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm">${code}</span>
                        <span class="text-slate-700">${condition?.display || ragQuery.getICD10Description(code)}</span>
                    </div>`;
                }).join('')}
            </div>`);
        
        const tests = data.entities.TEST?.length > 0 ? Renderer.card("Tests Mentioned", `🔬`, `
            <div class="flex flex-wrap gap-2">
                ${data.entities.TEST.map(t => `<span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">${t}</span>`).join('')}
            </div>`) : '';
        
        return [diseases, diagnoses, tests].join('');
    },
    
    pharmacology: (data) => {
        const medications = Renderer.card("Medications", Icons.Pharmacology(), `
            <div class="flex flex-wrap gap-2">
                ${(data.entities.DRUG || []).map(d => `<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">${d}</span>`).join('')}
            </div>`);
        
        const validation = Renderer.card("Drug Validation", `✅`, `
            <div class="space-y-4">
                ${(data.drug_validation || []).map(v => {
                    const statusColors = {
                        'Appropriate': 'bg-green-100 text-green-800',
                        'Use with caution': 'bg-yellow-100 text-yellow-800',
                        'Contraindicated': 'bg-red-100 text-red-800'
                    };
                    return `<div class="border-b border-slate-200 pb-3 last:border-0">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-slate-800">${v.drug_name}</span>
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[v.validation_status] || 'bg-slate-100'}">${v.validation_status}</span>
                        </div>
                        <p class="text-sm text-slate-600">${v.reasoning}</p>
                    </div>`;
                }).join('')}
            </div>`);
        
        const sideEffects = Renderer.card("Side Effects & Management", `⚠️`, `
            <div class="space-y-4">
                ${(data.side_effects || []).map(s => `
                    <details class="group">
                        <summary class="flex justify-between items-center cursor-pointer p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                            <span class="font-semibold text-slate-800">${s.drug_name}</span>
                            <span class="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div class="p-3 space-y-2">
                            ${s.effects.map(e => `
                                <div class="flex items-start gap-2 text-sm">
                                    <span class="text-orange-500">•</span>
                                    <div>
                                        <span class="font-medium text-slate-700">${e.effect}</span>
                                        <p class="text-slate-500">${e.management}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                `).join('')}
            </div>`);
        
        return [medications, validation, sideEffects].join('');
    },
    
    data: (data) => {
        const cleanData = { ...data };
        delete cleanData.isSaved;
        
        return `
            <div class="bg-slate-800 rounded-xl shadow-md border border-slate-700 fade-in">
                <div class="flex justify-between items-center p-4 border-b border-slate-700">
                    <span class="text-slate-300 font-semibold">Raw JSON Output</span>
                    <button id="copy-json-btn" class="text-xs bg-slate-600 text-white px-3 py-1 rounded hover:bg-slate-500">📋 Copy</button>
                </div>
                <pre class="text-sm p-4 overflow-x-auto text-green-300"><code>${JSON.stringify(cleanData, null, 2)}</code></pre>
            </div>`;
    }
};

// ============================================
// MODULE: Gemini AI Service
// ============================================
const AIService = {
    analyzeTranscript: async (transcript, patientInfo) => {
        if (!window.process?.env?.API_KEY || window.process.env.API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
            throw new Error("API Key not configured. Please configure env.js.");
        }
        
        const apiKey = window.process.env.API_KEY;
        const ai = new GoogleGenAI({ apiKey });
        
        // Build RAG-enhanced prompt
        const ragContext = {
            drugInteractions: [],
            diseaseInfo: null
        };
        
        // Extract potential drugs from transcript for RAG lookup
        const drugMatches = transcript.match(/\b(metformin|aspirin|warfarin|amlodipine|atorvastatin|lisinopril)\b/gi) || [];
        if (drugMatches.length >= 2) {
            const interaction = ragQuery.checkDrugInteraction(drugMatches[0], drugMatches[1]);
            if (interaction.severity !== 'low') {
                ragContext.drugInteractions.push(interaction);
            }
        }
        
        const enhancedPrompt = buildRAGEnhancedPrompt(transcript, patientInfo, ragContext);
        
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: enhancedPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: claraSchema,
                },
            });
            
            const jsonString = response.text.trim();
            const parsedData = JSON.parse(jsonString);
            
            // Override with user-provided info
            if (patientInfo.name) parsedData.patient_name = patientInfo.name;
            if (patientInfo.age) parsedData.age = parseInt(patientInfo.age);
            if (patientInfo.id) parsedData.patient_id = patientInfo.id;
            
            return parsedData;
        } catch (error) {
            console.error("AI Analysis Error:", error);
            const msg = error?.message || error?.toString() || "Unknown error";
            throw new Error(`AI Analysis failed: ${msg}`);
        }
    }
};

// ============================================
// MODULE: Records Management
// ============================================
const RecordsManager = {
    load: async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch records');
            
            const serverRecords = await response.json();
            AppState.records = serverRecords.map(record => ({
                id: record._id,
                savedAt: record.createdAt,
                analysis: record.analysis
            }));
        } catch (error) {
            console.error('Error loading records:', error);
            AppState.records = [];
        }
    },
    
    save: async () => {
        if (!AppState.analysis || AppState.analysis.isSaved) return;
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...AppState.analysis,
                    patientInfo: AppState.patientInfo
                }),
            });
            
            if (!response.ok) throw new Error('Failed to save record');
            
            const savedRecord = await response.json();
            AppState.analysis.isSaved = true;
            AppState.currentRecordId = savedRecord._id;
            
            // Add to agent memory
            agentMemory.addToPatientHistory(AppState.patientInfo.id, {
                analysis: AppState.analysis,
                patientInfo: AppState.patientInfo
            });
            
            await RecordsManager.load();
            render();
        } catch (error) {
            console.error('Error saving record:', error);
            alert('Could not save record. Is the backend running?');
        }
    },
    
    delete: async (recordId) => {
        if (!confirm('Delete this record? This cannot be undone.')) return;
        
        try {
            const response = await fetch(`${API_URL}/${recordId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            
            AppState.records = AppState.records.filter(r => r.id !== recordId);
            render();
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Could not delete record.');
        }
    },
    
    view: (recordId) => {
        const record = AppState.records.find(r => r.id === recordId);
        if (record) {
            AppState.analysis = { ...record.analysis, isSaved: true };
            AppState.currentRecordId = recordId;
            AppState.patientInfo = record.analysis.patientInfo || {
                name: record.analysis.patient_name,
                age: record.analysis.age,
                id: record.analysis.patient_id
            };
            AppState.appMode = 'transcript';
            AppState.activeView = 'overview';
            render();
        }
    },
    
    filter: (searchTerm, riskLevel) => {
        let filtered = [...AppState.records];
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(r => 
                r.analysis.patient_name?.toLowerCase().includes(term) ||
                r.analysis.patient_id?.toLowerCase().includes(term)
            );
        }
        
        if (riskLevel) {
            filtered = filtered.filter(r => 
                r.analysis.risk_assessment?.level?.toLowerCase() === riskLevel
            );
        }
        
        return filtered;
    },
    
    exportAll: () => {
        const data = JSON.stringify(AppState.records, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CLARA_Records_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// ============================================
// MODULE: Statistics
// ============================================
const StatisticsManager = {
    load: async () => {
        try {
            const response = await fetch(`${API_URL.replace('/records', '/statistics/dashboard')}`);
            if (!response.ok) throw new Error('Failed to fetch statistics');
            AppState.statistics = await response.json();
        } catch (error) {
            console.error('Error loading statistics:', error);
            AppState.statistics = null;
        }
    },
    
    render: () => {
        if (!AppState.statistics) return;
        
        const stats = AppState.statistics;
        
        DOM.statTotalAnalyses.textContent = stats.allTime?.totalAnalyses || 0;
        DOM.statAvgRisk.textContent = Math.round(stats.allTime?.averageRiskScore || 0) + '%';
        DOM.statThisWeek.textContent = stats.currentWeek?.totalAnalyses || 0;
        DOM.statHighRisk.textContent = (stats.allTime?.riskLevels?.high || 0) + (stats.allTime?.riskLevels?.critical || 0);
        
        // Render charts
        StatisticsManager.renderChart(DOM.commonDiseasesChart, stats.allTime?.topDiseases, 'blue');
        StatisticsManager.renderChart(DOM.topMedicationsChart, stats.allTime?.topMedications, 'purple');
        StatisticsManager.renderRiskChart(DOM.riskDistributionChart, stats.allTime?.riskLevels);
        StatisticsManager.renderTrendChart(DOM.weeklyTrendChart, stats.recentWeeks);
    },
    
    renderChart: (container, data, color) => {
        if (!data?.length) {
            container.innerHTML = '<p class="text-slate-500 text-center py-8">No data available</p>';
            return;
        }
        
        const maxCount = Math.max(...data.map(d => d.count));
        container.innerHTML = data.slice(0, 8).map(item => `
            <div class="flex items-center">
                <span class="w-28 text-sm text-slate-600 truncate">${item.name}</span>
                <div class="flex-1 mx-2">
                    <div class="bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div class="bg-${color}-500 h-full rounded-full" style="width: ${(item.count / maxCount) * 100}%"></div>
                    </div>
                </div>
                <span class="w-8 text-sm font-semibold text-slate-700 text-right">${item.count}</span>
            </div>
        `).join('');
    },
    
    renderRiskChart: (container, riskLevels) => {
        if (!riskLevels) {
            container.innerHTML = '<p class="text-slate-500 text-center py-8">No data available</p>';
            return;
        }
        
        const total = Object.values(riskLevels).reduce((a, b) => a + b, 0);
        if (total === 0) {
            container.innerHTML = '<p class="text-slate-500 text-center py-8">No data available</p>';
            return;
        }
        
        const colors = { low: '#22c55e', medium: '#eab308', high: '#f97316', critical: '#ef4444' };
        const labels = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
        
        container.innerHTML = Object.entries(riskLevels).map(([level, count]) => `
            <div class="flex items-center">
                <span class="w-20 text-sm text-slate-600 flex items-center">
                    <span class="w-3 h-3 rounded-full mr-2" style="background-color: ${colors[level]}"></span>
                    ${labels[level]}
                </span>
                <div class="flex-1 mx-2">
                    <div class="bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div class="h-full rounded-full" style="background-color: ${colors[level]}; width: ${(count / total) * 100}%"></div>
                    </div>
                </div>
                <span class="w-16 text-sm font-semibold text-slate-700 text-right">${count} (${Math.round((count / total) * 100)}%)</span>
            </div>
        `).join('');
    },
    
    renderTrendChart: (container, weeks) => {
        if (!weeks?.length) {
            container.innerHTML = '<p class="text-slate-500 text-center py-8">No data available</p>';
            return;
        }
        
        const maxWeekly = Math.max(...weeks.map(w => w.totalAnalyses || 0), 1);
        container.innerHTML = weeks.slice().reverse().map(week => `
            <div class="flex items-center">
                <span class="w-20 text-sm text-slate-600">Week ${week.weekNumber}</span>
                <div class="flex-1 mx-2">
                    <div class="bg-slate-200 rounded-full h-4 overflow-hidden">
                        <div class="bg-green-500 h-full rounded-full" style="width: ${(week.totalAnalyses / maxWeekly) * 100}%"></div>
                    </div>
                </div>
                <span class="w-16 text-sm font-semibold text-slate-700 text-right">${week.totalAnalyses}</span>
            </div>
        `).join('');
    }
};

// ============================================
// MODULE: Appointment Manager
// ============================================
const AppointmentManager = {
    doctors: [],
    appointments: [],
    selectedDoctor: null,
    availableSlots: [],
    
    init: async () => {
        AppointmentManager.updateAuthUI();
        await AppointmentManager.loadDoctors();
        if (AuthState.isLoggedIn()) {
            await AppointmentManager.loadAppointments();
        }
        AppointmentManager.setupEventListeners();
        
        // Set minimum date to today
        const dateInput = document.getElementById('apt-date-input');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
        }
    },
    
    updateAuthUI: () => {
        const userNameEl = document.getElementById('auth-user-name');
        const userRoleEl = document.getElementById('auth-user-role');
        const authButtons = document.getElementById('auth-buttons');
        const logoutBtn = document.getElementById('logout-btn');
        const bookBtn = document.getElementById('book-appointment-btn');
        
        if (AuthState.isLoggedIn()) {
            userNameEl.textContent = `${AuthState.user.firstName} ${AuthState.user.lastName}`;
            userRoleEl.textContent = AuthState.user.role.charAt(0).toUpperCase() + AuthState.user.role.slice(1);
            authButtons?.classList.add('hidden');
            logoutBtn?.classList.remove('hidden');
            bookBtn.disabled = false;
        } else {
            userNameEl.textContent = 'Not logged in';
            userRoleEl.textContent = 'Please login to book appointments';
            authButtons?.classList.remove('hidden');
            logoutBtn?.classList.add('hidden');
            bookBtn.disabled = true;
        }
    },
    
    loadDoctors: async () => {
        try {
            const data = await DoctorAPI.getAll();
            AppointmentManager.doctors = data.doctors || [];
            
            const select = document.getElementById('apt-doctor-select');
            if (select) {
                select.innerHTML = '<option value="">Choose a doctor...</option>' +
                    AppointmentManager.doctors.map(d => 
                        `<option value="${d._id}">Dr. ${d.userId?.firstName} ${d.userId?.lastName} - ${d.specialization} (₹${d.consultationFee})</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
            AppointmentUI.showToast('Failed to load doctors', 'error');
        }
    },
    
    loadAppointments: async () => {
        try {
            const data = await AppointmentAPI.getAll();
            AppointmentManager.appointments = data.appointments || [];
            AppointmentManager.renderAppointments();
            AppointmentManager.updateStats();
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    },
    
    renderAppointments: () => {
        const container = document.getElementById('appointments-list');
        const filterStatus = document.getElementById('apt-filter-status')?.value;
        
        let filtered = AppointmentManager.appointments;
        if (filterStatus) {
            filtered = filtered.filter(apt => apt.status === filterStatus);
        }
        
        if (!filtered.length) {
            container.innerHTML = `
                <div class="text-center py-8 text-slate-500">
                    <div class="text-4xl mb-2">📅</div>
                    <p>No appointments found. Book your first appointment above!</p>
                </div>
            `;
            return;
        }
        
        const isDoctor = AuthState.isDoctor();
        container.innerHTML = filtered.map(apt => 
            AppointmentUI.renderAppointmentCard(apt, isDoctor)
        ).join('');
    },
    
    updateStats: () => {
        const apts = AppointmentManager.appointments;
        document.getElementById('apt-upcoming-count').textContent = 
            apts.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length;
        document.getElementById('apt-completed-count').textContent = 
            apts.filter(a => a.status === 'completed').length;
        document.getElementById('apt-cancelled-count').textContent = 
            apts.filter(a => a.status === 'cancelled').length;
    },
    
    onDoctorSelect: async (doctorId) => {
        AppointmentManager.selectedDoctor = AppointmentManager.doctors.find(d => d._id === doctorId);
        
        const feeDisplay = document.getElementById('apt-fee-display');
        const feeAmount = document.getElementById('apt-fee-amount');
        const typeSelect = document.getElementById('apt-type-select');
        
        if (AppointmentManager.selectedDoctor) {
            const fee = typeSelect?.value === 'followup' 
                ? AppointmentManager.selectedDoctor.followUpFee 
                : AppointmentManager.selectedDoctor.consultationFee;
            feeAmount.textContent = `₹${fee}`;
            feeDisplay.classList.remove('hidden');
            
            // Check availability for selected date
            const dateInput = document.getElementById('apt-date-input');
            if (dateInput?.value) {
                await AppointmentManager.checkAvailability(dateInput.value);
            }
        } else {
            feeDisplay.classList.add('hidden');
        }
    },
    
    checkAvailability: async (date) => {
        const doctorId = document.getElementById('apt-doctor-select')?.value;
        const slotSelect = document.getElementById('apt-slot-select');
        
        if (!doctorId || !date) {
            slotSelect.innerHTML = '<option value="">Select doctor and date...</option>';
            slotSelect.disabled = true;
            return;
        }
        
        try {
            slotSelect.innerHTML = '<option value="">Loading slots...</option>';
            const data = await DoctorAPI.getAvailability(doctorId, date);
            
            if (!data.available || !data.slots.length) {
                slotSelect.innerHTML = `<option value="">${data.reason || 'No slots available'}</option>`;
                slotSelect.disabled = true;
                return;
            }
            
            const availableSlots = data.slots.filter(s => s.available);
            if (!availableSlots.length) {
                slotSelect.innerHTML = '<option value="">All slots booked</option>';
                slotSelect.disabled = true;
                return;
            }
            
            AppointmentManager.availableSlots = availableSlots;
            slotSelect.innerHTML = '<option value="">Select a time slot...</option>' +
                availableSlots.map(slot => 
                    `<option value="${slot.startTime}">${AppointmentUI.formatTime(slot.startTime)} - ${AppointmentUI.formatTime(slot.endTime)}</option>`
                ).join('');
            slotSelect.disabled = false;
        } catch (error) {
            console.error('Error checking availability:', error);
            slotSelect.innerHTML = '<option value="">Error loading slots</option>';
            slotSelect.disabled = true;
        }
    },
    
    bookAppointment: async () => {
        const doctorId = document.getElementById('apt-doctor-select')?.value;
        const date = document.getElementById('apt-date-input')?.value;
        const startTime = document.getElementById('apt-slot-select')?.value;
        const type = document.getElementById('apt-type-select')?.value;
        const reason = document.getElementById('apt-reason-input')?.value;
        const symptoms = document.getElementById('apt-symptoms-input')?.value;
        
        if (!doctorId || !date || !startTime || !reason) {
            AppointmentUI.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        try {
            const slot = AppointmentManager.availableSlots.find(s => s.startTime === startTime);
            
            await AppointmentAPI.book({
                doctorId,
                appointmentDate: date,
                startTime,
                endTime: slot?.endTime,
                appointmentType: type,
                reason,
                symptoms: symptoms ? symptoms.split(',').map(s => s.trim()) : []
            });
            
            AppointmentUI.showToast('Appointment booked successfully!', 'success');
            
            // Clear form
            document.getElementById('apt-reason-input').value = '';
            document.getElementById('apt-symptoms-input').value = '';
            document.getElementById('apt-slot-select').value = '';
            
            // Reload appointments
            await AppointmentManager.loadAppointments();
        } catch (error) {
            AppointmentUI.showToast(error.message || 'Failed to book appointment', 'error');
        }
    },
    
    setupEventListeners: () => {
        // Auth buttons
        document.getElementById('show-login-btn')?.addEventListener('click', () => {
            document.getElementById('login-modal')?.classList.remove('hidden');
        });
        
        document.getElementById('show-register-btn')?.addEventListener('click', () => {
            document.getElementById('register-modal')?.classList.remove('hidden');
        });
        
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            AuthAPI.logout();
            AppointmentManager.updateAuthUI();
            AppointmentManager.appointments = [];
            AppointmentManager.renderAppointments();
            AppointmentUI.showToast('Logged out successfully', 'info');
        });
        
        // Booking form
        document.getElementById('apt-doctor-select')?.addEventListener('change', (e) => {
            AppointmentManager.onDoctorSelect(e.target.value);
        });
        
        document.getElementById('apt-date-input')?.addEventListener('change', (e) => {
            AppointmentManager.checkAvailability(e.target.value);
        });
        
        document.getElementById('apt-type-select')?.addEventListener('change', () => {
            const doctor = AppointmentManager.selectedDoctor;
            if (doctor) {
                const type = document.getElementById('apt-type-select')?.value;
                const fee = type === 'followup' ? doctor.followUpFee : doctor.consultationFee;
                document.getElementById('apt-fee-amount').textContent = `₹${fee}`;
            }
        });
        
        document.getElementById('book-appointment-btn')?.addEventListener('click', () => {
            AppointmentManager.bookAppointment();
        });
        
        document.getElementById('apt-filter-status')?.addEventListener('change', () => {
            AppointmentManager.renderAppointments();
        });
    }
};

// ============================================
// MODULE: Doctor Manager
// ============================================
const DoctorManager = {
    doctors: [],
    specializations: [],
    
    init: async () => {
        await DoctorManager.loadSpecializations();
        await DoctorManager.loadDoctors();
        DoctorManager.setupEventListeners();
    },
    
    loadSpecializations: async () => {
        try {
            const data = await DoctorAPI.getSpecializations();
            DoctorManager.specializations = data || [];
            
            const select = document.getElementById('doc-specialization-filter');
            if (select) {
                select.innerHTML = '<option value="">All Specializations</option>' +
                    DoctorManager.specializations.map(s => 
                        `<option value="${s.name}">${s.name} (${s.doctorCount})</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Error loading specializations:', error);
        }
    },
    
    loadDoctors: async (params = {}) => {
        try {
            const data = await DoctorAPI.getAll(params);
            DoctorManager.doctors = data.doctors || [];
            DoctorManager.renderDoctors();
        } catch (error) {
            console.error('Error loading doctors:', error);
            document.getElementById('doctors-grid').innerHTML = `
                <div class="col-span-full text-center py-8 text-red-500">
                    <div class="text-4xl mb-2">❌</div>
                    <p>Failed to load doctors. Please try again.</p>
                </div>
            `;
        }
    },
    
    renderDoctors: () => {
        const container = document.getElementById('doctors-grid');
        
        if (!DoctorManager.doctors.length) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8 text-slate-500">
                    <div class="text-4xl mb-2">👨‍⚕️</div>
                    <p>No doctors found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = DoctorManager.doctors.map(doctor => 
            AppointmentUI.renderDoctorCard(doctor)
        ).join('');
    },
    
    search: async () => {
        const search = document.getElementById('doc-search-input')?.value;
        const specialization = document.getElementById('doc-specialization-filter')?.value;
        const date = document.getElementById('doc-availability-date')?.value;
        
        const params = {};
        if (search) params.search = search;
        if (specialization) params.specialization = specialization;
        if (date) {
            params.date = date;
            params.available = 'true';
        }
        
        await DoctorManager.loadDoctors(params);
    },
    
    setupEventListeners: () => {
        document.getElementById('doc-search-btn')?.addEventListener('click', () => {
            DoctorManager.search();
        });
        
        document.getElementById('doc-search-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') DoctorManager.search();
        });
        
        document.getElementById('doc-specialization-filter')?.addEventListener('change', () => {
            DoctorManager.search();
        });
    }
};

// ============================================
// MODULE: Prescription Manager
// ============================================
const PrescriptionManager = {
    prescriptions: [],
    diagnosisList: [],
    medicationsList: [],
    
    init: async () => {
        if (AuthState.isLoggedIn()) {
            await PrescriptionManager.loadPrescriptions();
        }
        
        // Show prescription form for doctors
        if (AuthState.isDoctor()) {
            document.getElementById('prescription-form-section')?.classList.remove('hidden');
            await PrescriptionManager.loadPatients();
        }
        
        PrescriptionManager.setupEventListeners();
    },
    
    loadPrescriptions: async () => {
        try {
            const data = await PrescriptionAPI.getAll();
            PrescriptionManager.prescriptions = data.prescriptions || [];
            PrescriptionManager.renderPrescriptions();
        } catch (error) {
            console.error('Error loading prescriptions:', error);
        }
    },
    
    loadPatients: async () => {
        try {
            const data = await DashboardAPI.getPatients();
            const select = document.getElementById('rx-patient-select');
            if (select && data.patients) {
                select.innerHTML = '<option value="">Select patient...</option>' +
                    data.patients.map(p => 
                        `<option value="${p._id}">${p.firstName} ${p.lastName}</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    },
    
    renderPrescriptions: () => {
        const container = document.getElementById('prescriptions-list');
        const search = document.getElementById('rx-search-input')?.value?.toLowerCase();
        
        let filtered = PrescriptionManager.prescriptions;
        if (search) {
            filtered = filtered.filter(rx => 
                rx.prescriptionId?.toLowerCase().includes(search) ||
                rx.diagnosis?.some(d => d.condition?.toLowerCase().includes(search)) ||
                rx.medications?.some(m => m.name?.toLowerCase().includes(search))
            );
        }
        
        if (!filtered.length) {
            container.innerHTML = `
                <div class="text-center py-8 text-slate-500">
                    <div class="text-4xl mb-2">💊</div>
                    <p>No prescriptions found.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filtered.map(rx => 
            AppointmentUI.renderPrescriptionCard(rx)
        ).join('');
    },
    
    addDiagnosis: () => {
        const condition = document.getElementById('diagnosis-input')?.value;
        const icdCode = document.getElementById('icd-input')?.value;
        const severity = document.getElementById('severity-input')?.value;
        
        if (!condition) return;
        
        PrescriptionManager.diagnosisList.push({ condition, icdCode, severity });
        PrescriptionManager.renderDiagnosisList();
        
        document.getElementById('diagnosis-input').value = '';
        document.getElementById('icd-input').value = '';
    },
    
    renderDiagnosisList: () => {
        const container = document.getElementById('diagnosis-list');
        container.innerHTML = PrescriptionManager.diagnosisList.map((d, i) => `
            <div class="flex items-center justify-between bg-red-50 p-2 rounded">
                <span class="text-sm">${d.condition} ${d.icdCode ? `(${d.icdCode})` : ''} - ${d.severity}</span>
                <button onclick="PrescriptionManager.removeDiagnosis(${i})" class="text-red-500 hover:text-red-700">×</button>
            </div>
        `).join('');
    },
    
    removeDiagnosis: (index) => {
        PrescriptionManager.diagnosisList.splice(index, 1);
        PrescriptionManager.renderDiagnosisList();
    },
    
    addMedication: () => {
        const name = document.getElementById('med-name-input')?.value;
        const dosage = document.getElementById('med-dosage-input')?.value;
        const frequency = document.getElementById('med-frequency-input')?.value;
        const duration = document.getElementById('med-duration-input')?.value;
        
        if (!name) return;
        
        PrescriptionManager.medicationsList.push({ name, dosage, frequency, duration });
        PrescriptionManager.renderMedicationsList();
        
        document.getElementById('med-name-input').value = '';
        document.getElementById('med-dosage-input').value = '';
        document.getElementById('med-frequency-input').value = '';
        document.getElementById('med-duration-input').value = '';
    },
    
    renderMedicationsList: () => {
        const container = document.getElementById('medications-list');
        container.innerHTML = PrescriptionManager.medicationsList.map((m, i) => `
            <div class="flex items-center justify-between bg-green-50 p-2 rounded">
                <span class="text-sm">${m.name} ${m.dosage} - ${m.frequency} for ${m.duration}</span>
                <button onclick="PrescriptionManager.removeMedication(${i})" class="text-red-500 hover:text-red-700">×</button>
            </div>
        `).join('');
    },
    
    removeMedication: (index) => {
        PrescriptionManager.medicationsList.splice(index, 1);
        PrescriptionManager.renderMedicationsList();
    },
    
    createPrescription: async () => {
        const patientId = document.getElementById('rx-patient-select')?.value;
        const appointmentId = document.getElementById('rx-appointment-select')?.value;
        const advice = document.getElementById('rx-advice-input')?.value;
        const followUpDate = document.getElementById('rx-followup-date')?.value;
        const followUpInstructions = document.getElementById('rx-followup-instructions')?.value;
        
        if (!patientId || !PrescriptionManager.diagnosisList.length || !PrescriptionManager.medicationsList.length) {
            AppointmentUI.showToast('Please fill in patient, diagnosis, and medications', 'error');
            return;
        }
        
        try {
            const result = await PrescriptionAPI.create({
                patientId,
                appointmentId: appointmentId || undefined,
                diagnosis: PrescriptionManager.diagnosisList,
                medications: PrescriptionManager.medicationsList,
                advice: advice ? advice.split('\n').filter(a => a.trim()) : [],
                followUpDate,
                followUpInstructions
            });
            
            AppointmentUI.showToast('Prescription created successfully!', 'success');
            
            // Show warnings if any
            if (result.warnings?.length) {
                const warningContainer = document.getElementById('drug-interaction-warning');
                const warningContent = document.getElementById('drug-warnings-content');
                warningContainer.classList.remove('hidden');
                warningContent.innerHTML = result.warnings.map(w => `<p>${w}</p>`).join('');
            }
            
            // Clear form
            PrescriptionManager.diagnosisList = [];
            PrescriptionManager.medicationsList = [];
            PrescriptionManager.renderDiagnosisList();
            PrescriptionManager.renderMedicationsList();
            document.getElementById('rx-patient-select').value = '';
            document.getElementById('rx-advice-input').value = '';
            
            // Reload prescriptions
            await PrescriptionManager.loadPrescriptions();
        } catch (error) {
            AppointmentUI.showToast(error.message || 'Failed to create prescription', 'error');
        }
    },
    
    setupEventListeners: () => {
        document.getElementById('add-diagnosis-btn')?.addEventListener('click', () => {
            PrescriptionManager.addDiagnosis();
        });
        
        document.getElementById('add-medication-btn')?.addEventListener('click', () => {
            PrescriptionManager.addMedication();
        });
        
        document.getElementById('create-prescription-btn')?.addEventListener('click', () => {
            PrescriptionManager.createPrescription();
        });
        
        document.getElementById('rx-search-input')?.addEventListener('input', () => {
            PrescriptionManager.renderPrescriptions();
        });
    }
};

// ============================================
// MODULE: Auth Modal Handlers
// ============================================
const AuthModalHandler = {
    init: () => {
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;
            const errorDiv = document.getElementById('login-error');
            
            try {
                errorDiv?.classList.add('hidden');
                await AuthAPI.login(email, password);
                document.getElementById('login-modal')?.classList.add('hidden');
                AppointmentUI.showToast('Login successful!', 'success');
                
                // Refresh current view
                if (AppState.appMode === 'appointments') AppointmentManager.init();
                else if (AppState.appMode === 'prescriptions') PrescriptionManager.init();
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv?.classList.remove('hidden');
            }
        });
        
        // Register form
        document.getElementById('register-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const firstName = document.getElementById('register-firstname')?.value;
            const lastName = document.getElementById('register-lastname')?.value;
            const email = document.getElementById('register-email')?.value;
            const phone = document.getElementById('register-phone')?.value;
            const password = document.getElementById('register-password')?.value;
            const role = document.getElementById('register-role')?.value;
            const errorDiv = document.getElementById('register-error');
            
            try {
                errorDiv?.classList.add('hidden');
                await AuthAPI.register({ firstName, lastName, email, phone, password, role });
                document.getElementById('register-modal')?.classList.add('hidden');
                AppointmentUI.showToast('Registration successful!', 'success');
                
                // Refresh current view
                if (AppState.appMode === 'appointments') AppointmentManager.init();
                else if (AppState.appMode === 'prescriptions') PrescriptionManager.init();
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv?.classList.remove('hidden');
            }
        });
        
        // Modal close buttons
        document.getElementById('close-login-modal')?.addEventListener('click', () => {
            document.getElementById('login-modal')?.classList.add('hidden');
        });
        
        document.getElementById('close-register-modal')?.addEventListener('click', () => {
            document.getElementById('register-modal')?.classList.add('hidden');
        });
        
        // Switch between modals
        document.getElementById('switch-to-register')?.addEventListener('click', () => {
            document.getElementById('login-modal')?.classList.add('hidden');
            document.getElementById('register-modal')?.classList.remove('hidden');
        });
        
        document.getElementById('switch-to-login')?.addEventListener('click', () => {
            document.getElementById('register-modal')?.classList.add('hidden');
            document.getElementById('login-modal')?.classList.remove('hidden');
        });
        
        // Close modals on background click
        document.getElementById('login-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'login-modal') e.target.classList.add('hidden');
        });
        
        document.getElementById('register-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'register-modal') e.target.classList.add('hidden');
        });
    }
};

// ============================================
// MODULE: Detail Modal Handlers
// ============================================
window.showDoctorDetail = async (doctorId) => {
    try {
        const data = await DoctorAPI.getById(doctorId);
        const doctor = data.doctor;
        const reviews = data.reviews || [];
        const user = doctor.userId;
        
        document.getElementById('doc-modal-name').textContent = `Dr. ${user?.firstName} ${user?.lastName}`;
        document.getElementById('doc-modal-specialization').textContent = doctor.specialization;
        document.getElementById('doc-modal-rating').textContent = `⭐ ${doctor.averageRating?.toFixed(1) || 'New'}`;
        document.getElementById('doc-modal-reviews').textContent = `${doctor.totalReviews || 0} reviews`;
        document.getElementById('doc-modal-experience').textContent = `${doctor.experience || 0} years`;
        document.getElementById('doc-modal-fee').textContent = `₹${doctor.consultationFee}`;
        document.getElementById('doc-modal-bio').textContent = doctor.bio || 'No bio available.';
        
        const qualsContainer = document.getElementById('doc-modal-qualifications');
        qualsContainer.innerHTML = doctor.qualifications?.length 
            ? doctor.qualifications.map(q => `<li>${q.degree} - ${q.institution} (${q.year})</li>`).join('')
            : '<li>Qualifications not listed</li>';
        
        const reviewsContainer = document.getElementById('doc-modal-reviews-list');
        reviewsContainer.innerHTML = reviews.length 
            ? reviews.map(r => `
                <div class="bg-slate-50 p-3 rounded-lg">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-medium text-sm">${r.isAnonymous ? 'Anonymous' : `${r.patientId?.firstName}`}</span>
                        <span class="text-yellow-500 text-sm">${'⭐'.repeat(r.rating)}</span>
                    </div>
                    <p class="text-sm text-slate-600">${r.review || 'No comment'}</p>
                </div>
            `).join('')
            : '<p class="text-slate-500 text-sm">No reviews yet</p>';
        
        // Book button handler
        document.getElementById('book-from-modal-btn').onclick = () => {
            document.getElementById('doctor-detail-modal').classList.add('hidden');
            handleModeSwitch('appointments');
            setTimeout(() => {
                document.getElementById('apt-doctor-select').value = doctorId;
                AppointmentManager.onDoctorSelect(doctorId);
            }, 100);
        };
        
        document.getElementById('doctor-detail-modal')?.classList.remove('hidden');
    } catch (error) {
        AppointmentUI.showToast('Failed to load doctor details', 'error');
    }
};

window.showAppointmentDetail = async (appointmentId) => {
    try {
        const apt = await AppointmentAPI.getById(appointmentId);
        const doctor = apt.doctorId;
        const doctorUser = doctor?.userId;
        
        document.getElementById('apt-modal-id').textContent = apt.appointmentId;
        
        const content = document.getElementById('apt-modal-content');
        content.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-50 p-3 rounded-lg">
                    <p class="text-xs text-slate-500">Doctor</p>
                    <p class="font-semibold">Dr. ${doctorUser?.firstName} ${doctorUser?.lastName}</p>
                    <p class="text-sm text-blue-600">${doctor?.specialization}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded-lg">
                    <p class="text-xs text-slate-500">Status</p>
                    ${AppointmentUI.getStatusBadge(apt.status)}
                </div>
                <div class="bg-slate-50 p-3 rounded-lg">
                    <p class="text-xs text-slate-500">Date & Time</p>
                    <p class="font-semibold">${AppointmentUI.formatDate(apt.appointmentDate)}</p>
                    <p class="text-sm">${AppointmentUI.formatTime(apt.timeSlot.startTime)}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded-lg">
                    <p class="text-xs text-slate-500">Fee</p>
                    <p class="font-semibold text-green-600">₹${apt.fee || 0}</p>
                </div>
            </div>
            <div class="bg-slate-50 p-3 rounded-lg mt-4">
                <p class="text-xs text-slate-500">Reason for Visit</p>
                <p class="text-sm">${apt.reason}</p>
            </div>
            ${apt.symptoms?.length ? `
                <div class="bg-slate-50 p-3 rounded-lg">
                    <p class="text-xs text-slate-500">Symptoms</p>
                    <div class="flex flex-wrap gap-1 mt-1">
                        ${apt.symptoms.map(s => `<span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">${s}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        // Update buttons based on status
        const rescheduleBtn = document.getElementById('apt-reschedule-btn');
        const cancelBtn = document.getElementById('apt-cancel-btn');
        
        const canModify = !['completed', 'cancelled', 'in-progress'].includes(apt.status);
        rescheduleBtn.style.display = canModify ? 'block' : 'none';
        cancelBtn.style.display = canModify ? 'block' : 'none';
        
        // Reschedule handler
        rescheduleBtn.onclick = async () => {
            const newDate = prompt('Enter new date (YYYY-MM-DD):');
            const newTime = prompt('Enter new time (HH:MM):');
            if (newDate && newTime) {
                try {
                    await AppointmentAPI.reschedule(apt._id, { newDate, newStartTime: newTime });
                    AppointmentUI.showToast('Appointment rescheduled!', 'success');
                    document.getElementById('appointment-detail-modal').classList.add('hidden');
                    AppointmentManager.loadAppointments();
                } catch (error) {
                    AppointmentUI.showToast(error.message, 'error');
                }
            }
        };
        
        // Cancel handler
        cancelBtn.onclick = async () => {
            if (confirm('Are you sure you want to cancel this appointment?')) {
                const reason = prompt('Please provide a reason for cancellation:');
                try {
                    await AppointmentAPI.cancel(apt._id, reason);
                    AppointmentUI.showToast('Appointment cancelled', 'info');
                    document.getElementById('appointment-detail-modal').classList.add('hidden');
                    AppointmentManager.loadAppointments();
                } catch (error) {
                    AppointmentUI.showToast(error.message, 'error');
                }
            }
        };
        
        document.getElementById('appointment-detail-modal')?.classList.remove('hidden');
    } catch (error) {
        AppointmentUI.showToast('Failed to load appointment details', 'error');
    }
};

window.showPrescriptionDetail = async (prescriptionId) => {
    try {
        const rx = await PrescriptionAPI.getById(prescriptionId);
        const doctor = rx.doctorId;
        const doctorUser = doctor?.userId;
        
        document.getElementById('rx-modal-id').textContent = rx.prescriptionId;
        
        const content = document.getElementById('rx-modal-content');
        content.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-slate-50 p-3 rounded-lg">
                    <p class="text-xs text-slate-500">Prescribed by</p>
                    <p class="font-semibold">Dr. ${doctorUser?.firstName} ${doctorUser?.lastName}</p>
                </div>
                <div class="bg-slate-50 p-3 rounded-lg">
                    <p class="text-xs text-slate-500">Date</p>
                    <p class="font-semibold">${AppointmentUI.formatDate(rx.createdAt)}</p>
                </div>
            </div>
            
            <div class="mt-4">
                <h4 class="font-semibold text-slate-800 mb-2">Diagnosis</h4>
                <div class="space-y-1">
                    ${rx.diagnosis?.map(d => `
                        <div class="bg-red-50 p-2 rounded">
                            <span class="font-medium">${d.condition}</span>
                            ${d.icdCode ? `<span class="text-slate-500 text-sm">(${d.icdCode})</span>` : ''}
                            <span class="text-sm text-slate-600">- ${d.severity}</span>
                        </div>
                    `).join('') || '<p class="text-slate-500">No diagnosis recorded</p>'}
                </div>
            </div>
            
            <div class="mt-4">
                <h4 class="font-semibold text-slate-800 mb-2">Medications (Rx)</h4>
                <div class="space-y-2">
                    ${rx.medications?.map((m, i) => `
                        <div class="bg-green-50 p-3 rounded border-l-4 border-green-500">
                            <p class="font-medium">${i + 1}. ${m.name} ${m.dosage || ''}</p>
                            <p class="text-sm text-slate-600">${m.frequency || ''} for ${m.duration || 'as directed'}</p>
                            ${m.instructions ? `<p class="text-sm text-blue-600 mt-1">📝 ${m.instructions}</p>` : ''}
                        </div>
                    `).join('') || '<p class="text-slate-500">No medications</p>'}
                </div>
            </div>
            
            ${rx.labTests?.length ? `
                <div class="mt-4">
                    <h4 class="font-semibold text-slate-800 mb-2">Lab Tests Ordered</h4>
                    <div class="flex flex-wrap gap-2">
                        ${rx.labTests.map(t => `
                            <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                ${t.testName}${t.urgency !== 'routine' ? ` (${t.urgency})` : ''}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${rx.advice?.length ? `
                <div class="mt-4">
                    <h4 class="font-semibold text-slate-800 mb-2">Medical Advice</h4>
                    <ul class="list-disc list-inside text-sm text-slate-600">
                        ${rx.advice.map(a => `<li>${a}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${rx.followUpDate ? `
                <div class="mt-4 bg-yellow-50 p-3 rounded-lg">
                    <p class="text-sm text-yellow-800">
                        <span class="font-semibold">📅 Follow-up:</span> ${AppointmentUI.formatDate(rx.followUpDate)}
                    </p>
                    ${rx.followUpInstructions ? `<p class="text-sm text-yellow-700 mt-1">${rx.followUpInstructions}</p>` : ''}
                </div>
            ` : ''}
            
            <div class="mt-4 pt-4 border-t">
                <p class="text-sm text-slate-500">${rx.digitalSignature}</p>
                <p class="text-xs text-slate-400">Valid until: ${AppointmentUI.formatDate(rx.validUntil)}</p>
            </div>
        `;
        
        // Download PDF handler
        document.getElementById('rx-download-btn').onclick = async () => {
            try {
                const blob = await PrescriptionAPI.downloadPDF(rx._id);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Prescription_${rx.prescriptionId}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
            } catch (error) {
                AppointmentUI.showToast('Failed to download PDF', 'error');
            }
        };
        
        // Print handler
        document.getElementById('rx-print-btn').onclick = () => {
            window.print();
        };
        
        document.getElementById('prescription-detail-modal')?.classList.remove('hidden');
    } catch (error) {
        AppointmentUI.showToast('Failed to load prescription details', 'error');
    }
};

// Close detail modals
document.getElementById('close-doctor-modal')?.addEventListener('click', () => {
    document.getElementById('doctor-detail-modal')?.classList.add('hidden');
});

document.getElementById('close-apt-modal')?.addEventListener('click', () => {
    document.getElementById('appointment-detail-modal')?.classList.add('hidden');
});

document.getElementById('close-rx-modal')?.addEventListener('click', () => {
    document.getElementById('prescription-detail-modal')?.classList.add('hidden');
});

// Make managers available globally for onclick handlers
window.PrescriptionManager = PrescriptionManager;

// ============================================
// MODULE: RAG Interface
// ============================================
const RAGInterface = {
    search: (query) => {
        const results = ragQuery.searchKnowledgeBase(query);
        AppState.ragResults = results;
        RAGInterface.renderResults(results);
    },
    
    renderResults: (results) => {
        if (!results.length) {
            DOM.ragResults.innerHTML = '<p class="text-slate-500 text-center py-8">No results found. Try searching for drugs, diseases, or ICD-10 codes.</p>';
            return;
        }
        
        DOM.ragResults.innerHTML = results.map(r => {
            if (r.type === 'drug') {
                return `
                    <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-xl">💊</span>
                            <span class="font-semibold text-green-800">${r.name}</span>
                            <span class="text-xs bg-green-200 text-green-700 px-2 py-0.5 rounded">Drug</span>
                        </div>
                        <p class="text-sm text-slate-600">${r.data.info}</p>
                        ${r.data.contraindicated.length ? `<p class="text-sm text-red-600 mt-2">⚠️ Contraindicated with: ${r.data.contraindicated.join(', ')}</p>` : ''}
                    </div>`;
            } else if (r.type === 'disease') {
                return `
                    <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-xl">🦠</span>
                            <span class="font-semibold text-red-800">${r.name}</span>
                            <span class="text-xs bg-red-200 text-red-700 px-2 py-0.5 rounded">Disease</span>
                        </div>
                        <p class="text-sm text-slate-600">Symptoms: ${r.symptoms.join(', ')}</p>
                    </div>`;
            } else if (r.type === 'icd10') {
                return `
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="font-mono text-blue-600 bg-blue-200 px-2 py-0.5 rounded">${r.code}</span>
                            <span class="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded">ICD-10</span>
                        </div>
                        <p class="text-sm text-slate-700">${r.description}</p>
                    </div>`;
            }
            return '';
        }).join('');
    },
    
    checkInteraction: () => {
        const drug1 = DOM.drug1Input.value.trim();
        const drug2 = DOM.drug2Input.value.trim();
        
        if (!drug1 || !drug2) {
            alert('Please enter both drug names');
            return;
        }
        
        const result = ragQuery.checkDrugInteraction(drug1, drug2);
        const colors = { high: 'bg-red-100 border-red-300', medium: 'bg-yellow-100 border-yellow-300', low: 'bg-green-100 border-green-300' };
        
        DOM.interactionResult.className = `mt-4 p-4 rounded-md border ${colors[result.severity]}`;
        DOM.interactionResult.classList.remove('hidden');
        DOM.interactionResult.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-xl">${result.severity === 'high' ? '🚨' : result.severity === 'medium' ? '⚠️' : '✅'}</span>
                <span class="font-semibold">${result.severity.toUpperCase()} Risk</span>
            </div>
            <p class="text-sm mt-2">${result.message}</p>
        `;
    }
};

// ============================================
// MODULE: QR Code & PDF
// ============================================
const ReportManager = {
    showQRCode: async (recordId) => {
        try {
            const response = await fetch(`${API_URL}/${recordId}/qr`);
            if (!response.ok) throw new Error('Failed to generate QR');
            
            const data = await response.json();
            DOM.qrCodeContainer.innerHTML = `<img src="${data.qrCode}" alt="QR Code" class="w-64 h-64">`;
            DOM.qrLinkInput.value = data.emailLink;
            DOM.qrModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error generating QR:', error);
            alert('Could not generate QR code.');
        }
    },
    
    downloadPDF: async (recordId) => {
        try {
            const response = await fetch(`${API_URL}/${recordId}/pdf`);
            if (!response.ok) throw new Error('Failed to generate PDF');
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CLARA_Report_${recordId}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Could not download PDF.');
        }
    },
    
    showTimeline: (patientId) => {
        const history = agentMemory.getPatientHistory(patientId);
        
        if (!history.length) {
            DOM.timelineContent.innerHTML = '<p class="text-slate-500 text-center py-8">No history found for this patient.</p>';
        } else {
            DOM.timelineContent.innerHTML = history.map((record, idx) => `
                <div class="flex gap-4 slide-in" style="animation-delay: ${idx * 100}ms">
                    <div class="flex flex-col items-center">
                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                        ${idx < history.length - 1 ? '<div class="w-0.5 h-full bg-slate-200"></div>' : ''}
                    </div>
                    <div class="flex-1 pb-6">
                        <p class="text-sm text-slate-500">${new Date(record.timestamp).toLocaleString()}</p>
                        <p class="font-semibold text-slate-800">Risk: ${record.analysis?.risk_assessment?.level || 'N/A'} (${record.analysis?.risk_assessment?.score || 0}%)</p>
                        <p class="text-sm text-slate-600">${record.analysis?.chatbot_response?.summary?.substring(0, 100) || 'No summary'}...</p>
                    </div>
                </div>
            `).join('');
        }
        
        DOM.timelineModal.classList.remove('hidden');
    }
};

// ============================================
// MODULE: Demo Patients
// ============================================
const DemoManager = {
    init: () => {
        const options = getDemoPatientOptions();
        DOM.demoPatientSelect.innerHTML = '<option value="">Select a demo patient...</option>' +
            options.map(p => `<option value="${p.id}">${p.name} - ${p.summary}</option>`).join('');
    },
    
    loadPatient: (patientId) => {
        const patient = getDemoPatientById(patientId);
        if (!patient) return;
        
        AppState.patientInfo = {
            name: patient.name,
            id: patient.id,
            age: patient.age.toString(),
            dob: patient.dob,
            phone: patient.phone,
            email: patient.email,
            gender: patient.gender,
            bloodGroup: patient.bloodGroup
        };
        AppState.transcript = patient.transcript;
        
        // Update form
        DOM.patientNameInput.value = patient.name;
        DOM.patientIdInput.value = patient.id;
        DOM.patientAgeInput.value = patient.age;
        DOM.patientDobInput.value = patient.dob;
        DOM.patientPhoneInput.value = patient.phone;
        DOM.patientEmailInput.value = patient.email;
        DOM.patientGenderInput.value = patient.gender;
        DOM.patientBloodInput.value = patient.bloodGroup;
        DOM.transcriptInput.value = patient.transcript;
    },
    
    sync: async () => {
        try {
            const response = await fetch(`${API_URL.replace('/records', '/demo-patients/sync')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patients: demoPatients })
            });
            alert(response.ok ? 'Demo patients synced!' : 'Sync failed');
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
};

// ============================================
// MODULE: Main Render
// ============================================
const render = () => {
    // Hide all views
    DOM.transcriptView?.classList.add('hidden');
    DOM.liveView?.classList.add('hidden');
    DOM.recordsView?.classList.add('hidden');
    DOM.statisticsView?.classList.add('hidden');
    DOM.ragView?.classList.add('hidden');
    
    // Remove active from all mode buttons
    [DOM.transcriptModeBtn, DOM.liveModeBtn, DOM.recordsModeBtn, DOM.statisticsModeBtn, DOM.ragModeBtn]
        .forEach(btn => btn?.classList.remove('active'));
    
    // Show current view
    switch (AppState.appMode) {
        case 'transcript':
            DOM.transcriptView?.classList.remove('hidden');
            DOM.transcriptModeBtn?.classList.add('active');
            renderTranscriptView();
            break;
        case 'live':
            DOM.liveView?.classList.remove('hidden');
            DOM.liveModeBtn?.classList.add('active');
            renderLiveView();
            break;
        case 'records':
            DOM.recordsView?.classList.remove('hidden');
            DOM.recordsModeBtn?.classList.add('active');
            renderRecordsView();
            break;
        case 'statistics':
            DOM.statisticsView?.classList.remove('hidden');
            DOM.statisticsModeBtn?.classList.add('active');
            StatisticsManager.render();
            break;
        case 'rag':
            DOM.ragView?.classList.remove('hidden');
            DOM.ragModeBtn?.classList.add('active');
            break;
    }
};

const renderTranscriptView = () => {
    // Update form values
    DOM.patientNameInput.value = AppState.patientInfo.name;
    DOM.patientIdInput.value = AppState.patientInfo.id || generatePatientId();
    DOM.patientAgeInput.value = AppState.patientInfo.age;
    DOM.patientDobInput.value = AppState.patientInfo.dob;
    DOM.patientPhoneInput.value = AppState.patientInfo.phone;
    DOM.patientEmailInput.value = AppState.patientInfo.email;
    DOM.patientGenderInput.value = AppState.patientInfo.gender;
    DOM.patientBloodInput.value = AppState.patientInfo.bloodGroup;
    DOM.transcriptInput.value = AppState.transcript;
    
    // Store generated ID
    if (!AppState.patientInfo.id) {
        AppState.patientInfo.id = DOM.patientIdInput.value;
    }
    
    // Disable during loading
    const formInputs = [DOM.patientNameInput, DOM.patientAgeInput, DOM.patientDobInput, 
                        DOM.patientPhoneInput, DOM.patientEmailInput, DOM.transcriptInput];
    formInputs.forEach(input => { if (input) input.disabled = AppState.isLoading; });
    DOM.analyzeButton.disabled = AppState.isLoading;
    
    if (AppState.isLoading) {
        DOM.analyzeButton.innerHTML = `<span class="animate-spin mr-2">⏳</span> Analyzing...`;
        DOM.analysisSection?.classList.add('hidden');
        DOM.placeholderSection?.classList.remove('hidden');
        DOM.placeholderSection.innerHTML = Renderer.loading();
    } else {
        DOM.analyzeButton.innerHTML = '🔍 Analyze';
        
        if (AppState.error) {
            DOM.analysisSection?.classList.add('hidden');
            DOM.placeholderSection?.classList.remove('hidden');
            DOM.placeholderSection.innerHTML = Renderer.error(AppState.error);
        } else if (AppState.analysis) {
            DOM.analysisSection?.classList.remove('hidden');
            DOM.placeholderSection?.classList.add('hidden');
            
            // Render nav
            const navItems = [
                { id: 'overview', label: 'Overview', icon: Icons.Overview },
                { id: 'findings', label: 'Findings', icon: Icons.Findings },
                { id: 'pharmacology', label: 'Pharmacology', icon: Icons.Pharmacology },
                { id: 'data', label: 'Raw Data', icon: Icons.Data }
            ];
            
            DOM.analysisNav.querySelector('ul').innerHTML = navItems.map(item => `
                <li>
                    <a href="#" data-view="${item.id}" class="nav-link flex items-center space-x-3 p-3 rounded-lg font-semibold transition-colors duration-200 ${AppState.activeView === item.id ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'}">
                        ${item.icon()}
                        <span>${item.label}</span>
                    </a>
                </li>
            `).join('');
            
            // Render content
            switch (AppState.activeView) {
                case 'overview': DOM.analysisOutput.innerHTML = AnalysisViews.overview(AppState.analysis); break;
                case 'findings': DOM.analysisOutput.innerHTML = AnalysisViews.findings(AppState.analysis); break;
                case 'pharmacology': DOM.analysisOutput.innerHTML = AnalysisViews.pharmacology(AppState.analysis); break;
                case 'data': DOM.analysisOutput.innerHTML = AnalysisViews.data(AppState.analysis); break;
                default: DOM.analysisOutput.innerHTML = AnalysisViews.overview(AppState.analysis);
            }
        } else {
            DOM.analysisSection?.classList.add('hidden');
            DOM.placeholderSection?.classList.remove('hidden');
            DOM.placeholderSection.innerHTML = Renderer.initialState();
        }
    }
};

const renderLiveView = () => {
    DOM.livePatientAgeInput.value = AppState.patientInfo.age;
    DOM.livePatientAgeInput.disabled = AppState.isConversing;
    
    if (AppState.isConversing) {
        DOM.liveConversationBtn.innerHTML = `${Icons.Stop()} Stop Conversation`;
        DOM.liveConversationBtn.className = 'w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center';
    } else {
        DOM.liveConversationBtn.innerHTML = `${Icons.Start()} Start Conversation`;
        DOM.liveConversationBtn.className = 'w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center';
    }
    
    if (AppState.liveTranscript.length === 0) {
        DOM.liveTranscriptOutput.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8">
                <div class="text-4xl mb-3">🎙️</div>
                <p>Set the patient's age, then click "Start Conversation" to begin.</p>
            </div>`;
    } else {
        DOM.liveTranscriptOutput.innerHTML = AppState.liveTranscript.map(turn => `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${turn.speaker === 'Doctor' ? 'bg-blue-500' : 'bg-purple-600'}">
                    ${turn.speaker === 'Doctor' ? 'Dr' : 'Pt'}
                </div>
                <div>
                    <p class="font-semibold text-sm">${turn.speaker}</p>
                    <p class="text-slate-800">${turn.text}</p>
                </div>
            </div>
        `).join('');
        DOM.liveTranscriptOutput.scrollTop = DOM.liveTranscriptOutput.scrollHeight;
    }
};

const renderRecordsView = () => {
    const searchTerm = DOM.recordsSearch?.value || '';
    const riskFilter = DOM.recordsFilterRisk?.value || '';
    const filtered = RecordsManager.filter(searchTerm, riskFilter);
    
    if (filtered.length === 0) {
        DOM.recordsList.innerHTML = `
            <div class="text-center text-slate-500 py-12">
                <div class="text-4xl mb-3">📁</div>
                <h3 class="text-lg font-medium text-slate-800">No records found</h3>
                <p class="text-sm">Save analyzed transcripts to view them here.</p>
            </div>`;
        return;
    }
    
    DOM.recordsList.innerHTML = filtered.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)).map(record => `
        <div class="bg-slate-50 p-4 rounded-lg shadow-sm border flex justify-between items-center hover:bg-slate-100 transition-colors">
            <div>
                <h3 class="font-bold text-lg text-slate-800">${record.analysis.patient_name}</h3>
                <p class="text-sm text-slate-500">ID: ${record.analysis.patient_id} · Age: ${record.analysis.age} · ${new Date(record.savedAt).toLocaleDateString()}</p>
                <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    record.analysis.risk_assessment?.level?.toLowerCase() === 'low' ? 'bg-green-100 text-green-700' :
                    record.analysis.risk_assessment?.level?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    record.analysis.risk_assessment?.level?.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                }">${record.analysis.risk_assessment?.level || 'Unknown'} Risk</span>
            </div>
            <div class="flex flex-wrap gap-2">
                <button data-id="${record.id}" class="view-record-btn text-sm bg-white text-slate-700 font-semibold py-2 px-3 rounded-md border hover:bg-slate-50">👁️ View</button>
                <button data-id="${record.id}" class="qr-record-btn text-sm bg-purple-100 text-purple-700 font-semibold py-2 px-3 rounded-md hover:bg-purple-200">📱 QR</button>
                <button data-id="${record.id}" class="pdf-record-btn text-sm bg-blue-100 text-blue-700 font-semibold py-2 px-3 rounded-md hover:bg-blue-200">📄 PDF</button>
                <button data-id="${record.id}" class="delete-record-btn text-sm bg-red-100 text-red-700 font-semibold py-2 px-3 rounded-md hover:bg-red-200">🗑️</button>
            </div>
        </div>
    `).join('');
};

// ============================================
// MODULE: Event Handlers
// ============================================
const handleAnalyze = async () => {
    // Collect form data
    AppState.patientInfo = {
        name: DOM.patientNameInput.value.trim(),
        id: DOM.patientIdInput.value || generatePatientId(),
        age: DOM.patientAgeInput.value,
        dob: DOM.patientDobInput.value,
        phone: DOM.patientPhoneInput.value.trim(),
        email: DOM.patientEmailInput.value.trim(),
        gender: DOM.patientGenderInput.value,
        bloodGroup: DOM.patientBloodInput.value
    };
    AppState.transcript = DOM.transcriptInput.value.trim();
    
    // Validate
    const validation = Validators.validatePatientInfo(AppState.patientInfo);
    
    // Show/hide errors
    ['name', 'age', 'dob', 'phone', 'email'].forEach(field => {
        Validators.showFieldError(field, !!validation.errors[field]);
    });
    
    if (!validation.isValid) {
        AppState.error = 'Please fill in all required fields correctly.';
        render();
        return;
    }
    
    if (!AppState.transcript) {
        Validators.showFieldError('transcript', true);
        AppState.error = 'Clinical transcript is required.';
        render();
        return;
    }
    
    // Start analysis
    AppState.isLoading = true;
    AppState.error = null;
    AppState.analysis = null;
    AppState.currentRecordId = null;
    render();
    
    try {
        const result = await AIService.analyzeTranscript(AppState.transcript, AppState.patientInfo);
        AppState.analysis = result;
        AppState.activeView = 'overview';
    } catch (err) {
        console.error("Analysis failed:", err);
        AppState.error = err.message || "Analysis failed. Please try again.";
    } finally {
        AppState.isLoading = false;
        render();
    }
};

const handleModeSwitch = (mode) => {
    if (AppState.isConversing) return;
    
    AppState.appMode = mode;
    AppState.error = null;
    
    if (mode !== 'transcript') {
        AppState.analysis = null;
        AppState.currentRecordId = null;
    }
    
    // Hide all views first
    const views = ['transcript-analysis-view', 'live-conversation-view', 'records-view', 'statistics-view', 'rag-view', 'ml-analytics-view', 'impact-view', 'appointments-view', 'doctors-view', 'prescriptions-view'];
    views.forEach(viewId => {
        const el = document.getElementById(viewId);
        if (el) el.classList.add('hidden');
    });
    
    // Update button states
    const modeButtons = ['transcript-mode-btn', 'live-mode-btn', 'records-mode-btn', 'statistics-mode-btn', 'rag-mode-btn', 'ml-mode-btn', 'impact-mode-btn', 'appointments-mode-btn', 'doctors-mode-btn', 'prescriptions-mode-btn'];
    modeButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.remove('active');
    });
    
    // Show appropriate view and activate button
    const viewMapping = {
        'transcript': 'transcript-analysis-view',
        'live': 'live-conversation-view',
        'records': 'records-view',
        'statistics': 'statistics-view',
        'rag': 'rag-view',
        'ml': 'ml-analytics-view',
        'impact': 'impact-view',
        'appointments': 'appointments-view',
        'doctors': 'doctors-view',
        'prescriptions': 'prescriptions-view'
    };
    
    const btnMapping = {
        'transcript': 'transcript-mode-btn',
        'live': 'live-mode-btn',
        'records': 'records-mode-btn',
        'statistics': 'statistics-mode-btn',
        'rag': 'rag-mode-btn',
        'ml': 'ml-mode-btn',
        'impact': 'impact-mode-btn',
        'appointments': 'appointments-mode-btn',
        'doctors': 'doctors-mode-btn',
        'prescriptions': 'prescriptions-mode-btn'
    };
    
    const viewEl = document.getElementById(viewMapping[mode]);
    const btnEl = document.getElementById(btnMapping[mode]);
    
    if (viewEl) viewEl.classList.remove('hidden');
    if (btnEl) btnEl.classList.add('active');
    
    if (mode === 'records') {
        RecordsManager.load().then(render);
    } else if (mode === 'statistics') {
        StatisticsManager.load().then(render);
    } else if (mode === 'ml') {
        loadMLDashboard();
    } else if (mode === 'appointments') {
        AppointmentManager.init();
    } else if (mode === 'doctors') {
        DoctorManager.init();
    } else if (mode === 'prescriptions') {
        PrescriptionManager.init();
    } else {
        render();
    }
};

const clearForm = () => {
    AppState.patientInfo = { name: '', id: '', age: '', dob: '', phone: '', email: '', gender: '', bloodGroup: '' };
    AppState.transcript = '';
    AppState.analysis = null;
    AppState.currentRecordId = null;
    AppState.error = null;
    
    ['name', 'age', 'dob', 'phone', 'email', 'transcript'].forEach(field => {
        Validators.showFieldError(field, false);
    });
    
    DOM.demoPatientSelect.value = '';
    render();
};

// ============================================
// MODULE: Initialize Application
// ============================================
const init = () => {
    initDOM();
    DemoManager.init();
    render();
    
    // Check Python service status
    checkPythonService();
    setInterval(checkPythonService, 30000); // Check every 30 seconds
    
    // Initialize auth modal handlers
    AuthModalHandler.init();
    
    // Mode switching
    DOM.transcriptModeBtn?.addEventListener('click', () => handleModeSwitch('transcript'));
    DOM.liveModeBtn?.addEventListener('click', () => handleModeSwitch('live'));
    DOM.recordsModeBtn?.addEventListener('click', () => handleModeSwitch('records'));
    DOM.statisticsModeBtn?.addEventListener('click', () => handleModeSwitch('statistics'));
    DOM.ragModeBtn?.addEventListener('click', () => handleModeSwitch('rag'));
    
    // New mode buttons for Python features
    document.getElementById('ml-mode-btn')?.addEventListener('click', () => handleModeSwitch('ml'));
    document.getElementById('impact-mode-btn')?.addEventListener('click', () => handleModeSwitch('impact'));
    
    // Appointment system mode buttons
    document.getElementById('appointments-mode-btn')?.addEventListener('click', () => handleModeSwitch('appointments'));
    document.getElementById('doctors-mode-btn')?.addEventListener('click', () => handleModeSwitch('doctors'));
    document.getElementById('prescriptions-mode-btn')?.addEventListener('click', () => handleModeSwitch('prescriptions'));
    
    // Form inputs
    DOM.patientNameInput?.addEventListener('input', (e) => { AppState.patientInfo.name = e.target.value; Validators.showFieldError('name', false); });
    DOM.patientAgeInput?.addEventListener('input', (e) => { AppState.patientInfo.age = e.target.value; Validators.showFieldError('age', false); });
    DOM.patientDobInput?.addEventListener('input', (e) => { AppState.patientInfo.dob = e.target.value; Validators.showFieldError('dob', false); });
    DOM.patientPhoneInput?.addEventListener('input', (e) => { AppState.patientInfo.phone = e.target.value; Validators.showFieldError('phone', false); });
    DOM.patientEmailInput?.addEventListener('input', (e) => { AppState.patientInfo.email = e.target.value; Validators.showFieldError('email', false); });
    DOM.patientGenderInput?.addEventListener('change', (e) => { AppState.patientInfo.gender = e.target.value; });
    DOM.patientBloodInput?.addEventListener('change', (e) => { AppState.patientInfo.bloodGroup = e.target.value; });
    DOM.transcriptInput?.addEventListener('input', (e) => { AppState.transcript = e.target.value; Validators.showFieldError('transcript', false); });
    
    // Demo patient
    DOM.demoPatientSelect?.addEventListener('change', (e) => { if (e.target.value) DemoManager.loadPatient(e.target.value); });
    DOM.syncDemoBtn?.addEventListener('click', DemoManager.sync);
    
    // Buttons
    DOM.analyzeButton?.addEventListener('click', handleAnalyze);
    DOM.clearFormBtn?.addEventListener('click', clearForm);
    
    // Analysis nav
    DOM.analysisNav?.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (link?.dataset.view) {
            e.preventDefault();
            AppState.activeView = link.dataset.view;
            render();
        }
    });
    
    // Analysis output buttons
    DOM.analysisOutput?.addEventListener('click', (e) => {
        if (e.target.closest('#save-record-btn')) RecordsManager.save();
        if (e.target.closest('#qr-code-btn') && AppState.currentRecordId) ReportManager.showQRCode(AppState.currentRecordId);
        if (e.target.closest('#download-pdf-btn') && AppState.currentRecordId) ReportManager.downloadPDF(AppState.currentRecordId);
        if (e.target.closest('#timeline-btn')) ReportManager.showTimeline(AppState.patientInfo.id);
        if (e.target.closest('#copy-json-btn')) {
            const cleanData = { ...AppState.analysis }; delete cleanData.isSaved;
            navigator.clipboard.writeText(JSON.stringify(cleanData, null, 2));
            e.target.closest('#copy-json-btn').textContent = '✓ Copied!';
            setTimeout(() => { e.target.closest('#copy-json-btn').textContent = '📋 Copy'; }, 2000);
        }
    });
    
    // Records view
    DOM.recordsList?.addEventListener('click', (e) => {
        const id = e.target.closest('button')?.dataset.id;
        if (!id) return;
        if (e.target.closest('.view-record-btn')) RecordsManager.view(id);
        if (e.target.closest('.qr-record-btn')) ReportManager.showQRCode(id);
        if (e.target.closest('.pdf-record-btn')) ReportManager.downloadPDF(id);
        if (e.target.closest('.delete-record-btn')) RecordsManager.delete(id);
    });
    
    DOM.recordsSearch?.addEventListener('input', renderRecordsView);
    DOM.recordsFilterRisk?.addEventListener('change', renderRecordsView);
    DOM.exportAllBtn?.addEventListener('click', RecordsManager.exportAll);
    
    // RAG
    DOM.ragSearchBtn?.addEventListener('click', () => RAGInterface.search(DOM.ragSearchInput.value));
    DOM.ragSearchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') RAGInterface.search(DOM.ragSearchInput.value); });
    DOM.checkInteractionBtn?.addEventListener('click', RAGInterface.checkInteraction);
    
    // Modals
    DOM.closeQrModalBtn?.addEventListener('click', () => DOM.qrModal.classList.add('hidden'));
    DOM.copyQrLinkBtn?.addEventListener('click', () => {
        DOM.qrLinkInput.select();
        navigator.clipboard.writeText(DOM.qrLinkInput.value);
        DOM.copyQrLinkBtn.textContent = '✓ Copied!';
        setTimeout(() => { DOM.copyQrLinkBtn.textContent = '📋 Copy Link'; }, 2000);
    });
    DOM.qrModal?.addEventListener('click', (e) => { if (e.target === DOM.qrModal) DOM.qrModal.classList.add('hidden'); });
    
    DOM.closeTimelineModalBtn?.addEventListener('click', () => DOM.timelineModal.classList.add('hidden'));
    DOM.timelineModal?.addEventListener('click', (e) => { if (e.target === DOM.timelineModal) DOM.timelineModal.classList.add('hidden'); });
    
    // Live conversation (basic setup - keeping original logic)
    DOM.livePatientAgeInput?.addEventListener('input', (e) => { AppState.patientInfo.age = e.target.value; });
    
    // Initialize Python ML features
    initPythonFeatures();
};

// ============================================
// MODULE: Python ML Features
// ============================================
function initPythonFeatures() {
    // ML Prediction
    document.getElementById('run-ml-prediction')?.addEventListener('click', async () => {
        const btn = document.getElementById('run-ml-prediction');
        btn.textContent = '⏳ Predicting...';
        btn.disabled = true;
        
        const patientData = {
            age: parseInt(document.getElementById('ml-age-input')?.value) || 0,
            diseases: (document.getElementById('ml-diseases-input')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
            medications: (document.getElementById('ml-meds-input')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
            symptoms: (document.getElementById('ml-symptoms-input')?.value || '').split(',').map(s => s.trim()).filter(Boolean)
        };
        
        const result = await PythonAPI.predictRisk(patientData);
        
        const resultDiv = document.getElementById('ml-prediction-result');
        const contentDiv = document.getElementById('ml-result-content');
        
        if (result && !result.error) {
            resultDiv.classList.remove('hidden');
            const levelColors = { 'Critical': 'red', 'High': 'orange', 'Medium': 'yellow', 'Low': 'green' };
            contentDiv.innerHTML = `
                <div class="p-4 rounded-lg bg-${levelColors[result.level]}-50 border border-${levelColors[result.level]}-200">
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-bold text-${levelColors[result.level]}-700">Risk Level: ${result.level}</span>
                        <span class="text-2xl font-bold text-${levelColors[result.level]}-600">${result.score}%</span>
                    </div>
                    <div class="text-sm text-slate-600">Confidence: ${result.confidence}%</div>
                    ${result.factors?.length ? `
                        <div class="mt-3">
                            <p class="font-semibold text-sm">Risk Factors:</p>
                            <ul class="list-disc list-inside text-sm text-slate-600">
                                ${result.factors.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // Update outcome predictions
            const outcomes = await PythonAPI.predictOutcomes(patientData);
            if (outcomes) {
                document.getElementById('hosp-risk').textContent = `${outcomes.hospitalization_30day?.probability || '--'}%`;
                document.getElementById('hosp-risk-level').textContent = outcomes.hospitalization_30day?.risk_level || '--';
                document.getElementById('readmit-risk').textContent = `${outcomes.readmission_30day?.probability || '--'}%`;
                document.getElementById('readmit-risk-level').textContent = outcomes.readmission_30day?.risk_level || '--';
                document.getElementById('prognosis-score').textContent = outcomes.overall_prognosis?.score?.toFixed(1) || '--';
                document.getElementById('prognosis-status').textContent = outcomes.overall_prognosis?.status || '--';
            }
        } else {
            resultDiv.classList.remove('hidden');
            contentDiv.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-lg">Error: ${result?.error || 'Python service unavailable'}</div>`;
        }
        
        btn.textContent = '🔮 Run ML Prediction';
        btn.disabled = false;
    });
    
    // NLP Analysis
    document.getElementById('run-nlp-analysis')?.addEventListener('click', async () => {
        const btn = document.getElementById('run-nlp-analysis');
        btn.textContent = '⏳ Analyzing...';
        btn.disabled = true;
        
        const transcript = document.getElementById('ml-transcript-input')?.value || '';
        const result = await PythonAPI.analyzeNLP(transcript);
        
        const resultDiv = document.getElementById('nlp-analysis-result');
        const contentDiv = document.getElementById('nlp-result-content');
        
        if (result && !result.error) {
            resultDiv.classList.remove('hidden');
            contentDiv.innerHTML = `
                <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="p-3 bg-blue-50 rounded">
                            <p class="text-xs text-slate-500">Diseases Found</p>
                            <p class="font-semibold">${result.entities?.diseases?.join(', ') || 'None'}</p>
                        </div>
                        <div class="p-3 bg-purple-50 rounded">
                            <p class="text-xs text-slate-500">Medications</p>
                            <p class="font-semibold">${result.entities?.medications?.join(', ') || 'None'}</p>
                        </div>
                        <div class="p-3 bg-green-50 rounded">
                            <p class="text-xs text-slate-500">Tests</p>
                            <p class="font-semibold">${result.entities?.tests?.join(', ') || 'None'}</p>
                        </div>
                        <div class="p-3 bg-yellow-50 rounded">
                            <p class="text-xs text-slate-500">Symptoms</p>
                            <p class="font-semibold">${result.entities?.symptoms?.join(', ') || 'None'}</p>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <div class="flex-1 p-3 bg-slate-50 rounded text-center">
                            <p class="text-xs text-slate-500">Urgency</p>
                            <p class="font-bold text-lg">${result.urgency?.level || '--'}</p>
                        </div>
                        <div class="flex-1 p-3 bg-slate-50 rounded text-center">
                            <p class="text-xs text-slate-500">Complexity</p>
                            <p class="font-bold text-lg">${result.complexity_score || '--'}/10</p>
                        </div>
                        <div class="flex-1 p-3 bg-slate-50 rounded text-center">
                            <p class="text-xs text-slate-500">Sentiment</p>
                            <p class="font-bold text-lg">${result.sentiment?.label || '--'}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultDiv.classList.remove('hidden');
            contentDiv.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-lg">Error: ${result?.error || 'Python service unavailable'}</div>`;
        }
        
        btn.textContent = '🔍 Analyze with NLP';
        btn.disabled = false;
    });
    
    // Load trends
    document.getElementById('load-trends-btn')?.addEventListener('click', async () => {
        const trends = await DynamicFeatures.getTrends('week');
        if (trends && trends.data) {
            const tableBody = document.getElementById('trend-table-body');
            tableBody.innerHTML = trends.data.map(d => `
                <tr class="border-b">
                    <td class="px-4 py-2">${d.day} (${d.date})</td>
                    <td class="px-4 py-2 font-semibold">${d.analyses}</td>
                    <td class="px-4 py-2">${d.avg_risk}%</td>
                    <td class="px-4 py-2 text-red-600">${d.high_risk}</td>
                </tr>
            `).join('');
            
            document.getElementById('load-trends-btn').classList.add('hidden');
            document.getElementById('trend-data-display').classList.remove('hidden');
        }
    });
    
    // Impact refresh
    document.getElementById('refresh-impact')?.addEventListener('click', async () => {
        const comparison = await ImpactTracker.comparePeriods(7);
        
        if (comparison) {
            document.getElementById('before-analyses').textContent = comparison.before?.total_analyses || 0;
            document.getElementById('before-risk').textContent = `${(comparison.before?.average_risk_score || 0).toFixed(1)}%`;
            document.getElementById('before-high-risk').textContent = `${(comparison.before?.high_risk_rate || 0).toFixed(1)}%`;
            
            document.getElementById('after-analyses').textContent = comparison.after?.total_analyses || 0;
            document.getElementById('after-risk').textContent = `${(comparison.after?.average_risk_score || 0).toFixed(1)}%`;
            document.getElementById('after-high-risk').textContent = `${(comparison.after?.high_risk_rate || 0).toFixed(1)}%`;
            
            if (comparison.impact) {
                document.getElementById('impact-score').textContent = comparison.impact.overall_impact_score?.toFixed(0) || '--';
                document.getElementById('improvements-count').textContent = comparison.impact.improvements?.length || 0;
                document.getElementById('focus-areas-count').textContent = comparison.impact.areas_for_focus?.length || 0;
                
                const improvementsList = document.getElementById('improvements-list');
                const improvements = comparison.impact.improvements || [];
                improvementsList.innerHTML = improvements.length > 0 
                    ? improvements.map(i => `<div class="p-2 bg-green-50 rounded text-green-700">✅ ${i}</div>`).join('')
                    : '<p class="text-slate-500">No improvements recorded yet</p>';
            }
        }
        
        document.getElementById('total-tracked').textContent = ImpactTracker.loadData().analyses.length;
    });
    
    // Clinical Metrics Calculators
    document.getElementById('calc-nnt')?.addEventListener('click', async () => {
        const riskReduction = parseFloat(document.getElementById('nnt-risk-reduction')?.value) || 0;
        const baselineRisk = parseFloat(document.getElementById('nnt-baseline-risk')?.value) || 0.2;
        const result = await DynamicFeatures.calculateNNT(riskReduction, baselineRisk);
        document.getElementById('nnt-result').textContent = result?.nnt ? `NNT = ${result.nnt}` : 'Invalid input';
    });
    
    document.getElementById('calc-or')?.addEventListener('click', async () => {
        const result = await DynamicFeatures.calculateOddsRatio(
            parseInt(document.getElementById('or-exposed-events')?.value) || 0,
            parseInt(document.getElementById('or-exposed-total')?.value) || 1,
            parseInt(document.getElementById('or-control-events')?.value) || 0,
            parseInt(document.getElementById('or-control-total')?.value) || 1
        );
        document.getElementById('or-result').textContent = result?.or ? `OR = ${result.or} (95% CI: ${result.ci_lower}-${result.ci_upper})` : 'Invalid input';
    });
    
    document.getElementById('calc-diag')?.addEventListener('click', async () => {
        const result = await DynamicFeatures.calculateDiagnosticAccuracy(
            parseInt(document.getElementById('diag-tp')?.value) || 0,
            parseInt(document.getElementById('diag-fp')?.value) || 0,
            parseInt(document.getElementById('diag-tn')?.value) || 0,
            parseInt(document.getElementById('diag-fn')?.value) || 0
        );
        if (result) {
            document.getElementById('diag-result').innerHTML = `
                <div class="text-left">
                    <p>Sensitivity: <strong>${result.sensitivity}%</strong></p>
                    <p>Specificity: <strong>${result.specificity}%</strong></p>
                    <p>PPV: <strong>${result.ppv}%</strong></p>
                    <p>NPV: <strong>${result.npv}%</strong></p>
                    <p>Accuracy: <strong>${result.accuracy}%</strong></p>
                </div>
            `;
        }
    });
    
    // Load initial dashboard data
    loadMLDashboard();
}

async function loadMLDashboard() {
    const dashboard = await PythonAPI.getDashboard();
    if (dashboard) {
        const cards = dashboard.summary_cards || [];
        cards.forEach(card => {
            const el = document.getElementById(`ml-${card.id?.replace('_', '-')}`);
            if (el) el.textContent = card.value;
            const changeEl = document.getElementById(`ml-${card.id?.replace('_', '-')}-change`);
            if (changeEl) changeEl.textContent = card.change || '';
        });
        
        // Set accuracy
        const accuracyEl = document.getElementById('ml-accuracy');
        if (accuracyEl && dashboard.performance_metrics) {
            accuracyEl.textContent = dashboard.performance_metrics.accuracy?.risk_prediction || '89%';
        }
    }
}

// Start the application
init();

export { AppState, AIService, RecordsManager, StatisticsManager, RAGInterface, ReportManager, PythonAPI, ImpactTracker };
