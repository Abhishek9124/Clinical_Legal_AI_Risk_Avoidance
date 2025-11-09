import { GoogleGenAI, Type, Modality } from "@google/genai";

// --- ICONS ---
const OverviewIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>`;
const FindingsIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h5m-5 4h5" /></svg>`;
const PharmacologyIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 14l9-5-9-5-9 5 9 5z"></path><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479V14l6.176-3.432z"></path></svg>`;
const DataIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>`;
const SymptomIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
const MedicationIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>`;
const DiagnosisIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`;
const RiskIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
const ChatbotIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>`;
const ValidationIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.318-3.047a11.955 11.955 0 011.154-1.118l1.073-1.073a11.955 11.955 0 013.844-2.035l.53-.178m3.844 2.035a11.955 11.955 0 01-3.844 2.035m0 0l-1.073 1.073a11.955 11.955 0 01-1.154 1.118l-5.318 3.047a12.02 12.02 0 008.618-14.471z" /></svg>`;
const SideEffectsIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
const StartIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path d="M5.5 10.5a.5.5 0 01.5.5v1a4 4 0 004 4h0a4 4 0 004-4v-1a.5.5 0 011 0v1a5 5 0 01-4.5 4.975V19h3a.5.5 0 010 1h-7a.5.5 0 010-1h3v-1.525A5 5 0 014.5 11.5v-1a.5.5 0 01.5-.5z" /></svg>`;
const StopIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`;
const SaveIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>`;
const CheckIcon = () => `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>`;

// --- CONSTANTS & CONFIG ---
const DEFAULT_TRANSCRIPT = `Doctor: Good morning, Mr. Kumar. What brings you in today?
Patient: Good morning, doctor. For the past 3 days, I've been having this chest pain and it's getting hard to breathe.
Doctor: I see. Can you describe the pain? Is it sharp, dull?
Patient: It's a heavy feeling, right in the center of my chest.
Doctor: Okay. I see from your chart you have a history of hypertension and Type 2 diabetes. Are you taking your Metformin and Aspirin regularly?
Patient: Yes, doctor. Every day.
Doctor: We'll run an ECG to check your heart. It shows an irregular heartbeat. We need to investigate this further.`;

const claraSchema = {
    type: Type.OBJECT,
    properties: {
        patient_id: { type: Type.STRING, description: "A unique patient identifier, e.g., P11111" },
        patient_name: { type: Type.STRING, description: "The patient's full name." },
        age: { type: Type.INTEGER, description: "The patient's age in years." },
        entities: {
            type: Type.OBJECT,
            properties: {
                DISEASE: { type: Type.ARRAY, items: { type: Type.STRING } },
                TEST: { type: Type.ARRAY, items: { type: Type.STRING } },
                DRUG: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["DISEASE", "TEST", "DRUG"],
        },
        icd10_codes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of relevant ICD-10 codes based on the transcript.",
        },
        risk_assessment: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "A numerical risk score from 0 to 100." },
                level: { type: Type.STRING, description: "Risk level: Low, Medium, High, or Critical." },
                factors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key factors contributing to the risk." },
            },
            required: ["score", "level", "factors"],
        },
        drug_validation: {
            type: Type.ARRAY,
            description: "Validation for each prescribed drug.",
            items: {
                type: Type.OBJECT,
                properties: {
                    drug_name: { type: Type.STRING },
                    validation_status: { type: Type.STRING, description: "e.g., 'Appropriate', 'Use with caution', 'Contraindicated'" },
                    reasoning: { type: Type.STRING, description: "Explanation for the validation status." }
                },
                required: ["drug_name", "validation_status", "reasoning"]
            }
        },
        side_effects: {
            type: Type.ARRAY,
            description: "Potential side effects for each prescribed drug, including management strategies.",
            items: {
                type: Type.OBJECT,
                properties: {
                    drug_name: { type: Type.STRING },
                    effects: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                effect: { type: Type.STRING, description: "The name of the potential side effect." },
                                management: { type: Type.STRING, description: "Brief advice on how to manage the side effect." }
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
                summary: { type: Type.STRING, description: "A concise summary." },
                advice: { type: Type.STRING, description: "Actionable advice." },
                disclaimer: { type: Type.STRING, description: "A standard disclaimer." },
            },
            required: ["summary", "advice", "disclaimer"],
        },
        next_steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of auto-suggested next steps." },
    },
    required: ["patient_id", "patient_name", "age", "entities", "icd10_codes", "risk_assessment", "drug_validation", "side_effects", "fhir_output", "chatbot_response", "next_steps"],
};

