/**
 * TRYON Super Admin Panel - Profit & Loss Page
 * Replicates Bottom-Right reference panel:
 * 4 Financial KPI cards (Revenue, Expenses, Net Profit, Margin),
 * Overview breakdown list with progress bars, Donut Chart,
 * Detailed Category Report table, and + Add Expense workflow.
 */

(function () {
  let donutChart = null;

  function render() {
    const store = window.TryonStore;
    const state = store.getState();

    const orders = state.orders;
    const expenses = state.expenses;

    // Financial calculations
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // COGS estimate: 35% of revenue if orders exist, plus any explicitly entered COGS
    const explicitCOGS = expenses
      .filter((e) => e.category === 'Cost of Goods Sold')
      .reduce((s, e) => s + e.amount, 0);
    const cogs = totalRevenue > 0 ? totalRevenue * 0.35 + explicitCOGS : explicitCOGS;

    const operatingExpenses = expenses
      .filter((e) => e.category !== 'Cost of Goods Sold')
      .reduce((s, e) => s + e.amount, 0);

    const netProfit = totalRevenue - (cogs + operatingExpenses);
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    // Detailed Category breakdown
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const categoryList = Object.entries(categoryTotals).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      pct: totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : 0
    }));

    return `
      <div class="space-y-6">
        
        <!-- Header & Period Filter -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">Profit & Loss</h1>
            <p class="text-xs sm:text-sm text-[#64748B] mt-0.5">View your financial performance and margin health</p>
          </div>

          <div class="flex items-center space-x-3">
            <select class="text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2 bg-white text-[#475569]">
              <option>This Month</option>
              <option>Last Quarter</option>
              <option>This Year</option>
            </select>

            <button id="btn-open-add-expense" class="px-4 py-2 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] flex items-center space-x-1.5 shadow-sm">
              <i data-lucide="plus-circle" class="w-4 h-4"></i>
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        <!-- 4 Financial KPI Cards matching Reference -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          <!-- Total Revenue -->
          <div class="tryon-card p-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#64748B]">Total Revenue</span>
              <div class="w-9 h-9 rounded-xl bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center">
                <i data-lucide="wallet" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-2xl font-bold text-[#111827]">$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <!-- Total Expenses -->
          <div class="tryon-card p-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#64748B]">Total Expenses</span>
              <div class="w-9 h-9 rounded-xl bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center">
                <i data-lucide="receipt" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-2xl font-bold text-[#111827]">$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <!-- Net Profit -->
          <div class="tryon-card p-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#64748B]">Net Profit</span>
              <div class="w-9 h-9 rounded-xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center">
                <i data-lucide="trending-up" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-2xl font-bold ${netProfit < 0 ? 'text-red-600' : 'text-[#137333]'}">
                $${netProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <!-- Profit Margin -->
          <div class="tryon-card p-5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#64748B]">Profit Margin</span>
              <div class="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#7E22CE] flex items-center justify-center">
                <i data-lucide="pie-chart" class="w-4 h-4"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-2xl font-bold text-[#111827]">${profitMargin}%</span>
            </div>
          </div>

        </div>

        <!-- Profit & Loss Overview & Donut Chart Split Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left 2 Cols: Financial Breakdown bars -->
          <div class="lg:col-span-2 tryon-card p-6 space-y-6">
            <div>
              <h3 class="text-sm font-bold text-[#111827]">Profit & Loss Overview</h3>
              <p class="text-xs text-[#64748B] mt-0.5">Summary of operating inflows, costs, and remaining bottom line</p>
            </div>

            <div class="space-y-4">
              <!-- Row: Revenue -->
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1.5">
                  <span class="text-[#334155]">Revenue</span>
                  <span class="text-[#163326] font-bold">$${totalRevenue.toFixed(2)}</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-[#EAECEE] overflow-hidden">
                  <div class="h-full bg-[#163326] rounded-full transition-all" style="width: ${totalRevenue > 0 ? '100%' : '0%'}"></div>
                </div>
              </div>

              <!-- Row: COGS -->
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1.5">
                  <span class="text-[#334155]">Cost of Goods Sold (COGS)</span>
                  <span class="text-[#64748B]">$${cogs.toFixed(2)}</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-[#EAECEE] overflow-hidden">
                  <div class="h-full bg-[#94A3B8] rounded-full transition-all" style="width: ${totalRevenue > 0 ? Math.min(100, (cogs / totalRevenue) * 100) + '%' : '0%'}"></div>
                </div>
              </div>

              <!-- Row: Operating Expenses -->
              <div>
                <div class="flex justify-between text-xs font-semibold mb-1.5">
                  <span class="text-[#334155]">Operating Expenses</span>
                  <span class="text-[#E11D48] font-bold">$${operatingExpenses.toFixed(2)}</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-[#EAECEE] overflow-hidden">
                  <div class="h-full bg-[#E11D48] rounded-full transition-all" style="width: ${totalRevenue > 0 ? Math.min(100, (operatingExpenses / totalRevenue) * 100) + '%' : totalExpenses > 0 ? '50%' : '0%'}"></div>
                </div>
              </div>

              <!-- Row: Net Profit -->
              <div class="pt-2 border-t border-gray-100">
                <div class="flex justify-between text-xs font-bold mb-1.5">
                  <span class="text-[#111827]">Net Profit</span>
                  <span class="${netProfit < 0 ? 'text-red-600' : 'text-[#137333]'}">$${netProfit.toFixed(2)}</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-[#EAECEE] overflow-hidden">
                  <div class="h-full ${netProfit < 0 ? 'bg-red-500' : 'bg-[#137333]'} rounded-full transition-all" style="width: ${totalRevenue > 0 ? Math.max(0, Math.min(100, (netProfit / totalRevenue) * 100)) + '%' : '0%'}"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right 1 Col: Donut Chart -->
          <div class="tryon-card p-6 flex flex-col justify-between">
            <div>
              <h3 class="text-sm font-bold text-[#111827]">Allocation Ratio</h3>
              <p class="text-xs text-[#64748B] mt-0.5">Net profit vs. expenses share</p>
            </div>

            <div class="h-52 relative my-auto">
              ${
                totalRevenue === 0 && totalExpenses === 0
                  ? `
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/80 z-10">
                  <p class="text-xs font-bold text-[#111827]">No financial data yet</p>
                  <p class="text-[11px] text-[#64748B] mt-0.5">Add orders or expenses to see ratio</p>
                </div>
              `
                  : ''
              }
              <canvas id="pl-donut-chart" class="w-full h-full"></canvas>
            </div>

            <div class="flex items-center justify-center space-x-4 text-[11px] text-[#64748B] pt-3 border-t border-gray-100">
              <span class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-[#163326] mr-1.5"></span>Profit</span>
              <span class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-[#E11D48] mr-1.5"></span>Expenses</span>
              <span class="flex items-center"><span class="w-2.5 h-2.5 rounded-full bg-[#94A3B8] mr-1.5"></span>COGS</span>
            </div>
          </div>

        </div>

        <!-- Detailed Category Report Table -->
        <div class="tryon-card overflow-hidden">
          <div class="p-5 border-b border-[#F0F3F1] flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-[#111827]">Detailed Expense Report</h3>
              <p class="text-xs text-[#64748B] mt-0.5">Breakdown of recorded operating costs</p>
            </div>
            <button id="btn-empty-add-expense-table" class="text-xs font-semibold text-[#163326] hover:underline flex items-center space-x-1">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Expense</span>
            </button>
          </div>

          ${
            expenses.length === 0
              ? `
            <div class="p-12 text-center">
              <div class="w-12 h-12 rounded-full bg-[#F4F6F5] text-[#163326] flex items-center justify-center mx-auto mb-2.5">
                <i data-lucide="file-text" class="w-5 h-5"></i>
              </div>
              <p class="text-xs font-bold text-[#111827]">No expense records found</p>
              <p class="text-[11px] text-[#64748B] mt-0.5 max-w-xs mx-auto">
                Record operating costs like logistics, marketing, or utilities to evaluate true net margins.
              </p>
              <button id="btn-empty-add-expense" class="mt-4 px-4 py-2 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219]">
                + Record First Expense
              </button>
            </div>
          `
              : `
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#F8F9FA] text-[#64748B] uppercase tracking-wider text-[10px] font-bold border-b border-[#EAECEE]">
                  <tr>
                    <th class="px-5 py-3">Expense Name</th>
                    <th class="px-5 py-3">Category</th>
                    <th class="px-5 py-3">Date</th>
                    <th class="px-5 py-3">Amount</th>
                    <th class="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F1F5F9]">
                  ${expenses
                    .map(
                      (e) => `
                    <tr class="hover:bg-[#F8FAFC]">
                      <td class="px-5 py-3.5 font-bold text-[#111827]">${e.name}</td>
                      <td class="px-5 py-3.5 text-[#475569] font-medium">${e.category}</td>
                      <td class="px-5 py-3.5 text-[#64748B]">${e.date}</td>
                      <td class="px-5 py-3.5 font-bold text-[#E11D48]">$${e.amount.toFixed(2)}</td>
                      <td class="px-5 py-3.5 text-right">
                        <button class="btn-delete-expense p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" data-id="${e.id}" title="Delete Expense">
                          <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
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
    const triggerAdd = () => window.TryonModals.openExpenseModal();

    document.getElementById('btn-open-add-expense')?.addEventListener('click', triggerAdd);
    document.getElementById('btn-empty-add-expense')?.addEventListener('click', triggerAdd);
    document.getElementById('btn-empty-add-expense-table')?.addEventListener('click', triggerAdd);

    document.querySelectorAll('.btn-delete-expense').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonStore.deleteExpense(id);
        window.TryonApp.showToast('Expense removed.', 'info');
        window.TryonApp.renderRoute();
      });
    });

    renderDonut();
  }

  function renderDonut() {
    const canvas = document.getElementById('pl-donut-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (donutChart) {
      donutChart.destroy();
      donutChart = null;
    }

    const state = window.TryonStore.getState();
    const orders = state.orders;
    const expenses = state.expenses;

    const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0);
    const cogs = totalRev * 0.35;
    const profit = Math.max(0, totalRev - (cogs + totalExp));

    const dataPoints = totalRev === 0 && totalExp === 0 ? [1] : [profit, totalExp, cogs];
    const bgColors =
      totalRev === 0 && totalExp === 0
        ? ['#EAECEE']
        : ['#163326', '#E11D48', '#94A3B8'];

    const ctx = canvas.getContext('2d');
    donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: totalRev === 0 && totalExp === 0 ? ['No Data'] : ['Net Profit', 'Expenses', 'COGS'],
        datasets: [
          {
            data: dataPoints,
            backgroundColor: bgColors,
            borderWidth: 0,
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: totalRev > 0 || totalExp > 0,
            callbacks: {
              label: (c) => ` ${c.label}: $${c.raw.toLocaleString()}`
            }
          }
        }
      }
    });
  }

  window.TryonPageProfitLoss = {
    render,
    initEvents
  };
})();
