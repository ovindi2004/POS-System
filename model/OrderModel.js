// ── ORDER MODEL ──
import db from '../db/database.js';

const OrderModel = {

    getAll: () => db.get('pos_orders'),

    findByQuery: (query) => {
        const q = query.toLowerCase();
        return db.get('pos_orders').filter(o =>
            o.orderId.toLowerCase().includes(q) || o.custId.toLowerCase().includes(q)
        );
    },

    save: (orderData) => {
        // orderData: { orderId, date, custId, items[], cash, discount }
        const orders = db.get('pos_orders');
        const {orderId, date, custId, items, cash, discount} = orderData;
        const total = items.reduce((s, i) => s + i.total, 0);
        const netTotal = total * (1 - discount / 100);
        const balance = cash - netTotal;

        items.forEach(oi => {
            orders.push({
                orderId, date, custId,
                itemId: oi.itemId,
                qty: oi.qty,
                total: oi.total.toFixed(2),
                cash: cash.toFixed(2),
                discount,
                balance: balance.toFixed(2)
            });
        });

        db.set('pos_orders', orders);
        return {success: true};
    }
};

export default OrderModel;