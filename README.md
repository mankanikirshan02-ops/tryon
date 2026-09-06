# TRYON — Super Admin Panel Prototype

A pixel-faithful, fully workable and interactive Super Admin Panel prototype developed according to the finalized master TRYON UI/UX design specifications.

---

## 🌟 Quick Start

You can run this application immediately in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari):

1. Double-click **`index.html`** in your file explorer, OR
2. Open your terminal in this directory and launch any local static server (e.g. `npx serve .` or `python -m http.server 8000`).

---

## 🔑 Demo Login Credentials

The prototype comes with three pre-configured role accounts that work immediately without registration:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@tryon.demo` | `Admin@123` | **Full Access**: All 9 pages, full CRUD, user & role management, demo reset |
| **Manager** | `manager@tryon.demo` | `Manager@123` | **Operational Access**: Dashboard, Products, Orders, Customers, Reports. Restricted from Users & Roles and system reset |
| **User** | `user@tryon.demo` | `User@123` | **Day-to-day Access**: Dashboard, Products, Orders, Customers. Restricted from Reports and Settings |

> **Tip**: The login page also features **1-Click Demo Account** selector chips under the form for instant authentication!

---

## 🎨 Master Design Language & Tokens

- **Brand Color**: Deep Forest Green (`#163326`) for primary action buttons, active typography, and logo branding.
- **Active Navigation Indicator**: Soft Mint / Sage Green (`#E4EFE7`) pill with dark forest green text and icon.
- **Background**: Soft luxury off-white neutral (`#F8F9FA`).
- **Cards**: Pure white (`#FFFFFF`) with subtle border (`#EAECEE`) and soft elevation shadow.
- **Status Badges**:
  - *In Stock / Delivered / Active*: Green badge (`#E6F4EA` bg, `#137333` text)
  - *Low Stock / Pending*: Amber badge (`#FEF7E0` bg, `#B06000` text)
  - *Processing*: Blue badge (`#E8F0FE` bg, `#1A73E8` text)
  - *Shipped*: Purple badge (`#F3E8FF` bg, `#7E22CE` text)
  - *Out of Stock / Cancelled / Inactive*: Coral Red badge (`#FCE8E6` bg, `#C5221F` text)

---

## 🚀 Key Functional Features

1. **Initial Zero Business Data State**:
   - Opens completely clean with **0 products**, **0 orders**, **$0 revenue**, **0 customers**.
   - Elegant, tailored empty states with custom vector illustrations, helpful messages, and prominent call-to-action buttons.

2. **Temporary Local Data Persistence & Cross-Relational Sync**:
   - All created products, orders, customers, expenses, and users are safely stored in `localStorage`.
   - **Automatic Inventory Decrement**: When an order is placed, stock quantities for ordered items decrease automatically. When stock hits 0, status transitions to *"Out of Stock"*.
   - **Customer Spending Metrics**: Placing orders dynamically increments customer order counts and lifetime total spent.
   - **Live Financial Calculations**: Recording expenses dynamically calculates Cost of Goods Sold (COGS), Operating Expenses, and Net Profit Margin in the Profit & Loss report.

3. **Slide-Over Order Details Drawer**:
   - Matches the right-hand panel in the design reference.
   - Displays full order breakdown: Order ID, Date, status update dropdown, customer card, item thumbnails with prices, and summary subtotals.

4. **Global Search (`⌘ K` / `Ctrl K`)**:
   - Header search bar and keyboard shortcut trigger an instant modal searching across products, orders, and customers simultaneously.

5. **Role-Based Access Control (RBAC)**:
   - Dynamic sidebar menu adaptation per user role.
   - Direct navigation to unauthorized pages displays an *"Access Restricted"* security shield with a *"Back to Dashboard"* button.
   - Quick role switcher located inside the top-right profile dropdown for instantaneous role testing.

6. **Reset Demo Data**:
   - Located under **Settings → Security & Reset**.
   - Confirmation dialog clears temporary items and returns the system back to its original 0-data state.

---

## 📁 Project Architecture

```
tryon/
├── index.html                   # HTML5 application entry point
├── README.md                    # Documentation and testing guide
├── css/
│   └── styles.css               # TRYON design tokens, animations, custom scrollbars
└── js/
    ├── app.js                   # Application coordinator, hash router, toasts & RBAC
    ├── store.js                 # Reactive localStorage store, pub/sub, relational sync
    ├── components/
    │   ├── sidebar.js           # Navigation sidebar with collapsible Reports submenu
    │   ├── header.js            # Top header with search trigger, notifications & profile
    │   ├── orderDrawer.js       # Slide-over right drawer for order details
    │   └── modals.js            # Add/Edit Product, Create Order, Customer, Expense, User, Search
    └── pages/
        ├── login.js             # Login screen with 1-click demo accounts
        ├── dashboard.js         # Greeting hero, 4 KPI cards, sparkline, quick actions
        ├── products.js          # Product catalog table, search, category & stock filters
        ├── orders.js            # Orders table with status tabs (All, Pending, etc.)
        ├── customers.js         # Customers directory & lifetime purchase metrics
        ├── salesReport.js       # Sales performance overview bar chart & breakdown
        ├── revenue.js           # Dual charts (Trend line & Category distribution)
        ├── profitLoss.js        # Financial statement, margin gauges & + Add Expense
        └── settings.js          # Profile, Business, Users & Roles (Admin), Security & Reset
```

---

## 🧪 Recommended End-to-End Testing Flow

1. **Sign in as Admin** using `admin@tryon.demo` / `Admin@123` (or click the Admin demo chip).
2. **Review Initial Empty State**: Verify Dashboard KPIs show `0` / `$0`, and tables show clean empty states.
3. **Add a Product**: Navigate to **Products** → click `+ Add Product` → choose an apparel preset (e.g. *Classic Oversized Tee*, Price: $49, Stock: 10) → click **Save Product**.
4. **Verify Dashboard**: Total Products immediately updates from `0` to `1`.
5. **Add a Customer**: Navigate to **Customers** → click `+ Add Customer` → create a customer (e.g. *Sarah Jenkins*).
6. **Create an Order**: Navigate to **Orders** → click `+ Create Order` → select *Sarah Jenkins* and the *Classic Oversized Tee* (Quantity: 2) → save order.
7. **Verify Dynamic Updates**:
   - Product stock decreases from 10 to 8.
   - Dashboard shows Total Orders: 1, Total Revenue: $98, Total Customers: 1.
   - Click the order in the table to view the **Order Details Drawer** and update status to *Shipped*.
8. **Inspect Reports**:
   - Open **Reports → Sales Report**: Sales bar chart and daily breakdown reflect the order.
   - Open **Reports → Revenue**: Revenue trend curve and category breakdown display earnings.
   - Open **Reports → Profit & Loss**: Shows Revenue = $98. Click `+ Add Expense` (e.g. *Shipping Supplies: $15*) → Net Profit updates automatically.
9. **Test Role Restrictions**:
   - Use the profile dropdown in the top right to switch role to **User**.
   - Notice Reports and Settings are restricted, and attempting direct access shows *"Access Restricted"*.
10. **Reset Demo Data**:
    - Switch back to **Admin**, go to **Settings → Security & Reset** → click **Reset Demo Data** → confirm.
    - Everything returns to the pristine zero-data state!
