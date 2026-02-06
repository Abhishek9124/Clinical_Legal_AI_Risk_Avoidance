const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clara';
const JWT_SECRET = process.env.JWT_SECRET || 'clara-healthcare-secret-key-2024';
const JWT_EXPIRES_IN = '7d';

// --- Middleware ---
app.use(cors());      
app.use(express.json({ limit: '10mb' }));

// --- JWT Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Role-based access control middleware
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to local MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// --- Email Configuration ---
// Configure your SMTP settings here (Gmail, Outlook, etc.)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// ============================================
// DATABASE SCHEMAS
// ============================================

// --- User Schema (Patients & Staff) ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin', 'nurse', 'receptionist'], default: 'patient' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'India' }
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    medicalInfo: {
        bloodGroup: String,
        allergies: [String],
        chronicConditions: [String],
        currentMedications: [String]
    },
    insuranceInfo: {
        provider: String,
        policyNumber: String,
        groupNumber: String
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    profilePicture: String,
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
    }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// --- Doctor Schema ---
const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true },
    subspecialties: [String],
    qualifications: [{
        degree: String,
        institution: String,
        year: Number
    }],
    registrationNumber: { type: String, required: true, unique: true },
    experience: { type: Number, default: 0 }, // years
    consultationFee: { type: Number, default: 500 },
    followUpFee: { type: Number, default: 300 },
    bio: String,
    languages: [{ type: String, default: ['English', 'Hindi'] }],
    // Weekly schedule template
    weeklySchedule: [{
        dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday
        isWorking: { type: Boolean, default: true },
        slots: [{
            startTime: String, // "09:00"
            endTime: String,   // "17:00"
            slotDuration: { type: Number, default: 30 }, // minutes
            maxPatients: { type: Number, default: 1 },
            slotType: { type: String, enum: ['regular', 'emergency', 'followup'], default: 'regular' }
        }]
    }],
    // Specific date overrides (holidays, special hours)
    scheduleOverrides: [{
        date: Date,
        isWorking: Boolean,
        reason: String,
        slots: [{
            startTime: String,
            endTime: String,
            slotDuration: Number,
            maxPatients: Number
        }]
    }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalPatients: { type: Number, default: 0 },
    totalAppointments: { type: Number, default: 0 },
    department: String,
    isAvailableForEmergency: { type: Boolean, default: false },
    telemedicineEnabled: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// --- Appointment Schema ---
const appointmentSchema = new mongoose.Schema({
    appointmentId: { type: String, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true }
    },
    appointmentType: { 
        type: String, 
        enum: ['regular', 'followup', 'emergency', 'telemedicine', 'consultation'],
        default: 'regular'
    },
    status: { 
        type: String, 
        enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show', 'rescheduled'],
        default: 'scheduled'
    },
    reason: { type: String, required: true },
    symptoms: [String],
    notes: String,
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    consultationMode: { type: String, enum: ['in-person', 'video', 'phone'], default: 'in-person' },
    // Rescheduling history
    rescheduleHistory: [{
        previousDate: Date,
        previousTime: String,
        newDate: Date,
        newTime: String,
        reason: String,
        rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rescheduledAt: { type: Date, default: Date.now }
    }],
    cancellation: {
        cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        cancelledAt: Date,
        reason: String,
        refundStatus: String
    },
    // Reminder tracking
    reminders: [{
        type: { type: String, enum: ['email', 'sms', 'push'] },
        sentAt: Date,
        status: String,
        scheduledFor: Date
    }],
    checkinTime: Date,
    consultationStartTime: Date,
    consultationEndTime: Date,
    waitingTime: Number, // minutes
    fee: Number,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded', 'waived'], default: 'pending' },
    paymentId: String,
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date,
    rating: { type: Number, min: 1, max: 5 },
    feedback: String
}, { timestamps: true });

// Auto-generate appointment ID
appointmentSchema.pre('save', async function(next) {
    if (!this.appointmentId) {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        this.appointmentId = `APT-${date}-${random}`;
    }
    next();
});

// --- Prescription Schema ---
const prescriptionSchema = new mongoose.Schema({
    prescriptionId: { type: String, unique: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    diagnosis: [{
        condition: String,
        icdCode: String,
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
        notes: String
    }],
    medications: [{
        name: { type: String, required: true },
        genericName: String,
        dosage: String,
        frequency: String, // "twice daily", "every 8 hours"
        duration: String,  // "7 days", "2 weeks"
        instructions: String, // "Take after meals"
        quantity: Number,
        refills: { type: Number, default: 0 },
        isGeneric: { type: Boolean, default: false },
        aiSuggested: { type: Boolean, default: false },
        validationStatus: { type: String, enum: ['pending', 'validated', 'contraindicated', 'caution'] }
    }],
    labTests: [{
        testName: String,
        testCode: String,
        instructions: String,
        urgency: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine' }
    }],
    procedures: [{
        name: String,
        instructions: String
    }],
    advice: [String],
    dietRecommendations: [String],
    lifestyleModifications: [String],
    followUpInstructions: String,
    followUpDate: Date,
    validUntil: Date,
    digitalSignature: String,
    qrCode: String,
    isDispensed: { type: Boolean, default: false },
    dispensedAt: Date,
    dispensedBy: String,
    pharmacyNotes: String,
    // AI-assisted generation metadata
    aiGenerated: {
        isAiAssisted: { type: Boolean, default: false },
        confidence: Number,
        suggestions: [String],
        warnings: [String],
        drugInteractions: [{
            drug1: String,
            drug2: String,
            severity: String,
            description: String
        }]
    }
}, { timestamps: true });

prescriptionSchema.pre('save', async function(next) {
    if (!this.prescriptionId) {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        this.prescriptionId = `RX-${date}-${random}`;
    }
    if (!this.validUntil) {
        this.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days validity
    }
    next();
});

// --- Notification Schema ---
const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['appointment_reminder', 'appointment_confirmed', 'appointment_cancelled', 
               'appointment_rescheduled', 'prescription_ready', 'lab_results', 
               'payment_received', 'general', 'emergency'],
        required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed, // Additional data like appointmentId
    channels: [{
        channel: { type: String, enum: ['email', 'sms', 'push', 'in-app'] },
        status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
        sentAt: Date,
        error: String
    }],
    isRead: { type: Boolean, default: false },
    readAt: Date,
    scheduledFor: Date,
    expiresAt: Date
}, { timestamps: true });

// --- Doctor Review Schema ---
const reviewSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: String,
    isAnonymous: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    response: {
        text: String,
        respondedAt: Date
    }
}, { timestamps: true });
  
const recordSchema = new mongoose.Schema({
    analysis: { type: Object, required: true },
    qrToken: { type: String, unique: true, sparse: true },
    emailSent: { type: Boolean, default: false },
    emailSentTo: { type: String }
}, { timestamps: true }); 

// --- Statistics Schema ---
const statisticsSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    weekNumber: { type: Number, required: true },
    year: { type: Number, required: true },
    diseases: [{
        name: { type: String, required: true },
        count: { type: Number, default: 1 }
    }],
    medications: [{
        name: { type: String, required: true },
        count: { type: Number, default: 1 }
    }],
    tests: [{
        name: { type: String, required: true },
        count: { type: Number, default: 1 }
    }],
    riskLevels: {
        low: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        high: { type: Number, default: 0 },
        critical: { type: Number, default: 0 }
    },
    totalAnalyses: { type: Number, default: 0 },
    averageRiskScore: { type: Number, default: 0 }
}, { timestamps: true });

