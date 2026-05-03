const db = {
    get: k => JSON.parse(localStorage.getItem(k) || '[]'),
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

function genId(p) {
    return p + '-' + Date.now().toString().slice(-6);
}

function toast(icon, title, text = '') {
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

function confirmDlg(title, text, cb) {
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

/* ── CHARTS ── */
let stockChart, revenueChart, ordersChart;
const CHART_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#f87171', '#a78bfa', '#2dd4bf'];

function buildCharts() {
    const items = db.get('pos_items');
    const orders = db.get('pos_orders');

    /* 1. Top items by stock — horizontal bar */
    const top = [...items].sort((a, b) => b.qty - a.qty).slice(0, 6);
    if (stockChart) stockChart.destroy();
    stockChart = new Chart(document.getElementById('stockChart'), {
        type: 'bar',
        data: {
            labels: top.map(i => i.name || i.id),
            datasets: [{
                label: 'Stock Qty', data: top.map(i => i.qty),
                backgroundColor: CHART_COLORS.map(c => c + '99'), borderColor: CHART_COLORS,
                borderWidth: 1.5, borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: {legend: {display: false}, tooltip: {callbacks: {label: c => ' ' + c.parsed.x + ' units'}}},
            scales: {
                x: {ticks: {color: '#94a3b8', font: {size: 11}}, grid: {color: 'rgba(45,49,72,0.6)'}},
                y: {ticks: {color: '#e2e8f0', font: {size: 11}}, grid: {display: false}}
            }
        }
    });

    /* 2. Revenue by item — doughnut */
    const revMap = {};
    orders.forEach(o => {
        revMap[o.itemId] = (revMap[o.itemId] || 0) + parseFloat(o.total);
    });
    const revItems = Object.keys(revMap);
    const revVals = revItems.map(k => revMap[k]);
    const revLabels = revItems.map(id => {
        const it = items.find(i => i.id === id);
        return it ? it.name : id;
    });
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(document.getElementById('revenueChart'), {
        type: 'doughnut',
        data: {
            labels: revLabels.length ? revLabels : ['No orders yet'],
            datasets: [{
                data: revVals.length ? revVals : [1],
                backgroundColor: revVals.length ? CHART_COLORS.map(c => c + 'cc') : ['#2d3148'],
                borderColor: '#1a1d2e', borderWidth: 3, hoverOffset: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '62%',
            plugins: {legend: {display: false}, tooltip: {callbacks: {label: c => ` $${c.parsed.toFixed(2)}`}}}
        }
    });

    /* 3. Orders over time — line (last 7 days) */
    const days = 7, labels = [], counts = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().slice(0, 10);
        labels.push(ds.slice(5));
        const seen = new Set();
        orders.forEach(o => {
            if (o.date === ds) seen.add(o.orderId);
        });
        counts.push(seen.size);
    }
    if (ordersChart) ordersChart.destroy();
    ordersChart = new Chart(document.getElementById('ordersChart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Orders', data: counts,
                borderColor: '#818cf8', backgroundColor: 'rgba(129,140,248,0.12)',
                borderWidth: 2, pointBackgroundColor: '#818cf8', pointRadius: 4, pointHoverRadius: 6,
                fill: true, tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {legend: {display: false}, tooltip: {callbacks: {label: c => ` ${c.parsed.y} orders`}}},
            scales: {
                x: {ticks: {color: '#94a3b8', font: {size: 11}}, grid: {color: 'rgba(45,49,72,0.5)'}},
                y: {
                    ticks: {color: '#94a3b8', font: {size: 11}, stepSize: 1},
                    grid: {color: 'rgba(45,49,72,0.5)'},
                    min: 0
                }
            }
        }
    });
}

/* ── AUTH ── */
document.getElementById('loginFormElement').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    const users = db.get('pos_users');
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showApp();
        toast('success', 'Welcome back!', user.username);
    } else toast('error', 'Login Failed', 'Invalid email or password');
});

document.getElementById('registerFormElement').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const pass = document.getElementById('registerPassword').value;
    const conf = document.getElementById('confirmPassword').value;
    if (!username || !email || !pass) {
        toast('error', 'Error', 'Please fill in all fields');
        return;
    }
    if (pass !== conf) {
        toast('error', 'Error', 'Passwords do not match');
        return;
    }
    const users = db.get('pos_users');
    if (users.find(u => u.email === email)) {
        toast('error', 'Error', 'Email already registered');
        return;
    }
    users.push({id: genId('USR'), username, email, password: pass});
    db.set('pos_users', users);
    toast('success', 'Registered!', 'You can now login');
    showLoginForm();
});