// --- STATE ---
let state = {
    // Analysis Mode
    transcript: DEFAULT_TRANSCRIPT,
    patientAge: '58',
    analysis: null,
    isLoading: false,
    error: null,
    activeView: 'overview',

    // App Mode
    appMode: 'transcript', // 'transcript', 'live', 'records'

    // Live Conversation Mode
    isConversing: false,
    liveTranscript: [],
    liveSession: null,
    micStream: null,
    inputAudioContext: null,
    outputAudioContext: null,
    scriptProcessor: null,
    livePatientAge: '58',

    // Patient Records
    records: [],
};

// --- DOM ELEMENTS ---
// Main Views
const transcriptAnalysisView = document.getElementById('transcript-analysis-view');
const liveConversationView = document.getElementById('live-conversation-view');
const patientRecordsView = document.getElementById('patient-records-view');
// Mode Buttons
const transcriptModeBtn = document.getElementById('transcript-mode-btn');
const liveModeBtn = document.getElementById('live-mode-btn');
const recordsModeBtn = document.getElementById('records-mode-btn');
// Analysis Mode Elements
const patientAgeInput = document.getElementById('patient-age-input');
const transcriptInput = document.getElementById('transcript-input');
const analyzeButton = document.getElementById('analyze-button');
const analysisSection = document.getElementById('analysis-section');
const analysisNav = document.getElementById('analysis-nav');
const analysisOutput = document.getElementById('analysis-output');
const placeholderSection = document.getElementById('placeholder-section');
// Live Mode Elements
const liveConversationBtn = document.getElementById('live-conversation-btn');
const liveTranscriptOutput = document.getElementById('live-transcript-output');
const livePatientAgeInput = document.getElementById('live-patient-age-input');
// Records Mode Elements
const recordsList = document.getElementById('records-list');


const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: OverviewIcon },
    { id: 'findings', label: 'Clinical Findings', icon: FindingsIcon },
    { id: 'pharmacology', label: 'Pharmacology', icon: PharmacologyIcon },
    { id: 'data', label: 'Raw Data', icon: DataIcon },
];

// --- AUDIO UTILITY FUNCTIONS ---
function encode(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data, ctx, sampleRate, numChannels) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


function createBlob(data) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- GEMINI SERVICE ---
const analyzeTranscript = async (transcript, age) => {
    // Lazily initialize AI and check for API Key
    if (!window.process?.env?.API_KEY || window.process.env.API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
        throw new Error("Gemini API Key not configured. Please create and configure env.js as per the README.md file.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const ageInfo = age ? `The patient's age is ${age}.` : 'The patient\'s age is not provided.';
    const prompt = `You are CLARA, a sophisticated Clinical Language and Reasoning Assistant. Analyze the following clinical transcript, which is a dialogue between a Doctor and a Patient. ${ageInfo} Generate a complete JSON output based on the provided schema. The analysis must be thorough, covering all aspects of the schema.\n---\n${transcript}\n---`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: claraSchema,
            },
        });
        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);
        if (!parsedData || typeof parsedData !== 'object') {
            throw new Error("Invalid JSON structure received from API.");
        }
        return parsedData;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a valid analysis from the AI model.");
    }
};

// --- RENDER FUNCTIONS ---
const renderLoading = () => `
    <div class="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-xl shadow-md border border-slate-200 p-8">
        <svg class="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 class="text-xl font-semibold text-slate-700 mt-4">Analyzing Transcript...</h2>
        <p class="text-slate-500 mt-2 text-center">CLARA is processing the clinical data. This may take a moment.</p>
    </div>`;

const renderError = (message) => `
    <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg shadow-sm" role="alert">
        <div class="flex"><div class="py-1">
                <svg class="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H10a1 1 0 0 1-1-1zM10 4a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1z" /></svg>
            </div><div><p class="font-bold">Error</p><p class="text-sm">${message}</p></div>
        </div>
    </div>`;

const renderInitialState = () => `
    <div class="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center">
        <div class="text-6xl mb-4">🩺</div>
        <h2 class="text-xl font-semibold text-slate-700">Awaiting Analysis</h2>
        <p class="text-slate-500 mt-2">Enter patient age and a clinical transcript, then click "Analyze".</p>
    </div>`;

