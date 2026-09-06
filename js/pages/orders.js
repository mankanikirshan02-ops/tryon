/**
 * TRYON Super Admin Panel - Orders Page
 * Replicates Top-Right reference panel:
 * Status tabs (All, Pending, Processing, Shipped, Delivered, Cancelled),
 * Search & date filters, table with status badges, and Order Details drawer trigger.
 */

(function () {
  let activeTab = 'All';
  let searchQuery = '';
  let dateFilter = 'all';
  let sortBy = 'newest';
  let currentPage = 1;
  const itemsPerPage = 8;

  function render() {
    const store = window.TryonStore;
    const state = store.getState();
    let orders = [...state.orders];

    // Status tab filter
    if (activeTab !== 'All') {
      orders = orders.filter((o) => o.status.toLowerCase() === activeTab.toLowerCase());
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      orders = orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.customer && o.customer.name.toLowerCase().includes(q)) ||
          (o.customer && o.customer.email.toLowerCase().includes(q))
      );
    }

    // Date filter
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      orders = orders.filter((o) => o.date === today);
    }

    // Sorting
    if (sortBy === 'highest') {
      orders.sort((a, b) => b.total - a.total);
    } else if (sortBy === 'lowest') {
      orders.sort((a, b) => a.total - b.total);
    } else if (sortBy === 'oldest') {
      orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const totalCount = orders.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

    const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    return `
      <div class="space-y-6">
        
        <!-- Top Title & Action -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">Orders</h1>
            <p class="text-xs sm:text-sm text-[#64748B] mt-0.5">View and manage customer orders</p>
          </div>

          <button id="btn-open-create-order" class="px-4 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all flex items-center space-x-2 shadow-sm">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Create Order</span>
          </button>
        </div>

        <!-- Status Tabs matching reference design -->
        <div class="flex items-center space-x-1.5 overflow-x-auto border-b border-[#EAECEE] pb-2">
          ${tabs
            .map((tab) => {
              const count =
                tab === 'All'
                  ? state.orders.length
                  : state.orders.filter((o) => o.status.toLowerCase() === tab.toLowerCase()).length;
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

        <!-- Filter Bar -->
        <div class="tryon-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3"></i>
            <input 
              type="text" 
              id="order-search-input" 
              placeholder="Search orders, customers..." 
              value="${searchQuery}"
              class="w-full text-xs rounded-xl border border-[#D1D5DB] pl-10 pr-3.5 py-2.5 outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326]"
            />
          </div>

          <div class="flex items-center space-x-2.5">
            <select id="order-date-filter" class="text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white outline-none focus:border-[#163326] text-[#475569]">
              <option value="all" ${dateFilter === 'all' ? 'selected' : ''}>All Dates</option>
              <option value="today" ${dateFilter === 'today' ? 'selected' : ''}>Today</option>
            </select>

            <select id="order-sort-filter" class="text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white outline-none focus:border-[#163326] text-[#475569]">
              <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Sort: Newest</option>
              <option value="highest" ${sortBy === 'highest' ? 'selected' : ''}>Total: High to Low</option>
              <option value="lowest" ${sortBy === 'lowest' ? 'selected' : ''}>Total: Low to High</option>
              <option value="oldest" ${sortBy === 'oldest' ? 'selected' : ''}>Sort: Oldest</option>
            </select>
          </div>

        </div>

        <!-- Orders Table -->
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
                  searchQuery || activeTab !== 'All'
                    ? 'No orders matched your active tab or search filters.'
                    : 'Orders will appear here when customers complete checkout.'
                }
              </p>
              <button id="btn-empty-create-order" class="mt-5 px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all inline-flex items-center space-x-2">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Create First Order</span>
              </button>
            </div>
          `
              : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#F8F9FA] text-[#64748B] uppercase tracking-wider text-[10px] font-bold border-b border-[#EAECEE]">
                  <tr>
                    <th class="px-5 py-3">Order #</th>
                    <th class="px-5 py-3">Customer</th>
                    <th class="px-5 py-3">Date</th>
                    <th class="px-5 py-3">Items</th>
                    <th class="px-5 py-3">Status</th>
                    <th class="px-5 py-3">Total</th>
                    <th class="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F1F5F9]">
                  ${paginatedOrders
                    .map(
                      (order) => `
                    <tr class="hover:bg-[#F8FAFC] transition-colors cursor-pointer" onclick="window.TryonOrderDrawer.open('${order.id}')">
                      <td class="px-5 py-3.5 font-bold text-[#163326]">#${order.id}</td>
                      <td class="px-5 py-3.5">
                        <p class="font-bold text-[#111827]">${order.customer.name}</p>
                        <p class="text-[11px] text-[#64748B]">${order.customer.email}</p>
                      </td>
                      <td class="px-5 py-3.5 text-[#64748B]">${order.date}</td>
                      <td class="px-5 py-3.5 text-[#475569] font-medium">${order.items.length} item(s)</td>
                      <td class="px-5 py-3.5">
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          order.status === 'Delivered'
                            ? 'badge-delivered'
                            : order.status === 'Pending'
                            ? 'badge-pending'
                            : order.status === 'Processing'
                            ? 'badge-processing'
                            : order.status === 'Shipped'
                            ? 'badge-shipped'
                            : 'badge-cancelled'
                        }">
                          ${order.status}
                        </span>
                      </td>
                      <td class="px-5 py-3.5 font-bold text-[#111827]">$${order.total.toFixed(2)}</td>
                      <td class="px-5 py-3.5 text-right" onclick="event.stopPropagation()">
                        <div class="inline-flex items-center space-x-1">
                          <button class="btn-view-order p-1.5 rounded-lg text-gray-500 hover:text-[#163326] hover:bg-gray-100" title="View Details" data-id="${order.id}">
                            <i data-lucide="eye" class="w-4 h-4"></i>
                          </button>
                          <button class="btn-delete-order p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50" title="Delete Order" data-id="${order.id}">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `
                    )
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
              )}</strong> of <strong class="text-[#111827]">${totalCount}</strong> orders
              </span>

              <div class="flex items-center space-x-1.5">
                <button id="btn-prev-order-page" class="p-1.5 rounded-lg border border-[#D1D5DB] hover:bg-white text-gray-600 disabled:opacity-40" ${
                  currentPage <= 1 ? 'disabled' : ''
                }>
                  <i data-lucide="chevron-left" class="w-4 h-4"></i>
                </button>
                <span class="px-3 py-1 rounded-lg bg-[#163326] text-white font-bold text-xs">${currentPage}</span>
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
    // Tab switching
    document.querySelectorAll('.order-status-tab').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.getAttribute('data-tab');
        currentPage = 1;
        window.TryonApp.renderRoute();
      });
    });

    // Create Order button
    document.getElementById('btn-open-create-order')?.addEventListener('click', () => {
      window.TryonModals.openOrderModal();
    });

    document.getElementById('btn-empty-create-order')?.addEventListener('click', () => {
      window.TryonModals.openOrderModal();
    });

    // Search input
    document.getElementById('order-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // Date filter
    document.getElementById('order-date-filter')?.addEventListener('change', (e) => {
      dateFilter = e.target.value;
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // Sort filter
    document.getElementById('order-sort-filter')?.addEventListener('change', (e) => {
      sortBy = e.target.value;
      window.TryonApp.renderRoute();
    });

    // View Order drawer trigger
    document.querySelectorAll('.btn-view-order').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonOrderDrawer.open(id);
      });
    });

    // Delete Order
    document.querySelectorAll('.btn-delete-order').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonModals.openDeleteConfirm(
          'Delete Order?',
          `Are you sure you want to delete order #${id}?`,
          () => {
            window.TryonStore.deleteOrder(id);
            window.TryonApp.showToast('Order removed.', 'info');
            window.TryonApp.renderRoute();
          }
        );
      });
    });

    // Pagination
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
    initEvents
  };
})();
