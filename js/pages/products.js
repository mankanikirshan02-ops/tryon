/**
 * TRYON Super Admin Panel - Products Page
 * Replicates Top-Center reference panel:
 * Search, Category/Status/Sort filters, Table with stock badges,
 * Pagination, CRUD triggers, and initial zero-data empty state.
 */

(function () {
  let searchQuery = '';
  let selectedCategory = 'all';
  let selectedStatus = 'all';
  let sortBy = 'newest';
  let selectedProductIds = new Set();
  let currentPage = 1;
  const itemsPerPage = 8;

  function render() {
    const store = window.TryonStore;
    const state = store.getState();
    let products = [...state.products];

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      products = products.filter((p) => p.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      products = products.filter((p) => p.status === selectedStatus);
    }

    // Apply sorting
    if (sortBy === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock-asc') {
      products.sort((a, b) => a.stock - b.stock);
    } else if (sortBy === 'name-asc') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }

    const totalCount = products.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

    return `
      <div class="space-y-6">
        
        <!-- Top Title & Add Button -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">Products</h1>
            <p class="text-xs sm:text-sm text-[#64748B] mt-0.5">Manage your product catalog</p>
          </div>

          <div class="flex items-center space-x-2.5">
            ${
              selectedProductIds.size > 0
                ? `
              <button id="btn-bulk-delete-products" class="px-3.5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all flex items-center space-x-1.5 shadow-sm">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
                <span>Delete Selected (${selectedProductIds.size})</span>
              </button>
            `
                : ''
            }
            <button id="btn-open-add-product" class="px-4 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all flex items-center space-x-2 shadow-sm">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add Product</span>
            </button>
          </div>
        </div>

        <!-- Filter Bar matching Reference -->
        <div class="tryon-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <!-- Search input -->
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3"></i>
            <input 
              type="text" 
              id="product-search-input" 
              placeholder="Search products..." 
              value="${searchQuery}"
              class="w-full text-xs rounded-xl border border-[#D1D5DB] pl-10 pr-3.5 py-2.5 outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326]"
            />
          </div>

          <!-- Dropdowns row -->
          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Category Filter -->
            <select id="product-category-filter" class="text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white outline-none focus:border-[#163326] text-[#475569]">
              <option value="all" ${selectedCategory === 'all' ? 'selected' : ''}>All Categories</option>
              <option value="Tees" ${selectedCategory === 'Tees' ? 'selected' : ''}>Tees</option>
              <option value="Jackets" ${selectedCategory === 'Jackets' ? 'selected' : ''}>Jackets</option>
              <option value="Hoodies" ${selectedCategory === 'Hoodies' ? 'selected' : ''}>Hoodies</option>
              <option value="Shirts" ${selectedCategory === 'Shirts' ? 'selected' : ''}>Shirts</option>
              <option value="Pants" ${selectedCategory === 'Pants' ? 'selected' : ''}>Pants</option>
              <option value="Dresses" ${selectedCategory === 'Dresses' ? 'selected' : ''}>Dresses</option>
              <option value="Knitwear" ${selectedCategory === 'Knitwear' ? 'selected' : ''}>Knitwear</option>
              <option value="Accessories" ${selectedCategory === 'Accessories' ? 'selected' : ''}>Accessories</option>
            </select>

            <!-- Status Filter -->
            <select id="product-status-filter" class="text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white outline-none focus:border-[#163326] text-[#475569]">
              <option value="all" ${selectedStatus === 'all' ? 'selected' : ''}>All Status</option>
              <option value="In Stock" ${selectedStatus === 'In Stock' ? 'selected' : ''}>In Stock</option>
              <option value="Low Stock" ${selectedStatus === 'Low Stock' ? 'selected' : ''}>Low Stock</option>
              <option value="Out of Stock" ${selectedStatus === 'Out of Stock' ? 'selected' : ''}>Out of Stock</option>
            </select>

            <!-- Sort Filter -->
            <select id="product-sort-filter" class="text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white outline-none focus:border-[#163326] text-[#475569]">
              <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Sort: Newest</option>
              <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
              <option value="stock-asc" ${sortBy === 'stock-asc' ? 'selected' : ''}>Stock: Low to High</option>
              <option value="name-asc" ${sortBy === 'name-asc' ? 'selected' : ''}>Name: A to Z</option>
            </select>
          </div>

        </div>

        <!-- Products Table -->
        <div class="tryon-card overflow-hidden">
          ${
            totalCount === 0
              ? `
            <!-- Refined Empty State -->
            <div class="p-16 text-center">
              <div class="w-16 h-16 rounded-2xl bg-[#F4F6F5] text-[#163326] flex items-center justify-center mx-auto mb-4">
                <i data-lucide="package-search" class="w-8 h-8"></i>
              </div>
              <h3 class="text-base font-bold text-[#111827]">No products found</h3>
              <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                ${
                  searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'No products matched your search or filter criteria. Try resetting filters.'
                    : 'Add your first product to start building your catalog.'
                }
              </p>
              <button id="btn-empty-add-product" class="mt-5 px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all inline-flex items-center space-x-2">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Add Product</span>
              </button>
            </div>
          `
              : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#F8F9FA] text-[#64748B] uppercase tracking-wider text-[10px] font-bold border-b border-[#EAECEE]">
                  <tr>
                    <th class="p-4 w-10 text-center">
                      <input type="checkbox" id="check-all-products" class="rounded text-[#163326] focus:ring-[#163326]" ${
                        selectedProductIds.size === paginatedProducts.length && paginatedProducts.length > 0 ? 'checked' : ''
                      }/>
                    </th>
                    <th class="px-4 py-3">Image</th>
                    <th class="px-4 py-3">Product Name</th>
                    <th class="px-4 py-3">Category</th>
                    <th class="px-4 py-3">Price</th>
                    <th class="px-4 py-3">Stock</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F1F5F9]">
                  ${paginatedProducts
                    .map((p) => {
                      const isChecked = selectedProductIds.has(p.id);
                      return `
                    <tr class="hover:bg-[#F8FAFC] transition-colors ${isChecked ? 'bg-[#F4F8F5]' : ''}">
                      <td class="p-4 text-center">
                        <input type="checkbox" class="product-row-check rounded text-[#163326] focus:ring-[#163326]" data-id="${p.id}" ${
                        isChecked ? 'checked' : ''
                      }/>
                      </td>
                      <td class="px-4 py-3">
                        <img src="${p.image}" alt="${p.name}" class="w-10 h-10 rounded-xl object-cover bg-gray-100 border border-[#EAECEE]" />
                      </td>
                      <td class="px-4 py-3">
                        <p class="font-bold text-[#111827]">${p.name}</p>
                        <p class="text-[10px] text-[#64748B] font-mono">SKU: ${p.sku}</p>
                      </td>
                      <td class="px-4 py-3 text-[#475569] font-medium">${p.category}</td>
                      <td class="px-4 py-3">
                        <div class="flex items-baseline space-x-1.5">
                          <span class="font-bold text-[#111827]">$${p.price.toFixed(2)}</span>
                          ${p.salePrice ? `<span class="text-[10px] line-through text-[#94A3B8]">$${p.salePrice.toFixed(2)}</span>` : ''}
                        </div>
                      </td>
                      <td class="px-4 py-3 font-semibold ${p.stock <= 5 && p.stock > 0 ? 'text-[#B06000]' : p.stock === 0 ? 'text-[#C5221F]' : 'text-[#111827]'}">
                        ${p.stock} units
                      </td>
                      <td class="px-4 py-3">
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          p.status === 'In Stock'
                            ? 'badge-in-stock'
                            : p.status === 'Low Stock'
                            ? 'badge-low-stock'
                            : 'badge-out-of-stock'
                        }">
                          ${p.status}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        <div class="inline-flex items-center space-x-1">
                          <button class="btn-edit-product p-1.5 rounded-lg text-gray-500 hover:text-[#163326] hover:bg-gray-100" title="Edit" data-id="${p.id}">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                          </button>
                          <button class="btn-delete-product p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50" title="Delete" data-id="${p.id}">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>

            <!-- Table Pagination Bar -->
            <div class="px-5 py-4 border-t border-[#F0F3F1] bg-[#FAFCFB] flex items-center justify-between text-xs text-[#64748B]">
              <span>
                Showing <strong class="text-[#111827]">${totalCount === 0 ? 0 : startIndex + 1}</strong> to <strong class="text-[#111827]">${Math.min(
                startIndex + itemsPerPage,
                totalCount
              )}</strong> of <strong class="text-[#111827]">${totalCount}</strong> products
              </span>

              <div class="flex items-center space-x-1.5">
                <button id="btn-prev-page" class="p-1.5 rounded-lg border border-[#D1D5DB] hover:bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed" ${
                  currentPage <= 1 ? 'disabled' : ''
                }>
                  <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                <span class="px-3 py-1 rounded-lg bg-[#163326] text-white font-bold text-xs">${currentPage}</span>
                <button id="btn-next-page" class="p-1.5 rounded-lg border border-[#D1D5DB] hover:bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed" ${
                  currentPage >= totalPages ? 'disabled' : ''
                }>
                  <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `
          }
        </div>

      </div>
    `;
  }

  function initEvents() {
    // Add product triggers
    document.getElementById('btn-open-add-product')?.addEventListener('click', () => {
      window.TryonModals.openProductModal();
    });

    document.getElementById('btn-empty-add-product')?.addEventListener('click', () => {
      window.TryonModals.openProductModal();
    });

    // Search filter
    const searchInput = document.getElementById('product-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        window.TryonApp.renderRoute();
      });
    }

    // Category filter
    document.getElementById('product-category-filter')?.addEventListener('change', (e) => {
      selectedCategory = e.target.value;
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // Status filter
    document.getElementById('product-status-filter')?.addEventListener('change', (e) => {
      selectedStatus = e.target.value;
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // Sort filter
    document.getElementById('product-sort-filter')?.addEventListener('change', (e) => {
      sortBy = e.target.value;
      window.TryonApp.renderRoute();
    });

    // Check all checkbox
    document.getElementById('check-all-products')?.addEventListener('change', (e) => {
      const state = window.TryonStore.getState();
      if (e.target.checked) {
        state.products.forEach((p) => selectedProductIds.add(p.id));
      } else {
        selectedProductIds.clear();
      }
      window.TryonApp.renderRoute();
    });

    // Row checkboxes
    document.querySelectorAll('.product-row-check').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.checked) selectedProductIds.add(id);
        else selectedProductIds.delete(id);
        window.TryonApp.renderRoute();
      });
    });

    // Bulk delete
    document.getElementById('btn-bulk-delete-products')?.addEventListener('click', () => {
      window.TryonModals.openDeleteConfirm(
        'Delete Selected Products?',
        `Are you sure you want to delete ${selectedProductIds.size} selected product(s)?`,
        () => {
          selectedProductIds.forEach((id) => window.TryonStore.deleteProduct(id));
          selectedProductIds.clear();
          window.TryonApp.showToast('Selected products deleted.', 'info');
          window.TryonApp.renderRoute();
        }
      );
    });

    // Edit product
    document.querySelectorAll('.btn-edit-product').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonModals.openProductModal(id);
      });
    });

    // Delete product
    document.querySelectorAll('.btn-delete-product').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const state = window.TryonStore.getState();
        const p = state.products.find((prod) => prod.id === id);
        window.TryonModals.openDeleteConfirm(
          'Delete Product?',
          `Are you sure you want to permanently delete "${p ? p.name : 'this product'}"?`,
          () => {
            window.TryonStore.deleteProduct(id);
            window.TryonApp.showToast('Product deleted.', 'info');
            window.TryonApp.renderRoute();
          }
        );
      });
    });

    // Pagination
    document.getElementById('btn-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        window.TryonApp.renderRoute();
      }
    });

    document.getElementById('btn-next-page')?.addEventListener('click', () => {
      currentPage++;
      window.TryonApp.renderRoute();
    });
  }

  window.TryonPageProducts = {
    render,
    initEvents
  };
})();
