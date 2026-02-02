(function (window) {
  const DB_KEY = 'simplebuyDatabase';

  function loadDB() {
    try {
      const raw = window.localStorage.getItem(DB_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data && typeof data === 'object' ? data : null;
    } catch (e) {
      console.error('SimpleBuyDB: failed to read from localStorage', e);
      return null;
    }
  }

  function saveDB(db) {
    try {
      window.localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('SimpleBuyDB: failed to write to localStorage', e);
    }
  }

  function getOrInitDB() {
    let db = loadDB();
    if (!db) {
      db = {
        version: 1,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        products: [],          // optional static product catalog copy
        productEvents: [],     // add / remove / update events
        extraProductsSnapshot: [],
        users: [],             // saved profiles from account page
        userEvents: [],        // logins, logouts, cart activity
        orders: []             // completed (demo) orders
      };
      saveDB(db);
    }
    return db;
  }

  function touch(db) {
    db.lastUpdated = new Date().toISOString();
  }

  const SimpleBuyDB = {
    /**
     * Record a product-related event (add, remove, update).
     * Example event: { type: 'added', source: 'admin', product: {...} }
     */
    logProductEvent: function (event) {
      const db = getOrInitDB();
      const e = Object.assign({}, event, {
        id: 'pe-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
        at: new Date().toISOString()
      });
      db.productEvents.push(e);
      touch(db);
      saveDB(db);
    },

    /**
     * Keep the latest snapshot of admin-managed extra products.
     */
    recordExtraProducts: function (list) {
      const db = getOrInitDB();
      db.extraProductsSnapshot = Array.isArray(list) ? list : [];
      touch(db);
      saveDB(db);
    },

    /**
     * Store or update a user profile from the account page.
     */
    saveUserProfile: function (profile) {
      const db = getOrInitDB();
      db.users = db.users || [];
      const now = new Date().toISOString();
      const email = (profile && profile.email ? String(profile.email).toLowerCase() : '');

      let existing = null;
      if (email) {
        existing = db.users.find((u) => (u.email || '').toLowerCase() === email);
      }

      if (existing) {
        Object.assign(existing, profile, { updatedAt: now });
      } else {
        const record = Object.assign({}, profile, {
          id: 'user-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
          createdAt: now,
          updatedAt: now
        });
        db.users.push(record);
      }

      touch(db);
      saveDB(db);
    },

    /**
     * Log a user-related event: login, logout, cartAdd, cartRemove, etc.
     */
    logUserEvent: function (event) {
      const db = getOrInitDB();
      const e = Object.assign({}, event, {
        id: 'ue-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
        at: new Date().toISOString()
      });
      db.userEvents.push(e);
      touch(db);
      saveDB(db);
    },

    /**
     * Log a (demo) order when the customer completes checkout.
     * order: { items: [{ title, price, quantity }], total, shipping, tax, contact? }
     */
    logOrder: function (order) {
      const db = getOrInitDB();
      const now = new Date().toISOString();
      const record = Object.assign({}, order, {
        id: 'ord-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
        createdAt: now
      });
      db.orders.push(record);
      touch(db);
      saveDB(db);
    }
  };

  window.SimpleBuyDB = SimpleBuyDB;
})(window);
