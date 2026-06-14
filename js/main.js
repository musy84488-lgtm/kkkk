
// ============================================
// خطوة وشفاء - JavaScript الرئيسي
// ============================================

// ========== CONSTANTS ==========
const ADMIN_PASSWORD_HASH = '074cd303007f527f44bd56aaf68d4e2aec1bf952fa0974946e9db1b72ce69f16';
const STORAGE_KEY = 'kw_requests';

// ========== PATH HELPERS ==========
function getDepth() {
    const path = window.location.pathname;
    if (path.includes('/pages/admin/')) return 'admin';
    if (path.includes('/pages/')) return 'pages';
    return 'root';
}

function resolveAdminPath(file) {
    const depth = getDepth();
    if (depth === 'admin') return file;
    if (depth === 'pages') return 'admin/' + file;
    return 'pages/admin/' + file;
}

// ========== SIDEBAR ==========
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ========== SMOOTH SCROLL ==========
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                closeSidebar();
            }
        });
    });
});

// ========== ANIMATIONS ON SCROLL ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .step, .specialty-item, .province-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// ========== FORM VALIDATION ==========
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
        const value = field.tagName === 'SELECT' ? field.value : field.value.trim();
        if (!value) {
            isValid = false;
            field.classList.add('input-error');
            setTimeout(() => {
                field.classList.remove('input-error');
            }, 3000);
        }
    });

    return isValid;
}

// ========== ADMIN PASSWORD (SHA-256) ==========
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ========== ADMIN LOGIN ==========
function checkAdminAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const depth = getDepth();
    if (!isLoggedIn && depth === 'admin') {
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'login.html') {
            window.location.href = 'login.html';
        }
    }
}

async function adminLogin(e) {
    e.preventDefault();
    const passwordInput = document.getElementById('adminPassword');
    if (!passwordInput) return;

    const password = passwordInput.value;
    const btn = e.target.querySelector('button[type="submit"]');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
    }

    const hash = await hashPassword(password);

    if (hash === ADMIN_PASSWORD_HASH) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        window.location.href = resolveAdminPath('dashboard.html');
    } else {
        showNotification('كلمة المرور غير صحيحة!', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> دخول';
        }
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
}

