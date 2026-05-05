// ===================== ORDER DETAILS CONTROLLER =====================
import OrderModel from '../model/OrderModel.js';

const OrderDetailsController = {

    render: (list) => {
        const tbody = document.getElementById('orderDetailsTableBody');
        if (!list) list = OrderModel.getAll();
        tbody.innerHTML = list.length
            ? list.map(o => `<tr>
                <td><span style="color:var(--primary);font-size:12px">${o.orderId}</span></td>
                <td>${o.date}</td><td>${o.custId}</td><td>${o.itemId}</td><td>${o.qty}</td>
                <td style="color:var(--warning)">$${o.total}</td>
                <td>$${o.cash}</td><td>${o.discount}%</td>
                <td style="color:var(--success)">$${o.balance}</td>
              </tr>`).join('')
            : `<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:30px">No orders found</td></tr>`;
    },

    search: () => {
        const q = document.getElementById('order_search').value.trim();
        if (!q) {
            OrderDetailsController.render();
            return;
        }
        OrderDetailsController.render(OrderModel.findByQuery(q));
    },

    init: () => {
        document.getElementById('orderSearchBtn').addEventListener('click', OrderDetailsController.search);
        document.getElementById('order_search').addEventListener('keyup', e => {
            if (e.key === 'Enter') OrderDetailsController.search();
            if (!e.target.value) OrderDetailsController.render();
        });
    }
};

export default OrderDetailsController;