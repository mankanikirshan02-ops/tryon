/**
 * TRYON — Premium Clothing Brand Products Section & Catalog
 * E-commerce showcase featuring:
 * - "Our Collection" hero heading & subtitle
 * - Functional category filter bar (All, T-Shirts, Shirts, Pants, Jackets, Hoodies, Jeans, Polos, Summer)
 * - 4-column responsive grid (Desktop: 4, Tablet: 2, Mobile: 1-2)
 * - Zero-image luxury typographic visual area with initials, geometric markers, and palette swatches
 * - Pricing tiers (Entry Rs. 2k-3k, Mid-range Rs. 3k-4.5k, Premium Rs. 4.5k+)
 * - Interactive size & color selection
 * - Product detail modal with full specs, quantity selector, Add to Cart, and Buy Now
 * - Slide-over shopping bag / cart drawer
 * - Dual view toggle (Collection Grid vs Inventory Table)
 * - CSV Import & Export functionality (file upload, smart mapping, preview, validation, sample template download)
 */

(function () {
  // State variables for filtering, sorting, and view modes
  let activeCategory = 'All';
  let searchQuery = '';
  let sortBy = 'featured'; // 'featured', 'price-asc', 'price-desc', 'name-asc'
  let activeTier = 'all'; // 'all', 'ENTRY', 'MID-RANGE', 'PREMIUM'
  let viewMode = 'collection'; // 'collection' (grid) or 'table' (inventory)
  let selectedProductIds = new Set();
  let currentPage = 1;
  const itemsPerPage = 8;

  // Selected sizes and colors cache per product card: { [productId]: { size: 'M', color: 'Black' } }
  const cardSelections = {};

  // Exact categories required by specification
  const CATEGORIES = [
    'All',
    'T-Shirts',
    'Shirts',
    'Pants',
    'Jackets',
    'Hoodies',
    'Jeans',
    'Polos',
    'Summer'
  ];

  // Hex color codes for luxury swatch circles
  const COLOR_MAP = {
    'Black': '#18181B',
    'White': '#FFFFFF',
    'Grey': '#9CA3AF',
    'Beige': '#D4C4B5',
    'Olive': '#4D5D43',
    'Blue': '#2563EB',
    'Cream': '#F5F2EB',
    'Dark Blue': '#0F172A',
    'Light Blue': '#93C5FD',
    'Navy': '#172554',
    'Sky Blue': '#7DD3FC'
  };

  // Monogram initials for luxury typographic plaque
  const MONOGRAM_MAP = {
    'CL-TEE-001': 'OT',
    'CL-SHR-002': 'RS',
    'CL-PNT-003': 'CP',
    'CL-JKT-004': 'DJ',
    'CL-HOD-005': 'SH',
    'CL-DNM-006': 'FD',
    'CL-POL-007': 'MP',
    'CL-SHR-008': 'LS'
  };

  function getFilteredAndSortedProducts() {
    const store = window.TryonStore;
    const state = store.getState();
    let products = [...state.products];

    // Category filter
    if (activeCategory !== 'All') {
      products = products.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Pricing Tier filter
    if (activeTier !== 'all') {
      products = products.filter((p) => p.tier === activeTier);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      products = products.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const idMatch = p.id.toLowerCase().includes(q);
        const catMatch = p.category.toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const colorMatch = (p.colors || []).some((c) => c.toLowerCase().includes(q));
        return nameMatch || idMatch || catMatch || descMatch || colorMatch;
      });
    }

    // Sorting
    if (sortBy === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      products.sort((a, b) => a.name.localeCompare(b.name));
    }
    // 'featured' keeps original curated catalog order

    return products;
  }

  function render() {
    const store = window.TryonStore;
    const state = store.getState();
    const allProducts = state.products || [];
    const products = getFilteredAndSortedProducts();
    const cart = store.getCart ? store.getCart() : [];
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return `
      <div class="space-y-8 pb-16">

        <!-- ==================== SECTION HERO HEADER ==================== -->
        <div class="relative bg-white rounded-3xl border border-[#EAECEE] p-6 sm:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
          
          <!-- Subtle Decorative Background Flourish -->
          <div class="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-[#F4F7F5] pointer-events-none -z-0"></div>
          <div class="absolute right-12 top-6 text-[80px] font-serif italic font-light text-[#163326]/5 select-none pointer-events-none hidden lg:block tracking-widest">
            TRYON
          </div>

          <div class="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div class="max-w-2xl">
              <!-- Section badge -->
              <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E4EFE7] text-[#163326] text-xs font-bold tracking-wider uppercase mb-3.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#163326]"></span>
                <span>TRYON ARCHIVE • READY-TO-WEAR</span>
              </div>
              
              <!-- Section Heading & Subtitle -->
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111827] uppercase">
                Our Collection
              </h1>
              <p class="text-sm sm:text-base text-[#64748B] mt-2 font-normal leading-relaxed">
                Timeless essentials designed for everyday expression.
              </p>

              <!-- Pricing Tiers Guide Strip -->
              <div class="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <button type="button" class="btn-tier-chip px-3 py-1 rounded-lg border transition-all ${activeTier === 'all' ? 'bg-[#163326] text-white border-[#163326]' : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#163326]'}" data-tier="all">
                  All Tiers (${allProducts.length})
                </button>
                <button type="button" class="btn-tier-chip px-3 py-1 rounded-lg border transition-all ${activeTier === 'ENTRY' ? 'bg-[#163326] text-white border-[#163326]' : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#163326]'}" data-tier="ENTRY">
                  <span class="font-bold">Entry</span> • Rs. 2,000–3,000
                </button>
                <button type="button" class="btn-tier-chip px-3 py-1 rounded-lg border transition-all ${activeTier === 'MID-RANGE' ? 'bg-[#163326] text-white border-[#163326]' : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#163326]'}" data-tier="MID-RANGE">
                  <span class="font-bold">Mid-Range</span> • Rs. 3,000–4,500
                </button>
                <button type="button" class="btn-tier-chip px-3 py-1 rounded-lg border transition-all ${activeTier === 'PREMIUM' ? 'bg-[#163326] text-white border-[#163326]' : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#163326]'}" data-tier="PREMIUM">
                  <span class="font-bold">Premium</span> • Rs. 4,500+
                </button>
              </div>
            </div>

            <!-- Header Actions: Import, Export, Bag, View Switcher -->
            <div class="flex flex-wrap items-center gap-2.5 shrink-0">
              
              <!-- Export CSV Button -->
              <button id="btn-export-products-csv" class="px-3.5 py-2.5 rounded-xl bg-white border border-[#D1D5DB] hover:border-[#163326] text-[#111827] text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs" title="Export Products to CSV">
                <i data-lucide="download" class="w-3.5 h-3.5 text-[#163326]"></i>
                <span class="hidden sm:inline">Export CSV</span>
              </button>

              <!-- Import CSV Button -->
              <button id="btn-open-import-products" class="px-3.5 py-2.5 rounded-xl bg-[#163326] hover:bg-[#0E2219] text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs" title="Import Products from CSV">
                <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                <span>Import CSV</span>
              </button>

              <!-- Cart Drawer Button -->
              <button id="btn-open-cart-hero" class="px-3.5 py-2.5 rounded-xl bg-white border border-[#D1D5DB] hover:border-[#163326] text-[#111827] text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs">
                <i data-lucide="shopping-bag" class="w-3.5 h-3.5 text-[#163326]"></i>
                <span>Bag (${cartCount})</span>
              </button>

              <!-- View Switcher -->
              <div class="inline-flex rounded-xl border border-[#E2E8F0] bg-[#F8F9FA] p-1">
                <button id="btn-view-grid" class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${viewMode === 'collection' ? 'bg-[#163326] text-white shadow-xs' : 'text-[#64748B] hover:text-[#111827]'}" title="Collection Grid View">
                  <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
                  <span class="hidden sm:inline">Collection</span>
                </button>
                <button id="btn-view-table" class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${viewMode === 'table' ? 'bg-[#163326] text-white shadow-xs' : 'text-[#64748B] hover:text-[#111827]'}" title="Inventory Table View">
                  <i data-lucide="table-2" class="w-3.5 h-3.5"></i>
                  <span class="hidden sm:inline">Inventory</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        <!-- ==================== CATEGORY FILTER NAVIGATION ==================== -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <!-- Horizontally Scrollable Categories (Mobile-Safe, No Overflow) -->
          <div class="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none no-scrollbar flex-1">
            ${CATEGORIES.map((cat) => {
              const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
              let count = 0;
              if (cat === 'All') count = allProducts.length;
              else count = allProducts.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;

              return `
                <button 
                  type="button" 
                  class="btn-category-tab whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-[#163326] text-white shadow-sm ring-1 ring-[#163326]'
                      : 'bg-white text-[#5A6B63] hover:text-[#163326] hover:bg-[#F3F6F4] border border-[#EAECEE]'
                  }"
                  data-category="${cat}"
                >
                  <span>${cat}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                  }">
                    ${count}
                  </span>
                </button>
              `;
            }).join('')}
          </div>

        </div>

        <!-- ==================== SEARCH & SORT TOOLBAR ==================== -->
        <div class="bg-white rounded-2xl border border-[#EAECEE] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          
          <!-- Search Bar -->
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3"></i>
            <input 
              type="text" 
              id="product-search-input" 
              placeholder="Search by name, ID, category, color..." 
              value="${searchQuery}"
              class="w-full text-xs rounded-xl border border-[#D1D5DB] pl-10 pr-9 py-2.5 outline-none focus:border-[#163326] focus:ring-1 focus:ring-[#163326] transition-all"
            />
            ${
              searchQuery
                ? `
              <button id="btn-clear-search" class="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            `
                : ''
            }
          </div>

          <!-- Sorting, Import/Export & Reset -->
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="text-xs text-[#64748B] font-medium hidden sm:inline">Sort:</span>
            <select id="product-sort-select" class="text-xs rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 bg-white outline-none focus:border-[#163326] text-[#111827] font-medium cursor-pointer">
              <option value="featured" ${sortBy === 'featured' ? 'selected' : ''}>Featured</option>
              <option value="price-asc" ${sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-desc" ${sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
              <option value="name-asc" ${sortBy === 'name-asc' ? 'selected' : ''}>Name: A to Z</option>
            </select>

            <!-- Quick Toolbar Import & Export -->
            <button id="btn-toolbar-import-csv" class="px-3 py-2 rounded-xl text-xs font-semibold text-[#163326] bg-[#E4EFE7] hover:bg-[#d4e6d9] transition-all flex items-center space-x-1" title="Import Products via CSV">
              <i data-lucide="upload" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Import</span>
            </button>
            <button id="btn-toolbar-export-csv" class="px-3 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:text-[#111827] bg-white border border-[#D1D5DB] hover:border-[#163326] transition-all flex items-center space-x-1" title="Export Products to CSV">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Export</span>
            </button>

            <!-- Reset Filters if Active -->
            ${
              activeCategory !== 'All' || searchQuery || activeTier !== 'all' || sortBy !== 'featured'
                ? `
              <button id="btn-reset-all-filters" class="px-3 py-2 rounded-xl text-xs font-semibold text-[#163326] hover:bg-[#E4EFE7] transition-all flex items-center space-x-1">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
                <span>Reset Filters</span>
              </button>
            `
                : ''
            }
          </div>

        </div>

        <!-- ==================== MAIN CONTENT: GRID VS TABLE ==================== -->
        ${
          viewMode === 'collection'
            ? renderCollectionGrid(products)
            : renderInventoryTable(products)
        }

      </div>

      <!-- Slide-Over Shopping Bag Drawer Container -->
      <div id="tryon-cart-drawer-container"></div>

      <!-- Product Detail & Import Modal Container -->
      <div id="tryon-product-detail-modal-container"></div>
    `;
  }

  /**
   * Renders the 4-column responsive Collection Grid
   * Desktop: 4 per row, Tablet: 2 per row, Mobile: 1-2 per row
   * ZERO PRODUCT IMAGES. Pure typographic & minimal aesthetic.
   */
  function renderCollectionGrid(products) {
    if (products.length === 0) {
      return `
        <div class="bg-white rounded-3xl border border-[#EAECEE] p-16 text-center shadow-xs">
          <div class="w-16 h-16 rounded-2xl bg-[#F4F6F4] text-[#163326] flex items-center justify-center mx-auto mb-4">
            <i data-lucide="package-open" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-bold text-[#111827]">No items found</h3>
          <p class="text-xs sm:text-sm text-[#64748B] mt-1.5 max-w-sm mx-auto">
            No pieces match your selected criteria. You can import new pieces or reset filters.
          </p>
          <div class="mt-5 flex items-center justify-center space-x-3">
            <button id="btn-empty-reset" class="px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all inline-flex items-center space-x-2">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>View All Products</span>
            </button>
            <button id="btn-empty-import" class="px-5 py-2.5 rounded-xl bg-white border border-[#D1D5DB] text-[#111827] text-xs font-semibold hover:border-[#163326] transition-all inline-flex items-center space-x-2">
              <i data-lucide="upload" class="w-4 h-4 text-[#163326]"></i>
              <span>Import Products CSV</span>
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        ${products.map((p) => renderProductCard(p)).join('')}
      </div>
    `;
  }

  /**
   * Renders an individual product card
   * Minimal typographic plaque + information hierarchy + sizes + colors + actions
   */
  function renderProductCard(p) {
    const sel = cardSelections[p.id] || {
      size: (p.sizes && p.sizes[0]) || 'M',
      color: (p.colors && p.colors[0]) || 'Default'
    };

    const monogram = MONOGRAM_MAP[p.id] || p.name.slice(0, 2).toUpperCase();

    return `
      <div class="group bg-white rounded-2xl border border-[#EAECEE] hover:border-[#163326]/30 p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        
        <div>
          <!-- ==================== MINIMAL VISUAL/TEXT AREA ==================== -->
          <!-- Architectural plaque: No image, pure typography & geometric design -->
          <div class="relative aspect-[4/3] bg-[#F8FAF9] rounded-xl border border-[#E8ECE9] overflow-hidden p-4 flex flex-col justify-between transition-colors group-hover:bg-[#F2F6F3]">
            
            <!-- Delicate geometric corner registration crosshairs -->
            <div class="absolute top-2 left-2 text-[10px] text-[#94A3B8]/60 select-none font-mono leading-none">+</div>
            <div class="absolute top-2 right-2 text-[10px] text-[#94A3B8]/60 select-none font-mono leading-none">+</div>
            <div class="absolute bottom-2 left-2 text-[10px] text-[#94A3B8]/60 select-none font-mono leading-none">+</div>
            <div class="absolute bottom-2 right-2 text-[10px] text-[#94A3B8]/60 select-none font-mono leading-none">+</div>

            <!-- Top Row: Badge & Product Code -->
            <div class="flex items-center justify-between z-10">
              ${
                p.badge
                  ? `
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-[0.16em] uppercase bg-[#163326] text-white shadow-xs">
                  ${p.badge}
                </span>
              `
                  : `
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-[0.12em] uppercase bg-white/90 text-[#64748B] border border-[#E2E8F0]">
                  ${p.tier}
                </span>
              `
              }
              <span class="text-[10px] font-mono font-semibold text-[#64748B] tracking-wider uppercase">
                ${p.id}
              </span>
            </div>

            <!-- Center Monogram Seal -->
            <div class="my-auto text-center z-10 py-1">
              <div class="text-3xl sm:text-4xl font-serif italic text-[#163326]/30 group-hover:text-[#163326]/60 transition-all duration-300 transform group-hover:scale-105 select-none tracking-widest font-light">
                ${monogram}
              </div>
              <div class="flex items-center justify-center space-x-2 mt-1">
                <span class="h-px w-5 bg-[#CBD5E1]"></span>
                <span class="text-[9px] uppercase tracking-[0.25em] font-bold text-[#64748B]">${p.category}</span>
                <span class="h-px w-5 bg-[#CBD5E1]"></span>
              </div>
              <p class="text-[8px] uppercase tracking-[0.2em] text-[#94A3B8] font-medium mt-0.5">
                ${p.positioning}
              </p>
            </div>

            <!-- Bottom Row: Color Swatches Preview & Quick View link -->
            <div class="flex items-center justify-between z-10 pt-1 border-t border-[#EAECEE]/60">
              <div class="flex items-center space-x-1">
                ${(p.colors || []).map((c) => `
                  <span class="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shadow-2xs" style="background-color: ${COLOR_MAP[c] || '#CBD5E1'}" title="${c}"></span>
                `).join('')}
              </div>
              <span class="text-[9px] font-mono text-[#64748B] uppercase tracking-wider">
                ${p.sizes ? p.sizes.length : 0} SIZES
              </span>
            </div>

          </div>

          <!-- ==================== PRODUCT INFORMATION ==================== -->
          <div class="pt-3.5">
            
            <!-- Category & Positioning -->
            <p class="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">
              ${p.category} • <span class="text-[#94A3B8]">${p.positioning}</span>
            </p>

            <!-- Product Name (Uppercase bold typography) -->
            <h3 class="text-sm font-bold tracking-wide text-[#111827] group-hover:text-[#163326] transition-colors uppercase mt-0.5 line-clamp-1">
              ${p.name}
            </h3>

            <!-- Price -->
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-base font-extrabold text-[#163326] font-mono">
                Rs. ${p.price.toLocaleString()}
              </span>
              <span class="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                ${p.tier}
              </span>
            </div>

            <!-- Suggested Colors (clean color indicators) -->
            <div class="mt-2.5">
              <p class="text-[11px] text-[#475569] flex items-center space-x-1.5">
                <span class="text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8]">Colors:</span>
                <span class="font-medium truncate">${(p.colors || []).join(' • ')}</span>
              </p>
            </div>

            <!-- Available Sizes (Interactive Pill Selection) -->
            <div class="mt-2.5 flex items-center space-x-1.5 flex-wrap gap-y-1">
              ${(p.sizes || []).map((s) => {
                const isSelected = sel.size === s;
                return `
                  <button 
                    type="button" 
                    class="btn-select-card-size px-2 py-1 text-[10px] font-bold rounded-md border transition-all ${
                      isSelected
                        ? 'bg-[#163326] text-white border-[#163326]'
                        : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#163326]'
                    }" 
                    data-prod-id="${p.id}" 
                    data-size="${s}"
                  >
                    ${s}
                  </button>
                `;
              }).join('')}
            </div>

          </div>
        </div>

        <!-- ==================== ACTION BUTTONS ==================== -->
        <div class="mt-4 pt-3.5 border-t border-[#F1F5F9] grid grid-cols-2 gap-2">
          <!-- View Product -->
          <button 
            type="button" 
            class="btn-trigger-view-product py-2 px-2.5 rounded-xl border border-[#D1D5DB] text-[#111827] hover:border-[#163326] hover:bg-[#F8FAFC] text-xs font-semibold text-center transition-all flex items-center justify-center space-x-1" 
            data-id="${p.id}"
          >
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span>View</span>
          </button>

          <!-- Add to Cart -->
          <button 
            type="button" 
            class="btn-trigger-add-to-cart py-2 px-2.5 rounded-xl bg-[#163326] hover:bg-[#0E2219] text-white text-xs font-semibold text-center transition-all flex items-center justify-center space-x-1 shadow-xs" 
            data-id="${p.id}"
          >
            <i data-lucide="shopping-bag" class="w-3.5 h-3.5"></i>
            <span>Add to Cart</span>
          </button>
        </div>

      </div>
    `;
  }

  /**
   * Renders the administrative Inventory Table view
   * Retains full catalog management, stock levels, actions, and CSV Import/Export
   */
  function renderInventoryTable(products) {
    const totalCount = products.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

    return `
      <div class="tryon-card overflow-hidden">
        
        <!-- Action Bar in Table Mode -->
        <div class="p-4 border-b border-[#F0F3F1] bg-[#FAFCFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-[#111827] uppercase tracking-wider">Inventory Directory</span>
            <span class="text-xs text-[#64748B]">(${totalCount} total items)</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Table Mode Import & Export -->
            <button id="btn-table-import-csv" class="px-3 py-1.5 rounded-xl bg-white border border-[#D1D5DB] hover:border-[#163326] text-xs font-semibold text-[#111827] flex items-center space-x-1.5 transition-all">
              <i data-lucide="upload" class="w-3.5 h-3.5 text-[#163326]"></i>
              <span>Import CSV</span>
            </button>
            <button id="btn-table-export-csv" class="px-3 py-1.5 rounded-xl bg-white border border-[#D1D5DB] hover:border-[#163326] text-xs font-semibold text-[#111827] flex items-center space-x-1.5 transition-all">
              <i data-lucide="download" class="w-3.5 h-3.5 text-[#163326]"></i>
              <span>Export CSV</span>
            </button>

            ${
              selectedProductIds.size > 0
                ? `
              <button id="btn-bulk-delete-products" class="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-all flex items-center space-x-1.5 shadow-sm">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                <span>Delete Selected (${selectedProductIds.size})</span>
              </button>
            `
                : ''
            }
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-[#F8F9FA] text-[#64748B] uppercase tracking-wider text-[10px] font-bold border-b border-[#EAECEE]">
              <tr>
                <th class="p-4 w-10 text-center">
                  <input type="checkbox" id="check-all-products" class="rounded text-[#163326] focus:ring-[#163326]" ${
                    selectedProductIds.size === paginatedProducts.length && paginatedProducts.length > 0 ? 'checked' : ''
                  }/>
                </th>
                <th class="px-4 py-3">Catalog Plaque</th>
                <th class="px-4 py-3">Product Name & ID</th>
                <th class="px-4 py-3">Category</th>
                <th class="px-4 py-3">Price</th>
                <th class="px-4 py-3">Tier</th>
                <th class="px-4 py-3">Available Colors</th>
                <th class="px-4 py-3">Sizes</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F1F5F9]">
              ${paginatedProducts.map((p) => {
                const isChecked = selectedProductIds.has(p.id);
                const monogram = MONOGRAM_MAP[p.id] || p.name.slice(0, 2).toUpperCase();

                return `
                  <tr class="hover:bg-[#F8FAFC] transition-colors ${isChecked ? 'bg-[#F4F8F5]' : ''}">
                    <td class="p-4 text-center">
                      <input type="checkbox" class="product-row-check rounded text-[#163326] focus:ring-[#163326]" data-id="${p.id}" ${
                        isChecked ? 'checked' : ''
                      }/>
                    </td>
                    <td class="px-4 py-3">
                      <!-- Typographic Plaque: ZERO images -->
                      <div class="w-10 h-10 rounded-xl bg-[#E4EFE7] border border-[#CEEAD6] text-[#163326] flex items-center justify-center font-serif italic text-sm font-bold shrink-0">
                        ${monogram}
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <p class="font-bold text-[#111827] uppercase">${p.name}</p>
                      <p class="text-[10px] text-[#64748B] font-mono tracking-wider">${p.id}</p>
                    </td>
                    <td class="px-4 py-3 text-[#475569] font-medium">${p.category}</td>
                    <td class="px-4 py-3 font-mono font-bold text-[#163326]">Rs. ${p.price.toLocaleString()}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.tier === 'PREMIUM'
                          ? 'bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]'
                          : p.tier === 'MID-RANGE'
                          ? 'bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC]'
                          : 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]'
                      }">
                        ${p.tier || 'ENTRY'}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center space-x-1">
                        ${(p.colors || []).map((c) => `
                          <span class="w-3 h-3 rounded-full border border-black/10 inline-block" style="background-color: ${COLOR_MAP[c] || '#CBD5E1'}" title="${c}"></span>
                        `).join('')}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-[#64748B] font-mono text-[11px]">
                      ${(p.sizes || []).join(', ')}
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="inline-flex items-center space-x-1">
                        <button class="btn-trigger-view-product p-1.5 rounded-lg text-gray-500 hover:text-[#163326] hover:bg-gray-100" title="View Details" data-id="${p.id}">
                          <i data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                        <button class="btn-trigger-add-to-cart p-1.5 rounded-lg text-gray-500 hover:text-[#163326] hover:bg-gray-100" title="Add to Bag" data-id="${p.id}">
                          <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="px-5 py-4 border-t border-[#F0F3F1] bg-[#FAFCFB] flex items-center justify-between text-xs text-[#64748B]">
          <span>
            Showing <strong class="text-[#111827]">${totalCount === 0 ? 0 : startIndex + 1}</strong> to <strong class="text-[#111827]">${Math.min(
            startIndex + itemsPerPage,
            totalCount
          )}</strong> of <strong class="text-[#111827]">${totalCount}</strong> pieces
          </span>

          <div class="flex items-center space-x-1.5">
            <button id="btn-prev-page" class="p-1.5 rounded-lg border border-[#D1D5DB] hover:bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed" ${
              currentPage <= 1 ? 'disabled' : ''
            }>
              <i data-lucide="chevron-left" class="w-4 h-4"></i>
            </button>
            <span class="px-3 py-1 rounded-lg bg-[#163326] text-white font-bold text-xs">${currentPage}</span>
            <button id="btn-next-page" class="p-1.5 rounded-lg border border-[#D1D5DB] hover:bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed" ${
              currentPage >= totalPages ? 'disabled' : ''
            }>
              <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

      </div>
    `;
  }

  // ==================== CSV PRODUCT IMPORT MODAL ====================
  function openProductImportModal() {
    let parsedRows = [];
    let fileMeta = null;
    let importError = '';

    const modalContainer = document.getElementById('tryon-product-detail-modal-container');
    if (!modalContainer) return;

    function renderImportModal() {
      const validCount = parsedRows.filter((r) => r.isValid).length;
      const invalidCount = parsedRows.filter((r) => !r.isValid).length;

      modalContainer.innerHTML = `
        <div id="modal-import-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-3xl border border-[#EAECEE] shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
              <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-xl bg-[#E4EFE7] text-[#163326] flex items-center justify-center font-bold">
                  <i data-lucide="file-spreadsheet" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="text-base font-bold text-[#111827]">Import Products via CSV</h3>
                  <p class="text-xs text-[#64748B] mt-0.5">Upload a CSV file to add pieces or update your catalog</p>
                </div>
              </div>
              <button id="btn-close-import-modal" class="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto space-y-6 flex-1">
              
              <!-- Dropzone / File Picker -->
              <div id="csv-dropzone" class="border-2 border-dashed border-[#D1D5DB] hover:border-[#163326] rounded-2xl p-6 text-center cursor-pointer transition-all bg-[#FAFBF9] hover:bg-[#F3F6F4]">
                <input type="file" id="input-products-csv" accept=".csv, .xlsx, .xls, text/csv" class="hidden" />
                <div class="w-12 h-12 rounded-2xl bg-[#E4EFE7] text-[#163326] flex items-center justify-center mx-auto mb-3">
                  <i data-lucide="upload-cloud" class="w-6 h-6"></i>
                </div>
                <h4 class="text-sm font-bold text-[#111827]">
                  ${fileMeta ? fileMeta.name : 'Click to upload or drag and drop your CSV file'}
                </h4>
                <p class="text-xs text-[#64748B] mt-1">
                  ${fileMeta ? `${(fileMeta.size / 1024).toFixed(1)} KB • ${parsedRows.length} rows detected` : 'Supports standard CSV format with Product Name, Price, Category, etc.'}
                </p>
                <div class="mt-4 flex items-center justify-center space-x-3">
                  <button type="button" id="btn-browse-csv" class="px-4 py-2 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all">
                    Choose CSV File
                  </button>
                  <button type="button" id="btn-download-template" class="px-4 py-2 rounded-xl bg-white border border-[#D1D5DB] hover:border-[#163326] text-[#111827] text-xs font-semibold transition-all flex items-center space-x-1.5">
                    <i data-lucide="download" class="w-3.5 h-3.5"></i>
                    <span>Download Sample Template</span>
                  </button>
                </div>
              </div>

              <!-- Error Alert if any -->
              ${
                importError
                  ? `
                <div class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
                  <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
                  <span>${importError}</span>
                </div>
              `
                  : ''
              }

              <!-- Preview Table if rows parsed -->
              ${
                parsedRows.length > 0
                  ? `
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-bold text-[#111827] uppercase tracking-wider">
                      Preview Data (${validCount} valid, ${invalidCount} invalid)
                    </h4>
                    <span class="text-[11px] text-[#64748B]">Showing top rows</span>
                  </div>

                  <div class="border border-[#EAECEE] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-[#F8F9FA] text-[#64748B] font-bold text-[10px] uppercase tracking-wider sticky top-0 border-b border-[#EAECEE]">
                        <tr>
                          <th class="px-3 py-2.5">Status</th>
                          <th class="px-3 py-2.5">Product ID</th>
                          <th class="px-3 py-2.5">Name</th>
                          <th class="px-3 py-2.5">Category</th>
                          <th class="px-3 py-2.5">Price</th>
                          <th class="px-3 py-2.5">Tier</th>
                          <th class="px-3 py-2.5">Colors</th>
                          <th class="px-3 py-2.5">Sizes</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-[#F1F5F9]">
                        ${parsedRows.slice(0, 15).map((r) => `
                          <tr class="hover:bg-[#FAFCFB] ${!r.isValid ? 'bg-red-50/50' : ''}">
                            <td class="px-3 py-2">
                              ${
                                r.isValid
                                  ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333]">Valid</span>`
                                  : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE8E6] text-[#C5221F]" title="${r.error}">${r.error || 'Error'}</span>`
                              }
                            </td>
                            <td class="px-3 py-2 font-mono font-bold text-[#163326]">${r.id}</td>
                            <td class="px-3 py-2 font-semibold text-[#111827]">${r.name}</td>
                            <td class="px-3 py-2 text-[#64748B]">${r.category}</td>
                            <td class="px-3 py-2 font-mono font-bold">Rs. ${r.price.toLocaleString()}</td>
                            <td class="px-3 py-2"><span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F1F5F9]">${r.tier}</span></td>
                            <td class="px-3 py-2 text-[11px] text-[#64748B]">${r.colors.join(', ')}</td>
                            <td class="px-3 py-2 text-[11px] text-[#64748B] font-mono">${r.sizes.join(', ')}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              `
                  : ''
              }

            </div>

            <!-- Modal Footer -->
            <div class="px-6 py-4 border-t border-[#F0F3F1] bg-[#FAFCFB] flex items-center justify-between">
              <span class="text-xs text-[#64748B]">
                ${validCount > 0 ? `Ready to import <strong>${validCount}</strong> products into catalog.` : 'Select a file to parse products.'}
              </span>

              <div class="flex items-center space-x-2.5">
                <button type="button" id="btn-cancel-import-modal" class="px-4 py-2 rounded-xl border border-[#D1D5DB] text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button 
                  type="button" 
                  id="btn-confirm-import-products" 
                  class="px-5 py-2 rounded-xl bg-[#163326] text-white text-xs font-bold hover:bg-[#0E2219] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center space-x-1.5"
                  ${validCount === 0 ? 'disabled' : ''}
                >
                  <i data-lucide="check" class="w-4 h-4"></i>
                  <span>Import ${validCount > 0 ? validCount : ''} Products</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Modal Events
      document.getElementById('btn-close-import-modal')?.addEventListener('click', closeProductImportModal);
      document.getElementById('btn-cancel-import-modal')?.addEventListener('click', closeProductImportModal);
      document.getElementById('modal-import-backdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-import-backdrop') closeProductImportModal();
      });

      // Template download
      document.getElementById('btn-download-template')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.TryonStore.downloadProductsCSVTemplate();
      });

      // Trigger file browse
      const fileInput = document.getElementById('input-products-csv');
      const dropzone = document.getElementById('csv-dropzone');
      const browseBtn = document.getElementById('btn-browse-csv');

      if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          fileInput.click();
        });
      }

      if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => {
          fileInput.click();
        });

        dropzone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropzone.classList.add('border-[#163326]', 'bg-[#E4EFE7]/30');
        });

        dropzone.addEventListener('dragleave', () => {
          dropzone.classList.remove('border-[#163326]', 'bg-[#E4EFE7]/30');
        });

        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.classList.remove('border-[#163326]', 'bg-[#E4EFE7]/30');
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
          }
        });

        fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
          }
        });
      }

      function handleFile(file) {
        fileMeta = file;
        importError = '';

        const reader = new FileReader();
        reader.onload = function (evt) {
          try {
            const content = evt.target.result;
            parseCSVText(content);
            renderImportModal();
          } catch (err) {
            importError = 'Error parsing file: ' + err.message;
            renderImportModal();
          }
        };
        reader.readAsText(file);
      }

      function parseCSVText(text) {
        if (!text || !text.trim()) {
          importError = 'Uploaded file is empty.';
          parsedRows = [];
          return;
        }

        // Split into lines
        const lines = text.split(/\r\n|\n|\r/).map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          importError = 'CSV must have a header row and at least one product row.';
          parsedRows = [];
          return;
        }

        // Simple CSV splitter that respects quotes
        function splitCSVLine(line) {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if ((char === ',' || char === ';') && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        }

        const rawHeaders = splitCSVLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

        // Header mapping
        const nameIdx = rawHeaders.findIndex((h) => h.includes('name') || h.includes('title'));
        const priceIdx = rawHeaders.findIndex((h) => h.includes('price') || h.includes('cost') || h.includes('rate'));
        const catIdx = rawHeaders.findIndex((h) => h.includes('cat'));
        const idIdx = rawHeaders.findIndex((h) => h === 'id' || h.includes('product id') || h.includes('sku'));
        const posIdx = rawHeaders.findIndex((h) => h.includes('pos'));
        const tierIdx = rawHeaders.findIndex((h) => h.includes('tier'));
        const badgeIdx = rawHeaders.findIndex((h) => h.includes('badge'));
        const colorIdx = rawHeaders.findIndex((h) => h.includes('color'));
        const sizeIdx = rawHeaders.findIndex((h) => h.includes('size'));
        const descIdx = rawHeaders.findIndex((h) => h.includes('desc'));
        const stockIdx = rawHeaders.findIndex((h) => h.includes('stock') || h.includes('qty') || h.includes('quantity'));
        const statusIdx = rawHeaders.findIndex((h) => h.includes('stat'));

        if (nameIdx === -1) {
          importError = 'Could not find a "Product Name" column in the CSV file.';
          parsedRows = [];
          return;
        }

        const state = window.TryonStore.getState();
        const results = [];

        for (let i = 1; i < lines.length; i++) {
          const cells = splitCSVLine(lines[i]).map((c) => c.replace(/^["']|["']$/g, '').trim());
          const name = cells[nameIdx] || '';
          const rawPrice = cells[priceIdx] || '0';
          const price = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;
          const category = catIdx > -1 && cells[catIdx] ? cells[catIdx] : 'T-Shirts';

          let id = idIdx > -1 && cells[idIdx] ? cells[idIdx] : '';
          if (!id) {
            const catCode = category.slice(0, 3).toUpperCase();
            id = `CL-${catCode}-${String(state.products.length + results.length + 1).padStart(3, '0')}`;
          }

          let tier = tierIdx > -1 && cells[tierIdx] ? cells[tierIdx].toUpperCase() : '';
          if (!['ENTRY', 'MID-RANGE', 'PREMIUM'].includes(tier)) {
            if (price < 3000) tier = 'ENTRY';
            else if (price <= 4500) tier = 'MID-RANGE';
            else tier = 'PREMIUM';
          }

          let colors = colorIdx > -1 && cells[colorIdx] ? cells[colorIdx].split(/[,|•]/).map((c) => c.trim()).filter(Boolean) : ['Black', 'White'];
          if (colors.length === 0) colors = ['Black', 'White'];

          let sizes = sizeIdx > -1 && cells[sizeIdx] ? cells[sizeIdx].split(/[,|•]/).map((s) => s.trim()).filter(Boolean) : ['S', 'M', 'L', 'XL'];
          if (sizes.length === 0) sizes = ['S', 'M', 'L', 'XL'];

          const positioning = posIdx > -1 && cells[posIdx] ? cells[posIdx] : 'Everyday / Basic';
          const badge = badgeIdx > -1 && cells[badgeIdx] ? cells[badgeIdx].toUpperCase() : null;
          const description = descIdx > -1 && cells[descIdx] ? cells[descIdx] : `A clean ${category.toLowerCase()} designed with a relaxed silhouette.`;
          const stock = stockIdx > -1 ? parseInt(cells[stockIdx], 10) || 50 : 50;
          const status = statusIdx > -1 && cells[statusIdx] ? cells[statusIdx] : 'In Stock';

          let isValid = true;
          let error = '';

          if (!name) {
            isValid = false;
            error = 'Missing Name';
          } else if (isNaN(price) || price <= 0) {
            isValid = false;
            error = 'Invalid Price';
          }

          results.push({
            id,
            name,
            category,
            price,
            positioning,
            tier,
            badge,
            colors,
            sizes,
            description,
            stock,
            status,
            isValid,
            error
          });
        }

        parsedRows = results;
      }

      // Confirm Import
      document.getElementById('btn-confirm-import-products')?.addEventListener('click', () => {
        const validItems = parsedRows.filter((r) => r.isValid);
        if (validItems.length === 0) return;

        try {
          const res = window.TryonStore.importProductsBatch(validItems);
          closeProductImportModal();
          window.TryonApp.showToast(`Catalog updated! Added ${res.added} new piece(s), updated ${res.updated} piece(s).`, 'success');
          window.TryonApp.renderRoute();
        } catch (err) {
          importError = err.message;
          renderImportModal();
        }
      });
    }

    renderImportModal();
  }

  function closeProductImportModal() {
    const modalContainer = document.getElementById('tryon-product-detail-modal-container');
    if (modalContainer) modalContainer.innerHTML = '';
  }

  // ==================== PRODUCT DETAIL MODAL (ZERO IMAGES) ====================
  function openProductDetailModal(productId) {
    const store = window.TryonStore;
    const state = store.getState();
    const product = state.products.find((p) => p.id === productId);
    if (!product) return;

    let selectedSize = (product.sizes && product.sizes[0]) || 'M';
    let selectedColor = (product.colors && product.colors[0]) || 'Default';
    let quantity = 1;

    const modalContainer = document.getElementById('tryon-product-detail-modal-container');
    if (!modalContainer) return;

    function renderModalContent() {
      const monogram = MONOGRAM_MAP[product.id] || product.name.slice(0, 2).toUpperCase();

      modalContainer.innerHTML = `
        <!-- Backdrop -->
        <div id="modal-detail-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          
          <!-- Modal Container -->
          <div class="bg-white rounded-3xl border border-[#EAECEE] shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-bold text-[#163326] uppercase tracking-wider">Product Details</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E4EFE7] text-[#163326] font-bold">${product.id}</span>
              </div>
              <button id="btn-close-detail-modal" class="text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <!-- Two-Column Product Detail Layout (ZERO IMAGES) -->
            <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#F1F5F9]">
              
              <!-- Left Column: Typographic Specification Board -->
              <div class="p-6 sm:p-8 bg-[#F9FAF8] flex flex-col justify-between relative overflow-hidden">
                <!-- Geometric corner markings -->
                <div class="absolute top-3 left-3 text-[10px] text-[#94A3B8]/60 font-mono">+</div>
                <div class="absolute top-3 right-3 text-[10px] text-[#94A3B8]/60 font-mono">+</div>
                <div class="absolute bottom-3 left-3 text-[10px] text-[#94A3B8]/60 font-mono">+</div>
                <div class="absolute bottom-3 right-3 text-[10px] text-[#94A3B8]/60 font-mono">+</div>

                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] uppercase tracking-[0.25em] font-bold text-[#163326] bg-[#E4EFE7] px-2.5 py-0.5 rounded-full">
                      ${product.tier} TIER
                    </span>
                    <span class="text-xs font-mono font-bold text-[#94A3B8]">${product.id}</span>
                  </div>

                  <div class="my-8 text-center">
                    <div class="text-6xl font-serif italic text-[#163326]/30 font-light select-none tracking-widest">
                      ${monogram}
                    </div>
                    <div class="flex items-center justify-center space-x-2 mt-3">
                      <span class="h-px w-8 bg-[#CBD5E1]"></span>
                      <span class="text-xs uppercase tracking-[0.25em] font-bold text-[#163326]">${product.category}</span>
                      <span class="h-px w-8 bg-[#CBD5E1]"></span>
                    </div>
                    <p class="text-xs uppercase tracking-[0.2em] text-[#64748B] mt-1 font-medium">${product.positioning}</p>
                  </div>
                </div>

                <!-- Product Specifications Card -->
                <div class="space-y-2.5 pt-4 border-t border-[#EAECEE] text-xs">
                  <div class="flex justify-between py-1 border-b border-[#F1F5F9]">
                    <span class="text-[#64748B]">Fit Silhouette:</span>
                    <span class="font-semibold text-[#111827]">Tailored Relaxed</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-[#F1F5F9]">
                    <span class="text-[#64748B]">Craftsmanship:</span>
                    <span class="font-semibold text-[#111827]">Artisanal TRYON Atelier</span>
                  </div>
                  <div class="flex justify-between py-1">
                    <span class="text-[#64748B]">Origin:</span>
                    <span class="font-semibold text-[#111827]">Ethically Manufactured</span>
                  </div>
                </div>
              </div>

              <!-- Right Column: Interactive Product Information & Actions -->
              <div class="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                
                <div class="space-y-4">
                  <!-- Category & Badge -->
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                      ${product.category} • ${product.positioning}
                    </span>
                    ${
                      product.badge
                        ? `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#163326] text-white uppercase tracking-wider">${product.badge}</span>`
                        : ''
                    }
                  </div>

                  <!-- Product Name -->
                  <h2 class="text-2xl font-bold tracking-tight text-[#111827] uppercase">
                    ${product.name}
                  </h2>

                  <!-- Price -->
                  <div class="flex items-baseline space-x-2">
                    <span class="text-2xl font-extrabold text-[#163326] font-mono">
                      Rs. ${product.price.toLocaleString()}
                    </span>
                    <span class="text-xs text-[#64748B]">Inclusive of all taxes</span>
                  </div>

                  <!-- Description -->
                  <p class="text-xs text-[#475569] leading-relaxed pt-2 border-t border-[#F1F5F9]">
                    ${product.description}
                  </p>

                  <!-- Available Colors -->
                  <div class="space-y-2 pt-2">
                    <label class="block text-xs font-bold text-[#111827] uppercase tracking-wider">
                      Selected Color: <span id="label-selected-color" class="font-semibold text-[#163326] normal-case">${selectedColor}</span>
                    </label>
                    <div class="flex items-center space-x-2 flex-wrap gap-y-2">
                      ${(product.colors || []).map((c) => {
                        const isColorActive = selectedColor === c;
                        return `
                          <button 
                            type="button" 
                            class="btn-modal-color flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                              isColorActive
                                ? 'border-[#163326] bg-[#F3F6F4] text-[#163326] ring-1 ring-[#163326]'
                                : 'border-[#D1D5DB] bg-white text-[#475569] hover:border-gray-400'
                            }"
                            data-color="${c}"
                          >
                            <span class="w-3 h-3 rounded-full border border-black/15 shrink-0" style="background-color: ${COLOR_MAP[c] || '#CBD5E1'}"></span>
                            <span>${c}</span>
                          </button>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <!-- Available Sizes -->
                  <div class="space-y-2 pt-2">
                    <label class="block text-xs font-bold text-[#111827] uppercase tracking-wider">
                      Select Size: <span id="label-selected-size" class="font-semibold text-[#163326]">${selectedSize}</span>
                    </label>
                    <div class="flex items-center space-x-2 flex-wrap gap-y-2">
                      ${(product.sizes || []).map((s) => {
                        const isSizeActive = selectedSize === s;
                        return `
                          <button 
                            type="button" 
                            class="btn-modal-size px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                              isSizeActive
                                ? 'bg-[#163326] text-white border-[#163326] shadow-xs'
                                : 'bg-white text-[#475569] border-[#D1D5DB] hover:border-[#163326]'
                            }"
                            data-size="${s}"
                          >
                            ${s}
                          </button>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <!-- Quantity Selector -->
                  <div class="pt-2 flex items-center space-x-4">
                    <label class="text-xs font-bold text-[#111827] uppercase tracking-wider">Quantity:</label>
                    <div class="inline-flex items-center rounded-xl border border-[#D1D5DB] bg-white">
                      <button id="btn-qty-minus" type="button" class="px-3 py-1.5 text-gray-500 hover:text-[#163326] hover:bg-gray-50 rounded-l-xl text-sm font-bold">
                        -
                      </button>
                      <span id="label-modal-qty" class="px-4 py-1.5 text-xs font-bold text-[#111827] font-mono min-w-[36px] text-center">
                        ${quantity}
                      </span>
                      <button id="btn-qty-plus" type="button" class="px-3 py-1.5 text-gray-500 hover:text-[#163326] hover:bg-gray-50 rounded-r-xl text-sm font-bold">
                        +
                      </button>
                    </div>
                  </div>

                </div>

                <!-- Action Buttons: Add to Cart & Buy Now -->
                <div class="pt-4 border-t border-[#F1F5F9] space-y-2.5">
                  <div class="grid grid-cols-2 gap-3">
                    <button 
                      id="btn-modal-add-to-cart" 
                      type="button" 
                      class="py-3 px-4 rounded-xl bg-white border border-[#163326] text-[#163326] hover:bg-[#E4EFE7] text-xs font-bold transition-all flex items-center justify-center space-x-2"
                    >
                      <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                      <span>Add to Bag</span>
                    </button>
                    <button 
                      id="btn-modal-buy-now" 
                      type="button" 
                      class="py-3 px-4 rounded-xl bg-[#163326] hover:bg-[#0E2219] text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <i data-lucide="zap" class="w-4 h-4"></i>
                      <span>Buy Now</span>
                    </button>
                  </div>

                  <!-- Trust indicators -->
                  <div class="pt-2 flex items-center justify-between text-[10px] text-[#64748B]">
                    <span class="flex items-center space-x-1">
                      <i data-lucide="shield-check" class="w-3.5 h-3.5 text-[#163326]"></i>
                      <span>14-day return privilege</span>
                    </span>
                    <span class="flex items-center space-x-1">
                      <i data-lucide="truck" class="w-3.5 h-3.5 text-[#163326]"></i>
                      <span>Fast nationwide dispatch</span>
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Modal Events
      document.getElementById('btn-close-detail-modal')?.addEventListener('click', closeProductDetailModal);
      document.getElementById('modal-detail-backdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-detail-backdrop') closeProductDetailModal();
      });

      // Color select
      document.querySelectorAll('.btn-modal-color').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          selectedColor = e.currentTarget.getAttribute('data-color');
          renderModalContent();
        });
      });

      // Size select
      document.querySelectorAll('.btn-modal-size').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          selectedSize = e.currentTarget.getAttribute('data-size');
          renderModalContent();
        });
      });

      // Quantity adjustments
      document.getElementById('btn-qty-minus')?.addEventListener('click', () => {
        if (quantity > 1) {
          quantity--;
          const el = document.getElementById('label-modal-qty');
          if (el) el.textContent = quantity;
        }
      });

      document.getElementById('btn-qty-plus')?.addEventListener('click', () => {
        quantity++;
        const el = document.getElementById('label-modal-qty');
        if (el) el.textContent = quantity;
      });

      // Add to Bag action
      document.getElementById('btn-modal-add-to-cart')?.addEventListener('click', () => {
        store.addToCart(product.id, selectedSize, selectedColor, quantity);
        window.TryonApp.showToast(`Added ${quantity}x "${product.name}" (${selectedSize} • ${selectedColor}) to your bag.`, 'success');
        closeProductDetailModal();
        openCartDrawer();
      });

      // Buy Now action (Checkout instantly)
      document.getElementById('btn-modal-buy-now')?.addEventListener('click', () => {
        store.addToCart(product.id, selectedSize, selectedColor, quantity);
        closeProductDetailModal();
        openCartDrawer();
      });
    }

    renderModalContent();
  }

  function closeProductDetailModal() {
    const modalContainer = document.getElementById('tryon-product-detail-modal-container');
    if (modalContainer) modalContainer.innerHTML = '';
  }

  // ==================== SLIDE-OVER SHOPPING BAG / CART DRAWER ====================
  function openCartDrawer() {
    const store = window.TryonStore;
    const totals = store.getCartTotals ? store.getCartTotals() : { items: [], subtotal: 0, itemCount: 0, currency: 'Rs.' };
    const drawerContainer = document.getElementById('tryon-cart-drawer-container');
    if (!drawerContainer) return;

    function renderDrawer() {
      const liveTotals = store.getCartTotals ? store.getCartTotals() : { items: [], subtotal: 0, itemCount: 0, currency: 'Rs.' };
      const items = liveTotals.items;

      drawerContainer.innerHTML = `
        <!-- Backdrop -->
        <div id="cart-drawer-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-200"></div>

        <!-- Slide Panel -->
        <div class="fixed inset-y-0 right-0 max-w-full flex z-50">
          <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#EAECEE]">
            
            <!-- Drawer Header -->
            <div class="px-6 py-5 border-b border-[#F0F3F1] flex items-center justify-between bg-[#FAFCFB]">
              <div class="flex items-center space-x-2.5">
                <i data-lucide="shopping-bag" class="w-5 h-5 text-[#163326]"></i>
                <h3 class="text-base font-bold text-[#111827] uppercase tracking-wide">Shopping Bag</h3>
                <span class="px-2 py-0.5 rounded-full bg-[#163326] text-white text-xs font-bold">${liveTotals.itemCount}</span>
              </div>
              <button id="btn-close-cart-drawer" class="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <i data-lucide="x" class="w-5 h-5"></i>
              </button>
            </div>

            <!-- Drawer Content: List of Items -->
            <div class="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#F1F5F9]">
              ${
                items.length === 0
                  ? `
                <div class="py-16 text-center">
                  <div class="w-16 h-16 rounded-2xl bg-[#F4F6F4] text-[#163326] flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="shopping-bag" class="w-8 h-8"></i>
                  </div>
                  <h4 class="text-base font-bold text-[#111827]">Your bag is empty</h4>
                  <p class="text-xs text-[#64748B] mt-1 max-w-xs mx-auto">
                    Explore our collection and add your favorite essentials.
                  </p>
                  <button id="btn-drawer-shop-now" class="mt-5 px-5 py-2.5 rounded-xl bg-[#163326] text-white text-xs font-semibold hover:bg-[#0E2219] transition-all">
                    Browse Collection
                  </button>
                </div>
              `
                  : items.map((item) => {
                      const prodId = item.productId || 'CL-TEE-001';
                      const monogram = MONOGRAM_MAP[prodId] || item.name.slice(0, 2).toUpperCase();

                      return `
                    <div class="pt-4 first:pt-0 flex items-start space-x-3.5">
                      <!-- Typographic Mini Plaque: ZERO images -->
                      <div class="w-14 h-14 rounded-xl bg-[#F4F7F5] border border-[#E2E8F0] text-[#163326] flex flex-col items-center justify-center shrink-0">
                        <span class="font-serif italic font-bold text-sm">${monogram}</span>
                        <span class="text-[8px] font-mono text-[#64748B]">${item.size}</span>
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                          <div>
                            <h4 class="text-xs font-bold text-[#111827] uppercase truncate">${item.name}</h4>
                            <p class="text-[11px] text-[#64748B] mt-0.5">
                              Size: <strong class="text-[#111827]">${item.size}</strong> • Color: <strong class="text-[#111827]">${item.color}</strong>
                            </p>
                          </div>
                          <button class="btn-remove-cart-item text-gray-400 hover:text-red-600 p-1" data-id="${item.id}" title="Remove item">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          </button>
                        </div>

                        <div class="mt-2.5 flex items-center justify-between">
                          <!-- Quantity Steppers -->
                          <div class="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-white">
                            <button class="btn-cart-minus px-2 py-0.5 text-xs text-gray-500 hover:text-black font-bold" data-id="${item.id}" data-qty="${item.quantity - 1}">
                              -
                            </button>
                            <span class="px-2 py-0.5 text-xs font-bold font-mono text-[#111827]">${item.quantity}</span>
                            <button class="btn-cart-plus px-2 py-0.5 text-xs text-gray-500 hover:text-black font-bold" data-id="${item.id}" data-qty="${item.quantity + 1}">
                              +
                            </button>
                          </div>

                          <span class="text-xs font-extrabold text-[#163326] font-mono">
                            Rs. ${(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  `;
                    }).join('')
              }
            </div>

            <!-- Drawer Footer -->
            ${
              items.length > 0
                ? `
              <div class="p-6 border-t border-[#F0F3F1] bg-[#FAFCFB] space-y-4">
                <div class="space-y-2 text-xs">
                  <div class="flex justify-between text-[#64748B]">
                    <span>Subtotal (${liveTotals.itemCount} items)</span>
                    <span class="font-mono font-semibold text-[#111827]">Rs. ${liveTotals.subtotal.toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-[#64748B]">
                    <span>Standard Shipping</span>
                    <span class="font-medium text-[#137333]">FREE</span>
                  </div>
                  <div class="pt-2 border-t border-[#EAECEE] flex justify-between text-sm font-bold text-[#111827]">
                    <span>Estimated Total</span>
                    <span class="font-mono text-base text-[#163326]">Rs. ${liveTotals.subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <button id="btn-cart-checkout" class="w-full py-3.5 px-4 rounded-xl bg-[#163326] hover:bg-[#0E2219] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2">
                    <i data-lucide="check-circle" class="w-4 h-4"></i>
                    <span>Proceed to Checkout</span>
                  </button>
                  <button id="btn-clear-entire-cart" class="w-full py-2 px-4 rounded-xl bg-white border border-[#E2E8F0] hover:bg-gray-50 text-gray-600 text-xs font-medium transition-all">
                    Clear Shopping Bag
                  </button>
                </div>
              </div>
            `
                : ''
            }

          </div>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      // Drawer Events
      document.getElementById('btn-close-cart-drawer')?.addEventListener('click', closeCartDrawer);
      document.getElementById('cart-drawer-backdrop')?.addEventListener('click', closeCartDrawer);
      document.getElementById('btn-drawer-shop-now')?.addEventListener('click', closeCartDrawer);

      // Increment / Decrement
      document.querySelectorAll('.btn-cart-minus').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const qty = parseInt(e.currentTarget.getAttribute('data-qty'), 10);
          store.updateCartQuantity(id, qty);
          renderDrawer();
          window.TryonApp.renderRoute();
        });
      });

      document.querySelectorAll('.btn-cart-plus').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const qty = parseInt(e.currentTarget.getAttribute('data-qty'), 10);
          store.updateCartQuantity(id, qty);
          renderDrawer();
          window.TryonApp.renderRoute();
        });
      });

      document.querySelectorAll('.btn-remove-cart-item').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          store.removeFromCart(id);
          renderDrawer();
          window.TryonApp.renderRoute();
        });
      });

      document.getElementById('btn-clear-entire-cart')?.addEventListener('click', () => {
        store.clearCart();
        renderDrawer();
        window.TryonApp.renderRoute();
      });

      // Checkout
      document.getElementById('btn-cart-checkout')?.addEventListener('click', () => {
        const orderItems = items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          color: i.color
        }));

        try {
          const currentUser = store.getCurrentUser();
          const order = store.createOrder({
            customerName: currentUser ? currentUser.name : 'Valued Patron',
            customerEmail: currentUser ? currentUser.email : 'customer@tryon.fashion',
            customerPhone: '+92 300 1234567',
            customerAddress: 'Lahore, Pakistan',
            items: orderItems,
            status: 'Pending'
          });

          store.clearCart();
          closeCartDrawer();
          window.TryonApp.showToast(`Order #${order.id} confirmed! Total: Rs. ${order.total.toLocaleString()}`, 'success');
          window.location.hash = '#orders';
        } catch (err) {
          window.TryonApp.showToast('Checkout notice: ' + err.message, 'warning');
        }
      });
    }

    renderDrawer();
  }

  function closeCartDrawer() {
    const drawerContainer = document.getElementById('tryon-cart-drawer-container');
    if (drawerContainer) drawerContainer.innerHTML = '';
  }

  // ==================== EVENT BINDING ====================
  function initEvents() {
    // Category navigation tabs
    document.querySelectorAll('.btn-category-tab').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeCategory = e.currentTarget.getAttribute('data-category') || 'All';
        currentPage = 1;
        window.TryonApp.renderRoute();
      });
    });

    // Tier chips
    document.querySelectorAll('.btn-tier-chip').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        activeTier = e.currentTarget.getAttribute('data-tier') || 'all';
        currentPage = 1;
        window.TryonApp.renderRoute();
      });
    });

    // View switchers
    document.getElementById('btn-view-grid')?.addEventListener('click', () => {
      viewMode = 'collection';
      window.TryonApp.renderRoute();
    });

    document.getElementById('btn-view-table')?.addEventListener('click', () => {
      viewMode = 'table';
      window.TryonApp.renderRoute();
    });

    // Open Cart Hero button
    document.getElementById('btn-open-cart-hero')?.addEventListener('click', () => {
      openCartDrawer();
    });

    // CSV Export buttons (Hero, Toolbar, Table)
    const handleExportCSV = () => {
      const prodsToExport = getFilteredAndSortedProducts();
      window.TryonStore.exportProductsCSV(prodsToExport);
    };

    document.getElementById('btn-export-products-csv')?.addEventListener('click', handleExportCSV);
    document.getElementById('btn-toolbar-export-csv')?.addEventListener('click', handleExportCSV);
    document.getElementById('btn-table-export-csv')?.addEventListener('click', handleExportCSV);

    // CSV Import buttons (Hero, Toolbar, Table, Empty state)
    const handleOpenImport = () => {
      openProductImportModal();
    };

    document.getElementById('btn-open-import-products')?.addEventListener('click', handleOpenImport);
    document.getElementById('btn-toolbar-import-csv')?.addEventListener('click', handleOpenImport);
    document.getElementById('btn-table-import-csv')?.addEventListener('click', handleOpenImport);
    document.getElementById('btn-empty-import')?.addEventListener('click', handleOpenImport);

    // Search input
    const searchInput = document.getElementById('product-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        window.TryonApp.renderRoute();
      });
    }

    document.getElementById('btn-clear-search')?.addEventListener('click', () => {
      searchQuery = '';
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // Sort select
    document.getElementById('product-sort-select')?.addEventListener('change', (e) => {
      sortBy = e.target.value;
      window.TryonApp.renderRoute();
    });

    // Reset filters
    document.getElementById('btn-reset-all-filters')?.addEventListener('click', () => {
      activeCategory = 'All';
      searchQuery = '';
      activeTier = 'all';
      sortBy = 'featured';
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    document.getElementById('btn-empty-reset')?.addEventListener('click', () => {
      activeCategory = 'All';
      searchQuery = '';
      activeTier = 'all';
      sortBy = 'featured';
      currentPage = 1;
      window.TryonApp.renderRoute();
    });

    // Size selection on individual cards
    document.querySelectorAll('.btn-select-card-size').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prodId = e.currentTarget.getAttribute('data-prod-id');
        const size = e.currentTarget.getAttribute('data-size');
        if (!cardSelections[prodId]) cardSelections[prodId] = {};
        cardSelections[prodId].size = size;
        window.TryonApp.renderRoute();
      });
    });

    // View Product button / trigger
    document.querySelectorAll('.btn-trigger-view-product').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prodId = e.currentTarget.getAttribute('data-id');
        openProductDetailModal(prodId);
      });
    });

    // Add to Cart from card
    document.querySelectorAll('.btn-trigger-add-to-cart').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prodId = e.currentTarget.getAttribute('data-id');
        const store = window.TryonStore;
        const state = store.getState();
        const product = state.products.find((p) => p.id === prodId);
        if (!product) return;

        const sel = cardSelections[prodId] || {
          size: (product.sizes && product.sizes[0]) || 'M',
          color: (product.colors && product.colors[0]) || 'Default'
        };

        store.addToCart(prodId, sel.size, sel.color, 1);
        openCartDrawer();
      });
    });

    // Inventory Table events
    document.getElementById('check-all-products')?.addEventListener('change', (e) => {
      const state = window.TryonStore.getState();
      if (e.target.checked) {
        state.products.forEach((p) => selectedProductIds.add(p.id));
      } else {
        selectedProductIds.clear();
      }
      window.TryonApp.renderRoute();
    });

    document.querySelectorAll('.product-row-check').forEach((chk) => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.checked) selectedProductIds.add(id);
        else selectedProductIds.delete(id);
        window.TryonApp.renderRoute();
      });
    });

    document.getElementById('btn-bulk-delete-products')?.addEventListener('click', () => {
      window.TryonModals.openDeleteConfirm(
        'Delete Selected Products?',
        `Are you sure you want to delete ${selectedProductIds.size} selected piece(s)?`,
        () => {
          selectedProductIds.forEach((id) => window.TryonStore.deleteProduct(id));
          selectedProductIds.clear();
          window.TryonApp.showToast('Selected products deleted from catalog.', 'info');
          window.TryonApp.renderRoute();
        }
      );
    });

    // Pagination in Table mode
    document.getElementById('btn-prev-page')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        window.TryonApp.renderRoute();
      }
    });

    document.getElementById('btn-next-page')?.addEventListener('click', () => {
      currentPage++;
      window.TryonApp.renderRoute();
    });
  }

  // Expose module globally
  window.TryonPageProducts = {
    render,
    initEvents,
    openProductDetailModal,
    openProductImportModal,
    closeProductImportModal,
    openCartDrawer,
    closeCartDrawer,
    setCategory: (cat) => {
      activeCategory = cat;
      window.TryonApp.renderRoute();
    }
  };
})();
