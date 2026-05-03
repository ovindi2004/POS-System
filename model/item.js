import {item_db, saveItems} from '../db/db';

class Item {
    #id;
    #name;
    #qty;
    #price;
    #desc;

    constructor(id, name, qty, price, desc) {
        this.#id = id;
        this.#name = name;
        this.#qty = qty;
        this.#price = price;
        this.#desc = desc;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get qty() {
        return this.#qty;
    }

    get price() {
        return this.#price;
    }

    get desc() {
        return this.#desc;
    }

    set id(id) {
        this.#id = id;
    }

    set name(name) {
        this.#name = name;
    }

    set qty(qty) {
        this.#qty = qty;
    }

    set price(price) {
        this.#price = price;
    }

    set desc(desc) {
        this.#desc = desc;
    }
}

// --------------------------- Add Item ---------------------------
const addItemData = (id, name, qty, price, desc) => {
    let new_item = new Item(id, name, qty, price, desc);
    item_db.push(new_item);
    saveItems();
}

// --------------------------- Update Item ---------------------------
const updateItemData = (id, name, qty, price, desc) => {
    let obj = item_db.find(item => item.id == id);
    if (obj) {
        obj.name = name;
        obj.qty = qty;
        obj.price = price;
        obj.desc = desc;
        saveItems();
    }
}

// --------------------------- Delete Item ---------------------------
const deleteItemData = (id) => {
    let index = item_db.findIndex(item => item.id == id);
    if (index !== -1) {
        item_db.splice(index, 1);
        saveItems();
    }
}

// --------------------------- Get All Items ---------------------------
const getItemData = () => {
    return item_db;
}

// --------------------------- Get Item by Index ---------------------------
const getItemDataByIndex = (index) => {
    return item_db[index];
}

// --------------------------- Get Item by Id ---------------------------
const getItemDataById = (id) => {
    return item_db.find(item => item.id == id);
}

export {
    addItemData,
    updateItemData,
    deleteItemData,
    getItemData,
    getItemDataByIndex,
    getItemDataById
};