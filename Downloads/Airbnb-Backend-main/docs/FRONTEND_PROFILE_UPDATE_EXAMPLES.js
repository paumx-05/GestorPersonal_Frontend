/**
 * 📘 EJEMPLOS DE CÓDIGO - Actualización de Perfil
 * 
 * Estos ejemplos están listos para copiar y usar en tu proyecto frontend.
 * Asegúrate de configurar la URL base y el método de obtener el token.
 */

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

const API_BASE_URL = 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'authToken';

/**
 * Helper para obtener el token de autenticación
 */
function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || 
         sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Helper para hacer requests autenticados
 */
async function authenticatedFetch(url, options = {}) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  // Si hay FormData, NO incluir Content-Type (el navegador lo hace)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });
}

// =============================================================================
// FUNCIONES PRINCIPALES
// =============================================================================

/**
 * 1️⃣ Actualizar nombre y/o descripción (JSON)
 * 
 * @param {Object} data - Datos a actualizar
 * @param {string} [data.name] - Nuevo nombre (1-100 caracteres)
 * @param {string|null} [data.description] - Nueva descripción (0-500 caracteres, null para eliminar)
 * @returns {Promise<Object>} Datos del usuario actualizado
 */
async function updateProfile(data) {
  try {
    const response = await authenticatedFetch('/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      // Manejar errores de validación
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(result.message || 'Error al actualizar perfil');
    }

    return result.data;
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  }
}

/**
 * 2️⃣ Actualizar avatar (FormData)
 * 
 * @param {File} file - Archivo de imagen
 * @returns {Promise<Object>} Datos del usuario actualizado
 */
async function updateAvatar(file) {
  // Validaciones del lado del cliente (mejor UX)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('El archivo excede el tamaño máximo de 5MB');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Formato de imagen no válido. Use JPG, PNG o WebP');
  }

  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await authenticatedFetch('/profile', {
      method: 'PATCH',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(result.message || 'Error al actualizar avatar');
    }

    return result.data;
  } catch (error) {
    console.error('Error actualizando avatar:', error);
    throw error;
  }
}

/**
 * 3️⃣ Actualizar perfil completo (nombre, descripción y avatar)
 * 
 * @param {Object} data - Datos a actualizar
 * @param {string} [data.name] - Nuevo nombre
 * @param {string|null} [data.description] - Nueva descripción
 * @param {File} [data.avatar] - Nuevo archivo de avatar
 * @returns {Promise<Object>} Datos del usuario actualizado
 */
async function updateFullProfile(data) {
  try {
    const formData = new FormData();
    
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) {
      formData.append('description', data.description || '');
    }
    if (data.avatar) {
      // Validar archivo antes de agregar
      if (data.avatar.size > 5 * 1024 * 1024) {
        throw new Error('El archivo excede el tamaño máximo de 5MB');
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(data.avatar.type)) {
        throw new Error('Formato de imagen no válido. Use JPG, PNG o WebP');
      }
      formData.append('avatar', data.avatar);
    }

    const response = await authenticatedFetch('/profile', {
      method: 'PATCH',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(result.message || 'Error al actualizar perfil');
    }

    return result.data;
  } catch (error) {
    console.error('Error actualizando perfil completo:', error);
    throw error;
  }
}

/**
 * 4️⃣ Obtener perfil actual (helper)
 * 
 * @returns {Promise<Object>} Datos del usuario actual
 */
