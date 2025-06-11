document.addEventListener('DOMContentLoaded', () => {
    const itemInput = document.querySelector('.item-input');
    const addItemBtn = document.querySelector('.add-item-btn');
    const itemList = document.querySelector('.item-list');
    const remainingItemsList = document.querySelector('.remaining-items');
    const boughtItemsList = document.querySelector('.bought-items');

    const STORAGE_KEY = 'shoppingCartItems';

    function saveCartState() {
        const items = [];
        document.querySelectorAll('.item-row').forEach(itemRow => {
            const name = itemRow.querySelector('.item-name').textContent;
            const quantity = parseInt(itemRow.querySelector('.item-quantity-display').textContent);
            const isBought = itemRow.classList.contains('is-bought');
            items.push({ name, quantity, isBought });
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function loadCartState() {
        const storedItems = localStorage.getItem(STORAGE_KEY);
        if (storedItems) {
            const items = JSON.parse(storedItems);
            items.forEach(item => {
                const newItemRow = createItemRow(item.name, item.quantity, item.isBought);
                itemList.appendChild(newItemRow);
            });
        } else {
            const initialItems = [
                { name: 'Помідори', quantity: 2, isBought: false },
                { name: 'Печиво', quantity: 1, isBought: true },
                { name: 'Сир', quantity: 1, isBought: false }
            ];
            initialItems.forEach(item => {
                const newItemRow = createItemRow(item.name, item.quantity, item.isBought);
                itemList.appendChild(newItemRow);
            });
        }
        updateRightPanel();
    }

    function updateRightPanel() {
        remainingItemsList.innerHTML = '';
        boughtItemsList.innerHTML = '';

        const allItems = Array.from(itemList.children);

        const remaining = allItems.filter(item => !item.classList.contains('is-bought'));
        const bought = allItems.filter(item => item.classList.contains('is-bought'));

        remaining.forEach(item => {
            const itemName = item.querySelector('.item-name').textContent;
            const itemQuantity = item.querySelector('.item-quantity-display').textContent;
            const li = document.createElement('li');
            li.innerHTML = `<span class="item-badge">${itemName} <span class="badge-quantity">${itemQuantity}</span></span>`;
            remainingItemsList.appendChild(li);
        });

        bought.forEach(item => {
            const itemName = item.querySelector('.item-name').textContent;
            const itemQuantity = item.querySelector('.item-quantity-display').textContent;
            const li = document.createElement('li');
            li.innerHTML = `<span class="item-badge">${itemName} <span class="badge-quantity">${itemQuantity}</span></span>`;
            boughtItemsList.appendChild(li);
        });
        saveCartState(); 
    }

    function createItemRow(name, quantity = 1, isBought = false) {
        const li = document.createElement('li');
        li.classList.add('item-row');
        if (isBought) {
            li.classList.add('is-bought');
        }

        li.innerHTML = `
            <span class="item-name">${name}</span>
            <div class="quantity-controls">
                <button class="quantity-btn remove-quantity" data-tooltip="Зменшити кількість">-</button>
                <span class="item-quantity-display">${quantity}</span>
                <button class="quantity-btn add-quantity" data-tooltip="Збільшити кількість">+</button>
            </div>
            <div class="buttons">
                <button class="status-btn ${isBought ? 'bought' : 'not-bought'}"
                        data-tooltip="${isBought ? 'Зробити не купленим' : 'Купити товар'}">
                    ${isBought ? 'Куплено' : 'Не куплено'}
                </button>
                <button class="delete-btn" data-tooltip="Видалити товар">x</button>
            </div>
        `;

        addEventListenersToItem(li);
        updateQuantityBtnState(li); 
        return li;
    }

    
    function addEventListenersToItem(itemRow) {
        const itemNameSpan = itemRow.querySelector('.item-name');
        const removeQuantityBtn = itemRow.querySelector('.remove-quantity');
        const addQuantityBtn = itemRow.querySelector('.add-quantity');
        const itemQuantityDisplay = itemRow.querySelector('.item-quantity-display');
        const statusBtn = itemRow.querySelector('.status-btn');
        const deleteBtn = itemRow.querySelector('.delete-btn');

        
        itemNameSpan.addEventListener('click', () => {
            if (!itemRow.classList.contains('is-bought')) {
                const currentName = itemNameSpan.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentName;
                input.classList.add('item-input-edit');
                itemNameSpan.replaceWith(input);
                input.focus();
                input.select(); 

                const saveName = () => {
                    const newName = input.value.trim();
                    itemNameSpan.textContent = newName || currentName; 
                    input.replaceWith(itemNameSpan);
                    updateRightPanel();
                };

                input.addEventListener('blur', saveName); 
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        saveName();
                    }
                });
            }
        });

        removeQuantityBtn.addEventListener('click', () => {
            let quantity = parseInt(itemQuantityDisplay.textContent);
            if (quantity > 1) {
                quantity--;
                itemQuantityDisplay.textContent = quantity;
                updateQuantityBtnState(itemRow);
                updateRightPanel();
            }
        });

        addQuantityBtn.addEventListener('click', () => {
            let quantity = parseInt(itemQuantityDisplay.textContent);
            quantity++;
            itemQuantityDisplay.textContent = quantity;
            updateQuantityBtnState(itemRow);
            updateRightPanel();
        });

        statusBtn.addEventListener('click', () => {
            const isBought = itemRow.classList.toggle('is-bought');
            statusBtn.textContent = isBought ? 'Куплено' : 'Не куплено';
            statusBtn.classList.toggle('bought', isBought);
            statusBtn.classList.toggle('not-bought', !isBought);
            statusBtn.setAttribute('data-tooltip', isBought ? 'Зробити не купленим' : 'Купити товар');

            updateRightPanel();
        });

        deleteBtn.addEventListener('click', () => {
            if (!itemRow.classList.contains('is-bought')) {
                itemRow.remove();
                updateRightPanel();
            }
        });
    }

    function updateQuantityBtnState(itemRow) {
        const itemQuantityDisplay = itemRow.querySelector('.item-quantity-display');
        const removeQuantityBtn = itemRow.querySelector('.remove-quantity');
        let quantity = parseInt(itemQuantityDisplay.textContent);

        if (quantity <= 1) {
            removeQuantityBtn.disabled = true;
        } else {
            removeQuantityBtn.disabled = false;
        }
    }

    
    addItemBtn.addEventListener('click', () => {
        const itemName = itemInput.value.trim();
        if (itemName) {
            const newItem = createItemRow(itemName, 1, false); 
            itemList.appendChild(newItem);
            itemInput.value = ''; 
            itemInput.focus();    
            updateRightPanel();
        }
    });

    itemInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addItemBtn.click();
        }
    });

    loadCartState();
});