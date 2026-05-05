// ── DASHBOARD CONTROLLER ──
import db from '../db/database.js';

// Colors used across all charts
const CHART_COLORS = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#f87171', '#a78bfa', '#2dd4bf'];
let stockChart, revenueChart, ordersChart;

const DashboardController = {

    // Update stat counts and rebuild charts
    update: () => {
        document.getElementById('customerCount').textContent = db.get('pos_customers').length;
        document.getElementById('itemCount').textContent = db.get('pos_items').length;
        document.getElementById('orderCount').textContent = db.get('pos_orders').length;
        setTimeout(DashboardController.buildCharts, 50);
    },

    buildCharts: () => {
        const items = db.get('pos_items');
        const orders = db.get('pos_orders');

        // ── Stock Chart — top 6 items by qty (horizontal bar) ──
        const top = [...items].sort((a, b) => b.qty - a.qty).slice(0, 6);
        if (stockChart) stockChart.destroy();
        stockChart = new Chart(document.getElementById('stockChart'), {
            type: 'bar',
            data: {
                labels: top.map(i => i.name || i.id),
                datasets: [{
                    label: 'Stock Qty', data: top.map(i => i.qty),
                    backgroundColor: CHART_COLORS.map(c => c + '99'),
                    borderColor: CHART_COLORS, borderWidth: 1.5, borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                plugins: {legend: {display: false}, tooltip: {callbacks: {label: c => ' ' + c.parsed.x + ' units'}}},
                scales: {
                    x: {ticks: {color: '#94a3b8', font: {size: 11}}, grid: {color: 'rgba(45,49,72,0.6)'}},
                    y: {ticks: {color: '#e2e8f0', font: {size: 11}}, grid: {display: false}}
                }
            }
        });

        // ── Revenue Chart — total revenue per item (doughnut) ──
        const revMap = {};
        orders.forEach(o => {
            revMap[o.itemId] = (revMap[o.itemId] || 0) + parseFloat(o.total);
        });
        const revItems = Object.keys(revMap);
        const revVals = revItems.map(k => revMap[k]);
        const revLabels = revItems.map(id => {
            const it = items.find(i => i.id === id);
            return it ? it.name : id;
        });
        if (revenueChart) revenueChart.destroy();
        revenueChart = new Chart(document.getElementById('revenueChart'), {
            type: 'doughnut',
            data: {
                labels: revLabels.length ? revLabels : ['No orders yet'],
                datasets: [{
                    data: revVals.length ? revVals : [1],
                    backgroundColor: revVals.length ? CHART_COLORS.map(c => c + 'cc') : ['#2d3148'],
                    borderColor: '#1a1d2e', borderWidth: 3, hoverOffset: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '62%',
                plugins: {legend: {display: false}, tooltip: {callbacks: {label: c => ` $${c.parsed.toFixed(2)}`}}}
            }
        });

        // ── Orders Chart — unique orders per day for last 7 days (line) ──
        const days = 7, labels = [], counts = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const ds = d.toISOString().slice(0, 10);
            labels.push(ds.slice(5));
            const seen = new Set();
            orders.forEach(o => {
                if (o.date === ds) seen.add(o.orderId);
            });
            counts.push(seen.size);
        }
        if (ordersChart) ordersChart.destroy();
        ordersChart = new Chart(document.getElementById('ordersChart'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Orders', data: counts,
                    borderColor: '#818cf8', backgroundColor: 'rgba(129,140,248,0.12)',
                    borderWidth: 2, pointBackgroundColor: '#818cf8', pointRadius: 4, pointHoverRadius: 6,
                    fill: true, tension: 0.4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {legend: {display: false}, tooltip: {callbacks: {label: c => ` ${c.parsed.y} orders`}}},
                scales: {
                    x: {ticks: {color: '#94a3b8', font: {size: 11}}, grid: {color: 'rgba(45,49,72,0.5)'}},
                    y: {
                        ticks: {color: '#94a3b8', font: {size: 11}, stepSize: 1},
                        grid: {color: 'rgba(45,49,72,0.5)'},
                        min: 0
                    }
                }
            }
        });
    }
};

export default DashboardController;