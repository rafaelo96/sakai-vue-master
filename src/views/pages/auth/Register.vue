<script setup>
import { useStore } from '@/stores/userStore';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Importación de componentes de PrimeVue
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const toast = useToast();
const store = useStore();
const router = useRouter();

const email = ref('');
const name = ref('');
const last_name = ref('');
const second_last_name = ref('');
const password = ref('');
const showMessage = ref(false);
const textMessage = ref('');

if (store.token) {
    router.push('/dashboard');
}

const validateFields = () => {
    if (email.value.trim().length === 0 || name.value.trim().length === 0 || password.value.trim().length === 0) {
        textMessage.value = 'Por favor ingrese todos los campos.';
        showMessage.value = true;
        return false;
    }
    showMessage.value = false;
    return true;
};

const submit = async () => {
    if (!validateFields()) return;

    try {
        const url = '/register';
        const response = await store.send(url, 'POST', {
            email: email.value,
            name: name.value,
            last_name: last_name.value,
            second_last_name: second_last_name.value,
            password: password.value,
            password_confirmation: password.value,
        }, {
            headers: {
                'Accept': 'application/json',
            },
        });
        if (response.token) {
            store.setItem('token', response.token);
            store.setItem('token_type', response.token_type);
            store.setItem('user', response.user);

            localStorage.setItem('token', response.token);
            localStorage.setItem('token_type', response.token_type);

            showMessage.value = false;
            await router.push('/dashboard');
        } else {
            showMessage.value = true;
            textMessage.value = 'Error en el registro, usuario ya registrado.';
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error inesperado',
            detail: 'Por favor, intente de nuevo. Si el problema continúa, contacte al soporte técnico.',
            life: 3000,
        });
    }
};
</script>

<template>
    <div class="relative flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <!-- Círculos desenfocados -->
        <div class="absolute inset-0 -z-10 overflow-hidden">
            <img src="/login.jpg" alt="Background Image" class="w-full h-full object-cover filter blur-xl animate-zoom" />
        </div>

        <div class="flex flex-col items-center justify-center">
            <!-- Div con efecto glass -->
            <div class="bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-8 sm:p-16">
                <div class="flex flex-col items-center justify-center text-center mb-8">
                    <img src="/logo.svg" width="40px" alt="crwdbsness" />
                    <span class="text-surface-900 dark:text-surface-0 font-medium text-2xl leading-normal">crwdbsness</span>

                    <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Crea tu cuenta</div>
                    <span class="text-muted-color font-medium">Es rápido, fácil y seguro.</span>
                </div>

                <div>
                    <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">
                        Correo electrónico
                    </label>
                    <InputText
                        id="email1"
                        type="text"
                        placeholder="Escribe tu dirección de correo electrónico"
                        class="w-full md:w-[30rem] mb-8"
                        v-model="email"
                    />

                    <label for="name" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">
                        Nombre
                    </label>
                    <InputText
                        id="name"
                        type="text"
                        placeholder="Introduce tu nombre"
                        class="w-full md:w-[30rem] mb-8"
                        v-model="name"
                    />

                    <label for="name" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">
                        Apellido paterno
                    </label>
                    <InputText
                        id="name"
                        type="text"
                        placeholder="Introduce tu primer apellido"
                        class="w-full md:w-[30rem] mb-8"
                        v-model="last_name"
                    />

                    <label for="name" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">
                        Apellido materno
                    </label>
                    <InputText
                        id="name"
                        type="text"
                        placeholder="Introduce segundo apellido"
                        class="w-full md:w-[30rem] mb-8"
                        v-model="second_last_name"
                    />


                    <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">
                        Contraseña
                    </label>
                    <Password
                        id="password1"
                        v-model="password"
                        placeholder="Crea una contraseña segura"
                        :toggleMask="true"
                        class="mb-4"
                        fluid
                        :feedback="false"
                    ></Password>

                    <Button label="Registrar" class="w-full" @click="submit" />
                </div>

                <p v-if="showMessage" class="mt-4 text-red-500 text-center">{{ textMessage }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}

@keyframes zoom {
    0% {
        transform: scale(1) rotate(0deg);      /* Sin zoom ni rotación */
    }
    50% {
        transform: scale(1.5) rotate(50deg);    /* Zoom leve y ligera rotación */
    }
    100% {
        transform: scale(1) rotate(0deg);      /* Vuelve al estado original */
    }
}

.animate-zoom {
    animation: zoom 5s ease-in-out infinite; /* Animación infinita y suave */
    transition: transform 0.5s ease-in-out;
}


</style>
