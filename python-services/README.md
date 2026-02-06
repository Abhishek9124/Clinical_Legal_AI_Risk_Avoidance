# CLARA Python ML Services
# ========================

## Overview
This module provides Python-based Machine Learning and Analytics capabilities for CLARA.

## Features

### 1. ML Risk Prediction (`/api/predict-risk`)
- Machine learning-based risk scoring
- Weighted factor analysis
- Disease severity scoring
- Confidence levels

### 2. NLP Analysis (`/api/analyze-nlp`)
- Entity extraction (diseases, medications, tests, symptoms)
- Sentiment analysis
- Urgency detection
- Case complexity scoring

### 3. Dynamic Alerts (`/api/generate-alerts`)
- Rule-based alert generation
- Drug interaction warnings
- Polypharmacy detection
- Priority-based sorting

### 4. Clinical Insights (`/api/clinical-insights`)
- Evidence-based recommendations
- Comorbidity risk assessment
- Personalized monitoring plans
- Quality metrics calculation

### 5. Outcome Predictions (`/api/predict-outcomes`)
- 30-day hospitalization risk
- 30-day readmission risk
- Adverse event probability
- Overall prognosis

### 6. Impact Measurement (`/api/measure-impact`)
- Before/after period comparison
- Improvement tracking
- Statistical analysis
- Impact score calculation

### 7. Dashboard (`/api/dashboard`)
- Real-time metrics
- Trend visualization data
- Disease/medication distributions
- Performance metrics

### 8. Clinical Metrics Calculator (`/api/calculate-metric`)
- Number Needed to Treat (NNT)
- Odds Ratio with CI
- Sensitivity/Specificity
- PPV/NPV/Accuracy

## Installation

```bash
cd python-services
pip install -r requirements.txt
python app.py
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/predict-risk` | POST | ML risk prediction |
| `/api/analyze-nlp` | POST | NLP analysis |
| `/api/generate-alerts` | POST | Dynamic alerts |
| `/api/clinical-insights` | POST | Clinical insights |
| `/api/predict-outcomes` | POST | Outcome predictions |
| `/api/measure-impact` | POST | Impact measurement |
| `/api/dashboard` | GET/POST | Dashboard data |
| `/api/calculate-metric` | POST | Metric calculations |
| `/api/comprehensive-analysis` | POST | Full analysis |
| `/api/trend-analysis` | POST | Trend data |
| `/api/batch-analyze` | POST | Batch processing |

## Configuration

Default port: `5000`

Set environment variable `PORT` to change:
```bash
PORT=5001 python app.py
```

## Measurable Impact Metrics

### Risk Reduction Tracking
- Before/after risk score comparison
- High-risk rate change monitoring
- Statistical significance calculation

### Quality Metrics
- Analysis completion rate
- Risk prediction accuracy
- Entity extraction precision

### Clinical Outcomes
- Hospitalization risk trends
- Readmission patterns
- Alert effectiveness

## Technology Stack
- Flask 3.0 (Web Framework)
- scikit-learn (ML algorithms)
- NumPy/Pandas (Data processing)
- CORS enabled for frontend integration
