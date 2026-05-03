import {toast, confirmDlg} from '../utills/regex_utills';
import {showAuth} from './loginContorller';
import {updateDashboard, loadCustomerDropdown, loadItemDropdown, generateOrderId, renderOrderDetails} from './orderController';

// --------------------------- Section Map ---------------------------
const sections = {
    home: document.getElementById('HomeSection'),
    customer: document.getElementById('CustomerSection'),
    item: document.getElementById('ItemSection'),
    order: document.getElementById('OrderSection'),
    orderDetails: document.getElementById('OrderDetailsSection')
};

const navMap = {
    home_nav: 'home',
    customer_nav: 'customer',
    item_nav: 'item',
    order_nav: 'order',
    orderDetails_nav: 'orderDetails'
};

// --------------------------- Show Section ---------------------------
const showSection = (name) => {
    Object.values(sections).forEach(s => s.classList.add('hidden'));
    sections[name].classList.remove('hidden');

    document.querySelectorAll('.nav-pills .nav-link').forEach(l => l.classList.remove('active'));
    const navId = Object.keys(navMap).find(k => navMap[k] === name);
    if (navId) document.getElementById(navId).classList.add('active');

    if (name === 'home') updateDashboard();
    if (name === 'orderDetails') renderOrderDetails();
    if (name === 'order') {
        loadCustomerDropdown();
        loadItemDropdown();
        generateOrderId();
        document.getElementById('date').valueAsDate = new Date();
    }
}

// --------------------------- Nav Click Listeners ---------------------------
Object.keys(navMap).forEach(id => {
    document.getElementById(id).addEventListener('click', () => showSection(navMap[id]));
});

// --------------------------- Logout ---------------------------
document.getElementById('logout_nav').addEventListener('click', () => {
    confirmDlg('Logout?', 'Are you sure you want to logout?', () => {
        localStorage.removeItem('currentUser');
        showAuth();
        toast('success', 'Logged out');
    });
});

export {showSection, updateDashboard, loadCustomerDropdown, loadItemDropdown, generateOrderId, renderOrderDetails};