// Demo Patients Schema
const demoPatientSchema = new mongoose.Schema({
    patientId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    dob: { type: String },
    gender: { type: String },
    phone: { type: String },
    email: { type: String },
    bloodGroup: { type: String },
    address: { type: String },
    medicalHistory: [{ type: String }],
    currentMedications: [{ type: String }],
    allergies: [{ type: String }],
    transcript: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Prescription = mongoose.model('Prescription', prescriptionSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Review = mongoose.model('Review', reviewSchema);
const Record = mongoose.model('Record', recordSchema);
const Statistics = mongoose.model('Statistics', statisticsSchema);
const DemoPatient = mongoose.model('DemoPatient', demoPatientSchema);

// --- Helper Functions ---
const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const generateQRToken = () => {
    return 'CLARA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// --- Update Statistics on New Record ---
const updateStatistics = async (analysis) => {
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();

    let stats = await Statistics.findOne({ weekNumber, year });
    
    if (!stats) {
        stats = new Statistics({
            date: now,
            weekNumber,
            year,
            diseases: [],
            medications: [],
            tests: [],
            riskLevels: { low: 0, medium: 0, high: 0, critical: 0 },
            totalAnalyses: 0,
            averageRiskScore: 0
        });
    }

    // Update diseases
    if (analysis.entities?.DISEASE) {
        for (const disease of analysis.entities.DISEASE) {
            const existing = stats.diseases.find(d => d.name.toLowerCase() === disease.toLowerCase());
            if (existing) {
                existing.count += 1;
            } else {
                stats.diseases.push({ name: disease, count: 1 });
            }
        }
    }

    // Update medications
    if (analysis.entities?.DRUG) {
        for (const drug of analysis.entities.DRUG) {
            const existing = stats.medications.find(m => m.name.toLowerCase() === drug.toLowerCase());
            if (existing) {
                existing.count += 1;
            } else {
                stats.medications.push({ name: drug, count: 1 });
            }
        }
    }

    // Update tests
    if (analysis.entities?.TEST) {
        for (const test of analysis.entities.TEST) {
            const existing = stats.tests.find(t => t.name.toLowerCase() === test.toLowerCase());
            if (existing) {
                existing.count += 1;
            } else {
                stats.tests.push({ name: test, count: 1 });
            }
        }
    }

    // Update risk levels
    if (analysis.risk_assessment?.level) {
        const level = analysis.risk_assessment.level.toLowerCase();
        if (stats.riskLevels[level] !== undefined) {
            stats.riskLevels[level] += 1;
        }
    }

    // Update average risk score
    const currentTotal = stats.averageRiskScore * stats.totalAnalyses;
    stats.totalAnalyses += 1;
    const newScore = analysis.risk_assessment?.score || 0;
    stats.averageRiskScore = (currentTotal + newScore) / stats.totalAnalyses;

    await stats.save();
    return stats;
};

// --- Generate PDF Report ---
const generatePDFReport = (analysis) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(24).fillColor('#1e40af').text('CLARA Clinical Report', { align: 'center' });
        doc.fontSize(12).fillColor('#64748b').text('Clinical Legal AI for Risk Avoidance', { align: 'center' });
        doc.moveDown(2);

        // Patient Info
        doc.fontSize(16).fillColor('#1e293b').text('Patient Information');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#475569');
        doc.text(`Patient Name: ${analysis.patient_name || 'N/A'}`);
        doc.text(`Patient ID: ${analysis.patient_id || 'N/A'}`);
        doc.text(`Age: ${analysis.age || 'N/A'}`);
        doc.text(`Report Date: ${new Date().toLocaleString()}`);
        doc.moveDown();

        // Risk Assessment
        doc.fontSize(16).fillColor('#1e293b').text('Risk Assessment');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.moveDown(0.5);
        const riskColors = { low: '#22c55e', medium: '#eab308', high: '#f97316', critical: '#ef4444' };
        const riskLevel = analysis.risk_assessment?.level?.toLowerCase() || 'unknown';
        doc.fontSize(14).fillColor(riskColors[riskLevel] || '#64748b')
           .text(`Risk Level: ${analysis.risk_assessment?.level || 'N/A'} (${analysis.risk_assessment?.score || 0}%)`);
        doc.fontSize(11).fillColor('#475569');
        if (analysis.risk_assessment?.factors?.length) {
            doc.text('Contributing Factors:');
            analysis.risk_assessment.factors.forEach(f => doc.text(`  • ${f}`));
        }
        doc.moveDown();

        // Diagnoses
        doc.fontSize(16).fillColor('#1e293b').text('Diagnoses (ICD-10)');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#475569');
        if (analysis.icd10_codes?.length) {
            analysis.icd10_codes.forEach(code => {
                const condition = analysis.fhir_output?.conditions?.find(c => c.code === code);
                doc.text(`  • ${code}: ${condition?.display || 'Unknown'}`);
            });
        } else {
            doc.text('  No diagnoses recorded');
        }
        doc.moveDown();

        // Medications
        doc.fontSize(16).fillColor('#1e293b').text('Medications');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#475569');
        if (analysis.entities?.DRUG?.length) {
            analysis.entities.DRUG.forEach(drug => doc.text(`  • ${drug}`));
        } else {
            doc.text('  No medications recorded');
        }
        doc.moveDown();

        // Drug Validation
        if (analysis.drug_validation?.length) {
            doc.fontSize(16).fillColor('#1e293b').text('Drug Validation');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
            doc.moveDown(0.5);
            analysis.drug_validation.forEach(v => {
                const statusColor = v.validation_status === 'Appropriate' ? '#22c55e' : 
                                   v.validation_status === 'Contraindicated' ? '#ef4444' : '#eab308';
                doc.fontSize(12).fillColor('#1e293b').text(v.drug_name);
                doc.fontSize(10).fillColor(statusColor).text(`  Status: ${v.validation_status}`);
                doc.fontSize(10).fillColor('#475569').text(`  ${v.reasoning}`);
                doc.moveDown(0.3);
            });
        }

        // AI Summary
        doc.moveDown();
        doc.fontSize(16).fillColor('#1e293b').text('AI Clinical Summary');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#475569');
        doc.text(analysis.chatbot_response?.summary || 'No summary available');
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#1e40af').text('Advice: ', { continued: true });
        doc.fillColor('#475569').text(analysis.chatbot_response?.advice || 'N/A');
        doc.moveDown();

        // Disclaimer
        doc.fontSize(9).fillColor('#94a3b8')
           .text(analysis.chatbot_response?.disclaimer || 'This is an AI-generated report and should be reviewed by a qualified healthcare professional.', { align: 'center' });

        doc.end();
    });
};

// GET /api/records - Fetches all saved records
app.get('/api/records', async (req, res) => {
  try {
    const records = await Record.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching records', error });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const qrToken = generateQRToken();
    const newRecord = new Record({ 
        analysis: req.body,
        qrToken: qrToken
    });
    await newRecord.save();
    
    // Update weekly statistics
    await updateStatistics(req.body);
    
    res.status(201).json({ ...newRecord.toObject(), qrToken });
  } catch (error) {
    res.status(400).json({ message: 'Error saving record', error });
  }
});

// --- QR Code Generation Endpoint ---
app.get('/api/records/:id/qr', async (req, res) => {
    try {
        const { id } = req.params;
        const record = await Record.findById(id);
        
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        // Generate QR token if not exists
        if (!record.qrToken) {
            record.qrToken = generateQRToken();
            await record.save();
        }

        // Create QR code data URL containing email link
        const emailLink = `${req.protocol}://${req.get('host')}/api/records/email/${record.qrToken}`;
        const qrDataUrl = await QRCode.toDataURL(emailLink, {
            width: 300,
            margin: 2,
            color: { dark: '#1e40af', light: '#ffffff' }
        });

        res.json({ 
            qrCode: qrDataUrl, 
            token: record.qrToken,
            emailLink: emailLink
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating QR code', error: error.message });
    }
});

// --- Email Report via QR Token ---
app.get('/api/records/email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { email } = req.query;

        const record = await Record.findOne({ qrToken: token });
        
        if (!record) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html><head><title>CLARA - Report Not Found</title>
                <style>body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;background:#f1f5f9;margin:0}
                .card{background:white;padding:40px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);text-align:center;max-width:400px}
                h1{color:#ef4444;margin-bottom:16px}p{color:#64748b}</style></head>
                <body><div class="card"><h1>Report Not Found</h1><p>This report may have been deleted or the link is invalid.</p></div></body></html>
            `);
        }

        // If email is provided, send the report
        if (email) {
            const pdfBuffer = await generatePDFReport(record.analysis);
            
            await transporter.sendMail({
                from: '"CLARA Clinical AI" <noreply@clara.ai>',
                to: email,
                subject: `Clinical Report - ${record.analysis.patient_name || 'Patient'} - ${new Date().toLocaleDateString()}`,
                html: `
                    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: white; margin: 0;">🩺 CLARA Clinical Report</h1>
                            <p style="color: #bfdbfe; margin-top: 8px;">Clinical Legal AI for Risk Avoidance</p>
                        </div>
                        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
                            <h2 style="color: #1e293b; margin-top: 0;">Patient: ${record.analysis.patient_name || 'N/A'}</h2>
                            <p style="color: #64748b;">Patient ID: ${record.analysis.patient_id || 'N/A'} | Age: ${record.analysis.age || 'N/A'}</p>
                            
                            <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
                                <h3 style="color: #1e293b; margin: 0 0 8px 0;">Risk Assessment</h3>
                                <p style="font-size: 24px; font-weight: bold; color: ${
                                    record.analysis.risk_assessment?.level?.toLowerCase() === 'low' ? '#22c55e' :
                                    record.analysis.risk_assessment?.level?.toLowerCase() === 'medium' ? '#eab308' :
                                    record.analysis.risk_assessment?.level?.toLowerCase() === 'high' ? '#f97316' : '#ef4444'
                                }; margin: 0;">
                                    ${record.analysis.risk_assessment?.level || 'N/A'} (${record.analysis.risk_assessment?.score || 0}%)
                                </p>
                            </div>
                            
                            <p style="color: #475569;"><strong>Summary:</strong> ${record.analysis.chatbot_response?.summary || 'No summary available.'}</p>
                            <p style="color: #1e40af;"><strong>Advice:</strong> ${record.analysis.chatbot_response?.advice || 'N/A'}</p>
                            
                            <p style="font-size: 12px; color: #94a3b8; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                                ${record.analysis.chatbot_response?.disclaimer || 'This is an AI-generated report. Please consult a healthcare professional.'}
                            </p>
                        </div>
                        <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
                            <p style="color: #64748b; margin: 0; font-size: 12px;">Generated by CLARA - Clinical Legal AI for Risk Avoidance</p>
                        </div>
                    </div>
                `,
                attachments: [{
                    filename: `CLARA_Report_${record.analysis.patient_id || 'patient'}_${Date.now()}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }]
            });

            // Update record
            record.emailSent = true;
            record.emailSentTo = email;
            await record.save();

            return res.send(`
                <!DOCTYPE html>
                <html><head><title>CLARA - Report Sent</title>
                <style>body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;background:#f1f5f9;margin:0}
                .card{background:white;padding:40px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);text-align:center;max-width:400px}
                h1{color:#22c55e;margin-bottom:16px}p{color:#64748b}.emoji{font-size:48px;margin-bottom:16px}</style></head>
                <body><div class="card"><div class="emoji">✅</div><h1>Report Sent!</h1><p>The clinical report has been sent to <strong>${email}</strong></p></div></body></html>
            `);
        }

        // Show email input form
        res.send(`
            <!DOCTYPE html>
            <html><head><title>CLARA - Send Report</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body{font-family:system-ui;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f1f5f9;margin:0;padding:20px;box-sizing:border-box}
                .card{background:white;padding:40px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);text-align:center;max-width:400px;width:100%}
                h1{color:#1e40af;margin-bottom:8px}
                .subtitle{color:#64748b;margin-bottom:24px}
                .patient-info{background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;text-align:left}
                .patient-info h3{margin:0 0 8px 0;color:#1e293b}
                .patient-info p{margin:4px 0;color:#64748b;font-size:14px}
                .risk{display:inline-block;padding:4px 12px;border-radius:20px;font-weight:600;font-size:14px}
                .risk.low{background:#dcfce7;color:#166534}
                .risk.medium{background:#fef9c3;color:#854d0e}
                .risk.high{background:#ffedd5;color:#c2410c}
                .risk.critical{background:#fee2e2;color:#dc2626}
                input[type="email"]{width:100%;padding:12px;border:1px solid #e2e8f0;border-radius:8px;font-size:16px;margin-bottom:16px;box-sizing:border-box}
                input[type="email"]:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
                button{width:100%;padding:12px;background:#1e40af;color:white;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer}
                button:hover{background:#1e3a8a}
                .emoji{font-size:48px;margin-bottom:16px}
            </style></head>
            <body>
                <div class="card">
                    <div class="emoji">🩺</div>
                    <h1>CLARA Clinical Report</h1>
                    <p class="subtitle">Enter your email to receive the report</p>
                    
                    <div class="patient-info">
                        <h3>${record.analysis.patient_name || 'Patient'}</h3>
                        <p>ID: ${record.analysis.patient_id || 'N/A'} | Age: ${record.analysis.age || 'N/A'}</p>
                        <p style="margin-top:12px">Risk Level: <span class="risk ${(record.analysis.risk_assessment?.level || 'unknown').toLowerCase()}">${record.analysis.risk_assessment?.level || 'N/A'} (${record.analysis.risk_assessment?.score || 0}%)</span></p>
                    </div>
                    
                    <form method="GET">
                        <input type="email" name="email" placeholder="your@email.com" required>
                        <button type="submit">📧 Send Report to Email</button>
                    </form>
                </div>
            </body></html>
        `);
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html><head><title>CLARA - Error</title>
            <style>body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;background:#f1f5f9;margin:0}
            .card{background:white;padding:40px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);text-align:center;max-width:400px}
            h1{color:#ef4444;margin-bottom:16px}p{color:#64748b}</style></head>
            <body><div class="card"><h1>Error Sending Report</h1><p>${error.message}</p></div></body></html>
        `);
    }
});

// --- Download PDF Report ---
app.get('/api/records/:id/pdf', async (req, res) => {
    try {
        const { id } = req.params;
        const record = await Record.findById(id);
        
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        const pdfBuffer = await generatePDFReport(record.analysis);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CLARA_Report_${record.analysis.patient_id || 'patient'}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
});

// --- Weekly Statistics Endpoints ---
app.get('/api/statistics/weekly', async (req, res) => {
    try {
        const { weeks = 4 } = req.query;
        const stats = await Statistics.find()
            .sort({ year: -1, weekNumber: -1 })
            .limit(parseInt(weeks));
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching statistics', error });
    }
});

app.get('/api/statistics/current-week', async (req, res) => {
    try {
        const now = new Date();
        const weekNumber = getWeekNumber(now);
        const year = now.getFullYear();
        
        let stats = await Statistics.findOne({ weekNumber, year });
        
        if (!stats) {
            stats = {
                weekNumber,
                year,
                diseases: [],
                medications: [],
                tests: [],
                riskLevels: { low: 0, medium: 0, high: 0, critical: 0 },
                totalAnalyses: 0,
                averageRiskScore: 0
            };
        }
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching current week statistics', error });
    }
});

app.get('/api/statistics/common-diseases', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Aggregate diseases from all time
        const allStats = await Statistics.find();
        const diseaseMap = new Map();
        
        allStats.forEach(stat => {
            stat.diseases.forEach(d => {
                const existing = diseaseMap.get(d.name.toLowerCase()) || { name: d.name, count: 0 };
                existing.count += d.count;
                diseaseMap.set(d.name.toLowerCase(), existing);
            });
        });
        
        const sortedDiseases = Array.from(diseaseMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, parseInt(limit));
        
        res.json(sortedDiseases);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching common diseases', error });
    }
});

app.get('/api/statistics/dashboard', async (req, res) => {
    try {
        const now = new Date();
        const weekNumber = getWeekNumber(now);
        const year = now.getFullYear();
        
        // Current week stats
        const currentWeek = await Statistics.findOne({ weekNumber, year });
        
        // Last 4 weeks stats
        const recentStats = await Statistics.find()
            .sort({ year: -1, weekNumber: -1 })
            .limit(4);
        
        // All time totals
        const allStats = await Statistics.find();
        
        // Aggregate all-time data
        const allTimeDiseases = new Map();
        const allTimeMedications = new Map();
        let totalAnalyses = 0;
        let totalRiskScore = 0;
        const allTimeRiskLevels = { low: 0, medium: 0, high: 0, critical: 0 };
        
        allStats.forEach(stat => {
            totalAnalyses += stat.totalAnalyses;
            totalRiskScore += stat.averageRiskScore * stat.totalAnalyses;
            
            Object.keys(allTimeRiskLevels).forEach(level => {
                allTimeRiskLevels[level] += stat.riskLevels[level] || 0;
            });
            
            stat.diseases.forEach(d => {
                const existing = allTimeDiseases.get(d.name.toLowerCase()) || { name: d.name, count: 0 };
                existing.count += d.count;
                allTimeDiseases.set(d.name.toLowerCase(), existing);
            });
            
            stat.medications.forEach(m => {
                const existing = allTimeMedications.get(m.name.toLowerCase()) || { name: m.name, count: 0 };
                existing.count += m.count;
                allTimeMedications.set(m.name.toLowerCase(), existing);
            });
        });
        
        res.json({
            currentWeek: currentWeek || {
                weekNumber,
                year,
                diseases: [],
                medications: [],
                riskLevels: { low: 0, medium: 0, high: 0, critical: 0 },
                totalAnalyses: 0,
                averageRiskScore: 0
            },
            recentWeeks: recentStats,
            allTime: {
                totalAnalyses,
                averageRiskScore: totalAnalyses > 0 ? totalRiskScore / totalAnalyses : 0,
                riskLevels: allTimeRiskLevels,
                topDiseases: Array.from(allTimeDiseases.values()).sort((a, b) => b.count - a.count).slice(0, 10),
                topMedications: Array.from(allTimeMedications.values()).sort((a, b) => b.count - a.count).slice(0, 10)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard statistics', error });
    }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid record ID' });
    }
    const deletedRecord = await Record.findByIdAndDelete(id);
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record', error });
  }
});

// ============================================
// DEMO PATIENTS API
// ============================================

// Sync demo patients from frontend
app.post('/api/demo-patients/sync', async (req, res) => {
    try {
        const { patients } = req.body;
        
        if (!patients || !Array.isArray(patients)) {
            return res.status(400).json({ message: 'Invalid patients data' });
        }
        
        const results = [];
        for (const patient of patients) {
            const existingPatient = await DemoPatient.findOne({ patientId: patient.id });
            
            if (existingPatient) {
                // Update existing
                const updated = await DemoPatient.findOneAndUpdate(
                    { patientId: patient.id },
                    {
                        name: patient.name,
                        age: patient.age,
                        dob: patient.dob,
                        gender: patient.gender,
                        phone: patient.phone,
                        email: patient.email,
                        bloodGroup: patient.bloodGroup,
                        address: patient.address,
                        medicalHistory: patient.medicalHistory || [],
                        currentMedications: patient.currentMedications || [],
                        allergies: patient.allergies || [],
                        transcript: patient.transcript
                    },
                    { new: true }
                );
                results.push({ id: patient.id, action: 'updated' });
            } else {
                // Create new
                const newPatient = new DemoPatient({
                    patientId: patient.id,
                    name: patient.name,
                    age: patient.age,
                    dob: patient.dob,
                    gender: patient.gender,
                    phone: patient.phone,
                    email: patient.email,
                    bloodGroup: patient.bloodGroup,
                    address: patient.address,
                    medicalHistory: patient.medicalHistory || [],
                    currentMedications: patient.currentMedications || [],
                    allergies: patient.allergies || [],
                    transcript: patient.transcript
                });
                await newPatient.save();
                results.push({ id: patient.id, action: 'created' });
            }
        }
        
        res.status(200).json({ 
            message: 'Demo patients synced successfully', 
            count: results.length,
            results 
        });
    } catch (error) {
        console.error('Error syncing demo patients:', error);
        res.status(500).json({ message: 'Error syncing demo patients', error: error.message });
    }
});

// Get all demo patients
app.get('/api/demo-patients', async (req, res) => {
    try {
        const patients = await DemoPatient.find({}).sort({ name: 1 });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching demo patients', error });
    }
});

// Get demo patient by ID
app.get('/api/demo-patients/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await DemoPatient.findOne({ patientId });
        
        if (!patient) {
            return res.status(404).json({ message: 'Demo patient not found' });
        }
        
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching demo patient', error });
    }
});

// ============================================
// KNOWLEDGE BASE API (RAG Support)
// ============================================

// Medical knowledge base for RAG queries
const medicalKnowledge = {
    drugInteractions: {
        'warfarin': { contraindicated: ['aspirin', 'ibuprofen', 'naproxen'], caution: ['acetaminophen', 'vitamin k'] },
        'metformin': { contraindicated: ['alcohol'], caution: ['contrast dye', 'diuretics'] },
        'lisinopril': { contraindicated: ['potassium supplements', 'spironolactone'], caution: ['nsaids', 'lithium'] },
        'atorvastatin': { contraindicated: ['gemfibrozil', 'cyclosporine'], caution: ['grapefruit', 'erythromycin'] },
        'amlodipine': { contraindicated: [], caution: ['simvastatin', 'cyclosporine'] }
    },
    icd10: {
        'I10': 'Essential (primary) hypertension',
        'E11': 'Type 2 diabetes mellitus',
        'I25': 'Chronic ischemic heart disease',
        'I50': 'Heart failure',
        'J18': 'Pneumonia, unspecified organism',
        'J45': 'Asthma',
        'J44': 'COPD',
        'I21': 'Acute myocardial infarction'
    }
};

app.post('/api/knowledge/drug-interaction', (req, res) => {
    const { drug1, drug2 } = req.body;
    
    if (!drug1 || !drug2) {
        return res.status(400).json({ message: 'Both drug names required' });
    }
    
    const d1Lower = drug1.toLowerCase();
    const d2Lower = drug2.toLowerCase();
    
    const drugData = medicalKnowledge.drugInteractions[d1Lower];
    if (drugData) {
        if (drugData.contraindicated.includes(d2Lower)) {
            return res.json({ severity: 'high', message: `${drug1} and ${drug2} are contraindicated together.` });
        }
        if (drugData.caution.includes(d2Lower)) {
            return res.json({ severity: 'medium', message: `Use ${drug1} and ${drug2} with caution.` });
        }
    }
    
    res.json({ severity: 'low', message: 'No known interaction found.' });
});

app.get('/api/knowledge/icd10/:code', (req, res) => {
    const { code } = req.params;
    const description = medicalKnowledge.icd10[code.toUpperCase()];
    
    if (description) {
        res.json({ code: code.toUpperCase(), description });
    } else {
        res.status(404).json({ message: 'ICD-10 code not found' });
    }
});

app.get('/api/knowledge/search', (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return res.status(400).json({ message: 'Search query required' });
    }
    
    const results = [];
    const queryLower = q.toLowerCase();
    
    // Search drugs
    Object.keys(medicalKnowledge.drugInteractions).forEach(drug => {
        if (drug.includes(queryLower)) {
            results.push({ type: 'drug', name: drug, data: medicalKnowledge.drugInteractions[drug] });
        }
    });
    
    // Search ICD-10
    Object.entries(medicalKnowledge.icd10).forEach(([code, desc]) => {
        if (code.toLowerCase().includes(queryLower) || desc.toLowerCase().includes(queryLower)) {
            results.push({ type: 'icd10', code, description: desc });
        }
    });
    
    res.json(results);
});

// ============================================
// AUTHENTICATION API
// ============================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role = 'patient', dateOfBirth, gender } = req.body;
        
        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Email, password, first name, and last name are required' });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        
        // Create user
        const user = new User({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            phone,
            role: ['patient', 'doctor', 'admin', 'nurse', 'receptionist'].includes(role) ? role : 'patient',
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender
        });
        
        await user.save();
        
        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        // Send welcome email
        try {
            await transporter.sendMail({
                from: '"CLARA Healthcare" <noreply@clara.ai>',
                to: user.email,
                subject: 'Welcome to CLARA Healthcare',
                html: `
                    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #1e40af;">Welcome to CLARA! 🩺</h1>
                        <p>Hi ${firstName},</p>
                        <p>Your account has been created successfully. You can now book appointments, manage prescriptions, and access our AI-powered healthcare services.</p>
                        <p><strong>Your Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
                        <p>Best regards,<br>The CLARA Team</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.log('Welcome email failed:', emailError.message);
        }
        
        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        // Get doctor profile if user is a doctor
        let doctorProfile = null;
        if (user.role === 'doctor') {
            doctorProfile = await Doctor.findOne({ userId: user._id });
        }
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                phone: user.phone,
                doctorProfile: doctorProfile ? {
                    id: doctorProfile._id,
                    specialization: doctorProfile.specialization,
                    registrationNumber: doctorProfile.registrationNumber
                } : null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        let doctorProfile = null;
        if (user.role === 'doctor') {
            doctorProfile = await Doctor.findOne({ userId: user._id });
        }
        
        res.json({ user, doctorProfile });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const updates = req.body;
        delete updates.password; // Don't allow password update through this endpoint
        delete updates.role; // Don't allow role change
        delete updates.email; // Don't allow email change
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Change password
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.userId);
        const isMatch = await user.comparePassword(currentPassword);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
});

