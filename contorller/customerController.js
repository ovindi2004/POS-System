import {
    addCustomerData,
    updateCustomerData,
    deleteCustomerData,
    getCustomerData,
    getCustomerDataById
} from '../model/customer';
import {genId, toast, confirmDlg} from '../utills/regex_utills';

// --------------------------- Render Customers ---------------------------
const renderCustomers = (list) => {
    const tbody = document.getElementById('customerTableBody');
    if (!list) list = getCustomerData();

    tbody.innerHTML = list.length
        ? list.map(c => `<tr onclick="selectCustomer('${c.id}')">
            <td><span style="color:var(--primary);font-size:12px">${c.id}</span></td>
            <td>${c.firstName}</td>
            <td>${c.lastName}</td>
            <td>${c.email}</td>
            <td>${c.contact}</td>
          </tr>`).join('')
        : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px">No customers found</td></tr>`;
}

// --------------------------- Select Customer ---------------------------
const selectCustomer = (id) => {
    const c = getCustomerDataById(id);
    if (!c) return;
    document.getElementById('customerId').value = c.id;
    document.getElementById('firstName').value = c.firstName;
    document.getElementById('lastName').value = c.lastName;
    document.getElementById('address').value = c.address;
    document.getElementById('email').value = c.email;
    document.getElementById('contact').value = c.contact;
}

// Make function globally available for HTML onclick
window.selectCustomer = selectCustomer;

// --------------------------- Clear Customer Form ---------------------------
const clearCustomerForm = () => {
    ['customerId', 'firstName', 'lastName', 'address', 'email', 'contact']
        .forEach(id => document.getElementById(id).value = '');
    document.getElementById('customerId').value = genId('C');
}

// --------------------------- Save Customer ---------------------------
document.getElementById('customerSaveButton').addEventListener('click', () => {
    const id = document.getElementById('customerId').value.trim() || genId('C');
    const fn = document.getElementById('firstName').value.trim();
    const ln = document.getElementById('lastName').value.trim();
    const address = document.getElementById('address').value.trim();
    const em = document.getElementById('email').value.trim();
    const ct = document.getElementById('contact').value.trim();

    if (!fn || !ln || !em || !ct) {
        toast('warning', 'Required', 'Fill First Name, Last Name, Email & Contact');
        return;
    }
    if (getCustomerDataById(id)) {
        toast('error', 'Exists', 'Customer ID already exists. Use Update.');
        return;
    }

    addCustomerData(id, fn, ln, address, em, ct);
    renderCustomers();
    clearCustomerForm();
    toast('success', 'Customer Saved!');
});

// --------------------------- Update Customer ---------------------------
document.getElementById('customerUpdateButton').addEventListener('click', () => {
    const id = document.getElementById('customerId').value.trim();
    if (!id) {
        toast('warning', 'Select', 'Click a row to select a customer first');
        return;
    }
    if (!getCustomerDataById(id)) {
        toast('error', 'Not Found', 'Customer not found');
        return;
    }

    updateCustomerData(
        id,
        document.getElementById('firstName').value.trim(),
        document.getElementById('lastName').value.trim(),
        document.getElementById('address').value.trim(),
        document.getElementById('email').value.trim(),
        document.getElementById('contact').value.trim()
    );
    renderCustomers();
    toast('success', 'Customer Updated!');
});

// --------------------------- Delete Customer ---------------------------
document.getElementById('customerDeleteButton').addEventListener('click', () => {
    const id = document.getElementById('customerId').value.trim();
    if (!id) {
        toast('warning', 'Select', 'Click a row to select a customer first');
        return;
    }

    confirmDlg('Delete Customer?', 'This cannot be undone.', () => {
        deleteCustomerData(id);
        renderCustomers();
        clearCustomerForm();
        toast('success', 'Customer Deleted!');
    });
});

// --------------------------- Clear Button ---------------------------
document.getElementById('customerClearButton').addEventListener('click', clearCustomerForm);

// --------------------------- Search Customer ---------------------------
document.getElementById('customerSearchBtn').addEventListener('click', () => {
    const q = document.getElementById('customer_search').value.trim().toLowerCase();
    if (!q) {
        renderCustomers();
        return;
    }
    renderCustomers(getCustomerData().filter(c =>
        (c.firstName + ' ' + c.lastName).toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    ));
});

document.getElementById('customer_search').addEventListener('keyup', e => {
    if (e.key === 'Enter') document.getElementById('customerSearchBtn').click();
    if (!e.target.value) renderCustomers();
});

// --------------------------- Init ---------------------------
document.getElementById('customerId').value = genId('C');
renderCustomers();

export {renderCustomers, selectCustomer, clearCustomerForm};
