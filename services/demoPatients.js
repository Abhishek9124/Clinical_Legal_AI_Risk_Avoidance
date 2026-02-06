// Demo Patients Service
// Pre-configured patient data for testing and demonstration

export const demoPatients = [
    {
        id: 'DEMO-001',
        name: 'Rajesh Kumar',
        age: 58,
        dob: '1968-03-15',
        gender: 'Male',
        phone: '+91 98765 43210',
        email: 'rajesh.kumar@email.com',
        bloodGroup: 'B+',
        emergencyContact: '+91 98765 43211',
        address: '123 MG Road, Pune, Maharashtra 411001',
        medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
        currentMedications: ['Metformin 500mg', 'Amlodipine 5mg'],
        allergies: ['Penicillin'],
        transcript: `Doctor: Good morning, Mr. Kumar. What brings you in today?
Patient: Good morning, doctor. For the past 3 days, I've been having this chest pain and it's getting hard to breathe.
Doctor: I see. Can you describe the pain? Is it sharp, dull?
Patient: It's a heavy feeling, right in the center of my chest. Sometimes it spreads to my left arm.
Doctor: Okay. I see from your chart you have a history of hypertension and Type 2 diabetes. Are you taking your Metformin and Amlodipine regularly?
Patient: Yes, doctor. Every day without fail.
Doctor: We'll run an ECG and some blood tests. The ECG shows some ST segment changes. We need to investigate this further. I'm also concerned about your blood pressure readings.
Patient: Is it serious, doctor?
Doctor: We need to rule out any cardiac issues. I'm recommending an echocardiogram and cardiac enzymes test. Meanwhile, I'm adding Aspirin to your medications.`
    },
    {
        id: 'DEMO-002',
        name: 'Priya Sharma',
        age: 34,
        dob: '1992-07-22',
        gender: 'Female',
        phone: '+91 87654 32109',
        email: 'priya.sharma@email.com',
        bloodGroup: 'A+',
        emergencyContact: '+91 87654 32108',
        address: '456 FC Road, Mumbai, Maharashtra 400001',
        medicalHistory: ['Asthma', 'Anxiety'],
        currentMedications: ['Salbutamol inhaler', 'Escitalopram 10mg'],
        allergies: ['Sulfa drugs', 'Shellfish'],
        transcript: `Doctor: Hello Priya, how are you feeling today?
Patient: Not great, doctor. My asthma has been really bad this week. I've been using my inhaler more than usual.
Doctor: How many times a day are you using your Salbutamol?
Patient: About 5-6 times. And I'm still feeling breathless, especially at night.
Doctor: That's concerning. Any triggers you've noticed? Dust, pollution, stress?
Patient: Work has been very stressful lately. My anxiety has been worse too.
Doctor: I see. Stress can definitely worsen asthma. Let's do a peak flow test. Your reading is lower than your baseline. I think we need to step up your treatment.
Patient: What do you suggest?
Doctor: I'm adding an inhaled corticosteroid - Budesonide. Use it twice daily. Continue your Salbutamol for rescue. Also, let's increase your Escitalopram to 15mg for the anxiety. And I want you to consider some breathing exercises.`
    },
    {
        id: 'DEMO-003',
        name: 'Mohammed Ali',
        age: 72,
        dob: '1954-01-08',
        gender: 'Male',
        phone: '+91 76543 21098',
        email: 'mohammed.ali@email.com',
        bloodGroup: 'O+',
        emergencyContact: '+91 76543 21097',
        address: '789 Station Road, Delhi 110001',
        medicalHistory: ['Coronary Artery Disease', 'Previous MI', 'Chronic Kidney Disease Stage 3', 'Atrial Fibrillation'],
        currentMedications: ['Warfarin 5mg', 'Atorvastatin 40mg', 'Carvedilol 12.5mg', 'Lisinopril 10mg'],
        allergies: ['Iodine contrast'],
        transcript: `Doctor: Mr. Ali, let's review your recent test results.
Patient: Yes doctor, I've been feeling more tired than usual.
Doctor: Your INR is 2.8, which is in the therapeutic range for your Warfarin. However, your kidney function has declined slightly. Creatinine is now 1.9.
Patient: Is that bad, doctor?
Doctor: We need to monitor it closely. Your heart function on the echo is stable, EF at 45%. But I'm seeing more frequent irregular beats on your ECG.
Patient: I do feel my heart racing sometimes.
Doctor: Your atrial fibrillation seems less controlled. We might need to adjust your Carvedilol. Also, given your kidney function, we need to be careful with contrast dye for any future imaging.
Patient: What about my cholesterol?
Doctor: Your LDL is 78, which is good on the Atorvastatin. Keep taking it. I want to see you again in 4 weeks with a repeat kidney function test. And please avoid NSAIDs - they can affect both your kidneys and interact with Warfarin.`
    },
    {
        id: 'DEMO-004',
        name: 'Anita Desai',
        age: 45,
        dob: '1981-11-30',
        gender: 'Female',
        phone: '+91 65432 10987',
        email: 'anita.desai@email.com',
        bloodGroup: 'AB+',
        emergencyContact: '+91 65432 10986',
        address: '321 Lake View, Bangalore, Karnataka 560001',
        medicalHistory: ['Hypothyroidism', 'Migraine', 'GERD'],
        currentMedications: ['Levothyroxine 75mcg', 'Sumatriptan PRN', 'Omeprazole 20mg'],
        allergies: [],
        transcript: `Doctor: Anita, how have your migraines been since we last met?
Patient: They've been more frequent, doctor. Almost twice a week now. The Sumatriptan helps but I'm worried about using it too often.
Doctor: You're right to be cautious. Using triptans too frequently can cause medication overuse headaches. Tell me about the pattern.
Patient: They usually start in the morning, with this throbbing pain on one side. Light and sound make it worse.
Doctor: Any nausea?
Patient: Yes, sometimes I can't eat anything during an attack.
Doctor: Given the frequency, I think we should start preventive therapy. Propranolol is a good option. We'll start low at 40mg twice daily.
Patient: Will it affect my thyroid medication?
Doctor: Good question. There can be some interaction, but we'll monitor your TSH more closely. Speaking of which, your last TSH was 3.2 - slightly higher than I'd like. Let's increase your Levothyroxine to 88mcg.
Patient: And my acid reflux?
Doctor: How's that doing on the Omeprazole?
Patient: Much better, actually. Hardly any symptoms now.
Doctor: Good, let's continue that. But I want to try reducing it in a few months. Long-term PPI use can affect nutrient absorption.`
    },
    {
        id: 'DEMO-005',
        name: 'Vikram Patel',
        age: 28,
        dob: '1998-05-12',
        gender: 'Male',
        phone: '+91 54321 09876',
        email: 'vikram.patel@email.com',
        bloodGroup: 'B-',
        emergencyContact: '+91 54321 09875',
        address: '567 Tech Park, Hyderabad, Telangana 500001',
        medicalHistory: ['None significant'],
        currentMedications: [],
        allergies: ['Dust mites'],
        transcript: `Doctor: Vikram, you mentioned you've been having some concerning symptoms?
Patient: Yes doctor. I've had this persistent cough for about 2 weeks, and now I have fever and body aches.
Doctor: What's your temperature been?
Patient: Around 101°F for the past two days. And I feel very weak.
Doctor: Any shortness of breath?
Patient: A little, especially when I climb stairs.
Doctor: Let me examine you. [Examination] Your chest sounds have some crackles in the right lower lobe. Your oxygen saturation is 96%.
Patient: What does that mean?
Doctor: I suspect you might have pneumonia. We'll need a chest X-ray to confirm. Given your symptoms and examination findings, I'm going to start you on antibiotics - Azithromycin for 5 days.
Patient: Is pneumonia serious?
Doctor: In a young, otherwise healthy person like you, we can usually treat it effectively with oral antibiotics. But I want you to rest, stay hydrated, and take Paracetamol for fever. If you feel significantly worse or have difficulty breathing, go to the emergency room immediately.`
    }
];

// Get all demo patients
export const getAllDemoPatients = () => demoPatients;

// Get demo patient by ID
export const getDemoPatientById = (id) => demoPatients.find(p => p.id === id);

// Get demo patient for quick selection
export const getDemoPatientOptions = () => demoPatients.map(p => ({
    id: p.id,
    name: p.name,
    age: p.age,
    summary: `${p.age}y ${p.gender} - ${p.medicalHistory.slice(0, 2).join(', ') || 'No significant history'}`
}));

// Sync demo patients with backend
export const syncDemoPatientsToBackend = async (apiUrl) => {
    try {
        const response = await fetch(`${apiUrl}/demo-patients/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patients: demoPatients })
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to sync demo patients:', error);
        return false;
    }
};

export default { demoPatients, getAllDemoPatients, getDemoPatientById, getDemoPatientOptions, syncDemoPatientsToBackend };