// ============================================
// DOCTOR MANAGEMENT API
// ============================================

// Register doctor profile (requires doctor role)
app.post('/api/doctors/register', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        // Only allow doctors or admins to register doctor profiles
        if (!['doctor', 'admin'].includes(user.role)) {
            return res.status(403).json({ message: 'Only doctors can create doctor profiles' });
        }
        
        const existingDoctor = await Doctor.findOne({ userId: req.user.userId });
        if (existingDoctor) {
            return res.status(409).json({ message: 'Doctor profile already exists' });
        }
        
        const { 
            specialization, subspecialties, qualifications, registrationNumber,
            experience, consultationFee, followUpFee, bio, languages, department,
            isAvailableForEmergency, telemedicineEnabled
        } = req.body;
        
        // Create default weekly schedule
        const defaultSchedule = [];
        for (let day = 0; day < 7; day++) {
            defaultSchedule.push({
                dayOfWeek: day,
                isWorking: day !== 0, // Sunday off by default
                slots: day !== 0 ? [
                    { startTime: '09:00', endTime: '13:00', slotDuration: 30, maxPatients: 1, slotType: 'regular' },
                    { startTime: '14:00', endTime: '17:00', slotDuration: 30, maxPatients: 1, slotType: 'regular' }
                ] : []
            });
        }
        
        const doctor = new Doctor({
            userId: req.user.userId,
            specialization,
            subspecialties: subspecialties || [],
            qualifications: qualifications || [],
            registrationNumber,
            experience: experience || 0,
            consultationFee: consultationFee || 500,
            followUpFee: followUpFee || 300,
            bio,
            languages: languages || ['English', 'Hindi'],
            weeklySchedule: defaultSchedule,
            department,
            isAvailableForEmergency: isAvailableForEmergency || false,
            telemedicineEnabled: telemedicineEnabled !== false
        });
        
        await doctor.save();
        
        res.status(201).json({ 
            message: 'Doctor profile created successfully', 
            doctor: await Doctor.findById(doctor._id).populate('userId', 'firstName lastName email phone')
        });
    } catch (error) {
        console.error('Doctor registration error:', error);
        res.status(500).json({ message: 'Error creating doctor profile', error: error.message });
    }
});

