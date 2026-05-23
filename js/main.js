
// ============================================
// خطوة وشفاء - JavaScript الرئيسي
// ============================================

// ========== SIDEBAR ==========
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

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
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#dc2626';

            // إزالة التحذير بعد 3 ثواني
            setTimeout(() => {
                field.style.borderColor = '';
            }, 3000);
        }
    });

    return isValid;
}

// ========== ADMIN LOGIN ==========
function checkAdminAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn && window.location.pathname.includes('/pages/admin/')) {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/pages/admin/login.html';
        }
    }
}

function adminLogin(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;

    if (password === 'Musymusssy101') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        window.location.href = '/pages/admin/dashboard.html';
    } else {
        alert('كلمة المرور غير صحيحة!');
    }
}

function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = '/pages/admin/login.html';
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

    if (answer.style.display === 'block') {
        answer.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    } else {
        answer.style.display = 'block';
        icon.style.transform = 'rotate(90deg)';
    }
}

// ========== APPOINTMENT STATUS ==========
function updateAppointmentStatus(id, status) {
    // في الإصدار الحالي (بدون backend) - نعرض رسالة تأكيد
    const statusText = {
        'confirmed': 'تم تأكيد الموعد',
        'cancelled': 'تم إلغاء الموعد',
        'completed': 'تم إنجاز الجلسة'
    };

    alert(statusText[status] || 'تم تحديث الحالة');
}

// ========== TREATMENT PLAN GENERATOR ==========
function generateTreatmentPlan(condition) {
    const plans = {
        'spine': {
            title: 'خطة علاج العمود الفقري',
            steps: [
                { title: 'التقييم الأولي', desc: 'فحص شامل للعمود الفقري وتحديد نقاط الألم' },
                { title: 'تمارين الإطالة', desc: 'إطالة عضلات الظهر والرقبة بشكل تدريجي' },
                { title: 'تقوية العمود الفقري', desc: 'تمارين خاصة لتقوية عضلات الظهر' },
                { title: 'تصحيح الوضعية', desc: 'تعلم الوضعية الصحيحة للجلوس والوقوف' }
            ]
        },
        'nerve': {
            title: 'خطة علاج الأعصاب والشلل',
            steps: [
                { title: 'تقييم الوظائف العصبية', desc: 'فحص حركة الأطراف والإحساس' },
                { title: 'العلاج الكهربائي', desc: 'تحفيز العضلات بالتيار الكهربائي المنخفض' },
                { title: 'تمارين الحركة', desc: 'تمرين المفاصل والعضلات المصابة يومياً' },
                { title: 'تمارين التوازن', desc: 'استعادة التوازن والتنسيق الحركي' }
            ]
        },
        'post-surgery': {
            title: 'خطة التأهيل بعد الجراحة',
            steps: [
                { title: 'مرحلة التعافي المبكر', desc: 'تحريك المفاصل بلطف لتجنب التصلب' },
                { title: 'تقوية العضلات', desc: 'تمارين تدريجية لتقوية العضلات حول منطقة الجراحة' },
                { title: 'استعادة الحركة الكاملة', desc: 'إطالة وتمديد لاستعادة مدى الحركة الطبيعي' },
                { title: 'العودة للنشاط', desc: 'تمارين وظيفية للعودة للحياة اليومية' }
            ]
        },
        'rheumatism': {
            title: 'خطة علاج الروماتيزم',
            steps: [
                { title: 'تخفيف الألم', desc: 'تقنيات تدليك خاصة لتخفيف التوتر العضلي' },
                { title: 'تمارين المدى', desc: 'حفظ مرونة المفاصل ومنع التصلب' },
                { title: 'تمارين الماء', desc: 'تمارين في الماء لتخفيف الضغط على المفاصل' },
                { title: 'نصائح يومية', desc: 'تغييرات بسيطة في نمط الحياة لتقليل الألم' }
            ]
        },
        'children': {
            title: 'خطة تأهيل الأطفال',
            steps: [
                { title: 'تقييم النمو', desc: 'فحص تطور الحركة والمهارات الحركية' },
                { title: 'العلاج باللعب', desc: 'أنشطة ممتعة مصممة لتطوير الحركة' },
                { title: 'تقوية العضلات', desc: 'تمارين مناسبة للعمر لتقوية الجسم' },
                { title: 'تدريب الوالدين', desc: 'تعليم الوالدين تمارين يمكن عملها في المنزل' }
            ]
        },
        'sports': {
            title: 'خطة إعادة التأهيل الرياضي',
            steps: [
                { title: 'تقييم الإصابة', desc: 'فحص دقيق لطبيعة الإصابة الرياضية' },
                { title: 'تخفيف الالتهاب', desc: 'تقنيات تبريد ورفع لتقليل الورم' },
                { title: 'استعادة القوة', desc: 'تمارين تدريجية لاستعادة قوة العضلات' },
                { title: 'العودة للرياضة', desc: 'برنامج متدرج للعودة الآمنة للنشاط الرياضي' }
            ]
        }
    };

    return plans[condition] || plans['spine'];
}

// ========== IMAGE UPLOAD PREVIEW ==========
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ========== LOCAL STORAGE HELPERS ==========
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
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
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: fadeInUp 0.3s ease;
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
document.addEventListener('DOMContentLoaded', function() {
    // التحقق من صلاحية الإدارة
    checkAdminAuth();

    // إغلاق السايدبار عند النقر خارجها
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.querySelector('.menu-btn');

        if (sidebar && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                closeSidebar();
            }
        }
    });

    // تأثيرات الظهور
    document.querySelectorAll('.card, .specialty-item, .province-item').forEach((el, i) => {
        el.style.animationDelay = `${i * 0.1}s`;
    });
});

// ========== SERVICE WORKER (للـ PWA) ==========
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
}
