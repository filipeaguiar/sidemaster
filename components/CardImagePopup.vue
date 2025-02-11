<template>
  <div v-if="visible" class="card-image-popup" :style="position" @mouseover="clearTimeout(popupTimeout)"
    @mouseout="hidePopupDelayed" ref="popupRef">
    <img v-if="imageUrl" :src="imageUrl" alt="Imagem da Carta" class="card-image" />
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
  cardImageCache: {                  // Adicionada prop para receber o cache de imagens
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
/* Estilos scoped para o popup - VERSÃO ATUALIZADA com position: fixed e CSS mínimo */
.card-image-popup {
  position: fixed;
  /* <-------  USANDO position: fixed  --------*/
  background-color: white;
  border: 1px solid #ccc;
  padding: 8px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 10;
  /* Garante que o popup fique acima de outros elementos */
}

.card-image {
  max-width: 250px;
  /* Ajuste o tamanho máximo conforme necessário */
  max-height: auto;
  display: block;
  /* Garante que a imagem se comporte como bloco */
}
</style>
