/**
 * TRYON Super Admin Panel - Header Component
 * Implements search bar, notifications popover, user profile menu,
 * mobile drawer toggle, and role switcher.
 */

(function () {
  let isNotificationsOpen = false;
  let isProfileMenuOpen = false;

  function renderHeader() {
    const store = window.TryonStore;
    const currentUser = store.getCurrentUser();
    const state = store.getState();
    const unreadCount = state.notifications.filter((n) => !n.read).length;

    return `
      <header class="h-16 bg-white border-b border-[#EAECEE] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <!-- Left: Mobile Menu Toggle & Search Bar -->
        <div class="flex items-center space-x-3 sm:space-x-4 flex-1 max-w-xl">
          <button id="btn-toggle-mobile-sidebar" class="md:hidden text-gray-500 hover:text-[#163326] p-1.5 rounded-lg hover:bg-gray-100">
            <i data-lucide="menu" class="w-5 h-5"></i>
          </button>

          <!-- Search Input Trigger -->
          <div class="relative w-full cursor-pointer" id="header-search-trigger">
            <div class="flex items-center w-full h-9.5 pl-3.5 pr-3 bg-[#F8F9FA] hover:bg-[#F1F3F5] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#94A3B8] transition-all">
              <i data-lucide="search" class="w-4 h-4 text-[#94A3B8] mr-2.5 shrink-0"></i>
              <span class="truncate">Search products, orders, customers...</span>
              <kbd class="ml-auto hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] rounded shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
                ⌘ K
              </kbd>
            </div>
          </div>
        </div>

        <!-- Right: Supabase Status, Notifications & User Profile -->
        <div class="flex items-center space-x-2 sm:space-x-3.5 relative">
          <!-- Supabase Status Badge -->
          <div id="supabase-status-pill" class="hidden sm:inline-flex items-center">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
              <span class="w-1.5 h-1.5 rounded-full bg-[#137333] animate-pulse mr-1"></span>
              Supabase Connected
            </span>
          </div>

          <!-- Notification Bell -->
          <div class="relative">
            <button id="btn-toggle-notifications" class="relative w-9.5 h-9.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8F9FA] text-[#475569] flex items-center justify-center transition-colors">
              <i data-lucide="bell" class="w-4 h-4"></i>
              ${
                unreadCount > 0
                  ? `<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E11D48] ring-2 ring-white animate-pulse"></span>`
                  : ''
              }
            </button>

            <!-- Notifications Dropdown Popover -->
            <div id="popover-notifications" class="hidden absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#EAECEE] shadow-xl z-50 overflow-hidden">
              <div class="px-4 py-3 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
                <div class="flex items-center space-x-2">
                  <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider">Notifications</h4>
                  ${
                    unreadCount > 0
                      ? `<span class="px-1.5 py-0.5 rounded-full bg-[#163326] text-white text-[10px] font-bold">${unreadCount}</span>`
                      : ''
                  }
                </div>
                <button id="btn-mark-all-read" class="text-[11px] font-medium text-[#163326] hover:underline">
                  Mark all read
                </button>
              </div>

              <div class="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]" id="notifications-list-container">
                ${renderNotificationsList(state.notifications)}
              </div>
            </div>
          </div>

          <!-- User Profile Dropdown -->
          <div class="relative">
            <button id="btn-toggle-user-menu" class="flex items-center space-x-2 p-1.5 pl-2 pr-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F8F9FA] transition-all">
              <div class="w-7 h-7 rounded-full bg-[#163326] text-white flex items-center justify-center text-xs font-bold shrink-0">
                ${currentUser ? (currentUser.avatar || currentUser.name.charAt(0).toUpperCase()) : 'T'}
              </div>
              <span class="text-xs font-semibold text-[#111827] hidden sm:inline max-w-[100px] truncate">
                ${currentUser ? currentUser.name : 'Tryon Admin'}
              </span>
              <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#E4EFE7] text-[#163326] hidden md:inline">
                ${currentUser ? currentUser.role : 'Admin'}
              </span>
              <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-[#94A3B8]"></i>
            </button>

            <!-- User Menu Dropdown -->
            <div id="popover-user-menu" class="hidden absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#EAECEE] shadow-xl z-50 overflow-hidden py-1.5">
              <div class="px-4 py-3 border-b border-[#F0F3F1] bg-[#FAFCFB]">
                <p class="text-xs font-bold text-[#111827] truncate">${currentUser ? currentUser.name : 'Tryon Admin'}</p>
                <p class="text-[11px] text-[#64748B] truncate">${currentUser ? currentUser.email : 'admin@tryon.demo'}</p>
                <div class="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E4EFE7] text-[#163326]">
                  Role: ${currentUser ? currentUser.role : 'Admin'}
                </div>
              </div>

              <!-- Quick Role Switcher for Seamless Testing -->
              <div class="px-3 py-2 border-b border-[#F0F3F1]">
                <span class="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-1.5">Switch Demo Role</span>
                <div class="grid grid-cols-3 gap-1">
                  <button class="btn-role-switch px-2 py-1 text-[11px] font-semibold rounded-lg text-center transition-all ${
                    currentUser && currentUser.role === 'Admin' ? 'bg-[#163326] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }" data-role="Admin">Admin</button>
                  <button class="btn-role-switch px-2 py-1 text-[11px] font-semibold rounded-lg text-center transition-all ${
                    currentUser && currentUser.role === 'Manager' ? 'bg-[#163326] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }" data-role="Manager">Manager</button>
                  <button class="btn-role-switch px-2 py-1 text-[11px] font-semibold rounded-lg text-center transition-all ${
                    currentUser && currentUser.role === 'User' ? 'bg-[#163326] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }" data-role="User">User</button>
                </div>
              </div>

              <div class="py-1">
                <a href="#settings:profile" class="flex items-center space-x-2.5 px-4 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC]">
                  <i data-lucide="user" class="w-4 h-4 text-[#64748B]"></i>
                  <span>Profile Settings</span>
                </a>
                <a href="#settings:business" class="flex items-center space-x-2.5 px-4 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC]">
                  <i data-lucide="store" class="w-4 h-4 text-[#64748B]"></i>
                  <span>Store Settings</span>
                </a>
              </div>

              <div class="pt-1 border-t border-[#F0F3F1]">
                <button id="btn-header-logout" class="w-full text-left flex items-center space-x-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50">
                  <i data-lucide="log-out" class="w-4 h-4"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  function renderNotificationsList(notifications) {
    if (!notifications || notifications.length === 0) {
      return `
        <div class="p-8 text-center">
          <div class="w-12 h-12 rounded-full bg-[#F3F4F6] text-[#94A3B8] flex items-center justify-center mx-auto mb-2.5">
            <i data-lucide="bell-off" class="w-5 h-5"></i>
          </div>
          <p class="text-xs font-semibold text-[#1E293B]">No new notifications</p>
          <p class="text-[11px] text-[#94A3B8] mt-0.5">Store alerts and activity will appear here.</p>
        </div>
      `;
    }

    return notifications
      .map(
        (n) => `
        <div class="px-4 py-3 hover:bg-[#FAFCFB] transition-colors flex items-start space-x-3">
          <div class="w-7 h-7 rounded-lg ${
            n.type === 'success'
              ? 'bg-[#E6F4EA] text-[#137333]'
              : n.type === 'warning'
              ? 'bg-[#FEF7E0] text-[#B06000]'
              : 'bg-[#E8F0FE] text-[#1A73E8]'
          } flex items-center justify-center shrink-0 mt-0.5">
            <i data-lucide="${n.type === 'success' ? 'check-circle' : n.type === 'warning' ? 'alert-triangle' : 'info'}" class="w-3.5 h-3.5"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold text-[#111827] truncate">${n.title}</p>
              <span class="text-[10px] text-[#94A3B8]">${n.time}</span>
            </div>
            <p class="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">${n.message}</p>
          </div>
        </div>
      `
      )
      .join('');
  }

  function initHeaderEvents() {
    // Mobile menu toggle
    const toggleSidebarBtn = document.getElementById('btn-toggle-mobile-sidebar');
    if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('-translate-x-full');
        if (overlay) overlay.classList.remove('hidden');
      });
    }

    // Search trigger
    const searchTrigger = document.getElementById('header-search-trigger');
    if (searchTrigger) {
      searchTrigger.addEventListener('click', () => {
        window.TryonModals.openSearchModal();
      });
    }

    // Keyboard shortcut ⌘K / Ctrl+K
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.TryonModals.openSearchModal();
      }
    });

    // Notifications toggle
    const notifBtn = document.getElementById('btn-toggle-notifications');
    const notifPopover = document.getElementById('popover-notifications');
    if (notifBtn && notifPopover) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isNotificationsOpen = !isNotificationsOpen;
        notifPopover.classList.toggle('hidden', !isNotificationsOpen);
        if (isProfileMenuOpen) {
          isProfileMenuOpen = false;
          document.getElementById('popover-user-menu')?.classList.add('hidden');
        }
      });
    }

    // Mark all read
    const markReadBtn = document.getElementById('btn-mark-all-read');
    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        const state = window.TryonStore.getState();
        state.notifications.forEach((n) => (n.read = true));
        window.TryonApp.refreshHeader();
      });
    }

    // User menu toggle
    const userBtn = document.getElementById('btn-toggle-user-menu');
    const userPopover = document.getElementById('popover-user-menu');
    if (userBtn && userPopover) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isProfileMenuOpen = !isProfileMenuOpen;
        userPopover.classList.toggle('hidden', !isProfileMenuOpen);
        if (isNotificationsOpen) {
          isNotificationsOpen = false;
          document.getElementById('popover-notifications')?.classList.add('hidden');
        }
      });
    }

    // Close popovers on click outside
    document.addEventListener('click', () => {
      if (isNotificationsOpen && notifPopover) {
        isNotificationsOpen = false;
        notifPopover.classList.add('hidden');
      }
      if (isProfileMenuOpen && userPopover) {
        isProfileMenuOpen = false;
        userPopover.classList.add('hidden');
      }
    });

    // Quick Role Switcher
    document.querySelectorAll('.btn-role-switch').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const targetRole = e.currentTarget.getAttribute('data-role');
        const state = window.TryonStore.getState();
        const found = state.users.find((u) => u.role === targetRole);
        if (found) {
          window.TryonStore.setCurrentUser({
            id: found.id,
            name: found.name,
            email: found.email,
            role: found.role,
            avatar: found.avatar || found.name.charAt(0).toUpperCase()
          });
          window.TryonApp.showToast(`Switched role to ${targetRole}`, 'info');
          window.TryonApp.renderRoute();
        }
      });
    });

    // Sign out
    const logoutBtn = document.getElementById('btn-header-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.TryonStore.logout();
        window.location.hash = '#login';
      });
    }
  }

  window.TryonHeader = {
    render: renderHeader,
    initEvents: initHeaderEvents
  };
})();
