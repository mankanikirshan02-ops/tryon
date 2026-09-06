/**
 * TRYON Super Admin Panel - Settings Page
 * Replicates Bottom spanning reference panel:
 * Sub-navigation: Profile, Business, Users & Roles (Admin Only with RBAC guard),
 * Notifications, and Security (Change Password & Reset Demo Data).
 */

(function () {
  let activeTab = 'profile';

  function render(subRoute) {
    if (subRoute) activeTab = subRoute;

    const store = window.TryonStore;
    const currentUser = store.getCurrentUser();
    const state = store.getState();
    const settings = state.settings;
    const userRole = currentUser ? currentUser.role : 'Admin';
    const isAdmin = userRole === 'Admin';

    return `
      <div class="space-y-6">
        
        <!-- Header -->
        <div>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">Settings</h1>
          <p class="text-xs sm:text-sm text-[#64748B] mt-0.5">Manage your store settings and preferences</p>
        </div>

        <!-- Secondary Navigation Tabs matching Reference -->
        <div class="flex items-center space-x-2 border-b border-[#EAECEE] overflow-x-auto pb-2">
          <button class="settings-tab-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-[#163326] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F3F6F4]'
          }" data-tab="profile">
            <span class="flex items-center space-x-1.5">
              <i data-lucide="user" class="w-3.5 h-3.5"></i>
              <span>Profile</span>
            </span>
          </button>

          <button class="settings-tab-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'business'
              ? 'bg-[#163326] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F3F6F4]'
          }" data-tab="business">
            <span class="flex items-center space-x-1.5">
              <i data-lucide="store" class="w-3.5 h-3.5"></i>
              <span>Business</span>
            </span>
          </button>

          ${
            isAdmin
              ? `
            <button class="settings-tab-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-[#163326] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F3F6F4]'
            }" data-tab="users">
              <span class="flex items-center space-x-1.5">
                <i data-lucide="shield" class="w-3.5 h-3.5"></i>
                <span>Users & Roles</span>
                <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-white/20">Admin</span>
              </span>
            </button>
          `
              : ''
          }

          <button class="settings-tab-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-[#163326] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F3F6F4]'
          }" data-tab="notifications">
            <span class="flex items-center space-x-1.5">
              <i data-lucide="bell" class="w-3.5 h-3.5"></i>
              <span>Notifications</span>
            </span>
          </button>

          <button class="settings-tab-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-[#163326] text-white shadow-sm'
              : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F3F6F4]'
          }" data-tab="security">
            <span class="flex items-center space-x-1.5">
              <i data-lucide="lock" class="w-3.5 h-3.5"></i>
              <span>Security & Reset</span>
            </span>
          </button>
        </div>

        <!-- Tab Content Area -->
        <div class="tryon-card p-6 sm:p-8">
          ${renderActiveTabContent(activeTab, settings, state, isAdmin)}
        </div>

      </div>
    `;
  }

  function renderActiveTabContent(tab, settings, state, isAdmin) {
    if (tab === 'profile') {
      const p = settings.profile || {};
      return `
        <div class="max-w-3xl space-y-6">
          <div>
            <h3 class="text-sm font-bold text-[#111827]">Profile Information</h3>
            <p class="text-xs text-[#64748B] mt-0.5">Update your personal identification and bio</p>
          </div>

          <form id="form-settings-profile" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Full Name</label>
                <input type="text" id="set-profile-name" value="${p.name || 'Tryon Admin'}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Email Address</label>
                <input type="email" id="set-profile-email" value="${p.email || 'admin@tryon.demo'}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Phone Number</label>
              <input type="tel" id="set-profile-phone" value="${p.phone || '+1 (555) 019-2834'}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Bio / Role Description</label>
              <textarea id="set-profile-bio" rows="3" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]">${p.bio || ''}</textarea>
            </div>

            <!-- Profile Picture Box matching Reference -->
            <div class="pt-2">
              <label class="block text-xs font-semibold text-[#374151] mb-1.5">Profile Picture</label>
              <div class="border-2 border-dashed border-[#D1D5DB] rounded-2xl p-6 text-center hover:border-[#163326] transition-colors cursor-pointer bg-[#FAFCFB]">
                <div class="w-12 h-12 rounded-xl bg-[#E4EFE7] text-[#163326] flex items-center justify-center mx-auto mb-2">
                  <i data-lucide="upload-cloud" class="w-6 h-6"></i>
                </div>
                <p class="text-xs font-semibold text-[#111827]">Click to upload profile avatar</p>
                <p class="text-[10px] text-[#64748B] mt-0.5">PNG, JPG, WEBP up to 2MB</p>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-100">
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] shadow-sm">
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      `;
    }

    if (tab === 'business') {
      const b = settings.business || {};
      return `
        <div class="max-w-3xl space-y-6">
          <div>
            <h3 class="text-sm font-bold text-[#111827]">Business & Store Profile</h3>
            <p class="text-xs text-[#64748B] mt-0.5">Commercial branding, currency, and physical billing details</p>
          </div>

          <form id="form-settings-business" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Business Name</label>
                <input type="text" id="set-biz-name" value="${b.name || 'TRYON Fashion Co.'}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Business Support Email</label>
                <input type="email" id="set-biz-email" value="${b.email || 'store@tryon.fashion'}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Phone Number</label>
                <input type="tel" id="set-biz-phone" value="${b.phone || '+1 (800) 879-6632'}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Primary Store Currency</label>
                <select id="set-biz-curr" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 bg-white">
                  <option value="USD" ${b.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                  <option value="EUR" ${b.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                  <option value="GBP" ${b.currency === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                  <option value="PKR" ${b.currency === 'PKR' ? 'selected' : ''}>PKR (₨)</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Headquarters / Store Address</label>
              <input type="text" id="set-biz-addr" value="${b.address || '742 Evergreen Terrace, New York, NY 10001'}" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">About the Brand</label>
              <textarea id="set-biz-info" rows="2" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]">${b.info || ''}</textarea>
            </div>

            <div class="pt-4 border-t border-gray-100">
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] shadow-sm">
                Save Business Information
              </button>
            </div>
          </form>
        </div>
      `;
    }

    if (tab === 'users') {
      if (!isAdmin) {
        return `
          <div class="p-12 text-center">
            <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <i data-lucide="shield-alert" class="w-7 h-7"></i>
            </div>
            <h3 class="text-base font-bold text-[#111827]">Access Restricted</h3>
            <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              You do not have permission to view or manage Users & Roles. Administrator privileges are required.
            </p>
            <a href="#dashboard" class="mt-4 inline-block px-4 py-2 rounded-xl bg-[#163326] text-white text-xs font-semibold">
              Back to Dashboard
            </a>
          </div>
        `;
      }

      return `
        <div class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-bold text-[#111827]">Users & Role Management</h3>
              <p class="text-xs text-[#64748B] mt-0.5">Control staff access, assign permissions, and create accounts</p>
            </div>
            <div class="flex items-center space-x-2">
              <a href="#users" class="px-3.5 py-2 rounded-xl bg-[#E4EFE7] text-[#163326] text-xs font-bold hover:bg-[#D2E4D6] flex items-center space-x-1.5 transition-colors">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                <span>Open User Hub</span>
              </a>
              <button id="btn-open-add-user" class="px-4 py-2 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] flex items-center space-x-1.5 shadow-sm">
                <i data-lucide="user-plus" class="w-4 h-4"></i>
                <span>Add User</span>
              </button>
            </div>
          </div>

          <div class="overflow-x-auto border border-[#EAECEE] rounded-2xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#F8F9FA] text-[#64748B] uppercase tracking-wider text-[10px] font-bold border-b border-[#EAECEE]">
                <tr>
                  <th class="px-5 py-3">User</th>
                  <th class="px-5 py-3">Email</th>
                  <th class="px-5 py-3">Role</th>
                  <th class="px-5 py-3">Status</th>
                  <th class="px-5 py-3">Created</th>
                  <th class="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F1F5F9]">
                ${state.users
                  .map(
                    (u) => `
                  <tr class="hover:bg-[#F8FAFC]">
                    <td class="px-5 py-3.5 flex items-center space-x-3">
                      <div class="w-8 h-8 rounded-full bg-[#163326] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        ${u.avatar || u.name.charAt(0).toUpperCase()}
                      </div>
                      <span class="font-bold text-[#111827]">${u.name}</span>
                    </td>
                    <td class="px-5 py-3.5 text-[#475569] font-medium">${u.email}</td>
                    <td class="px-5 py-3.5">
                      <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.role === 'Admin'
                          ? 'bg-[#E4EFE7] text-[#163326]'
                          : u.role === 'Manager'
                          ? 'bg-[#E8F0FE] text-[#1A73E8]'
                          : 'bg-[#F3E8FF] text-[#7E22CE]'
                      }">
                        ${u.role}
                      </span>
                    </td>
                    <td class="px-5 py-3.5">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'Active' ? 'badge-active' : 'badge-inactive'
                      }">${u.status}</span>
                    </td>
                    <td class="px-5 py-3.5 text-[#64748B]">${u.createdAt || '2026-01-01'}</td>
                    <td class="px-5 py-3.5 text-right">
                      <div class="inline-flex items-center space-x-1">
                        <button class="btn-edit-user p-1.5 rounded-lg text-gray-400 hover:text-[#163326] hover:bg-gray-100" data-id="${u.id}" title="Edit User">
                          <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        ${
                          u.id !== 'usr-1'
                            ? `
                          <button class="btn-delete-user p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" data-id="${u.id}" title="Delete User">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                          </button>
                        `
                            : ''
                        }
                      </div>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (tab === 'notifications') {
      const n = settings.notifications || {};
      return `
        <div class="max-w-2xl space-y-6">
          <div>
            <h3 class="text-sm font-bold text-[#111827]">Notification Preferences</h3>
            <p class="text-xs text-[#64748B] mt-0.5">Control automated store alerts and email summaries</p>
          </div>

          <form id="form-settings-notif" class="space-y-4">
            <div class="p-4 rounded-2xl border border-[#EAECEE] flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-[#111827]">Order Purchase Notifications</p>
                <p class="text-[11px] text-[#64748B]">Receive real-time alerts whenever customer orders are created</p>
              </div>
              <input type="checkbox" id="set-notif-order" ${n.orderAlerts ? 'checked' : ''} class="w-4 h-4 text-[#163326] rounded focus:ring-[#163326]" />
            </div>

            <div class="p-4 rounded-2xl border border-[#EAECEE] flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-[#111827]">Low Stock & Inventory Warning</p>
                <p class="text-[11px] text-[#64748B]">Trigger warnings when apparel stock drops below 5 units</p>
              </div>
              <input type="checkbox" id="set-notif-stock" ${n.stockAlerts ? 'checked' : ''} class="w-4 h-4 text-[#163326] rounded focus:ring-[#163326]" />
            </div>

            <div class="p-4 rounded-2xl border border-[#EAECEE] flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-[#111827]">Daily Revenue Digest</p>
                <p class="text-[11px] text-[#64748B]">Receive end-of-day sales digest report</p>
              </div>
              <input type="checkbox" id="set-notif-email" ${n.emailReports ? 'checked' : ''} class="w-4 h-4 text-[#163326] rounded focus:ring-[#163326]" />
            </div>

            <div class="pt-4 border-t border-gray-100">
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219]">
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      `;
    }

    if (tab === 'security') {
      return `
        <div class="max-w-2xl space-y-8">
          
          <!-- Change Password -->
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-bold text-[#111827]">Change Password</h3>
              <p class="text-xs text-[#64748B] mt-0.5">Update credentials for your administrator profile</p>
            </div>

            <form id="form-settings-password" class="space-y-3.5">
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Current Password</label>
                <input type="password" required placeholder="••••••••" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">New Password</label>
                <input type="password" required placeholder="••••••••" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[#374151] mb-1">Confirm New Password</label>
                <input type="password" required placeholder="••••••••" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 outline-none focus:border-[#163326]" />
              </div>
              <button type="submit" class="px-4 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219]">
                Update Password
              </button>
            </form>
          </div>

          <!-- Active Sessions -->
          <div class="pt-6 border-t border-gray-100 space-y-3">
            <div>
              <h3 class="text-sm font-bold text-[#111827]">Active Sessions</h3>
              <p class="text-xs text-[#64748B] mt-0.5">Devices currently signed into this session</p>
            </div>
            <div class="p-3.5 rounded-2xl border border-[#EAECEE] bg-[#FAFCFB] flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center">
                  <i data-lucide="laptop" class="w-4 h-4"></i>
                </div>
                <div>
                  <p class="text-xs font-bold text-[#111827]">Current Browser Session (Active)</p>
                  <p class="text-[10px] text-[#64748B]">Chrome on Windows • Localhost Prototype</p>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333]">Online</span>
            </div>
          </div>

          <!-- Reset Demo Data Section (Requirement #6 & #38) -->
          <div class="pt-6 border-t border-red-100 space-y-3">
            <div>
              <h3 class="text-sm font-bold text-red-600 flex items-center space-x-2">
                <i data-lucide="alert-triangle" class="w-4 h-4 text-red-600"></i>
                <span>Reset Demo Environment</span>
              </h3>
              <p class="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Clear all temporary local products, customer records, orders, and expense entries to return the prototype back to its pristine zero-data initial state.
              </p>
            </div>

            <button id="btn-trigger-reset-demo" class="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold transition-colors flex items-center space-x-2">
              <i data-lucide="rotate-ccw" class="w-4 h-4 text-red-600"></i>
              <span>Reset Demo Data</span>
            </button>
          </div>

        </div>
      `;
    }

    return '';
  }

  function initEvents() {
    const store = window.TryonStore;

    // Tab buttons
    document.querySelectorAll('.settings-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.getAttribute('data-tab');
        window.location.hash = `#settings:${activeTab}`;
      });
    });

    // Profile form
    document.getElementById('form-settings-profile')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.updateSettings('profile', {
        name: document.getElementById('set-profile-name').value,
        email: document.getElementById('set-profile-email').value,
        phone: document.getElementById('set-profile-phone').value,
        bio: document.getElementById('set-profile-bio').value
      });
      window.TryonApp.showToast('Profile information saved.', 'success');
      window.TryonApp.renderRoute();
    });

    // Business form
    document.getElementById('form-settings-business')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.updateSettings('business', {
        name: document.getElementById('set-biz-name').value,
        email: document.getElementById('set-biz-email').value,
        phone: document.getElementById('set-biz-phone').value,
        currency: document.getElementById('set-biz-curr').value,
        address: document.getElementById('set-biz-addr').value,
        info: document.getElementById('set-biz-info').value
      });
      window.TryonApp.showToast('Business details updated.', 'success');
    });

    // Add user
    document.getElementById('btn-open-add-user')?.addEventListener('click', () => {
      window.TryonModals.openUserModal();
    });

    // Edit user
    document.querySelectorAll('.btn-edit-user').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonModals.openUserModal(id);
      });
    });

    // Delete user
    document.querySelectorAll('.btn-delete-user').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const state = window.TryonStore.getState();
        const u = state.users.find((usr) => usr.id === id);
        window.TryonModals.openDeleteConfirm(
          'Delete User Account?',
          `Are you sure you want to remove "${u ? u.name : 'this user'}"?`,
          () => {
            try {
              window.TryonStore.deleteUser(id);
              window.TryonApp.showToast('User removed.', 'info');
              window.TryonApp.renderRoute();
            } catch (err) {
              window.TryonApp.showToast(err.message, 'warning');
            }
          }
        );
      });
    });

    // Notifications form
    document.getElementById('form-settings-notif')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.updateSettings('notifications', {
        orderAlerts: document.getElementById('set-notif-order').checked,
        stockAlerts: document.getElementById('set-notif-stock').checked,
        emailReports: document.getElementById('set-notif-email').checked
      });
      window.TryonApp.showToast('Notification preferences saved.', 'success');
    });

    // Password form
    document.getElementById('form-settings-password')?.addEventListener('submit', (e) => {
      e.preventDefault();
      window.TryonApp.showToast('Password updated successfully.', 'success');
    });

    // Reset Demo Data trigger
    document.getElementById('btn-trigger-reset-demo')?.addEventListener('click', () => {
      window.TryonModals.openResetDemoConfirm();
    });
  }

  window.TryonPageSettings = {
    render,
    initEvents
  };
})();