// Get all doctors (public)
app.get('/api/doctors', async (req, res) => {
    try {
        const { specialization, available, search, page = 1, limit = 20 } = req.query;
        
        const query = { isActive: true };
        
        if (specialization) {
            query.specialization = new RegExp(specialization, 'i');
        }
        
        const doctors = await Doctor.find(query)
            .populate('userId', 'firstName lastName email phone profilePicture')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ averageRating: -1 });
        
        const total = await Doctor.countDocuments(query);
        
        // Filter by search term if provided
        let filteredDoctors = doctors;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredDoctors = doctors.filter(d => 
                d.userId.firstName.toLowerCase().includes(searchLower) ||
                d.userId.lastName.toLowerCase().includes(searchLower) ||
                d.specialization.toLowerCase().includes(searchLower)
            );
        }
        
        res.json({
            doctors: filteredDoctors,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: filteredDoctors.length,
                totalRecords: total
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
});

// Get doctor by ID
app.get('/api/doctors/:doctorId', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.doctorId)
            .populate('userId', 'firstName lastName email phone profilePicture');
        
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        // Get reviews
        const reviews = await Review.find({ doctorId: doctor._id })
            .populate('patientId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({ doctor, reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctor', error: error.message });
    }
});

// Update doctor schedule
app.put('/api/doctors/schedule', authenticateToken, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor profile not found' });
        }
        
        const { weeklySchedule, scheduleOverrides } = req.body;
        
        if (weeklySchedule) {
            doctor.weeklySchedule = weeklySchedule;
        }
        if (scheduleOverrides) {
            doctor.scheduleOverrides = scheduleOverrides;
        }
        
        await doctor.save();
        
        res.json({ message: 'Schedule updated', doctor });
    } catch (error) {
        res.status(500).json({ message: 'Error updating schedule', error: error.message });
    }
});

// Get doctor's available slots for a specific date
app.get('/api/doctors/:doctorId/availability', async (req, res) => {
    try {
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({ message: 'Date is required (YYYY-MM-DD)' });
        }
        
        const doctor = await Doctor.findById(req.params.doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay();
        
        // Check for schedule override on this date
        const override = doctor.scheduleOverrides.find(o => {
            const overrideDate = new Date(o.date);
            return overrideDate.toDateString() === requestedDate.toDateString();
        });
        
        let daySchedule;
        if (override) {
            if (!override.isWorking) {
                return res.json({ 
                    available: false, 
                    reason: override.reason || 'Doctor not available on this date',
                    slots: [] 
                });
            }
            daySchedule = override.slots;
        } else {
            const regularSchedule = doctor.weeklySchedule.find(s => s.dayOfWeek === dayOfWeek);
            if (!regularSchedule || !regularSchedule.isWorking) {
                return res.json({ 
                    available: false, 
                    reason: 'Doctor does not work on this day',
                    slots: [] 
                });
            }
            daySchedule = regularSchedule.slots;
        }
        
        // Generate time slots
        const allSlots = [];
        for (const scheduleSlot of daySchedule) {
            const [startHour, startMin] = scheduleSlot.startTime.split(':').map(Number);
            const [endHour, endMin] = scheduleSlot.endTime.split(':').map(Number);
            const slotDuration = scheduleSlot.slotDuration || 30;
            
            let currentTime = startHour * 60 + startMin;
            const endTime = endHour * 60 + endMin;
            
            while (currentTime + slotDuration <= endTime) {
                const hours = Math.floor(currentTime / 60);
                const minutes = currentTime % 60;
                const slotStart = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                
                const endSlotTime = currentTime + slotDuration;
                const endHours = Math.floor(endSlotTime / 60);
                const endMinutes = endSlotTime % 60;
                const slotEnd = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
                
                allSlots.push({
                    startTime: slotStart,
                    endTime: slotEnd,
                    slotType: scheduleSlot.slotType || 'regular',
                    maxPatients: scheduleSlot.maxPatients || 1
                });
                
                currentTime += slotDuration;
            }
        }
        
        // Get existing appointments for this date
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const existingAppointments = await Appointment.find({
            doctorId: doctor._id,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled'] }
        });
        
        // Mark slots as available or booked
        const slotsWithAvailability = allSlots.map(slot => {
            const bookedCount = existingAppointments.filter(apt => 
                apt.timeSlot.startTime === slot.startTime
            ).length;
            
            return {
                ...slot,
                booked: bookedCount,
                available: bookedCount < slot.maxPatients,
                remainingSlots: slot.maxPatients - bookedCount
            };
        });
        
        res.json({
            doctorId: doctor._id,
            date: date,
            dayOfWeek,
            available: slotsWithAvailability.some(s => s.available),
            slots: slotsWithAvailability,
            consultationFee: doctor.consultationFee,
            followUpFee: doctor.followUpFee
        });
    } catch (error) {
        console.error('Availability error:', error);
        res.status(500).json({ message: 'Error fetching availability', error: error.message });
    }
});

