<template>
  <div class="container mx-auto p-4 relative">
    <UContainer v-if="isLoading" class="text-center text-gray-500 my-8">
      <div class="flex flex-col items-center justify-center h-64">
        <UIcon name="i-heroicons-arrow-path-20-solid" class="w-12 h-12 animate-spin text-primary-500" />
        <p class="mt-4 text-lg font-medium">Carregando guia...</p>
      </div>
    </UContainer>

    <UContainer v-else-if="error" class="text-center my-8">
      <UAlert icon="i-heroicons-exclamation-triangle-20-solid" title="Erro ao carregar o guia" :description="error"
        color="red" variant="outline" class="max-w-2xl mx-auto" />
    </UContainer>

    <div v-else-if="guide" class="space-y-8">
      <!-- Cabeçalho -->
      <UCard>
        <template #header>
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ guide.user_id || 'Guia sem título' }}
              </h1>
              <div class="mt-2 flex items-center gap-2">
                <UBadge color="primary" variant="subtle">
                  {{ guide.deck_archetype }}
                </UBadge>
                <UBadge color="gray" variant="outline">
                  Versão {{ guide.version }}
                </UBadge>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span class="text-sm text-gray-600 dark:text-gray-300">
                <UIcon name="i-heroicons-calendar-days-20-solid" class="w-4 h-4 mr-1" />
                {{ formatDate(guide.release_date) }}
              </span>
              <span class="text-sm text-gray-600 dark:text-gray-300">
                <UIcon name="i-heroicons-square-3-stack-3d-20-solid" class="w-4 h-4 mr-1" />
                {{ guide.format }}
              </span>
            </div>
          </div>
        </template>
        <!-- Descrição do Deck -->
        <section v-if="guide.description">
          <UCard class="hover:shadow-lg transition-shadow mb-4">
            <template #header>
              <h3 class="text-lg font-semibold text-primary-600">
                Descrição do Deck
              </h3>
            </template>
            <div class="prose max-w-none dark:prose-invert">
              <div v-html="formattedDescricao" id="descricao" @mouseover="delegateCardMouseOver"
                @mouseout="delegateCardMouseOut" />
            </div>
          </UCard>
        </section>
        <!-- Maindeck e Sideboard -->
        <div class="grid md:grid-cols-2 gap-6">
          <section>
            <UCard class="hover:shadow-lg transition-shadow mb-4">
              <template #header>
                <h3 class="text-lg font-semibold text-primary-600">
                  Maindeck ({{ totalMaindeckCards }} cards)
                </h3>
              </template>
              <ul class="space-y-2">
                <li v-for="card in guide.maindeck" :key="card.card_name" class="flex justify-between items-center">
                  <span class="card-name capitalize" @mouseover="handleCardMouseOver(card.card_name, $event)"
                    @mouseout="handleCardMouseOut">
                    {{ card.card_name }}
                  </span>
                  <UBadge color="gray" variant="solid" class="ml-2">
                    x{{ card.quantity }}
                  </UBadge>
                </li>
              </ul>
            </UCard>
          </section>

          <section>
            <UCard class="hover:shadow-lg transition-shadow mb-4">
              <template #header>
                <h3 class="text-lg font-semibold text-primary-600">
                  Sideboard ({{ totalSideboardCards }} cards)
                </h3>
              </template>
              <ul class="space-y-2">
                <li v-for="card in guide.sideboard" :key="card.card_name" class="flex justify-between items-center">
                  <span class="card-name capitalize" @mouseover="handleCardMouseOver(card.card_name, $event)"
                    @mouseout="handleCardMouseOut">
                    {{ card.card_name }}
                  </span>
                  <UBadge color="gray" variant="solid" class="ml-2">
                    x{{ card.quantity }}
                  </UBadge>
                </li>
              </ul>
            </UCard>
          </section>
        </div>



        <!-- Estratégias -->
        <section v-if="guide.strategies?.length">
          <UCard class="hover:shadow-lg transition-shadow mb-4">
            <template #header>
              <h3 class="text-lg font-semibold text-primary-600">
                Estratégias de Sideboard
              </h3>
            </template>

            <div class="space-y-6">
              <UAccordion :items="strategyAccordionItems" class="w-full">
                <template #item="{ item }">
                  <div class="p-4 space-y-4">
                    <!-- Estratégia Geral -->
                    <div v-if="item.general_strategy" class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Estratégia Geral
                      </h4>
                      <div class="prose-sm max-w-none dark:prose-invert"
                        v-html="formatarEstrategiaGeral(item.general_strategy)" @mouseover="delegateCardMouseOver"
                        @mouseout="delegateCardMouseOut" />
                    </div>

                    <!-- Side In/Out -->
                    <div class="grid md:grid-cols-2 gap-4">
                      <UCard>
                        <template #header>
                          <h5 class="text-sm font-semibold text-green-600">
                            Side In ({{ item.side_in.length }})
                          </h5>
                        </template>
                        <ul class="space-y-2">
                          <li v-for="card in item.side_in" :key="card.card_name"
                            class="flex justify-between items-center">
                            <div class="flex-1">
                              <span class="card-name capitalize"
                                @mouseover="handleCardMouseOver(card.card_name, $event)" @mouseout="handleCardMouseOut">
                                {{ card.card_name }}
                              </span>
                              <div v-if="card.reason" class="text-xs text-gray-600 dark:text-gray-400 mt-1"
                                v-html="formatTextWithCardLinks(card.reason)" />
                            </div>
                            <UBadge color="green" variant="solid" class="ml-2">
                              x{{ card.quantity }}
                            </UBadge>
                          </li>
                        </ul>
                      </UCard>

                      <UCard>
                        <template #header>
                          <h5 class="text-sm font-semibold text-red-600">
                            Side Out ({{ item.side_out.length }})
                          </h5>
                        </template>
                        <ul class="space-y-2">
                          <li v-for="card in item.side_out" :key="card.card_name"
                            class="flex justify-between items-center">
                            <div class="flex-1">
                              <span class="card-name capitalize"
                                @mouseover="handleCardMouseOver(card.card_name, $event)" @mouseout="handleCardMouseOut">
                                {{ card.card_name }}
                              </span>
                              <div v-if="card.reason" class="text-xs text-gray-600 dark:text-gray-400 mt-1"
                                v-html="formatTextWithCardLinks(card.reason)" />
                            </div>
                            <UBadge color="red" variant="solid" class="ml-2">
                              x{{ card.quantity }}
                            </UBadge>
                          </li>
                        </ul>
                      </UCard>
                    </div>
                  </div>
                </template>
              </UAccordion>
            </div>
          </UCard>
        </section>
      </UCard>
    </div>
    <CardImagePopup :cardName="popupCardName" :visible="isPopupVisible" :position="popupPosition"
      :cardImageCache="cardImageCache" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Decklist, CardEntry } from '~/types/decklists';
