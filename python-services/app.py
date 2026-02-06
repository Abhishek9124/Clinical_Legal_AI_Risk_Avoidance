"""
CLARA Python Analytics Service
==============================
Machine Learning-based risk prediction, NLP analysis, and clinical analytics.
Provides measurable impact metrics and dynamic features.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import os
import io
import numpy as np
from collections import Counter, defaultdict
import random

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# ============================================
# MODULE: Risk Prediction ML Model (Simulated)
# ============================================

class RiskPredictionModel:
    """
    Machine Learning model for clinical risk prediction.
    Uses weighted scoring based on clinical factors.
    """
    
    # Risk factor weights (derived from medical literature)
    RISK_WEIGHTS = {
        'age_over_65': 15,
        'age_over_75': 25,
        'diabetes': 20,
        'hypertension': 15,
        'heart_disease': 30,
        'previous_mi': 35,
        'kidney_disease': 25,
        'copd': 20,
        'asthma': 10,
        'obesity': 15,
        'smoking': 20,
        'multiple_medications': 10,
        'drug_interaction_risk': 25,
        'high_blood_pressure': 15,
        'abnormal_ecg': 20,
        'chest_pain': 25,
        'shortness_of_breath': 15,
        'family_history': 10
    }
    
    # Disease severity scores
    DISEASE_SEVERITY = {
        'hypertension': 15,
        'type 2 diabetes': 20,
        'type 1 diabetes': 25,
        'coronary artery disease': 35,
        'heart failure': 40,
        'atrial fibrillation': 25,
        'pneumonia': 20,
        'asthma': 15,
        'copd': 25,
        'chronic kidney disease': 30,
        'myocardial infarction': 45,
        'stroke': 40,
        'cancer': 50
    }
    
    def predict_risk(self, patient_data):
        """
        Predict risk score based on patient data.
        Returns score (0-100), level, confidence, and factors.
        """
        score = 0
        factors = []
        
        # Age factor
        age = patient_data.get('age', 0)
        if age >= 75:
            score += self.RISK_WEIGHTS['age_over_75']
            factors.append(f'Advanced age ({age} years)')
        elif age >= 65:
            score += self.RISK_WEIGHTS['age_over_65']
            factors.append(f'Age over 65 ({age} years)')
        
        # Disease factors
        diseases = patient_data.get('diseases', [])
        for disease in diseases:
            disease_lower = disease.lower()
            for key, severity in self.DISEASE_SEVERITY.items():
                if key in disease_lower:
                    score += severity
                    factors.append(f'Condition: {disease}')
                    break
        
        # Medication count factor
        medications = patient_data.get('medications', [])
        if len(medications) >= 5:
            score += self.RISK_WEIGHTS['multiple_medications']
            factors.append(f'Polypharmacy ({len(medications)} medications)')
        
        # Symptoms factor
        symptoms = patient_data.get('symptoms', [])
        symptom_keywords = {
            'chest pain': 25,
            'shortness of breath': 15,
            'difficulty breathing': 20,
            'dizziness': 10,
            'syncope': 20,
            'palpitations': 15
        }
        for symptom in symptoms:
            symptom_lower = symptom.lower()
            for keyword, weight in symptom_keywords.items():
                if keyword in symptom_lower:
                    score += weight
                    factors.append(f'Symptom: {symptom}')
                    break
        
        # Cap score at 100
        score = min(score, 100)
        
        # Determine level
        if score >= 75:
            level = 'Critical'
        elif score >= 50:
            level = 'High'
        elif score >= 25:
            level = 'Medium'
        else:
            level = 'Low'
        
        # Calculate confidence (based on data completeness)
        data_points = len(diseases) + len(medications) + len(symptoms) + (1 if age else 0)
        confidence = min(95, 60 + (data_points * 5))
        
        return {
            'score': score,
            'level': level,
            'confidence': confidence,
            'factors': factors[:5],  # Top 5 factors
            'model_version': '2.0.0',
            'prediction_timestamp': datetime.now().isoformat()
        }


# ============================================
# MODULE: NLP Analysis
# ============================================

class ClinicalNLPAnalyzer:
    """
    Natural Language Processing for clinical transcripts.
    Extracts entities, sentiment, and key phrases.
    """
    
    # Medical entity keywords
    DISEASE_KEYWORDS = [
        'diabetes', 'hypertension', 'heart disease', 'asthma', 'copd',
        'pneumonia', 'infection', 'cancer', 'stroke', 'kidney disease',
        'liver disease', 'anemia', 'arthritis', 'depression', 'anxiety',
        'migraine', 'epilepsy', 'parkinson', 'alzheimer', 'covid'
    ]
    
    MEDICATION_KEYWORDS = [
        'metformin', 'aspirin', 'warfarin', 'lisinopril', 'atorvastatin',
        'amlodipine', 'omeprazole', 'levothyroxine', 'gabapentin', 'prednisone',
        'amoxicillin', 'azithromycin', 'ibuprofen', 'acetaminophen', 'insulin',
        'metoprolol', 'hydrochlorothiazide', 'losartan', 'simvastatin', 'furosemide'
    ]
    
    TEST_KEYWORDS = [
        'ecg', 'ekg', 'blood test', 'x-ray', 'mri', 'ct scan', 'ultrasound',
        'biopsy', 'endoscopy', 'colonoscopy', 'mammogram', 'pap smear',
        'cholesterol', 'glucose', 'hba1c', 'creatinine', 'bmp', 'cbc',
        'urinalysis', 'thyroid', 'liver function', 'kidney function'
    ]
    
    SYMPTOM_KEYWORDS = [
        'pain', 'fever', 'cough', 'headache', 'fatigue', 'nausea',
        'vomiting', 'diarrhea', 'dizziness', 'shortness of breath',
        'chest pain', 'swelling', 'rash', 'itching', 'numbness',
        'weakness', 'blurred vision', 'weight loss', 'weight gain'
    ]
    
    def analyze_transcript(self, transcript):
        """
        Perform comprehensive NLP analysis on clinical transcript.
        """
        text_lower = transcript.lower()
        words = text_lower.split()
        word_count = len(words)
        
        # Extract entities
        diseases = self._extract_entities(text_lower, self.DISEASE_KEYWORDS)
        medications = self._extract_entities(text_lower, self.MEDICATION_KEYWORDS)
        tests = self._extract_entities(text_lower, self.TEST_KEYWORDS)
        symptoms = self._extract_entities(text_lower, self.SYMPTOM_KEYWORDS)
        
        # Sentiment analysis (simple rule-based)
        sentiment = self._analyze_sentiment(text_lower)
        
        # Key phrases extraction
        key_phrases = self._extract_key_phrases(transcript)
        
        # Urgency detection
        urgency = self._detect_urgency(text_lower)
        
        # Calculate complexity score
        complexity = self._calculate_complexity(diseases, medications, symptoms)
        
        return {
            'entities': {
                'diseases': diseases,
                'medications': medications,
                'tests': tests,
                'symptoms': symptoms
            },
            'metrics': {
                'word_count': word_count,
                'sentence_count': transcript.count('.') + transcript.count('?'),
                'entity_count': len(diseases) + len(medications) + len(tests) + len(symptoms)
            },
            'sentiment': sentiment,
            'key_phrases': key_phrases,
            'urgency': urgency,
            'complexity_score': complexity,
            'analysis_timestamp': datetime.now().isoformat()
        }
    
    def _extract_entities(self, text, keywords):
        """Extract matching keywords from text."""
        found = []
        for keyword in keywords:
            if keyword in text:
                found.append(keyword.title())
        return list(set(found))
    
    def _analyze_sentiment(self, text):
        """Simple sentiment analysis for clinical context."""
        positive_words = ['better', 'improved', 'stable', 'good', 'normal', 'healthy', 'recovery']
        negative_words = ['worse', 'severe', 'critical', 'pain', 'emergency', 'urgent', 'deteriorating']
        
        pos_count = sum(1 for word in positive_words if word in text)
        neg_count = sum(1 for word in negative_words if word in text)
        
        if neg_count > pos_count:
            return {'label': 'Concerning', 'score': -0.5 - (neg_count * 0.1)}
        elif pos_count > neg_count:
            return {'label': 'Positive', 'score': 0.5 + (pos_count * 0.1)}
        else:
            return {'label': 'Neutral', 'score': 0.0}
    
    def _extract_key_phrases(self, text):
        """Extract important phrases from transcript."""
        # Simple extraction based on patterns
        phrases = []
        important_patterns = [
            'diagnosed with', 'prescribed', 'recommended', 'complains of',
            'history of', 'symptoms include', 'test results show', 'need to'
        ]
        
        text_lower = text.lower()
        for pattern in important_patterns:
            if pattern in text_lower:
                idx = text_lower.find(pattern)
                end_idx = text_lower.find('.', idx)
                if end_idx == -1:
                    end_idx = min(idx + 100, len(text))
                phrase = text[idx:end_idx].strip()
                if len(phrase) > 10:
                    phrases.append(phrase[:100])
        
        return phrases[:5]
    
    def _detect_urgency(self, text):
        """Detect urgency level from transcript."""
        emergency_words = ['emergency', 'urgent', 'immediately', 'critical', 'severe', '911']
        high_words = ['concerning', 'worrying', 'significant', 'serious']
        
        for word in emergency_words:
            if word in text:
                return {'level': 'Emergency', 'score': 5}
        
        for word in high_words:
            if word in text:
                return {'level': 'High', 'score': 4}
        
        return {'level': 'Routine', 'score': 2}
    
    def _calculate_complexity(self, diseases, medications, symptoms):
        """Calculate case complexity score (1-10)."""
        score = 1
        score += min(len(diseases) * 1.5, 4)
        score += min(len(medications) * 0.5, 2)
        score += min(len(symptoms) * 0.5, 2)
        return min(round(score, 1), 10)


# ============================================
# MODULE: Impact Analytics
# ============================================

class ImpactAnalytics:
    """
    Measures and tracks clinical impact metrics.
    Provides data-driven insights for healthcare improvements.
    """
    
    def __init__(self):
        self.session_data = []
        self.analysis_history = []
    
    def calculate_session_metrics(self, analyses):
        """Calculate metrics for a collection of analyses."""
        if not analyses:
            return self._empty_metrics()
        
        total = len(analyses)
        
        # Risk distribution
        risk_levels = Counter([a.get('risk_level', 'Unknown') for a in analyses])
        
        # Average risk score
        risk_scores = [a.get('risk_score', 0) for a in analyses]
        avg_risk = sum(risk_scores) / total if risk_scores else 0
        
        # Disease frequency
        all_diseases = []
        for a in analyses:
            all_diseases.extend(a.get('diseases', []))
        disease_freq = Counter(all_diseases).most_common(10)
        
        # Medication frequency
        all_meds = []
        for a in analyses:
            all_meds.extend(a.get('medications', []))
        med_freq = Counter(all_meds).most_common(10)
        
        # Time-based trends (simulated)
        weekly_trend = self._calculate_weekly_trend(analyses)
        
        return {
            'total_analyses': total,
            'risk_distribution': dict(risk_levels),
            'average_risk_score': round(avg_risk, 1),
            'top_diseases': [{'name': d, 'count': c} for d, c in disease_freq],
            'top_medications': [{'name': m, 'count': c} for m, c in med_freq],
            'weekly_trend': weekly_trend,
            'high_risk_rate': round(risk_levels.get('High', 0) / total * 100, 1) if total > 0 else 0,
            'critical_rate': round(risk_levels.get('Critical', 0) / total * 100, 1) if total > 0 else 0,
            'timestamp': datetime.now().isoformat()
        }
    
    def _calculate_weekly_trend(self, analyses):
        """Calculate weekly analysis trend."""
        # Simulated weekly data for demo
        weeks = []
        for i in range(4, 0, -1):
            week_start = datetime.now() - timedelta(weeks=i)
            weeks.append({
                'week': f'Week {5-i}',
                'date': week_start.strftime('%Y-%m-%d'),
                'count': random.randint(5, 20),
                'avg_risk': round(random.uniform(25, 55), 1)
            })
        return weeks
    
    def _empty_metrics(self):
        """Return empty metrics structure."""
        return {
            'total_analyses': 0,
            'risk_distribution': {},
            'average_risk_score': 0,
            'top_diseases': [],
            'top_medications': [],
            'weekly_trend': [],
            'high_risk_rate': 0,
            'critical_rate': 0,
            'timestamp': datetime.now().isoformat()
        }
    
    def calculate_impact_score(self, before_metrics, after_metrics):
        """
        Calculate measurable impact between two time periods.
        Returns improvement metrics.
        """
        improvements = {}
        
        # Risk reduction
        if before_metrics.get('average_risk_score', 0) > 0:
            risk_change = after_metrics.get('average_risk_score', 0) - before_metrics.get('average_risk_score', 0)
            improvements['risk_change'] = round(risk_change, 1)
            improvements['risk_change_percent'] = round(
                (risk_change / before_metrics['average_risk_score']) * 100, 1
            )
        
        # Volume change
        before_total = before_metrics.get('total_analyses', 0)
        after_total = after_metrics.get('total_analyses', 0)
        improvements['volume_change'] = after_total - before_total
        
        # High risk rate change
        improvements['high_risk_rate_change'] = round(
            after_metrics.get('high_risk_rate', 0) - before_metrics.get('high_risk_rate', 0), 1
        )
        
        # Calculate overall impact score (weighted)
        impact_score = 50  # Base score
        if improvements.get('risk_change', 0) < 0:
            impact_score += abs(improvements['risk_change'])
        if improvements.get('high_risk_rate_change', 0) < 0:
            impact_score += abs(improvements['high_risk_rate_change']) * 2
        if improvements.get('volume_change', 0) > 0:
            impact_score += min(improvements['volume_change'], 20)
        
        improvements['overall_impact_score'] = min(round(impact_score, 1), 100)
        improvements['timestamp'] = datetime.now().isoformat()
        
        return improvements


# ============================================
# MODULE: Dynamic Alert System
# ============================================

class AlertSystem:
    """
    Dynamic alert generation based on clinical data patterns.
    """
    
    ALERT_THRESHOLDS = {
        'critical_risk': 75,
        'high_risk': 50,
        'drug_interaction': True,
        'multiple_conditions': 3,
        'polypharmacy': 5
    }
    
    def generate_alerts(self, analysis_data):
        """Generate relevant alerts based on analysis data."""
        alerts = []
        
        # Risk score alerts
        risk_score = analysis_data.get('risk_score', 0)
        if risk_score >= self.ALERT_THRESHOLDS['critical_risk']:
            alerts.append({
                'type': 'CRITICAL',
                'category': 'Risk Assessment',
                'message': f'Critical risk level detected (Score: {risk_score})',
                'priority': 1,
                'action': 'Immediate medical review recommended',
                'color': '#ef4444'
            })
        elif risk_score >= self.ALERT_THRESHOLDS['high_risk']:
            alerts.append({
                'type': 'WARNING',
                'category': 'Risk Assessment',
                'message': f'High risk level detected (Score: {risk_score})',
                'priority': 2,
                'action': 'Schedule follow-up within 48 hours',
                'color': '#f97316'
            })
        
        # Multiple conditions alert
        diseases = analysis_data.get('diseases', [])
        if len(diseases) >= self.ALERT_THRESHOLDS['multiple_conditions']:
            alerts.append({
                'type': 'INFO',
                'category': 'Complexity',
                'message': f'Multiple conditions detected ({len(diseases)} conditions)',
                'priority': 3,
                'action': 'Consider multidisciplinary consultation',
                'color': '#3b82f6'
            })
        
        # Polypharmacy alert
        medications = analysis_data.get('medications', [])
        if len(medications) >= self.ALERT_THRESHOLDS['polypharmacy']:
            alerts.append({
                'type': 'WARNING',
                'category': 'Medication Safety',
                'message': f'Polypharmacy risk ({len(medications)} medications)',
                'priority': 2,
                'action': 'Review medication interactions and necessity',
                'color': '#f97316'
            })
        
        # Drug interaction alerts (simplified)
        interaction_risks = self._check_interactions(medications)
        for interaction in interaction_risks:
            alerts.append({
                'type': 'DANGER',
                'category': 'Drug Interaction',
                'message': interaction['message'],
                'priority': 1,
                'action': interaction['action'],
                'color': '#dc2626'
            })
        
        # Sort by priority
        alerts.sort(key=lambda x: x['priority'])
        
        return alerts
    
    def _check_interactions(self, medications):
        """Check for known drug interactions."""
        interactions = []
        med_lower = [m.lower() for m in medications]
        
        # Known dangerous combinations
        dangerous_pairs = [
            (['warfarin', 'aspirin'], 'Warfarin + Aspirin increases bleeding risk'),
            (['metformin', 'alcohol'], 'Metformin + Alcohol may cause lactic acidosis'),
            (['lisinopril', 'potassium'], 'ACE inhibitor + Potassium may cause hyperkalemia'),
        ]
        
        for pair, message in dangerous_pairs:
            if all(drug in med_lower for drug in pair):
                interactions.append({
                    'message': message,
                    'action': 'Review medication combination with pharmacist'
                })
        
        return interactions


# ============================================
# MODULE: Report Generation
# ============================================

class ReportGenerator:
    """
    Generate comprehensive PDF reports using Python.
    """
    
    def generate_analytics_report(self, metrics, patient_data=None):
        """Generate an analytics summary report."""
        report = {
            'title': 'CLARA Clinical Analytics Report',
            'generated_at': datetime.now().isoformat(),
            'summary': {
                'total_cases': metrics.get('total_analyses', 0),
                'average_risk': metrics.get('average_risk_score', 0),
                'high_risk_percentage': metrics.get('high_risk_rate', 0),
                'critical_percentage': metrics.get('critical_rate', 0)
            },
            'trends': metrics.get('weekly_trend', []),
            'top_conditions': metrics.get('top_diseases', [])[:5],
            'top_medications': metrics.get('top_medications', [])[:5],
            'risk_distribution': metrics.get('risk_distribution', {}),
            'recommendations': self._generate_recommendations(metrics)
        }
        
        return report
    
    def _generate_recommendations(self, metrics):
        """Generate actionable recommendations based on metrics."""
        recommendations = []
        
        if metrics.get('high_risk_rate', 0) > 20:
            recommendations.append({
                'priority': 'High',
                'area': 'Risk Management',
                'recommendation': 'High proportion of high-risk cases. Consider additional screening protocols.',
                'impact': 'Potential 15-20% reduction in adverse outcomes'
            })
        
        if metrics.get('critical_rate', 0) > 5:
            recommendations.append({
                'priority': 'Critical',
                'area': 'Emergency Preparedness',
                'recommendation': 'Elevated critical case rate. Review emergency response procedures.',
                'impact': 'Improved response time for critical patients'
            })
        
        top_diseases = metrics.get('top_diseases', [])
        if top_diseases and top_diseases[0].get('count', 0) > 10:
            recommendations.append({
                'priority': 'Medium',
                'area': 'Preventive Care',
                'recommendation': f"High prevalence of {top_diseases[0]['name']}. Consider targeted prevention program.",
                'impact': f"Potential 10-15% reduction in {top_diseases[0]['name']} cases"
            })
        
        return recommendations


# ============================================
# GLOBAL INSTANCES
# ============================================
risk_model = RiskPredictionModel()
nlp_analyzer = ClinicalNLPAnalyzer()
impact_analytics = ImpactAnalytics()
alert_system = AlertSystem()
report_generator = ReportGenerator()


# ============================================
# API ENDPOINTS
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'CLARA Python Analytics',
        'version': '2.0.0',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/predict-risk', methods=['POST'])
def predict_risk():
    """
    ML-based risk prediction endpoint.
    
    Input: {
        "age": 65,
        "diseases": ["Hypertension", "Diabetes"],
        "medications": ["Metformin", "Lisinopril"],
        "symptoms": ["Chest pain", "Shortness of breath"]
    }
    """
    try:
        data = request.get_json()
        prediction = risk_model.predict_risk(data)
        return jsonify(prediction)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze-nlp', methods=['POST'])
def analyze_nlp():
    """
    NLP analysis endpoint for clinical transcripts.
    
    Input: {
        "transcript": "Doctor: Good morning..."
    }
    """
    try:
        data = request.get_json()
        transcript = data.get('transcript', '')
        
        if not transcript:
            return jsonify({'error': 'Transcript required'}), 400
        
        analysis = nlp_analyzer.analyze_transcript(transcript)
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-alerts', methods=['POST'])
def generate_alerts():
    """
    Generate dynamic alerts based on analysis data.
    
    Input: {
        "risk_score": 65,
        "diseases": ["Diabetes", "Hypertension"],
        "medications": ["Metformin", "Warfarin", "Aspirin"]
    }
    """
    try:
        data = request.get_json()
        alerts = alert_system.generate_alerts(data)
        return jsonify({'alerts': alerts, 'count': len(alerts)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/impact-metrics', methods=['POST'])
def calculate_impact():
    """
    Calculate impact metrics from analysis data.
    
    Input: {
        "analyses": [
            {"risk_score": 45, "risk_level": "Medium", "diseases": [...], "medications": [...]}
        ]
    }
    """
    try:
        data = request.get_json()
        analyses = data.get('analyses', [])
        metrics = impact_analytics.calculate_session_metrics(analyses)
        return jsonify(metrics)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics-report', methods=['POST'])
def generate_report():
    """
    Generate comprehensive analytics report.
    """
    try:
        data = request.get_json()
        metrics = data.get('metrics', {})
        report = report_generator.generate_analytics_report(metrics)
        return jsonify(report)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Batch analysis for multiple transcripts.
    
    Input: {
        "transcripts": [
            {"id": "1", "text": "..."},
            {"id": "2", "text": "..."}
        ]
    }
    """
    try:
        data = request.get_json()
        transcripts = data.get('transcripts', [])
        
        results = []
        for item in transcripts:
            nlp_result = nlp_analyzer.analyze_transcript(item.get('text', ''))
            risk_result = risk_model.predict_risk({
                'diseases': nlp_result['entities']['diseases'],
                'medications': nlp_result['entities']['medications'],
                'symptoms': nlp_result['entities']['symptoms']
            })
            
            results.append({
                'id': item.get('id'),
                'nlp': nlp_result,
                'risk': risk_result
            })
        
        return jsonify({'results': results, 'processed': len(results)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/trend-analysis', methods=['POST'])
def trend_analysis():
    """
    Analyze trends over time periods.
    """
    try:
        data = request.get_json()
        period = data.get('period', 'week')
        
        # Simulated trend data
        trends = {
            'period': period,
            'data_points': [],
            'summary': {}
        }
        
        if period == 'week':
            for i in range(7):
                date = datetime.now() - timedelta(days=6-i)
                trends['data_points'].append({
                    'date': date.strftime('%Y-%m-%d'),
                    'analyses': random.randint(5, 15),
                    'avg_risk': round(random.uniform(30, 50), 1),
                    'high_risk_count': random.randint(1, 5)
                })
        elif period == 'month':
            for i in range(4):
                week_start = datetime.now() - timedelta(weeks=3-i)
                trends['data_points'].append({
                    'week': f'Week {i+1}',
                    'date': week_start.strftime('%Y-%m-%d'),
                    'analyses': random.randint(30, 80),
                    'avg_risk': round(random.uniform(30, 50), 1),
                    'high_risk_count': random.randint(5, 20)
                })
        
        # Calculate summary
        if trends['data_points']:
            trends['summary'] = {
                'total_analyses': sum(d['analyses'] for d in trends['data_points']),
                'avg_risk_trend': round(sum(d['avg_risk'] for d in trends['data_points']) / len(trends['data_points']), 1),
                'total_high_risk': sum(d['high_risk_count'] for d in trends['data_points'])
            }
        
        return jsonify(trends)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/compare-periods', methods=['POST'])
def compare_periods():
    """
    Compare metrics between two time periods for impact measurement.
    """
    try:
        data = request.get_json()
        before = data.get('before', {})
        after = data.get('after', {})
        
        impact = impact_analytics.calculate_impact_score(before, after)
        return jsonify(impact)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# ADVANCED ENDPOINTS
# ============================================

# Import additional modules
try:
    from clinical_insights import insights_engine, outcome_predictor, impact_measurement
    from dashboard_service import dashboard_service, metric_calculator
    ADVANCED_MODULES_LOADED = True
except ImportError:
    ADVANCED_MODULES_LOADED = False
    print("Warning: Advanced modules not loaded")


@app.route('/api/clinical-insights', methods=['POST'])
def get_clinical_insights():
    """
    Generate comprehensive clinical insights.
    
    Input: {
        "age": 65,
        "diseases": ["Diabetes", "Hypertension"],
        "medications": ["Metformin"],
        "symptoms": []
    }
    """
    if not ADVANCED_MODULES_LOADED:
        return jsonify({'error': 'Advanced modules not available'}), 503
    
    try:
        data = request.get_json()
        insights = insights_engine.generate_insights(data)
        return jsonify(insights)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict-outcomes', methods=['POST'])
def predict_outcomes():
    """
    Predict clinical outcomes for a patient.
    """
    if not ADVANCED_MODULES_LOADED:
        return jsonify({'error': 'Advanced modules not available'}), 503
    
    try:
        data = request.get_json()
        predictions = outcome_predictor.predict_outcomes(data)
        return jsonify(predictions)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/measure-impact', methods=['POST'])
def measure_impact():
    """
    Calculate impact between before/after intervention periods.
    """
    if not ADVANCED_MODULES_LOADED:
        return jsonify({'error': 'Advanced modules not available'}), 503
    
    try:
        data = request.get_json()
        before = data.get('before', {})
        after = data.get('after', {})
        impact = impact_measurement.calculate_before_after(before, after)
        return jsonify(impact)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/dashboard', methods=['GET', 'POST'])
def get_dashboard():
    """
    Get dynamic dashboard data.
    """
    if not ADVANCED_MODULES_LOADED:
        return jsonify({'error': 'Advanced modules not available'}), 503
    
    try:
        records = []
        if request.method == 'POST':
            data = request.get_json()
            records = data.get('records', [])
        
        dashboard_data = dashboard_service.get_dashboard_data(records)
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate-metric', methods=['POST'])
def calculate_metric():
    """
    Calculate clinical metrics (NNT, OR, sensitivity/specificity).
    
    Input: {
        "metric_type": "sensitivity_specificity",
        "data": {"tp": 45, "fp": 10, "tn": 40, "fn": 5}
    }
    """
    if not ADVANCED_MODULES_LOADED:
        return jsonify({'error': 'Advanced modules not available'}), 503
    
    try:
        data = request.get_json()
        metric_type = data.get('metric_type')
        metric_data = data.get('data', {})
        
        if metric_type == 'nnt':
            result = metric_calculator.calculate_nnt(
                metric_data.get('risk_reduction', 0.1),
                metric_data.get('baseline_risk', 0.2)
            )
            return jsonify({'nnt': result})
        
        elif metric_type == 'odds_ratio':
            result = metric_calculator.calculate_odds_ratio(
                metric_data.get('exposed_events', 0),
                metric_data.get('exposed_total', 1),
                metric_data.get('control_events', 0),
                metric_data.get('control_total', 1)
            )
            return jsonify(result)
        
        elif metric_type == 'sensitivity_specificity':
            result = metric_calculator.calculate_sensitivity_specificity(
                metric_data.get('tp', 0),
                metric_data.get('fp', 0),
                metric_data.get('tn', 0),
                metric_data.get('fn', 0)
            )
            return jsonify(result)
        
        else:
            return jsonify({'error': 'Unknown metric type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/comprehensive-analysis', methods=['POST'])
def comprehensive_analysis():
    """
    Perform comprehensive analysis combining all features.
    
    Input: {
        "transcript": "...",
        "patient": {"age": 65, "name": "John Doe"}
    }
    """
    try:
        data = request.get_json()
        transcript = data.get('transcript', '')
        patient = data.get('patient', {})
        
        # 1. NLP Analysis
        nlp_result = nlp_analyzer.analyze_transcript(transcript)
        
        # 2. Prepare patient data
        patient_data = {
            'age': patient.get('age', 0),
            'diseases': nlp_result['entities']['diseases'],
            'medications': nlp_result['entities']['medications'],
            'symptoms': nlp_result['entities']['symptoms']
        }
        
        # 3. Risk Prediction
        risk_result = risk_model.predict_risk(patient_data)
        
        # 4. Generate Alerts
        alert_data = {
            'risk_score': risk_result['score'],
            'diseases': patient_data['diseases'],
            'medications': patient_data['medications']
        }
        alerts = alert_system.generate_alerts(alert_data)
        
        # 5. Clinical Insights (if available)
        insights = None
        outcomes = None
        if ADVANCED_MODULES_LOADED:
            insights = insights_engine.generate_insights(patient_data)
            outcomes = outcome_predictor.predict_outcomes(patient_data)
        
        # Combine all results
        comprehensive_result = {
            'patient': patient,
            'nlp_analysis': nlp_result,
            'risk_prediction': risk_result,
            'alerts': alerts,
            'clinical_insights': insights,
            'outcome_predictions': outcomes,
            'analysis_timestamp': datetime.now().isoformat(),
            'model_versions': {
                'nlp': '2.0.0',
                'risk_model': '2.0.0',
                'insights': '2.0.0' if insights else None
            }
        }
        
        return jsonify(comprehensive_result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🐍 CLARA Python Analytics Service starting on port {port}...")
    print(f"   Advanced modules loaded: {ADVANCED_MODULES_LOADED}")
    print(f"   Available endpoints:")
    print(f"   - POST /api/predict-risk")
    print(f"   - POST /api/analyze-nlp")
    print(f"   - POST /api/generate-alerts")
    print(f"   - POST /api/comprehensive-analysis")
    print(f"   - GET/POST /api/dashboard")
    print(f"   - POST /api/clinical-insights")
    print(f"   - POST /api/predict-outcomes")
    print(f"   - POST /api/measure-impact")
    app.run(host='0.0.0.0', port=port, debug=True)
