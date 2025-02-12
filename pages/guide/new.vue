<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Novo Guia de Sideboard</h1>

    <UFormGroup label="Nome do Jogador" name="player" class="mb-4">
      <UInput v-model="guideData.user_id" placeholder="Seu nome ou nick" />
    </UFormGroup>

    <UFormGroup label="Arquétipo do Deck" name="deck_archetype" class="mb-4">
      <UInput v-model="guideData.deck_archetype" placeholder="Ex: Rakdos Scam, Mono Blue Tempo" />
    </UFormGroup>

    <UFormGroup label="Formato" name="formato" class="mb-4">
      <USelect v-model="guideData.formato" :options="formatoOptions" placeholder="Selecione o formato" />
    </UFormGroup>

    <UFormGroup label="Versão do Guia" name="versao" class="mb-4">
      <UInput v-model="guideData.versao" placeholder="Ex: 1.0, Atualizado em Janeiro 2024" />
    </UFormGroup>

    <UFormGroup label="Data de Lançamento" name="release_date" class="mb-4">
      <UInput v-model="guideData.release_date" type="date" />
    </UFormGroup>

    <UFormGroup label="Descrição do Deck" name="descricao" class="mb-4">
      <UTextarea v-model="guideData.descricao"
        placeholder="Escreva uma descrição detalhada do seu deck, suas estratégias principais, como ele funciona no meta atual, etc. Use [[Nome da Carta]] para linkar cartas." />
    </UFormGroup>

    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Maindeck</h2>
      <div v-for="(cardEntry, index) in guideData.maindeck" :key="index" class="flex mb-2 items-center">
        <UInput v-model.number="cardEntry.quantidade" type="number" class="w-16 mr-2" placeholder="Qtd." />
        <UInput v-model="cardEntry.card" placeholder="Nome da Carta" class="flex-1" />
        <UButton color="red" variant="ghost" size="xs" icon="i-heroicons-trash-solid"
          @click="removeMaindeckCard(index)" />
      </div>
      <UButton @click="addMaindeckCard" color="primary" variant="soft" size="sm" class="mt-2">
        <UIcon name="i-heroicons-plus-solid" class="mr-1" /> Adicionar Carta Maindeck
      </UButton>
    </section>

    <section class="mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Sideboard</h2>
      <div v-for="(cardEntry, index) in guideData.sideboard" :key="index" class="flex mb-2 items-center">
        <UInput v-model.number="cardEntry.quantidade" type="number" class="w-16 mr-2" placeholder="Qtd." />
        <UInput v-model="cardEntry.card" placeholder="Nome da Carta" class="flex-1" />
        <UButton color="red" variant="ghost" size="xs" icon="i-heroicons-trash-solid"
          @click="removeSideboardCard(index)" />
      </div>
      <UButton @click="addSideboardCard" color="primary" variant="soft" size="sm" class="mt-2">
        <UIcon name="i-heroicons-plus-solid" class="mr-1" /> Adicionar Carta Sideboard
      </UButton>
    </section>

    <section v-for="(estrategia, index) in guideData.estrategias" :key="index" class="mb-8 p-4 border rounded">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Estratégia vs:
          <UInput v-model="estrategia.deck_oponente" placeholder="Nome do Deck Oponente"
            class="ml-2 inline-block w-auto" />
        </h2>
        <UButton color="red" variant="ghost" size="xs" icon="i-heroicons-trash-solid"
          @click="removeEstrategia(index)" />
      </div>

      <UFormGroup label="Estratégia Geral" :name="'estrategia_geral_' + index" class="mb-4">
        <UTextarea v-model="estrategia.estrategia_geral"
          placeholder="Descreva a estratégia geral contra este deck oponente. Use [[Nome da Carta]] para linkar cartas." />
      </UFormGroup>

      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Side In</h3>
        <div v-for="(cardEntry, cardIndex) in estrategia.side_in" :key="cardIndex" class="flex mb-2 items-center">
          <UInput v-model.number="cardEntry.quantidade" type="number" class="w-16 mr-2" placeholder="Qtd." />
          <UInput v-model="cardEntry.card" placeholder="Carta para Side In" class="flex-1" />
          <UTextarea v-model="cardEntry.motivo" placeholder="Motivo (Opcional)" class="ml-2 flex-1" />
          <UButton color="red" variant="ghost" size="xs" icon="i-heroicons-trash-solid"
            @click="removeSideInCard(index, cardIndex)" />
        </div>
        <UButton @click="addSideInCard(index)" color="primary" variant="soft" size="sm" class="mt-2">
          <UIcon name="i-heroicons-plus-solid" class="mr-1" /> Adicionar Side In
        </UButton>
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Side Out</h3>
        <div v-for="(cardEntry, cardIndex) in estrategia.side_out" :key="cardIndex" class="flex mb-2 items-center">
          <UInput v-model.number="cardEntry.quantidade" type="number" class="w-16 mr-2" placeholder="Qtd." />
          <UInput v-model="cardEntry.card" placeholder="Carta para Side Out" class="flex-1" />
          <UTextarea v-model="cardEntry.motivo" placeholder="Motivo (Opcional)" class="ml-2 flex-1" />
          <UButton color="red" variant="ghost" size="xs" icon="i-heroicons-trash-solid"
            @click="removeSideOutCard(index, cardIndex)" />
        </div>
        <UButton @click="addSideOutCard(index)" color="primary" variant="soft" size="sm" class="mt-2">
          <UIcon name="i-heroicons-plus-solid" class="mr-1" /> Adicionar Side Out
        </UButton>
      </div>
    </section>

    <UButton @click="addEstrategia" color="primary" variant="soft" size="sm" class="mt-4 mb-8">
      <UIcon name="i-heroicons-plus-solid" class="mr-1" /> Adicionar Estratégia de Sideboard
    </UButton>


    <UButton @click="submitGuide" color="green" size="lg" class="mt-8">
      <UIcon name="i-heroicons-light-bulb" class="mr-2" /> Salvar Guia
    </UButton>

    <UAlert v-if="submissionError" color="red" variant="solid" class="mt-8">
      Erro ao salvar guia: {{ submissionError }}
    </UAlert>

    <UAlert v-if="submissionSuccess" color="green" variant="solid" class="mt-8">
      Guia salvo com sucesso! <UButton to="/" color="gray" variant="ghost" size="sm" class="ml-4">Voltar para a listagem
      </UButton>
    </UAlert>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Decklist, Estrategia, CardEntry } from '~/types/decklists';
