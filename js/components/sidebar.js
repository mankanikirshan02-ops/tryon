/**
 * TRYON Super Admin Panel - Sidebar Navigation Component
 * Replicates layout, active states, badge counters, collapsible submenus,
 * role-adapted links, and user footer from the design reference.
 */

(function () {
  let reportsExpanded = true;

  function renderSidebar(activeRoute) {
    const store = window.TryonStore;
    const currentUser = store.getCurrentUser();
    const state = store.getState();

    const productCount = state.products.length;
    const orderCount = state.orders.length;
    const customerCount = state.customers.length;

    const isReportsActive = ['reports:sales', 'reports:revenue', 'reports:profit-loss'].includes(activeRoute);
    const userRole = currentUser ? currentUser.role : 'Admin';

    // Role-based restrictions on sidebar items
    const canSeeReports = userRole !== 'User';
    const canSeeSettings = true; // Users can see settings but specific tabs (Users & Roles) are restricted for non-admin

    return `
      <!-- Brand Logo -->
      <div class="px-5 py-4 border-b border-[#F0F3F1] flex items-center justify-between">
        <a href="#dashboard" class="flex items-center group">
          <img src="logo_final.png" alt="TRYON — WEAR YOUR STORY" class="h-9 max-w-[180px] w-auto object-contain transition-transform group-hover:scale-102" />
        </a>

        <!-- Mobile Close Button -->
        <button id="btn-close-mobile-sidebar" class="md:hidden text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
        <!-- Dashboard -->
        <a href="#dashboard" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          activeRoute === 'dashboard'
            ? 'nav-pill-active shadow-sm'
            : 'text-[#5A6B63] hover:text-[#163326] hover:bg-[#F3F6F4]'
        }">
          <div class="flex items-center space-x-3">
            <i data-lucide="layout-grid" class="w-4 h-4"></i>
            <span>Dashboard</span>
          </div>
        </a>

        <!-- Products -->
        <a href="#products" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          activeRoute === 'products'
            ? 'nav-pill-active shadow-sm'
            : 'text-[#5A6B63] hover:text-[#163326] hover:bg-[#F3F6F4]'
        }">
          <div class="flex items-center space-x-3">
            <i data-lucide="package" class="w-4 h-4"></i>
            <span>Products</span>
          </div>
          ${
            productCount > 0
              ? `<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  activeRoute === 'products' ? 'bg-[#163326] text-white' : 'bg-[#EAECEE] text-[#475569]'
                }">${productCount}</span>`
              : ''
          }
        </a>

        <!-- Orders -->
        <a href="#orders" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          activeRoute === 'orders'
            ? 'nav-pill-active shadow-sm'
            : 'text-[#5A6B63] hover:text-[#163326] hover:bg-[#F3F6F4]'
        }">
          <div class="flex items-center space-x-3">
            <i data-lucide="shopping-bag" class="w-4 h-4"></i>
            <span>Orders</span>
          </div>
          ${
            orderCount > 0
              ? `<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  activeRoute === 'orders' ? 'bg-[#163326] text-white' : 'bg-[#EAECEE] text-[#475569]'
                }">${orderCount}</span>`
              : ''
          }
        </a>

        <!-- Customers -->
        <a href="#customers" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          activeRoute === 'customers'
            ? 'nav-pill-active shadow-sm'
            : 'text-[#5A6B63] hover:text-[#163326] hover:bg-[#F3F6F4]'
        }">
          <div class="flex items-center space-x-3">
            <i data-lucide="users" class="w-4 h-4"></i>
            <span>Customers</span>
          </div>
          ${
            customerCount > 0
              ? `<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  activeRoute === 'customers' ? 'bg-[#163326] text-white' : 'bg-[#EAECEE] text-[#475569]'
                }">${customerCount}</span>`
              : ''
          }
        </a>

        <!-- Reports (Expandable Submenu) -->
        ${
          canSeeReports
            ? `
          <div class="pt-1">
            <button id="toggle-reports-menu" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isReportsActive
                ? 'nav-pill-active shadow-sm'
                : 'text-[#5A6B63] hover:text-[#163326] hover:bg-[#F3F6F4]'
            }">
              <div class="flex items-center space-x-3">
                <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                <span>Reports</span>
              </div>
              <i data-lucide="${reportsExpanded ? 'chevron-down' : 'chevron-right'}" class="w-3.5 h-3.5 transition-transform text-[#94A3B8]"></i>
            </button>

            <!-- Submenu -->
            <div id="reports-submenu" class="mt-1 pl-7 pr-2 space-y-1 ${reportsExpanded ? 'block' : 'hidden'}">
              <a href="#reports:sales" class="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeRoute === 'reports:sales'
                  ? 'bg-[#E4EFE7] text-[#163326] font-semibold'
                  : 'text-[#64748B] hover:text-[#163326] hover:bg-[#F3F6F4]'
              }">
                <span class="w-1.5 h-1.5 rounded-full ${activeRoute === 'reports:sales' ? 'bg-[#163326]' : 'bg-[#CBD5E1]'}"></span>
                <span>Sales Report</span>
              </a>

              <a href="#reports:revenue" class="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeRoute === 'reports:revenue'
                  ? 'bg-[#E4EFE7] text-[#163326] font-semibold'
                  : 'text-[#64748B] hover:text-[#163326] hover:bg-[#F3F6F4]'
              }">
                <span class="w-1.5 h-1.5 rounded-full ${activeRoute === 'reports:revenue' ? 'bg-[#163326]' : 'bg-[#CBD5E1]'}"></span>
                <span>Revenue</span>
              </a>

              <a href="#reports:profit-loss" class="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeRoute === 'reports:profit-loss'
                  ? 'bg-[#E4EFE7] text-[#163326] font-semibold'
                  : 'text-[#64748B] hover:text-[#163326] hover:bg-[#F3F6F4]'
              }">
                <span class="w-1.5 h-1.5 rounded-full ${activeRoute === 'reports:profit-loss' ? 'bg-[#163326]' : 'bg-[#CBD5E1]'}"></span>
                <span>Profit & Loss</span>
              </a>

              <button id="btn-sidebar-import-data" class="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#163326] hover:bg-[#E4EFE7] transition-colors">
                <i data-lucide="upload-cloud" class="w-3.5 h-3.5 text-[#163326]"></i>
                <span class="font-semibold">Import Data</span>
              </button>
            </div>
          </div>
          `
            : ''
        }

        <!-- Settings -->
        ${
          canSeeSettings
            ? `
          <a href="#settings" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeRoute.startsWith('settings')
              ? 'nav-pill-active shadow-sm'
              : 'text-[#5A6B63] hover:text-[#163326] hover:bg-[#F3F6F4]'
          }">
            <div class="flex items-center space-x-3">
              <i data-lucide="settings" class="w-4 h-4"></i>
              <span>Settings</span>
            </div>
          </a>
          `
            : ''
        }
      </div>

      <!-- Bottom Profile / Account Area -->
      <div class="p-3.5 border-t border-[#F0F3F1] bg-[#FAFCFB]">
        <div class="flex items-center justify-between p-2 rounded-xl bg-white border border-[#EAECEE] shadow-sm">
          <div class="flex items-center space-x-3 overflow-hidden">
            <div class="w-9 h-9 rounded-full bg-[#163326] text-white flex items-center justify-center font-bold text-sm shrink-0">
              ${currentUser ? (currentUser.avatar || currentUser.name.charAt(0).toUpperCase()) : 'T'}
            </div>
            <div class="overflow-hidden">
              <p class="text-xs font-semibold text-[#111827] truncate">${currentUser ? currentUser.name : 'Tryon Admin'}</p>
              <div class="flex items-center space-x-1">
                <span class="text-[10px] font-medium text-[#64748B] capitalize">${currentUser ? currentUser.role : 'Admin'}</span>
                <span class="w-1 h-1 rounded-full bg-[#137333]"></span>
              </div>
            </div>
          </div>
          <button id="btn-sidebar-logout" title="Sign Out" class="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  }

  function initSidebarEvents() {
    const toggleBtn = document.getElementById('toggle-reports-menu');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        reportsExpanded = !reportsExpanded;
        const sub = document.getElementById('reports-submenu');
        if (sub) {
          sub.classList.toggle('hidden', !reportsExpanded);
        }
        const icon = toggleBtn.querySelector('[data-lucide="chevron-down"], [data-lucide="chevron-right"]');
        if (icon) {
          icon.setAttribute('data-lucide', reportsExpanded ? 'chevron-down' : 'chevron-right');
          if (window.lucide) window.lucide.createIcons();
        }
      });
    }

    const importDataBtn = document.getElementById('btn-sidebar-import-data');
    if (importDataBtn) {
      importDataBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.TryonImportModal?.open('import');
      });
    }

    const logoutBtn = document.getElementById('btn-sidebar-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.TryonStore.logout();
        window.location.hash = '#login';
      });
    }

    const closeMobile = document.getElementById('btn-close-mobile-sidebar');
    if (closeMobile) {
      closeMobile.addEventListener('click', () => {
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.add('-translate-x-full');
        if (overlay) overlay.classList.add('hidden');
      });
    }
  }

  window.TryonSidebar = {
    render: renderSidebar,
    initEvents: initSidebarEvents
  };
})();
