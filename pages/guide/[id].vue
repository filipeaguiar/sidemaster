<template>
  <div class="container mx-auto p-4 relative">
    <UContainer v-if="isLoading" class="text-center text-gray-500 my-8">
      <p class="mt-2">Carregando informações do guia...</p>
    </UContainer>
    <UContainer v-else-if="error" class="text-center text-red-600 font-bold my-8">
      <UAlert type="error" title="Erro ao carregar guia" :body="error" />
    </UContainer>
    <UContainer v-else-if="guide">
      <UCard class="mb-8">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Guia de Sideboard</h1>
              <h2 class="text-xl text-gray-700 mt-1">para <span class="font-semibold text-blue-600">{{
                guide.deck_archetype }}</span></h2>
            </div>
            <UBadge color="blue" variant="subtle">Versão {{ guide.versão }}</UBadge>
          </div>
          <div class="mt-4 flex space-x-4 text-gray-600">
            <div><span class="font-medium">Jogador:</span> {{ guide.player }}</div>
            <div><span class="font-medium">Formato:</span> {{ guide.formato }}</div>
            <div><span class="font-medium">Lançamento:</span> {{ guide.release_date }}</div>
          </div>
        </template>

        <div class="flex space-x-8 mb-8">
          <section class="w-1/2">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Maindeck</h3>
            <ul role="list" class="list-disc pl-5 text-gray-700">
              <li v-for="card in guide.maindeck" :key="card.card" class="mb-1">
                <span class="card-name hover:text-blue-600 hover:underline cursor-pointer"
                  @mouseover="handleCardMouseOver(card.card, $event)" @mouseout="handleCardMouseOut">{{ card.card
                  }}</span>
                <span class="text-gray-500">x{{ card.quantidade }}</span>
              </li>
            </ul>
          </section>

          <section class="w-1/2">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Sideboard</h3>
            <ul role="list" class="list-disc pl-5 text-gray-700">
              <li v-for="card in guide.sideboard" :key="card.card" class="mb-1">
                <span class="card-name hover:text-blue-600 hover:underline cursor-pointer"
                  @mouseover="handleCardMouseOver(card.card, $event)" @mouseout="handleCardMouseOut">{{ card.card
                  }}</span>
                <span class="text-gray-500">x{{ card.quantidade }}</span>
              </li>
            </ul>
          </section>
        </div>

        <section v-if="guide.descricao" class="mb-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-3">Descrição do Deck</h3>
          <UCard class="mb-8 bg-gray-50 rounded-md p-4 text-gray-700 leading-loose">
            <template #body>
              <div v-html="formatTextWithCardLinks(guide.descricao)"></div>
            </template>
          </UCard>
        </section>

        <section v-if="guide.estrategias && guide.estrategias.length > 0" class="mb-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Estratégias de Sideboard</h3>
          <div v-for="(estrategia, index) in guide.estrategias" :key="index" class="mb-4">
            <UCard>
              <template #header>
                <h4 class="text-lg font-semibold text-gray-900">Contra: <span class="font-medium text-indigo-600">{{
                  estrategia.deck_oponente }}</span></h4>
              </template>
              <div class="p-4">
                <p class="text-gray-700 mb-3"><strong class="font-medium">Estratégia Geral:</strong>
                <div v-html="formatTextWithCardLinks(estrategia.estrategia_geral)" inline></div>
                </p>

                <div class="mb-2">
                  <h5 class="text-md font-semibold text-gray-800 mb-1">Side In</h5>
                  <ul role="list" class="list-disc pl-5 text-gray-700 text-sm">
                    <li v-for="(card, cardIndex) in estrategia.side_in" :key="card.card" class="mb-0.5">
                      <span class="card-name hover:text-blue-600 hover:underline cursor-pointer"
                        @mouseover="handleCardMouseOver(card.card, $event)" @mouseout="handleCardMouseOut">{{ card.card
                        }}</span> <span class="text-gray-500">x{{ card.quantidade }}</span> - <span
                        class="italic text-gray-600">
                        <div v-html="formatTextWithCardLinks(card.motivo)" inline></div>
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 class="text-md font-semibold text-gray-800 mb-1">Side Out</h5>
                  <ul role="list" class="list-disc pl-5 text-gray-700 text-sm">
                    <li v-for="(card, cardIndex) in estrategia.side_out" :key="card.card" class="mb-0.5">
                      <span class="card-name hover:text-blue-600 hover:underline cursor-pointer"
                        @mouseover="handleCardMouseOver(card.card, $event)" @mouseout="handleCardMouseOut">{{ card.card
                        }}</span> <span class="text-gray-500">x{{ card.quantidade }}</span> - <span
                        class="italic text-gray-600">
                        <div v-html="formatTextWithCardLinks(card.motivo)" inline></div>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </UCard>
          </div>
        </section>

      </UCard>
      <UCard v-if="!isLoading && !error && guide" class="mt-12">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-800">Card Image Cache (Debug)</h2>
        </template>
        <pre class="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm border border-gray-200"> {{
          JSON.stringify(cardImageCache, null, 2) }}</pre>
      </UCard>
      <CardImagePopup :cardName="popupCardName" :visible="isPopupVisible" :position="popupPosition"
        :cardImageCache="cardImageCache" />
    </UContainer>
    <UContainer v-else class="text-center text-gray-500 my-8">
      Guia não encontrado.
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Decklist } from '@/types/guide/decklist';
import CardImagePopup from '~/components/CardImagePopup.vue';

