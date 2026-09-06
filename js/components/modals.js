/**
 * TRYON Super Admin Panel - Modals Component
 * Implements Add/Edit Product, Create Order, Add Customer, Add Expense,
 * Add/Edit User, Global Search (⌘K), Delete Confirmation, and Demo Reset.
 */

(function () {
  const modalContainerId = 'app-modal-container';

  function getModalContainer() {
    let container = document.getElementById(modalContainerId);
    if (!container) {
      container = document.createElement('div');
      container.id = modalContainerId;
      document.body.appendChild(container);
    }
    return container;
  }

  function closeModal() {
    const container = getModalContainer();
    container.innerHTML = '';
  }

  // ===================== SEARCH MODAL (⌘ K) =====================
  function openSearchModal() {
    const container = getModalContainer();
    container.innerHTML = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4">
        <div class="bg-white rounded-2xl border border-[#EAECEE] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <!-- Search Header Input -->
          <div class="p-4 border-b border-[#F0F3F1] flex items-center space-x-3 bg-white">
            <i data-lucide="search" class="w-5 h-5 text-[#94A3B8]"></i>
            <input 
              id="search-modal-input" 
              type="text" 
              placeholder="Search products, orders, customers..." 
              class="w-full text-sm font-medium outline-none placeholder:text-[#94A3B8] text-[#111827]"
              autofocus
            />
            <button id="btn-close-search-modal" class="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200">
              ESC
            </button>
          </div>

          <!-- Search Results Area -->
          <div id="search-modal-results" class="max-h-96 overflow-y-auto p-4 space-y-4">
            <p class="text-xs text-[#94A3B8] text-center py-8">Type keywords to search across products, orders, and customers...</p>
          </div>

          <!-- Footer -->
          <div class="px-4 py-2.5 bg-[#F8F9FA] border-t border-[#F0F3F1] flex items-center justify-between text-[11px] text-[#94A3B8]">
            <div class="flex items-center space-x-3">
              <span>Navigate: <kbd class="bg-white border rounded px-1">↑</kbd> <kbd class="bg-white border rounded px-1">↓</kbd></span>
              <span>Select: <kbd class="bg-white border rounded px-1">↵</kbd></span>
            </div>
            <span>Press ESC to close</span>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const input = document.getElementById('search-modal-input');
    const resultsArea = document.getElementById('search-modal-results');
    const closeBtn = document.getElementById('btn-close-search-modal');

    if (input) {
      input.focus();
      input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (!query) {
          resultsArea.innerHTML = `<p class="text-xs text-[#94A3B8] text-center py-8">Type keywords to search across products, orders, and customers...</p>`;
          return;
        }

        const res = window.TryonStore.searchAll(query);
        const hasResults = res.products.length > 0 || res.orders.length > 0 || res.customers.length > 0;

        if (!hasResults) {
          resultsArea.innerHTML = `
            <div class="py-8 text-center">
              <div class="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2">
                <i data-lucide="search-x" class="w-5 h-5"></i>
              </div>
              <p class="text-xs font-semibold text-gray-700">No results found for "${query}"</p>
              <p class="text-[11px] text-gray-400 mt-0.5">Try searching with a different keyword</p>
            </div>
          `;
          if (window.lucide) window.lucide.createIcons();
          return;
        }

        let html = '';

        if (res.products.length > 0) {
          html += `<div><h5 class="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Products (${res.products.length})</h5><div class="space-y-1">`;
          res.products.forEach((p) => {
            const initials = (p.id.split('-')[1] || p.name.slice(0, 2)).toUpperCase();
            html += `
              <div class="search-item p-2 rounded-xl hover:bg-[#F3F6F4] flex items-center justify-between cursor-pointer" onclick="window.location.hash='#products'; window.TryonModals.close();">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg bg-[#E4EFE7] border border-[#CEEAD6] text-[#163326] flex items-center justify-center font-serif italic text-xs font-bold shrink-0">
                    ${initials}
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-[#111827]">${p.name}</p>
                    <p class="text-[11px] text-[#64748B]">${p.category} • ID: ${p.id}</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-[#163326] font-mono">Rs. ${p.price.toLocaleString()}</span>
              </div>
            `;
          });
          html += `</div></div>`;
        }

        if (res.orders.length > 0) {
          html += `<div class="pt-2"><h5 class="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Orders (${res.orders.length})</h5><div class="space-y-1">`;
          res.orders.forEach((o) => {
            html += `
              <div class="search-item p-2 rounded-xl hover:bg-[#F3F6F4] flex items-center justify-between cursor-pointer" onclick="window.location.hash='#orders'; window.TryonModals.close(); setTimeout(() => window.TryonOrderDrawer.open('${o.id}'), 150);">
                <div>
                  <p class="text-xs font-semibold text-[#111827]">Order #${o.id}</p>
                  <p class="text-[11px] text-[#64748B]">Customer: ${o.customer.name}</p>
                </div>
                <div class="text-right">
                  <span class="text-xs font-bold text-[#163326] block">$${o.total.toFixed(2)}</span>
                  <span class="text-[10px] text-gray-500">${o.status}</span>
                </div>
              </div>
            `;
          });
          html += `</div></div>`;
        }

        if (res.customers.length > 0) {
          html += `<div class="pt-2"><h5 class="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Customers (${res.customers.length})</h5><div class="space-y-1">`;
          res.customers.forEach((c) => {
            html += `
              <div class="search-item p-2 rounded-xl hover:bg-[#F3F6F4] flex items-center justify-between cursor-pointer" onclick="window.location.hash='#customers'; window.TryonModals.close();">
                <div>
                  <p class="text-xs font-semibold text-[#111827]">${c.name}</p>
                  <p class="text-[11px] text-[#64748B]">${c.email} • ${c.phone || 'No phone'}</p>
                </div>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">${c.ordersCount || 0} orders</span>
              </div>
            `;
          });
          html += `</div></div>`;
        }

        resultsArea.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Close on Escape or click outside
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        window.removeEventListener('keydown', handleKeydown);
      }
    };
    window.addEventListener('keydown', handleKeydown);
  }

  // ===================== ADD / EDIT PRODUCT MODAL =====================
  function openProductModal(productId = null) {
    const store = window.TryonStore;
    const isEdit = !!productId;
    const state = store.getState();
    const product = isEdit ? state.products.find((p) => p.id === productId) : null;
    const presets = store.presets;

    let selectedImageUrl = product ? product.image : presets[0].url;

    const container = getModalContainer();
    container.innerHTML = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl border border-[#EAECEE] shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
            <div>
              <h3 class="text-base font-bold text-[#111827]">${isEdit ? 'Edit Product' : 'Add New Product'}</h3>
              <p class="text-xs text-[#64748B] mt-0.5">${isEdit ? 'Update product information and inventory' : 'Enter product details to add to catalog'}</p>
            </div>
            <button id="btn-close-product-modal" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Form Body -->
          <form id="product-modal-form" class="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            <div id="product-form-error" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600"></div>

            <!-- Basic Info Section -->
            <div class="space-y-3.5">
              <h4 class="text-xs font-bold uppercase tracking-wider text-[#163326]">Product Information</h4>
              
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Product Name *</label>
                <input 
                  type="text" 
                  id="prod-name" 
                  required 
                  value="${product ? product.name : ''}"
                  placeholder="e.g. Classic Oversized Tee" 
                  class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Description</label>
                <textarea 
                  id="prod-description" 
                  rows="2" 
                  placeholder="Brief description of fabrics, cut, and fit..."
                  class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2 outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326]"
                >${product ? product.description : ''}</textarea>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-xs font-semibold text-[#374151] mb-1">Category *</label>
                  <select id="prod-category" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 bg-white outline-none focus:border-[#163326]">
                    <option value="Tees" ${product && product.category === 'Tees' ? 'selected' : ''}>Tees</option>
                    <option value="Jackets" ${product && product.category === 'Jackets' ? 'selected' : ''}>Jackets</option>
                    <option value="Hoodies" ${product && product.category === 'Hoodies' ? 'selected' : ''}>Hoodies</option>
                    <option value="Shirts" ${product && product.category === 'Shirts' ? 'selected' : ''}>Shirts</option>
                    <option value="Pants" ${product && product.category === 'Pants' ? 'selected' : ''}>Pants</option>
                    <option value="Dresses" ${product && product.category === 'Dresses' ? 'selected' : ''}>Dresses</option>
                    <option value="Knitwear" ${product && product.category === 'Knitwear' ? 'selected' : ''}>Knitwear</option>
                    <option value="Accessories" ${product && product.category === 'Accessories' ? 'selected' : ''}>Accessories</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-[#374151] mb-1">SKU</label>
                  <input 
                    type="text" 
                    id="prod-sku" 
                    value="${product ? product.sku : ''}"
                    placeholder="Auto-generated if blank (e.g. SKU-849201)" 
                    class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]"
                  />
                </div>
              </div>
            </div>

            <!-- Pricing & Inventory -->
            <div class="space-y-3.5 pt-3 border-t border-gray-100">
              <h4 class="text-xs font-bold uppercase tracking-wider text-[#163326]">Pricing & Stock</h4>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label class="block text-xs font-semibold text-[#374151] mb-1">Price ($) *</label>
                  <input 
                    type="number" 
                    id="prod-price" 
                    required 
                    min="0" 
                    step="0.01" 
                    value="${product ? product.price : ''}"
                    placeholder="49.00" 
                    class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-[#374151] mb-1">Sale Price ($)</label>
                  <input 
                    type="number" 
                    id="prod-sale-price" 
                    min="0" 
                    step="0.01" 
                    value="${product && product.salePrice ? product.salePrice : ''}"
                    placeholder="Optional (e.g. 39.00)" 
                    class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-[#374151] mb-1">Stock Quantity *</label>
                  <input 
                    type="number" 
                    id="prod-stock" 
                    required 
                    min="0" 
                    value="${product ? product.stock : '15'}"
                    placeholder="15" 
                    class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]"
                  />
                </div>
              </div>
            </div>

            <!-- Image Selection -->
            <div class="space-y-3.5 pt-3 border-t border-gray-100">
              <h4 class="text-xs font-bold uppercase tracking-wider text-[#163326]">Product Image</h4>

              <!-- Selected Image Preview -->
              <div class="flex items-center space-x-4">
                <img id="prod-preview-img" src="${selectedImageUrl}" class="w-16 h-16 rounded-xl object-cover border border-[#EAECEE] shadow-sm bg-gray-50" />
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-700 mb-1">Custom Image URL or Preset Below:</label>
                  <input 
                    type="url" 
                    id="prod-image-url" 
                    value="${selectedImageUrl}"
                    placeholder="https://..." 
                    class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3 py-1.5 outline-none focus:border-[#163326]"
                  />
                </div>
              </div>

              <!-- Presets Carousel / Grid -->
              <div>
                <span class="text-[11px] font-semibold text-gray-500 block mb-1.5">Or choose from TRYON Apparel Lookbook:</span>
                <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  ${presets
                    .map(
                      (preset, i) => `
                    <div class="preset-img-option cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageUrl === preset.url ? 'border-[#163326] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }" data-url="${preset.url}">
                      <img src="${preset.url}" title="${preset.name}" class="w-full h-12 object-cover" />
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            </div>

            <!-- Additional Details -->
            <div class="space-y-3.5 pt-3 border-t border-gray-100">
              <h4 class="text-xs font-bold uppercase tracking-wider text-[#163326]">Attributes</h4>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="block text-[11px] font-semibold text-[#475569] mb-1">Brand</label>
                  <input type="text" id="prod-brand" value="${product ? product.brand : 'TRYON'}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 outline-none" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-[#475569] mb-1">Sizes (comma-separated)</label>
                  <input type="text" id="prod-size" value="${product ? (Array.isArray(product.size) ? product.size.join(', ') : product.size) : 'S, M, L, XL'}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 outline-none" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-[#475569] mb-1">Color</label>
                  <input type="text" id="prod-color" value="${product ? product.color : 'Sage Green'}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 outline-none" />
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="pt-4 border-t border-[#F0F3F1] flex items-center justify-end space-x-3">
              <button type="button" id="btn-cancel-product-modal" class="px-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all shadow-sm">
                ${isEdit ? 'Save Changes' : 'Save Product'}
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event handlers
    const closeBtn = document.getElementById('btn-close-product-modal');
    const cancelBtn = document.getElementById('btn-cancel-product-modal');
    const form = document.getElementById('product-modal-form');
    const previewImg = document.getElementById('prod-preview-img');
    const imageUrlInput = document.getElementById('prod-image-url');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Preset selection
    document.querySelectorAll('.preset-img-option').forEach((el) => {
      el.addEventListener('click', (e) => {
        const url = e.currentTarget.getAttribute('data-url');
        selectedImageUrl = url;
        imageUrlInput.value = url;
        previewImg.src = url;

        document.querySelectorAll('.preset-img-option').forEach((opt) => {
          opt.classList.remove('border-[#163326]', 'scale-105');
          opt.classList.add('border-transparent', 'opacity-70');
        });
        e.currentTarget.classList.add('border-[#163326]', 'scale-105');
        e.currentTarget.classList.remove('border-transparent', 'opacity-70');
      });
    });

    if (imageUrlInput) {
      imageUrlInput.addEventListener('input', (e) => {
        selectedImageUrl = e.target.value;
        previewImg.src = e.target.value;
      });
    }

    // Submit handler
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('product-form-error');

        const name = document.getElementById('prod-name').value.trim();
        const price = parseFloat(document.getElementById('prod-price').value);
        const stock = parseInt(document.getElementById('prod-stock').value, 10);

        if (!name) {
          errorDiv.textContent = 'Please provide a valid product name.';
          errorDiv.classList.remove('hidden');
          return;
        }
        if (isNaN(price) || price < 0) {
          errorDiv.textContent = 'Please enter a valid price.';
          errorDiv.classList.remove('hidden');
          return;
        }
        if (isNaN(stock) || stock < 0) {
          errorDiv.textContent = 'Please enter a valid stock count.';
          errorDiv.classList.remove('hidden');
          return;
        }

        const data = {
          name: name,
          description: document.getElementById('prod-description').value,
          category: document.getElementById('prod-category').value,
          sku: document.getElementById('prod-sku').value,
          price: price,
          salePrice: document.getElementById('prod-sale-price').value || null,
          stock: stock,
          image: selectedImageUrl,
          brand: document.getElementById('prod-brand').value,
          size: document.getElementById('prod-size').value,
          color: document.getElementById('prod-color').value
        };

        if (isEdit) {
          store.updateProduct(productId, data);
          window.TryonApp.showToast(`Product "${name}" updated successfully.`, 'success');
        } else {
          store.addProduct(data);
          window.TryonApp.showToast(`Product "${name}" created and added to inventory.`, 'success');
        }

        closeModal();
      });
    }
  }

  // ===================== CREATE ORDER MODAL =====================
  function openOrderModal() {
    const store = window.TryonStore;
    const state = store.getState();

    if (state.products.length === 0) {
      window.TryonApp.showToast('Please add at least one product before creating an order.', 'warning');
      openProductModal();
      return;
    }

    let orderItems = [{ productId: state.products[0].id, quantity: 1, price: state.products[0].price }];
    let isCreatingNewCustomer = state.customers.length === 0;

    const container = getModalContainer();

    function renderOrderModalContent() {
      // Calculate totals
      let subtotal = 0;
      orderItems.forEach((item) => {
        const prod = state.products.find((p) => p.id === item.productId);
        const pPrice = prod ? (prod.salePrice || prod.price) : item.price;
        subtotal += pPrice * item.quantity;
      });

      container.innerHTML = `
        <div class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-2xl border border-[#EAECEE] shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            
            <!-- Header -->
            <div class="px-6 py-4 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
              <div>
                <h3 class="text-base font-bold text-[#111827]">Create New Order</h3>
                <p class="text-xs text-[#64748B] mt-0.5">Select customer and items to generate order</p>
              </div>
              <button id="btn-close-order-modal" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <!-- Form Body -->
            <form id="order-modal-form" class="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div id="order-form-error" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600"></div>

              <!-- Customer Section -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-[#163326]">Customer Information</h4>
                  ${
                    state.customers.length > 0
                      ? `<button type="button" id="btn-toggle-customer-mode" class="text-xs font-semibold text-[#163326] hover:underline">
                          ${isCreatingNewCustomer ? '← Select Existing Customer' : '+ Add New Customer'}
                        </button>`
                      : ''
                  }
                </div>

                ${
                  !isCreatingNewCustomer && state.customers.length > 0
                    ? `
                  <div>
                    <label class="block text-xs font-semibold text-[#374151] mb-1">Select Existing Customer *</label>
                    <select id="order-cust-select" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 bg-white outline-none focus:border-[#163326]">
                      ${state.customers
                        .map((c) => `<option value="${c.id}">${c.name} (${c.email})</option>`)
                        .join('')}
                    </select>
                  </div>
                `
                    : `
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-[#374151] mb-1">Customer Full Name *</label>
                      <input type="text" id="order-new-cust-name" required placeholder="e.g. Sarah Jenkins" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2 outline-none focus:border-[#163326]" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-[#374151] mb-1">Email Address *</label>
                      <input type="email" id="order-new-cust-email" required placeholder="sarah.jenkins@example.com" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2 outline-none focus:border-[#163326]" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-[#374151] mb-1">Phone Number</label>
                      <input type="tel" id="order-new-cust-phone" placeholder="+1 (555) 492-9182" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2 outline-none focus:border-[#163326]" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-[#374151] mb-1">Shipping Address</label>
                      <input type="text" id="order-new-cust-address" placeholder="742 Fashion Ave, NY" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2 outline-none focus:border-[#163326]" />
                    </div>
                  </div>
                `
                }
              </div>

              <!-- Order Items Section -->
              <div class="space-y-3 pt-3 border-t border-gray-100">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-[#163326]">Order Items</h4>
                  <button type="button" id="btn-add-item-row" class="text-xs font-semibold text-[#163326] hover:underline flex items-center space-x-1">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                    <span>Add Item</span>
                  </button>
                </div>

                <div class="space-y-2.5" id="order-items-list">
                  ${orderItems
                    .map((item, idx) => {
                      const prod = state.products.find((p) => p.id === item.productId) || state.products[0];
                      const price = prod.salePrice || prod.price;
                      return `
                      <div class="flex items-center space-x-3 p-2.5 rounded-xl border border-[#EAECEE] bg-[#FAFCFB]">
                        <div class="flex-1">
                          <select class="order-item-prod-select w-full text-xs rounded-lg border border-[#D1D5DB] px-2.5 py-2 bg-white" data-index="${idx}">
                            ${state.products
                              .map(
                                (p) => `
                              <option value="${p.id}" ${p.id === item.productId ? 'selected' : ''}>
                                ${p.name} ($${(p.salePrice || p.price).toFixed(2)}) — In Stock: ${p.stock}
                              </option>
                            `
                              )
                              .join('')}
                          </select>
                        </div>
                        <div class="w-20">
                          <input type="number" min="1" max="${prod.stock || 99}" value="${item.quantity}" class="order-item-qty-input w-full text-xs rounded-lg border border-[#D1D5DB] px-2.5 py-2 text-center" data-index="${idx}" />
                        </div>
                        <div class="w-20 text-right">
                          <span class="text-xs font-bold text-[#111827]">$${(price * item.quantity).toFixed(2)}</span>
                        </div>
                        ${
                          orderItems.length > 1
                            ? `
                          <button type="button" class="btn-remove-item text-gray-400 hover:text-red-500 p-1" data-index="${idx}">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                          </button>
                        `
                            : ''
                        }
                      </div>
                    `;
                    })
                    .join('')}
                </div>
              </div>

              <!-- Order Status & Discounts -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <label class="block text-xs font-semibold text-[#374151] mb-1">Order Status</label>
                  <select id="order-status" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 bg-white">
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[#374151] mb-1">Discount Amount ($)</label>
                  <input type="number" id="order-discount" min="0" step="0.01" value="0" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5" />
                </div>
              </div>

              <!-- Summary Card -->
              <div class="p-4 rounded-2xl bg-[#F8F9FA] border border-[#EAECEE] space-y-1.5 text-xs">
                <div class="flex justify-between text-[#64748B]">
                  <span>Subtotal</span>
                  <span id="order-summary-subtotal">$${subtotal.toFixed(2)}</span>
                </div>
                <div class="flex justify-between text-[#64748B]">
                  <span>Estimated Tax</span>
                  <span>$0.00</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-[#111827]">
                  <span>Total Due</span>
                  <span id="order-summary-total" class="text-[#163326]">$${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <!-- Footer Buttons -->
              <div class="pt-4 border-t border-[#F0F3F1] flex items-center justify-end space-x-3">
                <button type="button" id="btn-cancel-order-modal" class="px-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all shadow-sm">
                  Save Order
                </button>
              </div>

            </form>

          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Bind dynamic listeners
      document.getElementById('btn-close-order-modal')?.addEventListener('click', closeModal);
      document.getElementById('btn-cancel-order-modal')?.addEventListener('click', closeModal);

      const toggleCustBtn = document.getElementById('btn-toggle-customer-mode');
      if (toggleCustBtn) {
        toggleCustBtn.addEventListener('click', () => {
          isCreatingNewCustomer = !isCreatingNewCustomer;
          renderOrderModalContent();
        });
      }

      const addItemBtn = document.getElementById('btn-add-item-row');
      if (addItemBtn) {
        addItemBtn.addEventListener('click', () => {
          orderItems.push({ productId: state.products[0].id, quantity: 1, price: state.products[0].price });
          renderOrderModalContent();
        });
      }

      document.querySelectorAll('.btn-remove-item').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
          orderItems.splice(idx, 1);
          renderOrderModalContent();
        });
      });

      document.querySelectorAll('.order-item-prod-select').forEach((sel) => {
        sel.addEventListener('change', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'), 10);
          orderItems[idx].productId = e.target.value;
          renderOrderModalContent();
        });
      });

      document.querySelectorAll('.order-item-qty-input').forEach((inp) => {
        inp.addEventListener('input', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'), 10);
          orderItems[idx].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
          // update summary
          let st = 0;
          orderItems.forEach((it) => {
            const p = state.products.find((prod) => prod.id === it.productId);
            st += (p ? (p.salePrice || p.price) : 0) * it.quantity;
          });
          const disc = parseFloat(document.getElementById('order-discount')?.value) || 0;
          document.getElementById('order-summary-subtotal').textContent = `$${st.toFixed(2)}`;
          document.getElementById('order-summary-total').textContent = `$${Math.max(0, st - disc).toFixed(2)}`;
        });
      });

      document.getElementById('order-discount')?.addEventListener('input', (e) => {
        let st = 0;
        orderItems.forEach((it) => {
          const p = state.products.find((prod) => prod.id === it.productId);
          st += (p ? (p.salePrice || p.price) : 0) * it.quantity;
        });
        const disc = parseFloat(e.target.value) || 0;
        document.getElementById('order-summary-total').textContent = `$${Math.max(0, st - disc).toFixed(2)}`;
      });

      // Submit
      document.getElementById('order-modal-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const errDiv = document.getElementById('order-form-error');

        try {
          let customerId = null;
          let customerName = null;
          let customerEmail = null;
          let customerPhone = null;
          let customerAddress = null;

          if (!isCreatingNewCustomer && state.customers.length > 0) {
            customerId = document.getElementById('order-cust-select').value;
          } else {
            customerName = document.getElementById('order-new-cust-name').value.trim();
            customerEmail = document.getElementById('order-new-cust-email').value.trim();
            customerPhone = document.getElementById('order-new-cust-phone').value.trim();
            customerAddress = document.getElementById('order-new-cust-address').value.trim();

            if (!customerName || !customerEmail) {
              errDiv.textContent = 'Please provide customer name and email.';
              errDiv.classList.remove('hidden');
              return;
            }
          }

          const discount = parseFloat(document.getElementById('order-discount').value) || 0;
          const status = document.getElementById('order-status').value;

          const created = store.createOrder({
            customerId,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            items: orderItems,
            discount,
            status
          });

          window.TryonApp.showToast(`Order #${created.id} placed successfully!`, 'success');
          closeModal();
        } catch (err) {
          errDiv.textContent = err.message || 'Error creating order.';
          errDiv.classList.remove('hidden');
        }
      });
    }

    renderOrderModalContent();
  }

  // ===================== ADD / EDIT CUSTOMER MODAL =====================
  function openCustomerModal(customerId = null) {
    const store = window.TryonStore;
    const isEdit = !!customerId;
    const state = store.getState();
    const customer = isEdit ? state.customers.find((c) => c.id === customerId) : null;

    const container = getModalContainer();
    container.innerHTML = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-[#EAECEE] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
          
          <div class="px-6 py-4 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
            <div>
              <h3 class="text-base font-bold text-[#111827]">${isEdit ? 'Edit Customer' : 'Add New Customer'}</h3>
              <p class="text-xs text-[#64748B] mt-0.5">Manage customer contact details</p>
            </div>
            <button id="btn-close-customer-modal" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="customer-modal-form" class="p-6 space-y-4">
            <div id="customer-form-error" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600"></div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Full Name *</label>
              <input type="text" id="cust-name" required value="${customer ? customer.name : ''}" placeholder="e.g. Jessica Williams" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Email Address *</label>
              <input type="email" id="cust-email" required value="${customer ? customer.email : ''}" placeholder="jessica@example.com" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Phone Number</label>
              <input type="tel" id="cust-phone" value="${customer ? customer.phone : ''}" placeholder="+1 (555) 304-9821" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Shipping Address</label>
              <input type="text" id="cust-address" value="${customer ? customer.address : ''}" placeholder="128 Soho Broadway, New York, NY" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Status</label>
              <select id="cust-status" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 bg-white">
                <option value="Active" ${customer && customer.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Inactive" ${customer && customer.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
              </select>
            </div>

            <div class="pt-4 border-t border-[#F0F3F1] flex items-center justify-end space-x-3">
              <button type="button" id="btn-cancel-customer-modal" class="px-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219]">
                ${isEdit ? 'Update Customer' : 'Save Customer'}
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('btn-close-customer-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-customer-modal')?.addEventListener('click', closeModal);

    document.getElementById('customer-modal-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cust-name').value.trim();
      const email = document.getElementById('cust-email').value.trim();
      const phone = document.getElementById('cust-phone').value.trim();
      const address = document.getElementById('cust-address').value.trim();
      const status = document.getElementById('cust-status').value;

      if (!name || !email) return;

      if (isEdit) {
        store.updateCustomer(customerId, { name, email, phone, address, status });
        window.TryonApp.showToast(`Customer "${name}" updated.`, 'success');
      } else {
        store.addCustomer({ name, email, phone, address, status });
        window.TryonApp.showToast(`Customer "${name}" added.`, 'success');
      }
      closeModal();
    });
  }

  // ===================== ADD EXPENSE MODAL (FOR PROFIT & LOSS) =====================
  function openExpenseModal() {
    const store = window.TryonStore;
    const container = getModalContainer();

    container.innerHTML = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-[#EAECEE] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
          
          <div class="px-6 py-4 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
            <div>
              <h3 class="text-base font-bold text-[#111827]">Add Store Expense</h3>
              <p class="text-xs text-[#64748B] mt-0.5">Records costs to calculate Profit & Loss</p>
            </div>
            <button id="btn-close-expense-modal" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="expense-modal-form" class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Expense Title *</label>
              <input type="text" id="exp-name" required placeholder="e.g. Eco-friendly Packaging & Shipping" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Category *</label>
              <select id="exp-category" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 bg-white">
                <option value="Cost of Goods Sold">Cost of Goods Sold (COGS)</option>
                <option value="Operating Expenses">Operating Expenses</option>
                <option value="Marketing & Ads">Marketing & Ads</option>
                <option value="Logistics & Freight">Logistics & Freight</option>
                <option value="Utilities & Software">Utilities & Software</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Amount ($) *</label>
                <input type="number" id="exp-amount" min="0.01" step="0.01" required placeholder="125.00" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Date *</label>
                <input type="date" id="exp-date" value="${new Date().toISOString().split('T')[0]}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Description / Receipt Note</label>
              <textarea id="exp-desc" rows="2" placeholder="Optional notes..." class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2 outline-none"></textarea>
            </div>

            <div class="pt-4 border-t border-[#F0F3F1] flex items-center justify-end space-x-3">
              <button type="button" id="btn-cancel-expense-modal" class="px-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219]">
                Add Expense
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('btn-close-expense-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-expense-modal')?.addEventListener('click', closeModal);

    document.getElementById('expense-modal-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('exp-name').value.trim();
      const category = document.getElementById('exp-category').value;
      const amount = parseFloat(document.getElementById('exp-amount').value);
      const date = document.getElementById('exp-date').value;
      const description = document.getElementById('exp-desc').value;

      if (!name || isNaN(amount) || amount <= 0) return;

      store.addExpense({ name, category, amount, date, description });
      window.TryonApp.showToast(`Expense "$${amount.toFixed(2)}" added. P&L recalculated.`, 'success');
      closeModal();
    });
  }

  // ===================== ADD / EDIT USER MODAL (ADMIN ONLY) =====================
  function openUserModal(userId = null) {
    const store = window.TryonStore;
    const isEdit = !!userId;
    const state = store.getState();
    const user = isEdit ? state.users.find((u) => u.id === userId) : null;

    const container = getModalContainer();
    container.innerHTML = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-[#EAECEE] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
          
          <div class="px-6 py-4 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
            <div>
              <h3 class="text-base font-bold text-[#111827]">${isEdit ? 'Edit User Role' : 'Add New User'}</h3>
              <p class="text-xs text-[#64748B] mt-0.5">Manage administrative system credentials</p>
            </div>
            <button id="btn-close-user-modal" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <form id="user-modal-form" class="p-6 space-y-4">
            <!-- Modal Error Container -->
            <div id="user-form-error" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center space-x-2">
              <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
              <span id="user-form-error-text"></span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Full Name *</label>
              <input type="text" id="usr-name" required value="${user ? user.name : ''}" placeholder="e.g. Alex Morgan" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Email Address *</label>
              <input type="email" id="usr-email" required value="${user ? user.email : ''}" placeholder="alex@tryon.demo" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">${isEdit ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
              <input type="password" id="usr-password" ${isEdit ? '' : 'required'} placeholder="••••••••" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Role *</label>
                <select id="usr-role" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 bg-white">
                  <option value="Admin" ${user && user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                  <option value="Manager" ${user && user.role === 'Manager' ? 'selected' : ''}>Manager</option>
                  <option value="User" ${user && user.role === 'User' ? 'selected' : ''}>User</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Status</label>
                <select id="usr-status" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 bg-white">
                  <option value="Active" ${user && user.status === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Inactive" ${user && user.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>
              </div>
            </div>

            <div class="pt-4 border-t border-[#F0F3F1] flex items-center justify-end space-x-3">
              <button type="button" id="btn-cancel-user-modal" class="px-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219]">
                ${isEdit ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('btn-close-user-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-user-modal')?.addEventListener('click', closeModal);

    document.getElementById('user-modal-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('usr-name').value.trim();
      const email = document.getElementById('usr-email').value.trim();
      const password = document.getElementById('usr-password').value;
      const role = document.getElementById('usr-role').value;
      const status = document.getElementById('usr-status').value;
      const errorBox = document.getElementById('user-form-error');
      const errorText = document.getElementById('user-form-error-text');

      if (!name || !email) return;

      try {
        if (isEdit) {
          const updates = { name, email, role, status };
          if (password) updates.password = password;
          store.updateUser(userId, updates);
          window.TryonApp.showToast(`User "${name}" updated.`, 'success');
        } else {
          store.addUser({ name, email, password, role, status });
          window.TryonApp.showToast(`User "${name}" (${role}) created.`, 'success');
        }
        closeModal();
        window.TryonApp.renderRoute();
      } catch (err) {
        if (errorBox && errorText) {
          errorText.textContent = err.message;
          errorBox.classList.remove('hidden');
          if (window.lucide) window.lucide.createIcons();
        }
        window.TryonApp.showToast(err.message, 'error');
      }
    });
  }

  // ===================== DELETE CONFIRMATION MODAL =====================
  function openDeleteConfirm(title, message, onConfirm) {
    const container = getModalContainer();
    container.innerHTML = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-[#EAECEE] shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
          
          <div class="flex items-center space-x-3.5">
            <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <i data-lucide="alert-triangle" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-[#111827]">${title}</h3>
              <p class="text-xs text-[#64748B] mt-0.5">${message}</p>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button id="btn-cancel-delete" class="px-4 py-2 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button id="btn-confirm-delete" class="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-sm">
              Delete
            </button>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('btn-cancel-delete')?.addEventListener('click', closeModal);
    document.getElementById('btn-confirm-delete')?.addEventListener('click', () => {
      onConfirm();
      closeModal();
    });
  }

  // ===================== RESET DEMO DATA MODAL =====================
  function openResetDemoConfirm() {
    const container = getModalContainer();
    container.innerHTML = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl border border-[#EAECEE] shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
          
          <div class="flex items-start space-x-3.5">
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <i data-lucide="rotate-ccw" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-[#111827]">Reset Demo Data?</h3>
              <p class="text-xs text-[#64748B] mt-1 leading-relaxed">
                This will remove all products, customers, orders, expenses and other temporary demo data and return the application to its initial empty state.
              </p>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button id="btn-cancel-reset" class="px-4 py-2.5 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button id="btn-confirm-reset" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] shadow-sm">
              Reset Demo Data
            </button>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('btn-cancel-reset')?.addEventListener('click', closeModal);
    document.getElementById('btn-confirm-reset')?.addEventListener('click', () => {
      window.TryonStore.resetDemoData();
      window.TryonApp.showToast('Demo data reset back to pristine empty state.', 'info');
      closeModal();
      window.location.hash = '#dashboard';
      window.TryonApp.renderRoute();
    });
  }

  window.TryonModals = {
    close: closeModal,
    openSearchModal,
    openProductModal,
    openOrderModal,
    openCustomerModal,
    openExpenseModal,
    openUserModal,
    openDeleteConfirm,
    openResetDemoConfirm
  };
})();