document.getElementById('showRegister').addEventListener('click', showRegisterForm);
document.getElementById('showLogin').addEventListener('click', showLoginForm);

function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginFormElement').reset();
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('registerFormElement').reset();
}

function showApp() {
    document.getElementById('AuthSection').classList.add('hidden');
    document.getElementById('AppSection').classList.remove('hidden');
    updateDashboard();
    loadCustomerDropdown();
    loadItemDropdown();
    generateOrderId();
    document.getElementById('date').valueAsDate = new Date();
}

function showAuth() {
    document.getElementById('AuthSection').classList.remove('hidden');
    document.getElementById('AppSection').classList.add('hidden');
    showLoginForm();
}

(function () {
    const u = localStorage.getItem('currentUser');
    if (u) showApp(); else showAuth();
})();

/* ── NAV ── */
const sections = {
    home: document.getElementById('HomeSection'),
    customer: document.getElementById('CustomerSection'),
    item: document.getElementById('ItemSection'),
    order: document.getElementById('OrderSection'),
    orderDetails: document.getElementById('OrderDetailsSection')
};
const navMap = {
    home_nav: 'home',
    customer_nav: 'customer',
    item_nav: 'item',
    order_nav: 'order',
    orderDetails_nav: 'orderDetails'
};

function showSection(name) {
    Object.values(sections).forEach(s => s.classList.add('hidden'));
    sections[name].classList.remove('hidden');
    document.querySelectorAll('.nav-pills .nav-link').forEach(l => l.classList.remove('active'));
    const navId = Object.keys(navMap).find(k => navMap[k] === name);
    if (navId) document.getElementById(navId).classList.add('active');
    if (name === 'home') updateDashboard();
    if (name === 'order') {
        loadCustomerDropdown();
        loadItemDropdown();
        generateOrderId();
        document.getElementById('date').valueAsDate = new Date();
    }
    if (name === 'orderDetails') renderOrderDetails();
}

Object.keys(navMap).forEach(id => {
    document.getElementById(id).addEventListener('click', () => showSection(navMap[id]));
});

document.getElementById('logout_nav').addEventListener('click', () => {
    confirmDlg('Logout?', 'Are you sure you want to logout?', () => {
        localStorage.removeItem('currentUser');
        showAuth();
        toast('success', 'Logged out');
    });
});

/* ── DASHBOARD ── */
function updateDashboard() {
    document.getElementById('customerCount').textContent = db.get('pos_customers').length;
    document.getElementById('itemCount').textContent = db.get('pos_items').length;
    document.getElementById('orderCount').textContent = db.get('pos_orders').length;
    setTimeout(buildCharts, 50);
}

/* ── CUSTOMERS ── */
function renderCustomers(list) {
    const tbody = document.getElementById('customerTableBody');
    if (!list) list = db.get('pos_customers');
    tbody.innerHTML = list.length
        ? list.map(c => `<tr onclick="selectCustomer('${c.id}')">
        <td><span style="color:var(--primary);font-size:12px">${c.id}</span></td>
        <td>${c.firstName}</td><td>${c.lastName}</td><td>${c.email}</td><td>${c.contact}</td>
      </tr>`).join('')
        : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px">No customers found</td></tr>`;
}

function selectCustomer(id) {
    const c = db.get('pos_customers').find(x => x.id === id);
    if (!c) return;
    document.getElementById('customerId').value = c.id;
    document.getElementById('firstName').value = c.firstName;
    document.getElementById('lastName').value = c.lastName;
    document.getElementById('address').value = c.address;
    document.getElementById('email').value = c.email;
    document.getElementById('contact').value = c.contact;
}

