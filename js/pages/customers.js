/**
 * TRYON Super Admin Panel - Customers Page
 * Matches TRYON visual language:
 * Customer search & directory, metrics, + Add Customer modal,
 * edit/delete operations, and zero-data empty state.
 */

(function () {
  let searchQuery = '';

  function render() {
    const store = window.TryonStore;
    const state = store.getState();
    let customers = [...state.customers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
      );
    }

    return `
      <div class="space-y-6">
        
        <!-- Top Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">Customers</h1>
            <p class="text-xs sm:text-sm text-[#64748B] mt-0.5">Manage your customer relationships and buying histories</p>
          </div>

          <button id="btn-open-add-customer" class="px-4 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all flex items-center space-x-2 shadow-sm">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            <span>Add Customer</span>
          </button>
        </div>

        <!-- Filter / Search -->
        <div class="tryon-card p-4 flex items-center justify-between">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3"></i>
            <input 
              type="text" 
              id="customer-search-input" 
              placeholder="Search customers by name, email, phone..." 
              value="${searchQuery}"
              class="w-full text-xs rounded-xl border border-[#D1D5DB] pl-10 pr-3.5 py-2.5 outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326]"
            />
          </div>
          <div class="text-xs text-[#64748B]">
            Total Registered: <strong class="text-[#111827]">${state.customers.length}</strong>
          </div>
        </div>

        <!-- Table Card -->
        <div class="tryon-card overflow-hidden">
          ${
            customers.length === 0
              ? `
            <div class="p-16 text-center">
              <div class="w-16 h-16 rounded-2xl bg-[#F4F6F5] text-[#163326] flex items-center justify-center mx-auto mb-4">
                <i data-lucide="users" class="w-8 h-8"></i>
              </div>
              <h3 class="text-base font-bold text-[#111827]">No customers found</h3>
              <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                ${
                  searchQuery
                    ? 'No customers match your search query.'
                    : 'Customer records will appear here as they register or place orders.'
                }
              </p>
              <button id="btn-empty-add-customer" class="mt-5 px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all inline-flex items-center space-x-2">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Add First Customer</span>
              </button>
            </div>
          `
              : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#F8F9FA] text-[#64748B] uppercase tracking-wider text-[10px] font-bold border-b border-[#EAECEE]">
                  <tr>
                    <th class="px-5 py-3">Customer</th>
                    <th class="px-5 py-3">Email</th>
                    <th class="px-5 py-3">Phone</th>
                    <th class="px-5 py-3">Orders</th>
                    <th class="px-5 py-3">Total Spent</th>
                    <th class="px-5 py-3">Status</th>
                    <th class="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F1F5F9]">
                  ${customers
                    .map(
                      (c) => `
                    <tr class="hover:bg-[#F8FAFC] transition-colors">
                      <td class="px-5 py-3.5 flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-full bg-[#163326] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          ${c.avatar || c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p class="font-bold text-[#111827]">${c.name}</p>
                          <p class="text-[10px] text-[#64748B]">${c.address || 'Address not listed'}</p>
                        </div>
                      </td>
                      <td class="px-5 py-3.5 text-[#475569] font-medium">${c.email}</td>
                      <td class="px-5 py-3.5 text-[#64748B]">${c.phone || '—'}</td>
                      <td class="px-5 py-3.5 font-semibold text-[#111827]">${c.ordersCount || 0}</td>
                      <td class="px-5 py-3.5 font-bold text-[#163326]">$${(c.totalSpent || 0).toFixed(2)}</td>
                      <td class="px-5 py-3.5">
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          c.status === 'Active' ? 'badge-active' : 'badge-inactive'
                        }">
                          ${c.status || 'Active'}
                        </span>
                      </td>
                      <td class="px-5 py-3.5 text-right">
                        <div class="inline-flex items-center space-x-1">
                          <button class="btn-edit-customer p-1.5 rounded-lg text-gray-500 hover:text-[#163326] hover:bg-gray-100" title="Edit Customer" data-id="${c.id}">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                          </button>
                          <button class="btn-delete-customer p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50" title="Delete Customer" data-id="${c.id}">
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
          `
          }
        </div>

      </div>
    `;
  }

  function initEvents() {
    document.getElementById('btn-open-add-customer')?.addEventListener('click', () => {
      window.TryonModals.openCustomerModal();
    });

    document.getElementById('btn-empty-add-customer')?.addEventListener('click', () => {
      window.TryonModals.openCustomerModal();
    });

    document.getElementById('customer-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      window.TryonApp.renderRoute();
    });

    document.querySelectorAll('.btn-edit-customer').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonModals.openCustomerModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-customer').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const state = window.TryonStore.getState();
        const c = state.customers.find((cust) => cust.id === id);
        window.TryonModals.openDeleteConfirm(
          'Delete Customer?',
          `Are you sure you want to remove "${c ? c.name : 'this customer'}"?`,
          () => {
            window.TryonStore.deleteCustomer(id);
            window.TryonApp.showToast('Customer record deleted.', 'info');
            window.TryonApp.renderRoute();
          }
        );
      });
    });
  }

  window.TryonPageCustomers = {
    render,
    initEvents
  };
})();
