<script setup>
import { useStore } from '@/stores/userStore';
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore();
const fileInputRef = ref(null);
const selectedFile = ref(null);
const previewImage = ref(null);

// Datos del usuario (inicialmente simulados, se podrían cargar desde el backend)
const user = reactive({
  name: '',
  last_name: '',
  second_last_name: '',
  email: '',
  phone: '',
  rfc: '',
  address: {
    street: "",
    number: "",
    city: "",
    state: "",
    zipCode: "",
  },
  role: '',
  settings: {
    notifications: true,
    theme: "light"
  },
});

// Función para convertir imagen a Base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Funciones del componente
const updateProfile = async () => {
  const userData = { ...user };

  // Convertir la imagen a Base64 si se ha seleccionado
  if (selectedFile.value) {
    const base64Image = await convertToBase64(selectedFile.value);
    userData.avatar = base64Image;
  }

  try {
    const response = await store.send(`/user/${store.user.id}`, 'POST', userData);
    if (response.avatar) {
      previewImage.value = response.avatar;
    }
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
      selectedFile.value = file;
      previewImage.value = URL.createObjectURL(file);
    } else {
      console.error('Archivo no válido. Debe ser una imagen y no superar los 2MB.');
    }
  }
};

const removeAvatar = () => {
  selectedFile.value = null;
  previewImage.value = null;
  console.log('Avatar eliminado');
};

const uploadAvatar = () => {
  fileInputRef.value.click();
};

const cancelEdit = () => {
  router.push('/dashboard');
};

const loadData = async () => {
  try {
    const response = await store.send(`/user/${store.user.id}`, 'GET');
    user.name = response.user.name || '';
    user.last_name = response.user.last_name || '';
    user.second_last_name = response.user.second_last_name || '';
    user.email = response.user.email || '';
    user.phone = response.user.phone || '';
    user.rfc = response.user.rfc || '';

    // Asegurarse de que address no esté vacío
    user.address = response.user.address || {
      street: "",
      number: "",
      city: "",
      state: "",
      zipCode: ""
    };

    user.role = response.user.role || 'user';
    user.settings = response.user.settings || {};
    previewImage.value = response.user.avatar || '';

  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
}

onMounted(async () => {
  await loadData();
})

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
        <Avatar :image="previewImage || 'https://via.placeholder.com/150'" shape="circle" size="xlarge"
          class="w-full h-full" />
        <!-- Botón flotante de subida -->
        <div
          class="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
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
      <div class="grid grid-cols-2 gap-4">
        <!-- Apellido paterno -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido paterno</label>
          <InputText v-model="user.last_name" class="w-full mt-1" placeholder="Apellido paterno" required />
        </div>
  
        <!-- Apellido materno -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellido materno</label>
          <InputText v-model="user.second_last_name" class="w-full mt-1" placeholder="Apellido materno" required />
        </div>
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
        <InputText v-model="user.rfc" class="w-full mt-1" placeholder="RFC (opcional)" pattern="[A-Z]{4}\d{6}[A-Z0-9]{3}"
          title="Formato: AAAA######XXX" />
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
          <InputText v-model="user.address.zipCode" class="w-full mt-1" placeholder="Código Postal" pattern="\d{5}"
            title="Debe contener 5 dígitos numéricos" required />
        </div>
      </div>
  
      <!-- Botones -->
      <div class="mt-6 flex justify-between">
        <button type="button" class="bg-gray-500 text-white px-4 py-2 rounded-md" @click="cancelEdit">Cancelar</button>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Guardar
          cambios</button>
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
