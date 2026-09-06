/**
 * TRYON Super Admin Panel - Order Details Drawer Component
 * Slide-over drawer featuring complete order information, customer details,
 * shipping address (City, Postal Code), line item breakdown (SKU, Size, Color, Discount),
 * payment summary, interactive order timeline with timestamps, and validated status lifecycle management.
 */

(function () {
  let currentOrderId = null;

  function renderTimeline(order) {
    const mainStages = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentStatus = order.status || 'Pending';
    const isCancelled = currentStatus === 'Cancelled';
    const isReturned = currentStatus === 'Returned';
    const isRefunded = currentStatus === 'Refunded';

    if (isCancelled || isReturned || isRefunded) {
      return `
        <div class="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs flex items-center space-x-3">
          <div class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0">
            <i data-lucide="alert-circle" class="w-4.5 h-4.5"></i>
          </div>
          <div>
            <p class="font-bold text-red-900">Special Status: ${currentStatus}</p>
            <p class="text-[11px] text-red-700 mt-0.5">This order is marked as ${currentStatus.toLowerCase()}. Standard delivery timeline halted.</p>
          </div>
        </div>
      `;
    }

    const currentIndex = mainStages.indexOf(currentStatus);
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    return `
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider">Order Timeline</h4>
        <div class="p-4 rounded-2xl bg-[#FAFCFB] border border-[#EAECEE] space-y-4">
          <div class="relative flex items-center justify-between text-center">
            
            <!-- Connecting Line -->
            <div class="absolute left-4 right-4 top-3.5 h-0.5 bg-gray-200 -z-0"></div>
            <div class="absolute left-4 top-3.5 h-0.5 bg-[#163326] transition-all duration-300 -z-0" style="width: ${(activeIndex / (mainStages.length - 1)) * 100}%;"></div>

            ${mainStages
              .map((stage, idx) => {
                const isPassed = idx <= activeIndex;
                const isCurrent = idx === activeIndex;
                let stepTime = '';
                if (Array.isArray(order.history)) {
                  const hItem = order.history.find((h) => h.status === stage);
                  if (hItem && hItem.timestamp) {
                    stepTime = new Date(hItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }
                }
                if (!stepTime && idx === 0) stepTime = order.date || 'Today';

                return `
                <div class="relative z-10 flex flex-col items-center group">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPassed
                      ? 'bg-[#163326] text-white ring-4 ring-[#E4EFE7]'
                      : 'bg-white text-gray-400 border-2 border-gray-300'
                  }">
                    ${isPassed ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : idx + 1}
                  </div>
                  <span class="mt-1.5 text-[10px] font-bold ${isCurrent ? 'text-[#163326]' : isPassed ? 'text-[#374151]' : 'text-gray-400'}">${stage}</span>
                  ${stepTime ? `<span class="text-[9px] text-gray-400">${stepTime}</span>` : ''}
                </div>
              `;
              })
              .join('')}

          </div>
        </div>
      </div>
    `;
  }

  function openOrderDrawer(orderId) {
    currentOrderId = orderId;
    const store = window.TryonStore;
    const state = store.getState();
    const order = state.orders.find((o) => o.id === orderId);

    if (!order) return;

    const drawerContainer = document.getElementById('order-drawer-container');
    if (!drawerContainer) return;

    const customer = order.customer || {};
    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = order.subtotal || 0;
    const discount = order.discount || 0;
    const shippingFee = order.shippingFee || 0;
    const tax = order.tax || 0;
    const total = order.total || 0;
    const paymentMethod = order.paymentMethod || 'Credit Card';
    const paymentStatus = order.paymentStatus || 'Pending';

    let oBadgeClass = 'badge-pending';
    if (order.status === 'Delivered') oBadgeClass = 'badge-delivered';
    else if (order.status === 'Processing') oBadgeClass = 'badge-processing';
    else if (order.status === 'Shipped') oBadgeClass = 'badge-shipped';
    else if (order.status === 'Confirmed') oBadgeClass = 'badge-confirmed';
    else if (order.status === 'Returned') oBadgeClass = 'badge-returned';
    else if (order.status === 'Refunded') oBadgeClass = 'badge-refunded';
    else if (order.status === 'Cancelled') oBadgeClass = 'badge-cancelled';

    let pBadgeClass = 'badge-unpaid';
    if (paymentStatus === 'Paid') pBadgeClass = 'badge-paid';
    else if (paymentStatus === 'Failed' || paymentStatus === 'Refunded') pBadgeClass = 'badge-failed';

    drawerContainer.innerHTML = `
      <!-- Backdrop -->
      <div id="drawer-backdrop" class="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity"></div>

      <!-- Slide Panel -->
      <div class="fixed inset-y-0 right-0 max-w-full flex z-50 animate-in slide-in-from-right duration-250">
        <div class="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-[#EAECEE]">
          
          <!-- Drawer Header -->
          <div class="px-6 py-4 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="text-base font-bold text-[#111827]">Order Details</h3>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${oBadgeClass}">${order.status}</span>
              </div>
              <p class="text-xs text-[#64748B] mt-0.5">Reference ID: <span class="font-semibold text-[#163326]">#${order.id}</span> • Placed: ${order.date}</p>
            </div>
            <button id="btn-close-order-drawer" class="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Drawer Body Scrollable Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            
            <!-- Order Lifecycle Status Manager -->
            <div class="p-4 rounded-2xl bg-[#F8F9FA] border border-[#EAECEE] space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status & Lifecycle</span>
                <span class="text-xs text-gray-500 font-medium">Payment: <strong class="${pBadgeClass} px-2 py-0.5 rounded-full font-bold text-[10px]">${paymentStatus}</strong></span>
              </div>

              <div class="flex items-center space-x-2">
                <select id="drawer-order-status-select" class="flex-1 text-xs font-medium rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white focus:ring-2 focus:ring-[#163326] focus:border-[#163326] outline-none">
                  <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                  <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                  <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                  <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                  <option value="Returned" ${order.status === 'Returned' ? 'selected' : ''}>Returned</option>
                  <option value="Refunded" ${order.status === 'Refunded' ? 'selected' : ''}>Refunded</option>
                </select>

                <button id="btn-[#drawer-force-status]" class="hidden px-3 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-all">
                  Force Override
                </button>
              </div>
            </div>

            <!-- Interactive Timeline -->
            ${renderTimeline(order)}

            <!-- Customer & Shipping Information -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Customer Info Card -->
              <div class="p-3.5 rounded-2xl border border-[#EAECEE] bg-white space-y-2">
                <div class="flex items-center space-x-2 border-b border-gray-100 pb-2">
                  <i data-lucide="user" class="w-4 h-4 text-[#163326]"></i>
                  <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider">Customer</h4>
                </div>
                <div class="text-xs space-y-1">
                  <p class="font-bold text-[#111827]">${customer.name || 'Guest Customer'}</p>
                  <p class="text-[#64748B] truncate">${customer.email || 'N/A'}</p>
                  <p class="text-[#64748B]">${customer.phone || 'No phone provided'}</p>
                </div>
              </div>

              <!-- Shipping Info Card -->
              <div class="p-3.5 rounded-2xl border border-[#EAECEE] bg-white space-y-2">
                <div class="flex items-center space-x-2 border-b border-gray-100 pb-2">
                  <i data-lucide="map-pin" class="w-4 h-4 text-[#163326]"></i>
                  <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider">Shipping Address</h4>
                </div>
                <div class="text-xs space-y-1">
                  <p class="font-semibold text-[#111827]">${customer.address || 'Standard Address'}</p>
                  <p class="text-[#64748B]">${customer.city || 'New York'}, ${customer.postalCode || '10001'}</p>
                </div>
              </div>
            </div>

            <!-- Order Items Breakdown -->
            <div>
              <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3">Order Items (${items.length})</h4>
              <div class="space-y-2.5">
                ${items
                  .map(
                    (item) => `
                  <div class="p-3 rounded-xl border border-[#EAECEE] bg-white flex items-center space-x-3">
                    <img src="${item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-[#111827] truncate">${item.name || 'Apparel Item'}</p>
                      <div class="flex flex-wrap items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                        <span>SKU: <strong class="text-gray-700">${item.sku || 'N/A'}</strong></span>
                        <span>Size: <strong class="text-gray-700">${item.size || 'M'}</strong></span>
                        <span>Color: <strong class="text-gray-700">${item.color || 'Default'}</strong></span>
                      </div>
                      <p class="text-xs font-semibold text-[#163326] mt-0.5">Qty: ${item.quantity || 1} × $${(item.price || 0).toFixed(2)} ${item.discount ? `<span class="text-emerald-600 text-[10px]">(-$${item.discount.toFixed(2)} discount)</span>` : ''}</p>
                    </div>
                    <div class="text-right shrink-0">
                      <p class="text-xs font-bold text-[#111827]">$${(item.total || 0).toFixed(2)}</p>
                    </div>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>

            <!-- Payment & Summary Breakdown -->
            <div>
              <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3">Payment & Financial Summary</h4>
              <div class="p-4 rounded-2xl bg-[#F8F9FA] border border-[#EAECEE] space-y-2 text-xs">
                <div class="flex justify-between text-[#64748B] pb-2 border-b border-gray-200">
                  <span>Payment Method</span>
                  <span class="font-bold text-[#111827]">${paymentMethod}</span>
                </div>
                <div class="flex justify-between text-[#64748B]">
                  <span>Subtotal</span>
                  <span>$${subtotal.toFixed(2)}</span>
                </div>
                ${
                  discount > 0
                    ? `
                  <div class="flex justify-between text-[#137333]">
                    <span>Discount</span>
                    <span>-$${discount.toFixed(2)}</span>
                  </div>
                `
                    : ''
                }
                <div class="flex justify-between text-[#64748B]">
                  <span>Shipping Charges</span>
                  <span>${shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div class="flex justify-between text-[#64748B]">
                  <span>Tax</span>
                  <span>${tax > 0 ? `$${tax.toFixed(2)}` : '$0.00'}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-200 text-sm font-bold text-[#111827]">
                  <span>Grand Total</span>
                  <span class="text-[#163326] text-base">$${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Footer Actions -->
          <div class="p-4 border-t border-[#F0F3F1] bg-[#FAFCFB] flex items-center space-x-3">
            <button id="btn-drawer-close-action" class="w-full py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all shadow-sm">
              Close Details
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
        try {
          window.TryonStore.updateOrderStatus(orderId, newStatus, false);
          window.TryonApp.showToast(`Order #${orderId} status updated to "${newStatus}"`, 'success');
          openOrderDrawer(orderId); // refresh drawer with new badge and timeline
        } catch (err) {
          window.TryonApp.showToast(err.message, 'error');
          // Prompt for Admin force override if invalid transition
          window.TryonModals.openDeleteConfirm(
            'Override Status Transition?',
            `${err.message}\nDo you want to force override this status transition as Administrator?`,
            () => {
              window.TryonStore.updateOrderStatus(orderId, newStatus, true);
              window.TryonApp.showToast(`Order #${orderId} force updated to "${newStatus}"`, 'warning');
              openOrderDrawer(orderId);
            }
          );
          statusSelect.value = order.status; // revert UI selection for now
        }
      });
    }
  }

  window.TryonOrderDrawer = {
    open: openOrderDrawer
  };
})();

