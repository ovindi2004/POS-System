import {addItemData, updateItemData, deleteItemData, getItemData, getItemDataById} from '../model/item';
import {genId, toast, confirmDlg} from '../utills/regex_utills';

// --------------------------- Render Items ---------------------------
const renderItems = (list) => {
    const tbody = document.getElementById('itemTableBody');
    if (!list) list = getItemData();

    tbody.innerHTML = list.length
        ? list.map(i => `<tr onclick="selectItem('${i.id}')">
            <td><span style="color:var(--success);font-size:12px">${i.id}</span></td>
            <td>${i.name}</td>
            <td>${i.qty}</td>
            <td>$${parseFloat(i.price).toFixed(2)}</td>
            <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.desc}</td>
          </tr>`).join('')
        : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px">No items found</td></tr>`;
}

// --------------------------- Select Item ---------------------------
const selectItem = (id) => {
    const it = getItemDataById(id);
    if (!it) return;
    document.getElementById('itemId').value = it.id;
    document.getElementById('itemName').value = it.name;
    document.getElementById('Quantity').value = it.qty;
    document.getElementById('UnitPrice').value = it.price;
    document.getElementById('Description').value = it.desc;
}

// Make function globally available for HTML onclick
window.selectItem = selectItem;

// --------------------------- Clear Item Form ---------------------------
const clearItemForm = () => {
    ['itemId', 'itemName', 'Quantity', 'UnitPrice', 'Description']
        .forEach(id => document.getElementById(id).value = '');
    document.getElementById('itemId').value = genId('I');
}

// --------------------------- Save Item ---------------------------
document.getElementById('itemSaveButton').addEventListener('click', () => {
    const id = document.getElementById('itemId').value.trim() || genId('I');
    const name = document.getElementById('itemName').value.trim();
    const qty = document.getElementById('Quantity').value.trim();
    const price = document.getElementById('UnitPrice').value.trim();
    const desc = document.getElementById('Description').value.trim();

    if (!name || !qty || !price) {
        toast('warning', 'Required', 'Fill Item Name, Quantity & Price');
        return;
    }
    if (getItemDataById(id)) {
        toast('error', 'Exists', 'Item ID already exists. Use Update.');
        return;
    }

    addItemData(id, name, parseInt(qty), parseFloat(price), desc);
    renderItems();
    clearItemForm();
    toast('success', 'Item Saved!');
});

// --------------------------- Update Item ---------------------------
document.getElementById('itemUpdateButton').addEventListener('click', () => {
    const id = document.getElementById('itemId').value.trim();
    if (!id) {
        toast('warning', 'Select', 'Click a row to select an item first');
        return;
    }
    if (!getItemDataById(id)) {
        toast('error', 'Not Found', 'Item not found');
        return;
    }

    updateItemData(
        id,
        document.getElementById('itemName').value.trim(),
        parseInt(document.getElementById('Quantity').value),
        parseFloat(document.getElementById('UnitPrice').value),
        document.getElementById('Description').value.trim()
    );
    renderItems();
    toast('success', 'Item Updated!');
});

// --------------------------- Delete Item ---------------------------
document.getElementById('itemDeleteButton').addEventListener('click', () => {
    const id = document.getElementById('itemId').value.trim();
    if (!id) {
        toast('warning', 'Select', 'Click a row to select an item first');
        return;
    }

    confirmDlg('Delete Item?', 'This cannot be undone.', () => {
        deleteItemData(id);
        renderItems();
        clearItemForm();
        toast('success', 'Item Deleted!');
    });
});

// --------------------------- Clear Button ---------------------------
document.getElementById('itemClearButton').addEventListener('click', clearItemForm);

// --------------------------- Search Item ---------------------------
document.getElementById('itemSearchBtn').addEventListener('click', () => {
    const q = document.getElementById('item_search').value.trim().toLowerCase();
    if (!q) {
        renderItems();
        return;
    }
    renderItems(getItemData().filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
    ));
});

document.getElementById('item_search').addEventListener('keyup', e => {
    if (e.key === 'Enter') document.getElementById('itemSearchBtn').click();
    if (!e.target.value) renderItems();
});

// --------------------------- Init ---------------------------
document.getElementById('itemId').value = genId('I');
renderItems();

export {renderItems, selectItem, clearItemForm};
