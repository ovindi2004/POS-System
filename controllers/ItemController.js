// ── ITEM CONTROLLER ──
import ItemModel from '../models/ItemModel.js';
import {genId, toast, confirmDlg} from '../utils/regex_utils.js';

const ItemController = {

    render: (list) => {
        const tbody = document.getElementById('itemTableBody');
        if (!list) list = ItemModel.getAll();
        tbody.innerHTML = list.length
            ? list.map(i => `<tr onclick="ItemController.select('${i.id}')">
                <td><span style="color:var(--success);font-size:12px">${i.id}</span></td>
                <td>${i.name}</td><td>${i.qty}</td>
                <td>$${parseFloat(i.price).toFixed(2)}</td>
                <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.desc}</td>
              </tr>`).join('')
            : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px">No items found</td></tr>`;
    },

    select: (id) => {
        const it = ItemModel.findById(id);
        if (!it) return;
        document.getElementById('itemId').value = it.id;
        document.getElementById('itemName').value = it.name;
        document.getElementById('Quantity').value = it.qty;
        document.getElementById('UnitPrice').value = it.price;
        document.getElementById('Description').value = it.desc;
    },

    clear: () => {
        ['itemId', 'itemName', 'Quantity', 'UnitPrice', 'Description']
            .forEach(id => document.getElementById(id).value = '');
        document.getElementById('itemId').value = genId('I');
    },

    save: () => {
        const name = document.getElementById('itemName').value.trim();
        const qty = document.getElementById('Quantity').value.trim();
        const price = document.getElementById('UnitPrice').value.trim();
        if (!name || !qty || !price) {
            toast('warning', 'Required', 'Fill Item Name, Quantity & Price');
            return;
        }
        const result = ItemModel.save({
            id: document.getElementById('itemId').value.trim() || genId('I'),
            name, qty, price,
            desc: document.getElementById('Description').value.trim()
        });
        if (!result.success) {
            toast('error', 'Error', result.message);
            return;
        }
        ItemController.render();
        ItemController.clear();
        toast('success', 'Item Saved!');
    },

    update: () => {
        const id = document.getElementById('itemId').value.trim();
        if (!id) {
            toast('warning', 'Select', 'Click a row to select an item first');
            return;
        }
        const result = ItemModel.update(id, {
            name: document.getElementById('itemName').value.trim(),
            qty: document.getElementById('Quantity').value,
            price: document.getElementById('UnitPrice').value,
            desc: document.getElementById('Description').value.trim()
        });
        if (!result.success) {
            toast('error', 'Error', result.message);
            return;
        }
        ItemController.render();
        toast('success', 'Item Updated!');
    },

    delete: () => {
        const id = document.getElementById('itemId').value.trim();
        if (!id) {
            toast('warning', 'Select', 'Click a row first');
            return;
        }
        confirmDlg('Delete Item?', 'This cannot be undone.', () => {
            const result = ItemModel.delete(id);
            if (!result.success) {
                toast('error', 'Error', result.message);
                return;
            }
            ItemController.render();
            ItemController.clear();
            toast('success', 'Item Deleted!');
        });
    },

    search: () => {
        const q = document.getElementById('item_search').value.trim();
        if (!q) {
            ItemController.render();
            return;
        }
        ItemController.render(ItemModel.findByQuery(q));
    },

    init: () => {
        document.getElementById('itemSaveButton').addEventListener('click', ItemController.save);
        document.getElementById('itemUpdateButton').addEventListener('click', ItemController.update);
        document.getElementById('itemDeleteButton').addEventListener('click', ItemController.delete);
        document.getElementById('itemClearButton').addEventListener('click', ItemController.clear);
        document.getElementById('itemSearchBtn').addEventListener('click', ItemController.search);
        document.getElementById('item_search').addEventListener('keyup', e => {
            if (e.key === 'Enter') ItemController.search();
            if (!e.target.value) ItemController.render();
        });
        ItemController.clear();
        ItemController.render();
    }
};

window.ItemController = ItemController;
export default ItemController;