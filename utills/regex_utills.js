// --------------------------- Generate ID ---------------------------
const genId = (p) => {
    return p + '-' + Date.now().toString().slice(-6);
}

// --------------------------- Toast ---------------------------
const toast = (icon, title, text = '') => {
    Swal.fire({
        icon,
        title,
        text,
        timer: 2200,
        timerProgressBar: true,
        showConfirmButton: false,
        background: '#1a1d2e',
        color: '#e2e8f0',
        iconColor: icon === 'success' ? '#34d399' : icon === 'error' ? '#f87171' : '#fbbf24'
    });
}

// --------------------------- Confirm Dialog ---------------------------
const confirmDlg = (title, text, cb) => {
    Swal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        background: '#1a1d2e',
        color: '#e2e8f0',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#374151'
    }).then(r => {
        if (r.isConfirmed) cb();
    });
}

export { genId, toast, confirmDlg };