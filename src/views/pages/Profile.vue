<script setup>
import { useStore } from '@/stores/userStore';
import Avatar from 'primevue/avatar';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore();
const fileInputRef = ref(null);
const selectedFile = ref(null);

// Datos del usuario (inicialmente simulados, se podrían cargar desde el backend)
const user = reactive({
  name: 'RAFA',
  email: 'rafael@ag.tools',
  phone: '3541267421',
  rfc: 'AAZR961202S40',
  avatar: '',
  address: {
    street: "MINA",
    number: "33",
    city: "XAL",
    state: "NAY",
    zipCode: "60300",
  },
  role: 'user',
  is_active: true,
  settings: {},
});

// Funciones del componente
const updateProfile = async () => {
  const formData = new FormData();

  // Agregar los datos del usuario
  for (const key in user) {
    if (key === "address") {
      formData.append(key, JSON.stringify(user[key]));
    } else {
      formData.append(key, user[key]);
    }
  }
  // Agregar la imagen solo si se ha seleccionado una nueva
  if (selectedFile.value) {
    formData.append("avatar", selectedFile.value);
  }
  
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/user/${store.user.id}`, {
      method: "POST", // En Laravel se usa POST para updates con archivos
      body: formData,
      headers: {
        Authorization: `Bearer ${store.token}`, // Si usas autenticación
      },
    });

    const data = await response.json();
    console.log("Perfil actualizado:", data);

    // Actualizar la imagen del usuario si fue cambiada
    user.avatar = data.avatar || user.avatar;
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
      selectedFile.value = file; // Guardamos el archivo
      // No es necesario hacer la conversión a base64, solo actualizar el avatar al archivo
      user.avatar = URL.createObjectURL(file); // Previsualización de la imagen seleccionada
    } else {
      console.error('Archivo no válido. Debe ser una imagen y no superar los 2MB.');
    }
  }
};

const uploadAvatar = () => {
  fileInputRef.value.click();
};

const removeAvatar = () => {
  user.avatar = '';
  console.log('Avatar eliminado');
};

const cancelEdit = () => {
  router.push('/dashboard'); // Cambia '/dashboard' por la ruta que corresponda
};

const handleDrop = (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    handleFileChange({ target: { files: [file] } });
  }
};

// Función para cargar datos (si es necesario)
const loadData = async () => {
  try {
    const url = `http://127.0.0.1:8000/api/user/${store.user.id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${store.token}`,
      },
    });
    const data = await response.json();
    // Asignamos los datos recibidos a la variable `user`
    user.name = data.name || '';
    user.email = data.email || '';
    user.phone = data.phone || '';
    user.rfc = data.rfc || '';
    user.avatar = data.avatar || ''; // Si el avatar es una URL, se usa directamente
    user.address = data.address || {
      street: "",
      number: "",
      city: "",
      state: "",
      zipCode: "",
    };
    user.role = data.role || 'user';
    user.is_active = data.is_active || true;
    user.settings = data.settings || {};
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
};

// Llamar a la función para cargar los datos del usuario al montar el componente
loadData();
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
      <div
        class="relative w-full h-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 group"
        @drop="handleDrop"
        @dragover.prevent
      >
        <Avatar :image="user.avatar || 'https://via.placeholder.com/150'" shape="circle" size="xlarge" class="w-full h-full" />
        <!-- Botón flotante de subida -->
        <div
          class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          @click="uploadAvatar"
        >
          <i class="pi pi-upload text-white text-xl mb-2"></i>
          <span class="text-white text-sm">Subir Avatar</span>
        </div>
        <input type="file" accept="image/*" ref="fileInputRef" class="hidden" @change="handleFileChange" />
      </div>

      <!-- Botón de eliminar -->
      <button
        class="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 focus:ring-2 focus:ring-red-300 transition-all"
        @click="removeAvatar"
      >
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
        <InputText v-model="user.phone" class="w-full mt-1" placeholder="Teléfono (opcional)" pattern="\d{10}" title="Debe contener 10 dígitos numéricos" />
      </div>

      <!-- RFC -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">RFC</label>
        <InputText v-model="user.rfc" class="w-full mt-1" placeholder="RFC (opcional)" pattern="[A-Z]{4}\d{6}[A-Z0-9]{3}" title="Formato: AAAA######XXX" />
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
          <InputText v-model="user.address.zipCode" class="w-full mt-1" placeholder="Código Postal" pattern="\d{5}" title="Debe contener 5 dígitos numéricos" required />
        </div>
      </div>

      <!-- Actividad -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado de Cuenta</label>
        <InputSwitch v-model="user.is_active" class="w-full" />
      </div>

      <!-- Botones -->
      <div class="mt-6 flex justify-between">
        <button type="button" class="bg-gray-500 text-white px-4 py-2 rounded-md" @click="cancelEdit">Cancelar</button>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Guardar cambios</button>
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