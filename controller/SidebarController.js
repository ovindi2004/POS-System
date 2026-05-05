// ── MAIN APP ENTRY POINT ──
import LoginController from './LoginController.js';
import DashboardController from './DashboardController.js';
import CustomerController from './CustomerController.js';
import ItemController from './ItemController.js';
import OrderController from './OrderController.js';
import OrderDetailsController from './OrderDetailsController.js';

// All app sections mapped by name
const sections = {

    home: document.getElementById('HomeSection'),
    customer: document.getElementById('CustomerSection'),
    item: document.getElementById('ItemSection'),
    order: document.getElementById('OrderSection'),
    orderDetails: document.getElementById('OrderDetailsSection')
};

// Nav element ID to section name mapping
const navMap = {
    home_nav: 'home',
    customer_nav: 'customer',
    item_nav: 'item',
    order_nav: 'order',
    orderDetails_nav: 'orderDetails'
};

// Show a section and highlight its nav item
function showSection(name) {
    Object.values(sections).forEach(s => s.classList.add('hidden'));
    sections[name].classList.remove('hidden');
    document.querySelectorAll('.sidebar-nav-item').forEach(l => l.classList.remove('active'));
    const navId = Object.keys(navMap).find(k => navMap[k] === name);
    if (navId) document.getElementById(navId).classList.add('active');

    // Refresh data on section open
    if (name === 'home') DashboardController.update();
    if (name === 'order') {
        OrderController.loadCustomerDropdown();
        OrderController.loadItemDropdown();
    }
    if (name === 'orderDetails') OrderDetailsController.render();
}

// Bind nav click events
Object.keys(navMap).forEach(id => {
    document.getElementById(id).addEventListener('click', () => showSection(navMap[id]));
});

// Show main app after login
function showApp(user) {
    document.getElementById('AuthSection').classList.add('hidden');
    document.getElementById('AppSection').classList.remove('hidden');
    const name = user.username || 'User';
    document.getElementById('sidebarUsername').textContent = name;
    document.getElementById('sidebarAvatar').textContent = name.slice(0, 2).toUpperCase();
    DashboardController.update();
}

// Show auth screen on logout
function showAuth() {
    document.getElementById('AuthSection').classList.remove('hidden');
    document.getElementById('AppSection').classList.add('hidden');
    LoginController.showLoginForm();
}

// Init all controllers
LoginController.init(
    (user) => showApp(user),   // on login success
    () => showAuth()           // on logout
);

CustomerController.init();
ItemController.init();
OrderController.init();
OrderDetailsController.init();

// Boot — start with auth screen
showAuth();