// ========== PASSWORD RESET ==========
function showPasswordReset() {
    const phone = '+963938626949';
    const message = 'مرحباً، أريد تغيير/استعادة كلمة المرور للوحة الإدارة.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

// ========== WHATSAPP LINKS ==========
function openWhatsApp(phone, message = '') {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = message
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/${cleanPhone}`;
    window.open(url, '_blank');
}

// ========== CALL LINKS ==========
function makeCall(phone) {
    window.location.href = `tel:${phone}`;
}

// ========== FAQ TOGGLE ==========
function toggleFaq(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('.faq-item-icon');
    if (!answer) return;

    const isOpen = answer.style.display === 'block';
    answer.style.display = isOpen ? 'none' : 'block';
    if (icon) icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
}

// ========== FIREBASE CACHE ==========
let _requestsCache = [];
let _therapistsCache = [];

async function refreshCache() {
    if (typeof db === 'undefined') return;
    try {
        const [reqSnap, thSnap] = await Promise.all([
            db.collection('requests').orderBy('dateTimestamp', 'desc').get(),
            db.collection('therapists').orderBy('dateTimestamp', 'desc').get()
        ]);
        _requestsCache = reqSnap.docs.map(d => ({ ...d.data(), _docId: d.id }));
        _therapistsCache = thSnap.docs.map(d => ({ ...d.data(), _docId: d.id }));
    } catch (e) {
        console.warn('Firebase error:', e);
    }
}

// ========== REQUESTS FIRESTORE ==========
function getRequests() {
    return _requestsCache;
}

function generateTrackingCode() {
    const digits = Math.floor(100000 + Math.random() * 900000);
    return 'KW-' + digits;
}

async function addRequest(requestData) {
    const id = Date.now();
    const newRequest = {
        id,
        trackingCode: generateTrackingCode(),
        name: requestData.name,
        phone: requestData.phone,
        province: requestData.province,
        provinceLabel: requestData.provinceLabel,
        area: requestData.area,
        specialty: requestData.specialty,
        specialtyLabel: requestData.specialtyLabel,
        condition: requestData.condition,
        notes: requestData.notes || '',
        status: 'new',
        date: new Date().toLocaleDateString('ar-SY'),
        dateTimestamp: id,
        readByAdmin: false
    };
    if (typeof db !== 'undefined') {
        await db.collection('requests').doc(String(id)).set(newRequest);
        await refreshCache();
    }
    return newRequest;
}

async function updateRequestStatus(id, status) {
    if (typeof db !== 'undefined') {
        await db.collection('requests').doc(String(id)).update({ status, readByAdmin: true });
        await refreshCache();
    }
}

async function markAllRead() {
    if (typeof db === 'undefined') return;
    const unread = _requestsCache.filter(r => !r.readByAdmin);
    if (unread.length === 0) return;
    const batch = db.batch();
    unread.forEach(r => {
        batch.update(db.collection('requests').doc(String(r.id)), { readByAdmin: true });
    });
    await batch.commit();
    await refreshCache();
}

function getNewRequestsCount() {
    return _requestsCache.filter(r => !r.readByAdmin).length;
}

function getStatusLabel(status) {
    const labels = {
        'new': 'جديد',
        'reviewing': 'قيد المراجعة',
        'assigned': 'تم التعيين',
        'in_progress': 'قيد العلاج',
        'completed': 'مكتمل',
        'rejected': 'مرفوض'
    };
    return labels[status] || 'جديد';
}

function getStatusClass(status) {
    const classes = {
        'new': 'pending',
        'reviewing': 'pending',
        'assigned': 'approved',
        'in_progress': 'approved',
        'completed': 'completed',
        'rejected': 'rejected'
    };
    return classes[status] || 'pending';
}

// ========== ADMIN NOTIFICATION BADGE ==========
function updateAdminBadge() {
    const badge = document.getElementById('adminNotifBadge');
    if (!badge) return;
    const count = getNewRequestsCount();
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
    } else {
        badge.style.display = 'none';
    }
}

// ========== ADMIN DASHBOARD DATA ==========
function loadDashboardStats() {
    const requests = getRequests();
    const newCount = requests.filter(r => r.status === 'new' || r.status === 'reviewing').length;
    const inProgressCount = requests.filter(r => r.status === 'in_progress' || r.status === 'assigned').length;
    const todayCount = requests.filter(r => {
        const today = new Date().toLocaleDateString('ar-SY');
        return r.date === today;
    }).length;

    const elNew = document.getElementById('statNew');
    const elInProgress = document.getElementById('statInProgress');
    const elToday = document.getElementById('statToday');
    const elTotal = document.getElementById('statTotal');

    if (elNew) elNew.textContent = newCount;
    if (elInProgress) elInProgress.textContent = inProgressCount;
    if (elToday) elToday.textContent = todayCount || requests.length;
    if (elTotal) elTotal.textContent = requests.length;
}

function loadRecentRequests() {
    const tbody = document.getElementById('recentRequestsBody');
    if (!tbody) return;

    const requests = getRequests().slice(0, 5);

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--gray);padding:30px;">لا توجد طلبات بعد</td></tr>';
        return;
    }

    tbody.innerHTML = requests.map(r => `
        <tr>
            <td>${r.name}</td>
            <td>${r.provinceLabel || r.province}</td>
            <td>${r.specialtyLabel || r.specialty || 'غير محدد'}</td>
            <td><span class="admin-badge ${getStatusClass(r.status)}">${getStatusLabel(r.status)}</span></td>
            <td>
                ${r.status === 'new' ? `
                    <button class="admin-btn admin-btn-sm admin-btn-success" onclick="quickAccept(${r.id})">قبول</button>
                    <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="quickReject(${r.id})">رفض</button>
                ` : `
                    <a href="patients.html" class="admin-btn admin-btn-sm admin-btn-primary">عرض الكل</a>
                `}
            </td>
        </tr>
    `).join('');
}

async function quickAccept(id) {
    await updateRequestStatus(id, 'reviewing');
    loadRecentRequests();
    loadDashboardStats();
    updateAdminBadge();
    showNotification('تم قبول الطلب', 'success');
}

async function quickReject(id) {
    await updateRequestStatus(id, 'rejected');
    loadRecentRequests();
    loadDashboardStats();
    updateAdminBadge();
    showNotification('تم رفض الطلب', 'error');
}

// ========== ADMIN PATIENTS PAGE ==========
function loadPatientRequests() {
    const tbody = document.getElementById('patientsTableBody');
    if (!tbody) return;

    const requests = getRequests();

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--gray);padding:40px;"><i class="fas fa-inbox" style="font-size:32px;display:block;margin-bottom:12px;opacity:0.4;"></i>لا توجد طلبات بعد</td></tr>';
        return;
    }

    tbody.innerHTML = requests.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>
                <div style="font-weight:600;">${r.name}</div>
                <div style="font-size:12px;color:var(--gray);">${r.trackingCode}</div>
            </td>
            <td>${r.phone}</td>
            <td>${r.provinceLabel || r.province}</td>
            <td>${r.specialtyLabel || r.specialty || 'غير محدد'}</td>
            <td><span class="admin-badge ${getStatusClass(r.status)}">${getStatusLabel(r.status)}</span></td>
            <td>
                <select class="status-select" onchange="changeStatus(${r.id}, this.value)" style="font-family:'Tajawal',sans-serif;font-size:12px;padding:4px 8px;border:1px solid var(--gray-lighter);border-radius:6px;background:white;cursor:pointer;">
                    <option value="new" ${r.status === 'new' ? 'selected' : ''}>جديد</option>
                    <option value="reviewing" ${r.status === 'reviewing' ? 'selected' : ''}>قيد المراجعة</option>
                    <option value="assigned" ${r.status === 'assigned' ? 'selected' : ''}>تم التعيين</option>
                    <option value="in_progress" ${r.status === 'in_progress' ? 'selected' : ''}>قيد العلاج</option>
                    <option value="completed" ${r.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                    <option value="rejected" ${r.status === 'rejected' ? 'selected' : ''}>مرفوض</option>
                </select>
                <button class="admin-btn admin-btn-sm admin-btn-primary" onclick="viewRequest(${r.id})" style="margin-top:4px;">عرض</button>
            </td>
        </tr>
    `).join('');

    markAllRead();
    updateAdminBadge();
}