import CardImagePopup from '~/components/CardImagePopup.vue';

useHead({
  title: 'Guia de Sideboard',
  meta: [
    {
      name: 'description',
      content: 'Guia de sideboard para Magic: The Gathering',
    },
  ],
});

const route = useRoute();
const guideId = route.params.id as string;
const guide = ref<Decklist | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const cardImageCache = ref<{ [cardName: string]: string }>({});
const cardNameRegex = /\[\[([^\]]+?)\]\]/g;
const popupCardName = ref('');
const isPopupVisible = ref(false);
const popupPosition = ref({ top: '0px', left: '0px' });
const currentCardElement = ref<HTMLElement | null>(null);
const mouseMoveHandler = ref<((event: MouseEvent) => void) | null>(null);

// Computed properties
const totalMaindeckCards = computed(() =>
  guide.value?.maindeck.reduce((sum, card) => sum + card.quantity, 0) || 0
);

const totalSideboardCards = computed(() =>
  guide.value?.sideboard.reduce((sum, card) => sum + card.quantity, 0) || 0
);

const strategyAccordionItems = computed(() =>
  guide.value?.strategies?.map(strategy => ({
    label: strategy.opponent_deck_archetype,
    slot: 'item',
    ...strategy
  })) || []
);

const formattedDescricao = computed(() => {
  if (!guide.value?.description) return '';
  return guide.value.description.split('\n').map(paragraph =>
    `<p class="mb-3">${formatTextWithCardLinks(paragraph)}</p>`
  ).join('');
});