function clearCustomerForm() {
    ['customerId', 'firstName', 'lastName', 'address', 'email', 'contact'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('customerId').value = genId('C');
}

document.getElementById('customerSaveButton').addEventListener('click', () => {
    const fn = document.getElementById('firstName').value.trim();
    const ln = document.getElementById('lastName').value.trim();
    const em = document.getElementById('email').value.trim();
    const ct = document.getElementById('contact').value.trim();
    if (!fn || !ln || !em || !ct) {
        toast('warning', 'Required', 'Fill First Name, Last Name, Email & Contact');
        return;
    }
    const customers = db.get('pos_customers');
    const id = document.getElementById('customerId').value.trim() || genId('C');
    if (customers.find(c => c.id === id)) {
        toast('error', 'Exists', 'Customer ID already exists. Use Update.');
        return;
    }
    customers.push({
        id,
        firstName: fn,
        lastName: ln,
        address: document.getElementById('address').value.trim(),
        email: em,
        contact: ct
    });
    db.set('pos_customers', customers);
    renderCustomers();
    clearCustomerForm();
    toast('success', 'Customer Saved!');
});

document.getElementById('customerUpdateButton').addEventListener('click', () => {
    const id = document.getElementById('customerId').value.trim();
    if (!id) {
        toast('warning', 'Select', 'Click a row to select a customer first');
        return;
    }
    const customers = db.get('pos_customers');
    const idx = customers.findIndex(c => c.id === id);
    if (idx === -1) {
        toast('error', 'Not Found', 'Customer not found');
        return;
    }
    customers[idx] = {
        id,
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        address: document.getElementById('address').value.trim(),
        email: document.getElementById('email').value.trim(),
        contact: document.getElementById('contact').value.trim()
    };
    db.set('pos_customers', customers);
    renderCustomers();
    toast('success', 'Customer Updated!');
});

document.getElementById('customerDeleteButton').addEventListener('click', () => {
    const id = document.getElementById('customerId').value.trim();
    if (!id) {
        toast('warning', 'Select', 'Click a row to select a customer first');
        return;
    }
    confirmDlg('Delete Customer?', 'This cannot be undone.', () => {
        db.set('pos_customers', db.get('pos_customers').filter(c => c.id !== id));
        renderCustomers();
        clearCustomerForm();
        toast('success', 'Customer Deleted!');
    });
});

document.getElementById('customerClearButton').addEventListener('click', clearCustomerForm);

document.getElementById('customerSearchBtn').addEventListener('click', () => {
    const q = document.getElementById('customer_search').value.trim().toLowerCase();
    if (!q) {
        renderCustomers();
        return;
    }
    renderCustomers(db.get('pos_customers').filter(c =>
        (c.firstName + ' ' + c.lastName).toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    ));
});

document.getElementById('customer_search').addEventListener('keyup', e => {
    if (e.key === 'Enter') document.getElementById('customerSearchBtn').click();
    if (!e.target.value) renderCustomers();
});

document.getElementById('customerId').value = genId('C');
renderCustomers();

/* ── INVENTORY ── */
function renderItems(list) {
    const tbody = document.getElementById('itemTableBody');
    if (!list) list = db.get('pos_items');
    tbody.innerHTML = list.length
        ? list.map(i => `<tr onclick="selectItem('${i.id}')">
        <td><span style="color:var(--success);font-size:12px">${i.id}</span></td>
        <td>${i.name}</td><td>${i.qty}</td>
        <td>$${parseFloat(i.price).toFixed(2)}</td>
        <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.desc}</td>
      </tr>`).join('')
        : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px">No items found</td></tr>`;
}

function selectItem(id) {
    const it = db.get('pos_items').find(x => x.id === id);
    if (!it) return;
    document.getElementById('itemId').value = it.id;
    document.getElementById('itemName').value = it.name;
    document.getElementById('Quantity').value = it.qty;
    document.getElementById('UnitPrice').value = it.price;
    document.getElementById('Description').value = it.desc;
}

function clearItemForm() {
    ['itemId', 'itemName', 'Quantity', 'UnitPrice', 'Description'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('itemId').value = genId('I');
}

document.getElementById('itemSaveButton').addEventListener('click', () => {
    const name = document.getElementById('itemName').value.trim();
    const qty = document.getElementById('Quantity').value.trim();
    const price = document.getElementById('UnitPrice').value.trim();
    if (!name || !qty || !price) {
        toast('warning', 'Required', 'Fill Item Name, Quantity & Price');
        return;
    }
    const items = db.get('pos_items');
    const id = document.getElementById('itemId').value.trim() || genId('I');
    if (items.find(i => i.id === id)) {
        toast('error', 'Exists', 'Item ID already exists. Use Update.');
        return;
    }
    items.push({
        id,
        name,
        qty: parseInt(qty),
        price: parseFloat(price),
        desc: document.getElementById('Description').value.trim()
    });
    db.set('pos_items', items);
    renderItems();
    clearItemForm();
    toast('success', 'Item Saved!');
});

document.getElementById('itemUpdateButton').addEventListener('click', () => {
    const id = document.getElementById('itemId').value.trim();
    if (!id) {
        toast('warning', 'Select', 'Click a row to select an item first');
        return;
    }
    const items = db.get('pos_items');
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) {
        toast('error', 'Not Found', 'Item not found');
        return;
    }
    items[idx] = {
        id,
        name: document.getElementById('itemName').value.trim(),
        qty: parseInt(document.getElementById('Quantity').value),
        price: parseFloat(document.getElementById('UnitPrice').value),
        desc: document.getElementById('Description').value.trim()
    };
    db.set('pos_items', items);
    renderItems();
    toast('success', 'Item Updated!');
});

document.getElementById('itemDeleteButton').addEventListener('click', () => {
    const id = document.getElementById('itemId').value.trim();
    if (!id) {
        toast('warning', 'Select', 'Click a row to select an item first');
        return;
    }
    confirmDlg('Delete Item?', 'This cannot be undone.', () => {
        db.set('pos_items', db.get('pos_items').filter(i => i.id !== id));
        renderItems();
        clearItemForm();
        toast('success', 'Item Deleted!');
    });
});

document.getElementById('itemClearButton').addEventListener('click', clearItemForm);

document.getElementById('itemSearchBtn').addEventListener('click', () => {
    const q = document.getElementById('item_search').value.trim().toLowerCase();
    if (!q) {
        renderItems();
        return;
    }
    renderItems(db.get('pos_items').filter(i =>
        i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
    ));
});

document.getElementById('item_search').addEventListener('keyup', e => {
    if (e.key === 'Enter') document.getElementById('itemSearchBtn').click();
    if (!e.target.value) renderItems();
});

document.getElementById('itemId').value = genId('I');
renderItems();

/* ── ORDERS ── */
let currentOrderItems = [];

function generateOrderId() {
    document.getElementById('orderID').value = genId('ORD');
}

function loadCustomerDropdown() {
    const sel = document.getElementById('orderCustomerID');
    sel.innerHTML = '<option value="">Select Customer</option>' +
        db.get('pos_customers').map(c =>
            `<option value="${c.id}">${c.id} — ${c.firstName} ${c.lastName}</option>`
        ).join('');
}

function loadItemDropdown() {
    const sel = document.getElementById('orderItemID');
    sel.innerHTML = '<option value="">Select Item</option>' +
        db.get('pos_items').map(i =>
            `<option value="${i.id}">${i.id} — ${i.name} ($${parseFloat(i.price).toFixed(2)})</option>`
        ).join('');
}

document.getElementById('orderCustomerID').addEventListener('change', function () {
    const c = db.get('pos_customers').find(x => x.id === this.value);
    document.getElementById('customerName').value = c ? `${c.firstName} ${c.lastName}` : '';
    document.getElementById('customerAddress').value = c ? c.address : '';
});

document.getElementById('orderItemID').addEventListener('change', function () {
    const it = db.get('pos_items').find(x => x.id === this.value);
    document.getElementById('orderItemName').value = it ? it.name : '';
    document.getElementById('orderItemPrice').value = it ? `$${parseFloat(it.price).toFixed(2)}` : '';
    document.getElementById('itemQty').value = it ? it.qty : '';
    document.getElementById('orderQty').value = '';
});

function calcTotal() {
    return currentOrderItems.reduce((s, i) => s + i.total, 0);
}

function renderOrderCart() {
    const tbody = document.getElementById('orderItemTableBody');
    tbody.innerHTML = currentOrderItems.length
        ? currentOrderItems.map((item, idx) => `<tr>
        <td><span style="color:var(--success);font-size:12px">${item.itemId}</span></td>
        <td>${item.name}</td>
        <td>$${parseFloat(item.price).toFixed(2)}</td>
        <td>${item.qty}</td>
        <td style="color:var(--warning);font-weight:600">$${item.total.toFixed(2)}</td>
        <td><button class="btn btn-danger btn-sm py-1 px-2" onclick="removeOrderItem(${idx})"><i class="bi bi-trash"></i></button></td>
      </tr>`).join('')
        : `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px">No items added</td></tr>`;
    document.getElementById('totalAmount').textContent = '$' + calcTotal().toFixed(2);
}

function removeOrderItem(idx) {
    currentOrderItems.splice(idx, 1);
    renderOrderCart();
}

document.getElementById('addItemButton').addEventListener('click', () => {
    const itemId = document.getElementById('orderItemID').value;
    const qtyVal = parseInt(document.getElementById('orderQty').value);
    if (!itemId) {
        toast('warning', 'Select Item', 'Choose an item from the dropdown');
        return;
    }
    if (!qtyVal || qtyVal <= 0) {
        toast('warning', 'Quantity', 'Enter a valid order quantity');
        return;
    }
    const it = db.get('pos_items').find(x => x.id === itemId);
    if (!it) {
        toast('error', 'Not Found', 'Item not found');
        return;
    }
    if (qtyVal > it.qty) {
        toast('error', 'Out of Stock', `Only ${it.qty} units available`);
        return;
    }
    const existing = currentOrderItems.find(x => x.itemId === itemId);
    if (existing) {
        existing.qty += qtyVal;
        existing.total = existing.qty * existing.price;
    } else {
        currentOrderItems.push({
            itemId,
            name: it.name,
            price: parseFloat(it.price),
            qty: qtyVal,
            total: parseFloat(it.price) * qtyVal
        });
    }
    renderOrderCart();
    document.getElementById('orderQty').value = '';
    toast('success', 'Item Added');
});

document.getElementById('getBalance').addEventListener('click', () => {
    const total = calcTotal();
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const cash = parseFloat(document.getElementById('cash').value) || 0;
    const netTotal = total * (1 - discount / 100);
    const balance = cash - netTotal;
    document.getElementById('balance').value = balance >= 0
        ? '$' + balance.toFixed(2)
        : '-$' + Math.abs(balance).toFixed(2);
    if (cash < netTotal)
        toast('warning', 'Insufficient Cash', `Need $${netTotal.toFixed(2)}, got $${cash.toFixed(2)}`);
});

document.getElementById('placeOrderButton').addEventListener('click', () => {
    const orderId = document.getElementById('orderID').value;
    const custId = document.getElementById('orderCustomerID').value;
    const date = document.getElementById('date').value;
    const cash = parseFloat(document.getElementById('cash').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    if (!custId) {
        toast('warning', 'Customer', 'Select a customer');
        return;
    }
    if (!date) {
        toast('warning', 'Date', 'Select a date');
        return;
    }
    if (!currentOrderItems.length) {
        toast('warning', 'Items', 'Add at least one item');
        return;
    }
    const total = calcTotal();
    const netTotal = total * (1 - discount / 100);
    if (cash < netTotal) {
        toast('error', 'Insufficient Cash', 'Calculate balance first');
        return;
    }
    const items = db.get('pos_items');
    currentOrderItems.forEach(oi => {
        const idx = items.findIndex(x => x.id === oi.itemId);
        if (idx !== -1) items[idx].qty -= oi.qty;
    });
    db.set('pos_items', items);
    renderItems();
    const orders = db.get('pos_orders');
    currentOrderItems.forEach(oi => {
        orders.push({
            orderId, date, custId,
            itemId: oi.itemId,
            qty: oi.qty,
            total: oi.total.toFixed(2),
            cash: cash.toFixed(2),
            discount,
            balance: (cash - netTotal).toFixed(2)
        });
    });
    db.set('pos_orders', orders);
    toast('success', 'Order Placed!', `Order ${orderId} saved successfully`);
    currentOrderItems = [];
    renderOrderCart();
    ['cash', 'orderCustomerID', 'customerName', 'customerAddress',
        'orderItemID', 'orderItemName', 'orderItemPrice', 'itemQty'
    ].forEach(id => document.getElementById(id).value = '');
    document.getElementById('discount').value = '0';
    document.getElementById('balance').value = '';
    document.getElementById('totalAmount').textContent = '$0.00';
    generateOrderId();
    document.getElementById('date').valueAsDate = new Date();
    loadItemDropdown();
});

/* ── ORDER DETAILS ── */
function renderOrderDetails(list) {
    const tbody = document.getElementById('orderDetailsTableBody');
    if (!list) list = db.get('pos_orders');
    tbody.innerHTML = list.length
        ? list.map(o => `<tr>
        <td><span style="color:var(--primary);font-size:12px">${o.orderId}</span></td>
        <td>${o.date}</td><td>${o.custId}</td><td>${o.itemId}</td><td>${o.qty}</td>
        <td style="color:var(--warning)">$${o.total}</td>
        <td>$${o.cash}</td>
        <td>${o.discount}%</td>
        <td style="color:var(--success)">$${o.balance}</td>
      </tr>`).join('')
        : `<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:30px">No orders found</td></tr>`;
}

document.getElementById('orderSearchBtn').addEventListener('click', () => {
    const q = document.getElementById('order_search').value.trim().toLowerCase();
    if (!q) {
        renderOrderDetails();
        return;
    }
    renderOrderDetails(db.get('pos_orders').filter(o =>
        o.orderId.toLowerCase().includes(q) || o.custId.toLowerCase().includes(q)
    ));
});

document.getElementById('order_search').addEventListener('keyup', e => {
    if (e.key === 'Enter') document.getElementById('orderSearchBtn').click();
    if (!e.target.value) renderOrderDetails();
});