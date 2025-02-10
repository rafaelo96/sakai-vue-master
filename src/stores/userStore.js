import { defineStore } from 'pinia';
import axios from 'axios';

// Define el store de usuario
export const useStore = defineStore('user', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        isAuthenticated: false,
        items: {},
        serverUrl: 'http://localhost:8000',  // Puede ser configurado
    }),
    actions: {
        // Método para actualizar los valores del store
        setItem(key, value) {
            if (key === 'token') {
                this.token = value;
                this.isAuthenticated = !!value;
            } else if (key === 'user') {
                this.user =  JSON.parse(value);
            } else {
                this.items[key] = value;
            }
        },

        // Método para eliminar valores del store
        deleteItem(key) {
            if (Object.prototype.hasOwnProperty.call(this.items, key)) {
                delete this.items[key];
            }
        },

        // Crear una instancia de axios configurada
        createApi() {
            return axios.create({
                baseURL: `${this.serverUrl}/api`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                },
            });
        },

        // Enviar solicitudes HTTP a la API usando axios
        async send(url, type = 'GET', data = null) {
            try {
                const api = this.createApi();  // Usamos la instancia de axios configurada
                let response;

                // Hacemos la solicitud según el tipo (GET, POST, PUT, etc.)
                if (type.toUpperCase() === 'GET') {
                    response = await api.get(url);
                } else if (type.toUpperCase() === 'POST') {
                    response = await api.post(url, data);
                } else if (type.toUpperCase() === 'PUT') {
                    response = await api.put(url, data);
                } else if (type.toUpperCase() === 'DELETE') {
                    response = await api.delete(url);
                }

                return response.data;
            } catch (error) {
                console.error('Error en la solicitud:', error);
                return error.response ? error.response.data : error;
            }
        },

        // Método para verificar si el token es válido
        async checkAuth() {
            try {
                const api = this.createApi();  // Usamos la instancia de axios configurada
                const response = await api.get('/checkAuth');
                return response.data;
            } catch (error) {
                localStorage.removeItem('token');
                this.setItem('token', null);
                this.setItem('user', null);
                this.isAuthenticated = false;
                return null;
            }
        },

        // Método para hacer logout
        async logout() {
            try {
                const api = this.createApi();  // Usamos la instancia de axios configurada
                await api.post('/logout');
                localStorage.removeItem('token');
                this.setItem('token', null);
                this.setItem('user', null);
                this.isAuthenticated = false;
                return true;
            } catch (error) {
                console.error('Error en logout:', error);
                return false;
            }
        },
    }
});
