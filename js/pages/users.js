/**
 * TRYON Super Admin Panel - User & Role Management Page
 * Complete implementation of RBAC, User Directory, Assign Role via Email,
 * Status Toggles, Admin Safeguards, and Activity Audit Log.
 */

(function () {
  let activeTab = 'users'; // 'users' | 'audit'
  let searchKeyword = '';
  let roleFilter = 'ALL';
  let statusFilter = 'ALL';

  function render(subRoute) {
    if (subRoute === 'audit') {
      activeTab = 'audit';
    } else if (subRoute === 'all' || subRoute === '') {
      activeTab = 'users';
    }

    const store = window.TryonStore;
    const currentUser = store.getCurrentUser();
    const state = store.getState();
    const users = state.users || [];
    const auditLogs = store.getAuditLogs ? store.getAuditLogs() : (state.auditLogs || []);

    const userRole = currentUser ? currentUser.role : 'Admin';
    const isAdmin = userRole === 'Admin';
    const isManager = userRole === 'Manager';

    // Calculate metrics
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === 'Admin').length;
    const managerCount = users.filter((u) => u.role === 'Manager').length;
    const activeCount = users.filter((u) => u.status === 'Active').length;

    // Filter users list
    const filteredUsers = users.filter((u) => {
      const matchesSearch =
        !searchKeyword ||
        u.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        u.email.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    return `
      <div class="space-y-6">
        
        <!-- Header & Top Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2.5">
              <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">User & Role Management</h1>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isAdmin ? 'bg-[#E4EFE7] text-[#163326]' : 'bg-[#E8F0FE] text-[#1A73E8]'
              }">
                ${userRole} View
              </span>
            </div>
            <p class="text-xs sm:text-sm text-[#64748B] mt-1">
              Control staff credentials, assign permissions by email, and inspect security audit trails.
            </p>
          </div>

          <div class="flex items-center space-x-3">
            ${
              isAdmin
                ? `
              <button id="btn-open-add-user-page" class="px-4 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] flex items-center space-x-2 shadow-sm transition-all">
                <i data-lucide="user-plus" class="w-4 h-4"></i>
                <span>Add User</span>
              </button>
            `
                : `
              <div class="inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
                <i data-lucide="info" class="w-3.5 h-3.5 mr-1.5 text-amber-600"></i>
                <span>Manager view: Administrative changes restricted</span>
              </div>
            `
            }
          </div>
        </div>

        <!-- Metric KPI Cards (4 Cards) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="tryon-card p-4.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#64748B]">Total Staff</span>
              <div class="w-8 h-8 rounded-xl bg-[#EAECEE] text-[#475569] flex items-center justify-center">
                <i data-lucide="users" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-2xl font-bold text-[#111827]">${totalUsers}</span>
              <span class="text-[11px] text-[#64748B]">Accounts</span>
            </div>
          </div>

          <div class="tryon-card p-4.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#64748B]">Administrators</span>
              <div class="w-8 h-8 rounded-xl bg-[#E4EFE7] text-[#163326] flex items-center justify-center">
                <i data-lucide="shield-check" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-2xl font-bold text-[#111827]">${adminCount}</span>
              <span class="text-[11px] font-semibold text-[#163326]">Full Control</span>
            </div>
          </div>

          <div class="tryon-card p-4.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#64748B]">Managers</span>
              <div class="w-8 h-8 rounded-xl bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center">
                <i data-lucide="briefcase" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-2xl font-bold text-[#111827]">${managerCount}</span>
              <span class="text-[11px] font-semibold text-[#1A73E8]">Operations</span>
            </div>
          </div>

          <div class="tryon-card p-4.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#64748B]">Active Accounts</span>
              <div class="w-8 h-8 rounded-xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center">
                <i data-lucide="check-circle" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-2xl font-bold text-[#111827]">${activeCount}</span>
              <span class="inline-flex items-center text-[11px] font-semibold text-[#137333]">
                <span class="w-1.5 h-1.5 rounded-full bg-[#137333] mr-1 animate-pulse"></span>
                Active
              </span>
            </div>
          </div>

        </div>

        ${
          isAdmin
            ? `
        <!-- ASSIGN ROLE VIA EMAIL PANEL (Required Feature) -->
        <div class="tryon-card p-6 border-l-4 border-l-[#163326]">
          <div class="max-w-4xl">
            <div class="flex items-center space-x-2.5 mb-1.5">
              <div class="w-7 h-7 rounded-lg bg-[#E4EFE7] text-[#163326] flex items-center justify-center">
                <i data-lucide="mail-check" class="w-4 h-4"></i>
              </div>
              <h3 class="text-sm font-bold text-[#111827]">Assign or Change Role via Email</h3>
            </div>
            <p class="text-xs text-[#64748B] mb-4">
              Enter an existing staff member's email address to immediately reassign their system access role.
            </p>

            <!-- Inline Alert Message Container -->
            <div id="assign-role-alert" class="hidden mb-4 p-3 rounded-xl text-xs flex items-center space-x-2"></div>

            <form id="form-assign-role-email" class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div class="sm:col-span-6">
                <label class="block text-xs font-semibold text-[#374151] mb-1">User Email Address *</label>
                <div class="relative">
                  <i data-lucide="mail" class="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3"></i>
                  <input 
                    type="email" 
                    id="input-assign-email" 
                    required 
                    placeholder="e.g. manager@example.com" 
                    class="w-full text-xs rounded-xl border border-[#D1D5DB] pl-10 pr-3.5 py-2.5 outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326] transition-colors"
                  />
                </div>
              </div>

              <div class="sm:col-span-4">
                <label class="block text-xs font-semibold text-[#374151] mb-1">Target Role *</label>
                <div class="relative">
                  <select id="select-assign-role" class="w-full text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 bg-white outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326]">
                    <option value="Admin">Admin (Full System Access)</option>
                    <option value="Manager" selected>Manager (Operations & Reports)</option>
                    <option value="User">User (Day-to-day Limited)</option>
                  </select>
                </div>
              </div>

              <div class="sm:col-span-2">
                <button 
                  type="submit" 
                  id="btn-submit-assign-role"
                  class="w-full py-2.5 px-4 rounded-xl bg-[#163326] hover:bg-[#0E2219] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-1.5"
                >
                  <i data-lucide="check" class="w-3.5 h-3.5"></i>
                  <span>Assign Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        `
            : ''
        }

        <!-- Navigation Tabs (Users Directory vs. Activity Log) -->
        <div class="flex items-center space-x-2 border-b border-[#EAECEE]">
          <button class="user-subtab-btn px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'users'
              ? 'border-b-2 border-[#163326] text-[#163326] font-bold bg-[#F4F7F5]'
              : 'text-[#64748B] hover:text-[#111827]'
          }" data-subtab="users">
            <i data-lucide="users" class="w-3.5 h-3.5"></i>
            <span>Staff Directory</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'users' ? 'bg-[#163326] text-white' : 'bg-[#EAECEE] text-[#64748B]'
            }">${users.length}</span>
          </button>

          <button class="user-subtab-btn px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
            activeTab === 'audit'
              ? 'border-b-2 border-[#163326] text-[#163326] font-bold bg-[#F4F7F5]'
              : 'text-[#64748B] hover:text-[#111827]'
          }" data-subtab="audit">
            <i data-lucide="history" class="w-3.5 h-3.5"></i>
            <span>Activity Audit Log</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'audit' ? 'bg-[#163326] text-white' : 'bg-[#EAECEE] text-[#64748B]'
            }">${auditLogs.length}</span>
          </button>
        </div>

        <!-- Tab 1: Staff Directory Table View -->
        ${
          activeTab === 'users'
            ? `
          <div class="tryon-card overflow-hidden">
            
            <!-- Filters Toolbar -->
            <div class="p-4 sm:p-5 border-b border-[#F0F3F1] bg-[#FAFCFB] flex flex-col md:flex-row items-center justify-between gap-3">
              <!-- Search Bar -->
              <div class="relative w-full md:w-80">
                <i data-lucide="search" class="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5"></i>
                <input 
                  type="text" 
                  id="users-search-input" 
                  value="${searchKeyword}" 
                  placeholder="Search by name or email..." 
                  class="w-full text-xs rounded-xl border border-[#D1D5DB] pl-9 pr-3.5 py-2 outline-none focus:border-[#163326] bg-white transition-colors"
                />
              </div>

              <!-- Filter Dropdowns -->
              <div class="flex items-center space-x-2.5 w-full md:w-auto">
                <select id="users-role-filter" class="text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white outline-none">
                  <option value="ALL" ${roleFilter === 'ALL' ? 'selected' : ''}>All Roles</option>
                  <option value="Admin" ${roleFilter === 'Admin' ? 'selected' : ''}>Admin</option>
                  <option value="Manager" ${roleFilter === 'Manager' ? 'selected' : ''}>Manager</option>
                  <option value="User" ${roleFilter === 'User' ? 'selected' : ''}>User</option>
                </select>

                <select id="users-status-filter" class="text-xs rounded-xl border border-[#D1D5DB] px-3 py-2 bg-white outline-none">
                  <option value="ALL" ${statusFilter === 'ALL' ? 'selected' : ''}>All Status</option>
                  <option value="Active" ${statusFilter === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Inactive" ${statusFilter === 'Inactive' ? 'selected' : ''}>Inactive</option>
                </select>

                ${
                  searchKeyword || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? `
                  <button id="btn-reset-user-filters" class="text-xs text-[#64748B] hover:text-[#163326] px-2 py-1 font-semibold">
                    Clear
                  </button>
                `
                    : ''
                }
              </div>
            </div>

            <!-- Table or Empty Filter State -->
            ${
              filteredUsers.length === 0
                ? `
              <div class="p-12 text-center">
                <div class="w-12 h-12 rounded-full bg-[#F3F4F6] text-[#94A3B8] flex items-center justify-center mx-auto mb-2.5">
                  <i data-lucide="user-x" class="w-5 h-5"></i>
                </div>
                <h4 class="text-xs font-bold text-[#1E293B]">No staff accounts match your filters</h4>
                <p class="text-[11px] text-[#94A3B8] mt-0.5">Try resetting search criteria or add a new user.</p>
              </div>
            `
                : `
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#F8F9FA] text-[#64748B] uppercase tracking-wider text-[10px] font-bold border-b border-[#EAECEE]">
                    <tr>
                      <th class="px-5 py-3">User Name</th>
                      <th class="px-5 py-3">Email</th>
                      <th class="px-5 py-3">Role</th>
                      <th class="px-5 py-3">Status</th>
                      <th class="px-5 py-3">Date Added</th>
                      <th class="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#F1F5F9]">
                    ${filteredUsers
                      .map((u) => {
                        const isSelf = currentUser && (currentUser.id === u.id || currentUser.email.toLowerCase() === u.email.toLowerCase());
                        const isPrimaryAdmin = u.id === 'usr-1' || u.email.toLowerCase() === 'admin@tryon.demo';

                        return `
                        <tr class="hover:bg-[#F8FAFC] transition-colors">
                          
                          <!-- User Name + Avatar -->
                          <td class="px-5 py-3.5">
                            <div class="flex items-center space-x-3">
                              <div class="w-8 h-8 rounded-full ${
                                u.role === 'Admin'
                                  ? 'bg-[#163326] text-white'
                                  : u.role === 'Manager'
                                  ? 'bg-[#1A73E8] text-white'
                                  : 'bg-[#7E22CE] text-white'
                              } flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                ${u.avatar || u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div class="flex items-center space-x-1.5">
                                  <span class="font-bold text-[#111827]">${u.name}</span>
                                  ${
                                    isSelf
                                      ? `<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#E4EFE7] text-[#163326]">You</span>`
                                      : ''
                                  }
                                </div>
                                <span class="text-[10px] text-[#94A3B8]">ID: ${u.id}</span>
                              </div>
                            </div>
                          </td>

                          <!-- Email -->
                          <td class="px-5 py-3.5 font-medium text-[#475569]">
                            <span class="font-mono text-xs">${u.email}</span>
                          </td>

                          <!-- Role Badge -->
                          <td class="px-5 py-3.5">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              u.role === 'Admin'
                                ? 'bg-[#E4EFE7] text-[#163326] border border-[#CEEAD6]'
                                : u.role === 'Manager'
                                ? 'bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC]'
                                : 'bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]'
                            }">
                              <i data-lucide="${
                                u.role === 'Admin' ? 'shield-check' : u.role === 'Manager' ? 'briefcase' : 'user'
                              }" class="w-3 h-3 mr-1"></i>
                              ${u.role}
                            </span>
                          </td>

                          <!-- Status Badge -->
                          <td class="px-5 py-3.5">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'Active'
                                ? 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]'
                                : 'bg-[#FCE8E6] text-[#C5221F] border border-[#FAD2CF]'
                            }">
                              <span class="w-1.5 h-1.5 rounded-full ${
                                u.status === 'Active' ? 'bg-[#137333] animate-pulse' : 'bg-[#C5221F]'
                              } mr-1"></span>
                              ${u.status}
                            </span>
                          </td>

                          <!-- Date Added -->
                          <td class="px-5 py-3.5 text-[#64748B] text-xs">
                            ${u.createdAt || '2026-01-01'}
                          </td>

                          <!-- Actions Column -->
                          <td class="px-5 py-3.5 text-right">
                            ${
                              isAdmin
                                ? `
                              <div class="inline-flex items-center space-x-1">
                                <!-- Edit User -->
                                <button 
                                  class="btn-action-edit-user p-1.5 rounded-lg text-gray-400 hover:text-[#163326] hover:bg-gray-100 transition-colors" 
                                  data-id="${u.id}" 
                                  title="Edit User"
                                >
                                  <i data-lucide="edit-3" class="w-4 h-4"></i>
                                </button>

                                <!-- Change Role -->
                                <button 
                                  class="btn-action-change-role p-1.5 rounded-lg text-gray-400 hover:text-[#1A73E8] hover:bg-blue-50 transition-colors" 
                                  data-id="${u.id}" 
                                  data-email="${u.email}"
                                  data-role="${u.role}"
                                  title="Change Role"
                                >
                                  <i data-lucide="shield" class="w-4 h-4"></i>
                                </button>

                                <!-- Activate / Deactivate Toggle -->
                                <button 
                                  class="btn-action-toggle-status p-1.5 rounded-lg ${
                                    u.status === 'Active'
                                      ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                  } transition-colors" 
                                  data-id="${u.id}" 
                                  data-status="${u.status}"
                                  title="${u.status === 'Active' ? 'Deactivate User' : 'Activate User'}"
                                >
                                  <i data-lucide="${u.status === 'Active' ? 'power-off' : 'check-circle'}" class="w-4 h-4"></i>
                                </button>

                                <!-- Delete User -->
                                ${
                                  !isPrimaryAdmin
                                    ? `
                                  <button 
                                    class="btn-action-delete-user p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" 
                                    data-id="${u.id}" 
                                    data-name="${u.name}"
                                    title="Delete User"
                                  >
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                  </button>
                                `
                                    : ''
                                }
                              </div>
                            `
                                : `
                              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold text-[#94A3B8] bg-gray-100">
                                View Only
                              </span>
                            `
                            }
                          </td>
                        </tr>
                      `;
                      })
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
            }

          </div>
        `
            : `
          <!-- Tab 2: Activity / Audit Log Table View -->
          <div class="tryon-card overflow-hidden">
            <div class="p-5 border-b border-[#F0F3F1] bg-[#FAFCFB] flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-[#111827]">Security & Administrative Activity Log</h3>
                <p class="text-xs text-[#64748B] mt-0.5">Immutable record of staff changes, role reassignments, and data imports.</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E4EFE7] text-[#163326]">
                ${auditLogs.length} Events Recorded
              </span>
            </div>

            ${
              auditLogs.length === 0
                ? `
              <div class="p-12 text-center">
                <div class="w-12 h-12 rounded-full bg-[#F3F4F6] text-[#94A3B8] flex items-center justify-center mx-auto mb-2.5">
                  <i data-lucide="clipboard-list" class="w-5 h-5"></i>
                </div>
                <h4 class="text-xs font-bold text-[#1E293B]">No audit events logged yet</h4>
                <p class="text-[11px] text-[#94A3B8] mt-0.5">Staff modifications and imports will be tracked here.</p>
              </div>
            `
                : `
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#F8F9FA] text-[#64748B] uppercase tracking-wider text-[10px] font-bold border-b border-[#EAECEE]">
                    <tr>
                      <th class="px-5 py-3">Action</th>
                      <th class="px-5 py-3">Performed By</th>
                      <th class="px-5 py-3">Target Entity</th>
                      <th class="px-5 py-3">Details / Context</th>
                      <th class="px-5 py-3 text-right">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#F1F5F9]">
                    ${auditLogs
                      .map((log) => {
                        const isCreate = log.action.includes('created');
                        const isDelete = log.action.includes('deleted');
                        const isRole = log.action.includes('Role');
                        const isStatus = log.action.includes('activated') || log.action.includes('deactivated');
                        const isImport = log.action.includes('imported');

                        return `
                        <tr class="hover:bg-[#F8FAFC] transition-colors">
                          <td class="px-5 py-3.5">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCreate
                                ? 'bg-[#E6F4EA] text-[#137333]'
                                : isDelete
                                ? 'bg-[#FCE8E6] text-[#C5221F]'
                                : isRole
                                ? 'bg-[#E8F0FE] text-[#1A73E8]'
                                : isStatus
                                ? 'bg-[#FEF7E0] text-[#B06000]'
                                : isImport
                                ? 'bg-[#F3E8FF] text-[#7E22CE]'
                                : 'bg-gray-100 text-gray-700'
                            }">
                              ${log.action}
                            </span>
                          </td>
                          <td class="px-5 py-3.5 font-semibold text-[#111827]">
                            ${log.performedBy}
                          </td>
                          <td class="px-5 py-3.5 text-[#475569] font-medium">
                            ${log.targetUser || '—'}
                          </td>
                          <td class="px-5 py-3.5 text-[#64748B] text-[11px] max-w-xs truncate">
                            ${log.details || '—'}
                          </td>
                          <td class="px-5 py-3.5 text-right text-[#94A3B8] font-mono text-[11px]">
                            ${log.formattedDate || log.timestamp}
                          </td>
                        </tr>
                      `;
                      })
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
            }
          </div>
        `
        }

      </div>
    `;
  }

  function initEvents() {
    const store = window.TryonStore;

    // Subtab switching (Users vs Audit)
    document.querySelectorAll('.user-subtab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-subtab');
        activeTab = target;
        window.location.hash = `#users:${target}`;
      });
    });

    // Search input
    const searchInput = document.getElementById('users-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchKeyword = e.target.value;
        const main = document.getElementById('app-main-content');
        if (main) {
          main.innerHTML = render(activeTab);
          initEvents();
          if (window.lucide) window.lucide.createIcons();
        }
      });
    }

    // Role filter
    const roleSelect = document.getElementById('users-role-filter');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        roleFilter = e.target.value;
        window.TryonApp.renderRoute();
      });
    }

    // Status filter
    const statusSelect = document.getElementById('users-status-filter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        window.TryonApp.renderRoute();
      });
    }

    // Reset filters
    document.getElementById('btn-reset-user-filters')?.addEventListener('click', () => {
      searchKeyword = '';
      roleFilter = 'ALL';
      statusFilter = 'ALL';
      window.TryonApp.renderRoute();
    });

    // Open Add User Modal
    document.getElementById('btn-open-add-user-page')?.addEventListener('click', () => {
      window.TryonModals?.openUserModal();
    });

    // ASSIGN ROLE VIA EMAIL FORM SUBMISSION (Requirement)
    const assignForm = document.getElementById('form-assign-role-email');
    if (assignForm) {
      assignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('input-assign-email');
        const roleSelect = document.getElementById('select-assign-role');
        const alertBox = document.getElementById('assign-role-alert');

        const email = (emailInput?.value || '').trim();
        const role = roleSelect?.value;

        if (!email) return;

        try {
          const res = store.assignRoleByEmail(email, role);
          if (alertBox) {
            alertBox.className = 'mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800';
            alertBox.innerHTML = `
              <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
              <span>Successfully assigned <strong>${role}</strong> role to <strong>${email}</strong>.</span>
            `;
            alertBox.classList.remove('hidden');
            if (window.lucide) window.lucide.createIcons();
          }

          emailInput.value = '';
          window.TryonApp.showToast(`Role updated to ${role} for ${email}`, 'success');

          setTimeout(() => {
            window.TryonApp.renderRoute();
          }, 800);
        } catch (err) {
          if (alertBox) {
            alertBox.className = 'mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700';
            alertBox.innerHTML = `
              <i data-lucide="alert-circle" class="w-4 h-4 text-red-600"></i>
              <span>${err.message}</span>
            `;
            alertBox.classList.remove('hidden');
            if (window.lucide) window.lucide.createIcons();
          }
          window.TryonApp.showToast(err.message, 'error');
        }
      });
    }

    // Edit user buttons
    document.querySelectorAll('.btn-action-edit-user').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonModals?.openUserModal(id);
      });
    });

    // Quick Change Role action
    document.querySelectorAll('.btn-action-change-role').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const email = e.currentTarget.getAttribute('data-email');
        const currentRole = e.currentTarget.getAttribute('data-role');
        const id = e.currentTarget.getAttribute('data-id');

        // Pre-fill the Assign Role by Email form
        const emailInput = document.getElementById('input-assign-email');
        const roleSelect = document.getElementById('select-assign-role');
        if (emailInput && roleSelect) {
          emailInput.value = email;
          const nextRole = currentRole === 'User' ? 'Manager' : currentRole === 'Manager' ? 'Admin' : 'User';
          roleSelect.value = nextRole;
          emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          emailInput.focus();
        } else {
          window.TryonModals?.openUserModal(id);
        }
      });
    });

    // Toggle user status (Activate / Deactivate)
    document.querySelectorAll('.btn-action-toggle-status').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const currentStatus = e.currentTarget.getAttribute('data-status');

        try {
          store.toggleUserStatus(id);
          window.TryonApp.showToast(`User account status set to ${currentStatus === 'Active' ? 'Inactive' : 'Active'}`, 'info');
          window.TryonApp.renderRoute();
        } catch (err) {
          window.TryonApp.showToast(err.message, 'error');
        }
      });
    });

    // Delete user button
    document.querySelectorAll('.btn-action-delete-user').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');

        window.TryonModals?.openDeleteConfirm(
          'Delete Staff Account?',
          `Are you sure you want to delete the account for "${name}"? This action cannot be undone.`,
          () => {
            try {
              store.deleteUser(id);
              window.TryonApp.showToast(`User "${name}" removed.`, 'info');
              window.TryonApp.renderRoute();
            } catch (err) {
              window.TryonApp.showToast(err.message, 'error');
            }
          }
        );
      });
    });
  }

  window.TryonPageUsers = {
    render,
    initEvents
  };
})();
