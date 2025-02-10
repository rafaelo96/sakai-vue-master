<script setup>
import { useStore } from '@/stores/userStore';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppConfigurator from './AppConfigurator.vue';

const store = useStore();
const router = useRouter();
const angle = ref(true);
const isAuthenticated = ref(false);

const out = async () => {
    const log = await store.logout();  // Usamos la acción del store para hacer logout
    if (log) {
        router.push('/');
    }
};

const profile = () => {
    router.push('/profile');
};

const menu = ref();
const items = ref([
    {
        items: [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: profile,
            },
            {
                label: 'Salir',
                icon: 'pi pi-sign-out',
                command: out,
            }
        ]
    }
]);

const toggle = (event) => {
    angle.value = !angle.value;
    menu.value.toggle(event);
};

onMounted(async () => {
    try {
        const response = await store.checkAuth();
        isAuthenticated.value = !!response;
        if (isAuthenticated.value) {
            store.setItem('user', JSON.stringify(response.user));
            this.setItem('token', null);
            this.setItem('user', null);
        }
        else{
            router.push('/');
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
    }
});
</script>


<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img src="/logo.svg" width="40px" alt="crwdbsness" />
                <span>crwdbsness</span>
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button" class="layout-topbar-action layout-topbar-action-highlight">
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>

                    <button v-ripple @click="toggle"
                        class="relative overflow-hidden w-full border-0 bg-transparent flex items-center justify-between p-2 pl-4 hover:bg-surface-100 dark:hover:bg-surface-800 rounded cursor-pointer transition-colors duration-200">
                        <!-- Avatar -->
                        <Avatar :image="store.user.avatar" class="mr-3"
                            shape="circle" />

                        <!-- Información del usuario -->
                        <div class="flex flex-col items-start flex-grow">
                            <span class="font-bold leading-tight">{{ store.user.name }}</span>
                            <span class="text-sm text-gray-500 dark:text-gray-400">{{ store.user.role }}</span>
                        </div>

                        <!-- Ícono -->
                        <i :class="['pi ml-2 transition-transform duration-200',
                            { 'pi-angle-down': angle, 'pi-angle-up': !angle }
                            ]" class="text-gray-600 dark:text-gray-300"></i>
                    </button>

                    <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
                </div>
            </div>
        </div>
    </div>
</template>