async function changeStatus(id, status) {
    await updateRequestStatus(id, status);
    showNotification('تم تحديث الحالة', 'success');
    updateAdminBadge();
}

function viewRequest(id) {
    const requests = getRequests();
    const r = requests.find(req => req.id === id);
    if (!r) return;

    const modal = document.getElementById('requestModal');
    const body = document.getElementById('requestModalBody');
    if (!modal || !body) return;

    body.innerHTML = `
        <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:18px;font-weight:800;">${r.name}</h3>
                <span class="admin-badge ${getStatusClass(r.status)}">${getStatusLabel(r.status)}</span>
            </div>
            <div class="profile-info-row"><span class="profile-info-label">كود التتبع</span><span class="profile-info-value" style="color:var(--primary);font-family:monospace;">${r.trackingCode}</span></div>
            <div class="profile-info-row"><span class="profile-info-label">رقم الهاتف</span><span class="profile-info-value">${r.phone}</span></div>
            <div class="profile-info-row"><span class="profile-info-label">المحافظة</span><span class="profile-info-value">${r.provinceLabel || r.province}</span></div>
            <div class="profile-info-row"><span class="profile-info-label">المنطقة</span><span class="profile-info-value">${r.area}</span></div>
            <div class="profile-info-row"><span class="profile-info-label">التخصص</span><span class="profile-info-value">${r.specialtyLabel || r.specialty || 'غير محدد'}</span></div>
            <div class="profile-info-row"><span class="profile-info-label">تاريخ الطلب</span><span class="profile-info-value">${r.date}</span></div>
        </div>
        <div style="background:var(--bg);border-radius:var(--radius);padding:16px;margin-bottom:16px;">
            <div style="font-weight:700;margin-bottom:8px;color:var(--dark);">وصف الحالة:</div>
            <div style="font-size:14px;color:var(--gray);line-height:1.8;">${r.condition}</div>
        </div>
        ${r.notes ? `
        <div style="background:var(--primary-light);border-radius:var(--radius);padding:16px;">
            <div style="font-weight:700;margin-bottom:8px;color:var(--primary-dark);">ملاحظات إضافية:</div>
            <div style="font-size:14px;color:var(--gray);line-height:1.8;">${r.notes}</div>
        </div>` : ''}
        <div style="margin-top:16px;display:flex;gap:8px;">
            <a href="tel:${r.phone}" class="admin-btn admin-btn-primary" style="flex:1;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;">
                <i class="fas fa-phone"></i> اتصال
            </a>
            <a href="https://wa.me/963${r.phone.replace(/^0/, '')}" target="_blank" class="admin-btn admin-btn-success" style="flex:1;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;">
                <i class="fab fa-whatsapp"></i> واتساب
            </a>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('requestModal');
    if (modal) modal.style.display = 'none';
}

function exportCSV() {
    const requests = getRequests();
    if (requests.length === 0) {
        showNotification('لا توجد بيانات للتصدير', 'error');
        return;
    }

    const headers = ['كود التتبع', 'الاسم', 'الهاتف', 'المحافظة', 'المنطقة', 'التخصص', 'الحالة', 'التاريخ', 'وصف الحالة'];
    const rows = requests.map(r => [
        r.trackingCode,
        r.name,
        r.phone,
        r.provinceLabel || r.province,
        r.area,
        r.specialtyLabel || r.specialty || 'غير محدد',
        getStatusLabel(r.status),
        r.date,
        '"' + (r.condition || '').replace(/"/g, '""') + '"'
    ]);

    const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'طلبات-خطوة-وشفاء-' + new Date().toLocaleDateString('en') + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('تم تصدير الملف بنجاح', 'success');
}

// ========== REQUEST TRACKING ==========
async function trackRequest() {
    await refreshCache();
    const input = document.getElementById('trackingInput');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        showNotification('يرجى إدخال كود التتبع', 'error');
        return;
    }

    const requests = getRequests();
    const request = requests.find(r => r.trackingCode === code);
    const resultDiv = document.getElementById('trackingResult');
    if (!resultDiv) return;

    if (!request) {
        resultDiv.innerHTML = `
            <div class="tracking-not-found">
                <i class="fas fa-search" style="font-size:40px;color:var(--gray-light);margin-bottom:12px;display:block;"></i>
                <div style="font-size:16px;font-weight:600;color:var(--gray);">لم يتم العثور على الطلب</div>
                <div style="font-size:14px;color:var(--gray-light);margin-top:8px;">تأكد من الكود وأعد المحاولة</div>
            </div>`;
        return;
    }

    const steps = [
        { key: 'new', label: 'استلام الطلب', icon: 'fa-paper-plane' },
        { key: 'reviewing', label: 'قيد المراجعة', icon: 'fa-search' },
        { key: 'assigned', label: 'تم التعيين', icon: 'fa-user-check' },
        { key: 'in_progress', label: 'قيد العلاج', icon: 'fa-heartbeat' },
        { key: 'completed', label: 'مكتمل', icon: 'fa-check-circle' }
    ];

    const statusOrder = ['new', 'reviewing', 'assigned', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(request.status);
    const isRejected = request.status === 'rejected';

    resultDiv.innerHTML = `
        <div class="tracking-card">
            <div class="tracking-header">
                <div class="tracking-code">${request.trackingCode}</div>
                <span class="admin-badge ${getStatusClass(request.status)}">${getStatusLabel(request.status)}</span>
            </div>
            <div class="tracking-info">
                <div class="tracking-row"><span>الاسم</span><span>${request.name}</span></div>
                <div class="tracking-row"><span>المحافظة</span><span>${request.provinceLabel || request.province}</span></div>
                <div class="tracking-row"><span>تاريخ الطلب</span><span>${request.date}</span></div>
            </div>
            ${isRejected ? `
            <div style="background:rgba(220,38,38,0.08);border-radius:var(--radius);padding:16px;text-align:center;margin-top:16px;">
                <i class="fas fa-times-circle" style="color:var(--danger);font-size:28px;margin-bottom:8px;display:block;"></i>
                <div style="font-weight:700;color:var(--danger);">تم رفض الطلب</div>
                <div style="font-size:13px;color:var(--gray);margin-top:6px;">للاستفسار تواصل معنا عبر واتساب</div>
                <a href="https://wa.me/963938626949" class="btn btn-whatsapp" style="max-width:180px;margin-top:12px;font-size:14px;padding:10px;">
                    <i class="fab fa-whatsapp"></i> واتساب
                </a>
            </div>` : `
            <div class="tracking-steps">
                ${steps.map((step, i) => {
                    const isDone = i <= currentIndex;
                    const isCurrent = i === currentIndex;
                    return `
                    <div class="tracking-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
                        <div class="tracking-step-icon">
                            <i class="fas ${isDone ? 'fa-check' : step.icon}"></i>
                        </div>
                        <div class="tracking-step-label">${step.label}</div>
                        ${i < steps.length - 1 ? '<div class="tracking-step-line"></div>' : ''}
                    </div>`;
                }).join('')}
            </div>`}
        </div>`;
}

// ========== WHATSAPP ADMIN NOTIFICATION ==========
const ADMIN_WHATSAPP = '963938626949';

function sendAdminWhatsApp(message) {
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
}

function buildRequestWhatsApp(request) {
    return `🔔 طلب علاج جديد — خطوة وشفاء\n\nكود التتبع: ${request.trackingCode}\nالاسم: ${request.name}\nالهاتف: ${request.phone}\nالمحافظة: ${request.provinceLabel || request.province}\nالمنطقة: ${request.area}\nالتخصص: ${request.specialtyLabel || 'غير محدد'}\n\nوصف الحالة:\n${request.condition}${request.notes ? '\n\nملاحظات: ' + request.notes : ''}\n\n— منصة خطوة وشفاء`;
}

function buildTherapistWhatsApp(therapist) {
    return `👨‍⚕️ طلب تسجيل معالج جديد — خطوة وشفاء\n\nالاسم: ${therapist.name}\nالهاتف: ${therapist.phone}\nالمحافظة: ${therapist.provinceLabel || therapist.province}\nالمنطقة: ${therapist.area}\nالتخصص: ${therapist.specialtyLabel}\nزيارات منزلية: ${therapist.homeVisit ? 'نعم' : 'لا'}${therapist.notes ? '\n\nالخبرات والشهادات:\n' + therapist.notes : ''}\n\n— منصة خطوة وشفاء`;
}

// ========== THERAPISTS FIRESTORE ==========
function getTherapists() {
    return _therapistsCache;
}

async function addTherapist(data) {
    const id = Date.now();
    const newTherapist = {
        id,
        name: data.name,
        phone: data.phone,
        province: data.province,
        provinceLabel: data.provinceLabel,
        area: data.area,
        specialty: data.specialty,
        specialtyLabel: data.specialtyLabel,
        homeVisit: data.homeVisit,
        notes: data.notes || '',
        status: 'pending',
        date: new Date().toLocaleDateString('ar-SY'),
        dateTimestamp: id
    };
    if (typeof db !== 'undefined') {
        await db.collection('therapists').doc(String(id)).set(newTherapist);
        await refreshCache();
    }
    return newTherapist;
}

async function updateTherapistStatus(id, status) {
    if (typeof db !== 'undefined') {
        await db.collection('therapists').doc(String(id)).update({ status });
        await refreshCache();
    }
}

function getTherapistStatusLabel(status) {
    const labels = { pending: 'بانتظار التفعيل', approved: 'معتمد', rejected: 'مرفوض', suspended: 'موقوف' };
    return labels[status] || 'بانتظار التفعيل';
}

function getTherapistStatusClass(status) {
    const classes = { pending: 'pending', approved: 'approved', rejected: 'rejected', suspended: 'rejected' };
    return classes[status] || 'pending';
}

function loadTherapistsTable() {
    const tbody = document.getElementById('therapistsTableBody');
    if (!tbody) return;

    const therapists = getTherapists();
    if (therapists.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--gray);padding:40px;"><i class="fas fa-user-md" style="font-size:32px;display:block;margin-bottom:12px;opacity:0.4;"></i>لا توجد طلبات تسجيل بعد</td></tr>';
        return;
    }

    tbody.innerHTML = therapists.map((t, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>
                <div style="font-weight:600;">${t.name}</div>
                <div style="font-size:11px;color:var(--gray-light);">${t.date}</div>
            </td>
            <td>${t.phone}</td>
            <td>${t.provinceLabel || t.province}</td>
            <td>${t.specialtyLabel}</td>
            <td><span class="admin-badge ${getTherapistStatusClass(t.status)}">${getTherapistStatusLabel(t.status)}</span></td>
            <td>
                <div style="display:flex;flex-direction:column;gap:4px;">
                    ${t.status === 'pending' ? `
                        <button class="admin-btn admin-btn-sm admin-btn-success" onclick="approveTherapist(${t.id})">تفعيل</button>
                        <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="rejectTherapist(${t.id})">رفض</button>
                    ` : `
                        <button class="admin-btn admin-btn-sm admin-btn-primary" onclick="viewTherapist(${t.id})">عرض</button>
                        ${t.status === 'approved' ? `<button class="admin-btn admin-btn-sm admin-btn-danger" onclick="suspendTherapist(${t.id})">تعطيل</button>` : ''}
                    `}
                </div>
            </td>
        </tr>
    `).join('');
}

