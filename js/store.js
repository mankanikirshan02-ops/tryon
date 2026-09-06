/**
 * TRYON Super Admin Panel - Reactive State Store
 * Manages local persistence, RBAC permissions, CRUD operations,
 * relational synchronization (inventory, customer metrics, expenses),
 * and clean initial empty states.
 */

(function () {
  const STORAGE_KEY = 'tryon_admin_state_v1';
  const SESSION_KEY = 'tryon_admin_session_v1';

  // Demo Credentials & Default Users
  const DEFAULT_USERS = [
    {
      id: 'usr-1',
      name: 'Tryon Admin',
      email: 'admin@tryon.demo',
      password: 'Admin@123',
      role: 'Admin',
      status: 'Active',
      avatar: 'T',
      createdAt: '2026-01-01'
    },
    {
      id: 'usr-2',
      name: 'Operations Manager',
      email: 'manager@tryon.demo',
      password: 'Manager@123',
      role: 'Manager',
      status: 'Active',
      avatar: 'M',
      createdAt: '2026-01-02'
    },
    {
      id: 'usr-3',
      name: 'Store Staff User',
      email: 'user@tryon.demo',
      password: 'User@123',
      role: 'User',
      status: 'Active',
      avatar: 'U',
      createdAt: '2026-01-03'
    }
  ];

  // Preset Apparel Images for Easy Product Creation
  const APPAREL_IMAGE_PRESETS = [
    {
      name: 'Classic Oversized Tee',
      url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      category: 'Tees'
    },
    {
      name: "Men's Denim Jacket",
      url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
      category: 'Jackets'
    },
    {
      name: 'Essential Fleece Hoodie',
      url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      category: 'Hoodies'
    },
    {
      name: 'Linen Button-down Shirt',
      url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
      category: 'Shirts'
    },
    {
      name: 'Pleated Relaxed Cargo Pants',
      url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
      category: 'Pants'
    },
    {
      name: 'Silk Slip Midi Dress',
      url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
      category: 'Dresses'
    },
    {
      name: 'Minimalist Leather Tote Bag',
      url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
      category: 'Accessories'
    },
    {
      name: 'Wool Knit Cardigan Sweater',
      url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80',
      category: 'Knitwear'
    }
  ];

  // Initial Empty State (Zero business data as required)
  function getInitialState() {
    return {
      products: [],
      orders: [],
      customers: [],
      expenses: [],
      importHistory: [],
      users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
      notifications: [],
      settings: {
        profile: {
          name: 'Tryon Admin',
          email: 'admin@tryon.demo',
          phone: '+1 (555) 019-2834',
          bio: 'Fashion Store Administrator & Lead Merchandise Planner',
          avatarUrl: ''
        },
        business: {
          name: 'TRYON Fashion Co.',
          email: 'store@tryon.fashion',
          phone: '+1 (800) 879-6632',
          address: '742 Evergreen Terrace, New York, NY 10001',
          currency: 'USD',
          currencySymbol: '$',
          info: 'Contemporary minimalist apparel and modern wardrobe essentials.'
        },
        notifications: {
          orderAlerts: true,
          stockAlerts: true,
          emailReports: false
        }
      }
    };
  }

  // Load or initialize state
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure all required collections exist
        if (!Array.isArray(parsed.products)) parsed.products = [];
        if (!Array.isArray(parsed.orders)) parsed.orders = [];
        if (!Array.isArray(parsed.customers)) parsed.customers = [];
        if (!Array.isArray(parsed.expenses)) parsed.expenses = [];
        if (!Array.isArray(parsed.importHistory)) parsed.importHistory = [];
        if (!Array.isArray(parsed.users) || parsed.users.length === 0) parsed.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
        if (!Array.isArray(parsed.notifications)) parsed.notifications = [];
        if (!parsed.settings) parsed.settings = getInitialState().settings;
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored TRYON state:', e);
    }
    const fresh = getInitialState();
    saveState(fresh);
    return fresh;
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error persisting TRYON state:', e);
    }
  }

  // Reactive Event Listeners
  const listeners = new Set();
  let state = loadState();

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function notify(changeType, payload) {
    saveState(state);
    listeners.forEach((listener) => {
      try {
        listener(changeType, payload, state);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }

  // Notification Helper
  function pushNotification(title, message, type = 'info') {
    const notification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    state.notifications.unshift(notification);
    if (state.notifications.length > 20) state.notifications.pop();
  }

  // Session & Auth
  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Default to Admin for seamless demo testing if desired, or null
    return null;
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    notify('session:change', user);
  }

  function login(email, password) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = state.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );
    if (!user) {
      return { success: false, error: 'Invalid email or password. Please try demo credentials below.' };
    }
    if (user.status !== 'Active') {
      return { success: false, error: 'This user account is currently deactivated. Contact Admin.' };
    }
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || user.name.charAt(0).toUpperCase()
    };
    setCurrentUser(sessionUser);
    pushNotification('Welcome back', `Signed in as ${user.name} (${user.role})`, 'success');
    return { success: true, user: sessionUser };
  }

  function logout() {
    setCurrentUser(null);
  }

  // Role Permissions Checker
  function canAccess(page, userRole) {
    const role = userRole || (getCurrentUser() ? getCurrentUser().role : null);
    if (!role) return false;
    if (role === 'Admin') return true;

    // Manager permissions
    if (role === 'Manager') {
      const restrictedForManager = ['settings:users', 'system:reset'];
      return !restrictedForManager.includes(page);
    }

    // User permissions (simplified day-to-day access only)
    if (role === 'User') {
      const allowedForUser = ['dashboard', 'products', 'orders', 'customers'];
      return allowedForUser.includes(page);
    }

    return false;
  }

  // ===================== CRUD OPERATIONS =====================

  // --- PRODUCTS ---
  function addProduct(data) {
    const stock = parseInt(data.stock, 10) || 0;
    let status = data.status;
    if (!status) {
      if (stock > 5) status = 'In Stock';
      else if (stock > 0) status = 'Low Stock';
      else status = 'Out of Stock';
    }

    const newProduct = {
      id: 'PRD-' + (1000 + state.products.length + 1),
      name: data.name.trim(),
      description: (data.description || '').trim(),
      category: data.category || 'Tees',
      sku: (data.sku || 'SKU-' + Math.floor(100000 + Math.random() * 900000)).trim(),
      price: parseFloat(data.price) || 0,
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      stock: stock,
      status: status,
      image: data.image || APPAREL_IMAGE_PRESETS[0].url,
      brand: data.brand || 'TRYON',
      size: data.size || 'M',
      color: data.color || 'Default',
      tags: data.tags ? (Array.isArray(data.tags) ? data.tags : data.tags.split(',').map((s) => s.trim())) : [],
      createdAt: new Date().toISOString()
    };

    state.products.unshift(newProduct);
    pushNotification('Product Added', `Added "${newProduct.name}" to inventory`, 'success');
    if (window.TryonSupabase) window.TryonSupabase.pushProduct(newProduct);
    notify('product:add', newProduct);
    return newProduct;
  }

  function updateProduct(id, updates) {
    const idx = state.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const existing = state.products[idx];
    const newStock = updates.stock !== undefined ? parseInt(updates.stock, 10) : existing.stock;
    
    let status = updates.status || existing.status;
    if (updates.stock !== undefined && !updates.status) {
      if (newStock > 5) status = 'In Stock';
      else if (newStock > 0) status = 'Low Stock';
      else status = 'Out of Stock';
    }

    state.products[idx] = {
      ...existing,
      ...updates,
      price: updates.price !== undefined ? parseFloat(updates.price) : existing.price,
      salePrice: updates.salePrice ? parseFloat(updates.salePrice) : (updates.salePrice === '' ? null : existing.salePrice),
      stock: newStock,
      status: status,
      tags: updates.tags ? (Array.isArray(updates.tags) ? updates.tags : updates.tags.split(',').map((s) => s.trim())) : existing.tags
    };

    pushNotification('Product Updated', `Updated details for "${state.products[idx].name}"`, 'info');
    if (window.TryonSupabase) window.TryonSupabase.pushProduct(state.products[idx]);
    notify('product:update', state.products[idx]);
    return state.products[idx];
  }

  function deleteProduct(id) {
    const idx = state.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const removed = state.products.splice(idx, 1)[0];
    pushNotification('Product Deleted', `Removed "${removed.name}"`, 'warning');
    if (window.TryonSupabase) window.TryonSupabase.deleteProduct(id);
    notify('product:delete', removed);
    return true;
  }

  // --- CUSTOMERS ---
  function addCustomer(data) {
    const newCustomer = {
      id: 'CUS-' + (100 + state.customers.length + 1),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: (data.phone || '').trim(),
      address: (data.address || 'New York, USA').trim(),
      status: data.status || 'Active',
      ordersCount: 0,
      totalSpent: 0,
      avatar: (data.name.trim().charAt(0) || 'C').toUpperCase(),
      createdAt: new Date().toISOString()
    };
    state.customers.unshift(newCustomer);
    pushNotification('Customer Created', `Registered new customer "${newCustomer.name}"`, 'success');
    if (window.TryonSupabase) window.TryonSupabase.pushCustomer(newCustomer);
    notify('customer:add', newCustomer);
    return newCustomer;
  }

  function updateCustomer(id, updates) {
    const idx = state.customers.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    state.customers[idx] = {
      ...state.customers[idx],
      ...updates
    };
    pushNotification('Customer Updated', `Updated details for "${state.customers[idx].name}"`, 'info');
    if (window.TryonSupabase) window.TryonSupabase.pushCustomer(state.customers[idx]);
    notify('customer:update', state.customers[idx]);
    return state.customers[idx];
  }

  function deleteCustomer(id) {
    const idx = state.customers.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const removed = state.customers.splice(idx, 1)[0];
    pushNotification('Customer Deleted', `Deleted customer record for "${removed.name}"`, 'warning');
    if (window.TryonSupabase) window.TryonSupabase.deleteCustomer(id);
    notify('customer:delete', removed);
    return true;
  }

  // --- ORDERS ---
  function createOrder(data) {
    // data: { customerId, customerName, customerEmail, customerPhone, customerAddress, items: [{ productId, quantity, price }], discount: 0, status: 'Pending' }
    let customer = state.customers.find((c) => c.id === data.customerId);
    if (!customer && data.customerName) {
      // Auto-create customer if new
      customer = addCustomer({
        name: data.customerName,
        email: data.customerEmail || `${data.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: data.customerPhone || '',
        address: data.customerAddress || 'New York, NY'
      });
    }

    if (!customer) {
      throw new Error('Please select or specify a valid customer for this order.');
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Order must include at least one product.');
    }

    // Calculate subtotal & prepare line items
    let subtotal = 0;
    const orderItems = [];

    for (const item of data.items) {
      const product = state.products.find((p) => p.id === item.productId);
      const qty = parseInt(item.quantity, 10) || 1;
      const unitPrice = product ? (product.salePrice || product.price) : (parseFloat(item.price) || 0);
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      orderItems.push({
        productId: item.productId,
        name: product ? product.name : (item.name || 'Custom Product'),
        category: product ? product.category : 'General',
        image: product ? product.image : APPAREL_IMAGE_PRESETS[0].url,
        price: unitPrice,
        quantity: qty,
        total: lineTotal
      });

      // Synchronize Inventory Stock!
      if (product) {
        const remainingStock = Math.max(0, product.stock - qty);
        product.stock = remainingStock;
        if (remainingStock === 0) {
          product.status = 'Out of Stock';
        } else if (remainingStock <= 5) {
          product.status = 'Low Stock';
        }
      }
    }

    const discount = parseFloat(data.discount) || 0;
    const total = Math.max(0, subtotal - discount);

    const orderNumber = 'ORD-' + (1000 + state.orders.length + 1);
    const newOrder = {
      id: orderNumber,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '+1 (555) 234-5678',
        address: customer.address || '742 Fashion Ave, NY'
      },
      items: orderItems,
      subtotal: subtotal,
      discount: discount,
      total: total,
      status: data.status || 'Pending', // Pending | Processing | Shipped | Delivered | Cancelled
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    state.orders.unshift(newOrder);

    // Synchronize Customer order metrics!
    customer.ordersCount = (customer.ordersCount || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + total;

    pushNotification('Order Created', `Order #${orderNumber} placed for $${total.toLocaleString()}`, 'success');

    if (window.TryonSupabase) {
      window.TryonSupabase.pushOrder(newOrder);
      window.TryonSupabase.pushCustomer(customer);
      orderItems.forEach((it) => {
        const prod = state.products.find((p) => p.id === it.productId);
        if (prod) window.TryonSupabase.pushProduct(prod);
      });
    }

    notify('order:create', newOrder);
    return newOrder;
  }

  function updateOrderStatus(orderId, newStatus) {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = newStatus;
    pushNotification('Order Status Changed', `Order #${orderId} marked as ${newStatus}`, 'info');
    if (window.TryonSupabase) window.TryonSupabase.pushOrder(order);
    notify('order:update_status', order);
    return order;
  }

  function deleteOrder(orderId) {
    const idx = state.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) return false;
    const removed = state.orders.splice(idx, 1)[0];

    // Adjust customer metrics
    const customer = state.customers.find((c) => c.id === removed.customer.id);
    if (customer) {
      customer.ordersCount = Math.max(0, (customer.ordersCount || 1) - 1);
      customer.totalSpent = Math.max(0, (customer.totalSpent || removed.total) - removed.total);
      if (window.TryonSupabase) window.TryonSupabase.pushCustomer(customer);
    }

    pushNotification('Order Deleted', `Removed order #${orderId}`, 'warning');
    if (window.TryonSupabase) window.TryonSupabase.deleteOrder(orderId);
    notify('order:delete', removed);
    return true;
  }

  // --- EXPENSES (for Profit & Loss) ---
  function addExpense(data) {
    const newExpense = {
      id: 'EXP-' + (100 + state.expenses.length + 1),
      name: data.name.trim(),
      category: data.category || 'Operating Expenses', // Cost of Goods Sold, Operating Expenses, Marketing, Logistics, Utilities
      amount: parseFloat(data.amount) || 0,
      date: data.date || new Date().toISOString().split('T')[0],
      description: (data.description || '').trim(),
      createdAt: new Date().toISOString()
    };
    state.expenses.unshift(newExpense);
    pushNotification('Expense Recorded', `Added expense "${newExpense.name}" ($${newExpense.amount})`, 'info');
    if (window.TryonSupabase) window.TryonSupabase.pushExpense(newExpense);
    notify('expense:add', newExpense);
    return newExpense;
  }

  function deleteExpense(id) {
    const idx = state.expenses.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    const removed = state.expenses.splice(idx, 1)[0];
    pushNotification('Expense Deleted', `Removed expense "${removed.name}"`, 'warning');
    if (window.TryonSupabase) window.TryonSupabase.deleteExpense(id);
    notify('expense:delete', removed);
    return true;
  }

  // --- USERS & ROLES (Admin Only) ---
  function addUser(data) {
    const newUser = {
      id: 'usr-' + (state.users.length + 1),
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password || 'Demo@123',
      role: data.role || 'User', // Admin | Manager | User
      status: data.status || 'Active',
      avatar: (data.name.trim().charAt(0) || 'U').toUpperCase(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    state.users.push(newUser);
    pushNotification('User Created', `Created ${newUser.role} account for "${newUser.name}"`, 'success');
    notify('user:add', newUser);
    return newUser;
  }

  function updateUser(id, updates) {
    const idx = state.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    state.users[idx] = {
      ...state.users[idx],
      ...updates
    };
    pushNotification('User Updated', `Updated profile for "${state.users[idx].name}"`, 'info');
    notify('user:update', state.users[idx]);
    return state.users[idx];
  }

  function deleteUser(id) {
    // Prevent deleting the primary admin account
    if (id === 'usr-1') {
      throw new Error('Primary Administrator account (admin@tryon.demo) cannot be deleted.');
    }
    const idx = state.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    const removed = state.users.splice(idx, 1)[0];
    pushNotification('User Deleted', `Deleted user account "${removed.name}"`, 'warning');
    notify('user:delete', removed);
    return true;
  }

  // --- SETTINGS UPDATE ---
  function updateSettings(section, data) {
    if (!state.settings[section]) state.settings[section] = {};
    state.settings[section] = {
      ...state.settings[section],
      ...data
    };
    pushNotification('Settings Saved', `Updated ${section} settings`, 'success');
    notify('settings:update', { section, data: state.settings[section] });
    return state.settings[section];
  }

  // --- IMPORT BATCH DATA & HISTORY ---
  function importBatchData({ fileName, records, totalRows, failedCount = 0 }) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('No valid records to import.');
    }

    const batchId = 'IMP-' + Date.now().toString(36).toUpperCase();
    const currentUser = getCurrentUser();
    const importedBy = currentUser ? currentUser.name : 'Admin';

    const createdOrderIds = [];
    const createdExpenseIds = [];
    let totalRevenue = 0;

    records.forEach((row, idx) => {
      // 1. Customer: find or create
      const custName = (row.customerName || 'Walk-in Customer').trim();
      const custEmail = (row.customerEmail || `${custName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'cust'}@example.com`).trim();
      let customer = state.customers.find((c) => c.name.toLowerCase() === custName.toLowerCase() || c.email.toLowerCase() === custEmail.toLowerCase());
      if (!customer) {
        customer = {
          id: 'CUS-' + (100 + state.customers.length + 1),
          name: custName,
          email: custEmail,
          phone: row.customerPhone || '',
          address: row.customerAddress || 'Direct Purchase',
          status: 'Active',
          ordersCount: 0,
          totalSpent: 0,
          avatar: (custName.charAt(0) || 'C').toUpperCase(),
          createdAt: new Date().toISOString()
        };
        state.customers.push(customer);
        if (window.TryonSupabase) window.TryonSupabase.pushCustomer(customer);
      }

      // 2. Product: find or create
      const prodName = (row.productName || 'Imported Merchandise').trim();
      const prodCategory = row.category || 'Tees';
      const qty = parseInt(row.quantity, 10) || 1;
      const unitPrice = parseFloat(row.price) > 0 ? parseFloat(row.price) : ((parseFloat(row.total) / qty) || 49);

      let product = state.products.find((p) => p.name.toLowerCase() === prodName.toLowerCase());
      if (!product) {
        product = {
          id: 'PRD-' + (1000 + state.products.length + 1),
          name: prodName,
          description: 'Imported via ' + fileName,
          category: prodCategory,
          sku: 'SKU-' + Math.floor(100000 + Math.random() * 900000),
          price: unitPrice,
          salePrice: null,
          stock: Math.max(25, qty * 2),
          status: 'In Stock',
          image: APPAREL_IMAGE_PRESETS[idx % APPAREL_IMAGE_PRESETS.length].url,
          brand: 'TRYON',
          size: 'M',
          color: 'Default',
          tags: ['Imported'],
          createdAt: new Date().toISOString()
        };
        state.products.push(product);
        if (window.TryonSupabase) window.TryonSupabase.pushProduct(product);
      }

      // 3. Order
      const lineTotal = parseFloat(row.total) > 0 ? parseFloat(row.total) : (unitPrice * qty);
      totalRevenue += lineTotal;

      let orderId = (row.orderId || '').trim();
      if (!orderId || state.orders.some((o) => o.id === orderId)) {
        orderId = 'ORD-' + (1000 + state.orders.length + 1);
      }

      const orderDate = row.date && !isNaN(Date.parse(row.date)) 
        ? new Date(row.date).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0];

      const newOrder = {
        id: orderId,
        batchId: batchId,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || '—',
          address: customer.address || '—'
        },
        items: [
          {
            productId: product.id,
            name: product.name,
            category: product.category,
            image: product.image,
            price: unitPrice,
            quantity: qty,
            total: lineTotal
          }
        ],
        subtotal: lineTotal,
        discount: 0,
        total: lineTotal,
        status: row.status || 'Delivered',
        date: orderDate,
        createdAt: new Date(orderDate).toISOString()
      };

      state.orders.push(newOrder);
      createdOrderIds.push(orderId);

      // Customer metrics
      customer.ordersCount = (customer.ordersCount || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + lineTotal;

      if (window.TryonSupabase) {
        window.TryonSupabase.pushOrder(newOrder);
        window.TryonSupabase.pushCustomer(customer);
      }

      // 4. Optional Cost / Expense for P&L
      if (row.cost !== undefined && parseFloat(row.cost) > 0) {
        const costAmount = parseFloat(row.cost);
        const exp = {
          id: 'EXP-' + (100 + state.expenses.length + 1),
          batchId: batchId,
          name: `COGS: ${prodName} (${orderId})`,
          category: 'Cost of Goods Sold',
          amount: costAmount,
          date: orderDate,
          description: `Product cost imported from ${fileName}`,
          createdAt: new Date().toISOString()
        };
        state.expenses.push(exp);
        createdExpenseIds.push(exp.id);
        if (window.TryonSupabase) window.TryonSupabase.pushExpense(exp);
      }
    });

    const historyEntry = {
      id: batchId,
      fileName: fileName || 'data_import.csv',
      date: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      totalRecords: totalRows || records.length,
      successCount: createdOrderIds.length,
      failedCount: failedCount,
      importedBy: importedBy,
      status: failedCount > 0 ? 'Completed with Warnings' : 'Completed',
      createdOrderIds: createdOrderIds,
      createdExpenseIds: createdExpenseIds,
      totalRevenue: totalRevenue
    };

    if (!Array.isArray(state.importHistory)) state.importHistory = [];
    state.importHistory.unshift(historyEntry);

    pushNotification(
      'Data Import Completed',
      `Imported ${createdOrderIds.length} orders from "${fileName}" ($${totalRevenue.toFixed(2)})`,
      'success'
    );

    notify('import:complete', historyEntry);
    return historyEntry;
  }

  function revertImportBatch(batchId) {
    const historyItem = (state.importHistory || []).find((h) => h.id === batchId);
    if (!historyItem) throw new Error('Import batch not found.');
    if (historyItem.status === 'Reverted') throw new Error('This import batch has already been reverted.');

    const orderIdsToRemove = new Set(historyItem.createdOrderIds || []);
    const expenseIdsToRemove = new Set(historyItem.createdExpenseIds || []);

    // 1. Remove orders and deduct customer spend
    const remainingOrders = [];
    for (const o of state.orders) {
      if (orderIdsToRemove.has(o.id) || o.batchId === batchId) {
        const cust = state.customers.find((c) => c.id === o.customer.id);
        if (cust) {
          cust.ordersCount = Math.max(0, (cust.ordersCount || 1) - 1);
          cust.totalSpent = Math.max(0, (cust.totalSpent || o.total) - o.total);
          if (window.TryonSupabase) window.TryonSupabase.pushCustomer(cust);
        }
        if (window.TryonSupabase) window.TryonSupabase.deleteOrder(o.id);
      } else {
        remainingOrders.push(o);
      }
    }
    state.orders = remainingOrders;

    // 2. Remove linked expenses
    state.expenses = state.expenses.filter((e) => {
      if (expenseIdsToRemove.has(e.id) || e.batchId === batchId) {
        if (window.TryonSupabase) window.TryonSupabase.deleteExpense(e.id);
        return false;
      }
      return true;
    });

    historyItem.status = 'Reverted';
    pushNotification('Import Reverted', `Reverted batch ${batchId} (${orderIdsToRemove.size} orders removed)`, 'warning');
    notify('import:revert', batchId);
    return true;
  }

  // --- RESET DEMO DATA ---
  function resetDemoData() {
    const currentSession = getCurrentUser();
    state = getInitialState();
    saveState(state);
    if (currentSession) {
      // Keep logged in user
      setCurrentUser(currentSession);
    }
    pushNotification('Demo Data Reset', 'All products, orders, customers, and expenses reset to clean state.', 'info');
    notify('system:reset', null);
  }

  // Global Search Helper
  function searchAll(query) {
    if (!query || !query.trim()) return { products: [], orders: [], customers: [] };
    const q = query.trim().toLowerCase();

    const matchedProducts = state.products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );

    const matchedOrders = state.orders.filter(
      (o) => o.id.toLowerCase().includes(q) || (o.customer && o.customer.name.toLowerCase().includes(q))
    );

    const matchedCustomers = state.customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    );

    return {
      products: matchedProducts,
      orders: matchedOrders,
      customers: matchedCustomers
    };
  }

  // Expose API on window.TryonStore
  window.TryonStore = {
    getState: () => state,
    subscribe,
    pushNotification,
    getCurrentUser,
    setCurrentUser,
    login,
    logout,
    canAccess,
    // Products
    addProduct,
    updateProduct,
    deleteProduct,
    // Customers
    addCustomer,
    updateCustomer,
    deleteCustomer,
    // Orders
    createOrder,
    updateOrderStatus,
    deleteOrder,
    // Expenses
    addExpense,
    deleteExpense,
    // Users
    addUser,
    updateUser,
    // Import & Batch
    importBatchData,
    revertImportBatch,
    // Settings & Reset
    updateSettings,
    resetDemoData,
    searchAll,
    presets: APPAREL_IMAGE_PRESETS
  };
})();
