// ==================== LoginController ====================
import db from '../db/database.js';
import {genId, toast, confirmDlg, regex, markValid, markInvalid, clearMarks} from '../utils/regex_utils.js';

// Stores the currently logged-in user
let currentUser = null;

const LoginController = {

    // Return the current logged-in user
    getCurrentUser: () => currentUser,

    // Handle login form submission and validate credentials
    login: (onSuccess) => {
        document.getElementById('loginFormElement').addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const pass = document.getElementById('loginPassword').value;
            let valid = true;

            // Email check
            if (!email) {
                markInvalid('loginEmail', 'Email is required.');
                valid = false;
            } else if (!regex.isValidEmail(email)) {
                markInvalid('loginEmail', 'Enter a valid email address.');
                valid = false;
            } else {
                markValid('loginEmail');
            }

            // Password check
            if (!pass) {
                markInvalid('loginPassword', 'Password is required.');
                valid = false;
            } else {
                markValid('loginPassword');
            }

            if (!valid) return;

            // Match credentials against stored users
            const users = db.get('pos_users');
            const user = users.find(u => u.email === email && u.password === pass);
            if (user) {
                currentUser = user;
                clearMarks('loginEmail', 'loginPassword');
                toast('success', 'Welcome back!', user.username);
                onSuccess(user);
            } else {
                markInvalid('loginEmail', ' ');
                markInvalid('loginPassword', 'Invalid email or password.');
                toast('error', 'Login Failed', 'Invalid email or password');
            }
        });
    },

    // Handle register form submission with full validation
    register: () => {
        document.getElementById('registerFormElement').addEventListener('submit', e => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const pass = document.getElementById('registerPassword').value;
            const conf = document.getElementById('confirmPassword').value;
            let valid = true;

            // Username check
            if (!username) {
                markInvalid('registerUsername', 'Username is required.');
                valid = false;
            } else if (username.length < 3) {
                markInvalid('registerUsername', 'Username must be at least 3 characters.');
                valid = false;
            } else {
                markValid('registerUsername');
            }

            // Email check
            if (!email) {
                markInvalid('registerEmail', 'Email is required.');
                valid = false;
            } else if (!regex.isValidEmail(email)) {
                markInvalid('registerEmail', 'Enter a valid email address.');
                valid = false;
            } else {
                markValid('registerEmail');
            }

            // Password check
            if (!pass) {
                markInvalid('registerPassword', 'Password is required.');
                valid = false;
            } else if (!regex.isValidPassword(pass)) {
                markInvalid('registerPassword', 'Password must be at least 6 characters.');
                valid = false;
            } else {
                markValid('registerPassword');
            }

            // Confirm password check
            if (!conf) {
                markInvalid('confirmPassword', 'Please confirm your password.');
                valid = false;
            } else if (pass && conf !== pass) {
                markInvalid('confirmPassword', 'Passwords do not match.');
                valid = false;
            } else if (pass && conf === pass) {
                markValid('confirmPassword');
            }

            if (!valid) {
                toast('warning', 'Validation Failed', 'Fix the highlighted fields.');
                return;
            }

            // Check for duplicate email
            const users = db.get('pos_users');
            if (users.find(u => u.email === email)) {
                markInvalid('registerEmail', 'This email is already registered.');
                toast('error', 'Error', 'Email already registered');
                return;
            }

            // Save new user and switch to login
            users.push({id: genId('USR'), username, email, password: pass});
            db.set('pos_users', users);
            clearMarks('registerUsername', 'registerEmail', 'registerPassword', 'confirmPassword');
            toast('success', 'Registered!', 'You can now login');
            LoginController.showLoginForm();
        });
    },

    // Confirm and logout current user
    logout: (onLogout) => {
        confirmDlg('Logout?', 'Are you sure you want to logout?', () => {
            currentUser = null;
            toast('success', 'Logged out');
            onLogout();
        });
    },

    // Show login form and hide register form
    showLoginForm: () => {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginFormElement').reset();
        clearMarks('loginEmail', 'loginPassword');
    },

    // Show register form and hide login form
    showRegisterForm: () => {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('registerFormElement').reset();
        clearMarks('registerUsername', 'registerEmail', 'registerPassword', 'confirmPassword');
    },

    // Bind all auth events and live blur validation
    init: (onLoginSuccess, onLogout) => {
        LoginController.login(onLoginSuccess);
        LoginController.register();
        document.getElementById('showRegister').addEventListener('click', LoginController.showRegisterForm);
        document.getElementById('showLogin').addEventListener('click', LoginController.showLoginForm);
        document.getElementById('logout_nav').addEventListener('click', () => LoginController.logout(onLogout));

        // Live blur validation for register fields
        document.getElementById('registerPassword').addEventListener('blur', () => {
            const val = document.getElementById('registerPassword').value;
            if (!val) markInvalid('registerPassword', 'Password is required.');
            else if (!regex.isValidPassword(val)) markInvalid('registerPassword', 'Password must be at least 6 characters.');
            else markValid('registerPassword');
        });
        document.getElementById('confirmPassword').addEventListener('blur', () => {
            const pass = document.getElementById('registerPassword').value;
            const conf = document.getElementById('confirmPassword').value;
            if (!conf) markInvalid('confirmPassword', 'Please confirm your password.');
            else if (conf !== pass) markInvalid('confirmPassword', 'Passwords do not match.');
            else markValid('confirmPassword');
        });
        document.getElementById('registerEmail').addEventListener('blur', () => {
            const val = document.getElementById('registerEmail').value.trim();
            if (!val) markInvalid('registerEmail', 'Email is required.');
            else if (!regex.isValidEmail(val)) markInvalid('registerEmail', 'Enter a valid email address.');
            else markValid('registerEmail');
        });
    }
};

export default LoginController;