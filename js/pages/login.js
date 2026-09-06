/**
 * TRYON Super Admin Panel - Login Page
 * Professional auth screen matching the visual identity of TRYON,
 * with credential validation, show/hide password, and 1-click demo accounts.
 */

(function () {
  function render() {
    return `
      <div class="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        
        <!-- Center Box -->
        <div class="w-full max-w-md bg-white rounded-3xl border border-[#EAECEE] shadow-xl p-8 sm:p-10 relative overflow-hidden">
          
          <!-- Top Accent Bar -->
          <div class="absolute top-0 inset-x-0 h-1.5 bg-[#163326]"></div>

          <!-- Brand Logo & Header -->
          <div class="text-center mb-7">
            <img src="logo_final.png" alt="TRYON — WEAR YOUR STORY" class="h-12 sm:h-14 w-auto object-contain mx-auto mb-2" />
            <p class="text-xs text-[#64748B] mt-1">Sign in to your store management console</p>
          </div>

          <!-- Error Alert Container -->
          <div id="login-error-alert" class="hidden mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center space-x-2">
            <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
            <span id="login-error-text"></span>
          </div>

          <!-- Form -->
          <form id="login-form" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-[#374151] mb-1">Email Address</label>
              <div class="relative">
                <i data-lucide="mail" class="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3"></i>
                <input 
                  type="email" 
                  id="login-email" 
                  required 
                  placeholder="admin@tryon.demo" 
                  value="admin@tryon.demo"
                  class="w-full text-xs rounded-xl border border-[#D1D5DB] pl-10 pr-3.5 py-2.5 outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326] transition-colors"
                />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-semibold text-[#374151]">Password</label>
                <a href="javascript:void(0)" id="btn-forgot-password" class="text-[11px] font-semibold text-[#163326] hover:underline">Forgot password?</a>
              </div>
              <div class="relative">
                <i data-lucide="lock" class="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3"></i>
                <input 
                  type="password" 
                  id="login-password" 
                  required 
                  placeholder="••••••••" 
                  value="Admin@123"
                  class="w-full text-xs rounded-xl border border-[#D1D5DB] pl-10 pr-10 py-2.5 outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326] transition-colors"
                />
                <button type="button" id="btn-toggle-password" class="text-[#94A3B8] hover:text-[#475569] absolute right-3 top-2.5 p-0.5">
                  <i data-lucide="eye" id="icon-toggle-password" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" id="login-remember" checked class="w-3.5 h-3.5 rounded text-[#163326] focus:ring-[#163326] border-gray-300" />
                <span class="text-xs text-[#64748B]">Remember this device</span>
              </label>
            </div>

            <button 
              type="submit" 
              id="btn-login-submit" 
              class="w-full py-2.5 rounded-xl bg-[#163326] hover:bg-[#0E2219] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 mt-2"
            >
              <span id="login-btn-text">Sign In to Dashboard</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          </form>

          <!-- Subtle Demo Credentials Selector -->
          <div class="mt-8 pt-6 border-t border-[#F0F3F1]">
            <p class="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider text-center mb-3">
              One-Click Demo Accounts
            </p>
            <div class="grid grid-cols-3 gap-2">
              
              <!-- Admin Pill -->
              <button 
                type="button" 
                class="btn-quick-fill text-left p-2.5 rounded-xl border border-[#EAECEE] bg-[#FAFCFB] hover:border-[#163326] hover:bg-white transition-all group"
                data-email="admin@tryon.demo"
                data-pass="Admin@123"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-[#163326]">Admin</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-[#137333]"></span>
                </div>
                <p class="text-[9px] text-[#64748B] truncate mt-0.5">Full System</p>
              </button>

              <!-- Manager Pill -->
              <button 
                type="button" 
                class="btn-quick-fill text-left p-2.5 rounded-xl border border-[#EAECEE] bg-[#FAFCFB] hover:border-[#163326] hover:bg-white transition-all group"
                data-email="manager@tryon.demo"
                data-pass="Manager@123"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-[#163326]">Manager</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-[#1A73E8]"></span>
                </div>
                <p class="text-[9px] text-[#64748B] truncate mt-0.5">Operations</p>
              </button>

              <!-- User Pill -->
              <button 
                type="button" 
                class="btn-quick-fill text-left p-2.5 rounded-xl border border-[#EAECEE] bg-[#FAFCFB] hover:border-[#163326] hover:bg-white transition-all group"
                data-email="user@tryon.demo"
                data-pass="User@123"
              >
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-[#163326]">User</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-[#9333EA]"></span>
                </div>
                <p class="text-[9px] text-[#64748B] truncate mt-0.5">Day-to-day</p>
              </button>

            </div>
          </div>

        </div>

      </div>
    `;
  }

  function initEvents() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const togglePasswordBtn = document.getElementById('btn-toggle-password');
    const passwordIcon = document.getElementById('icon-toggle-password');
    const errorAlert = document.getElementById('login-error-alert');
    const errorText = document.getElementById('login-error-text');
    const submitBtn = document.getElementById('btn-login-submit');
    const btnText = document.getElementById('login-btn-text');

    // Toggle password visibility
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        passwordIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // Quick fill buttons
    document.querySelectorAll('.btn-quick-fill').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const email = e.currentTarget.getAttribute('data-email');
        const pass = e.currentTarget.getAttribute('data-pass');
        emailInput.value = email;
        passwordInput.value = pass;
        if (errorAlert) errorAlert.classList.add('hidden');
      });
    });

    // Forgot password alert
    document.getElementById('btn-forgot-password')?.addEventListener('click', () => {
      window.TryonApp.showToast('Please use the quick demo credentials below to log in.', 'info');
    });

    // Form submit
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const pass = passwordInput.value;

        // Show loading state
        submitBtn.disabled = true;
        btnText.textContent = 'Authenticating...';

        setTimeout(() => {
          const res = window.TryonStore.login(email, pass);
          if (res.success) {
            window.location.hash = '#dashboard';
            window.TryonApp.renderRoute();
          } else {
            errorText.textContent = res.error;
            errorAlert.classList.remove('hidden');
            submitBtn.disabled = false;
            btnText.textContent = 'Sign In to Dashboard';
          }
        }, 300);
      });
    }
  }

  window.TryonPageLogin = {
    render,
    initEvents
  };
})();