const RiskIndicator = (level, score) => {
    const levelLower = level ? level.toLowerCase() : '';
    const colorClasses = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-orange-100 text-orange-800', critical: 'bg-red-100 text-red-800' };
    const dotClasses = { low: 'bg-green-500', medium: 'bg-yellow-500', high: 'bg-orange-500', critical: 'bg-red-500' };
    const bgColor = colorClasses[levelLower] || 'bg-slate-100 text-slate-800';
    const dotColor = dotClasses[levelLower] || 'bg-slate-500';
    return `<div class="inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm ${bgColor}"><span class="w-3 h-3 rounded-full mr-2 ${dotColor}"></span>${level} (${score}%)</div>`;
};

const DashboardCard = (title, icon, children) => `
    <div class="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <div class="flex items-center mb-4">
            <div class="flex-shrink-0 bg-blue-100 text-blue-600 rounded-lg p-2 mr-4">${icon}</div>
            <h3 class="text-lg font-semibold text-slate-700">${title}</h3>
        </div>
        <div class="space-y-4">${children}</div>
    </div>`;

// --- MULTI-PAGE VIEW RENDERERS ---
const renderOverviewView = (data) => {
    const saveButton = data.isSaved
        ? `<button class="bg-green-600 text-white font-semibold py-2 px-4 rounded-md flex items-center cursor-not-allowed" disabled>${CheckIcon()} Record Saved</button>`
        : `<button id="save-record-btn" class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center">${SaveIcon()} Save Record</button>`;
    const patientHeader = `<div class='bg-white p-6 rounded-xl shadow-md border border-slate-200'><div class="flex justify-between items-start"><div><h2 class="text-2xl font-bold text-slate-800">${data.patient_name}</h2><p class="text-slate-500">Patient ID: ${data.patient_id} · Age: ${data.age}</p></div>${saveButton}</div></div>`;
    const risk = DashboardCard("Risk Level", RiskIcon(), `<div class="flex items-start space-x-4">${RiskIndicator(data.risk_assessment.level, data.risk_assessment.score)}<div><p class="font-semibold text-slate-800">Key Factors:</p><ul class="list-disc list-inside text-slate-600">${data.risk_assessment.factors.map(f => `<li>${f}</li>`).join('')}</ul></div></div>`);
    const summary = DashboardCard("AI Chatbot Summary", ChatbotIcon(), `<div class="space-y-3 text-slate-700"><p class="italic">"${data.chatbot_response.summary}"</p><p><span class="font-semibold">Advice:</span> ${data.chatbot_response.advice}</p><p class="text-xs text-slate-500 pt-2 border-t border-slate-200 mt-2">${data.chatbot_response.disclaimer}</p></div>`);
    return [patientHeader, risk, summary].join('');
};

const renderFindingsView = (data) => {
    const symptoms = DashboardCard("Symptoms Detected", SymptomIcon(), `<ul class="list-disc list-inside text-slate-600">${(data.entities.DISEASE || []).map(d => `<li>${d}</li>`).join('')}</ul>`);
    const diagnoses = DashboardCard("Diagnoses (ICD-10)", DiagnosisIcon(), `<div class="space-y-2">${(data.icd10_codes || []).map(code => `<div class="flex justify-between items-center bg-slate-50 p-2 rounded-md"><span class="font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">${code}</span><span class="text-slate-700 font-medium">${(data.fhir_output.conditions || []).find(c => c.code === code)?.display || 'Unknown'}</span></div>`).join('')}</div>`);
    return [symptoms, diagnoses].join('');
};

