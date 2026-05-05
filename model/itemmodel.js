// ── ITEM MODEL ──
import db from '../dbs/database.js';
import {genId} from '../utils/regex_utils.js';

const ItemModel = {

    getAll: () => db.get('pos_items'),

    findById: (id) => db.get('pos_items').find(i => i.id === id),

    findByQuery: (query) => {
        const q = query.toLowerCase();
        return db.get('pos_items').filter(i =>
            i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
        );
    },

    save: (data) => {
        const items = db.get('pos_items');
        const id = data.id || genId('I');
        if (items.find(i => i.id === id)) return {success: false, message: 'Item ID already exists.'};
        items.push({
            id,
            name: data.name,
            qty: parseInt(data.qty),
            price: parseFloat(data.price),
            desc: data.desc || ''
        });
        db.set('pos_items', items);
        return {success: true, id};
    },

    update: (id, data) => {
        const items = db.get('pos_items');
        const idx = items.findIndex(i => i.id === id);
        if (idx === -1) return {success: false, message: 'Item not found.'};
        items[idx] = {
            id,
            name: data.name,
            qty: parseInt(data.qty),
            price: parseFloat(data.price),
            desc: data.desc || ''
        };
        db.set('pos_items', items);
        return {success: true};
    },

    delete: (id) => {
        const items = db.get('pos_items');
        if (!items.find(i => i.id === id)) return {success: false, message: 'Item not found.'};
        db.set('pos_items', items.filter(i => i.id !== id));
        return {success: true};
    },

    decreaseStock: (id, qty) => {
        const items = db.get('pos_items');
        const idx = items.findIndex(i => i.id === id);
        if (idx === -1) return false;
        items[idx].qty -= qty;
        db.set('pos_items', items);
        return true;
    }
};

export default ItemModel;