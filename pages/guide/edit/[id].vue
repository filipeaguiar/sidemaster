<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Decklist, Strategy } from '@/types/decklist';
import { useRouter, useRoute } from 'vue-router';
import { useSupabaseUser } from '#imports';

const router = useRouter();
const route = useRoute();
const user = useSupabaseUser();
const guideId = route.params.id as string; // ✅ Pegar o ID da rota

const guideData = ref<Decklist>({
  user_id: '',
  deck_archetype: '',
  format: 'Pioneer',
  version: '1.0',
  release_date: new Date().toISOString().slice(0, 10),
  description: '',
  maindeck: [],
  sideboard: [],
  strategies: [],
  decklist_input: ''
});

const isLoading = ref(false); // ✅ Estado de carregamento
const error = ref<string | null>(null); // ✅ Estado de erro

const formatoOptions = ref([
  'Pioneer',
  'Modern',
  'Legacy',
  'Vintage',
  'Standard',
  'Pauper',
  'Commander',
  'Brawl',
  'Explorer',
  'Histórico',
  'Selado',
  'Draft',
  'Outro'
]);

// Parsing do decklist
const parseDecklist = () => {
  const lines = guideData.value.decklist_input.split('\n');
  let currentSection: 'maindeck' | 'sideboard' = 'maindeck';

  guideData.value.maindeck = [];
  guideData.value.sideboard = [];

  lines.forEach(line => {
    line = line.trim();

    if (line === '') {
      currentSection = 'sideboard';
      return;
    }

    const match = line.match(/^(\d+)\s+(.+)/);
    if (match) {
      const cardEntry = {
        card: match[2].trim(),
        quantity: parseInt(match[1])
      };

      if (currentSection === 'maindeck') {
        guideData.value.maindeck.push(cardEntry);
      } else {
        guideData.value.sideboard.push(cardEntry);
      }
    }
  });
};

// Estratégias (as mesmas funções de new.vue)
const addStrategy = () => {
  guideData.value.strategies.push({
    opponent_deck_archetype: '',
    general_strategy: '',
    side_in: [],
    side_out: []
  });
};

const addSideInCard = (strategyIndex: number) => {
  guideData.value.strategies[strategyIndex].side_in.push({
    card: '',
    quantity: 1,
    reason: ''
  });
};

const removeSideInCard = (strategyIndex: number, cardIndex: number) => {
  guideData.value.strategies[strategyIndex].side_in.splice(cardIndex, 1);
};

const addSideOutCard = (strategyIndex: number) => {
  guideData.value.strategies[strategyIndex].side_out.push({
    card: '',
    quantity: 1,
    reason: ''
  });
};

const removeSideOutCard = (strategyIndex: number, cardIndex: number) => {
  guideData.value.strategies[strategyIndex].side_out.splice(cardIndex, 1);
};

// Submit (modificado para PUT)
const submissionError = ref<string | null>(null);
const submissionSuccess = ref(false);
const isSubmitting = ref(false);

const submitGuide = async () => {
  submissionError.value = null;
  submissionSuccess.value = false;
  isSubmitting.value = true;

  if (!user.value?.id) {
    submissionError.value = 'Usuário não autenticado';
    isSubmitting.value = false;
    return;
  }

  console.log('Dados do Guia ANTES de enviar (EDIÇÃO):', guideData.value);
  try {
    const { decklist_input, ...dataToSend } = guideData.value;
    console.log('Body da requisição ANTES de enviar (EDIÇÃO):', dataToSend);
    const response = await $fetch(`/api/guide/${guideId}`, { // ✅ Usando PUT e guideId na URL
      method: 'PUT',
      body: {
        ...dataToSend,
        user_id: user.value.id
      }
    });

    if (response) {
      submissionSuccess.value = true;
      isSubmitting.value = false;
      setTimeout(() => router.push(`/guide/${guideId}`), 2000); // ✅ Redirecionar para a página do guia editado
    }
  } catch (error: any) {
    submissionError.value = error.data?.message || 'Erro ao salvar as edições';
    isSubmitting.value = false;
  }
};

// Carregar dados do guia para edição
onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await $fetch<Decklist>(`/api/guide/${guideId}`, { // ✅ Buscar guia pelo ID
      cache: 'no-cache'
    });
    guideData.value = response; // ✅ Preencher guideData com os dados do guia existente
  } catch (e: any) {
    error.value = e.message || 'Erro ao carregar guia para edição.';
    console.error("Erro ao carregar guia para edição:", e);
    guideData.value = null;
  } finally {
    isLoading.value = false;
  }
});

useHead({
  title: 'Editar Guia de Deck', // ✅ Título da página de edição
  meta: [
    { name: 'description', content: 'Página para editar guias de deck de Magic: The Gathering' }, // ✅ Meta description para edição
  ],
});