// ============================================
// APPOINTMENT BOOKING API
// ============================================

// Book appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
    try {
        const { 
            doctorId, appointmentDate, startTime, endTime, 
            appointmentType = 'regular', reason, symptoms, notes,
            consultationMode = 'in-person', priority = 'normal'
        } = req.body;
        
        // Validate required fields
        if (!doctorId || !appointmentDate || !startTime || !reason) {
            return res.status(400).json({ 
                message: 'Doctor ID, appointment date, start time, and reason are required' 
            });
        }
        
        // Get doctor
        const doctor = await Doctor.findById(doctorId).populate('userId', 'firstName lastName');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        // Parse date
        const aptDate = new Date(appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        
        // Check if slot is available
        const startOfDay = new Date(aptDate);
        const endOfDay = new Date(aptDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const conflictingAppointment = await Appointment.findOne({
            doctorId: doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            'timeSlot.startTime': startTime,
            status: { $nin: ['cancelled'] }
        });
        
        if (conflictingAppointment) {
            return res.status(409).json({ message: 'This time slot is already booked' });
        }
        
        // Calculate fee
        const fee = appointmentType === 'followup' ? doctor.followUpFee : doctor.consultationFee;
        
        // Create appointment
        const appointment = new Appointment({
            patientId: req.user.userId,
            doctorId: doctorId,
            appointmentDate: aptDate,
            timeSlot: {
                startTime,
                endTime: endTime || calculateEndTime(startTime, 30)
            },
            appointmentType,
            reason,
            symptoms: symptoms || [],
            notes,
            consultationMode,
            priority,
            fee
        });
        
        await appointment.save();
        
        // Update doctor stats
        await Doctor.findByIdAndUpdate(doctorId, { $inc: { totalAppointments: 1 } });
        
        // Get patient info
        const patient = await User.findById(req.user.userId);
        
        // Send confirmation notification
        await createNotification({
            userId: req.user.userId,
            type: 'appointment_confirmed',
            title: 'Appointment Booked',
            message: `Your appointment with Dr. ${doctor.userId.firstName} ${doctor.userId.lastName} is confirmed for ${aptDate.toDateString()} at ${startTime}`,
            data: { appointmentId: appointment._id }
        });
        
        // Send email confirmation
        try {
            await transporter.sendMail({
                from: '"CLARA Healthcare" <noreply@clara.ai>',
                to: patient.email,
                subject: 'Appointment Confirmation - CLARA Healthcare',
                html: `
                    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: white; margin: 0;">✅ Appointment Confirmed</h1>
                        </div>
                        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
                            <h2 style="color: #1e293b;">Hello ${patient.firstName},</h2>
                            <p>Your appointment has been successfully booked!</p>
                            
                            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>Appointment ID:</strong> ${appointment.appointmentId}</p>
                                <p><strong>Doctor:</strong> Dr. ${doctor.userId.firstName} ${doctor.userId.lastName}</p>
                                <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                                <p><strong>Date:</strong> ${aptDate.toDateString()}</p>
                                <p><strong>Time:</strong> ${startTime}</p>
                                <p><strong>Type:</strong> ${appointmentType}</p>
                                <p><strong>Mode:</strong> ${consultationMode}</p>
                                <p><strong>Fee:</strong> ₹${fee}</p>
                            </div>
                            
                            <p style="color: #64748b;">Please arrive 15 minutes before your scheduled time.</p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.log('Confirmation email failed:', emailError.message);
        }
        
        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment: await Appointment.findById(appointment._id)
                .populate('doctorId')
                .populate('patientId', 'firstName lastName email phone')
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Error booking appointment', error: error.message });
    }
});

// Helper function to calculate end time
function calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

// Get user's appointments
app.get('/api/appointments', authenticateToken, async (req, res) => {
    try {
        const { status, from, to, page = 1, limit = 20 } = req.query;
        
        const query = {};
        
        // If user is a doctor, show appointments for their patients
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        if (doctor) {
            query.doctorId = doctor._id;
        } else {
            query.patientId = req.user.userId;
        }
        
        if (status) {
            query.status = status;
        }
        
        if (from || to) {
            query.appointmentDate = {};
            if (from) query.appointmentDate.$gte = new Date(from);
            if (to) query.appointmentDate.$lte = new Date(to);
        }
        
        const appointments = await Appointment.find(query)
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'firstName lastName email phone' }
            })
            .populate('patientId', 'firstName lastName email phone')
            .sort({ appointmentDate: 1, 'timeSlot.startTime': 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Appointment.countDocuments(query);
        
        res.json({
            appointments,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: appointments.length,
                totalRecords: total
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
});

// Get appointment by ID
app.get('/api/appointments/:appointmentId', authenticateToken, async (req, res) => {
    try {
        const appointment = await Appointment.findOne({ 
            $or: [
                { _id: req.params.appointmentId },
                { appointmentId: req.params.appointmentId }
            ]
        })
        .populate({
            path: 'doctorId',
            populate: { path: 'userId', select: 'firstName lastName email phone' }
        })
        .populate('patientId', 'firstName lastName email phone medicalInfo')
        .populate('prescriptionId');
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        // Check authorization
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        const isAuthorized = 
            appointment.patientId._id.toString() === req.user.userId ||
            (doctor && appointment.doctorId._id.toString() === doctor._id.toString()) ||
            req.user.role === 'admin';
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to view this appointment' });
        }
        
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointment', error: error.message });
    }
});

// Update appointment status
app.patch('/api/appointments/:appointmentId/status', authenticateToken, async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        // Check authorization (only doctor or admin can update status)
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        const isAuthorized = 
            (doctor && appointment.doctorId.toString() === doctor._id.toString()) ||
            req.user.role === 'admin';
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }
        
        // Update status
        appointment.status = status;
        if (notes) appointment.notes = notes;
        
        // Track time for in-progress and completed
        if (status === 'in-progress') {
            appointment.consultationStartTime = new Date();
            if (appointment.checkinTime) {
                appointment.waitingTime = Math.round(
                    (new Date() - new Date(appointment.checkinTime)) / 60000
                );
            }
        } else if (status === 'completed') {
            appointment.consultationEndTime = new Date();
        }
        
        await appointment.save();
        
        // Send notification to patient
        const patient = await User.findById(appointment.patientId);
        await createNotification({
            userId: appointment.patientId,
            type: status === 'completed' ? 'appointment_confirmed' : 'general',
            title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: `Your appointment status has been updated to ${status}`,
            data: { appointmentId: appointment._id }
        });
        
        res.json({ message: 'Appointment status updated', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Error updating appointment', error: error.message });
    }
});

// Reschedule appointment
app.put('/api/appointments/:appointmentId/reschedule', authenticateToken, async (req, res) => {
    try {
        const { newDate, newStartTime, newEndTime, reason } = req.body;
        
        if (!newDate || !newStartTime) {
            return res.status(400).json({ message: 'New date and start time are required' });
        }
        
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        // Check if appointment can be rescheduled
        if (['completed', 'in-progress', 'cancelled'].includes(appointment.status)) {
            return res.status(400).json({ message: `Cannot reschedule ${appointment.status} appointment` });
        }
        
        // Check authorization
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        const isAuthorized = 
            appointment.patientId.toString() === req.user.userId ||
            (doctor && appointment.doctorId.toString() === doctor._id.toString()) ||
            req.user.role === 'admin';
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to reschedule this appointment' });
        }
        
        const newAptDate = new Date(newDate);
        newAptDate.setHours(0, 0, 0, 0);
        
        // Check if new slot is available
        const startOfDay = new Date(newAptDate);
        const endOfDay = new Date(newAptDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const conflictingAppointment = await Appointment.findOne({
            _id: { $ne: appointment._id },
            doctorId: appointment.doctorId,
            appointmentDate: { $gte: startOfDay, $lte: endOfDay },
            'timeSlot.startTime': newStartTime,
            status: { $nin: ['cancelled'] }
        });
        
        if (conflictingAppointment) {
            return res.status(409).json({ message: 'The new time slot is not available' });
        }
        
        // Store reschedule history
        appointment.rescheduleHistory.push({
            previousDate: appointment.appointmentDate,
            previousTime: appointment.timeSlot.startTime,
            newDate: newAptDate,
            newTime: newStartTime,
            reason: reason || 'No reason provided',
            rescheduledBy: req.user.userId
        });
        
        // Update appointment
        appointment.appointmentDate = newAptDate;
        appointment.timeSlot.startTime = newStartTime;
        appointment.timeSlot.endTime = newEndTime || calculateEndTime(newStartTime, 30);
        appointment.status = 'rescheduled';
        
        await appointment.save();
        
        // Notify patient and doctor
        const patient = await User.findById(appointment.patientId);
        const doctorData = await Doctor.findById(appointment.doctorId).populate('userId');
        
        await createNotification({
            userId: appointment.patientId,
            type: 'appointment_rescheduled',
            title: 'Appointment Rescheduled',
            message: `Your appointment has been rescheduled to ${newAptDate.toDateString()} at ${newStartTime}`,
            data: { appointmentId: appointment._id }
        });
        
        // Send email notification
        try {
            await transporter.sendMail({
                from: '"CLARA Healthcare" <noreply@clara.ai>',
                to: patient.email,
                subject: 'Appointment Rescheduled - CLARA Healthcare',
                html: `
                    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
                        <div style="background: #f59e0b; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: white; margin: 0;">📅 Appointment Rescheduled</h1>
                        </div>
                        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0;">
                            <p>Hello ${patient.firstName},</p>
                            <p>Your appointment has been rescheduled.</p>
                            
                            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>New Date:</strong> ${newAptDate.toDateString()}</p>
                                <p><strong>New Time:</strong> ${newStartTime}</p>
                                <p><strong>Doctor:</strong> Dr. ${doctorData.userId.firstName} ${doctorData.userId.lastName}</p>
                                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                            </div>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.log('Reschedule email failed:', emailError.message);
        }
        
        res.json({ message: 'Appointment rescheduled successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Error rescheduling appointment', error: error.message });
    }
});

// Cancel appointment
app.delete('/api/appointments/:appointmentId', authenticateToken, async (req, res) => {
    try {
        const { reason } = req.body;
        
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        // Check if appointment can be cancelled
        if (['completed', 'in-progress', 'cancelled'].includes(appointment.status)) {
            return res.status(400).json({ message: `Cannot cancel ${appointment.status} appointment` });
        }
        
        // Check authorization
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        const isAuthorized = 
            appointment.patientId.toString() === req.user.userId ||
            (doctor && appointment.doctorId.toString() === doctor._id.toString()) ||
            req.user.role === 'admin';
        
        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
        }
        
        // Update cancellation info
        appointment.status = 'cancelled';
        appointment.cancellation = {
            cancelledBy: req.user.userId,
            cancelledAt: new Date(),
            reason: reason || 'No reason provided',
            refundStatus: appointment.paymentStatus === 'paid' ? 'pending' : 'not-applicable'
        };
        
        await appointment.save();
        
        // Notify the other party
        const patient = await User.findById(appointment.patientId);
        const doctorData = await Doctor.findById(appointment.doctorId).populate('userId');
        
        // Notify patient
        await createNotification({
            userId: appointment.patientId,
            type: 'appointment_cancelled',
            title: 'Appointment Cancelled',
            message: `Your appointment on ${appointment.appointmentDate.toDateString()} has been cancelled`,
            data: { appointmentId: appointment._id }
        });
        
        // Send cancellation email
        try {
            await transporter.sendMail({
                from: '"CLARA Healthcare" <noreply@clara.ai>',
                to: patient.email,
                subject: 'Appointment Cancelled - CLARA Healthcare',
                html: `
                    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
                        <div style="background: #ef4444; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: white; margin: 0;">❌ Appointment Cancelled</h1>
                        </div>
                        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0;">
                            <p>Hello ${patient.firstName},</p>
                            <p>Your appointment has been cancelled.</p>
                            
                            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>Date:</strong> ${appointment.appointmentDate.toDateString()}</p>
                                <p><strong>Time:</strong> ${appointment.timeSlot.startTime}</p>
                                <p><strong>Doctor:</strong> Dr. ${doctorData.userId.firstName} ${doctorData.userId.lastName}</p>
                                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                            </div>
                            
                            <p>You can book a new appointment at any time.</p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.log('Cancellation email failed:', emailError.message);
        }
        
        res.json({ message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
    }
});

// Patient check-in
app.post('/api/appointments/:appointmentId/checkin', authenticateToken, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        
        appointment.checkinTime = new Date();
        appointment.status = 'confirmed';
        await appointment.save();
        
        res.json({ message: 'Check-in successful', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Error during check-in', error: error.message });
    }
});

// ============================================
// PRESCRIPTION API
// ============================================

// Create prescription (AI-assisted)
app.post('/api/prescriptions', authenticateToken, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.userId }).populate('userId');
        if (!doctor) {
            return res.status(403).json({ message: 'Only doctors can create prescriptions' });
        }
        
        const {
            appointmentId, patientId, diagnosis, medications,
            labTests, procedures, advice, dietRecommendations,
            lifestyleModifications, followUpInstructions, followUpDate
        } = req.body;
        
        if (!patientId || !diagnosis || !medications) {
            return res.status(400).json({ 
                message: 'Patient ID, diagnosis, and medications are required' 
            });
        }
        
        // Get patient info for drug interaction checks
        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        
        // AI-assisted drug interaction check
        const drugInteractions = [];
        const warnings = [];
        
        // Check interactions between prescribed medications
        for (let i = 0; i < medications.length; i++) {
            // Check with patient's existing medications
            for (const existingMed of (patient.medicalInfo?.currentMedications || [])) {
                const interaction = checkDrugInteraction(medications[i].name, existingMed);
                if (interaction.severity !== 'low') {
                    drugInteractions.push({
                        drug1: medications[i].name,
                        drug2: existingMed,
                        severity: interaction.severity,
                        description: interaction.message
                    });
                    if (interaction.severity === 'high') {
                        warnings.push(`⚠️ ${interaction.message}`);
                    }
                }
            }
            
            // Check interactions between new medications
            for (let j = i + 1; j < medications.length; j++) {
                const interaction = checkDrugInteraction(medications[i].name, medications[j].name);
                if (interaction.severity !== 'low') {
                    drugInteractions.push({
                        drug1: medications[i].name,
                        drug2: medications[j].name,
                        severity: interaction.severity,
                        description: interaction.message
                    });
                    if (interaction.severity === 'high') {
                        warnings.push(`⚠️ ${interaction.message}`);
                    }
                }
            }
            
            // Check allergies
            for (const allergy of (patient.medicalInfo?.allergies || [])) {
                if (medications[i].name.toLowerCase().includes(allergy.toLowerCase())) {
                    warnings.push(`🚨 Patient is allergic to ${allergy} - please verify ${medications[i].name}`);
                }
            }
        }
        
        // Create prescription
        const prescription = new Prescription({
            appointmentId,
            patientId,
            doctorId: doctor._id,
            diagnosis,
            medications: medications.map(med => ({
                ...med,
                validationStatus: drugInteractions.some(
                    di => di.drug1 === med.name || di.drug2 === med.name
                ) ? (drugInteractions.find(
                    di => (di.drug1 === med.name || di.drug2 === med.name) && di.severity === 'high'
                ) ? 'contraindicated' : 'caution') : 'validated'
            })),
            labTests: labTests || [],
            procedures: procedures || [],
            advice: advice || [],
            dietRecommendations: dietRecommendations || [],
            lifestyleModifications: lifestyleModifications || [],
            followUpInstructions,
            followUpDate: followUpDate ? new Date(followUpDate) : undefined,
            digitalSignature: `Dr. ${doctor.userId.firstName} ${doctor.userId.lastName} (Reg: ${doctor.registrationNumber})`,
            aiGenerated: {
                isAiAssisted: true,
                confidence: drugInteractions.length > 0 ? 0.7 : 0.95,
                suggestions: [],
                warnings,
                drugInteractions
            }
        });
        
        // Generate QR code for prescription
        const qrData = JSON.stringify({
            prescriptionId: prescription.prescriptionId,
            patientId: patient._id,
            doctorId: doctor._id,
            validUntil: prescription.validUntil
        });
        prescription.qrCode = await QRCode.toDataURL(qrData);
        
        await prescription.save();
        
        // Update appointment with prescription
        if (appointmentId) {
            await Appointment.findByIdAndUpdate(appointmentId, { 
                prescriptionId: prescription._id,
                followUpRequired: !!followUpDate,
                followUpDate: followUpDate ? new Date(followUpDate) : undefined
            });
        }
        
        // Notify patient
        await createNotification({
            userId: patientId,
            type: 'prescription_ready',
            title: 'Prescription Ready',
            message: `Your prescription from Dr. ${doctor.userId.firstName} ${doctor.userId.lastName} is ready`,
            data: { prescriptionId: prescription._id }
        });
        
        res.status(201).json({
            message: 'Prescription created successfully',
            prescription,
            warnings: warnings.length > 0 ? warnings : null
        });
    } catch (error) {
        console.error('Prescription error:', error);
        res.status(500).json({ message: 'Error creating prescription', error: error.message });
    }
});

// Helper function for drug interaction check
function checkDrugInteraction(drug1, drug2) {
    const d1 = drug1.toLowerCase();
    const d2 = drug2.toLowerCase();
    
    const interactions = {
        'warfarin': { 
            contraindicated: ['aspirin', 'ibuprofen', 'naproxen'], 
            caution: ['acetaminophen', 'vitamin k'] 
        },
        'metformin': { 
            contraindicated: ['alcohol'], 
            caution: ['contrast dye', 'diuretics'] 
        },
        'lisinopril': { 
            contraindicated: ['potassium', 'spironolactone'], 
            caution: ['nsaids', 'lithium'] 
        },
        'atorvastatin': { 
            contraindicated: ['gemfibrozil', 'cyclosporine'], 
            caution: ['grapefruit', 'erythromycin'] 
        },
        'amlodipine': { 
            contraindicated: [], 
            caution: ['simvastatin', 'cyclosporine'] 
        },
        'metoprolol': {
            contraindicated: ['verapamil', 'diltiazem'],
            caution: ['clonidine', 'digoxin']
        },
        'omeprazole': {
            contraindicated: [],
            caution: ['clopidogrel', 'methotrexate']
        }
    };
    
    for (const [drug, data] of Object.entries(interactions)) {
        if (d1.includes(drug) || d2.includes(drug)) {
            const otherDrug = d1.includes(drug) ? d2 : d1;
            
            if (data.contraindicated.some(c => otherDrug.includes(c))) {
                return { 
                    severity: 'high', 
                    message: `${drug1} and ${drug2} are contraindicated together - potential serious adverse effects` 
                };
            }
            if (data.caution.some(c => otherDrug.includes(c))) {
                return { 
                    severity: 'medium', 
                    message: `Use ${drug1} and ${drug2} with caution - monitor patient closely` 
                };
            }
        }
    }
    
    return { severity: 'low', message: 'No known interactions' };
}

// Get patient prescriptions
app.get('/api/prescriptions', authenticateToken, async (req, res) => {
    try {
        const { patientId, page = 1, limit = 20 } = req.query;
        
        const query = {};
        
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        if (doctor) {
            // Doctor can see their prescriptions or filter by patient
            query.doctorId = doctor._id;
            if (patientId) query.patientId = patientId;
        } else {
            // Patient sees their own prescriptions
            query.patientId = req.user.userId;
        }
        
        const prescriptions = await Prescription.find(query)
            .populate({
                path: 'doctorId',
                populate: { path: 'userId', select: 'firstName lastName' }
            })
            .populate('patientId', 'firstName lastName')
            .populate('appointmentId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Prescription.countDocuments(query);
        
        res.json({
            prescriptions,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                count: prescriptions.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
    }
});

// Get prescription by ID
app.get('/api/prescriptions/:prescriptionId', authenticateToken, async (req, res) => {
    try {
        const prescription = await Prescription.findOne({
            $or: [
                { _id: req.params.prescriptionId },
                { prescriptionId: req.params.prescriptionId }
            ]
        })
        .populate({
            path: 'doctorId',
            populate: { path: 'userId', select: 'firstName lastName phone' }
        })
        .populate('patientId', 'firstName lastName phone dateOfBirth medicalInfo')
        .populate('appointmentId');
        
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        
        res.json(prescription);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching prescription', error: error.message });
    }
});

// Download prescription PDF
app.get('/api/prescriptions/:prescriptionId/pdf', async (req, res) => {
    try {
        const prescription = await Prescription.findOne({
            $or: [
                { _id: req.params.prescriptionId },
                { prescriptionId: req.params.prescriptionId }
            ]
        })
        .populate({
            path: 'doctorId',
            populate: { path: 'userId', select: 'firstName lastName phone' }
        })
        .populate('patientId', 'firstName lastName phone dateOfBirth');
        
        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        
        const pdfBuffer = await generatePrescriptionPDF(prescription);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Prescription_${prescription.prescriptionId}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
});

// Generate prescription PDF helper
async function generatePrescriptionPDF(prescription) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        
        // Header
        doc.fontSize(24).fillColor('#1e40af').text('CLARA Healthcare', { align: 'center' });
        doc.fontSize(12).fillColor('#64748b').text('Digital Prescription', { align: 'center' });
        doc.moveDown();
        
        // Prescription ID and Date
        doc.fontSize(10).fillColor('#1e293b');
        doc.text(`Prescription ID: ${prescription.prescriptionId}`, { align: 'right' });
        doc.text(`Date: ${prescription.createdAt.toLocaleDateString()}`, { align: 'right' });
        doc.text(`Valid Until: ${prescription.validUntil.toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();
        
        // Doctor Info
        doc.fontSize(14).fillColor('#1e40af').text('Prescribing Doctor');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.fontSize(11).fillColor('#1e293b');
        doc.text(`Dr. ${prescription.doctorId.userId.firstName} ${prescription.doctorId.userId.lastName}`);
        doc.text(`${prescription.doctorId.specialization}`);
        doc.text(`Reg. No: ${prescription.doctorId.registrationNumber}`);
        doc.moveDown();
        
        // Patient Info
        doc.fontSize(14).fillColor('#1e40af').text('Patient Information');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.fontSize(11).fillColor('#1e293b');
        doc.text(`Name: ${prescription.patientId.firstName} ${prescription.patientId.lastName}`);
        if (prescription.patientId.dateOfBirth) {
            doc.text(`DOB: ${new Date(prescription.patientId.dateOfBirth).toLocaleDateString()}`);
        }
        doc.moveDown();
        
        // Diagnosis
        doc.fontSize(14).fillColor('#1e40af').text('Diagnosis');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.fontSize(11).fillColor('#1e293b');
        prescription.diagnosis.forEach(d => {
            doc.text(`• ${d.condition}${d.icdCode ? ` (${d.icdCode})` : ''} - ${d.severity || 'N/A'}`);
        });
        doc.moveDown();
        
        // Medications
        doc.fontSize(14).fillColor('#1e40af').text('Medications (Rx)');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.fontSize(11);
        prescription.medications.forEach((med, idx) => {
            doc.fillColor('#1e293b').text(`${idx + 1}. ${med.name} ${med.dosage || ''}`);
            doc.fillColor('#475569').text(`   ${med.frequency || ''} for ${med.duration || 'as directed'}`);
            if (med.instructions) doc.text(`   Instructions: ${med.instructions}`);
        });
        doc.moveDown();
        
        // Lab Tests if any
        if (prescription.labTests.length > 0) {
            doc.fontSize(14).fillColor('#1e40af').text('Laboratory Tests');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
            doc.fontSize(11).fillColor('#1e293b');
            prescription.labTests.forEach(test => {
                doc.text(`• ${test.testName}${test.urgency !== 'routine' ? ` (${test.urgency})` : ''}`);
            });
            doc.moveDown();
        }
        
        // Advice
        if (prescription.advice.length > 0) {
            doc.fontSize(14).fillColor('#1e40af').text('Medical Advice');
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
            doc.fontSize(11).fillColor('#1e293b');
            prescription.advice.forEach(adv => doc.text(`• ${adv}`));
            doc.moveDown();
        }
        
        // Follow-up
        if (prescription.followUpDate) {
            doc.fontSize(12).fillColor('#dc2626')
               .text(`Follow-up Date: ${prescription.followUpDate.toLocaleDateString()}`);
            if (prescription.followUpInstructions) {
                doc.fillColor('#475569').text(prescription.followUpInstructions);
            }
        }
        
        // Digital Signature
        doc.moveDown(2);
        doc.fontSize(11).fillColor('#1e293b').text(prescription.digitalSignature, { align: 'right' });
        doc.fontSize(9).fillColor('#64748b').text('Digitally Signed', { align: 'right' });
        
        // Footer disclaimer
        doc.moveDown(2);
        doc.fontSize(8).fillColor('#94a3b8')
           .text('This is a digitally generated prescription from CLARA Healthcare System. ' +
                 'Please consult your doctor if you have any questions about your medication.', { align: 'center' });
        
        doc.end();
    });
}

// ============================================
// NOTIFICATION & REMINDER SYSTEM
// ============================================

// Create notification helper
async function createNotification({ userId, type, title, message, data, channels = ['in-app', 'email'] }) {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            data,
            channels: channels.map(channel => ({ channel, status: 'pending' }))
        });
        
        await notification.save();
        
        // Send via channels
        const user = await User.findById(userId);
        
        for (const channelConfig of notification.channels) {
            if (channelConfig.channel === 'email' && user.notificationPreferences?.email !== false) {
                try {
                    await transporter.sendMail({
                        from: '"CLARA Healthcare" <noreply@clara.ai>',
                        to: user.email,
                        subject: title,
                        html: `
                            <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h2 style="color: #1e40af;">${title}</h2>
                                <p style="color: #475569;">${message}</p>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                                <p style="color: #94a3b8; font-size: 12px;">CLARA Healthcare - Your AI-Powered Healthcare Partner</p>
                            </div>
                        `
                    });
                    channelConfig.status = 'sent';
                    channelConfig.sentAt = new Date();
                } catch (error) {
                    channelConfig.status = 'failed';
                    channelConfig.error = error.message;
                }
            }
        }
        
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Notification error:', error);
        return null;
    }
}

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const { unread, page = 1, limit = 20 } = req.query;
        
        const query = { userId: req.user.userId };
        if (unread === 'true') query.isRead = false;
        
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ 
            userId: req.user.userId, 
            isRead: false 
        });
        
        res.json({
            notifications,
            unreadCount,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
});