// Funções de formatação
const formatDate = (dateString: string) => {
  if (!dateString) return 'Data não informada';
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

const formatTextWithCardLinks = (texto: string): string => {
  if (!texto) return '';
  return texto.replace(cardNameRegex, (_match, cardName) => {
    return `<span class="card-name capitalize">${cardName}</span>`;
  });
};

const formatarEstrategiaGeral = (texto: string) => {
  return texto.split('\n').map(paragraph =>
    `<p class="mb-3">${formatTextWithCardLinks(paragraph)}</p>`
  ).join('');
};

// Handlers do card popup
const updatePopupPosition = (event: MouseEvent) => {
  if (currentCardElement.value && isPopupVisible.value) {
    popupPosition.value = {
      top: `${event.clientY + 15}px`,
      left: `${event.clientX + 15}px`,
    };
  }
};

const delegateCardMouseOver = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains('card-name')) {
    const cardName = target.textContent || '';
    handleCardMouseOver(cardName, event);
  }
};

const delegateCardMouseOut = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains('card-name')) {
    handleCardMouseOut();
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

// Data fetching
onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await $fetch<Decklist>(`/api/guide/${guideId}`, {
      cache: 'no-cache'
    });
    guide.value = response;

    if (guide.value) {
      await fetchCardImagesInBackground(guide.value);
    }
  } catch (e: any) {
    error.value = e.message || 'Erro desconhecido ao carregar o guia.';
    console.error("Erro ao carregar guia:", e);
    guide.value = null;
  } finally {
    isLoading.value = false;
  }
});

const fetchCardImagesInBackground = async (decklist: Decklist) => {
  const allCardNames = new Set<string>();

  // Coletar todos os nomes de cartas
  decklist.maindeck.forEach(cardEntry => allCardNames.add(cardEntry.card_name));
  decklist.sideboard.forEach(cardEntry => allCardNames.add(cardEntry.card_name));
  decklist.strategies?.forEach(estrategia => {
    estrategia.side_in.forEach(cardEntry => allCardNames.add(cardEntry.card_name));
    estrategia.side_out.forEach(cardEntry => allCardNames.add(cardEntry.card_name));

    // Cartas na estratégia geral
    const matches = [...estrategia.general_strategy.matchAll(cardNameRegex)];
    matches.forEach(match => allCardNames.add(match[1]));
  });

  // Cartas na descrição
  const descMatches = [...(decklist.description?.matchAll(cardNameRegex) || [])];
  descMatches.forEach(match => allCardNames.add(match[1]));

  // Buscar imagens
  const cache: { [cardName: string]: string } = { ...cardImageCache.value };
  for (const cardName of allCardNames) {
    if (cache[cardName]) continue;

    try {
      const cardResponse = await $fetch(
        `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`
      );
      cache[cardName] = cardResponse.image_uris?.small || '';
    } catch (error) {
      console.error(`Erro ao buscar imagem para ${cardName}:`, error);
      cache[cardName] = '';
    }
  }
  cardImageCache.value = cache;
};
</script>

<style scoped>
.card-name {
  @apply text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors duration-200;
}

.prose :deep(.card-name) {
  @apply font-medium border-b border-dashed border-gray-400 hover:border-primary-500;
}

#descricao :deep(p) {
  @apply my-3 leading-relaxed;
}

.strategy-accordion {
  @apply border rounded-lg overflow-hidden;
}
</style>
