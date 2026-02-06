/**
 * CLARA Python Integration Service
 * =================================
 * Connects frontend to Python ML/Analytics services
 */

const PYTHON_API_URL = 'http://localhost:5000/api';

/**
 * Python API Client
 */
export const PythonAPI = {
    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(`${PYTHON_API_URL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Python service not available:', error);
            return { status: 'offline', error: error.message };
        }
    },

    /**
     * ML-based risk prediction
     * @param {Object} patientData - Patient data for prediction
     */
    async predictRisk(patientData) {
        try {
            const response = await fetch(`${PYTHON_API_URL}/predict-risk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patientData)
            });
            return await response.json();
        } catch (error) {
            console.error('Risk prediction error:', error);
            return null;
        }
    },

    /**
     * NLP analysis of transcript
     * @param {string} transcript - Clinical transcript
     */
    async analyzeNLP(transcript) {
        try {
            const response = await fetch(`${PYTHON_API_URL}/analyze-nlp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript })
            });
            return await response.json();
        } catch (error) {
            console.error('NLP analysis error:', error);
            return null;
        }
    },

    /**
     * Generate dynamic alerts
     * @param {Object} analysisData - Analysis data
     */
    async generateAlerts(analysisData) {
        try {
            const response = await fetch(`${PYTHON_API_URL}/generate-alerts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(analysisData)
            });
            return await response.json();
        } catch (error) {
            console.error('Alert generation error:', error);
            return { alerts: [], count: 0 };
        }
    },

    /**
     * Comprehensive analysis (combines all Python features)
     * @param {string} transcript - Clinical transcript
     * @param {Object} patient - Patient information
     */
    async comprehensiveAnalysis(transcript, patient) {
        try {
            const response = await fetch(`${PYTHON_API_URL}/comprehensive-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript, patient })
            });
            return await response.json();
        } catch (error) {
            console.error('Comprehensive analysis error:', error);
            return null;
        }
    },

    /**
     * Get dashboard data
     * @param {Array} records - Optional records for analysis
     */
    async getDashboard(records = []) {
        try {
            const response = await fetch(`${PYTHON_API_URL}/dashboard`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ records })
            });
            return await response.json();
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            return null;
        }
    },

    /**
     * Get clinical insights
     * @param {Object} patientData - Patient data
     */
    async getClinicalInsights(patientData) {
        try {
            const response = await fetch(`${PYTHON_API_URL}/clinical-insights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patientData)
            });
            return await response.json();
        } catch (error) {
            console.error('Clinical insights error:', error);
            return null;
        }
    },

    /**
     * Predict clinical outcomes
     * @param {Object} patientData - Patient data
     */
    async predictOutcomes(patientData) {
        try {
            const response = await fetch(`${PYTHON_API_URL}/predict-outcomes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patientData)
            });
            return await response.json();
        } catch (error) {
            console.error('Outcome prediction error:', error);
            return null;
        }
    },

    /**
     * Measure impact between periods
     * @param {Object} before - Before metrics
     * @param {Object} after - After metrics
     */
    async measureImpact(before, after) {
        try {
            const response = await fetch(`${PYTHON_API_URL}/measure-impact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ before, after })
            });
            return await response.json();
        } catch (error) {
            console.error('Impact measurement error:', error);
            return null;
        }
    },

    /**
     * Calculate clinical metrics
     * @param {string} metricType - Type of metric (nnt, odds_ratio, sensitivity_specificity)
     * @param {Object} data - Metric calculation data
     */
    async calculateMetric(metricType, data) {
        try {
            const response = await fetch(`${PYTHON_API_URL}/calculate-metric`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metric_type: metricType, data })
            });
            return await response.json();
        } catch (error) {
            console.error('Metric calculation error:', error);
            return null;
        }
    },

    /**
     * Get trend analysis
     * @param {string} period - Period type (week, month)
     */
    async getTrendAnalysis(period = 'week') {
        try {
            const response = await fetch(`${PYTHON_API_URL}/trend-analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ period })
            });
            return await response.json();
        } catch (error) {
            console.error('Trend analysis error:', error);
            return null;
        }
    },

    /**
     * Batch analyze multiple transcripts
     * @param {Array} transcripts - Array of transcripts
     */
    async batchAnalyze(transcripts) {
        try {
            const response = await fetch(`${PYTHON_API_URL}/batch-analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcripts })
            });
            return await response.json();
        } catch (error) {
            console.error('Batch analysis error:', error);
            return { results: [], processed: 0 };
        }
    }
};

/**
 * Enhanced Analysis Service
 * Combines Gemini AI with Python ML for comprehensive analysis
 */
