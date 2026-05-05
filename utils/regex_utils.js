
export function genId(prefix) {

    const keyMap = {
        'C':   'pos_customers',
        'I':   'pos_items',
        'ORD': 'pos_orders'
    };
    const storageKey = keyMap[prefix];
    let nextNum = 1;

    if (storageKey) {
        try {
            const raw = localStorage.getItem(storageKey);
            const list = raw ? JSON.parse(raw) : [];

            // Orders use 'orderId' field; customers & items use 'id'
            const idField = prefix === 'ORD' ? 'orderId' : 'id';
            const nums = list
                .map(item => {
                    const idVal = item[idField] || '';
                    const match = idVal.match(new RegExp('^' + prefix + '-(\\d+)$'));
                    return match ? parseInt(match[1], 10) : 0;
                })
                .filter(n => n > 0);

            if (nums.length > 0) {
                nextNum = Math.max(...nums) + 1;
            }
        } catch (e) {
            nextNum = 1;
        }
    }

    // Zero-pad to 3 digits: C-001, I-001, ORD-001
    return prefix + '-' + String(nextNum).padStart(3, '0');
}

// ── Toast notification (SweetAlert2) ──
export function toast(icon, title, text = '') {
    Swal.fire({
        icon, title, text,
        timer: 2200, timerProgressBar: true, showConfirmButton: false,
        background: '#1a1d2e', color: '#e2e8f0',
        iconColor: icon === 'success' ? '#34d399' : icon === 'error' ? '#f87171' : '#fbbf24'
    });
}

// ── Confirm dialog (SweetAlert2) ──
export function confirmDlg(title, text, cb) {
    Swal.fire({
        title, text, icon: 'warning',
        showCancelButton: true, confirmButtonText: 'Yes', cancelButtonText: 'Cancel',
        background: '#1a1d2e', color: '#e2e8f0',
        confirmButtonColor: '#6366f1', cancelButtonColor: '#374151'
    }).then(r => {
        if (r.isConfirmed) cb();
    });
}

// ── Regex validators ──
export const regex = {
    email:     /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone:     /^\d{10}$/,
    name:      /^[a-zA-Z\s'\-]{2,50}$/,
    price:     /^\d+(\.\d{1,2})?$/,
    qty:       /^[1-9]\d*$/,
    password:  /^.{6,}$/,
    discount:  /^(100|[1-9]?\d)$/,

    isValidEmail:    (v) => regex.email.test(v.trim()),
    isValidPhone:    (v) => regex.phone.test(v.trim()),
    isValidName:     (v) => regex.name.test(v.trim()),
    isValidPassword: (v) => regex.password.test(v),
};

// ── Field highlight helpers ──
export function markInvalid(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('is-invalid');
    el.classList.remove('is-valid');
    let fb = el.parentElement.querySelector('.invalid-feedback');
    if (!fb) {
        fb = document.createElement('div');
        fb.className = 'invalid-feedback';
        el.parentElement.appendChild(fb);
    }
    fb.textContent = msg;
}

export function markValid(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('is-invalid');
    el.classList.add('is-valid');
    const fb = el.parentElement.querySelector('.invalid-feedback');
    if (fb) fb.textContent = '';
}

export function clearMarks(...ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('is-invalid', 'is-valid');
        const fb = el.parentElement.querySelector('.invalid-feedback');
        if (fb) fb.textContent = '';
    });
}