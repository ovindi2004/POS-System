// ── CUSTOMER CONTROLLER ──
import CustomerModel from '../models/CustomerModel.js';
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

const CustomerController = {

    // Render customer list into table
    render: (list) => {
        const tbody = document.getElementById('customerTableBody');
        if (!list) list = CustomerModel.getAll();
        tbody.innerHTML = list.length
            ? list.map(c => `<tr onclick="CustomerController.select('${c.id}')">
                <td><span style="color:var(--primary);font-size:12px">${c.id}</span></td>
                <td>${c.firstName}</td><td>${c.lastName}</td><td>${c.email}</td><td>${c.contact}</td>
              </tr>`).join('')
            : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px">No customers found</td></tr>`;
    },

    // Load selected customer data into form
    select: (id) => {
        const c = CustomerModel.findById(id);
        if (!c) return;
        document.getElementById('customerId').value = c.id;
        document.getElementById('firstName').value  = c.firstName;
        document.getElementById('lastName').value   = c.lastName;
        document.getElementById('address').value    = c.address;
        document.getElementById('email').value      = c.email;
        document.getElementById('contact').value    = c.contact;
        clearMarks(...FIELDS);
    },

    // Reset form and generate new ID
    clear: () => {
        FIELDS.forEach(id => document.getElementById(id).value = '');
        document.getElementById('customerId').value = genId('C');
        clearMarks(...FIELDS);
    },

    // Save new customer
    save: () => {
        if (!validateCustomer()) { toast('warning', 'Validation Failed', 'Fix the highlighted fields.'); return; }
        const result = CustomerModel.save({
            id: document.getElementById('customerId').value.trim() || genId('C'),
            firstName: document.getElementById('firstName').value.trim(),
            lastName:  document.getElementById('lastName').value.trim(),
            address:   document.getElementById('address').value.trim(),
            email:     document.getElementById('email').value.trim(),
            contact:   document.getElementById('contact').value.trim()
        });
        if (!result.success) { toast('error', 'Error', result.message); return; }
        CustomerController.render();
        CustomerController.clear();
        toast('success', 'Customer Saved!');
    },

    // Update existing customer by ID
    update: () => {
        const id = document.getElementById('customerId').value.trim();
        if (!id) { toast('warning', 'Select', 'Click a row to select a customer first'); return; }
        if (!validateCustomer()) { toast('warning', 'Validation Failed', 'Fix the highlighted fields.'); return; }
        const result = CustomerModel.update(id, {
            firstName: document.getElementById('firstName').value.trim(),
            lastName:  document.getElementById('lastName').value.trim(),
            address:   document.getElementById('address').value.trim(),
            email:     document.getElementById('email').value.trim(),
            contact:   document.getElementById('contact').value.trim()
        });
        if (!result.success) { toast('error', 'Error', result.message); return; }
        CustomerController.render();
        toast('success', 'Customer Updated!');
    },

    // Delete customer after confirmation
    delete: () => {
        const id = document.getElementById('customerId').value.trim();
        if (!id) { toast('warning', 'Select', 'Click a row first'); return; }
        confirmDlg('Delete Customer?', 'This cannot be undone.', () => {
            const result = CustomerModel.delete(id);
            if (!result.success) { toast('error', 'Error', result.message); return; }
            CustomerController.render();
            CustomerController.clear();
            toast('success', 'Customer Deleted!');
        });
    },

    // Search customers by name
    search: () => {
        const q = document.getElementById('customer_search').value.trim();
        if (!q) { CustomerController.render(); return; }
        CustomerController.render(CustomerModel.findByName(q));
    },

    // Bind events and initialize form
    init: () => {
        document.getElementById('customerSaveButton').addEventListener('click', CustomerController.save);
        document.getElementById('customerUpdateButton').addEventListener('click', CustomerController.update);
        document.getElementById('customerDeleteButton').addEventListener('click', CustomerController.delete);
        document.getElementById('customerClearButton').addEventListener('click', CustomerController.clear);
        document.getElementById('customerSearchBtn').addEventListener('click', CustomerController.search);

        // Search on Enter key or clear
        document.getElementById('customer_search').addEventListener('keyup', e => {
            if (e.key === 'Enter') CustomerController.search();
            if (!e.target.value) CustomerController.render();
        });

        // Live validation on field blur
        ['firstName','lastName','email','contact','address'].forEach(id => {
            document.getElementById(id).addEventListener('blur', () => {
                const val = document.getElementById(id).value.trim();
                switch (id) {
                    case 'firstName': case 'lastName':
                        if (!val) markInvalid(id, 'This field is required.');
                        else if (!regex.isValidName(val)) markInvalid(id, 'Only letters, spaces, hyphens & apostrophes.');
                        else markValid(id); break;
                    case 'email':
                        if (!val) markInvalid(id, 'Email is required.');
                        else if (!regex.isValidEmail(val)) markInvalid(id, 'Enter a valid email address.');
                        else markValid(id); break;
                    case 'contact':
                        if (!val) markInvalid(id, 'Contact is required.');
                        else if (!regex.isValidPhone(val)) markInvalid(id, 'Phone number must be exactly 10 digits.');
                        else markValid(id); break;
                    case 'address':
                        if (val && val.length < 5) markInvalid(id, 'Address must be at least 5 characters.');
                        else markValid(id); break;
                }
            });
        });

        // Load initial data
        CustomerController.clear();
        CustomerController.render();
    }
};

window.CustomerController = CustomerController;
export default CustomerController;