const renderPharmacologyView = (data) => {
    const medications = DashboardCard("Medications Identified", MedicationIcon(), `<ul class="list-disc list-inside text-slate-600">${(data.entities.DRUG || []).map(d => `<li>${d}</li>`).join('')}</ul>`);
    const drugValidations = DashboardCard("Drug Prescription Validation", ValidationIcon(), `
        <div class="space-y-0">
            ${(data.drug_validation || []).map(v => `
                <div class="border-t border-slate-200 pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
                    <h4 class="font-semibold text-slate-800 mb-2">${v.drug_name}</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                        <div class="font-medium text-slate-500 sm:col-span-1">Status</div>
                        <div class="sm:col-span-3">
                            <span class="px-2 py-0.5 text-xs font-medium rounded-full ${
                                {
                                    'Appropriate': 'bg-green-100 text-green-800',
                                    'Use with caution': 'bg-yellow-100 text-yellow-800',
                                    'Contraindicated': 'bg-red-100 text-red-800'
                                }[v.validation_status] || 'bg-slate-100 text-slate-800'
                            }">${v.validation_status}</span>
                        </div>
                        <div class="font-medium text-slate-500 sm:col-span-1">Reasoning</div>
                        <div class="sm:col-span-3 text-slate-600">${v.reasoning}</div>
                    </div>
                </div>
            `).join('') || '<p class="text-slate-500">No drug validation information available.</p>'}
        </div>`);
    const sideEffects = DashboardCard("Potential Side Effects", SideEffectsIcon(), `
        <div class="space-y-4">
            ${(data.side_effects || []).map(s => `
                <div>
                    <h4 class="font-semibold text-slate-800">${s.drug_name}</h4>
                    <div class="space-y-2 mt-2">
                        ${(s.effects && s.effects.length > 0) ? s.effects.map(e => `
                            <details class="group bg-slate-50 rounded-lg transition-colors duration-200 hover:bg-slate-100">
                                <summary class="flex justify-between items-center cursor-pointer list-none p-3">
                                    <span class="font-medium text-slate-700">${e.effect}</span>
                                    <svg class="h-5 w-5 text-slate-500 group-open:rotate-180 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                    </svg>
                                </summary>
                                <div class="px-3 pb-3 text-slate-600 text-sm">
                                    <div class="border-t border-slate-200 pt-2">
                                        <strong class="font-semibold text-slate-700">Management:</strong>
                                        <p class="mt-1">${e.management}</p>
                                    </div>
                                </div>
                            </details>
                        `).join('') : '<p class="text-slate-500 text-sm px-3 py-2">No specific side effects listed.</p>'}
                    </div>
                </div>
            `).join('') || '<p class="text-slate-500">No side effect information available.</p>'}
        </div>`);
    return [medications, drugValidations, sideEffects].join('');
};

const renderDataView = (data) => {
    // Create a copy of the data to avoid modifying the state directly
    const dataToRender = { ...data };
    delete dataToRender.isSaved; // Don't show the internal 'isSaved' flag in the raw data view

    const jsonOutput = `
        <div class="bg-slate-800 rounded-xl shadow-md border border-slate-700">
             <div class="p-4">
                <pre class="text-sm bg-slate-900 p-4 rounded-md overflow-x-auto text-green-300"><code>${JSON.stringify(dataToRender, null, 2)}</code></pre>
            </div>
        </div>`;
    return jsonOutput;
};

