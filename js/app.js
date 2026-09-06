/**
 * TRYON Super Admin Panel - Main Application Controller
 * Manages hash routing, RBAC guards, layout assembly,
 * reactive state subscriptions, and UI feedback toasts.
 */

(function () {
  let currentRoute = 'dashboard';

  function init() {
    // Check if user is logged in
    const currentUser = window.TryonStore.getCurrentUser();
    if (!currentUser) {
      // Default to login
      window.location.hash = '#login';
    } else if (!window.location.hash || window.location.hash === '#login') {
      window.location.hash = '#dashboard';
    }

    // Subscribe to state changes for real-time reactivity
    window.TryonStore.subscribe((event, data) => {
      renderRoute();
    });

    // Listen to hash changes
    window.addEventListener('hashchange', () => {
      renderRoute();
    });

    // Initial render
    renderRoute();
  }

  function renderRoute() {
    const rawHash = (window.location.hash || '').replace('#', '').trim();
    const routeParts = rawHash.split(':');
    const primaryRoute = routeParts[0] || 'dashboard';
    const subRoute = routeParts[1] || '';

    currentRoute = rawHash || 'dashboard';

    const currentUser = window.TryonStore.getCurrentUser();

    // If not authenticated and not on login page, force login
    if (!currentUser && primaryRoute !== 'login') {
      window.location.hash = '#login';
      renderLoginPage();
      return;
    }

    // If authenticated and on login page, redirect to dashboard
    if (currentUser && primaryRoute === 'login') {
      window.location.hash = '#dashboard';
      return;
    }

    if (primaryRoute === 'login') {
      renderLoginPage();
      return;
    }

    // RBAC Permission Guard
    const userRole = currentUser ? currentUser.role : 'Admin';
    const isAllowed = checkRouteAccess(primaryRoute, subRoute, userRole);

    renderAppShell(currentRoute);

    const mainContainer = document.getElementById('app-main-content');
    if (!mainContainer) return;

    if (!isAllowed) {
      mainContainer.innerHTML = renderAccessRestricted();
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Route dispatch
    switch (primaryRoute) {
      case 'dashboard':
        mainContainer.innerHTML = window.TryonPageDashboard.render();
        window.TryonPageDashboard.initEvents();
        break;

      case 'products':
        mainContainer.innerHTML = window.TryonPageProducts.render();
        window.TryonPageProducts.initEvents();
        break;

      case 'orders':
        mainContainer.innerHTML = window.TryonPageOrders.render();
        window.TryonPageOrders.initEvents();
        break;

      case 'customers':
        mainContainer.innerHTML = window.TryonPageCustomers.render();
        window.TryonPageCustomers.initEvents();
        break;

      case 'reports':
        if (subRoute === 'revenue') {
          mainContainer.innerHTML = window.TryonPageRevenue.render();
          window.TryonPageRevenue.initEvents();
        } else if (subRoute === 'profit-loss') {
          mainContainer.innerHTML = window.TryonPageProfitLoss.render();
          window.TryonPageProfitLoss.initEvents();
        } else {
          mainContainer.innerHTML = window.TryonPageSalesReport.render();
          window.TryonPageSalesReport.initEvents();
        }
        break;

      case 'settings':
        mainContainer.innerHTML = window.TryonPageSettings.render(subRoute || 'profile');
        window.TryonPageSettings.initEvents();
        break;

      default:
        mainContainer.innerHTML = window.TryonPageDashboard.render();
        window.TryonPageDashboard.initEvents();
        break;
    }

    // Initialize Lucide icons on newly rendered page
    if (window.lucide) window.lucide.createIcons();

    // Scroll back to top on navigation
    window.scrollTo(0, 0);
  }

  function checkRouteAccess(primaryRoute, subRoute, role) {
    if (role === 'Admin') return true;

    if (role === 'Manager') {
      if (primaryRoute === 'settings' && subRoute === 'users') return false;
      return true;
    }

    if (role === 'User') {
      // Users can only access dashboard, products, orders, customers
      const allowed = ['dashboard', 'products', 'orders', 'customers'];
      return allowed.includes(primaryRoute);
    }

    return false;
  }

  function renderLoginPage() {
    const root = document.getElementById('app-root');
    root.innerHTML = window.TryonPageLogin.render();
    window.TryonPageLogin.initEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  function renderAppShell(activeRoute) {
    const root = document.getElementById('app-root');
    let shellContainer = document.getElementById('app-shell-layout');

    if (!shellContainer) {
      root.innerHTML = `
        <div id="app-shell-layout" class="min-h-screen flex bg-[#F8F9FA]">
          
          <!-- Mobile Sidebar Overlay Backdrop -->
          <div id="sidebar-overlay" class="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 hidden md:hidden"></div>

          <!-- Sidebar (Desktop Fixed & Mobile Slide-over) -->
          <aside 
            id="app-sidebar" 
            class="w-64 bg-white border-r border-[#EAECEE] fixed inset-y-0 left-0 z-50 transform -translate-x-full md:translate-x-0 transition-transform duration-200 flex flex-col shadow-[1px_0_3px_rgba(0,0,0,0.02)]"
          ></aside>

          <!-- Main Layout Wrapper -->
          <div class="flex-1 md:pl-64 flex flex-col min-w-0">
            
            <!-- Sticky Header -->
            <div id="app-header-container"></div>

            <!-- Page Main Content Viewport -->
            <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto" id="app-main-content">
            </main>

          </div>

          <!-- Slide-over Order Details Drawer Container -->
          <div id="order-drawer-container"></div>

          <!-- Global Modal Dialogs Container -->
          <div id="app-modal-container"></div>

          <!-- Toast Notification Alerts Container -->
          <div id="app-toast-container" class="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none"></div>

        </div>
      `;

      // Close mobile sidebar on backdrop click
      document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
        document.getElementById('app-sidebar')?.classList.add('-translate-x-full');
        document.getElementById('sidebar-overlay')?.classList.add('hidden');
      });
    }

    // Update Sidebar
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) {
      sidebar.innerHTML = window.TryonSidebar.render(activeRoute);
      window.TryonSidebar.initEvents();
    }

    // Update Header
    const headerContainer = document.getElementById('app-header-container');
    if (headerContainer) {
      headerContainer.innerHTML = window.TryonHeader.render();
      window.TryonHeader.initEvents();
    }
  }

  function refreshHeader() {
    const headerContainer = document.getElementById('app-header-container');
    if (headerContainer) {
      headerContainer.innerHTML = window.TryonHeader.render();
      window.TryonHeader.initEvents();
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function renderAccessRestricted() {
    return `
      <div class="tryon-card p-16 text-center max-w-lg mx-auto my-12">
        <div class="w-16 h-16 rounded-2xl bg-[#FCE8E6] text-[#C5221F] flex items-center justify-center mx-auto mb-4">
          <i data-lucide="shield-alert" class="w-8 h-8"></i>
        </div>
        <h2 class="text-xl font-bold text-[#111827]">Access Restricted</h2>
        <p class="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
          Your current account role does not possess the required permission level to access this section. Please contact your store administrator to request elevated privileges.
        </p>
        <div class="mt-6">
          <a href="#dashboard" class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] shadow-sm transition-all">
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Back to Dashboard</span>
          </a>
        </div>
      </div>
    `;
  }

  // Toast System
  function showToast(message, type = 'info') {
    const container = document.getElementById('app-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold transition-all max-w-sm ${
      type === 'success'
        ? 'bg-[#163326] text-white border-[#163326]'
        : type === 'warning'
        ? 'bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]'
        : type === 'error'
        ? 'bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF]'
        : 'bg-white text-[#111827] border-[#EAECEE]'
    }`;

    toast.innerHTML = `
      <i data-lucide="${
        type === 'success'
          ? 'check-circle-2'
          : type === 'warning'
          ? 'alert-triangle'
          : type === 'error'
          ? 'x-circle'
          : 'info'
      }" class="w-4 h-4 shrink-0"></i>
      <span class="flex-1">${message}</span>
      <button class="text-current opacity-60 hover:opacity-100 p-0.5" onclick="this.parentElement.remove()">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  window.TryonApp = {
    init,
    renderRoute,
    refreshHeader,
    showToast
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
