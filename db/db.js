// ── DATABASE LAYER ──
// In-memory database with get/set operations

const memoryDB = {
    pos_customers: [],
    pos_items: [],
    pos_orders: [],
    pos_users: []
};

const db = {
    get: (key) => memoryDB[key] || [],
    set: (key, value) => {
        memoryDB[key] = value;
    }
};

export default db;