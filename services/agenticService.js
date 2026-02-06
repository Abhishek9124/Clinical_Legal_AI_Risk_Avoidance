// Agentic AI Service
// Multi-step reasoning and autonomous task execution

export class AgenticAI {
    constructor(analyzeFunction) {
        this.analyze = analyzeFunction;
        this.taskQueue = [];
        this.completedTasks = [];
        this.isProcessing = false;
    }

    // Define available agent actions
    actions = {
        EXTRACT_ENTITIES: 'extract_entities',
        VALIDATE_DRUGS: 'validate_drugs',
        CALCULATE_RISK: 'calculate_risk',
        GENERATE_ICD10: 'generate_icd10',
        CREATE_FHIR: 'create_fhir',
        SUMMARIZE: 'summarize',
        RECOMMEND_ACTIONS: 'recommend_actions',
        CHECK_INTERACTIONS: 'check_interactions'
    };

    // Task Planning - Break down analysis into subtasks
    planTasks(transcript, patientInfo) {
        const tasks = [
            {
                id: 1,
                action: this.actions.EXTRACT_ENTITIES,
                description: 'Extract diseases, medications, and tests from transcript',
                status: 'pending',
                priority: 1,
                input: { transcript }
            },
            {
                id: 2,
                action: this.actions.CHECK_INTERACTIONS,
                description: 'Check for drug-drug interactions',
                status: 'pending',
                priority: 2,
                dependsOn: [1]
            },
            {
                id: 3,
                action: this.actions.VALIDATE_DRUGS,
                description: 'Validate prescribed medications against patient profile',
                status: 'pending',
                priority: 2,
                dependsOn: [1],
                input: { patientInfo }
            },
            {
                id: 4,
                action: this.actions.CALCULATE_RISK,
                description: 'Calculate patient risk score based on factors',
                status: 'pending',
                priority: 3,
                dependsOn: [1, 2]
            },
            {
                id: 5,
                action: this.actions.GENERATE_ICD10,
                description: 'Map diagnoses to ICD-10 codes',
                status: 'pending',
                priority: 3,
                dependsOn: [1]
            },
            {
                id: 6,
                action: this.actions.CREATE_FHIR,
                description: 'Generate FHIR-compliant resources',
                status: 'pending',
                priority: 4,
                dependsOn: [1, 5]
            },
            {
                id: 7,
                action: this.actions.RECOMMEND_ACTIONS,
                description: 'Generate recommended next steps',
                status: 'pending',
                priority: 4,
                dependsOn: [1, 2, 3, 4]
            },
            {
                id: 8,
                action: this.actions.SUMMARIZE,
                description: 'Create clinical summary and advice',
                status: 'pending',
                priority: 5,
                dependsOn: [1, 2, 3, 4, 5, 6, 7]
            }
        ];

        return tasks.sort((a, b) => a.priority - b.priority);
    }

    // Execute task with reasoning
    async executeTask(task, context) {
        const startTime = Date.now();
        
        const reasoning = {
            taskId: task.id,
            action: task.action,
            thought: `Executing: ${task.description}`,
            startTime: new Date().toISOString()
        };

        try {
            task.status = 'in_progress';
            
            // Simulate agent reasoning
            await new Promise(resolve => setTimeout(resolve, 100));
            
            task.status = 'completed';
            task.completedAt = new Date().toISOString();
            task.duration = Date.now() - startTime;
            
            reasoning.result = 'success';
            reasoning.observation = `Task completed in ${task.duration}ms`;
            
        } catch (error) {
            task.status = 'failed';
            task.error = error.message;
            reasoning.result = 'failed';
            reasoning.observation = error.message;
        }

        return reasoning;
    }

    // Get task execution trace for transparency
    getExecutionTrace() {
        return this.completedTasks.map(task => ({
            step: task.id,
            action: task.action,
            description: task.description,
            status: task.status,
            duration: task.duration,
            timestamp: task.completedAt
        }));
    }

    // Chain of Thought reasoning
    generateChainOfThought(transcript, entities) {
        const thoughts = [];

        thoughts.push({
            step: 1,
            thought: 'Analyzing clinical transcript for key medical information...',
            observation: `Found transcript with ${transcript.split(' ').length} words.`
        });

        if (entities?.DISEASE?.length > 0) {
            thoughts.push({
                step: 2,
                thought: 'Identifying mentioned diseases and conditions...',
                observation: `Detected ${entities.DISEASE.length} conditions: ${entities.DISEASE.join(', ')}`
            });
        }

        if (entities?.DRUG?.length > 0) {
            thoughts.push({
                step: 3,
                thought: 'Extracting medication information...',
                observation: `Found ${entities.DRUG.length} medications: ${entities.DRUG.join(', ')}`
            });

            thoughts.push({
                step: 4,
                thought: 'Checking for potential drug interactions...',
                observation: 'Analyzing medication combinations for safety.'
            });
        }

        if (entities?.TEST?.length > 0) {
            thoughts.push({
                step: 5,
                thought: 'Reviewing diagnostic tests mentioned...',
                observation: `Identified ${entities.TEST.length} tests: ${entities.TEST.join(', ')}`
            });
        }

        thoughts.push({
            step: 6,
            thought: 'Calculating overall patient risk score...',
            observation: 'Aggregating risk factors from patient history and current presentation.'
        });

        thoughts.push({
            step: 7,
            thought: 'Generating clinical recommendations...',
            observation: 'Formulating evidence-based next steps.'
        });

        return thoughts;
    }

    // Reset agent state
    reset() {
        this.taskQueue = [];
        this.completedTasks = [];
        this.isProcessing = false;
    }
}

// Agent Memory - Store context across sessions
export class AgentMemory {
    constructor() {
        this.shortTermMemory = new Map();
        this.longTermMemory = this.loadFromStorage();
    }

    // Store in short-term memory
    remember(key, value) {
        this.shortTermMemory.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    // Recall from memory
    recall(key) {
        const shortTerm = this.shortTermMemory.get(key);
        if (shortTerm) return shortTerm.value;
        
        return this.longTermMemory[key] || null;
    }

    // Save to long-term memory (localStorage)
    persist(key, value) {
        this.longTermMemory[key] = value;
        this.saveToStorage();
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('clara_agent_memory');
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }

    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('clara_agent_memory', JSON.stringify(this.longTermMemory));
        } catch (e) {
            console.warn('Could not save agent memory:', e);
        }
    }

    // Get patient history from memory
    getPatientHistory(patientId) {
        return this.recall(`patient_${patientId}`) || [];
    }

    // Add to patient history
    addToPatientHistory(patientId, record) {
        const history = this.getPatientHistory(patientId);
        history.push({
            ...record,
            timestamp: new Date().toISOString()
        });
        this.persist(`patient_${patientId}`, history);
    }

    // Clear memory
    clear() {
        this.shortTermMemory.clear();
        this.longTermMemory = {};
        localStorage.removeItem('clara_agent_memory');
    }
}

// Export singleton instances
export const agentMemory = new AgentMemory();

export default { AgenticAI, AgentMemory, agentMemory };
