import {customer_db, saveCustomers} from '../db/db';

class Customer {
    #id;
    #firstName;
    #lastName;
    #address;
    #email;
    #contact;

    constructor(id, firstName, lastName, address, email, contact) {
        this.#id = id;
        this.#firstName = firstName;
        this.#lastName = lastName;
        this.#address = address;
        this.#email = email;
        this.#contact = contact;
    }

    get id() {
        return this.#id;
    }

    get firstName() {
        return this.#firstName;
    }

    get lastName() {
        return this.#lastName;
    }

    get address() {
        return this.#address;
    }

    get email() {
        return this.#email;
    }

    get contact() {
        return this.#contact;
    }

    set id(id) {
        this.#id = id;
    }

    set firstName(firstName) {
        this.#firstName = firstName;
    }

    set lastName(lastName) {
        this.#lastName = lastName;
    }

    set address(address) {
        this.#address = address;
    }

    set email(email) {
        this.#email = email;
    }

    set contact(contact) {
        this.#contact = contact;
    }
}

// --------------------------- Add Customer ---------------------------
const addCustomerData = (id, firstName, lastName, address, email, contact) => {
    let new_customer = new Customer(id, firstName, lastName, address, email, contact);
    customer_db.push(new_customer);
    saveCustomers();
}

// --------------------------- Update Customer ---------------------------
const updateCustomerData = (id, firstName, lastName, address, email, contact) => {
    let obj = customer_db.find(item => item.id == id);
    if (obj) {
        obj.firstName = firstName;
        obj.lastName = lastName;
        obj.address = address;
        obj.email = email;
        obj.contact = contact;
        saveCustomers();
    }
}

// --------------------------- Delete Customer ---------------------------
const deleteCustomerData = (id) => {
    let index = customer_db.findIndex(item => item.id == id);
    if (index !== -1) {
        customer_db.splice(index, 1);
        saveCustomers();
    }
}

// --------------------------- Get All Customers ---------------------------
const getCustomerData = () => {
    return customer_db;
}

// --------------------------- Get Customer by Index ---------------------------
const getCustomerDataByIndex = (index) => {
    return customer_db[index];
}

// --------------------------- Get Customer by Id ---------------------------
const getCustomerDataById = (id) => {
    return customer_db.find(item => item.id == id);
}

export {
    addCustomerData,
    updateCustomerData,
    deleteCustomerData,
    getCustomerData,
    getCustomerDataByIndex,
    getCustomerDataById
};