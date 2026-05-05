// ── CUSTOMER MODEL ──
import db from '../dbs/database.js';
import { genId } from '../utils/regex_utils.js';

const CustomerModel = {

    getAll: () => db.get('pos_customers'),

    findById: (id) => db.get('pos_customers').find(c => c.id === id),

    findByName: (query) => {
        const q = query.toLowerCase();
        return db.get('pos_customers').filter(c =>
            (c.firstName + ' ' + c.lastName).toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
        );
    },

    save: (data) => {
        const customers = db.get('pos_customers');
        const id = data.id || genId('C');
        if (customers.find(c => c.id === id)) return { success: false, message: 'Customer ID already exists.' };
        customers.push({ id, ...data });
        db.set('pos_customers', customers);
        return { success: true, id };
    },

    update: (id, data) => {
        const customers = db.get('pos_customers');
        const idx = customers.findIndex(c => c.id === id);
        if (idx === -1) return { success: false, message: 'Customer not found.' };
        customers[idx] = { id, ...data };
        db.set('pos_customers', customers);
        return { success: true };
    },

    delete: (id) => {
        const customers = db.get('pos_customers');
        if (!customers.find(c => c.id === id)) return { success: false, message: 'Customer not found.' };
        db.set('pos_customers', customers.filter(c => c.id !== id));
        return { success: true };
    }
};

export default CustomerModel;