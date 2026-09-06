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

  // Centralized Clothing Brand Catalog Products (NO IMAGES, pure luxury typography/information design)
  const CATALOG_PRODUCTS = [
    {
      id: 'CL-TEE-001',
      name: 'Essential Oversized Tee',
      category: 'T-Shirts',
      price: 2490,
      positioning: 'Everyday / Basic',
      tier: 'ENTRY',
      badge: 'ESSENTIAL',
      colors: ['Black', 'White', 'Grey'],
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'A clean oversized everyday t-shirt designed with a relaxed silhouette and minimal aesthetic.',
      stock: 65,
      status: 'In Stock',
      sku: 'CL-TEE-001',
      createdAt: '2026-01-10'
    },
    {
      id: 'CL-SHR-002',
      name: 'Premium Relaxed Shirt',
      category: 'Shirts',
      price: 3990,
      positioning: 'Smart Casual',
      tier: 'MID-RANGE',
      badge: 'NEW',
      colors: ['White', 'Black', 'Beige'],
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'A premium relaxed-fit shirt designed for a clean and effortless smart-casual look.',
      stock: 42,
      status: 'In Stock',
      sku: 'CL-SHR-002',
      createdAt: '2026-01-11'
    },
    {
      id: 'CL-PNT-003',
      name: 'Urban Cargo Pants',
      category: 'Pants',
      price: 4490,
      positioning: 'Streetwear',
      tier: 'MID-RANGE',
      badge: 'STREETWEAR',
      colors: ['Black', 'Olive', 'Beige'],
      sizes: ['28', '30', '32', '34', '36'],
      description: 'Modern cargo pants with a relaxed urban silhouette, designed for everyday streetwear styling.',
      stock: 38,
      status: 'In Stock',
      sku: 'CL-PNT-003',
      createdAt: '2026-01-12'
    },
    {
      id: 'CL-JKT-004',
      name: 'Classic Denim Jacket',
      category: 'Jackets',
      price: 5990,
      positioning: 'Premium',
      tier: 'PREMIUM',
      badge: 'PREMIUM',
      colors: ['Blue', 'Black'],
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'A timeless denim jacket combining classic structure with a modern everyday fit.',
      stock: 24,
      status: 'In Stock',
      sku: 'CL-JKT-004',
      createdAt: '2026-01-13'
    },
    {
      id: 'CL-HOD-005',
      name: 'Signature Hoodie',
      category: 'Hoodies',
      price: 4490,
      positioning: 'Winter / Streetwear',
      tier: 'MID-RANGE',
      badge: 'STREETWEAR',
      colors: ['Black', 'Grey', 'Cream'],
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'A comfortable signature hoodie with a clean silhouette, designed for everyday streetwear.',
      stock: 50,
      status: 'In Stock',
      sku: 'CL-HOD-005',
      createdAt: '2026-01-14'
    },
    {
      id: 'CL-DNM-006',
      name: 'Straight Fit Denim',
      category: 'Jeans',
      price: 4990,
      positioning: 'Everyday',
      tier: 'PREMIUM',
      badge: 'ESSENTIAL',
      colors: ['Dark Blue', 'Light Blue', 'Black'],
      sizes: ['28', '30', '32', '34', '36'],
      description: 'A versatile straight-fit denim designed to provide a timeless everyday look.',
      stock: 30,
      status: 'In Stock',
      sku: 'CL-DNM-006',
      createdAt: '2026-01-15'
    },
    {
      id: 'CL-POL-007',
      name: 'Minimal Polo',
      category: 'Polos',
      price: 3290,
      positioning: 'Smart Casual',
      tier: 'MID-RANGE',
      badge: null,
      colors: ['Black', 'White', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'A minimal polo with a refined silhouette, perfect for casual and smart-casual outfits.',
      stock: 40,
      status: 'In Stock',
      sku: 'CL-POL-007',
      createdAt: '2026-01-16'
    },
    {
      id: 'CL-SHR-008',
      name: 'Linen Summer Shirt',
      category: 'Summer',
      price: 3490,
      positioning: 'Seasonal',
      tier: 'MID-RANGE',
      badge: 'SEASONAL',
      colors: ['White', 'Beige', 'Sky Blue'],
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'A lightweight linen-inspired summer shirt designed for a relaxed and breathable seasonal look.',
      stock: 35,
      status: 'In Stock',
      sku: 'CL-SHR-008',
      createdAt: '2026-01-17'
    }
  ];

  // Initial Demo Audit Logs
  const DEFAULT_AUDIT_LOGS = [
    {
      id: 'log-1',
      action: 'User created',
      performedBy: 'Tryon Admin (Admin)',
      targetUser: 'Store Staff User (user@tryon.demo)',
      details: 'Assigned User role with Active status',
      timestamp: '2026-01-03T10:30:00.000Z',
      formattedDate: '2026-01-03 10:30'
    },
    {
      id: 'log-2',
      action: 'Role changed',
      performedBy: 'Tryon Admin (Admin)',
      targetUser: 'Operations Manager (manager@tryon.demo)',
      details: 'Assigned role Manager',
      timestamp: '2026-01-02T14:15:00.000Z',
      formattedDate: '2026-01-02 14:15'
    },
    {
      id: 'log-3',
      action: 'User created',
      performedBy: 'System',
      targetUser: 'Tryon Admin (admin@tryon.demo)',
      details: 'Primary Administrator account provisioned',
      timestamp: '2026-01-01T09:00:00.000Z',
      formattedDate: '2026-01-01 09:00'
    }
  ];

  // Initial State with centralized catalog & cart
  function getInitialState() {
    return {
      products: JSON.parse(JSON.stringify(CATALOG_PRODUCTS)),
      cart: [],
      orders: [],
      customers: [],
      expenses: [],
      importHistory: [],
      users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
      auditLogs: JSON.parse(JSON.stringify(DEFAULT_AUDIT_LOGS)),
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
          currency: 'PKR',
          currencySymbol: 'Rs.',
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
        if (!Array.isArray(parsed.products) || parsed.products.length === 0 || !parsed.products.some((p) => p.id && p.id.startsWith('CL-'))) {
          parsed.products = JSON.parse(JSON.stringify(CATALOG_PRODUCTS));
        }
        if (!Array.isArray(parsed.cart)) parsed.cart = [];
        if (!Array.isArray(parsed.orders)) parsed.orders = [];
        if (!Array.isArray(parsed.customers)) parsed.customers = [];
        if (!Array.isArray(parsed.expenses)) parsed.expenses = [];
        if (!Array.isArray(parsed.importHistory)) parsed.importHistory = [];
        if (!Array.isArray(parsed.users) || parsed.users.length === 0) parsed.users = JSON.parse(JSON.stringify(DEFAULT_USERS));
        if (!Array.isArray(parsed.auditLogs)) parsed.auditLogs = JSON.parse(JSON.stringify(DEFAULT_AUDIT_LOGS));
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
      if (raw) {
        const session = JSON.parse(raw);
        // Sync with live state to ensure active status & latest role
        const live = state.users.find((u) => u.id === session.id || u.email.toLowerCase() === session.email.toLowerCase());
        if (live) {
          return {
            id: live.id,
            name: live.name,
            email: live.email,
            role: live.role,
            status: live.status,
            avatar: live.avatar || live.name.charAt(0).toUpperCase()
          };
        }
        return session;
      }
    } catch (e) {}
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
      status: user.status,
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
    const currentUser = getCurrentUser();
    const role = userRole || (currentUser ? currentUser.role : null);
    if (!role) return false;

    // Deactivated account has no access
    if (currentUser && currentUser.status === 'Inactive') return false;

    if (role === 'Admin') return true;

    // Manager permissions
    if (role === 'Manager') {
      const restrictedForManager = ['settings:security', 'settings:business', 'settings:users', 'system:reset'];
      return !restrictedForManager.includes(page);
    }

    // User permissions (simplified day-to-day access only)
    if (role === 'User') {
      const allowedForUser = ['dashboard', 'products', 'orders', 'customers', 'reports:sales', 'settings:profile'];
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

  // --- CART MANAGEMENT ---
  function getCart() {
    if (!state.cart) state.cart = [];
    return state.cart;
  }

  function addToCart(productId, size, color, quantity = 1) {
    if (!state.cart) state.cart = [];
    const product = state.products.find((p) => p.id === productId);
    if (!product) {
      throw new Error('Product not found in catalog.');
    }

    const selSize = size || (product.sizes && product.sizes[0]) || 'M';
    const selColor = color || (product.colors && product.colors[0]) || 'Default';
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    const existingIndex = state.cart.findIndex(
      (item) => item.productId === productId && item.size === selSize && item.color === selColor
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += qty;
    } else {
      const cartItem = {
        id: 'CART-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        size: selSize,
        color: selColor,
        quantity: qty,
        addedAt: new Date().toISOString()
      };
      state.cart.push(cartItem);
    }

    pushNotification('Added to Bag', `Added "${product.name}" (${selSize} • ${selColor}) to your bag.`, 'success');
    notify('cart:update', state.cart);
    return state.cart;
  }

  function updateCartQuantity(cartItemId, quantity) {
    if (!state.cart) return [];
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      return removeFromCart(cartItemId);
    }
    const item = state.cart.find((i) => i.id === cartItemId);
    if (item) {
      item.quantity = qty;
      notify('cart:update', state.cart);
    }
    return state.cart;
  }

  function removeFromCart(cartItemId) {
    if (!state.cart) return [];
    const idx = state.cart.findIndex((i) => i.id === cartItemId);
    if (idx > -1) {
      const removed = state.cart.splice(idx, 1)[0];
      pushNotification('Removed from Bag', `Removed "${removed.name}" from your bag.`, 'info');
      notify('cart:update', state.cart);
    }
    return state.cart;
  }

  function clearCart() {
    state.cart = [];
    notify('cart:update', state.cart);
    return state.cart;
  }

  function getCartTotals() {
    const items = state.cart || [];
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
    return {
      items,
      itemCount: totalCount,
      subtotal,
      currency: 'Rs.'
    };
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

  // --- ACTIVITY & AUDIT LOGS ---
  function getAuditLogs() {
    return state.auditLogs || [];
  }

  function addAuditLog(action, targetUser = '—', details = '') {
    const currentUser = getCurrentUser();
    const actor = currentUser ? `${currentUser.name} (${currentUser.role})` : 'System';
    const now = new Date();
    const entry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      action,
      performedBy: actor,
      targetUser,
      details,
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    if (!Array.isArray(state.auditLogs)) state.auditLogs = [];
    state.auditLogs.unshift(entry);
    if (state.auditLogs.length > 100) state.auditLogs.pop();
    if (window.TryonSupabase && typeof window.TryonSupabase.pushAuditLog === 'function') {
      window.TryonSupabase.pushAuditLog(entry);
    }
    notify('audit:log', entry);
    return entry;
  }

  // --- USERS & ROLES (Admin Only with Full RBAC & Admin Protection) ---
  function addUser(data) {
    const caller = getCurrentUser();
    if (caller && caller.role !== 'Admin') {
      throw new Error('Forbidden: Only Administrators can add new users.');
    }

    if (!data.name || !data.name.trim()) {
      throw new Error('Full Name is required.');
    }
    const normalizedEmail = (data.email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Email Address is required.');
    }

    // Prevent duplicate users with the same email
    const exists = state.users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      throw new Error(`A user with the email "${data.email.trim()}" already exists.`);
    }

    const assignedRole = data.role || 'User';
    if (!['Admin', 'Manager', 'User'].includes(assignedRole)) {
      throw new Error('Invalid role specified. Must be Admin, Manager, or User.');
    }

    const assignedStatus = data.status || 'Active';
    if (!['Active', 'Inactive'].includes(assignedStatus)) {
      throw new Error('Invalid status specified. Must be Active or Inactive.');
    }

    const newUser = {
      id: 'usr-' + (100 + state.users.length + 1),
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password || 'Demo@123',
      role: assignedRole,
      status: assignedStatus,
      avatar: (data.name.trim().charAt(0) || 'U').toUpperCase(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    state.users.push(newUser);
    addAuditLog('User created', `${newUser.name} (${newUser.email})`, `Created as ${newUser.role} with status ${newUser.status}`);
    pushNotification('User Created', `Created ${newUser.role} account for "${newUser.name}"`, 'success');
    if (window.TryonSupabase && typeof window.TryonSupabase.pushUser === 'function') {
      window.TryonSupabase.pushUser(newUser);
    }
    notify('user:add', newUser);
    return newUser;
  }

  function updateUser(id, updates) {
    const caller = getCurrentUser();
    if (caller && caller.role !== 'Admin') {
      throw new Error('Forbidden: Only Administrators can modify user details.');
    }

    const idx = state.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found.');

    const existing = state.users[idx];

    // Check duplicate email if changing email
    if (updates.email) {
      const newEmail = updates.email.trim().toLowerCase();
      const conflict = state.users.some((u) => u.id !== id && u.email.toLowerCase() === newEmail);
      if (conflict) {
        throw new Error(`A user with the email "${updates.email.trim()}" already exists.`);
      }
    }

    // Admin Protection: Ensure at least one active Admin remains
    if (existing.role === 'Admin') {
      const isDemoting = updates.role && updates.role !== 'Admin';
      const isDeactivating = updates.status && updates.status !== 'Active';
      if (isDemoting || isDeactivating) {
        const otherActiveAdmins = state.users.filter(
          (u) => u.id !== id && u.role === 'Admin' && u.status === 'Active'
        );
        if (otherActiveAdmins.length === 0) {
          throw new Error('Action blocked: System requires at least one active Administrator account.');
        }
      }
    }

    // Audit logs for specific attribute modifications
    if (updates.role && updates.role !== existing.role) {
      addAuditLog('Role changed', `${existing.name} (${existing.email})`, `Role changed from ${existing.role} to ${updates.role}`);
    }
    if (updates.status && updates.status !== existing.status) {
      addAuditLog(
        updates.status === 'Active' ? 'User activated' : 'User deactivated',
        `${existing.name} (${existing.email})`,
        `Status changed from ${existing.status} to ${updates.status}`
      );
    }

    state.users[idx] = {
      ...existing,
      ...updates,
      name: updates.name ? updates.name.trim() : existing.name,
      email: updates.email ? updates.email.trim() : existing.email
    };

    pushNotification('User Updated', `Updated profile for "${state.users[idx].name}"`, 'info');
    if (window.TryonSupabase && typeof window.TryonSupabase.pushUser === 'function') {
      window.TryonSupabase.pushUser(state.users[idx]);
    }
    notify('user:update', state.users[idx]);
    return state.users[idx];
  }

  function assignRoleByEmail(email, newRole) {
    const caller = getCurrentUser();
    if (caller && caller.role !== 'Admin') {
      throw new Error('Forbidden: Only Administrators can assign or change user roles.');
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Please enter a valid email address.');
    }

    if (!['Admin', 'Manager', 'User'].includes(newRole)) {
      throw new Error('Invalid role specified. Must be Admin, Manager, or User.');
    }

    const user = state.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      throw new Error('User not found. Please add the user first.');
    }

    // Admin Protection: Prevent demoting the last active Admin
    if (user.role === 'Admin' && newRole !== 'Admin') {
      const otherActiveAdmins = state.users.filter(
        (u) => u.id !== user.id && u.role === 'Admin' && u.status === 'Active'
      );
      if (otherActiveAdmins.length === 0) {
        throw new Error('Cannot change role: System requires at least one active Admin account.');
      }
    }

    if (user.role === newRole) {
      return { success: true, user, unchanged: true, message: `User already has the ${newRole} role.` };
    }

    const oldRole = user.role;
    user.role = newRole;

    addAuditLog('Role changed', `${user.name} (${user.email})`, `Role changed from ${oldRole} to ${newRole}`);
    pushNotification('Role Changed', `Assigned ${newRole} role to ${user.email}`, 'success');

    if (window.TryonSupabase && typeof window.TryonSupabase.pushUser === 'function') {
      window.TryonSupabase.pushUser(user);
    }

    notify('user:update', user);
    return { success: true, user, oldRole, newRole };
  }

  function toggleUserStatus(id) {
    const caller = getCurrentUser();
    if (caller && caller.role !== 'Admin') {
      throw new Error('Forbidden: Only Administrators can activate or deactivate accounts.');
    }

    const user = state.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found.');

    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';

    // Admin Protection: Cannot deactivate the last active Admin
    if (user.role === 'Admin' && newStatus === 'Inactive') {
      const otherActiveAdmins = state.users.filter(
        (u) => u.id !== id && u.role === 'Admin' && u.status === 'Active'
      );
      if (otherActiveAdmins.length === 0) {
        throw new Error('Action blocked: Cannot deactivate the last remaining active Administrator.');
      }
    }

    user.status = newStatus;
    const actionName = newStatus === 'Active' ? 'User activated' : 'User deactivated';
    addAuditLog(actionName, `${user.name} (${user.email})`, `Account marked as ${newStatus}`);
    pushNotification(actionName, `${user.name}'s account is now ${newStatus}`, newStatus === 'Active' ? 'success' : 'warning');

    if (window.TryonSupabase && typeof window.TryonSupabase.pushUser === 'function') {
      window.TryonSupabase.pushUser(user);
    }

    notify('user:update', user);
    return user;
  }

  function deleteUser(id) {
    const caller = getCurrentUser();
    if (caller && caller.role !== 'Admin') {
      throw new Error('Forbidden: Only Administrators can delete user accounts.');
    }

    const user = state.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found.');

    // Prevent deleting the primary admin account
    if (id === 'usr-1' || user.email.toLowerCase() === 'admin@tryon.demo') {
      throw new Error('Primary Administrator account (admin@tryon.demo) cannot be deleted.');
    }

    // Admin Protection: Cannot delete the last active Admin
    if (user.role === 'Admin') {
      const otherActiveAdmins = state.users.filter(
        (u) => u.id !== id && u.role === 'Admin' && u.status === 'Active'
      );
      if (otherActiveAdmins.length === 0) {
        throw new Error('Cannot delete the last remaining active Administrator account.');
      }
    }

    const idx = state.users.findIndex((u) => u.id === id);
    const removed = state.users.splice(idx, 1)[0];

    addAuditLog('User deleted', `${removed.name} (${removed.email})`, `Deleted ${removed.role} account`);
    pushNotification('User Deleted', `Deleted user account "${removed.name}"`, 'warning');

    if (window.TryonSupabase && typeof window.TryonSupabase.deleteUser === 'function') {
      window.TryonSupabase.deleteUser(id);
    }

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

    addAuditLog(
      'Data imported',
      `Batch ${batchId}`,
      `Imported ${createdOrderIds.length} orders from ${fileName || 'CSV/XLSX'} ($${totalRevenue.toFixed(2)})`
    );

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
    addAuditLog('Import reverted', `Batch ${batchId}`, `Reverted ${orderIdsToRemove.size} imported orders`);
    pushNotification('Import Reverted', `Reverted batch ${batchId} (${orderIdsToRemove.size} orders removed)`, 'warning');
    notify('import:revert', batchId);
    return true;
  }

  // --- PRODUCTS CSV IMPORT & EXPORT ---
  function importProductsBatch(productsList) {
    const caller = getCurrentUser();
    if (caller && caller.role === 'User') {
      throw new Error('Forbidden: Regular staff users cannot import products.');
    }

    if (!Array.isArray(productsList) || productsList.length === 0) {
      throw new Error('No valid products to import.');
    }

    let addedCount = 0;
    let updatedCount = 0;

    productsList.forEach((item) => {
      const name = (item.name || item.productName || item['Product Name'] || '').trim();
      if (!name) return;

      const rawPrice = item.price || item.unitPrice || item['Price (Rs.)'] || item['Price'] || 0;
      const price = parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) || 0;
      const category = (item.category || item['Category'] || 'T-Shirts').trim();

      // Calculate tier
      let tier = (item.tier || item['Tier'] || '').trim().toUpperCase();
      if (!['ENTRY', 'MID-RANGE', 'PREMIUM'].includes(tier)) {
        if (price < 3000) tier = 'ENTRY';
        else if (price <= 4500) tier = 'MID-RANGE';
        else tier = 'PREMIUM';
      }

      // ID calculation: CL-CAT-XXX
      let id = (item.id || item.productId || item['Product ID'] || '').trim();
      if (!id) {
        const catCode = category.slice(0, 3).toUpperCase();
        const num = String(state.products.length + 1).padStart(3, '0');
        id = `CL-${catCode}-${num}`;
      }

      // Parse colors
      let colors = item.colors || item['Colors'];
      if (typeof colors === 'string') {
        colors = colors.split(/[,|•]/).map((c) => c.trim()).filter(Boolean);
      }
      if (!Array.isArray(colors) || colors.length === 0) {
        colors = ['Black', 'White'];
      }

      // Parse sizes
      let sizes = item.sizes || item['Sizes'];
      if (typeof sizes === 'string') {
        sizes = sizes.split(/[,|•]/).map((s) => s.trim()).filter(Boolean);
      }
      if (!Array.isArray(sizes) || sizes.length === 0) {
        sizes = ['S', 'M', 'L', 'XL'];
      }

      const existingIndex = state.products.findIndex((p) => p.id.toLowerCase() === id.toLowerCase());

      const productRecord = {
        id: id,
        name: name,
        category: category,
        price: price,
        positioning: (item.positioning || item['Positioning'] || 'Everyday / Basic').trim(),
        tier: tier,
        badge: item.badge || item['Badge'] ? String(item.badge || item['Badge']).trim().toUpperCase() : null,
        colors: colors,
        sizes: sizes,
        description: (item.description || item['Description'] || `A clean ${category.toLowerCase()} designed with a relaxed silhouette and minimal aesthetic.`).trim(),
        stock: parseInt(item.stock || item['Stock'], 10) || 50,
        status: (item.status || item['Status'] || 'In Stock').trim(),
        sku: id,
        createdAt: item.createdAt || new Date().toISOString()
      };

      if (existingIndex > -1) {
        state.products[existingIndex] = { ...state.products[existingIndex], ...productRecord };
        updatedCount++;
      } else {
        state.products.push(productRecord);
        addedCount++;
      }

      if (window.TryonSupabase && typeof window.TryonSupabase.pushProduct === 'function') {
        window.TryonSupabase.pushProduct(productRecord);
      }
    });

    const totalAffected = addedCount + updatedCount;
    addAuditLog('Products imported', 'Product Catalog', `Imported ${addedCount} new piece(s), updated ${updatedCount} piece(s) via CSV`);
    pushNotification('Products Imported', `Imported ${addedCount} new and updated ${updatedCount} items.`, 'success');
    notify('product:import', { added: addedCount, updated: updatedCount, total: totalAffected });
    return { added: addedCount, updated: updatedCount, total: totalAffected };
  }

  function exportProductsCSV(productsToExport) {
    const list = Array.isArray(productsToExport) && productsToExport.length > 0 ? productsToExport : state.products;

    const headers = [
      'Product ID',
      'Product Name',
      'Category',
      'Price (Rs.)',
      'Positioning',
      'Tier',
      'Badge',
      'Colors',
      'Sizes',
      'Description',
      'Stock',
      'Status'
    ];

    function escapeCSV(val) {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }

    const rows = list.map((p) =>
      [
        escapeCSV(p.id),
        escapeCSV(p.name),
        escapeCSV(p.category),
        escapeCSV(p.price),
        escapeCSV(p.positioning || ''),
        escapeCSV(p.tier || ''),
        escapeCSV(p.badge || ''),
        escapeCSV((p.colors || []).join(', ')),
        escapeCSV((p.sizes || []).join(', ')),
        escapeCSV(p.description || ''),
        escapeCSV(p.stock !== undefined ? p.stock : 50),
        escapeCSV(p.status || 'In Stock')
      ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `tryon_products_catalog_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    pushNotification('Catalog Exported', `Exported ${list.length} products to CSV file.`, 'info');
    return true;
  }

  function downloadProductsCSVTemplate() {
    const headers = 'Product ID,Product Name,Category,Price (Rs.),Positioning,Tier,Badge,Colors,Sizes,Description,Stock,Status';
    const sampleRows = [
      'CL-TEE-009,"Heavyweight Boxy Tee","T-Shirts",2790,"Everyday / Basic","ENTRY","ESSENTIAL","Black, White, Washed Grey","S, M, L, XL","Dense organic cotton boxy everyday tee.",60,"In Stock"',
      'CL-SHR-010,"Structured Cuban Shirt","Shirts",4290,"Smart Casual","MID-RANGE","NEW","Beige, Olive, Black","S, M, L, XL","Breathable poplin relaxed Cuban shirt with camp collar.",35,"In Stock"'
    ];
    const content = [headers, ...sampleRows].join('\r\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tryon_products_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  // --- RESET DEMO DATA ---
  function resetDemoData() {
    const currentSession = getCurrentUser();
    if (currentSession && currentSession.role !== 'Admin') {
      throw new Error('Forbidden: Only Administrators can reset demo data.');
    }
    state = getInitialState();
    saveState(state);
    if (currentSession) {
      // Keep logged in user
      setCurrentUser(currentSession);
    }
    addAuditLog('System reset', 'Entire Environment', 'All products, orders, customers, and expenses reset to initial state');
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
    // Users & Roles
    addUser,
    updateUser,
    assignRoleByEmail,
    toggleUserStatus,
    deleteUser,
    getAuditLogs,
    addAuditLog,
    // Import & Batch
    importBatchData,
    revertImportBatch,
    importProductsBatch,
    exportProductsCSV,
    downloadProductsCSVTemplate,
    // Cart & Bag
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotals,
    catalog: CATALOG_PRODUCTS,
    // Settings & Reset
    updateSettings,
    resetDemoData,
    searchAll,
    presets: APPAREL_IMAGE_PRESETS
  };
})();