// Mark all notifications as read
app.patch('/api/notifications/read-all', authenticateToken, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications', error: error.message });
    }
});

// ============================================
// AUTOMATED APPOINTMENT REMINDERS (CRON)
// ============================================

// Schedule reminder job - runs every hour
cron.schedule('0 * * * *', async () => {
    try {
        console.log('Running appointment reminder check...');
        
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        // Get appointments in next 24 hours that haven't been reminded
        const upcomingAppointments = await Appointment.find({
            appointmentDate: { $gte: now, $lte: tomorrow },
            status: { $in: ['scheduled', 'confirmed'] },
            'reminders.type': { $ne: 'email' } // Not already reminded
        }).populate('patientId').populate({
            path: 'doctorId',
            populate: { path: 'userId' }
        });
        
        for (const apt of upcomingAppointments) {
            const aptDateTime = new Date(apt.appointmentDate);
            const [hours, minutes] = apt.timeSlot.startTime.split(':').map(Number);
            aptDateTime.setHours(hours, minutes, 0, 0);
            
            const hoursUntilApt = (aptDateTime - now) / (1000 * 60 * 60);
            
            // Send 24-hour reminder
            if (hoursUntilApt <= 24 && hoursUntilApt > 12) {
                await sendAppointmentReminder(apt, '24-hour');
            }
            // Send 2-hour reminder
            else if (hoursUntilApt <= 2 && hoursUntilApt > 0) {
                await sendAppointmentReminder(apt, '2-hour');
            }
        }
        
        console.log(`Processed ${upcomingAppointments.length} appointment reminders`);
    } catch (error) {
        console.error('Reminder cron error:', error);
    }
});