// --- LIVE TRANSCRIPT RENDER ---
const renderLiveTranscript = () => {
    if (state.liveTranscript.length === 0) {
         liveTranscriptOutput.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8">
            <div class="text-4xl mb-3">🎙️</div>
            <p>Set the patient's age above, then click "Start Conversation" to begin the AI interview.</p>
         </div>`;
         return;
    }
    liveTranscriptOutput.innerHTML = state.liveTranscript.map(turn => `
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
    liveTranscriptOutput.scrollTop = liveTranscriptOutput.scrollHeight;
}

// --- PATIENT RECORDS RENDER ---
const renderPatientRecords = () => {
    if (state.records.length === 0) {
        recordsList.innerHTML = `
            <div class="text-center text-slate-500 py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                <h3 class="mt-2 text-lg font-medium text-slate-800">No saved records</h3>
                <p class="mt-1 text-sm">Analyzed transcripts can be saved here for later review.</p>
            </div>`;
        return;
    }

    // Sort records by saved date, newest first
    const sortedRecords = [...state.records].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    recordsList.innerHTML = sortedRecords.map(record => `
        <div class="bg-slate-50 p-4 rounded-lg shadow-sm border flex justify-between items-center hover:bg-slate-100 transition-colors duration-200">
            <div>
                <h3 class="font-bold text-lg text-slate-800">${record.analysis.patient_name}</h3>
                <p class="text-sm text-slate-500">ID: ${record.analysis.patient_id} · Age: ${record.analysis.age} · Saved: ${new Date(record.savedAt).toLocaleString()}</p>
            </div>
            <div class="flex space-x-2">
                <button data-record-id="${record.id}" class="view-record-btn text-sm bg-white text-slate-700 font-semibold py-2 px-4 rounded-md border border-slate-300 hover:bg-slate-50 transition-colors duration-200">View</button>
                <button data-record-id="${record.id}" class="delete-record-btn text-sm bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-md hover:bg-red-200 transition-colors duration-200">Delete</button>
            </div>
        </div>
    `).join('');
};

// --- MAIN RENDER FUNCTION ---
const render = () => {
    // Mode-based view visibility
    transcriptAnalysisView.classList.add('hidden');
    liveConversationView.classList.add('hidden');
    patientRecordsView.classList.add('hidden');
    transcriptModeBtn.classList.remove('active');
    liveModeBtn.classList.remove('active');
    recordsModeBtn.classList.remove('active');

    if (state.appMode === 'transcript') {
        transcriptAnalysisView.classList.remove('hidden');
        transcriptModeBtn.classList.add('active');
    } else if (state.appMode === 'live') {
        liveConversationView.classList.remove('hidden');
        liveModeBtn.classList.add('active');
    } else if (state.appMode === 'records') {
        patientRecordsView.classList.remove('hidden');
        recordsModeBtn.classList.add('active');
        renderPatientRecords();
    }
    
    // RENDER TRANSCRIPT ANALYSIS VIEW
    patientAgeInput.value = state.patientAge;
    transcriptInput.value = state.transcript;
    transcriptInput.disabled = state.isLoading;
    patientAgeInput.disabled = state.isLoading;
    analyzeButton.disabled = state.isLoading;

    if (state.isLoading) {
        analyzeButton.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Analyzing...`;
        analysisSection.classList.add('hidden');
        placeholderSection.classList.remove('hidden');
        placeholderSection.innerHTML = renderLoading();
    } else {
        analyzeButton.innerHTML = 'Analyze Transcript';
        if (state.error) {
            analysisSection.classList.add('hidden');
            placeholderSection.classList.remove('hidden');
            placeholderSection.innerHTML = renderError(state.error);
        } else if (state.analysis) {
            analysisSection.classList.remove('hidden');
            placeholderSection.classList.add('hidden');
            analysisNav.querySelector('ul').innerHTML = NAV_ITEMS.map(item => `
                <li>
                    <a href="#" data-view="${item.id}" class="nav-link flex items-center space-x-3 p-3 rounded-lg font-semibold transition-colors duration-200 ${state.activeView === item.id ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-200'}">
                        ${item.icon()}
                        <span>${item.label}</span>
                    </a>
                </li>
            `).join('');

            switch (state.activeView) {
                case 'overview': analysisOutput.innerHTML = renderOverviewView(state.analysis); break;
                case 'findings': analysisOutput.innerHTML = renderFindingsView(state.analysis); break;
                case 'pharmacology': analysisOutput.innerHTML = renderPharmacologyView(state.analysis); break;
                case 'data': analysisOutput.innerHTML = renderDataView(state.analysis); break;
                default: analysisOutput.innerHTML = renderOverviewView(state.analysis);
            }
        } else {
            analysisSection.classList.add('hidden');
            placeholderSection.classList.remove('hidden');
            placeholderSection.innerHTML = renderInitialState();
        }
    }

    // RENDER LIVE CONVERSATION VIEW
    livePatientAgeInput.value = state.livePatientAge;
    livePatientAgeInput.disabled = state.isConversing;
    if (state.isConversing) {
        liveConversationBtn.innerHTML = `${StopIcon()} Stop Conversation`;
        liveConversationBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'focus:ring-green-500');
        liveConversationBtn.classList.add('bg-red-600', 'hover:bg-red-700', 'focus:ring-red-500');
    } else {
        liveConversationBtn.innerHTML = `${StartIcon()} Start Conversation`;
        liveConversationBtn.classList.add('bg-green-600', 'hover:bg-green-700', 'focus:ring-green-500');
        liveConversationBtn.classList.remove('bg-red-600', 'hover:bg-red-700', 'focus:ring-red-500');
    }
    renderLiveTranscript();
};

// --- API & RECORDS LOGIC ---

const API_URL = 'http://localhost:3001/api/records';

const loadRecords = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch records. Is the backend server running?');
        }
        const serverRecords = await response.json();
        // The server returns the full record object. We reshape it to match 
        // the structure our view logic expects.
        state.records = serverRecords.map(record => ({
            id: record._id, // MongoDB uses _id
            savedAt: record.createdAt,
            analysis: record.analysis
        }));
    } catch (error) {
        console.error('Error loading records:', error);
        // Do not overwrite potential existing error messages, but clear records.
        if (!state.error) { 
          state.error = "Could not load records from the local server. Please ensure it's running correctly as per the instructions in `mongo.md`.";
        }
        state.records = []; // Clear records on error
    }
    // Render patient records if on that view, otherwise the error will show on the main view.
    if (state.appMode === 'records') {
        render();
    }
};

const saveCurrentRecord = async () => {
    if (!state.analysis || state.analysis.isSaved) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(state.analysis), // Send the analysis object
        });

        if (!response.ok) {
            throw new Error('Failed to save the record to the server.');
        }
        state.analysis.isSaved = true;
        await loadRecords(); // Reload records to get the latest list from the server
        render(); // Re-render to update the save button
    } catch (error) {
        console.error('Error saving record:', error);
        alert('Could not save record. Is the backend server running?');
    }
};

const viewRecord = (recordId) => {
    const recordToView = state.records.find(r => r.id === recordId);
    if (recordToView) {
        state.analysis = { ...recordToView.analysis, isSaved: true };
        state.transcript = DEFAULT_TRANSCRIPT; // Reset transcript input
        state.patientAge = recordToView.analysis.age.toString();
        state.appMode = 'transcript';
        state.activeView = 'overview';
        render();
    }
};

const deleteRecord = async (recordId) => {
    if (confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_URL}/${recordId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete record from the server.');
            }
            // Remove the record from the local state to update the UI instantly
            state.records = state.records.filter(r => r.id !== recordId);
            render(); // Re-render the records list
        } catch(error) {
            console.error('Error deleting record:', error);
            alert('Could not delete record. Is the backend server running?');
        }
    }
};


// --- EVENT HANDLERS & INITIALIZATION ---
const handleAnalyze = async () => {
    if (!state.transcript.trim() || !state.patientAge.trim()) {
        state.error = "Please enter the patient's age and a clinical transcript to analyze.";
        state.analysis = null;
        render();
        return;
    }
    state.isLoading = true;
    state.error = null;
    state.analysis = null;
    render();
    try {
        const result = await analyzeTranscript(state.transcript, state.patientAge);
        state.analysis = result;
        state.activeView = 'overview';
    } catch (err) {
        console.error("Analysis failed:", err);
        state.error = err.message || "An error occurred during analysis. Please check the console for details.";
    } finally {
        state.isLoading = false;
        render();
    }
};

const handleSwitchMode = (mode) => {
    if (state.isConversing) return; // Prevent switching during live session
    state.appMode = mode;
    state.error = null; // Clear any errors when switching views
    if(mode !== 'transcript') state.analysis = null; // Clear analysis if leaving the page
    if (mode === 'records') {
        loadRecords(); // Fetch records when switching to the records view
    } else {
        render();
    }
}

// --- LIVE SESSION LOGIC ---
let sessionPromise = null;
let currentInputTranscription = '';
let currentOutputTranscription = '';
let nextStartTime = 0;
const outputSources = new Set();


const stopConversation = () => {
    if (!state.isConversing) return;

    if (state.liveSession) {
        state.liveSession.close();
        state.liveSession = null;
    }
    if (state.micStream) {
        state.micStream.getTracks().forEach(track => track.stop());
        state.micStream = null;
    }
    if (state.inputAudioContext) {
        state.inputAudioContext.close();
        state.inputAudioContext = null;
    }
    if (state.outputAudioContext) {
        state.outputAudioContext.close();
        state.outputAudioContext = null;
    }
    if (state.scriptProcessor) {
        state.scriptProcessor.disconnect();
        state.scriptProcessor = null;
    }
     // Stop any currently playing audio
    for (const source of outputSources.values()) {
        source.stop();
    }
    outputSources.clear();
    
    const formattedTranscript = state.liveTranscript
        .map(turn => `${turn.speaker}: ${turn.text}`)
        .join('\n');

    state.isConversing = false;
    
    // Auto-analyze if a conversation happened
    if (formattedTranscript) {
        state.transcript = formattedTranscript;
        state.patientAge = state.livePatientAge; // Carry over age from live session
        state.appMode = 'transcript';
        render(); // Switch view first
        handleAnalyze(); // Then trigger analysis
    } else {
        state.appMode = 'transcript';
        render();
    }
};

const startConversation = async () => {
    if (!state.livePatientAge.trim()) {
        alert("Please enter the patient's age to start the conversation.");
        return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording.');
        return;
    }
    
    // Lazily initialize AI and check for API Key
    try {
        if (!window.process?.env?.API_KEY || window.process.env.API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
            throw new Error("Gemini API Key not configured. Please create and configure env.js as per the README.md file.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        state.isConversing = true;
        state.liveTranscript = [];
        currentInputTranscription = '';
        currentOutputTranscription = '';
        nextStartTime = 0;
        render();

        state.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        state.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        
        sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    const source = state.inputAudioContext.createMediaStreamSource(state.micStream);
                    state.scriptProcessor = state.inputAudioContext.createScriptProcessor(4096, 1, 1);
                    state.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(state.scriptProcessor);
                    state.scriptProcessor.connect(state.inputAudioContext.destination);
                },
                onmessage: async (message) => {
                    // Accumulate transcriptions
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscription += message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscription += message.serverContent.outputTranscription.text;
                    }

                    // Play audio from the model
                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData) {
                        nextStartTime = Math.max(nextStartTime, state.outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), state.outputAudioContext, 24000, 1);
                        const source = state.outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(state.outputAudioContext.destination);
                        source.addEventListener('ended', () => outputSources.delete(source));
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                        outputSources.add(source);
                    }

                    // When a full turn (user + model) is complete, update the UI
                    if (message.serverContent?.turnComplete) {
                        if (currentInputTranscription.trim()) {
                            state.liveTranscript.push({ speaker: 'Doctor', text: currentInputTranscription.trim() });
                        }
                        if (currentOutputTranscription.trim()) {
                            state.liveTranscript.push({ speaker: 'Patient', text: currentOutputTranscription.trim() });
                        }
                        currentInputTranscription = '';
                        currentOutputTranscription = '';
                        renderLiveTranscript();
                    }
                },
                onerror: (e) => {
                    console.error('Live session error:', e);
                    alert("An error occurred during the conversation. Please check the console.");
                    stopConversation();
                },
                onclose: () => {
                    console.log('Live session closed.');
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction: `You are a patient simulator for a medical consultation. Respond naturally to the doctor's questions in English. Your persona is Rajesh Kumar, a ${state.livePatientAge}-year-old male with a history of hypertension and Type 2 diabetes, currently experiencing chest pain. Keep your responses concise and conversational.`,
            },
        });

        state.liveSession = await sessionPromise;
    } catch (err) {
        console.error("Failed to start conversation session:", err);
        alert(err.message || "Could not start conversation. Please ensure you have granted microphone permissions and configured your API key.");
        state.isConversing = false;
        render();
    }
};

