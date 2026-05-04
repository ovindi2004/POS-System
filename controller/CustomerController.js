// ── CUSTOMER CONTROLLER ──
import CustomerModel from '../model/CustomerModel.js';
import {genId, toast, confirmDlg} from '../utils/regex_utils.js';

const CustomerController = {

    // ── Render table ──
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

    // ── Select row → fill form ──
    select: (id) => {
        const c = CustomerModel.findById(id);
        if (!c) return;
        document.getElementById('customerId').value = c.id;
        document.getElementById('firstName').value = c.firstName;
        document.getElementById('lastName').value = c.lastName;
        document.getElementById('address').value = c.address;
        document.getElementById('email').value = c.email;
        document.getElementById('contact').value = c.contact;
    },

    // ── Clear form ──
    clear: () => {
        ['customerId', 'firstName', 'lastName', 'address', 'email', 'contact']
            .forEach(id => document.getElementById(id).value = '');
        document.getElementById('customerId').value = genId('C');
    },

    // ── Save ──
    save: () => {
        const fn = document.getElementById('firstName').value.trim();
        const ln = document.getElementById('lastName').value.trim();
        const em = document.getElementById('email').value.trim();
        const ct = document.getElementById('contact').value.trim();
        if (!fn || !ln || !em || !ct) {
            toast('warning', 'Required', 'Fill First Name, Last Name, Email & Contact');
            return;
        }
        const result = CustomerModel.save({
            id: document.getElementById('customerId').value.trim() || genId('C'),
            firstName: fn, lastName: ln,
            address: document.getElementById('address').value.trim(),
            email: em, contact: ct
        });
        if (!result.success) {
            toast('error', 'Error', result.message);
            return;
        }
        CustomerController.render();
        CustomerController.clear();
        toast('success', 'Customer Saved!');
    },

    // ── Update ──
    update: () => {
        const id = document.getElementById('customerId').value.trim();
        if (!id) {
            toast('warning', 'Select', 'Click a row to select a customer first');
            return;
        }
        const result = CustomerModel.update(id, {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            address: document.getElementById('address').value.trim(),
            email: document.getElementById('email').value.trim(),
            contact: document.getElementById('contact').value.trim()
        });
        if (!result.success) {
            toast('error', 'Error', result.message);
            return;
        }
        CustomerController.render();
        toast('success', 'Customer Updated!');
    },

    // ── Delete ──
    delete: () => {
        const id = document.getElementById('customerId').value.trim();
        if (!id) {
            toast('warning', 'Select', 'Click a row first');
            return;
        }
        confirmDlg('Delete Customer?', 'This cannot be undone.', () => {
            const result = CustomerModel.delete(id);
            if (!result.success) {
                toast('error', 'Error', result.message);
                return;
            }
            CustomerController.render();
            CustomerController.clear();
            toast('success', 'Customer Deleted!');
        });
    },

    // ── Search ──
    search: () => {
        const q = document.getElementById('customer_search').value.trim();
        if (!q) {
            CustomerController.render();
            return;
        }
        CustomerController.render(CustomerModel.findByName(q));
    },

    // ── Init ──
    init: () => {
        document.getElementById('customerSaveButton').addEventListener('click', CustomerController.save);
        document.getElementById('customerUpdateButton').addEventListener('click', CustomerController.update);
        document.getElementById('customerDeleteButton').addEventListener('click', CustomerController.delete);
        document.getElementById('customerClearButton').addEventListener('click', CustomerController.clear);
        document.getElementById('customerSearchBtn').addEventListener('click', CustomerController.search);
        document.getElementById('customer_search').addEventListener('keyup', e => {
            if (e.key === 'Enter') CustomerController.search();
            if (!e.target.value) CustomerController.render();
        });
        CustomerController.clear();
        CustomerController.render();
    }
};

window.CustomerController = CustomerController;
export default CustomerController;