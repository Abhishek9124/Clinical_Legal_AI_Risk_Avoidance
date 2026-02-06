// RAG (Retrieval Augmented Generation) Service
// Medical Knowledge Base for enhanced AI responses

export const MedicalKnowledgeBase = {
    // Drug Interactions Database
    drugInteractions: {
        'warfarin': {
            contraindicated: ['aspirin', 'ibuprofen', 'naproxen'],
            caution: ['acetaminophen', 'vitamin k'],
            info: 'Warfarin is a blood thinner. NSAIDs increase bleeding risk.'
        },
        'metformin': {
            contraindicated: ['alcohol'],
            caution: ['contrast dye', 'diuretics'],
            info: 'Metformin is used for Type 2 diabetes. Avoid with kidney issues.'
        },
        'lisinopril': {
            contraindicated: ['potassium supplements', 'spironolactone'],
            caution: ['nsaids', 'lithium'],
            info: 'ACE inhibitor for blood pressure. Monitor potassium levels.'
        },
        'atorvastatin': {
            contraindicated: ['gemfibrozil', 'cyclosporine'],
            caution: ['grapefruit', 'erythromycin'],
            info: 'Statin for cholesterol. Monitor liver function.'
        },
        'amlodipine': {
            contraindicated: [],
            caution: ['simvastatin', 'cyclosporine'],
            info: 'Calcium channel blocker for hypertension.'
        }
    },

    // Disease-Symptom Mapping
    diseaseSymptoms: {
        'hypertension': ['headache', 'dizziness', 'blurred vision', 'chest pain', 'shortness of breath'],
        'diabetes': ['frequent urination', 'excessive thirst', 'fatigue', 'blurred vision', 'slow healing'],
        'coronary artery disease': ['chest pain', 'shortness of breath', 'fatigue', 'irregular heartbeat'],
        'heart failure': ['shortness of breath', 'fatigue', 'swelling', 'rapid heartbeat', 'cough'],
        'pneumonia': ['cough', 'fever', 'chills', 'shortness of breath', 'chest pain'],
        'asthma': ['wheezing', 'shortness of breath', 'chest tightness', 'coughing'],
        'copd': ['chronic cough', 'shortness of breath', 'wheezing', 'chest tightness']
    },

    // ICD-10 Code Reference
    icd10Codes: {
        'I10': 'Essential (primary) hypertension',
        'E11': 'Type 2 diabetes mellitus',
        'I25': 'Chronic ischemic heart disease',
        'I50': 'Heart failure',
        'J18': 'Pneumonia, unspecified organism',
        'J45': 'Asthma',
        'J44': 'Chronic obstructive pulmonary disease',
        'I21': 'Acute myocardial infarction',
        'I48': 'Atrial fibrillation and flutter',
        'N18': 'Chronic kidney disease',
        'K21': 'Gastro-esophageal reflux disease',
        'F32': 'Major depressive disorder, single episode',
        'M54': 'Dorsalgia (back pain)',
        'G43': 'Migraine'
    },

    // Risk Factor Weights
    riskFactors: {
        'age_over_65': 15,
        'diabetes': 20,
        'hypertension': 15,
        'smoking': 25,
        'obesity': 15,
        'family_history': 10,
        'sedentary_lifestyle': 10,
        'high_cholesterol': 15,
        'previous_heart_attack': 30,
        'chronic_kidney_disease': 20
    },

    // Standard Treatment Protocols
    treatmentProtocols: {
        'hypertension': {
            firstLine: ['ACE inhibitors', 'ARBs', 'Calcium channel blockers', 'Thiazide diuretics'],
            lifestyle: ['Reduce sodium intake', 'Regular exercise', 'Weight management', 'Limit alcohol'],
            monitoring: ['Blood pressure checks', 'Kidney function tests', 'Electrolyte monitoring']
        },
        'diabetes': {
            firstLine: ['Metformin', 'SGLT2 inhibitors', 'GLP-1 agonists'],
            lifestyle: ['Diet modification', 'Regular exercise', 'Weight management'],
            monitoring: ['HbA1c every 3 months', 'Fasting glucose', 'Kidney function', 'Eye exams']
        },
        'heart_failure': {
            firstLine: ['ACE inhibitors', 'Beta blockers', 'Diuretics', 'Aldosterone antagonists'],
            lifestyle: ['Fluid restriction', 'Low sodium diet', 'Daily weight monitoring'],
            monitoring: ['Echocardiogram', 'BNP levels', 'Electrolytes', 'Kidney function']
        }
    }
};