async function approveTherapist(id) {
    await updateTherapistStatus(id, 'approved');
    showNotification('تم تفعيل المعالج', 'success');
    loadTherapistsTable();
}

async function rejectTherapist(id) {
    await updateTherapistStatus(id, 'rejected');
    showNotification('تم رفض طلب التسجيل', 'error');
    loadTherapistsTable();
}

async function suspendTherapist(id) {
    await updateTherapistStatus(id, 'suspended');
    showNotification('تم تعطيل حساب المعالج', 'error');
    loadTherapistsTable();
}

function viewTherapist(id) {
    const therapists = getTherapists();
    const t = therapists.find(th => th.id === id);
    if (!t) return;

    const modal = document.getElementById('requestModal');
    const body = document.getElementById('requestModalBody');
    if (!modal || !body) return;

    body.innerHTML = `
        <div style="margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:18px;font-weight:800;">${t.name}</h3>
                <span class="admin-badge ${getTherapistStatusClass(t.status)}">${getTherapistStatusLabel(t.status)}</span>
            </div>
            <div class="profile-info-row"><span class="profile-info-label">رقم الهاتف</span><span class="profile-info-value">${t.phone}</span></div>
            <div class="profile-info-row"><span class="profile-info-label">المحافظة</span><span class="profile-info-value">${t.provinceLabel}</span></div>
            <div class="profile-info-row"><span class="profile-info-label">المنطقة</span><span class="profile-info-value">${t.area}</span></div>
            <div class="profile-info-row"><span class="profile-info-label">التخصص</span><span class="profile-info-value">${t.specialtyLabel}</span></div>
            <div class="profile-info-row"><span class="profile-info-label">زيارات منزلية</span><span class="profile-info-value">${t.homeVisit ? 'نعم ✓' : 'لا'}</span></div>
            <div class="profile-info-row"><span class="profile-info-label">تاريخ التسجيل</span><span class="profile-info-value">${t.date}</span></div>
        </div>
        ${t.notes ? `
        <div style="background:var(--bg);border-radius:var(--radius);padding:16px;margin-bottom:16px;">
            <div style="font-weight:700;margin-bottom:8px;">الخبرات والشهادات:</div>
            <div style="font-size:14px;color:var(--gray);line-height:1.8;">${t.notes}</div>
        </div>` : ''}
        <div style="display:flex;gap:8px;margin-top:16px;">
            <a href="tel:${t.phone}" class="admin-btn admin-btn-primary" style="flex:1;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;">
                <i class="fas fa-phone"></i> اتصال
            </a>
            <a href="https://wa.me/963${t.phone.replace(/^0/, '')}" target="_blank" class="admin-btn admin-btn-success" style="flex:1;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;">
                <i class="fab fa-whatsapp"></i> واتساب
            </a>
        </div>`;
    modal.style.display = 'flex';
}

