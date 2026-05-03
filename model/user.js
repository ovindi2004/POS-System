import {user_db, saveUsers} from '../db/db.js';

class User {
    #id;
    #username;
    #email;
    #password;

    constructor(id, username, email, password) {
        this.#id = id;
        this.#username = username;
        this.#email = email;
        this.#password = password;
    }

    get id() {
        return this.#id;
    }

    get username() {
        return this.#username;
    }

    get email() {
        return this.#email;
    }

    get password() {
        return this.#password;
    }

    set id(id) {
        this.#id = id;
    }

    set username(username) {
        this.#username = username;
    }

    set email(email) {
        this.#email = email;
    }

    set password(password) {
        this.#password = password;
    }
}

// --------------------------- Add User ---------------------------
const addUserData = (id, username, email, password) => {
    let new_user = new User(id, username, email, password);
    user_db.push(new_user);
    saveUsers();
}

// --------------------------- Update User ---------------------------
const updateUserData = (id, username, email, password) => {
    let obj = user_db.find(item => item.id == id);
    if (obj) {
        obj.username = username;
        obj.email = email;
        obj.password = password;
        saveUsers();
    }
}

// --------------------------- Delete User ---------------------------
const deleteUserData = (id) => {
    let index = user_db.findIndex(item => item.id == id);
    if (index !== -1) {
        user_db.splice(index, 1);
        saveUsers();
    }
}

// --------------------------- Get All Users ---------------------------
const getUserData = () => {
    return user_db;
}

// --------------------------- Get User by Index ---------------------------
const getUserDataByIndex = (index) => {
    return user_db[index];
}

// --------------------------- Get User by Id ---------------------------
const getUserDataById = (id) => {
    return user_db.find(item => item.id == id);
}

// --------------------------- Get User by Email ---------------------------
const getUserDataByEmail = (email) => {
    return user_db.find(item => item.email == email);
}

export {
    addUserData,
    updateUserData,
    deleteUserData,
    getUserData,
    getUserDataByIndex,
    getUserDataById,
    getUserDataByEmail
};