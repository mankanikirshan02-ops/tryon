/**
 * TRYON Super Admin Panel - Import Data Modal Component
 * Supports CSV and Excel (.xlsx, .xls) parsing via SheetJS,
 * drag & drop file upload, data preview, smart column mapping,
 * row-by-row validation with error report CSV export,
 * automatic report recalculation, and import history with undo/revert.
 */

(function () {
  const containerId = 'app-import-modal-container';

  let currentTab = 'import'; // 'import' | 'history'
  let currentStep = 1; // 1: Upload, 2: Mapping & Preview, 3: Validation, 4: Complete

  let uploadedFile = null;
  let rawHeaders = [];
  let rawRows = [];
  let detectedMappings = {};
  let validationResults = { valid: [], errors: [] };
  let lastImportSummary = null;

  // Target schema fields for mapping
  const TARGET_FIELDS = [
    { key: 'date', label: 'Order Date', required: true, hint: 'YYYY-MM-DD or MM/DD/YYYY' },
    { key: 'orderId', label: 'Invoice / Order ID', required: false, hint: 'e.g. ORD-1092 (optional)' },
    { key: 'customerName', label: 'Customer Name', required: false, hint: 'e.g. Sarah Jenkins' },
    { key: 'customerEmail', label: 'Customer Email', required: false, hint: 'e.g. sarah@example.com' },
    { key: 'productName', label: 'Product Name', required: true, hint: 'e.g. Classic Oversized Tee' },
    { key: 'category', label: 'Category', required: false, hint: 'Tees, Jackets, Hoodies, etc.' },
    { key: 'quantity', label: 'Quantity', required: true, hint: 'Positive integer (e.g. 2)' },
    { key: 'price', label: 'Unit Price ($)', required: true, hint: 'e.g. 49.00' },
    { key: 'total', label: 'Total Sales ($)', required: false, hint: 'Auto-calculated if blank' },
    { key: 'cost', label: 'Cost / Expense ($)', required: false, hint: 'For COGS / Profit & Loss' },
    { key: 'status', label: 'Order Status', required: false, hint: 'Delivered, Processing, etc.' }
  ];

  function getContainer() {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    return container;
  }

  function open(initialTab = 'import') {
    currentTab = initialTab;
    currentStep = 1;
    uploadedFile = null;
    rawHeaders = [];
    rawRows = [];
    detectedMappings = {};
    validationResults = { valid: [], errors: [] };
    lastImportSummary = null;
    render();
  }

  function close() {
    const container = getContainer();
    container.innerHTML = '';
  }

  function render() {
    const container = getContainer();
    container.innerHTML = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl border border-[#EAECEE] shadow-2xl w-full max-w-4xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
          
          <!-- Top Header -->
          <div class="px-6 py-4 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
            <div>
              <div class="flex items-center space-x-2">
                <span class="w-8 h-8 rounded-xl bg-[#E4EFE7] text-[#163326] flex items-center justify-center">
                  <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                </span>
                <h3 class="text-base font-bold text-[#111827]">Import Reports Data</h3>
              </div>
              <p class="text-xs text-[#64748B] mt-0.5">Upload CSV or Excel spreadsheets to populate Sales, Revenue, and Profit & Loss</p>
            </div>

            <!-- Tab Switcher -->
            <div class="flex items-center space-x-3">
              <div class="flex items-center bg-[#F1F5F3] p-1 rounded-xl">
                <button id="tab-btn-import" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'import' ? 'bg-white text-[#163326] shadow-sm' : 'text-[#64748B] hover:text-[#111827]'
                }">New Import</button>
                <button id="tab-btn-history" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'history' ? 'bg-white text-[#163326] shadow-sm' : 'text-[#64748B] hover:text-[#111827]'
                }">Import History</button>
              </div>

              <button id="btn-close-import-modal" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>
          </div>

          <!-- Body Viewport -->
          <div class="flex-1 overflow-y-auto p-6">
            ${currentTab === 'import' ? renderImportStep() : renderHistoryView()}
          </div>

        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
    bindEvents();
  }

  // ===================== WIZARD STEPS =====================

  function renderImportStep() {
    return `
      <!-- Stepper Indicator -->
      <div class="mb-6 flex items-center justify-between max-w-xl mx-auto">
        <div class="flex items-center space-x-2">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            currentStep >= 1 ? 'bg-[#163326] text-white' : 'bg-gray-100 text-gray-400'
          }">1</div>
          <span class="text-xs font-semibold ${currentStep >= 1 ? 'text-[#163326]' : 'text-gray-400'}">Upload File</span>
        </div>
        <div class="flex-1 h-0.5 mx-3 ${currentStep >= 2 ? 'bg-[#163326]' : 'bg-gray-200'}"></div>
        <div class="flex items-center space-x-2">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            currentStep >= 2 ? 'bg-[#163326] text-white' : 'bg-gray-100 text-gray-400'
          }">2</div>
          <span class="text-xs font-semibold ${currentStep >= 2 ? 'text-[#163326]' : 'text-gray-400'}">Map & Preview</span>
        </div>
        <div class="flex-1 h-0.5 mx-3 ${currentStep >= 3 ? 'bg-[#163326]' : 'bg-gray-200'}"></div>
        <div class="flex items-center space-x-2">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            currentStep >= 3 ? 'bg-[#163326] text-white' : 'bg-gray-100 text-gray-400'
          }">3</div>
          <span class="text-xs font-semibold ${currentStep >= 3 ? 'text-[#163326]' : 'text-gray-400'}">Validate</span>
        </div>
      </div>

      <!-- Step Contents -->
      ${
        currentStep === 1
          ? renderStep1Upload()
          : currentStep === 2
          ? renderStep2Mapping()
          : currentStep === 3
          ? renderStep3Validation()
          : renderStep4Complete()
      }
    `;
  }

  // --- STEP 1: UPLOAD ---
  function renderStep1Upload() {
    return `
      <div class="max-w-xl mx-auto space-y-5">
        <!-- Drag & Drop Area -->
        <div 
          id="import-drop-zone" 
          class="border-2 border-dashed border-[#CBD5E1] hover:border-[#163326] bg-[#FAFCFB] hover:bg-[#F4F8F5] rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer group"
        >
          <div class="w-14 h-14 rounded-2xl bg-[#E4EFE7] text-[#163326] flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 transition-transform">
            <i data-lucide="upload-cloud" class="w-7 h-7"></i>
          </div>
          
          <h4 class="text-sm font-bold text-[#111827]">Drag and drop your spreadsheet here</h4>
          <p class="text-xs text-[#64748B] mt-1">Supports <strong class="text-[#163326]">CSV</strong>, <strong class="text-[#163326]">XLSX</strong>, or <strong class="text-[#163326]">XLS</strong> files (up to 10 MB)</p>

          <div class="mt-4 flex items-center justify-center space-x-3">
            <label class="px-4 py-2 rounded-xl bg-[#163326] hover:bg-[#0E2219] text-white text-xs font-semibold cursor-pointer shadow-sm transition-all inline-flex items-center space-x-1.5">
              <i data-lucide="folder-open" class="w-3.5 h-3.5"></i>
              <span>Browse File</span>
              <input type="file" id="file-input-field" accept=".csv, .xlsx, .xls" class="hidden" />
            </label>
          </div>
        </div>

        <!-- Sample Template Link Box -->
        <div class="p-4 rounded-2xl bg-[#F8F9FA] border border-[#EAECEE] flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-[#E6F4EA] text-[#137333] flex items-center justify-center">
              <i data-lucide="file-text" class="w-4 h-4"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-[#111827]">Need a sample template?</p>
              <p class="text-[11px] text-[#64748B]">Download our pre-formatted apparel sales CSV template to test immediately</p>
            </div>
          </div>
          <button id="btn-download-template" class="px-3 py-1.5 rounded-xl border border-[#D1D5DB] hover:bg-white text-xs font-semibold text-[#163326] transition-colors flex items-center space-x-1">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>Sample CSV</span>
          </button>
        </div>

        <!-- Error Message Container if file invalid -->
        <div id="upload-error-msg" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center space-x-2">
          <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
          <span id="upload-error-text"></span>
        </div>
      </div>
    `;
  }

  // --- STEP 2: MAPPING & DATA PREVIEW ---
  function renderStep2Mapping() {
    const previewRows = rawRows.slice(0, 10);

    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-bold text-[#111827]">Map Spreadsheet Columns</h4>
            <p class="text-xs text-[#64748B] mt-0.5">
              File: <span class="font-semibold text-[#163326]">${uploadedFile.name}</span> • 
              <strong>${rawRows.length}</strong> total row(s) detected
            </p>
          </div>
          <button id="btn-back-to-step1" class="text-xs font-semibold text-[#64748B] hover:text-[#111827]">
            ← Choose Different File
          </button>
        </div>

        <!-- Column Mapping Grid -->
        <div class="p-4 rounded-2xl bg-[#F8F9FA] border border-[#EAECEE] space-y-3">
          <div class="flex items-center justify-between border-b border-gray-200 pb-2">
            <span class="text-xs font-bold text-[#111827]">Required & Optional Fields</span>
            <span class="text-[11px] text-[#64748B]">Match each database field with a spreadsheet column</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${TARGET_FIELDS.map((target) => {
              const selectedCol = detectedMappings[target.key] || '';
              return `
                <div class="p-2.5 rounded-xl bg-white border border-[#EAECEE] space-y-1">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] font-bold ${target.required ? 'text-[#163326]' : 'text-[#475569]'}">
                      ${target.label} ${target.required ? '<span class="text-red-500">*</span>' : ''}
                    </label>
                  </div>
                  <select class="mapping-select w-full text-xs rounded-lg border border-[#D1D5DB] px-2 py-1.5 bg-white outline-none focus:border-[#163326]" data-field="${target.key}">
                    <option value="">-- Ignore / Not in file --</option>
                    ${rawHeaders
                      .map(
                        (h) => `
                      <option value="${h}" ${selectedCol === h ? 'selected' : ''}>
                        ${h}
                      </option>
                    `
                      )
                      .join('')}
                  </select>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Live Data Preview Table -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#111827]">Data Preview (First ${previewRows.length} Rows)</h4>
            <span class="text-[11px] text-[#64748B]">Showing parsed spreadsheet records</span>
          </div>

          <div class="overflow-x-auto border border-[#EAECEE] rounded-2xl max-h-60">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#F8F9FA] text-[#64748B] text-[10px] font-bold uppercase tracking-wider border-b border-[#EAECEE] sticky top-0">
                <tr>
                  <th class="px-4 py-2.5 w-12 text-center">#</th>
                  ${rawHeaders.map((h) => `<th class="px-4 py-2.5 whitespace-nowrap">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F1F5F9]">
                ${previewRows
                  .map(
                    (row, idx) => `
                  <tr class="hover:bg-[#F8FAFC]">
                    <td class="px-4 py-2 text-center text-[#94A3B8] font-mono">${idx + 1}</td>
                    ${rawHeaders
                      .map((h) => `<td class="px-4 py-2 whitespace-nowrap text-[#111827]">${row[h] !== undefined ? row[h] : ''}</td>`)
                      .join('')}
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-[#F0F3F1] flex items-center justify-end space-x-3">
          <button id="btn-cancel-mapping" class="px-4 py-2 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button id="btn-proceed-to-validation" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] shadow-sm flex items-center space-x-1.5">
            <span>Validate Data</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
    `;
  }

  // --- STEP 3: VALIDATION & ERROR REPORT ---
  function renderStep3Validation() {
    const validCount = validationResults.valid.length;
    const errorCount = validationResults.errors.length;
    const total = validCount + errorCount;

    return `
      <div class="space-y-6">
        <div>
          <h4 class="text-sm font-bold text-[#111827]">Validation Results</h4>
          <p class="text-xs text-[#64748B] mt-0.5">Review record compliance before updating store reports</p>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-white border border-[#EAECEE] flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-[#64748B]">Total Processed</span>
              <p class="text-xl font-bold text-[#111827] mt-1">${total}</p>
            </div>
            <div class="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
              <i data-lucide="layers" class="w-4 h-4"></i>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-[#E6F4EA] border border-[#CEEAD6] flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold text-[#137333]">Valid Records</span>
              <p class="text-xl font-bold text-[#137333] mt-1">${validCount}</p>
            </div>
            <div class="w-9 h-9 rounded-xl bg-[#CEEAD6] text-[#137333] flex items-center justify-center">
              <i data-lucide="check-circle" class="w-4 h-4"></i>
            </div>
          </div>

          <div class="p-4 rounded-2xl ${errorCount > 0 ? 'bg-[#FCE8E6] border border-[#FAD2CF]' : 'bg-gray-50 border border-gray-200'} flex items-center justify-between">
            <div>
              <span class="text-xs font-semibold ${errorCount > 0 ? 'text-[#C5221F]' : 'text-gray-500'}">Validation Issues</span>
              <p class="text-xl font-bold ${errorCount > 0 ? 'text-[#C5221F]' : 'text-gray-600'} mt-1">${errorCount}</p>
            </div>
            <div class="w-9 h-9 rounded-xl ${errorCount > 0 ? 'bg-[#FAD2CF] text-[#C5221F]' : 'bg-gray-200 text-gray-500'} flex items-center justify-center">
              <i data-lucide="${errorCount > 0 ? 'alert-triangle' : 'check'}" class="w-4 h-4"></i>
            </div>
          </div>
        </div>

        <!-- If Error Rows Exist -->
        ${
          errorCount > 0
            ? `
          <div class="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2 text-amber-800 font-bold text-xs">
                <i data-lucide="alert-circle" class="w-4 h-4"></i>
                <span>Found ${errorCount} row(s) with validation issues</span>
              </div>
              <button id="btn-download-error-report" class="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors flex items-center space-x-1.5 shadow-sm">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Download Error Report (CSV)</span>
              </button>
            </div>

            <!-- Error list table -->
            <div class="overflow-y-auto max-h-48 border border-amber-200 rounded-xl bg-white">
              <table class="w-full text-left text-xs">
                <thead class="bg-amber-50/70 text-amber-900 text-[10px] font-bold uppercase tracking-wider border-b border-amber-200">
                  <tr>
                    <th class="px-4 py-2 w-20">Row #</th>
                    <th class="px-4 py-2">Error Reason</th>
                    <th class="px-4 py-2">Field Context</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-amber-100">
                  ${validationResults.errors
                    .slice(0, 50)
                    .map(
                      (err) => `
                    <tr class="hover:bg-amber-50/30">
                      <td class="px-4 py-2 font-bold text-amber-900">Row ${err.rowNum}</td>
                      <td class="px-4 py-2 text-red-600 font-medium">${err.error}</td>
                      <td class="px-4 py-2 text-gray-500 truncate max-w-xs font-mono text-[11px]">${JSON.stringify(err.raw)}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>
        `
            : `
          <div class="p-6 rounded-2xl bg-[#E6F4EA] border border-[#CEEAD6] text-center space-y-1">
            <div class="w-10 h-10 rounded-full bg-[#137333] text-white flex items-center justify-center mx-auto mb-2">
              <i data-lucide="check" class="w-5 h-5"></i>
            </div>
            <h4 class="text-sm font-bold text-[#137333]">All ${validCount} rows passed validation!</h4>
            <p class="text-xs text-[#5A6B63]">No missing fields, invalid formats, or duplicates detected.</p>
          </div>
        `
        }

        <!-- Actions -->
        <div class="pt-4 border-t border-[#F0F3F1] flex items-center justify-between">
          <button id="btn-back-to-step2" class="text-xs font-semibold text-[#64748B] hover:text-[#111827]">
            ← Adjust Column Mapping
          </button>

          <div class="flex items-center space-x-3">
            <button id="btn-cancel-validation" class="px-4 py-2 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button 
              id="btn-confirm-import" 
              class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
              ${validCount === 0 ? 'disabled' : ''}
            >
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
              <span>Confirm Import (${validCount} rows)</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- STEP 4: COMPLETE ---
  function renderStep4Complete() {
    const s = lastImportSummary || {};
    return `
      <div class="max-w-lg mx-auto text-center py-8 space-y-5">
        <div class="w-16 h-16 rounded-3xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center mx-auto shadow-md">
          <i data-lucide="check-circle" class="w-9 h-9"></i>
        </div>

        <div>
          <h3 class="text-lg font-bold text-[#111827]">Data Successfully Imported!</h3>
          <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            Sales, Revenue, and Profit & Loss reports have been recalculated automatically.
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-[#F8F9FA] border border-[#EAECEE] text-left space-y-2 text-xs">
          <div class="flex justify-between py-1 border-b border-gray-200">
            <span class="text-[#64748B]">Batch ID</span>
            <span class="font-bold text-[#163326] font-mono">${s.id || 'IMP-001'}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-gray-200">
            <span class="text-[#64748B]">Orders Created</span>
            <span class="font-bold text-[#111827]">${s.successCount || 0} order(s)</span>
          </div>
          <div class="flex justify-between py-1 border-b border-gray-200">
            <span class="text-[#64748B]">Total Sales Volume</span>
            <span class="font-bold text-[#163326]">$${(s.totalRevenue || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between py-1">
            <span class="text-[#64748B]">Status</span>
            <span class="font-bold text-[#137333]">${s.status || 'Completed'}</span>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-center space-x-3">
          <button id="btn-finish-and-view-reports" class="px-6 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] shadow-sm">
            View Updated Reports
          </button>
        </div>
      </div>
    `;
  }

  // ===================== IMPORT HISTORY TAB =====================
  function renderHistoryView() {
    const history = window.TryonStore.getState().importHistory || [];

    return `
      <div class="space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-bold text-[#111827]">Import Activity History</h4>
            <p class="text-xs text-[#64748B] mt-0.5">Audit log of all past spreadsheet ingestions with one-click undo capability</p>
          </div>
        </div>

        ${
          history.length === 0
            ? `
          <div class="p-16 text-center">
            <div class="w-14 h-14 rounded-2xl bg-[#F4F6F5] text-[#163326] flex items-center justify-center mx-auto mb-3">
              <i data-lucide="history" class="w-7 h-7"></i>
            </div>
            <h4 class="text-sm font-bold text-[#111827]">No import history yet</h4>
            <p class="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
              When you upload and confirm spreadsheets, their record summaries will be logged here.
            </p>
            <button id="btn-start-first-import" class="mt-4 px-4 py-2 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219]">
              + Start First Import
            </button>
          </div>
        `
            : `
          <div class="overflow-x-auto border border-[#EAECEE] rounded-2xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#F8F9FA] text-[#64748B] text-[10px] font-bold uppercase tracking-wider border-b border-[#EAECEE]">
                <tr>
                  <th class="px-5 py-3">File Name</th>
                  <th class="px-5 py-3">Date & Time</th>
                  <th class="px-5 py-3">Imported By</th>
                  <th class="px-5 py-3">Records</th>
                  <th class="px-5 py-3">Revenue Added</th>
                  <th class="px-5 py-3">Status</th>
                  <th class="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F1F5F9]">
                ${history
                  .map(
                    (h) => `
                  <tr class="hover:bg-[#F8FAFC]">
                    <td class="px-5 py-3.5 font-bold text-[#111827] flex items-center space-x-2">
                      <i data-lucide="file-spreadsheet" class="w-4 h-4 text-[#163326] shrink-0"></i>
                      <span class="truncate max-w-xs">${h.fileName}</span>
                    </td>
                    <td class="px-5 py-3.5 text-[#64748B]">${h.formattedDate || h.date}</td>
                    <td class="px-5 py-3.5 text-[#475569] font-medium">${h.importedBy || 'Admin'}</td>
                    <td class="px-5 py-3.5">
                      <span class="font-bold text-[#111827]">${h.successCount}</span>
                      ${h.failedCount > 0 ? `<span class="text-red-500 font-semibold ml-1">(${h.failedCount} failed)</span>` : ''}
                    </td>
                    <td class="px-5 py-3.5 font-bold text-[#163326]">$${(h.totalRevenue || 0).toFixed(2)}</td>
                    <td class="px-5 py-3.5">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        h.status === 'Completed'
                          ? 'badge-delivered'
                          : h.status === 'Completed with Warnings'
                          ? 'badge-pending'
                          : 'badge-cancelled'
                      }">
                        ${h.status}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-right">
                      ${
                        h.status !== 'Reverted'
                          ? `
                        <button class="btn-revert-import px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-semibold transition-colors" data-id="${h.id}">
                          Undo Import
                        </button>
                      `
                          : `<span class="text-[11px] text-gray-400 italic">Reverted</span>`
                      }
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
    `;
  }

  // ===================== EVENT BINDINGS =====================

  function bindEvents() {
    // Tab buttons
    document.getElementById('tab-btn-import')?.addEventListener('click', () => {
      currentTab = 'import';
      render();
    });

    document.getElementById('tab-btn-history')?.addEventListener('click', () => {
      currentTab = 'history';
      render();
    });

    document.getElementById('btn-close-import-modal')?.addEventListener('click', close);

    // Download template
    document.getElementById('btn-download-template')?.addEventListener('click', downloadSampleTemplate);

    // Step 1: File Input & Drag and Drop
    const fileInput = document.getElementById('file-input-field');
    const dropZone = document.getElementById('import-drop-zone');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileSelected(e.target.files[0]);
        }
      });
    }

    if (dropZone) {
      ['dragenter', 'dragover'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.add('border-[#163326]', 'bg-[#F4F8F5]');
        });
      });

      ['dragleave', 'drop'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropZone.classList.remove('border-[#163326]', 'bg-[#F4F8F5]');
        });
      });

      dropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFileSelected(e.dataTransfer.files[0]);
        }
      });
    }

    // Step 2: Mapping adjustments
    document.querySelectorAll('.mapping-select').forEach((sel) => {
      sel.addEventListener('change', (e) => {
        const field = e.target.getAttribute('data-field');
        detectedMappings[field] = e.target.value;
      });
    });

    document.getElementById('btn-back-to-step1')?.addEventListener('click', () => {
      currentStep = 1;
      render();
    });

    document.getElementById('btn-cancel-mapping')?.addEventListener('click', close);

    document.getElementById('btn-proceed-to-validation')?.addEventListener('click', () => {
      // Validate required mappings
      if (!detectedMappings.date || !detectedMappings.productName || !detectedMappings.quantity || !detectedMappings.price) {
        window.TryonApp.showToast('Please map all required fields (*): Date, Product Name, Quantity, and Price.', 'warning');
        return;
      }
      runValidation();
      currentStep = 3;
      render();
    });

    // Step 3: Validation Actions
    document.getElementById('btn-back-to-step2')?.addEventListener('click', () => {
      currentStep = 2;
      render();
    });

    document.getElementById('btn-cancel-validation')?.addEventListener('click', close);

    document.getElementById('btn-download-error-report')?.addEventListener('click', downloadErrorReport);

    document.getElementById('btn-confirm-import')?.addEventListener('click', executeImport);

    // Step 4: Finish action
    document.getElementById('btn-finish-and-view-reports')?.addEventListener('click', () => {
      close();
      window.location.hash = '#reports:sales';
      window.TryonApp.renderRoute();
    });

    // History: Start first import
    document.getElementById('btn-start-first-import')?.addEventListener('click', () => {
      currentTab = 'import';
      currentStep = 1;
      render();
    });

    // History: Revert button
    document.querySelectorAll('.btn-revert-import').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.TryonModals.openDeleteConfirm(
          'Undo / Revert Import?',
          `Are you sure you want to revert batch ${id}? This will remove all orders, sales, and expenses generated by this spreadsheet.`,
          () => {
            try {
              window.TryonStore.revertImportBatch(id);
              window.TryonApp.showToast(`Import batch ${id} reverted successfully.`, 'info');
              render();
            } catch (err) {
              window.TryonApp.showToast(err.message, 'warning');
            }
          }
        );
      });
    });
  }

  // ===================== FILE PARSING =====================

  function handleFileSelected(file) {
    const errorDiv = document.getElementById('upload-error-msg');
    const errorText = document.getElementById('upload-error-text');

    if (file.size > 10 * 1024 * 1024) {
      if (errorDiv && errorText) {
        errorText.textContent = 'File size exceeds maximum limit of 10 MB.';
        errorDiv.classList.remove('hidden');
      }
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      if (errorDiv && errorText) {
        errorText.textContent = 'Unsupported format. Please upload .csv, .xlsx, or .xls files.';
        errorDiv.classList.remove('hidden');
      }
      return;
    }

    uploadedFile = file;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = new Uint8Array(e.target.result);
        if (typeof XLSX === 'undefined') {
          throw new Error('SheetJS library not loaded.');
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (!json || json.length === 0) {
          throw new Error('Spreadsheet appears to be empty.');
        }

        rawRows = json;
        rawHeaders = Object.keys(json[0] || {});

        // Auto-detect column mappings
        autoDetectMappings(rawHeaders);

        currentStep = 2;
        render();
      } catch (err) {
        if (errorDiv && errorText) {
          errorText.textContent = 'Error parsing spreadsheet: ' + err.message;
          errorDiv.classList.remove('hidden');
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function autoDetectMappings(headers) {
    detectedMappings = {};

    headers.forEach((h) => {
      const lower = h.toLowerCase().trim();

      if (!detectedMappings.date && (lower.includes('date') || lower.includes('time') || lower.includes('day'))) {
        detectedMappings.date = h;
      } else if (!detectedMappings.orderId && (lower.includes('order') || lower.includes('invoice') || lower.includes('inv') || lower.includes('id'))) {
        detectedMappings.orderId = h;
      } else if (!detectedMappings.customerName && (lower.includes('customer') || lower.includes('client') || lower.includes('buyer') || lower.includes('name'))) {
        detectedMappings.customerName = h;
      } else if (!detectedMappings.customerEmail && lower.includes('email')) {
        detectedMappings.customerEmail = h;
      } else if (!detectedMappings.productName && (lower.includes('product') || lower.includes('item') || lower.includes('title') || lower.includes('apparel') || lower.includes('sku'))) {
        detectedMappings.productName = h;
      } else if (!detectedMappings.category && (lower.includes('category') || lower.includes('dept') || lower.includes('type'))) {
        detectedMappings.category = h;
      } else if (!detectedMappings.quantity && (lower.includes('qty') || lower.includes('quantity') || lower.includes('units') || lower.includes('count'))) {
        detectedMappings.quantity = h;
      } else if (!detectedMappings.price && (lower.includes('price') || lower.includes('unit price') || lower.includes('rate'))) {
        detectedMappings.price = h;
      } else if (!detectedMappings.total && (lower.includes('total') || lower.includes('amount') || lower.includes('revenue') || lower.includes('sales'))) {
        detectedMappings.total = h;
      } else if (!detectedMappings.cost && (lower.includes('cost') || lower.includes('cogs') || lower.includes('expense'))) {
        detectedMappings.cost = h;
      } else if (!detectedMappings.status && lower.includes('status')) {
        detectedMappings.status = h;
      }
    });
  }

  // ===================== VALIDATION LOGIC =====================

  function runValidation() {
    const valid = [];
    const errors = [];
    const seenOrderIdsInFile = new Set();
    const existingOrders = window.TryonStore.getState().orders;
    const existingOrderIds = new Set(existingOrders.map((o) => o.id));

    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2; // +1 for 0-index, +1 for header row in spreadsheet

      // Extract mapped values
      const dateVal = detectedMappings.date ? String(row[detectedMappings.date] || '').trim() : '';
      const orderIdVal = detectedMappings.orderId ? String(row[detectedMappings.orderId] || '').trim() : '';
      const prodVal = detectedMappings.productName ? String(row[detectedMappings.productName] || '').trim() : '';
      const qtyVal = detectedMappings.quantity ? row[detectedMappings.quantity] : '';
      const priceVal = detectedMappings.price ? row[detectedMappings.price] : '';
      const totalVal = detectedMappings.total ? row[detectedMappings.total] : '';
      const costVal = detectedMappings.cost ? row[detectedMappings.cost] : '';

      // Skip completely blank rows
      const values = Object.values(row).filter((v) => v !== '' && v !== null && v !== undefined);
      if (values.length === 0) return;

      // 1. Check Date
      if (!dateVal) {
        errors.push({ rowNum, error: 'Missing required Date', raw: row });
        return;
      }
      if (isNaN(Date.parse(dateVal))) {
        errors.push({ rowNum, error: `Invalid date format: "${dateVal}"`, raw: row });
        return;
      }

      // 2. Check Product Name
      if (!prodVal) {
        errors.push({ rowNum, error: 'Missing required Product Name', raw: row });
        return;
      }

      // 3. Check Quantity
      const qtyNum = parseInt(qtyVal, 10);
      if (isNaN(qtyNum) || qtyNum <= 0) {
        errors.push({ rowNum, error: `Quantity must be a positive number (found "${qtyVal}")`, raw: row });
        return;
      }

      // 4. Check Price
      const priceClean = String(priceVal).replace(/[$,]/g, '').trim();
      const priceNum = parseFloat(priceClean);
      if (isNaN(priceNum) || priceNum < 0) {
        errors.push({ rowNum, error: `Unit Price must be a valid non-negative number (found "${priceVal}")`, raw: row });
        return;
      }

      // 5. Check Duplicate Order ID
      if (orderIdVal) {
        if (existingOrderIds.has(orderIdVal)) {
          errors.push({ rowNum, error: `Order ID "${orderIdVal}" already exists in the store database`, raw: row });
          return;
        }
        if (seenOrderIdsInFile.has(orderIdVal)) {
          errors.push({ rowNum, error: `Duplicate Order ID "${orderIdVal}" within the spreadsheet`, raw: row });
          return;
        }
        seenOrderIdsInFile.add(orderIdVal);
      }

      // Record is valid!
      valid.push({
        date: dateVal,
        orderId: orderIdVal,
        customerName: detectedMappings.customerName ? String(row[detectedMappings.customerName] || '').trim() : '',
        customerEmail: detectedMappings.customerEmail ? String(row[detectedMappings.customerEmail] || '').trim() : '',
        customerPhone: detectedMappings.customerPhone ? String(row[detectedMappings.customerPhone] || '').trim() : '',
        productName: prodVal,
        category: detectedMappings.category ? String(row[detectedMappings.category] || '').trim() : 'Tees',
        quantity: qtyNum,
        price: priceNum,
        total: totalVal ? parseFloat(String(totalVal).replace(/[$,]/g, '')) : priceNum * qtyNum,
        cost: costVal ? parseFloat(String(costVal).replace(/[$,]/g, '')) : undefined,
        status: detectedMappings.status ? String(row[detectedMappings.status] || 'Delivered').trim() : 'Delivered'
      });
    });

    validationResults = { valid, errors };
  }

  // ===================== IMPORT EXECUTION =====================

  function executeImport() {
    if (!validationResults.valid || validationResults.valid.length === 0) {
      window.TryonApp.showToast('No valid records to import.', 'warning');
      return;
    }

    try {
      const summary = window.TryonStore.importBatchData({
        fileName: uploadedFile.name,
        records: validationResults.valid,
        totalRows: rawRows.length,
        failedCount: validationResults.errors.length
      });

      lastImportSummary = summary;
      currentStep = 4;
      render();

      window.TryonApp.showToast(`Imported ${summary.successCount} orders successfully!`, 'success');
    } catch (err) {
      window.TryonApp.showToast(err.message || 'Error processing import batch.', 'error');
    }
  }

  // ===================== DOWNLOAD EXPORTS =====================

  function downloadSampleTemplate() {
    const csvContent = 
`Order Date,Invoice ID,Customer Name,Customer Email,Product Name,Category,Quantity,Unit Price,Total Sales,Unit Cost,Status
2026-09-01,ORD-9001,Jessica Williams,jessica@example.com,Classic Oversized Tee,Tees,2,49.00,98.00,15.00,Delivered
2026-09-02,ORD-9002,Liam Bennett,liam@example.com,Men's Denim Jacket,Jackets,1,120.00,120.00,45.00,Delivered
2026-09-03,ORD-9003,Emma Davis,emma@example.com,Essential Fleece Hoodie,Hoodies,3,75.00,225.00,25.00,Delivered
2026-09-04,ORD-9004,Noah Smith,noah@example.com,Linen Button-down Shirt,Shirts,2,65.00,130.00,20.00,Delivered
2026-09-05,ORD-9005,Sophia Taylor,sophia@example.com,Pleated Relaxed Cargo Pants,Pants,1,85.00,85.00,30.00,Delivered`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tryon_sales_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.TryonApp.showToast('Sample CSV template downloaded.', 'info');
  }

  function downloadErrorReport() {
    if (validationResults.errors.length === 0) return;

    let csv = 'Row Number,Error Reason,Raw Row Data\n';
    validationResults.errors.forEach((err) => {
      const rawStr = JSON.stringify(err.raw).replace(/"/g, '""');
      csv += `"${err.rowNum}","${err.error}","${rawStr}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `import_errors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.TryonApp.showToast('Error report downloaded.', 'info');
  }

  window.TryonImportModal = {
    open,
    close
  };
})();
