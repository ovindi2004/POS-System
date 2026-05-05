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