export const EnhancedAnalysis = {
    /**
     * Perform dual-engine analysis
     * @param {string} transcript - Clinical transcript
     * @param {Object} patientInfo - Patient information
     * @param {Function} geminiAnalyze - Gemini analysis function
     */
    async analyze(transcript, patientInfo, geminiAnalyze) {
        const results = {
            gemini: null,
            python: null,
            combined: null,
            alerts: [],
            insights: null,
            outcomes: null,
            timestamp: new Date().toISOString()
        };

        // Run analyses in parallel
        const [geminiResult, pythonResult] = await Promise.allSettled([
            geminiAnalyze(transcript, patientInfo),
            PythonAPI.comprehensiveAnalysis(transcript, patientInfo)
        ]);

        // Process Gemini result
        if (geminiResult.status === 'fulfilled') {
            results.gemini = geminiResult.value;
        }

        // Process Python result
        if (pythonResult.status === 'fulfilled' && pythonResult.value) {
            results.python = pythonResult.value;
            results.alerts = pythonResult.value.alerts || [];
            results.insights = pythonResult.value.clinical_insights;
            results.outcomes = pythonResult.value.outcome_predictions;
        }

        // Combine results
        if (results.gemini) {
            results.combined = {
                ...results.gemini,
                python_risk: results.python?.risk_prediction,
                python_nlp: results.python?.nlp_analysis,
                alerts: results.alerts,
                clinical_insights: results.insights,
                outcome_predictions: results.outcomes,
                dual_analysis: true
            };

            // If Python risk differs significantly, flag it
            const geminiRisk = results.gemini.risk_assessment?.score || 0;
            const pythonRisk = results.python?.risk_prediction?.score || 0;
            
            if (Math.abs(geminiRisk - pythonRisk) > 15) {
                results.combined.risk_discrepancy = {
                    gemini_score: geminiRisk,
                    python_score: pythonRisk,
                    difference: Math.abs(geminiRisk - pythonRisk),
                    recommendation: 'Risk scores differ significantly. Manual review recommended.'
                };
            }
        }

        return results;
    }
};

/**
 * Impact Tracking Service
 */
export const ImpactTracker = {
    storageKey: 'clara_impact_data',

    /**
     * Record an analysis for impact tracking
     */
    recordAnalysis(analysis) {
        const data = this.loadData();
        data.analyses.push({
            timestamp: new Date().toISOString(),
            risk_score: analysis.risk_assessment?.score || 0,
            risk_level: analysis.risk_assessment?.level || 'Unknown',
            diseases: analysis.entities?.DISEASE || [],
            medications: analysis.entities?.DRUG || []
        });
        this.saveData(data);
    },

    /**
     * Get impact metrics
     */
    async getMetrics() {
        const data = this.loadData();
        
        // Calculate local metrics
        const localMetrics = {
            total_analyses: data.analyses.length,
            average_risk_score: data.analyses.length > 0 
                ? data.analyses.reduce((sum, a) => sum + a.risk_score, 0) / data.analyses.length 
                : 0,
            high_risk_rate: data.analyses.length > 0
                ? (data.analyses.filter(a => a.risk_level === 'High' || a.risk_level === 'Critical').length / data.analyses.length) * 100
                : 0
        };

        // Get Python metrics if available
        const pythonMetrics = await PythonAPI.getDashboard(data.analyses);

        return {
            local: localMetrics,
            python: pythonMetrics,
            combined_at: new Date().toISOString()
        };
    },

    /**
     * Compare periods for impact measurement
     */
    async comparePeriods(days = 7) {
        const data = this.loadData();
        const now = new Date();
        const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);
        const doubleCutoff = new Date(now - days * 2 * 24 * 60 * 60 * 1000);

        // Split data into before and after periods
        const afterAnalyses = data.analyses.filter(a => new Date(a.timestamp) >= cutoff);
        const beforeAnalyses = data.analyses.filter(a => {
            const date = new Date(a.timestamp);
            return date >= doubleCutoff && date < cutoff;
        });

        const before = this.calculatePeriodMetrics(beforeAnalyses);
        const after = this.calculatePeriodMetrics(afterAnalyses);

        // Get Python impact measurement
        const impact = await PythonAPI.measureImpact(before, after);

        return {
            before,
            after,
            impact,
            period_days: days
        };
    },

    calculatePeriodMetrics(analyses) {
        if (analyses.length === 0) return { total_analyses: 0, average_risk_score: 0, high_risk_rate: 0 };

        return {
            total_analyses: analyses.length,
            average_risk_score: analyses.reduce((sum, a) => sum + a.risk_score, 0) / analyses.length,
            high_risk_rate: (analyses.filter(a => a.risk_level === 'High' || a.risk_level === 'Critical').length / analyses.length) * 100
        };
    },

    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : { analyses: [], created: new Date().toISOString() };
        } catch {
            return { analyses: [], created: new Date().toISOString() };
        }
    },

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    },

    clearData() {
        localStorage.removeItem(this.storageKey);
    }
};

/**
 * Dynamic Features Service
 */
export const DynamicFeatures = {
    /**
     * Get real-time alerts for a patient
     */
    async getRealTimeAlerts(patientData) {
        const alerts = await PythonAPI.generateAlerts(patientData);
        return alerts.alerts || [];
    },

    /**
     * Get dynamic dashboard
     */
    async getDynamicDashboard() {
        return await PythonAPI.getDashboard();
    },

    /**
     * Get trend analysis
     */
    async getTrends(period = 'week') {
        return await PythonAPI.getTrendAnalysis(period);
    },

    /**
     * Calculate clinical metrics
     */
    async calculateNNT(riskReduction, baselineRisk) {
        return await PythonAPI.calculateMetric('nnt', { risk_reduction: riskReduction, baseline_risk: baselineRisk });
    },

    async calculateOddsRatio(exposedEvents, exposedTotal, controlEvents, controlTotal) {
        return await PythonAPI.calculateMetric('odds_ratio', {
            exposed_events: exposedEvents,
            exposed_total: exposedTotal,
            control_events: controlEvents,
            control_total: controlTotal
        });
    },

    async calculateDiagnosticAccuracy(tp, fp, tn, fn) {
        return await PythonAPI.calculateMetric('sensitivity_specificity', { tp, fp, tn, fn });
    }
};

// Export all
export default {
    PythonAPI,
    EnhancedAnalysis,
    ImpactTracker,
    DynamicFeatures
};
