<script setup>
import { useStore } from '@/stores/userStore';
import Avatar from 'primevue/avatar';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore();
const fileInputRef = ref(null);

// Datos del usuario (inicialmente simulados, se podrían cargar desde el backend)
const user = reactive({
  name: '',
  email: '',
  phone: '',
  rfc: '',
  avatar: '',
  address: {
    street: "",
    number: "",
    city: "",
    state: "",
    zipCode: "",
  },
  role: 'user',
  is_active: true,
  settings: {},
});

// Opciones para roles
const roles = ref([
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
]);

// Funciones del componente
const updateProfile = () => {
  console.log('Actualizando perfil:', user);
  // Aquí se enviaría el perfil actualizado al backend
};

const uploadAvatar = () => {
  fileInputRef.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        user.avatar = e.target.result; // Imagen en base64
        console.log('Avatar actualizado:', file.name);
        // Opcional: enviar al backend
        uploadAvatarToBackend(file);
      };
      reader.readAsDataURL(file);
    } else {
      console.error('Archivo no válido. Asegúrate de que sea una imagen y que no exceda 2MB.');
    }
  }
};

const uploadAvatarToBackend = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch('/api/upload-avatar', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log('Avatar subido:', data);
  } catch (error) {
    console.error('Error al subir el avatar:', error);
  }
};

const removeAvatar = () => {
  user.avatar = '';
  console.log('Avatar eliminado');
};

const cancelEdit = () => {
  console.log('Edición cancelada');
  router.push('/dashboard'); // Cambia '/dashboard' por la ruta que corresponda
};

const handleDrop = (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    handleFileChange({ target: { files: [file] } });
  }
};

const loadData = async () => {
  try {
    const url = 'http://127.0.0.1:8000/api/user/' + store.user.id;
    const response = await store.send(url, 'GET');
    user.name = response.name || '';
    user.email = response.email || '';
    user.phone = response.phone || '';
    user.rfc = response.rfc || '';
    user.avatar = response.avatar || '';
    user.address = response.address || {
      street: "",
      number: "",
      city: "",
      state: "",
      zipCode: "",
    };
    user.role = response.role || 'user';
    user.is_active = true;
    user.settings = '{}';
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
};
loadData()

</script>

<template>
    <div class="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow-md">
        <!-- Encabezado -->
        <div class="mb-6 text-center">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Editar Perfil</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">Actualiza tu información personal.</p>
        </div>
    
        <!-- Avatar -->
        <div class="relative w-40 h-40 mx-auto">
            <div class="relative w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 group"
                @drop="handleDrop" @dragover.prevent>
                <!-- Avatar -->
                <Avatar :image="user.avatar || 'https://via.placeholder.com/150'" shape="circle" size="xlarge"
                    class="w-full h-full" />
    
                <!-- Botón flotante de subida -->
                <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                    @click="uploadAvatar">
                    <i class="pi pi-upload text-white text-xl mb-2"></i>
                    <span class="text-white text-sm">Subir Avatar</span>
                </div>
                <input type="file" accept="image/*" ref="fileInputRef" class="hidden" @change="handleFileChange" />
            </div>
    
            <!-- Botón de eliminar -->
            <button
                class="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 focus:ring-2 focus:ring-red-300 transition-all"
                @click="removeAvatar">
                <i class="pi pi-trash"></i>
            </button>
        </div>
    
        <!-- Formulario -->
        <form @submit.prevent="updateProfile">
            <!-- Nombre -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                <InputText v-model="user.name" class="w-full mt-1" placeholder="Nombre completo" required />
            </div>
    
            <!-- Correo Electrónico -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                <InputText v-model="user.email" class="w-full mt-1" placeholder="Correo electrónico" disabled />
            </div>
    
            <!-- Teléfono -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                <InputText v-model="user.phone" class="w-full mt-1" placeholder="Teléfono (opcional)" pattern="\d{10}"
                    title="Debe contener 10 dígitos numéricos" />
            </div>
    
            <!-- RFC -->
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">RFC</label>
                <InputText v-model="user.rfc" class="w-full mt-1" placeholder="RFC (opcional)"
                    pattern="[A-Z]{4}\d{6}[A-Z0-9]{3}" title="Formato: AAAA######XXX" />
            </div>
    
            <!-- Dirección -->
            <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Calle</label>
                    <InputText v-model="user.address.street" class="w-full mt-1" placeholder="Calle" required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label>
                    <InputText v-model="user.address.number" class="w-full mt-1" placeholder="Número exterior" required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ciudad</label>
                    <InputText v-model="user.address.city" class="w-full mt-1" placeholder="Ciudad" required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                    <InputText v-model="user.address.state" class="w-full mt-1" placeholder="Estado" required />
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Código Postal</label>
                    <InputText v-model="user.address.zipCode" class="w-full mt-1" placeholder="Código Postal"
                        pattern="\d{5}" title="Debe contener 5 dígitos numéricos" required />
                </div>
            </div>
    
            <!-- Botones -->
            <div class="flex justify-end mt-6">
                <Button label="Cancelar" class="p-button-text mr-3" @click="cancelEdit" />
                <Button label="Guardar Cambios" icon="pi pi-check" class="p-button-primary" type="submit" />
            </div>
        </form>
    
    </div>
</template>

<style>
.p-avatar-xl {
    height: 100% !important;
    width: 100% !important;
}
</style>