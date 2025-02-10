<template>
  <div class="container mx-auto p-4 relative">
    <div v-if="isLoading" class="text-center text-gray-500 my-8">
      Carregando informações do guia...
    </div>
    <div v-else-if="error" class="text-center text-red-600 font-bold my-8">
      Erro ao carregar guia: {{ error }}
    </div>
    <div v-else-if="guide">
      <div class="bg-white shadow-md rounded-lg p-6 mb-6 relative">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Guia de Sideboard: {{ guide.deck_archetype }}</h1>
        <p class="text-gray-700 mb-2"><strong>Jogador:</strong> {{ guide.player }}</p>
        <p class="text-gray-700 mb-2"><strong>Formato:</strong> {{ guide.formato }}</p>
        <p class="text-gray-700 mb-4"><strong>Versão:</strong> {{ guide.versão }} (Lançado em: {{ guide.release_date }})
        </p>

        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-3">Maindeck</h2>
          <ul role="list" class="list-disc pl-5 text-gray-700">
            <li v-for="card in guide.maindeck" :key="card.card">
              <span class="card-name hover:underline cursor-pointer" @mouseover="handleCardMouseOver(card.card, $event)"
                @mouseout="handleCardMouseOut">{{ card.card }}</span> - {{ card.quantidade }}
            </li>
          </ul>
        </div>

        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-3">Sideboard</h2>
          <ul role="list" class="list-disc pl-5 text-gray-700">
            <li v-for="card in guide.sideboard" :key="card.card">
              <span class="card-name hover:underline cursor-pointer" @mouseover="handleCardMouseOver(card.card, $event)"
                @mouseout="handleCardMouseOut">{{ card.card }}</span> - {{ card.quantidade }}
            </li>
          </ul>
        </div>

        <div v-if="guide.estrategias && guide.estrategias.length > 0">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Estratégias de Sideboard</h2>
          <div v-for="(estrategia, index) in guide.estrategias" :key="index"
            class="mb-6 p-4 border border-gray-200 rounded-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Contra: {{ estrategia.deck_oponente }}</h3>
            <p class="text-gray-700 mb-3"><strong>Estratégia Geral:</strong> {{ estrategia.estrategia_geral }}</p>

            <div class="mb-3">
              <h4 class="text-md font-semibold text-gray-800 mb-1">Side In</h4>
              <ul role="list" class="list-disc pl-5 text-gray-700">
                <li v-for="card in estrategia.side_in" :key="card.card">
                  <span class="card-name hover:underline cursor-pointer"
                    @mouseover="handleCardMouseOver(card.card, $event)" @mouseout="handleCardMouseOut">{{ card.card
                    }}</span> x{{ card.quantidade }} - <span class="italic">{{ card.motivo }}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="text-md font-semibold text-gray-800 mb-1">Side Out</h4>
              <ul role="list" class="list-disc pl-5 text-gray-700">
                <li v-for="card in estrategia.side_out" :key="card.card">
                  <span class="card-name hover:underline cursor-pointer"
                    @mouseover="handleCardMouseOver(card.card, $event)" @mouseout="handleCardMouseOut">{{ card.card
                    }}</span> x{{ card.quantidade }} - <span class="italic">{{ card.motivo }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="guide.nota" class="mt-8 pt-4 border-t border-gray-300 text-gray-600 italic">
          <p><strong>Nota:</strong> {{ guide.nota }}</p>
        </div>

        <CardImagePopup :cardName="popupCardName" :visible="isPopupVisible" :position="popupPosition"
          :cardImageCache="cardImageCache" />
      </div>
      <div v-if="!isLoading && !error && guide">
        <h2 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Card Image Cache (Debug)</h2>
        <pre class="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">{{ JSON.stringify(cardImageCache, null, 2) }}
        </pre>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 my-8">
      Guia não encontrado.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Decklist } from '@/types/decklists'
import CardImagePopup from '@/components/CardImagePopup.vue';

const route = useRoute();
const guideId = route.params.id as string;
const guide = ref<Decklist | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const cardImageCache = ref<{ [cardName: string]: string }>({}); // Objeto para cache das URLs das imagens

// Estado para o componente CardImagePopup
const popupCardName = ref('');
const isPopupVisible = ref(false);
const popupPosition = ref({ top: '0px', left: '0px' });

const handleCardMouseOver = (cardName: string, event: MouseEvent) => {
  popupCardName.value = cardName;
  isPopupVisible.value = true;

  const targetElement = event.target as HTMLElement; // Elemento que disparou o evento (o <span> do nome da carta)
  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    popupPosition.value = {
      top: `${rect.bottom + window.scrollY + 5}px`, // Posiciona abaixo do elemento, considerando scroll da página
      left: `${rect.left + window.scrollX + 150}px`,   // Posiciona à direita do elemento, considerando scroll da página
    };
  } else {
    // Fallback caso o elemento não seja encontrado (improvável, mas para segurança)
    popupPosition.value = {
      top: `${event.clientY + 10}px`,
      left: `${event.clientX + 10}px`,
    };
  }
};

const handleCardMouseOut = () => {
  isPopupVisible.value = false;
};

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await $fetch<Decklist>(`/api/guide/${guideId}`);
    guide.value = response;

    if (guide.value) {
      // Iniciar a busca das imagens em background APÓS o guia ser carregado
      await fetchCardImagesInBackground(guide.value); // Aguarda a busca de imagens para o cache estar pronto inicialmente
    }

  } catch (e: any) {
    error.value = e.message || 'Erro desconhecido ao carregar o guia.';
    guide.value = null;
  } finally {
    isLoading.value = false;
  }
});


const fetchCardImagesInBackground = async (decklist: Decklist) => {
  const allCardNames = new Set<string>();

  // Coletar nomes de cartas do maindeck, sideboard e estrategias
  decklist.maindeck.forEach(cardEntry => allCardNames.add(cardEntry.card));
  decklist.sideboard.forEach(cardEntry => allCardNames.add(cardEntry.card));
  decklist.estrategias?.forEach(estrategia => {
    estrategia.side_in.forEach(cardEntry => allCardNames.add(cardEntry.card));
    estrategia.side_out.forEach(cardEntry => allCardNames.add(cardEntry.card));
  });

  // Buscar imagens e preencher o cache
  const cache: { [cardName: string]: string } = {}; // Cache local
  for (const cardName of allCardNames) {
    try {
      const cardResponse: any = await $fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
      cache[cardName] = cardResponse.image_uris?.small || '';
    } catch (fetchError) {
      console.error(`Erro ao buscar imagem para ${cardName}:`, fetchError);
      cache[cardName] = '';
    }
  }
  cardImageCache.value = cache; // Atualiza o ref cardImageCache
};


</script>

<style scoped>
.card-name {
  @apply hover:underline cursor-pointer;
}
</style>