async function getProfile() {
  try {
    const response = await authenticatedFetch('/profile', {
      method: 'GET'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Error al obtener perfil');
    }

    return result.data.user;
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    throw error;
  }
}

// =============================================================================
// EJEMPLOS DE USO
// =============================================================================

/**
 * Ejemplo 1: Actualizar solo el nombre
 */
async function ejemplo1_ActualizarNombre() {
  try {
    const result = await updateProfile({
      name: 'Juan Pérez'
    });
    
    console.log('Nombre actualizado:', result.name);
    // Actualizar UI
    document.querySelector('#user-name').textContent = result.name;
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

/**
 * Ejemplo 2: Actualizar solo la descripción
 */
async function ejemplo2_ActualizarDescripcion() {
  try {
    const result = await updateProfile({
      description: 'Amante de los viajes y la aventura...'
    });
    
    console.log('Descripción actualizada:', result.description);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

/**
 * Ejemplo 3: Eliminar descripción (ponerla vacía)
 */
async function ejemplo3_EliminarDescripcion() {
  try {
    const result = await updateProfile({
      description: '' // o null
    });
    
    console.log('Descripción eliminada');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

/**
 * Ejemplo 4: Actualizar avatar desde input file
 */
function ejemplo4_ActualizarAvatar() {
  const fileInput = document.querySelector('#avatar-input');
  
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Mostrar loading
      const loadingIndicator = document.querySelector('#loading');
      loadingIndicator.style.display = 'block';

      const result = await updateAvatar(file);
      
      console.log('Avatar actualizado:', result.avatar);
      
      // Actualizar imagen en UI
      const avatarImg = document.querySelector('#user-avatar');
      avatarImg.src = result.avatar;
      
      // Ocultar loading
      loadingIndicator.style.display = 'none';
      
      alert('Avatar actualizado exitosamente!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
}

/**
 * Ejemplo 5: Actualizar todo el perfil (formulario completo)
 */
async function ejemplo5_ActualizarPerfilCompleto(formData) {
  try {
    const result = await updateFullProfile({
      name: formData.name,
      description: formData.description,
      avatar: formData.avatarFile
    });
    
    console.log('Perfil actualizado completamente:', result);
    
    // Actualizar toda la UI
    updateUI(result);
    
    alert('Perfil actualizado exitosamente!');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

/**
 * Ejemplo 6: Formulario completo con manejo de errores por campo
 */
function ejemplo6_FormularioCompleto() {
  const form = document.querySelector('#profile-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.querySelector('#name').value.trim(),
      description: document.querySelector('#description').value.trim(),
      avatar: document.querySelector('#avatar').files[0] || null
    };

    try {
      // Limpiar errores previos
      document.querySelectorAll('.error-message').forEach(el => el.remove());
      
      const result = await updateFullProfile(formData);
      
      // Éxito - actualizar UI
      updateProfileUI(result);
      alert('Perfil actualizado exitosamente!');
      
    } catch (error) {
      // Si hay errores estructurados, mostrarlos por campo
      if (error.message.includes(':')) {
        const errors = error.message.split('\n');
        errors.forEach(errMsg => {
          const [field, message] = errMsg.split(': ');
          const fieldElement = document.querySelector(`#${field}`);
          
          if (fieldElement) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            fieldElement.parentElement.appendChild(errorDiv);
          }
        });
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  });
}

// =============================================================================
// HELPERS DE UI
// =============================================================================

/**
 * Actualizar toda la UI con los datos del usuario
 */
function updateProfileUI(userData) {
  if (userData.name) {
    const nameElement = document.querySelector('#user-name');
    if (nameElement) nameElement.textContent = userData.name;
  }
  
  if (userData.description !== undefined) {
    const descElement = document.querySelector('#user-description');
    if (descElement) descElement.textContent = userData.description || '';
  }
  
  if (userData.avatar) {
    const avatarElement = document.querySelector('#user-avatar');
    if (avatarElement) avatarElement.src = userData.avatar;
  }
}

/**
 * Crear preview de imagen antes de subir
 */
function createImagePreview(fileInput) {
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = document.querySelector('#avatar-preview');
      if (preview) {
        preview.src = reader.result;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  });
}

// =============================================================================
// EXPORTAR PARA USO EN MÓDULOS
// =============================================================================

// Si estás usando módulos ES6:
// export { updateProfile, updateAvatar, updateFullProfile, getProfile };

// Si estás usando CommonJS:
// module.exports = { updateProfile, updateAvatar, updateFullProfile, getProfile };

