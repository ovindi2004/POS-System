//---------------------Customer DB---------------------
let customer_db = JSON.parse(localStorage.getItem('pos_customers') || '[]');

//---------------------Item DB---------------------
let item_db = JSON.parse(localStorage.getItem('pos_items') || '[]');

//---------------------Order DB---------------------
let order_db = JSON.parse(localStorage.getItem('pos_orders') || '[]');

//---------------------User DB---------------------
let user_db = JSON.parse(localStorage.getItem('pos_users') || '[]');

//---------------------Save Functions---------------------
function saveCustomers() {
    localStorage.setItem('pos_customers', JSON.stringify(customer_db));
}

function saveItems() {
    localStorage.setItem('pos_items', JSON.stringify(item_db));
}

function saveOrders() {
    localStorage.setItem('pos_orders', JSON.stringify(order_db));
}

function saveUsers() {
    localStorage.setItem('pos_users', JSON.stringify(user_db));
}

export {customer_db, item_db, order_db, user_db, saveCustomers, saveItems, saveOrders, saveUsers};