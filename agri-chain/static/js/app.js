document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let currentProductId = null;

function initApp() {
    setupNavigation();
    setupThemeToggle();
    setupModals();
    setupForms();
    loadDashboard();
}

// ---- UI Navigation ----
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const view = link.getAttribute('data-view');
            switchView(view);
        });
    });

    document.getElementById('btn-back-products').addEventListener('click', () => {
        switchView('products');
    });
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`view-${viewId}`).classList.remove('hidden');

    // Load data based on view
    if (viewId === 'dashboard') loadDashboard();
    if (viewId === 'products') loadProducts();
    if (viewId === 'explorer') loadBlockchain();
}

function setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    btn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });
}

// ---- Modals & Notifications ----
function setupModals() {
    document.getElementById('btn-new-product').addEventListener('click', () => {
        document.getElementById('modal-create').classList.remove('hidden');
    });

    document.querySelectorAll('.btn-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.add('hidden');
        });
    });

    document.getElementById('btn-transfer').addEventListener('click', () => {
        document.getElementById('tf-product-id').value = currentProductId;
        document.getElementById('modal-transfer').classList.remove('hidden');
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ---- Forms ----
function setupForms() {
    // Create Product
    document.getElementById('form-create').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('cp-name').value,
            category: document.getElementById('cp-category').value,
            origin: document.getElementById('cp-origin').value,
            owner_name: document.getElementById('cp-owner').value
        };

        try {
            await Api.createProduct(data);
            document.getElementById('modal-create').classList.add('hidden');
            e.target.reset();
            showToast("Product Registered Successfully");
            loadDashboard();
        } catch (err) {
            alert("Error registering product");
        }
    });

    // Transfer Product
    document.getElementById('form-transfer').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            product_id: document.getElementById('tf-product-id').value,
            receiver: document.getElementById('tf-entity').value,
            receiver_name: document.getElementById('tf-name').value,
            status: document.getElementById('tf-status').value,
            details: document.getElementById('tf-details').value || null
        };

        try {
            await Api.transferProduct(data);
            document.getElementById('modal-transfer').classList.add('hidden');
            e.target.reset();
            showToast("Ownership Transferred Successfully");
            loadProductDetails(currentProductId);
        } catch (err) {
            alert("Error transferring product");
        }
    });
    
    // Verify Product
    document.getElementById('btn-verify').addEventListener('click', () => {
        const id = document.getElementById('verify-input').value.trim();
        if(id) loadProductDetails(id);
    });
}

// ---- Data Loading ----
async function loadDashboard() {
    try {
        const stats = await Api.getAnalytics();
        document.getElementById('stat-products').textContent = stats.total_products;
        document.getElementById('stat-blocks').textContent = stats.total_blocks;
        document.getElementById('stat-transactions').textContent = stats.total_transactions;

        const products = await Api.getProducts();
        renderProductsTable(products.slice(0, 5), 'recent-products-body');
    } catch (err) {
        console.error(err);
    }
}

async function loadProducts() {
    try {
        const products = await Api.getProducts();
        renderProductsTable(products, 'all-products-body');
    } catch (err) {
        console.error(err);
    }
}

function renderProductsTable(products, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = '';
    
    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="code-text" style="font-size: 0.8rem">${p.id.split('-')[0]}...</td>
            <td>${p.name}</td>
            <td>${p.owner_name} (${p.current_owner})</td>
            <td><span class="badge">${p.current_status}</span></td>
            <td>${new Date(p.created_at).toLocaleDateString()}</td>
            <td><button class="btn btn-outline btn-view-det" data-id="${p.id}">View</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-view-det').forEach(btn => {
        btn.addEventListener('click', (e) => {
            loadProductDetails(e.target.getAttribute('data-id'));
        });
    });
}

async function loadProductDetails(id) {
    try {
        const data = await Api.getProduct(id);
        const { product, history } = data;
        currentProductId = product.id;
        
        document.getElementById('det-id').textContent = product.id;
        document.getElementById('det-name').textContent = product.name;
        document.getElementById('det-category').textContent = product.category;
        document.getElementById('det-origin').textContent = product.origin;
        document.getElementById('det-owner').textContent = `${product.owner_name} (${product.current_owner})`;
        document.getElementById('det-status').innerHTML = `<span class="badge">${product.current_status}</span>`;

        // Generate QR
        document.getElementById('qr-code').innerHTML = '';
        new QRCode(document.getElementById('qr-code'), {
            text: product.id,
            width: 128,
            height: 128,
            colorDark: "#1f2937",
            colorLight: "#ffffff"
        });

        // Timeline
        const timeline = document.getElementById('product-timeline');
        timeline.innerHTML = '';
        
        // Sort history by time
        history.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));

        history.forEach(tx => {
            timeline.innerHTML += `
                <div class="timeline-item">
                    <div class="timeline-card glass-panel">
                        <h4>${tx.status_update}</h4>
                        <p class="subtitle">${new Date(tx.timestamp).toLocaleString()}</p>
                        <div class="mt-2 text-sm">
                            <p><strong>From:</strong> ${tx.sender_name} (${tx.sender})</p>
                            <p><strong>To:</strong> ${tx.receiver_name} (${tx.receiver})</p>
                            ${tx.details ? `<p><strong>Note:</strong> ${tx.details}</p>` : ''}
                        </div>
                        <div class="tx-hash">TX ID: ${tx.id}</div>
                    </div>
                </div>
            `;
        });

        switchView('product-details');
    } catch (err) {
        alert("Product not found");
    }
}

async function loadBlockchain() {
    try {
        const data = await Api.getBlockchain();
        const container = document.getElementById('chain-container');
        container.innerHTML = '';

        data.chain.forEach(block => {
            const txCount = block.transactions.length;
            container.innerHTML += `
                <div class="block-card glass-panel">
                    <div class="block-header">
                        <h4>Block #${block.index}</h4>
                        <span class="text-muted">${new Date(block.timestamp * 1000).toLocaleString()}</span>
                    </div>
                    <div class="block-detail">
                        <span class="hash-label">Hash:</span> ${block.hash}
                    </div>
                    <div class="block-detail">
                        <span class="hash-label">Prev:</span> ${block.previous_hash}
                    </div>
                    <div class="block-detail">
                        <span class="hash-label">Proof:</span> ${block.proof}
                    </div>
                    <div class="mt-2">
                        <span class="badge">${txCount} Transaction${txCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            `;
        });

        document.getElementById('btn-validate-chain').addEventListener('click', async () => {
            const valid = await Api.validateBlockchain();
            if(valid.valid) {
                showToast("Blockchain is Valid & Secure!");
            } else {
                alert("Blockchain validation failed! Chain might be corrupted.");
            }
        }, { once: true });
        
    } catch (err) {
        console.error("Error loading blockchain:", err);
    }
}