import { useRouter } from 'vue-router';

const router = useRouter();

const guideData = ref<Decklist>({
  user_id: '',
  deck_archetype: '',
  formato: 'Pioneer',
  versao: '1.0',
  release_date: new Date().toISOString().slice(0, 10), // Data atual no formato YYYY-MM-DD
  descricao: '',
  maindeck: [],
  sideboard: [],
  estrategias: [],
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


const addMaindeckCard = () => {
  guideData.value.maindeck.push({ card: '', quantidade: 1 });
};

const removeMaindeckCard = (index: number) => {
  guideData.value.maindeck.splice(index, 1);
};

const addSideboardCard = () => {
  guideData.value.sideboard.push({ card: '', quantidade: 1 });
};

const removeSideboardCard = (index: number) => {
  guideData.value.sideboard.splice(index, 1);
};

const addEstrategia = () => {
  guideData.value.estrategias.push({
    deck_oponente: '',
    estrategia_geral: '',
    side_in: [],
    side_out: [],
  });
};

const removeEstrategia = (index: number) => {
  guideData.value.estrategias.splice(index, 1);
};

const addSideInCard = (estrategiaIndex: number) => {
  guideData.value.estrategias[estrategiaIndex].side_in.push({ card: '', quantidade: 1, motivo: '' });
};

const removeSideInCard = (estrategiaIndex: number, cardIndex: number) => {
  guideData.value.estrategias[estrategiaIndex].side_in.splice(cardIndex, 1);
};


const addSideOutCard = (estrategiaIndex: number) => {
  guideData.value.estrategias[estrategiaIndex].side_out.push({ card: '', quantidade: 1, motivo: '' });
};

const removeSideOutCard = (estrategiaIndex: number, cardIndex: number) => {
  guideData.value.estrategias[estrategiaIndex].side_out.splice(cardIndex, 1);
};


const submissionError = ref<string | null>(null);
const submissionSuccess = ref<boolean>(false);

const submitGuide = async () => {
  submissionError.value = null;
  submissionSuccess.value = false;
  try {
    const response = await $fetch('/api/guide', {
      method: 'POST',
      body: guideData.value,
    });
    if (response.status === 200) {
      submissionSuccess.value = true;
      guideData.value = { // Resetando o formulário após sucesso
        user_id: '',
        deck_archetype: '',
        formato: 'Pioneer',
        versao: '1.0',
        release_date: new Date().toISOString().slice(0, 10),
        descricao: '',
        maindeck: [],
        sideboard: [],
        estrategias: [],
      };
      setTimeout(() => {
        submissionSuccess.value = false; // Limpa a mensagem de sucesso após alguns segundos
        router.push('/') // Redireciona para a listagem de guias após salvar
      }, 2000);

    } else {
      submissionError.value = 'Erro ao salvar o guia.';
    }
  } catch (error: any) {
    submissionError.value = error.message || 'Erro desconhecido ao salvar o guia.';
    console.error("Erro ao submeter guia:", error);
  }
};
</script>

<style scoped>
/* Estilos específicos do componente podem ser adicionados aqui */
</style>
