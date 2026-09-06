/**
 * TRYON Super Admin Panel - Orders Page
 * Features Orders listing table with Order ID, Customer Name, Customer Phone, Date, Items, Total, Payment Method, Payment Status, Order Status, Actions.
 * Supports multi-field Search, multi-filters (Order Status, Payment Status, Payment Method, Date Range, City), Reset Filters,
 * Pagination, Sorting, Bulk selection & operations, and CSV Import/Export integration.
 */

(function () {
  let activeTab = 'All';
  let searchQuery = '';
  let paymentStatusFilter = 'all';
  let paymentMethodFilter = 'all';
  let dateFilter = 'all';
  let cityFilter = 'all';
  let sortBy = 'newest';
  let currentPage = 1;
  const itemsPerPage = 8;
  const selectedOrderIds = new Set();

  function resetFilters() {
    activeTab = 'All';
    searchQuery = '';
    paymentStatusFilter = 'all';
    paymentMethodFilter = 'all';
    dateFilter = 'all';
    cityFilter = 'all';
    sortBy = 'newest';
    currentPage = 1;
    selectedOrderIds.clear();
  }

  function getFilteredOrders() {
    const store = window.TryonStore;
    const state = store.getState();
    let orders = [...state.orders];

    // Status tab filter
    if (activeTab !== 'All') {
      orders = orders.filter((o) => (o.status || '').toLowerCase() === activeTab.toLowerCase());
    }

    // Payment Status filter
    if (paymentStatusFilter !== 'all') {
      orders = orders.filter((o) => (o.paymentStatus || 'Pending').toLowerCase() === paymentStatusFilter.toLowerCase());
    }

    // Payment Method filter
    if (paymentMethodFilter !== 'all') {
      orders = orders.filter((o) => (o.paymentMethod || 'Credit Card').toLowerCase() === paymentMethodFilter.toLowerCase());
    }

    // City filter
    if (cityFilter !== 'all') {
      orders = orders.filter((o) => {
        const city = o.customer && o.customer.city ? o.customer.city : '';
        return city.toLowerCase() === cityFilter.toLowerCase();
      });
    }

    // Search query filter (Order ID, Customer Name, Phone, Email)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      orders = orders.filter((o) => {
        const id = (o.id || '').toLowerCase();
        const name = (o.customer && o.customer.name ? o.customer.name : '').toLowerCase();
        const phone = (o.customer && o.customer.phone ? o.customer.phone : '').toLowerCase();
        const email = (o.customer && o.customer.email ? o.customer.email : '').toLowerCase();
        return id.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q);
      });
    }

    // Date range filter
    if (dateFilter !== 'all') {
      const now = new Date();
      if (dateFilter === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        orders = orders.filter((o) => o.date === todayStr);
      } else if (dateFilter === '7days') {
        const limitDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        orders = orders.filter((o) => new Date(o.createdAt || o.date) >= limitDate);
      } else if (dateFilter === '30days') {
        const limitDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        orders = orders.filter((o) => new Date(o.createdAt || o.date) >= limitDate);
      }
    }

    // Sorting
    if (sortBy === 'highest') {
      orders.sort((a, b) => b.total - a.total);
    } else if (sortBy === 'lowest') {
      orders.sort((a, b) => a.total - b.total);
    } else if (sortBy === 'oldest') {
      orders.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
    } else {
      orders.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    }

    return orders;
  }

  function render() {
    const store = window.TryonStore;
    const state = store.getState();
    const allOrders = state.orders;

    // Dynamically extract unique cities
    const citiesSet = new Set();
    allOrders.forEach((o) => {
      if (o.customer && o.customer.city) citiesSet.add(o.customer.city.trim());
    });
    const cities = Array.from(citiesSet).sort();

    const orders = getFilteredOrders();
    const totalCount = orders.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

    const tabs = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];
    const selectedCount = selectedOrderIds.size;
    const isAllOnPageSelected = paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedOrderIds.has(o.id));

    return `
      <div class="space-y-6">
        
        <!-- Top Header Title & Actions -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">Orders Management</h1>
            <p class="text-xs sm:text-sm text-[#64748B] mt-0.5">Track, process, import, and manage customer orders</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button id="btn-open-import-csv" class="px-3.5 py-2 rounded-xl bg-white border border-[#D1D5DB] text-[#374151] text-xs font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center space-x-2 shadow-xs">
              <i data-lucide="upload" class="w-4 h-4 text-[#163326]"></i>
              <span>Import CSV</span>
            </button>

            <button id="btn-open-export-csv" class="px-3.5 py-2 rounded-xl bg-white border border-[#D1D5DB] text-[#374151] text-xs font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center space-x-2 shadow-xs">
              <i data-lucide="download" class="w-4 h-4 text-[#163326]"></i>
              <span>Export CSV</span>
            </button>

            <button id="btn-open-create-order" class="px-4 py-2 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all flex items-center space-x-2 shadow-sm">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Create Order</span>
            </button>
          </div>
        </div>

        <!-- Order Lifecycle Status Tabs -->
        <div class="flex items-center space-x-1.5 overflow-x-auto border-b border-[#EAECEE] pb-2 scrollbar-none">
          ${tabs
            .map((tab) => {
              const count =
                tab === 'All'
                  ? allOrders.length
                  : allOrders.filter((o) => (o.status || '').toLowerCase() === tab.toLowerCase()).length;
              return `
              <button class="order-status-tab px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#163326] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F3F6F4]'
              }" data-tab="${tab}">
                ${tab}
                <span class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-[#EAECEE] text-[#64748B]'
                }">${count}</span>
              </button>
            `;
            })
            .join('')}
        </div>

        <!-- Filter & Search Bar -->
        <div class="tryon-card p-4 space-y-3">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            <!-- Multi-field Search -->
            <div class="relative sm:col-span-2">
              <i data-lucide="search" class="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-2.5"></i>
              <input 
                type="text" 
                id="order-search-input" 
                placeholder="Search by ID, Customer, Phone, Email..." 
                value="${searchQuery}"
                class="w-full text-xs rounded-xl border border-[#D1D5DB] pl-10 pr-3 py-2 outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326]"
              />
            </div>

            <!-- Payment Status Filter -->
            <div>
              <select id="order-payment-status-filter" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white outline-none focus:border-[#163326] text-[#475569]">
                <option value="all" ${paymentStatusFilter === 'all' ? 'selected' : ''}>Payment Status: All</option>
                <option value="Pending" ${paymentStatusFilter === 'Pending' ? 'selected' : ''}>Payment: Pending</option>
                <option value="Paid" ${paymentStatusFilter === 'Paid' ? 'selected' : ''}>Payment: Paid</option>
                <option value="Failed" ${paymentStatusFilter === 'Failed' ? 'selected' : ''}>Payment: Failed</option>
                <option value="Refunded" ${paymentStatusFilter === 'Refunded' ? 'selected' : ''}>Payment: Refunded</option>
              </select>
            </div>

            <!-- Payment Method Filter -->
            <div>
              <select id="order-payment-method-filter" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white outline-none focus:border-[#163326] text-[#475569]">
                <option value="all" ${paymentMethodFilter === 'all' ? 'selected' : ''}>Payment Method: All</option>
                <option value="Credit Card" ${paymentMethodFilter === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                <option value="Cash on Delivery" ${paymentMethodFilter === 'Cash on Delivery' ? 'selected' : ''}>Cash on Delivery</option>
                <option value="PayPal" ${paymentMethodFilter === 'PayPal' ? 'selected' : ''}>PayPal</option>
                <option value="Bank Transfer" ${paymentMethodFilter === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
              </select>
            </div>

            <!-- Date Range Filter -->
            <div>
              <select id="order-date-filter" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white outline-none focus:border-[#163326] text-[#475569]">
                <option value="all" ${dateFilter === 'all' ? 'selected' : ''}>Date Range: All</option>
                <option value="today" ${dateFilter === 'today' ? 'selected' : ''}>Today</option>
                <option value="7days" ${dateFilter === '7days' ? 'selected' : ''}>Last 7 Days</option>
                <option value="30days" ${dateFilter === '30days' ? 'selected' : ''}>Last 30 Days</option>
              </select>
            </div>

          </div>

          <!-- Second Filter Row & Controls -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F0F3F1]">
            <div class="flex flex-wrap items-center gap-2">
              
              <!-- City Filter -->
              <select id="order-city-filter" class="text-xs rounded-xl border border-[#D1D5DB] px-3 py-1.5 bg-white outline-none focus:border-[#163326] text-[#475569]">
                <option value="all" ${cityFilter === 'all' ? 'selected' : ''}>City: All</option>
                ${cities.map((c) => `<option value="${c}" ${cityFilter.toLowerCase() === c.toLowerCase() ? 'selected' : ''}>${c}</option>`).join('')}
              </select>

              <!-- Sorting -->
              <select id="order-sort-filter" class="text-xs rounded-xl border border-[#D1D5DB] px-3 py-1.5 bg-white outline-none focus:border-[#163326] text-[#475569]">
                <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Sort: Newest First</option>
                <option value="highest" ${sortBy === 'highest' ? 'selected' : ''}>Total: High to Low</option>
                <option value="lowest" ${sortBy === 'lowest' ? 'selected' : ''}>Total: Low to High</option>
                <option value="oldest" ${sortBy === 'oldest' ? 'selected' : ''}>Sort: Oldest First</option>
              </select>

              <!-- Reset Filters Button -->
              ${
                activeTab !== 'All' || searchQuery || paymentStatusFilter !== 'all' || paymentMethodFilter !== 'all' || dateFilter !== 'all' || cityFilter !== 'all'
                  ? `
                <button id="btn-reset-filters" class="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-all flex items-center space-x-1">
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                  <span>Reset Filters</span>
                </button>
              `
                  : ''
              }
            </div>

            <div class="text-xs text-[#64748B]">
              Showing <strong class="text-[#111827]">${totalCount}</strong> order(s)
            </div>
          </div>

        </div>

        <!-- Floating Bulk Action Bar -->
        ${
          selectedCount > 0
            ? `
          <div class="p-3.5 rounded-2xl bg-[#163326] text-white flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div class="flex items-center space-x-3 text-xs">
              <span class="px-2.5 py-1 rounded-lg bg-white/20 font-bold">${selectedCount} Selected</span>
              <span class="text-white/80 hidden sm:inline">Perform bulk operations on selected orders:</span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <select id="bulk-status-select" class="text-xs rounded-xl border border-white/20 bg-white/10 text-white px-3 py-1.5 outline-none focus:ring-1 focus:ring-white">
                <option value="" class="text-gray-800">-- Bulk Change Status --</option>
                <option value="Pending" class="text-gray-800">Pending</option>
                <option value="Confirmed" class="text-gray-800">Confirmed</option>
                <option value="Processing" class="text-gray-800">Processing</option>
                <option value="Shipped" class="text-gray-800">Shipped</option>
                <option value="Delivered" class="text-gray-800">Delivered</option>
                <option value="Cancelled" class="text-gray-800">Cancelled</option>
                <option value="Returned" class="text-gray-800">Returned</option>
                <option value="Refunded" class="text-gray-800">Refunded</option>
              </select>

              <button id="btn-bulk-cancel" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-all">
                Cancel Selected
              </button>

              <button id="btn-bulk-export" class="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-all flex items-center space-x-1">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Export Selected</span>
              </button>

              <button id="btn-clear-selection" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all">
                Deselect All
              </button>
            </div>
          </div>
        `
            : ''
        }

        <!-- Orders Table Card -->
        <div class="tryon-card overflow-hidden">
          ${
            totalCount === 0
              ? `
            <div class="p-16 text-center">
              <div class="w-16 h-16 rounded-2xl bg-[#F4F6F5] text-[#163326] flex items-center justify-center mx-auto mb-4">
                <i data-lucide="shopping-bag" class="w-8 h-8"></i>
              </div>
              <h3 class="text-base font-bold text-[#111827]">No orders found</h3>
              <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                ${
                  searchQuery || activeTab !== 'All' || paymentStatusFilter !== 'all' || paymentMethodFilter !== 'all' || dateFilter !== 'all' || cityFilter !== 'all'
                    ? 'No orders matched your selected filters.'
                    : 'Orders will appear here when placed or imported.'
                }
              </p>
              <div class="mt-5 flex items-center justify-center space-x-3">
                ${
                  searchQuery || activeTab !== 'All' || paymentStatusFilter !== 'all'
                    ? `<button id="btn-empty-reset-filters" class="px-4 py-2 rounded-xl bg-white border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50">Reset Filters</button>`
                    : ''
                }
                <button id="btn-empty-create-order" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all inline-flex items-center space-x-2 shadow-sm">
                  <i data-lucide="plus" class="w-4 h-4"></i>
                  <span>Create First Order</span>
                </button>
              </div>
            </div>
          `
              : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#F8F9FA] text-[#64748B] uppercase tracking-wider text-[10px] font-bold border-b border-[#EAECEE]">
                  <tr>
                    <th class="px-4 py-3 w-10 text-center">
                      <input type="checkbox" id="select-all-orders" ${isAllOnPageSelected ? 'checked' : ''} class="rounded border-gray-300 text-[#163326] focus:ring-[#163326]" />
                    </th>
                    <th class="px-4 py-3">Order ID</th>
                    <th class="px-4 py-3">Customer</th>
                    <th class="px-4 py-3">Date</th>
                    <th class="px-4 py-3 text-center">Items</th>
                    <th class="px-4 py-3">Payment</th>
                    <th class="px-4 py-3">Payment Status</th>
                    <th class="px-4 py-3">Order Status</th>
                    <th class="px-4 py-3">Total Amount</th>
                    <th class="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F1F5F9]">
                  ${paginatedOrders
                    .map((order) => {
                      const isChecked = selectedOrderIds.has(order.id);
                      const customerName = order.customer ? order.customer.name : 'Unknown';
                      const customerPhone = order.customer ? (order.customer.phone || 'N/A') : 'N/A';
                      const customerEmail = order.customer ? (order.customer.email || '') : '';
                      const itemsCount = Array.isArray(order.items) ? order.items.length : 0;
                      const pMethod = order.paymentMethod || 'Credit Card';
                      const pStatus = order.paymentStatus || 'Pending';
                      const oStatus = order.status || 'Pending';

                      let oBadgeClass = 'badge-pending';
                      if (oStatus === 'Delivered') oBadgeClass = 'badge-[#e6f4ea] badge-delivered';
                      else if (oStatus === 'Processing') oBadgeClass = 'badge-processing';
                      else if (oStatus === 'Shipped') oBadgeClass = 'badge-shipped';
                      else if (oStatus === 'Confirmed') oBadgeClass = 'badge-confirmed';
                      else if (oStatus === 'Returned') oBadgeClass = 'badge-returned';
                      else if (oStatus === 'Refunded') oBadgeClass = 'badge-refunded';
                      else if (oStatus === 'Cancelled') oBadgeClass = 'badge-cancelled';

                      let pBadgeClass = 'badge-unpaid';
                      if (pStatus === 'Paid') pBadgeClass = 'badge-paid';
                      else if (pStatus === 'Failed' || pStatus === 'Refunded') pBadgeClass = 'badge-failed';

                      return `
                      <tr class="hover:bg-[#F8FAFC] transition-colors cursor-pointer ${isChecked ? 'bg-emerald-50/50' : ''}" onclick="window.TryonOrderDrawer.open('${order.id}')">
                        <td class="px-4 py-3.5 text-center" onclick="event.stopPropagation()">
                          <input type="checkbox" class="order-row-checkbox rounded border-gray-300 text-[#163326] focus:ring-[#163326]" data-id="${order.id}" ${isChecked ? 'checked' : ''} />
                        </td>
                        <td class="px-4 py-3.5 font-bold text-[#163326] whitespace-nowrap">#${order.id}</td>
                        <td class="px-4 py-3.5">
                          <p class="font-bold text-[#111827]">${customerName}</p>
                          <p class="text-[11px] text-[#64748B]">${customerPhone} ${customerEmail ? `• ${customerEmail}` : ''}</p>
                        </td>
                        <td class="px-4 py-3.5 text-[#64748B] whitespace-nowrap">${order.date}</td>
                        <td class="px-4 py-3.5 text-center text-[#475569] font-medium">${itemsCount} item(s)</td>
                        <td class="px-4 py-3.5 text-[#475569] whitespace-nowrap">${pMethod}</td>
                        <td class="px-4 py-3.5 whitespace-nowrap">
                          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${pBadgeClass}">
                            ${pStatus}
                          </span>
                        </td>
                        <td class="px-4 py-3.5 whitespace-nowrap">
                          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${oBadgeClass}">
                            ${oStatus}
                          </span>
                        </td>
                        <td class="px-4 py-3.5 font-bold text-[#111827] whitespace-nowrap">$${order.total.toFixed(2)}</td>
                        <td class="px-4 py-3.5 text-right whitespace-nowrap" onclick="event.stopPropagation()">
                          <div class="inline-flex items-center space-x-1">
                            <button class="btn-view-order p-1.5 rounded-lg text-gray-500 hover:text-[#163326] hover:bg-gray-100" title="View Order Details" data-id="${order.id}">
                              <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                            ${
                              oStatus !== 'Cancelled' && oStatus !== 'Delivered'
                                ? `<button class="btn-cancel-single-order p-1.5 rounded-lg text-amber-600 hover:bg-amber-50" title="Cancel Order" data-id="${order.id}">
                                    <i data-lucide="ban" class="w-4 h-4"></i>
                                  </button>`
                                : ''
                            }
                            <button class="btn-delete-order p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50" title="Delete Order" data-id="${order.id}">
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
            <div class="px-5 py-4 border-t border-[#F0F3F1] bg-[#FAFCFB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
              <span>
                Showing <strong class="text-[#111827]">${totalCount === 0 ? 0 : startIndex + 1}</strong> to <strong class="text-[#111827]">${Math.min(
                startIndex + itemsPerPage,
                totalCount
              )}</strong> of <strong class="text-[#111827]">${totalCount}</strong> orders
              </span>

              <div class="flex items-center space-x-1.5">
                <button id="btn-prev-order-page" class="p-1.5 rounded-lg border border-[#D1D5DB] hover:bg-white text-gray-600 disabled:opacity-40" ${
                  currentPage <= 1 ? 'disabled' : ''
                }>
                  <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                <span class="px-3 py-1 rounded-lg bg-[#163326] text-white font-bold text-xs">Page ${currentPage} of ${totalPages}</span>
                <button id="btn-next-order-page" class="p-1.5 rounded-lg border border-[#D1D5DB] hover:bg-white text-gray-600 disabled:opacity-40" ${
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
    // Status tab switching
    document.querySelectorAll('.order-status-tab').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.getAttribute('data-tab');
        currentPage = 1;
        window.TryonApp.renderRoute();
      });
    });

    // Top action triggers
    document.getElementById('btn-open-import-csv')?.addEventListener('click', () => {
      window.TryonModals.openCsvImportModal();
    });

    document.getElementById('btn-open-export-csv')?.addEventListener('click', () => {
      const ordersToExport = getFilteredOrders();
      window.TryonModals.openExportModal(ordersToExport);
    });

    document.getElementById('btn-open-create-order')?.addEventListener('click', () => {
      window.TryonModals.openOrderModal();
    });

    document.getElementById('btn-empty-create-order')?.addEventListener('click', () => {
      window.TryonModals.openOrderModal();
    });

    document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
      resetFilters();
      window.TryonApp.renderRoute();
    });

    document.getElementById('btn-empty-reset-filters')?.addEventListener('click', () => {
      resetFilters();
      window.TryonApp.renderRoute();
    });

    // Search input
    document.getElementById('order-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // Payment status filter
    document.getElementById('order-payment-status-filter')?.addEventListener('change', (e) => {
      paymentStatusFilter = e.target.value;
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // Payment method filter
    document.getElementById('order-payment-method-filter')?.addEventListener('change', (e) => {
      paymentMethodFilter = e.target.value;
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // Date range filter
    document.getElementById('order-date-filter')?.addEventListener('change', (e) => {
      dateFilter = e.target.value;
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // City filter
    document.getElementById('order-city-filter')?.addEventListener('change', (e) => {
      cityFilter = e.target.value;
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // Sort filter
    document.getElementById('order-sort-filter')?.addEventListener('change', (e) => {
      sortBy = e.target.value;
      window.TryonApp.renderRoute();
    });

    // Checkbox selections
    document.getElementById('select-all-orders')?.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const filtered = getFilteredOrders();
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

      paginated.forEach((o) => {
        if (isChecked) selectedOrderIds.add(o.id);
        else selectedOrderIds.delete(o.id);
      });
      window.TryonApp.renderRoute();
    });

    document.querySelectorAll('.order-row-checkbox').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (e.target.checked) selectedOrderIds.add(id);
        else selectedOrderIds.delete(id);
        window.TryonApp.renderRoute();
      });
    });

    // Bulk actions
    document.getElementById('btn-clear-selection')?.addEventListener('click', () => {
      selectedOrderIds.clear();
      window.TryonApp.renderRoute();
    });

    document.getElementById('bulk-status-select')?.addEventListener('change', (e) => {
      const newStatus = e.target.value;
      if (!newStatus || selectedOrderIds.size === 0) return;

      const ids = Array.from(selectedOrderIds);
      window.TryonModals.openDeleteConfirm(
        'Confirm Bulk Status Update',
        `Are you sure you want to update ${ids.length} selected order(s) to "${newStatus}"?`,
        () => {
          const res = window.TryonStore.bulkUpdateOrderStatus(ids, newStatus, true);
          window.TryonApp.showToast(`Updated ${res.updatedCount} order(s) to ${newStatus}.`, 'success');
          selectedOrderIds.clear();
          window.TryonApp.renderRoute();
        }
      );
    });

    document.getElementById('btn-bulk-cancel')?.addEventListener('click', () => {
      if (selectedOrderIds.size === 0) return;
      const ids = Array.from(selectedOrderIds);
      window.TryonModals.openDeleteConfirm(
        'Cancel Selected Orders?',
        `Are you sure you want to cancel ${ids.length} selected order(s)? This action will update order status to Cancelled.`,
        () => {
          const res = window.TryonStore.bulkUpdateOrderStatus(ids, 'Cancelled', true);
          window.TryonApp.showToast(`Cancelled ${res.updatedCount} order(s).`, 'warning');
          selectedOrderIds.clear();
          window.TryonApp.renderRoute();
        }
      );
    });

    document.getElementById('btn-bulk-export')?.addEventListener('click', () => {
      const store = window.TryonStore;
      const state = store.getState();
      const selectedOrders = state.orders.filter((o) => selectedOrderIds.has(o.id));
      window.TryonModals.openExportModal(selectedOrders);
    });

    // Row Actions
    document.querySelectorAll('.btn-view-order').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonOrderDrawer.open(id);
      });
    });

    document.querySelectorAll('.btn-cancel-single-order').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonModals.openDeleteConfirm(
          'Cancel Order?',
          `Are you sure you want to cancel Order #${id}?`,
          () => {
            try {
              window.TryonStore.updateOrderStatus(id, 'Cancelled');
              window.TryonApp.showToast(`Order #${id} cancelled.`, 'warning');
              window.TryonApp.renderRoute();
            } catch (err) {
              window.TryonApp.showToast(err.message, 'error');
            }
          }
        );
      });
    });

    document.querySelectorAll('.btn-delete-order').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonModals.openDeleteConfirm(
          'Delete Order Permanently?',
          `Are you sure you want to permanently delete order #${id}? This will remove order records and update metrics.`,
          () => {
            window.TryonStore.deleteOrder(id);
            selectedOrderIds.delete(id);
            window.TryonApp.showToast(`Order #${id} deleted.`, 'info');
            window.TryonApp.renderRoute();
          }
        );
      });
    });

    // Pagination buttons
    document.getElementById('btn-prev-order-page')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        window.TryonApp.renderRoute();
      }
    });

    document.getElementById('btn-next-order-page')?.addEventListener('click', () => {
      currentPage++;
      window.TryonApp.renderRoute();
    });
  }

  window.TryonPageOrders = {
    render,
    initEvents,
    resetFilters
  };
})();
