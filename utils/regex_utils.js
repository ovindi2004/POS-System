// ── UTILITIES ──

// ── ID Generator ──
export function genId(prefix) {
    return prefix + '-' + Date.now().toString().slice(-6);
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
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[0-9+\-\s]{7,15}$/,
    isValidEmail: (email) => regex.email.test(email),
    isValidPhone: (phone) => regex.phone.test(phone)
};