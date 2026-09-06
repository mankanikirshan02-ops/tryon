/**
 * TRYON Super Admin Panel - Order Details Drawer Component
 * Matches the right-hand slide-over drawer from the design reference,
 * featuring order information, customer info, item thumbnails,
 * price summary, and real-time status updating.
 */

(function () {
  let currentOrderId = null;

  function openOrderDrawer(orderId) {
    currentOrderId = orderId;
    const store = window.TryonStore;
    const state = store.getState();
    const order = state.orders.find((o) => o.id === orderId);

    if (!order) return;

    const drawerContainer = document.getElementById('order-drawer-container');
    if (!drawerContainer) return;

    drawerContainer.innerHTML = `
      <!-- Backdrop -->
      <div id="drawer-backdrop" class="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity"></div>

      <!-- Slide Panel -->
      <div class="fixed inset-y-0 right-0 max-w-full flex z-50">
        <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#EAECEE]">
          
          <!-- Header -->
          <div class="px-6 py-5 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
            <div>
              <h3 class="text-base font-bold text-[#111827]">Order Details</h3>
              <p class="text-xs text-[#64748B] mt-0.5">Reference: <span class="font-semibold text-[#163326]">#${order.id}</span></p>
            </div>
            <button id="btn-close-order-drawer" class="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Drawer Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            
            <!-- Status Card & Selector -->
            <div class="p-4 rounded-2xl bg-[#F8F9FA] border border-[#EAECEE] space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Current Status</span>
                <span class="px-2.5 py-1 rounded-full text-xs font-bold ${
                  order.status === 'Delivered'
                    ? 'badge-delivered'
                    : order.status === 'Pending'
                    ? 'badge-pending'
                    : order.status === 'Processing'
                    ? 'badge-processing'
                    : order.status === 'Shipped'
                    ? 'badge-shipped'
                    : 'badge-cancelled'
                }">${order.status}</span>
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#475569] mb-1.5">Update Order Status:</label>
                <select id="drawer-order-status-select" class="w-full text-xs font-medium rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white focus:ring-2 focus:ring-[#163326] focus:border-[#163326] outline-none">
                  <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                  <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                  <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
              </div>
            </div>

            <!-- Order Information -->
            <div>
              <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3">Order Information</h4>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                  <span class="text-[#64748B]">Order ID</span>
                  <span class="font-semibold text-[#111827]">#${order.id}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                  <span class="text-[#64748B]">Order Date</span>
                  <span class="font-semibold text-[#111827]">${order.date}</span>
                </div>
                <div class="flex justify-between py-1.5 border-b border-[#F1F5F9]">
                  <span class="text-[#64748B]">Payment Method</span>
                  <span class="font-semibold text-[#111827]">Credit Card (Online)</span>
                </div>
              </div>
            </div>

            <!-- Customer -->
            <div>
              <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3">Customer</h4>
              <div class="p-3.5 rounded-2xl border border-[#EAECEE] bg-white flex items-start space-x-3.5">
                <div class="w-10 h-10 rounded-full bg-[#163326] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  ${(order.customer.name.charAt(0) || 'C').toUpperCase()}
                </div>
                <div class="flex-1 text-xs space-y-1">
                  <p class="font-bold text-[#111827]">${order.customer.name}</p>
                  <p class="text-[#64748B]">${order.customer.email}</p>
                  <p class="text-[#64748B]">${order.customer.phone || 'N/A'}</p>
                  <p class="text-[#64748B] pt-1 text-[11px] border-t border-gray-100">${order.customer.address || 'Address not provided'}</p>
                </div>
              </div>
            </div>

            <!-- Ordered Items -->
            <div>
              <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3">Items (${order.items.length})</h4>
              <div class="space-y-2.5">
                ${order.items
                  .map(
                    (item) => `
                  <div class="p-3 rounded-xl border border-[#EAECEE] bg-white flex items-center space-x-3">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-[#111827] truncate">${item.name}</p>
                      <p class="text-[11px] text-[#64748B]">${item.category || 'Apparel'} • Qty: ${item.quantity}</p>
                      <p class="text-xs font-semibold text-[#163326] mt-0.5">$${item.price.toFixed(2)} each</p>
                    </div>
                    <div class="text-right">
                      <p class="text-xs font-bold text-[#111827]">$${item.total.toFixed(2)}</p>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- Summary -->
            <div>
              <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3">Summary</h4>
              <div class="p-4 rounded-2xl bg-[#F8F9FA] border border-[#EAECEE] space-y-2 text-xs">
                <div class="flex justify-between text-[#64748B]">
                  <span>Subtotal</span>
                  <span>$${order.subtotal.toFixed(2)}</span>
                </div>
                ${
                  order.discount > 0
                    ? `
                  <div class="flex justify-between text-[#137333]">
                    <span>Discount</span>
                    <span>-$${order.discount.toFixed(2)}</span>
                  </div>
                `
                    : ''
                }
                <div class="flex justify-between text-[#64748B]">
                  <span>Estimated Tax</span>
                  <span>$0.00</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-[#111827]">
                  <span>Total</span>
                  <span class="text-[#163326]">$${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Footer Action -->
          <div class="p-4 border-t border-[#F0F3F1] bg-[#FAFCFB] flex items-center space-x-3">
            <button id="btn-drawer-close-action" class="w-full py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all shadow-sm">
              Close
            </button>
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event handlers
    const closeBtn = document.getElementById('btn-close-order-drawer');
    const closeActionBtn = document.getElementById('btn-drawer-close-action');
    const backdrop = document.getElementById('drawer-backdrop');
    const statusSelect = document.getElementById('drawer-order-status-select');

    const closeDrawer = () => {
      drawerContainer.innerHTML = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (closeActionBtn) closeActionBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        const newStatus = e.target.value;
        window.TryonStore.updateOrderStatus(orderId, newStatus);
        window.TryonApp.showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
        openOrderDrawer(orderId); // refresh drawer with new badge
      });
    }
  }

  window.TryonOrderDrawer = {
    open: openOrderDrawer
  };
})();