const handleConversationToggle = () => {
    if (state.isConversing) {
        stopConversation();
    } else {
        startConversation();
    }
};

const init = () => {
    // Initial render
    render();

    // Event listeners for transcript analysis mode
    patientAgeInput.addEventListener('input', (e) => {
        state.patientAge = e.target.value;
    });
    transcriptInput.addEventListener('input', (e) => {
        state.transcript = e.target.value;
    });
    analyzeButton.addEventListener('click', handleAnalyze);

    // Mode switching listeners
    transcriptModeBtn.addEventListener('click', () => handleSwitchMode('transcript'));
    liveModeBtn.addEventListener('click', () => handleSwitchMode('live'));
    recordsModeBtn.addEventListener('click', () => handleSwitchMode('records'));

    // Live conversation listeners
    livePatientAgeInput.addEventListener('input', (e) => {
        state.livePatientAge = e.target.value;
    });
    liveConversationBtn.addEventListener('click', handleConversationToggle);
    
    // Event delegation for dynamically created buttons
    analysisNav.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (link && link.dataset.view) {
            e.preventDefault();
            state.activeView = link.dataset.view;
            render();
        }
    });

    analysisOutput.addEventListener('click', (e) => {
        if (e.target.closest('#save-record-btn')) {
            saveCurrentRecord();
        }
    });
    
    patientRecordsView.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('.view-record-btn');
        if (viewBtn) {
            viewRecord(viewBtn.dataset.recordId);
        }
        const deleteBtn = e.target.closest('.delete-record-btn');
        if (deleteBtn) {
            deleteRecord(deleteBtn.dataset.recordId);
        }
    });

};

init();