async function sendAppointmentReminder(appointment, reminderType) {
    try {
        const patient = appointment.patientId;
        const doctor = appointment.doctorId;
        
        const message = reminderType === '24-hour' 
            ? `Reminder: You have an appointment tomorrow with Dr. ${doctor.userId.firstName} ${doctor.userId.lastName} at ${appointment.timeSlot.startTime}`
            : `Reminder: Your appointment with Dr. ${doctor.userId.firstName} ${doctor.userId.lastName} is in 2 hours at ${appointment.timeSlot.startTime}`;
        
        // Create notification
        await createNotification({
            userId: patient._id,
            type: 'appointment_reminder',
            title: 'Appointment Reminder',
            message,
            data: { appointmentId: appointment._id }
        });
        
        // Track reminder
        appointment.reminders.push({
            type: 'email',
            sentAt: new Date(),
            status: 'sent',
            scheduledFor: appointment.appointmentDate
        });
        await appointment.save();
        
        console.log(`Sent ${reminderType} reminder for appointment ${appointment.appointmentId}`);
    } catch (error) {
        console.error(`Failed to send reminder for ${appointment.appointmentId}:`, error);
    }
}

// ============================================
// DOCTOR DASHBOARD API
// ============================================

// Get doctor dashboard summary
app.get('/api/doctor/dashboard', authenticateToken, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.userId }).populate('userId');
        if (!doctor) {
            return res.status(403).json({ message: 'Doctor profile not found' });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        // Today's appointments
        const todayAppointments = await Appointment.find({
            doctorId: doctor._id,
            appointmentDate: { $gte: today, $lt: tomorrow },
            status: { $nin: ['cancelled'] }
        }).populate('patientId', 'firstName lastName phone').sort({ 'timeSlot.startTime': 1 });
        
        // This week's appointments count
        const weekAppointments = await Appointment.countDocuments({
            doctorId: doctor._id,
            appointmentDate: { $gte: today, $lt: weekEnd },
            status: { $nin: ['cancelled'] }
        });
        
        // Pending appointments (awaiting confirmation)
        const pendingCount = await Appointment.countDocuments({
            doctorId: doctor._id,
            status: 'scheduled'
        });
        
        // Recent patients
        const recentPatients = await Appointment.aggregate([
            { $match: { doctorId: doctor._id, status: 'completed' } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: '$patientId', lastVisit: { $first: '$appointmentDate' } } },
            { $limit: 10 },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'patient' } },
            { $unwind: '$patient' },
            { $project: { 
                patientId: '$_id',
                firstName: '$patient.firstName',
                lastName: '$patient.lastName',
                lastVisit: 1
            }}
        ]);
        
        // Monthly stats
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStats = await Appointment.aggregate([
            { 
                $match: { 
                    doctorId: doctor._id, 
                    appointmentDate: { $gte: monthStart },
                    status: { $nin: ['cancelled'] }
                } 
            },
            { 
                $group: { 
                    _id: '$status', 
                    count: { $sum: 1 } 
                } 
            }
        ]);
        
        // Revenue this month (completed appointments)
        const monthRevenue = await Appointment.aggregate([
            { 
                $match: { 
                    doctorId: doctor._id, 
                    appointmentDate: { $gte: monthStart },
                    status: 'completed'
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: '$fee' } 
                } 
            }
        ]);
        
        res.json({
            doctor: {
                name: `Dr. ${doctor.userId.firstName} ${doctor.userId.lastName}`,
                specialization: doctor.specialization,
                rating: doctor.averageRating,
                totalPatients: doctor.totalPatients,
                totalAppointments: doctor.totalAppointments
            },
            today: {
                date: today.toDateString(),
                appointments: todayAppointments,
                count: todayAppointments.length
            },
            thisWeek: {
                appointmentCount: weekAppointments
            },
            pending: pendingCount,
            recentPatients,
            monthlyStats: {
                appointments: monthStats,
                revenue: monthRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard', error: error.message });
    }
});

