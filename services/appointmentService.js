// CLARA Appointment Management Service
// =====================================
// Handles all appointment booking, doctor management, and prescription functionality

const API_BASE = 'http://localhost:3001/api';

// ============================================
// Auth State Management
// ============================================
export const AuthState = {
    token: localStorage.getItem('clara_token'),
    user: JSON.parse(localStorage.getItem('clara_user') || 'null'),
    
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('clara_token', token);
        localStorage.setItem('clara_user', JSON.stringify(user));
    },
    
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('clara_token');
        localStorage.removeItem('clara_user');
    },
    
    isLoggedIn() {
        return !!this.token && !!this.user;
    },
    
    isDoctor() {
        return this.user?.role === 'doctor';
    },
    
    isAdmin() {
        return this.user?.role === 'admin';
    },
    
    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }
};

// ============================================
// Authentication API
// ============================================
export const AuthAPI = {
    async register(userData) {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        AuthState.setAuth(data.token, data.user);
        return data;
    },
    
    async login(email, password) {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        AuthState.setAuth(data.token, data.user);
        return data;
    },
    
    async getProfile() {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async updateProfile(updates) {
        const response = await fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: AuthState.getHeaders(),
            body: JSON.stringify(updates)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    logout() {
        AuthState.clearAuth();
    }
};

// ============================================
// Doctor API
// ============================================
export const DoctorAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/doctors?${queryString}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async getById(doctorId) {
        const response = await fetch(`${API_BASE}/doctors/${doctorId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async getAvailability(doctorId, date) {
        const response = await fetch(`${API_BASE}/doctors/${doctorId}/availability?date=${date}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async registerProfile(profileData) {
        const response = await fetch(`${API_BASE}/doctors/register`, {
            method: 'POST',
            headers: AuthState.getHeaders(),
            body: JSON.stringify(profileData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async updateSchedule(scheduleData) {
        const response = await fetch(`${API_BASE}/doctors/schedule`, {
            method: 'PUT',
            headers: AuthState.getHeaders(),
            body: JSON.stringify(scheduleData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async getSpecializations() {
        const response = await fetch(`${API_BASE}/specializations`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async search(params) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/search/doctors?${queryString}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async getReviews(doctorId, page = 1) {
        const response = await fetch(`${API_BASE}/doctors/${doctorId}/reviews?page=${page}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async addReview(doctorId, reviewData) {
        const response = await fetch(`${API_BASE}/doctors/${doctorId}/reviews`, {
            method: 'POST',
            headers: AuthState.getHeaders(),
            body: JSON.stringify(reviewData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};

// ============================================
// Appointment API
// ============================================
export const AppointmentAPI = {
    async book(appointmentData) {
        const response = await fetch(`${API_BASE}/appointments`, {
            method: 'POST',
            headers: AuthState.getHeaders(),
            body: JSON.stringify(appointmentData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/appointments?${queryString}`, {
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async getById(appointmentId) {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async updateStatus(appointmentId, status, notes) {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/status`, {
            method: 'PATCH',
            headers: AuthState.getHeaders(),
            body: JSON.stringify({ status, notes })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async reschedule(appointmentId, rescheduleData) {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/reschedule`, {
            method: 'PUT',
            headers: AuthState.getHeaders(),
            body: JSON.stringify(rescheduleData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async cancel(appointmentId, reason) {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}`, {
            method: 'DELETE',
            headers: AuthState.getHeaders(),
            body: JSON.stringify({ reason })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async checkin(appointmentId) {
        const response = await fetch(`${API_BASE}/appointments/${appointmentId}/checkin`, {
            method: 'POST',
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};

// ============================================
// Prescription API
// ============================================
export const PrescriptionAPI = {
    async create(prescriptionData) {
        const response = await fetch(`${API_BASE}/prescriptions`, {
            method: 'POST',
            headers: AuthState.getHeaders(),
            body: JSON.stringify(prescriptionData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/prescriptions?${queryString}`, {
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async getById(prescriptionId) {
        const response = await fetch(`${API_BASE}/prescriptions/${prescriptionId}`, {
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async downloadPDF(prescriptionId) {
        const response = await fetch(`${API_BASE}/prescriptions/${prescriptionId}/pdf`, {
            headers: AuthState.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to download PDF');
        return response.blob();
    }
};

// ============================================
// Notification API
// ============================================
export const NotificationAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/notifications?${queryString}`, {
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async markAsRead(notificationId) {
        const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async markAllAsRead() {
        const response = await fetch(`${API_BASE}/notifications/read-all`, {
            method: 'PATCH',
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};

// ============================================
// Doctor Dashboard API
// ============================================
export const DashboardAPI = {
    async getDoctorDashboard() {
        const response = await fetch(`${API_BASE}/doctor/dashboard`, {
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async getPatients(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}/doctor/patients?${queryString}`, {
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    },
    
    async getPatientHistory(patientId) {
        const response = await fetch(`${API_BASE}/doctor/patients/${patientId}/history`, {
            headers: AuthState.getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        return data;
    }
};

// ============================================
// UI Helper Functions
// ============================================
export const AppointmentUI = {
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    },
    
    // Format time for display
    formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    },
    
    // Get status badge HTML
    getStatusBadge(status) {
        const colors = {
            'scheduled': 'bg-blue-100 text-blue-800',
            'confirmed': 'bg-green-100 text-green-800',
            'in-progress': 'bg-yellow-100 text-yellow-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'no-show': 'bg-gray-100 text-gray-800',
            'rescheduled': 'bg-orange-100 text-orange-800'
        };
        const colorClass = colors[status] || 'bg-gray-100 text-gray-800';
        return `<span class="px-2 py-1 rounded-full text-xs font-semibold ${colorClass}">${status.toUpperCase()}</span>`;
    },
    
    // Render appointment card
    renderAppointmentCard(appointment, isDoctor = false) {
        const patient = appointment.patientId;
        const doctor = appointment.doctorId;
        const doctorUser = doctor?.userId;
        
        return `
            <div class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
                 onclick="window.showAppointmentDetail('${appointment._id}')">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold text-slate-800">
                            ${isDoctor 
                                ? `${patient?.firstName} ${patient?.lastName}` 
                                : `Dr. ${doctorUser?.firstName} ${doctorUser?.lastName}`}
                        </p>
                        <p class="text-sm text-slate-500">
                            ${isDoctor ? 'Patient' : doctor?.specialization || 'Doctor'}
                        </p>
                    </div>
                    ${this.getStatusBadge(appointment.status)}
                </div>
                <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span class="text-slate-400">📅</span>
                        <span class="text-slate-600">${this.formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">🕐</span>
                        <span class="text-slate-600">${this.formatTime(appointment.timeSlot.startTime)}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">📋</span>
                        <span class="text-slate-600">${appointment.appointmentType}</span>
                    </div>
                    <div>
                        <span class="text-slate-400">💰</span>
                        <span class="text-slate-600">₹${appointment.fee || 0}</span>
                    </div>
                </div>
                <p class="mt-2 text-sm text-slate-500 truncate">
                    <span class="font-medium">Reason:</span> ${appointment.reason}
                </p>
            </div>
        `;
    },
    
    // Render doctor card
    renderDoctorCard(doctor) {
        const user = doctor.userId;
        return `
            <div class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
                 onclick="window.showDoctorDetail('${doctor._id}')">
                <div class="flex items-center space-x-3 mb-3">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">👨‍⚕️</div>
                    <div>
                        <p class="font-semibold text-slate-800">Dr. ${user?.firstName} ${user?.lastName}</p>
                        <p class="text-sm text-blue-600">${doctor.specialization}</p>
                    </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center space-x-1">
                        <span class="text-yellow-500">⭐</span>
                        <span class="font-semibold">${doctor.averageRating?.toFixed(1) || 'New'}</span>
                        <span class="text-slate-400">(${doctor.totalReviews || 0})</span>
                    </div>
                    <div class="text-green-600 font-semibold">₹${doctor.consultationFee}</div>
                </div>
                <div class="mt-2 text-xs text-slate-500">
                    ${doctor.experience} years exp • ${doctor.languages?.join(', ') || 'English'}
                </div>
                ${doctor.telemedicineEnabled ? 
                    '<span class="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs">📹 Video Consultation</span>' 
                    : ''}
            </div>
        `;
    },
    
    // Render prescription card
    renderPrescriptionCard(prescription) {
        const doctor = prescription.doctorId;
        const doctorUser = doctor?.userId;
        
        return `
            <div class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer" 
                 onclick="window.showPrescriptionDetail('${prescription._id}')">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="font-semibold text-slate-800">${prescription.prescriptionId}</p>
                        <p class="text-sm text-slate-500">
                            Dr. ${doctorUser?.firstName} ${doctorUser?.lastName}
                        </p>
                    </div>
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                        prescription.isDispensed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }">
                        ${prescription.isDispensed ? 'Dispensed' : 'Active'}
                    </span>
                </div>
                <div class="text-sm mb-2">
                    <span class="text-slate-400">📅</span>
                    <span class="text-slate-600">${this.formatDate(prescription.createdAt)}</span>
                    <span class="mx-2 text-slate-300">|</span>
                    <span class="text-slate-400">Valid until:</span>
                    <span class="text-slate-600">${this.formatDate(prescription.validUntil)}</span>
                </div>
                <div class="flex flex-wrap gap-1 mb-2">
                    ${prescription.diagnosis?.slice(0, 2).map(d => 
                        `<span class="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">${d.condition}</span>`
                    ).join('') || ''}
                </div>
                <div class="text-sm text-slate-600">
                    <span class="font-medium">${prescription.medications?.length || 0}</span> medications
                    ${prescription.labTests?.length > 0 ? ` • ${prescription.labTests.length} lab tests` : ''}
                </div>
                ${prescription.aiGenerated?.warnings?.length > 0 ? 
                    '<div class="mt-2 text-xs text-yellow-600">⚠️ Drug interaction warning</div>' 
                    : ''}
            </div>
        `;
    },
    
    // Show toast notification
    showToast(message, type = 'info') {
        const colors = {
            'success': 'bg-green-500',
            'error': 'bg-red-500',
            'warning': 'bg-yellow-500',
            'info': 'bg-blue-500'
        };
        
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 fade-in`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
};

// Export all for use in main app
export default {
    AuthState,
    AuthAPI,
    DoctorAPI,
    AppointmentAPI,
    PrescriptionAPI,
    NotificationAPI,
    DashboardAPI,
    AppointmentUI
};
