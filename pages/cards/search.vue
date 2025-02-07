<template>
  <div>
    <h1>Dados de Cartas do card_db.json</h1>
    <div v-if="cards">
      <ul>
        <li v-for="card in cards" :key="card.id">
          {{ card.name }} - {{ card.mana_cost }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p>Carregando dados das cartas...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const cards = ref(null);

onMounted(async () => {
  try {
    console.log('Buscando dados do card_db.json...');
    const response = await $fetch('/card_db.json');
    console.log('Dados do card_db.json:', response);
    cards.value = response;
  } catch (error) {
    console.error('Erro ao buscar card_db.json:', error);
    // Lidar com o erro, exibir uma mensagem para o usuário, etc.
    cards.value = []; // Garante que 'cards' seja um array vazio em caso de erro.
  }
});
</script>
