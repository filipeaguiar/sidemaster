<script setup lang="ts">
import { ref } from 'vue';
import type { Decklist, Strategy } from '@/types/decklist';
import { useRouter } from 'vue-router';
import { useSupabaseUser } from '#imports';

const router = useRouter();
const user = useSupabaseUser();

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

// Estratégias
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

// Submit
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
  console.log('Dados do Guia ANTES de enviar:', guideData.value)
  try {
    const { decklist_input, ...dataToSend } = guideData.value;
    console.log('Body da requisição ANTES de enviar:', dataToSend)
    const response = await $fetch('/api/guide', {
      method: 'POST',
      body: {
        ...dataToSend,
        user_id: user.value.id
      }
    });

    if (response) {
      submissionSuccess.value = true;
      isSubmitting.value = false;
      setTimeout(() => router.push('/'), 2000);
    }
  } catch (error: any) {
    submissionError.value = error.data?.message || 'Erro ao salvar';
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto p-4 relative">
    <UContainer class="space-y-8">
      <UCard>
        <template #header>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Criar Novo Guia de Deck
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

          <section class="col-span-1">
            <UFormGroup label="Descrição do Deck">
              <UTextarea v-model="guideData.description" rows="5"
                placeholder="Escreva uma descrição detalhada do seu deck, suas estratégias gerais e o que o torna único." />
            </UFormGroup>
          </section>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Lista do Deck
          </h2>
        </template>
        <UFormGroup label="Cole sua Decklist abaixo">
          <UTextarea v-model="guideData.decklist_input" @blur="parseDecklist"
            placeholder="Cole sua lista aqui. Exemplo:\n4 Carta 1\n3 Carta 2\n...\n\n2 Carta Sideboard" rows="15"
            class="font-mono" />
        </UFormGroup>
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
                <UInput v-model="card.card" placeholder="Carta" />
                <UTextarea v-model="card.reason" placeholder="Motivo" rows="1" />
                <UButton color="red" icon="i-heroicons-trash" @click="removeSideInCard(idx, cardIdx)" />
              </div>
              <UButton @click="addSideInCard(idx)" block>Adicionar Side In</UButton>
            </div>

            <div>
              <h3 class="font-bold mb-2">Side Out</h3>
              <div v-for="(card, cardIdx) in strategy.side_out" :key="cardIdx" class="flex gap-2 mb-2">
                <UInput v-model.number="card.quantity" type="number" class="w-20" />
                <UInput v-model="card.card" placeholder="Carta" />
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
          Publicar Guia
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
/*.container {*/
/*  display: flex;*/
/*  flex-direction: column;*/
/*}*/

.mt-auto {
  margin-top: auto;
}
</style>
