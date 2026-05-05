// =============== CUSTOMER CONTROLLER ============================

// ── CUSTOMER CONTROLLER ──
import CustomerModel from '../model/CustomerModel.js';
import {genId, toast, confirmDlg, regex, markValid, markInvalid, clearMarks} from '../utils/regex_utils.js';

// Form field IDs
const FIELDS = ['customerId', 'firstName', 'lastName', 'address', 'email', 'contact'];

// Validate all customer form fields
function validateCustomer() {
    const fn   = document.getElementById('firstName').value.trim();
    const ln   = document.getElementById('lastName').value.trim();
    const em   = document.getElementById('email').value.trim();
    const ct   = document.getElementById('contact').value.trim();
    const addr = document.getElementById('address').value.trim();
    let valid = true;

    // First name check
    if (!fn) { markInvalid('firstName', 'First name is required.'); valid = false; }
    else if (!regex.isValidName(fn)) { markInvalid('firstName', 'Only letters, spaces, hyphens & apostrophes (2–50 chars).'); valid = false; }
    else { markValid('firstName'); }

    // Last name check
    if (!ln) { markInvalid('lastName', 'Last name is required.'); valid = false; }
    else if (!regex.isValidName(ln)) { markInvalid('lastName', 'Only letters, spaces, hyphens & apostrophes (2–50 chars).'); valid = false; }
    else { markValid('lastName'); }


    // Address check (optional but min 5 chars if provided)
    if (addr && addr.length < 5) { markInvalid('address', 'Address must be at least 5 characters.'); valid = false; }
    else { markValid('address'); }

    // Email check
    if (!em) { markInvalid('email', 'Email is required.'); valid = false; }
    else if (!regex.isValidEmail(em)) { markInvalid('email', 'Enter a valid email (e.g. user@example.com).'); valid = false; }
    else { markValid('email'); }

    // Contact number check
    if (!ct) { markInvalid('contact', 'Contact number is required.'); valid = false; }
    else if (!regex.isValidPhone(ct)) { markInvalid('contact', 'Phone number must be exactly 10 digits.'); valid = false; }
    else { markValid('contact'); }

    return valid;
}

