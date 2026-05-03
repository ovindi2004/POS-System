import {addOrderData, getOrderData, getOrderDataById} from '../model/order';
import {getCustomerData, getCustomerDataById} from '../model/customer';
import {getItemData, getItemDataById, updateItemData} from '../model/item';
import {genId, toast, confirmDlg} from '../utills/regex_utills';
import {buildCharts} from '../utills/chart';
import {renderItems} from './itemController';

let currentOrderItems = [];

// --------------------------- Generate Order ID ---------------------------
const generateOrderId = () => {
    document.getElementById('orderID').value = genId('ORD');
}

// --------------------------- Load Customer Dropdown ---------------------------
const loadCustomerDropdown = () => {
    const sel = document.getElementById('orderCustomerID');
    sel.innerHTML = '<option value="">Select Customer</option>' +
        getCustomerData().map(c =>
            `<option value="${c.id}">${c.id} — ${c.firstName} ${c.lastName}</option>`
        ).join('');
}

// --------------------------- Load Item Dropdown ---------------------------
const loadItemDropdown = () => {
    const sel = document.getElementById('orderItemID');
    sel.innerHTML = '<option value="">Select Item</option>' +
        getItemData().map(i =>
            `<option value="${i.id}">${i.id} — ${i.name} ($${parseFloat(i.price).toFixed(2)})</option>`
        ).join('');
}

// --------------------------- Customer Change ---------------------------
document.getElementById('orderCustomerID').addEventListener('change', function () {
    const c = getCustomerDataById(this.value);
    document.getElementById('customerName').value = c ? `${c.firstName} ${c.lastName}` : '';
    document.getElementById('customerAddress').value = c ? c.address : '';
});

// --------------------------- Item Change ---------------------------
document.getElementById('orderItemID').addEventListener('change', function () {
    const it = getItemDataById(this.value);
    document.getElementById('orderItemName').value = it ? it.name : '';
    document.getElementById('orderItemPrice').value = it ? `$${parseFloat(it.price).toFixed(2)}` : '';
    document.getElementById('itemQty').value = it ? it.qty : '';
    document.getElementById('orderQty').value = '';
});

// --------------------------- Calc Total ---------------------------
const calcTotal = () => {
    return currentOrderItems.reduce((s, i) => s + i.total, 0);
}

// --------------------------- Render Order Cart ---------------------------
const renderOrderCart = () => {
    const tbody = document.getElementById('orderItemTableBody');
    tbody.innerHTML = currentOrderItems.length
        ? currentOrderItems.map((item, idx) => `<tr>
            <td><span style="color:var(--success);font-size:12px">${item.itemId}</span></td>
            <td>${item.name}</td>
            <td>$${parseFloat(item.price).toFixed(2)}</td>
            <td>${item.qty}</td>
            <td style="color:var(--warning);font-weight:600">$${item.total.toFixed(2)}</td>
            <td><button class="btn btn-danger btn-sm py-1 px-2" onclick="removeOrderItem(${idx})">
                <i class="bi bi-trash"></i></button></td>
          </tr>`).join('')
        : `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px">No items added</td></tr>`;
    document.getElementById('totalAmount').textContent = '$' + calcTotal().toFixed(2);
}

// --------------------------- Remove Order Item ---------------------------
const removeOrderItem = (idx) => {
    currentOrderItems.splice(idx, 1);
    renderOrderCart();
}

// Make function globally available for HTML onclick
window.removeOrderItem = removeOrderItem;

// --------------------------- Add Item to Cart ---------------------------
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

    const it = getItemDataById(itemId);
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

// --------------------------- Get Balance ---------------------------
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

// --------------------------- Place Order ---------------------------
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

    // Deduct stock
    currentOrderItems.forEach(oi => {
        const it = getItemDataById(oi.itemId);
        if (it) updateItemData(oi.itemId, it.name, it.qty - oi.qty, it.price, it.desc);
    });
    renderItems();

    // Save orders
    currentOrderItems.forEach(oi => {
        addOrderData(
            orderId, date, custId,
            oi.itemId, oi.qty,
            oi.total.toFixed(2),
            cash.toFixed(2),
            discount,
            (cash - netTotal).toFixed(2)
        );
    });

    toast('success', 'Order Placed!', `Order ${orderId} saved successfully`);

    // Reset form
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

// --------------------------- Render Order Details ---------------------------
const renderOrderDetails = (list) => {
    const tbody = document.getElementById('orderDetailsTableBody');
    if (!list) list = getOrderData();

    tbody.innerHTML = list.length
        ? list.map(o => `<tr>
            <td><span style="color:var(--primary);font-size:12px">${o.orderId}</span></td>
            <td>${o.date}</td>
            <td>${o.custId}</td>
            <td>${o.itemId}</td>
            <td>${o.qty}</td>
            <td style="color:var(--warning)">$${o.total}</td>
            <td>$${o.cash}</td>
            <td>${o.discount}%</td>
            <td style="color:var(--success)">$${o.balance}</td>
          </tr>`).join('')
        : `<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:30px">No orders found</td></tr>`;
}

// --------------------------- Search Order ---------------------------
document.getElementById('orderSearchBtn').addEventListener('click', () => {
    const q = document.getElementById('order_search').value.trim().toLowerCase();
    if (!q) {
        renderOrderDetails();
        return;
    }
    renderOrderDetails(getOrderData().filter(o =>
        o.orderId.toLowerCase().includes(q) ||
        o.custId.toLowerCase().includes(q)
    ));
});

document.getElementById('order_search').addEventListener('keyup', e => {
    if (e.key === 'Enter') document.getElementById('orderSearchBtn').click();
    if (!e.target.value) renderOrderDetails();
});

// --------------------------- Dashboard ---------------------------
const updateDashboard = () => {
    document.getElementById('customerCount').textContent = getCustomerData().length;
    document.getElementById('itemCount').textContent = getItemData().length;
    document.getElementById('orderCount').textContent = getOrderData().length;
    setTimeout(buildCharts, 50);
}

export {
    generateOrderId,
    loadCustomerDropdown,
    loadItemDropdown,
    renderOrderDetails,
    removeOrderItem,
    updateDashboard
};
