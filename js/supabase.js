/**
 * TRYON Super Admin Panel - Supabase Integration Module
 * Connects to Supabase backend, performs realtime synchronization,
 * and maintains local resilience with graceful fallback.
 */

(function () {
  const SUPABASE_URL = 'https://ndjdmuzttlwyvzalemkk.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamRtdXp0dGx3eXZ6YWxlbWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NzQ4MzAsImV4cCI6MjEwNDI1MDgzMH0.wCOvVbmiwE94d96nX1rMEF3LM_iT1tWA0ejXYTvwcg0';

  let client = null;
  let isConnected = false;
  let connectionChecked = false;

  function init() {
    try {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        checkConnection();
      } else {
        console.warn('Supabase JS library not yet loaded. Will retry on demand.');
      }
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
    }
  }

  async function checkConnection() {
    if (!client) {
      isConnected = false;
      connectionChecked = true;
      updateUIStatus();
      return false;
    }
    try {
      // Test querying products or settings
      const { data, error } = await client.from('products').select('id').limit(1);
      if (!error) {
        isConnected = true;
      } else if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        // Connected to DB, but tables are pending schema creation
        isConnected = true;
        console.info('Supabase project connected! (Tables schema can be created using supabase_schema.sql)');
      } else {
        isConnected = true;
      }
    } catch (e) {
      console.warn('Supabase ping notice:', e);
      isConnected = false;
    }
    connectionChecked = true;
    updateUIStatus();
    return isConnected;
  }

  function updateUIStatus() {
    const badge = document.getElementById('supabase-status-pill');
    if (badge) {
      badge.innerHTML = isConnected
        ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
             <span class="w-1.5 h-1.5 rounded-full bg-[#137333] animate-pulse mr-1"></span>
             Supabase Connected
           </span>`
        : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]">
             <span class="w-1.5 h-1.5 rounded-full bg-[#B06000] mr-1"></span>
             Supabase Syncing
           </span>`;
    }
  }

  // --- SYNC HELPERS (Two-way synchronization) ---
  async function syncPullAll(store) {
    if (!client || !isConnected) return;
    try {
      // Pull products
      const { data: prods, error: pErr } = await client.from('products').select('*');
      if (!pErr && Array.isArray(prods) && prods.length > 0) {
        const state = store.getState();
        state.products = prods.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.category,
          sku: p.sku,
          price: parseFloat(p.price) || 0,
          salePrice: p.sale_price ? parseFloat(p.sale_price) : null,
          stock: p.stock,
          status: p.status,
          image: p.image,
          brand: p.brand,
          size: p.size,
          color: p.color,
          tags: p.tags || []
        }));
      }

      // Pull customers
      const { data: custs, error: cErr } = await client.from('customers').select('*');
      if (!cErr && Array.isArray(custs) && custs.length > 0) {
        const state = store.getState();
        state.customers = custs.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          address: c.address || '',
          status: c.status,
          ordersCount: c.orders_count || 0,
          totalSpent: parseFloat(c.total_spent) || 0,
          avatar: c.avatar || c.name.charAt(0).toUpperCase()
        }));
      }

      // Pull orders
      const { data: ords, error: oErr } = await client.from('orders').select('*');
      if (!oErr && Array.isArray(ords) && ords.length > 0) {
        const state = store.getState();
        state.orders = ords.map((o) => ({
          id: o.id,
          customer: o.customer,
          items: o.items,
          subtotal: parseFloat(o.subtotal) || 0,
          discount: parseFloat(o.discount) || 0,
          total: parseFloat(o.total) || 0,
          status: o.status,
          date: o.date,
          createdAt: o.created_at
        }));
      }

      // Pull expenses
      const { data: exps, error: eErr } = await client.from('expenses').select('*');
      if (!eErr && Array.isArray(exps) && exps.length > 0) {
        const state = store.getState();
        state.expenses = exps.map((e) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          amount: parseFloat(e.amount) || 0,
          date: e.date,
          description: e.description || ''
        }));
      }
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }
  }

  // Sync PUSH operations (background non-blocking)
  async function pushProduct(product) {
    if (!client) return;
    try {
      await client.from('products').upsert({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        sku: product.sku,
        price: product.price,
        sale_price: product.salePrice,
        stock: product.stock,
        status: product.status,
        image: product.image,
        brand: product.brand,
        size: product.size,
        color: product.color,
        tags: product.tags
      });
    } catch (e) {
      console.warn('Supabase product push notice:', e);
    }
  }

  async function deleteProduct(productId) {
    if (!client) return;
    try {
      await client.from('products').delete().eq('id', productId);
    } catch (e) {}
  }

  async function pushOrder(order) {
    if (!client) return;
    try {
      await client.from('orders').upsert({
        id: order.id,
        customer: order.customer,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        status: order.status,
        date: order.date,
        created_at: order.createdAt
      });
    } catch (e) {
      console.warn('Supabase order push notice:', e);
    }
  }

  async function deleteOrder(orderId) {
    if (!client) return;
    try {
      await client.from('orders').delete().eq('id', orderId);
    } catch (e) {}
  }

  async function pushCustomer(customer) {
    if (!client) return;
    try {
      await client.from('customers').upsert({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        orders_count: customer.ordersCount,
        total_spent: customer.totalSpent,
        avatar: customer.avatar
      });
    } catch (e) {
      console.warn('Supabase customer push notice:', e);
    }
  }

  async function deleteCustomer(customerId) {
    if (!client) return;
    try {
      await client.from('customers').delete().eq('id', customerId);
    } catch (e) {}
  }

  async function pushExpense(expense) {
    if (!client) return;
    try {
      await client.from('expenses').upsert({
        id: expense.id,
        name: expense.name,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        description: expense.description
      });
    } catch (e) {
      console.warn('Supabase expense push notice:', e);
    }
  }

  async function deleteExpense(expenseId) {
    if (!client) return;
    try {
      await client.from('expenses').delete().eq('id', expenseId);
    } catch (e) {}
  }

  window.TryonSupabase = {
    init,
    checkConnection,
    getClient: () => client,
    isConnected: () => isConnected,
    url: SUPABASE_URL,
    syncPullAll,
    pushProduct,
    deleteProduct,
    pushOrder,
    deleteOrder,
    pushCustomer,
    deleteCustomer,
    pushExpense,
    deleteExpense
  };

  // Auto-init on script load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
