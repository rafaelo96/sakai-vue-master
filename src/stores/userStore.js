import { defineStore } from 'pinia';

export const useStore = defineStore('user', {
    state: () => ({
        user: null,
        isAuthenticated: false
    }),
    actions: {
        login(user) {
            this.user = user;
            this.isAuthenticated = true;
        },
        logout() {
            this.user = null;
            this.isAuthenticated = false;
        },
        async getData(url, type = 'GET', data = null) {
            try {
                let response = null;
                const method = type.toUpperCase();
                const options = {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                // Agrega el cuerpo de la petición si es POST o PUT
                if (data && (method === 'POST' || method === 'PUT')) {
                    options.body = JSON.stringify(data);
                }
                response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error(error);
                throw error;
            }
        }
    }
});
