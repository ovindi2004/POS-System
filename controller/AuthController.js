// ── AUTH CONTROLLER ──
import db from '../db/database.js';
import {genId, toast, confirmDlg} from '../utils/regex_utils.js';

let currentUser = null;

const AuthController = {

    getCurrentUser: () => currentUser,

    login: (onSuccess) => {
        document.getElementById('loginFormElement').addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const pass = document.getElementById('loginPassword').value;
            const users = db.get('pos_users');
            const user = users.find(u => u.email === email && u.password === pass);
            if (user) {
                currentUser = user;
                toast('success', 'Welcome back!', user.username);
                onSuccess(user);
            } else {
                toast('error', 'Login Failed', 'Invalid email or password');
            }
        });
    },

    register: () => {
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
            const users = db.get('pos_users');
            if (users.find(u => u.email === email)) {
                toast('error', 'Error', 'Email already registered');
                return;
            }
            users.push({id: genId('USR'), username, email, password: pass});
            db.set('pos_users', users);
            toast('success', 'Registered!', 'You can now login');
            AuthController.showLoginForm();
        });
    },

    logout: (onLogout) => {
        confirmDlg('Logout?', 'Are you sure you want to logout?', () => {
            currentUser = null;
            toast('success', 'Logged out');
            onLogout();
        });
    },

    showLoginForm: () => {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginFormElement').reset();
    },

    showRegisterForm: () => {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('registerFormElement').reset();
    },

    init: (onLoginSuccess, onLogout) => {
        AuthController.login(onLoginSuccess);
        AuthController.register();
        document.getElementById('showRegister').addEventListener('click', AuthController.showRegisterForm);
        document.getElementById('showLogin').addEventListener('click', AuthController.showLoginForm);
        document.getElementById('logout_nav').addEventListener('click', () => AuthController.logout(onLogout));
    }
};

export default AuthController;