</script>
<template>
  <div class="container mx-auto p-4 relative">
    <UContainer v-if="isLoading" class="text-center text-gray-500 my-8">
      <div class="flex flex-col items-center justify-center h-64">
        <UIcon name="i-heroicons-arrow-path-20-solid" class="w-12 h-12 animate-spin text-primary-500" />
        <p class="mt-4 text-lg font-medium">Carregando guia para edição...</p>
      </div>
    </UContainer>

    <UContainer v-else-if="error" class="text-center my-8">
      <UAlert icon="i-heroicons-exclamation-triangle-20-solid" title="Erro ao carregar o guia para edição"
        :description="error" color="red" variant="outline" class="max-w-2xl mx-auto" />
    </UContainer>

    <UContainer v-else class="space-y-6 max-w-screen-xl mx-auto">
      <UCard>
        <template #header>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Editar Guia de Deck
          </h1>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section class="col-span-1">
            <UFormGroup label="Arquétipo do Deck">
              <UInput v-model="guideData.deck_archetype" placeholder="Ex: Rakdos Scam" />
            </UFormGroup>

            <UFormGroup label="Formato">
              <USelect v-model="guideData.format" :options="formatoOptions" />
            </UFormGroup>

            <UFormGroup label="Versão do Guia">
              <UInput v-model="guideData.version" placeholder="Ex: 1.0, Atualizado em Janeiro/2024" />
            </UFormGroup>

            <UFormGroup label="Data de Lançamento">
              <UInput v-model="guideData.release_date" type="date" />
            </UFormGroup>
          </section>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Descrição do Deck
          </h2>
        </template>
        <UFormGroup>
          <UTextarea v-model="guideData.description" rows="20"
            placeholder="Escreva uma descrição detalhada do seu deck, suas estratégias gerais e o que o torna único." />
        </UFormGroup>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Lista do Deck
          </h2>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-bold mb-2">Maindeck</h3>
            <div v-for="(card, cardIdx) in guideData.maindeck" :key="`maindeck-${cardIdx}`"
              class="flex gap-2 mb-2 items-center">
              <UInput v-model.number="card.quantity" type="number" class="w-16" />
              <UInput v-model="card.card_name" placeholder="Nome da Carta" />
              <UButton color="red" icon="i-heroicons-trash" @click="guideData.maindeck.splice(cardIdx, 1)" />
            </div>
            <UButton @click="guideData.maindeck.push({ card: '', quantity: 1 })" block>Adicionar Carta ao Maindeck
            </UButton>
          </div>

          <div>
            <h3 class="font-bold mb-2">Sideboard</h3>
            <div v-for="(card, cardIdx) in guideData.sideboard" :key="`sideboard-${cardIdx}`"
              class="flex gap-2 mb-2 items-center">
              <UInput v-model.number="card.quantity" type="number" class="w-16" />
              <UInput v-model="card.card_name" placeholder="Nome da Carta" />
              <UButton color="red" icon="i-heroicons-trash" @click="guideData.sideboard.splice(cardIdx, 1)" />
            </div>
            <UButton @click="guideData.sideboard.push({ card: '', quantity: 1 })" block>Adicionar Carta ao Sideboard
            </UButton>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Estratégias de Sideboard
          </h2>
        </template>

        <div v-for="(strategy, idx) in guideData.strategies" :key="idx" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex justify-between items-center mb-4">
            <UInput v-model="strategy.opponent_deck_archetype" placeholder="Arquétipo do Deck Oponente" />
            <UButton color="red" icon="i-heroicons-trash" @click="guideData.strategies.splice(idx, 1)" />
          </div>
          <UFormGroup label="Estratégia Geral">
            <UTextarea v-model="strategy.general_strategy"
              placeholder="Escreva a estratégia geral contra este arquétipo." rows="3" />
          </UFormGroup>


          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="font-bold mb-2">Side In</h3>
              <div v-for="(card, cardIdx) in strategy.side_in" :key="cardIdx" class="flex gap-2 mb-2">
                <UInput v-model.number="card.quantity" type="number" class="w-20" />
                <UInput v-model="card.card_name" placeholder="Carta" />
                <UTextarea v-model="card.reason" placeholder="Motivo" rows="1" />
                <UButton color="red" icon="i-heroicons-trash" @click="removeSideInCard(idx, cardIdx)" />
              </div>
              <UButton @click="addSideInCard(idx)" block>Adicionar Side In</UButton>
            </div>

            <div>
              <h3 class="font-bold mb-2">Side Out</h3>
              <div v-for="(card, cardIdx) in strategy.side_out" :key="cardIdx" class="flex gap-2 mb-2">
                <UInput v-model.number="card.quantity" type="number" class="w-20" />
                <UInput v-model="card.card_name" placeholder="Carta" />
                <UTextarea v-model="card.reason" placeholder="Motivo" rows="1" />
                <UButton color="red" icon="i-heroicons-trash" @click="removeSideOutCard(idx, cardIdx)" />
              </div>
              <UButton @click="addSideOutCard(idx)" block>Adicionar Side Out</UButton>
            </div>
          </div>
        </div>

        <UButton @click="addStrategy" icon="i-heroicons-plus" class="mt-4" block variant="outline">
          Adicionar Estratégia
        </UButton>
      </UCard>

      <div class="flex justify-end mt-8">
        <UButton @click="submitGuide" color="primary" :loading="isSubmitting">
          Salvar Edições
        </UButton>
      </div>

      <UAlert v-if="submissionError" color="red" class="mt-4">
        {{ submissionError }}
      </UAlert>
    </UContainer>
  </div>
</template>

<style scoped>
/* Estilos específicos do componente podem ser adicionados aqui, se necessário */
.container {
  display: flex;
  flex-direction: column;
}

.mt-auto {
  margin-top: auto;
}
</style>
<style scoped>
/* Estilos específicos do componente podem ser adicionados aqui, se necessário */
.container {
  display: flex;
  flex-direction: column;
}

.mt-auto {
  margin-top: auto;
}
</style>

<style scoped>
/* Estilos específicos do componente podem ser adicionados aqui, se necessário */
.container {
  display: flex;
  flex-direction: column;
}

.mt-auto {
  margin-top: auto;
}
</style>
