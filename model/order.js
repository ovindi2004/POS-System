import {order_db, saveOrders} from '../db/db';

class Order {
    #orderId;
    #date;
    #custId;
    #itemId;
    #qty;
    #total;
    #cash;
    #discount;
    #balance;

    constructor(orderId, date, custId, itemId, qty, total, cash, discount, balance) {
        this.#orderId = orderId;
        this.#date = date;
        this.#custId = custId;
        this.#itemId = itemId;
        this.#qty = qty;
        this.#total = total;
        this.#cash = cash;
        this.#discount = discount;
        this.#balance = balance;
    }

    get orderId() {
        return this.#orderId;
    }

    get date() {
        return this.#date;
    }

    get custId() {
        return this.#custId;
    }

    get itemId() {
        return this.#itemId;
    }

    get qty() {
        return this.#qty;
    }

    get total() {
        return this.#total;
    }

    get cash() {
        return this.#cash;
    }

    get discount() {
        return this.#discount;
    }

    get balance() {
        return this.#balance;
    }

    set orderId(orderId) {
        this.#orderId = orderId;
    }

    set date(date) {
        this.#date = date;
    }

    set custId(custId) {
        this.#custId = custId;
    }

    set itemId(itemId) {
        this.#itemId = itemId;
    }

    set qty(qty) {
        this.#qty = qty;
    }

    set total(total) {
        this.#total = total;
    }

    set cash(cash) {
        this.#cash = cash;
    }

    set discount(discount) {
        this.#discount = discount;
    }

    set balance(balance) {
        this.#balance = balance;
    }
}

// --------------------------- Add Order ---------------------------
const addOrderData = (orderId, date, custId, itemId, qty, total, cash, discount, balance) => {
    let new_order = new Order(orderId, date, custId, itemId, qty, total, cash, discount, balance);
    order_db.push(new_order);
    saveOrders();
}

// --------------------------- Delete Order ---------------------------
const deleteOrderData = (orderId) => {
    let index = order_db.findIndex(item => item.orderId == orderId);
    if (index !== -1) {
        order_db.splice(index, 1);
        saveOrders();
    }
}

// --------------------------- Get All Orders ---------------------------
const getOrderData = () => {
    return order_db;
}

// --------------------------- Get Order by Index ---------------------------
const getOrderDataByIndex = (index) => {
    return order_db[index];
}

// --------------------------- Get Order by Id ---------------------------
const getOrderDataById = (orderId) => {
    return order_db.find(item => item.orderId == orderId);
}

export {
    addOrderData,
    deleteOrderData,
    getOrderData,
    getOrderDataByIndex,
    getOrderDataById
};