// ========== PWA INSTALL PROMPT ==========
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.style.display = 'flex';
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.style.display = 'none';
});

function installPWA() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(() => {
        deferredInstallPrompt = null;
        const banner = document.getElementById('pwaInstallBanner');
        if (banner) banner.style.display = 'none';
    });
}

function dismissPWABanner() {
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.style.display = 'none';
    sessionStorage.setItem('pwaBannerDismissed', '1');
}

// ========== IMAGE UPLOAD PREVIEW ==========
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.kw-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'kw-notification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#00a86b' : type === 'error' ? '#dc2626' : '#0066a1'};
        color: white;
        padding: 14px 24px;
        border-radius: 12px;
        font-family: 'Tajawal', sans-serif;
        font-weight: 600;
        font-size: 15px;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        animation: fadeInUp 0.3s ease;
        max-width: 320px;
        text-align: center;
        direction: rtl;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', async function () {
    checkAdminAuth();
    await refreshCache();
    updateAdminBadge();

    document.addEventListener('click', function (e) {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.querySelector('.menu-btn');
        if (sidebar && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
                closeSidebar();
            }
        }

        const modal = document.getElementById('requestModal');
        if (modal && e.target === modal) {
            closeModal();
        }
    });

    document.querySelectorAll('.card, .specialty-item, .province-item').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.1}s`;
    });

    if (document.getElementById('recentRequestsBody')) {
        loadDashboardStats();
        loadRecentRequests();
    }

    if (document.getElementById('patientsTableBody')) {
        loadPatientRequests();
    }

    if (document.getElementById('therapistsTableBody')) {
        loadTherapistsTable();
    }

    const pwaBanner = document.getElementById('pwaInstallBanner');
    if (pwaBanner && sessionStorage.getItem('pwaBannerDismissed')) {
        pwaBanner.style.display = 'none';
    }

    const trackBtn = document.getElementById('trackBtn');
    if (trackBtn) {
        trackBtn.addEventListener('click', trackRequest);
    }
    const trackInput = document.getElementById('trackingInput');
    if (trackInput) {
        trackInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') trackRequest();
        });
    }
});

// ========== SERVICE WORKER (PWA) ==========
if ('serviceWorker' in navigator) {
    const swPath = (() => {
        const path = window.location.pathname;
        if (path.includes('/pages/admin/')) return '../../sw.js';
        if (path.includes('/pages/')) return '../sw.js';
        return '/sw.js';
    })();
    navigator.serviceWorker.register(swPath).catch(() => {});
}
