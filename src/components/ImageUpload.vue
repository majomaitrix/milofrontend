<template>
  <div class="image-upload">
    <div class="upload-area" 
         @click="triggerFileInput"
         @dragover.prevent
         @drop.prevent="handleDrop"
         :class="{ 'dragover': isDragOver }">
      
      <div v-if="!imagePreview" class="upload-placeholder">
        <div class="upload-icon">📷</div>
        <p>Arrastra una imagen aquí o haz clic para seleccionar</p>
        <p class="upload-hint">Formatos: JPG, PNG, GIF (máx. 2MB)</p>
      </div>
      
      <div v-else class="image-preview">
        <img :src="imagePreview" :alt="altText" />
        <button @click.stop="removeImage" class="remove-btn">×</button>
      </div>
    </div>
    
    <input 
      ref="fileInput"
      type="file" 
      accept="image/*"
      @change="handleFileSelect"
      style="display: none"
    />
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
  altText?: string
  maxSize?: number // en MB
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  altText: 'Imagen del producto',
  maxSize: 2
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const imagePreview = ref<string>('')
const isDragOver = ref(false)
const error = ref('')

// Convertir base64 a preview
const createPreview = (base64: string) => {
  if (base64.startsWith('data:')) {
    return base64
  }
  return `data:image/jpeg;base64,${base64}`
}

// Convertir archivo a base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remover el prefijo data:image/...;base64,
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Validar archivo
const validateFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  const maxSizeBytes = props.maxSize * 1024 * 1024
  
  if (!validTypes.includes(file.type)) {
    error.value = 'Formato de archivo no válido. Use JPG, PNG, GIF o WebP.'
    return false
  }
  
  if (file.size > maxSizeBytes) {
    error.value = `El archivo es demasiado grande. Máximo ${props.maxSize}MB.`
    return false
  }
  
  error.value = ''
  return true
}

// Manejar selección de archivo
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!validateFile(file)) return
  
  try {
    const base64 = await fileToBase64(file)
    imagePreview.value = createPreview(`data:${file.type};base64,${base64}`)
    emit('update:modelValue', base64)
  } catch (err) {
    error.value = 'Error al procesar la imagen.'
  }
}

// Manejar drag and drop
const handleDrop = async (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  
  if (!files || files.length === 0) return
  
  const file = files[0]
  if (!validateFile(file)) return
  
  try {
    const base64 = await fileToBase64(file)
    imagePreview.value = createPreview(`data:${file.type};base64,${base64}`)
    emit('update:modelValue', base64)
  } catch (err) {
    error.value = 'Error al procesar la imagen.'
  }
}

// Trigger file input
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Remover imagen
const removeImage = () => {
  imagePreview.value = ''
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Watch para cambios externos en modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    imagePreview.value = createPreview(newValue)
  } else {
    imagePreview.value = ''
  }
}, { immediate: true })
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #667eea;
  background-color: #f8f9ff;
}

.upload-area.dragover {
  border-color: #667eea;
  background-color: #f0f4ff;
  transform: scale(1.02);
}

.upload-placeholder {
  color: #666;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-hint {
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.5rem;
}

.image-preview {
  position: relative;
  max-width: 100%;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.remove-btn:hover {
  background-color: #c82333;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
}
</style>

