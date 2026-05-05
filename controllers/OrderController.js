// ================= ORDER CONTROLLER =============================
import OrderModel from '../model/OrderModel.js';
import ItemModel from '../model/ItemModel.js';
import CustomerModel from '../model/CustomerModel.js';
import ItemController from './ItemController.js';
import {genId, toast} from '../utils/regex_utils.js';

let currentOrderItems = [];

const OrderController = {

    // ── Cart ──
    calcTotal: () => currentOrderItems.reduce((s, i) => s + i.total, 0),

    renderCart: () => {
        const tbody = document.getElementById('orderItemTableBody');
        tbody.innerHTML = currentOrderItems.length
            ? currentOrderItems.map((item, idx) => `<tr>
                <td><span style="color:var(--success);font-size:12px">${item.itemId}</span></td>
                <td>${item.name}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.qty}</td>
                <td style="color:var(--warning);font-weight:600">$${item.total.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm py-1 px-2" onclick="OrderController.removeItem(${idx})">
                    <i class="bi bi-trash"></i></button></td>
              </tr>`).join('')
            : `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px">No items added</td></tr>`;
        document.getElementById('totalAmount').textContent = '$' + OrderController.calcTotal().toFixed(2);
    },

    removeItem: (idx) => {
        currentOrderItems.splice(idx, 1);
        OrderController.renderCart();
    },

    // ── Dropdowns ──
    loadCustomerDropdown: () => {
        const sel = document.getElementById('orderCustomerID');
        sel.innerHTML = '<option value="">Select Customer</option>' +
            CustomerModel.getAll().map(c =>
                `<option value="${c.id}">${c.id} — ${c.firstName} ${c.lastName}</option>`
            ).join('');
    },

    loadItemDropdown: () => {
        const sel = document.getElementById('orderItemID');
        sel.innerHTML = '<option value="">Select Item</option>' +
            ItemModel.getAll().map(i =>
                `<option value="${i.id}">${i.id} — ${i.name} ($${parseFloat(i.price).toFixed(2)})</option>`
            ).join('');
    },

    // ── Add item to cart ──
    addItem: () => {
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
        const it = ItemModel.findById(itemId);
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
        OrderController.renderCart();
        document.getElementById('orderQty').value = '';
        toast('success', 'Item Added');
    },

    // ── Calculate balance ──
    calcBalance: () => {
        const total = OrderController.calcTotal();
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const cash = parseFloat(document.getElementById('cash').value) || 0;
        const netTotal = total * (1 - discount / 100);
        const balance = cash - netTotal;
        document.getElementById('balance').value = balance >= 0
            ? '$' + balance.toFixed(2)
            : '-$' + Math.abs(balance).toFixed(2);
        if (cash < netTotal) toast('warning', 'Insufficient Cash', `Need $${netTotal.toFixed(2)}, got $${cash.toFixed(2)}`);
    },

    // ── Place order ──
    placeOrder: () => {
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
        const total = OrderController.calcTotal();
        const netTotal = total * (1 - discount / 100);
        if (cash < netTotal) {
            toast('error', 'Insufficient Cash', 'Calculate balance first');
            return;
        }

        // Decrease stock
        currentOrderItems.forEach(oi => ItemModel.decreaseStock(oi.itemId, oi.qty));
        ItemController.render();

        // Save order
        OrderModel.save({orderId, date, custId, items: currentOrderItems, cash, discount});

        toast('success', 'Order Placed!', `Order ${orderId} saved successfully`);
        OrderController.resetForm();
    },

    // ── Reset form ──
    resetForm: () => {
        currentOrderItems = [];
        OrderController.renderCart();
        ['cash', 'customerName', 'customerAddress', 'orderItemName', 'orderItemPrice', 'itemQty', 'balance']
            .forEach(id => document.getElementById(id).value = '');
        document.getElementById('discount').value = '0';
        document.getElementById('totalAmount').textContent = '$0.00';
        document.getElementById('orderCustomerID').value = '';
        document.getElementById('orderItemID').value = '';
        document.getElementById('orderID').value = genId('ORD');
        document.getElementById('date').valueAsDate = new Date();
        OrderController.loadItemDropdown();
    },

    // ── Init ──
    init: () => {
        document.getElementById('orderCustomerID').addEventListener('change', function () {
            const c = CustomerModel.findById(this.value);
            document.getElementById('customerName').value = c ? `${c.firstName} ${c.lastName}` : '';
            document.getElementById('customerAddress').value = c ? c.address : '';
        });
        document.getElementById('orderItemID').addEventListener('change', function () {
            const it = ItemModel.findById(this.value);
            document.getElementById('orderItemName').value = it ? it.name : '';
            document.getElementById('orderItemPrice').value = it ? `$${parseFloat(it.price).toFixed(2)}` : '';
            document.getElementById('itemQty').value = it ? it.qty : '';
            document.getElementById('orderQty').value = '';
        });
        document.getElementById('addItemButton').addEventListener('click', OrderController.addItem);
        document.getElementById('getBalance').addEventListener('click', OrderController.calcBalance);
        document.getElementById('placeOrderButton').addEventListener('click', OrderController.placeOrder);
        document.getElementById('orderID').value = genId('ORD');
        document.getElementById('date').valueAsDate = new Date();
        OrderController.loadCustomerDropdown();
        OrderController.loadItemDropdown();
        OrderController.renderCart();
    }
};

window.OrderController = OrderController;
export default OrderController;