// Get doctor's patient list
app.get('/api/doctor/patients', authenticateToken, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        if (!doctor) {
            return res.status(403).json({ message: 'Doctor profile not found' });
        }
        
        const { search, page = 1, limit = 20 } = req.query;
        
        // Get unique patients who have had appointments with this doctor
        const patientIds = await Appointment.distinct('patientId', { doctorId: doctor._id });
        
        let query = { _id: { $in: patientIds } };
        if (search) {
            query.$or = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }
        
        const patients = await User.find(query)
            .select('-password')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        // Add last visit info
        const patientsWithVisits = await Promise.all(patients.map(async (patient) => {
            const lastAppointment = await Appointment.findOne({
                doctorId: doctor._id,
                patientId: patient._id,
                status: 'completed'
            }).sort({ appointmentDate: -1 });
            
            const appointmentCount = await Appointment.countDocuments({
                doctorId: doctor._id,
                patientId: patient._id
            });
            
            return {
                ...patient.toObject(),
                lastVisit: lastAppointment?.appointmentDate,
                totalVisits: appointmentCount
            };
        }));
        
        res.json({
            patients: patientsWithVisits,
            total: patientIds.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }
});

// Get patient history for doctor
app.get('/api/doctor/patients/:patientId/history', authenticateToken, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.userId });
        if (!doctor) {
            return res.status(403).json({ message: 'Doctor profile not found' });
        }
        
        const patient = await User.findById(req.params.patientId).select('-password');
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        
        // Get all appointments
        const appointments = await Appointment.find({
            doctorId: doctor._id,
            patientId: patient._id
        }).sort({ appointmentDate: -1 }).populate('prescriptionId');
        
        // Get all prescriptions
        const prescriptions = await Prescription.find({
            doctorId: doctor._id,
            patientId: patient._id
        }).sort({ createdAt: -1 });
        
        res.json({
            patient,
            appointments,
            prescriptions,
            summary: {
                totalVisits: appointments.length,
                completedVisits: appointments.filter(a => a.status === 'completed').length,
                cancelledVisits: appointments.filter(a => a.status === 'cancelled').length,
                totalPrescriptions: prescriptions.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient history', error: error.message });
    }
});

// ============================================
// REVIEW SYSTEM
// ============================================

// Add review for doctor
app.post('/api/doctors/:doctorId/reviews', authenticateToken, async (req, res) => {
    try {
        const { rating, review, appointmentId, isAnonymous } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Valid rating (1-5) is required' });
        }
        
        const doctor = await Doctor.findById(req.params.doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        // Check if patient has had an appointment with this doctor
        const hasAppointment = await Appointment.findOne({
            doctorId: doctor._id,
            patientId: req.user.userId,
            status: 'completed'
        });
        
        if (!hasAppointment) {
            return res.status(403).json({ 
                message: 'You can only review doctors you have had appointments with' 
            });
        }
        
        // Create review
        const newReview = new Review({
            doctorId: doctor._id,
            patientId: req.user.userId,
            appointmentId,
            rating,
            review,
            isAnonymous: isAnonymous || false,
            isVerified: true
        });
        
        await newReview.save();
        
        // Update doctor's average rating
        const allReviews = await Review.find({ doctorId: doctor._id });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        
        doctor.averageRating = Math.round(avgRating * 10) / 10;
        doctor.totalReviews = allReviews.length;
        await doctor.save();
        
        res.status(201).json({ message: 'Review added successfully', review: newReview });
    } catch (error) {
        res.status(500).json({ message: 'Error adding review', error: error.message });
    }
});

// Get doctor reviews
app.get('/api/doctors/:doctorId/reviews', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const reviews = await Review.find({ doctorId: req.params.doctorId })
            .populate('patientId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Review.countDocuments({ doctorId: req.params.doctorId });
        
        // Hide patient info for anonymous reviews
        const processedReviews = reviews.map(r => ({
            ...r.toObject(),
            patientId: r.isAnonymous ? { firstName: 'Anonymous', lastName: '' } : r.patientId
        }));
        
        res.json({
            reviews: processedReviews,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// ============================================
// SPECIALIZATIONS & SEARCH
// ============================================

// Get all specializations
app.get('/api/specializations', async (req, res) => {
    try {
        const specializations = await Doctor.distinct('specialization', { isActive: true });
        
        const specsWithCount = await Promise.all(specializations.map(async (spec) => {
            const count = await Doctor.countDocuments({ specialization: spec, isActive: true });
            return { name: spec, doctorCount: count };
        }));
        
        res.json(specsWithCount.sort((a, b) => b.doctorCount - a.doctorCount));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching specializations', error: error.message });
    }
});

// Search doctors
app.get('/api/search/doctors', async (req, res) => {
    try {
        const { q, specialization, minRating, available, date, page = 1, limit = 20 } = req.query;
        
        const query = { isActive: true };
        
        if (specialization) {
            query.specialization = new RegExp(specialization, 'i');
        }
        
        if (minRating) {
            query.averageRating = { $gte: parseFloat(minRating) };
        }
        
        let doctors = await Doctor.find(query)
            .populate('userId', 'firstName lastName email phone profilePicture')
            .sort({ averageRating: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        // Filter by name search
        if (q) {
            const qLower = q.toLowerCase();
            doctors = doctors.filter(d => 
                d.userId.firstName.toLowerCase().includes(qLower) ||
                d.userId.lastName.toLowerCase().includes(qLower) ||
                d.specialization.toLowerCase().includes(qLower)
            );
        }
        
        // Check availability for specific date
        if (date && available === 'true') {
            const requestedDate = new Date(date);
            const dayOfWeek = requestedDate.getDay();
            
            doctors = doctors.filter(d => {
                const schedule = d.weeklySchedule.find(s => s.dayOfWeek === dayOfWeek);
                return schedule && schedule.isWorking;
            });
        }
        
        res.json({
            doctors,
            count: doctors.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error searching doctors', error: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`CLARA backend server running on http://localhost:${PORT}`);
});