useHead({
  title: 'Guia de Sideboard',
  meta: [
    { name: 'description', content: 'Guia de sideboard para Magic: The Gathering' },
  ],
});

const route = useRoute();
const guideId = route.params.id as string;
const guide = ref<Decklist | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const cardImageCache = ref<{ [cardName: string]: string }>({});

const popupCardName = ref('');
const isPopupVisible = ref(false);
const popupPosition = ref({ top: '0px', left: '0px' });
const currentCardElement = ref<HTMLElement | null>(null);
const mouseMoveHandler = ref<((event: MouseEvent) => void) | null>(null);

const updatePopupPosition = (event: MouseEvent) => {
  if (currentCardElement.value && isPopupVisible.value) {
    popupPosition.value = {
      top: `${event.clientY + 15}px`,
      left: `${event.clientX + 15}px`,
    };
  }
};

const handleCardMouseOver = (cardName: string, event: MouseEvent) => {
  popupCardName.value = cardName;
  isPopupVisible.value = true;
  currentCardElement.value = event.target as HTMLElement;

  popupPosition.value = {
    top: `${event.clientY - 10}px`,
    left: `${event.clientX + 20}px`,
  };

  if (!mouseMoveHandler.value) {
    mouseMoveHandler.value = (event: MouseEvent) => {
      updatePopupPosition(event);
    };
    document.addEventListener('mousemove', mouseMoveHandler.value);
  }
};

const handleCardMouseOut = () => {
  isPopupVisible.value = false;
  currentCardElement.value = null;
  if (mouseMoveHandler.value) {
    document.removeEventListener('mousemove', mouseMoveHandler.value);
    mouseMoveHandler.value = null;
  }
};


const formatTextWithCardLinks = (text: string) => {
  if (!text) return '';

  const cardNameRegex = /\[\[([^\]]+?)\]\]/g;
  return text.replace(cardNameRegex, (match, cardName) => {
    return `<span class="card-name font-bold hover:text-blue-600 hover:underline cursor-pointer" @mouseover="handleCardMouseOver('${cardName}', $event)" @mouseout="handleCardMouseOut">${cardName}</span>`;
  });
};


onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await $fetch<Decklist>(`/api/guide/${guideId}`,
      { cache: 'no-cache' });
    guide.value = response;

    if (guide.value) {
      await fetchCardImagesInBackground(guide.value);
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

  decklist.maindeck.forEach(cardEntry => allCardNames.add(cardEntry.card));
  decklist.sideboard.forEach(cardEntry => allCardNames.add(cardEntry.card));
  decklist.estrategias?.forEach(estrategia => {
    estrategia.side_in.forEach(cardEntry => allCardNames.add(cardEntry.card));
    estrategia.side_out.forEach(cardEntry => allCardNames.add(cardEntry.card));
  });

  const cache: { [cardName: string]: string } = {};
  for (const cardName of allCardNames) {
    try {
      const cardResponse: any = await $fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
      cache[cardName] = cardResponse.image_uris?.small || '';
    } catch (fetchError) {
      console.error(`Erro ao buscar imagem para ${cardName}:`, fetchError);
      cache[cardName] = '';
    }
  }
  cardImageCache.value = cache;
};

</script>

<style scoped>
/* Estilos scoped removidos */
</style>