// RAG Query Functions
export const ragQuery = {
    // Check drug interactions
    checkDrugInteraction: (drug1, drug2) => {
        const drug1Lower = drug1.toLowerCase();
        const drug2Lower = drug2.toLowerCase();
        
        const drugData = MedicalKnowledgeBase.drugInteractions[drug1Lower];
        if (drugData) {
            if (drugData.contraindicated.includes(drug2Lower)) {
                return { severity: 'high', message: `${drug1} and ${drug2} are contraindicated together.` };
            }
            if (drugData.caution.includes(drug2Lower)) {
                return { severity: 'medium', message: `Use ${drug1} and ${drug2} with caution.` };
            }
        }
        return { severity: 'low', message: 'No known interaction found.' };
    },

    // Get disease information
    getDiseaseInfo: (disease) => {
        const diseaseLower = disease.toLowerCase();
        const symptoms = MedicalKnowledgeBase.diseaseSymptoms[diseaseLower];
        const treatment = MedicalKnowledgeBase.treatmentProtocols[diseaseLower.replace(' ', '_')];
        
        return {
            symptoms: symptoms || [],
            treatment: treatment || null,
            found: !!(symptoms || treatment)
        };
    },

    // Get ICD-10 code description
    getICD10Description: (code) => {
        return MedicalKnowledgeBase.icd10Codes[code] || 'Unknown code';
    },

    // Calculate risk score based on factors
    calculateRiskScore: (factors) => {
        let score = 0;
        factors.forEach(factor => {
            const factorKey = factor.toLowerCase().replace(/ /g, '_');
            score += MedicalKnowledgeBase.riskFactors[factorKey] || 5;
        });
        return Math.min(score, 100);
    },

    // Search knowledge base
    searchKnowledgeBase: (query) => {
        const queryLower = query.toLowerCase();
        const results = [];

        // Search drugs
        Object.keys(MedicalKnowledgeBase.drugInteractions).forEach(drug => {
            if (drug.includes(queryLower)) {
                results.push({
                    type: 'drug',
                    name: drug,
                    data: MedicalKnowledgeBase.drugInteractions[drug]
                });
            }
        });

        // Search diseases
        Object.keys(MedicalKnowledgeBase.diseaseSymptoms).forEach(disease => {
            if (disease.includes(queryLower)) {
                results.push({
                    type: 'disease',
                    name: disease,
                    symptoms: MedicalKnowledgeBase.diseaseSymptoms[disease]
                });
            }
        });

        // Search ICD-10
        Object.entries(MedicalKnowledgeBase.icd10Codes).forEach(([code, desc]) => {
            if (code.toLowerCase().includes(queryLower) || desc.toLowerCase().includes(queryLower)) {
                results.push({
                    type: 'icd10',
                    code: code,
                    description: desc
                });
            }
        });

        return results;
    }
};

// Enhanced prompt builder with RAG context
export const buildRAGEnhancedPrompt = (transcript, patientInfo, ragContext) => {
    let contextSection = '';
    
    if (ragContext.drugInteractions?.length > 0) {
        contextSection += `\n### Known Drug Interactions:\n`;
        ragContext.drugInteractions.forEach(interaction => {
            contextSection += `- ${interaction.message}\n`;
        });
    }

    if (ragContext.diseaseInfo) {
        contextSection += `\n### Relevant Medical Knowledge:\n`;
        if (ragContext.diseaseInfo.symptoms?.length > 0) {
            contextSection += `Common symptoms: ${ragContext.diseaseInfo.symptoms.join(', ')}\n`;
        }
        if (ragContext.diseaseInfo.treatment) {
            contextSection += `First-line treatments: ${ragContext.diseaseInfo.treatment.firstLine?.join(', ') || 'N/A'}\n`;
        }
    }

    return `You are CLARA, a sophisticated Clinical Language and Reasoning Assistant. 
    
### Patient Information:
- Name: ${patientInfo.name || 'Not provided'}
- Age: ${patientInfo.age || 'Not provided'}
- DOB: ${patientInfo.dob || 'Not provided'}
- Phone: ${patientInfo.phone || 'Not provided'}
- Email: ${patientInfo.email || 'Not provided'}
${contextSection}

### Clinical Transcript:
${transcript}

---
Analyze this clinical data comprehensively. Generate a complete JSON output based on the provided schema. 
Consider the provided medical context and patient information in your analysis.
Ensure all drug interactions and risk factors are properly identified.`;
};

export default { MedicalKnowledgeBase, ragQuery, buildRAGEnhancedPrompt };
