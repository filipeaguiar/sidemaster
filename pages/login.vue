<template>
  <button @click="signInWithGoogle">Login com Google</button>
</template>

<script setup>
const supabase = useSupabaseClient();

const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Erro ao fazer login com Google:', error);
      alert('Erro ao fazer login com Google. Veja o console para detalhes.');
    }
    // Após o login bem-sucedido, o usuário será redirecionado de volta para sua aplicação
    // e a sessão do usuário será gerenciada pelo NuxtSupabase automaticamente.

  } catch (error) {
    console.error('Erro inesperado ao iniciar login com Google:', error);
    alert('Erro inesperado ao iniciar login com Google.');
  }
};
</script>
