import {addUserData, getUserDataByEmail} from '../model/user';
import {genId, toast} from '../utills/regex_utills';
import {updateDashboard, loadCustomerDropdown, loadItemDropdown, generateOrderId} from './orderController';

// --------------------------- Show Login Form ---------------------------
const showLoginForm = () => {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginFormElement').reset();
}

// --------------------------- Show Register Form ---------------------------
const showRegisterForm = () => {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('registerFormElement').reset();
}

// --------------------------- Show App ---------------------------
const showApp = () => {
    document.getElementById('AuthSection').classList.add('hidden');
    document.getElementById('AppSection').classList.remove('hidden');
    updateDashboard();
    loadCustomerDropdown();
    loadItemDropdown();
    generateOrderId();
    document.getElementById('date').valueAsDate = new Date();
}

// --------------------------- Show Auth ---------------------------
const showAuth = () => {
    document.getElementById('AuthSection').classList.remove('hidden');
    document.getElementById('AppSection').classList.add('hidden');
    showLoginForm();
}

// --------------------------- Login ---------------------------
document.getElementById('loginFormElement').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;

    const user = getUserDataByEmail(email);

    if (user && user.password === pass) {
        localStorage.setItem('currentUser', JSON.stringify({id: user.id, username: user.username, email: user.email}));
        showApp();
        toast('success', 'Welcome back!', user.username);
    } else {
        toast('error', 'Login Failed', 'Invalid email or password');
    }
});

// --------------------------- Register ---------------------------
document.getElementById('registerFormElement').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const pass = document.getElementById('registerPassword').value;
    const conf = document.getElementById('confirmPassword').value;

    if (!username || !email || !pass) {
        toast('error', 'Error', 'Please fill in all fields');
        return;
    }
    if (pass !== conf) {
        toast('error', 'Error', 'Passwords do not match');
        return;
    }
    if (getUserDataByEmail(email)) {
        toast('error', 'Error', 'Email already registered');
        return;
    }

    addUserData(genId('USR'), username, email, pass);
    toast('success', 'Registered!', 'You can now login');
    showLoginForm();
});

// --------------------------- Nav Listeners ---------------------------
document.getElementById('showRegister').addEventListener('click', showRegisterForm);
document.getElementById('showLogin').addEventListener('click', showLoginForm);

// --------------------------- Auto Login Check ---------------------------
(function () {
    const u = localStorage.getItem('currentUser');
    if (u) showApp(); else showAuth();
})();

export {showApp, showAuth, showLoginForm};