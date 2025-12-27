// ========== LOCAL DATABASE SYSTEM (IndexedDB) ==========
// نظام قاعدة بيانات محلية بديل عن Firebase

class LocalDatabase {
    constructor() {
        this.dbName = 'MobileStoreDB';
        this.version = 1;
        this.db = null;
        this.currentUser = null;
        this.initPromise = null; // Track initialization promise
        this.isInitialized = false;

        // Load current user from session
        this.loadCurrentUser();
    }

    // ========== DATABASE INITIALIZATION ==========
    async init() {
        // Return existing promise if already initializing
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Database failed to open:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('✅ Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                console.log('🔧 Upgrading database schema...');

                // Create Users store
                if (!this.db.objectStoreNames.contains('users')) {
                    const usersStore = this.db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    usersStore.createIndex('email', 'email', { unique: true });
                    usersStore.createIndex('createdAt', 'createdAt', { unique: false });
                    console.log('Created users store');
                }

                // Create Orders store
                if (!this.db.objectStoreNames.contains('orders')) {
                    const ordersStore = this.db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
                    ordersStore.createIndex('userId', 'userId', { unique: false });
                    ordersStore.createIndex('orderDate', 'orderDate', { unique: false });
                    ordersStore.createIndex('status', 'status', { unique: false });
                    ordersStore.createIndex('orderNumber', 'orderNumber', { unique: true });
                    console.log('Created orders store');
                }

                // Create Addresses store
                if (!this.db.objectStoreNames.contains('addresses')) {
                    const addressesStore = this.db.createObjectStore('addresses', { keyPath: 'id', autoIncrement: true });
                    addressesStore.createIndex('userId', 'userId', { unique: false });
                    console.log('Created addresses store');
                }

                console.log('✅ Database setup complete');
            };
        });

        return this.initPromise;
    }

    // Ensure database is initialized before operations
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.init();
        }
        if (!this.db) {
            throw new Error('Database not initialized');
        }
    }

    // ========== AUTHENTICATION ==========

    // Simple hash function (for demo - in production use better encryption)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'mobile-store-salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Register new user
    async registerUser(email, password, name) {
        try {
            await this.ensureInitialized();

            // Check if user already exists
            const existingUser = await this.getUserByEmail(email);
            if (existingUser) {
                throw new Error('auth/email-already-in-use');
            }

            const hashedPassword = await this.hashPassword(password);

            const user = {
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                name: name.trim(),
                phone: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const userId = await this.addData('users', user);
            user.id = userId;
            delete user.password; // Don't return password

            // Set as current user
            this.currentUser = user;
            this.saveCurrentUser();

            return { user };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Sign in user
    async signInUser(email, password) {
        try {
            await this.ensureInitialized();

            const user = await this.getUserByEmail(email);

            if (!user) {
                throw new Error('auth/user-not-found');
            }

            const hashedPassword = await this.hashPassword(password);

            if (user.password !== hashedPassword) {
                throw new Error('auth/wrong-password');
            }

            // Remove password before returning
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;

            // Set as current user
            this.currentUser = userWithoutPassword;
            this.saveCurrentUser();

            return { user: userWithoutPassword };
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    }

    // Sign out user
    async signOut() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('currentUser');
        return Promise.resolve();
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Save current user to session
    saveCurrentUser() {
        if (this.currentUser) {
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    // Load current user from session
    loadCurrentUser() {
        const sessionUser = sessionStorage.getItem('currentUser');
        const localUser = localStorage.getItem('currentUser');

        if (sessionUser) {
            this.currentUser = JSON.parse(sessionUser);
        } else if (localUser) {
            this.currentUser = JSON.parse(localUser);
            sessionStorage.setItem('currentUser', localUser);
        }
    }

    // Update user profile
    async updateUserProfile(userId, updates) {
        try {
            await this.ensureInitialized();

            const user = await this.getData('users', userId);
            if (!user) {
                throw new Error('User not found');
            }

            const updatedUser = {
                ...user,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await this.updateData('users', updatedUser);

            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === userId) {
                delete updatedUser.password;
                this.currentUser = updatedUser;
                this.saveCurrentUser();
            }

            return updatedUser;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    // Get user by email
    async getUserByEmail(email) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const index = store.index('email');
            const request = index.get(email.toLowerCase().trim());

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // ========== ORDERS MANAGEMENT ==========

    // Generate unique order number
    generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-${timestamp}-${random}`;
    }

    // Add new order
    async addOrder(orderData) {
        try {
            await this.ensureInitialized();

            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const order = {
                ...orderData,
                userId: this.currentUser.id,
                orderNumber: orderData.orderNumber || this.generateOrderNumber(),
                orderDate: new Date().toISOString(),
                status: orderData.status || 'Pending',
                createdAt: new Date().toISOString()
            };

            const orderId = await this.addData('orders', order);
            order.id = orderId;

            console.log('Order created:', order.orderNumber);
            return order;
        } catch (error) {
            console.error('Add order error:', error);
            throw error;
        }
    }

    // Get user orders
    async getUserOrders(userId) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['orders'], 'readonly');
            const store = transaction.objectStore('orders');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => {
                // Sort by date (newest first)
                const orders = request.result.sort((a, b) =>
                    new Date(b.orderDate) - new Date(a.orderDate)
                );
                resolve(orders);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Get order by ID
    async getOrder(orderId) {
        await this.ensureInitialized();
        return this.getData('orders', orderId);
    }

    // Update order status
    async updateOrderStatus(orderId, status) {
        try {
            await this.ensureInitialized();

            const order = await this.getData('orders', orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            order.status = status;
            order.updatedAt = new Date().toISOString();

            await this.updateData('orders', order);
            return order;
        } catch (error) {
            console.error('Update order status error:', error);
            throw error;
        }
    }

    // Delete order
    async deleteOrder(orderId) {
        await this.ensureInitialized();
        return this.deleteData('orders', orderId);
    }

    // ========== ADDRESSES MANAGEMENT ==========

    // Add address
    async addAddress(addressData) {
        try {
            await this.ensureInitialized();

            if (!this.currentUser) {
                throw new Error('User not authenticated');
            }

            const address = {
                ...addressData,
                userId: this.currentUser.id,
                createdAt: new Date().toISOString()
            };

            const addressId = await this.addData('addresses', address);
            address.id = addressId;

            return address;
        } catch (error) {
            console.error('Add address error:', error);
            throw error;
        }
    }

    // Get user addresses
    async getUserAddresses(userId) {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['addresses'], 'readonly');
            const store = transaction.objectStore('addresses');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Update address
    async updateAddress(addressId, updates) {
        try {
            await this.ensureInitialized();

            const address = await this.getData('addresses', addressId);
            if (!address) {
                throw new Error('Address not found');
            }

            const updatedAddress = {
                ...address,
                ...updates,
                updatedAt: new Date().toISOString()
            };

            await this.updateData('addresses', updatedAddress);
            return updatedAddress;
        } catch (error) {
            console.error('Update address error:', error);
            throw error;
        }
    }

    // Delete address
    async deleteAddress(addressId) {
        await this.ensureInitialized();
        return this.deleteData('addresses', addressId);
    }

    // ========== GENERIC DATABASE OPERATIONS ==========

    // Add data to store
    addData(storeName, data) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.add(data);

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    console.error(`Error adding to ${storeName}:`, request.error);
                    reject(request.error);
                };

                transaction.onerror = () => {
                    console.error(`Transaction error for ${storeName}:`, transaction.error);
                    reject(transaction.error);
                };
            } catch (error) {
                console.error(`Exception in addData for ${storeName}:`, error);
                reject(error);
            }
        });
    }

    // Get data from store
    getData(storeName, id) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(id);

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Get all data from store
    getAllData(storeName) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    resolve(request.result || []);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Update data in store
    updateData(storeName, data) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(data);

                request.onsuccess = () => {
                    resolve(request.result);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Delete data from store
    deleteData(storeName, id) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(id);

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    reject(request.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Clear all data from store
    clearStore(storeName) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => {
                    resolve();
                };

                request.onerror = () => {
                    reject(request.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // ========== UTILITY METHODS ==========

    // Get database statistics
    async getStats() {
        await this.ensureInitialized();

        const users = await this.getAllData('users');
        const orders = await this.getAllData('orders');
        const addresses = await this.getAllData('addresses');

        return {
            users: users.length,
            orders: orders.length,
            addresses: addresses.length,
            totalRevenue: orders.reduce((sum, order) => {
                const total = typeof order.total === 'string'
                    ? parseFloat(order.total.replace(/[^0-9.]/g, ''))
                    : order.total;
                return sum + (total || 0);
            }, 0)
        };
    }

    // Export data (for backup)
    async exportData() {
        await this.ensureInitialized();

        return {
            users: await this.getAllData('users'),
            orders: await this.getAllData('orders'),
            addresses: await this.getAllData('addresses'),
            exportDate: new Date().toISOString()
        };
    }
}

// ========== INITIALIZE AND EXPORT ==========
const localDB = new LocalDatabase();

// Initialize database when script loads
localDB.init().then(() => {
    console.log('Local database initialized and ready');
    window.dispatchEvent(new Event('localDBReady'));
}).catch(error => {
    console.error('Failed to initialize local database:', error);
});

// Export for use in other scripts
window.localDB = localDB;
