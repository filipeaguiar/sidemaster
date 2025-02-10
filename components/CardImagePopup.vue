<template>
  <div v-if="visible" class="absolute bg-white border border-gray-300 shadow-md rounded-md p-2 z-10" :style="position"
    @mouseover="clearTimeout(popupTimeout)" @mouseout="hidePopupDelayed" ref="popupRef">
    <img v-if="imageUrl" :src="imageUrl" alt="Imagem da Carta" class="max-w-xs max-h-full block" />
    <div v-else class="text-gray-500 italic text-sm">Carregando imagem...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  cardName: {
    type: String,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Object,
    default: () => ({ top: '0px', left: '0px' }),
    required: false, // Tornando position opcional
  },
  cardImageCache: {             // Adicionada prop para receber o cache de imagens
    type: Object,
    required: true,
  }
});

const emit = defineEmits(['visibility-changed']);

const visible = ref(props.visible);
const imageUrl = ref('');
const position = ref(props.position || { top: '0px', left: '0px' }); // Define um valor padrão para position
const popupTimeout = ref<number | null>(null);
const popupRef = ref<HTMLElement | null>(null);

watch(
  () => props.visible,
  (newValue) => {
    visible.value = newValue;
    if (newValue && props.cardName) {
      // Busca a URL da imagem do cache quando o popup se torna visível
      imageUrl.value = props.cardImageCache[props.cardName] || '';
    } else {
      imageUrl.value = ''; // Limpa a URL quando o popup é escondido
    }
  }
);
watch(
  () => props.position,
  (newValue) => {
    position.value = newValue || { top: '0px', left: '0px' }; // Garante que position tenha um valor
  }
);


const hidePopup = () => {
  visible.value = false;
  imageUrl.value = '';
  emit('visibility-changed', false);
};

const hidePopupDelayed = () => {
  popupTimeout.value = setTimeout(() => {
    hidePopup();
  }, 150);
};

defineExpose({
  hidePopup,
});
</script>

<style scoped>
/* Estilos scoped para o popup (mantenha os mesmos estilos se já tiver) */
.absolute {
  position: absolute;
}

.bg-white {
  background-color: white;
}

.border {
  border-width: 1px;
  border-style: solid;
}

.border-gray-300 {
  border-color: rgb(209 213 219);
}

.shadow-md {
  --tw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.rounded-md {
  border-radius: 0.375rem;
}

.p-2 {
  padding: 0.5rem;
}

.z-10 {
  z-index: 10;
}

.max-w-xs {
  max-width: 20rem;
}

.max-h-full {
  max-height: 100%;
}

.block {
  display: block;
}

.text-gray-500 {
  color: rgb(107 114 128);
}

.italic {
  font-style: italic;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
