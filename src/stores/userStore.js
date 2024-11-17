import { defineStore } from 'pinia';
export const useStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        isAuthenticated: false,
        items: {}
    }),
    actions: {
        setItem(key, value) {
            if (key === 'token') {
                this.token = value;
                this.isAuthenticated = !!value;
            } else if (key === 'user') {
                this.user = value;
            } else {
                this.items[key] = value;
            }
        },
        deleteItem(key) {
            if (Object.prototype.hasOwnProperty.call(this.items, key)) {
                delete this.items[key];
            }
        },
        async send(url, type = 'GET', data = null) {
            try {
                let response = null;
                const method = type.toUpperCase();
                const options = {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                    }
                };
                if (data && (method === 'POST' || method === 'PUT')) {
                    options.body = JSON.stringify(data);
                }
                response = await fetch(url, options);
                if (!response.ok) {
                    return response.status;
                }
                return await response.json();
            } catch (error) {
                return error;
            }
        },
        logout() {
            this.send('http://127.0.0.1:8000/api/logout', 'POST', null)
            this.setItem('token', null);
            this.setItem('user', null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    }
});
