import { serverSupabaseClient } from '#supabase/server'
import { DecklistSchema } from '~/server/utils/schemas' // Assumindo que você tem um schema de validação

export default defineEventHandler(async (event) => {
  const guideId = getRouterParam(event, 'id')

  if (!guideId) {
    throw createError({
      statusCode: 400,
      message: 'ID do guia não fornecido.'
    })
  }

  const supabase = serverSupabaseClient(event)

  // --- Autenticação (Opcional, mas recomendado) ---
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado.',
    })
  }

  // --- Validação do Corpo da Requisição ---
  let parsedPayload;
  try {
    parsedPayload = await readValidatedBody(event, DecklistSchema.partial().parse) // Usando o schema e .partial() para edição
  } catch (error: any) {
    console.error("Erro de validação ao editar guia:", error)
    throw createError({
      statusCode: 400,
      message: 'Dados de requisição inválidos.',
      details: error.errors
    })
  }

  // Remover decklist_input do payload para evitar salvar string grande desnecessariamente
  delete parsedPayload.decklist_input;

  try {
    // --- Atualizar o guia no Supabase ---
    const { data: updatedGuide, error: updateError } = await supabase
      .from('guides')
      .update({
        ...parsedPayload,
        user_id: user.id // Garante que o user_id não seja alterado indevidamente
      })
      .eq('id', guideId)
      .select()
      .single()

    if (updateError) {
      console.error("Erro ao atualizar guia no Supabase:", updateError)
      throw createError({
        statusCode: 500,
        message: 'Erro ao atualizar o guia no banco de dados.',
        details: updateError.message,
      })
    }

    if (!updatedGuide) {
      throw createError({
        statusCode: 404,
        message: 'Guia não encontrado para edição.',
      })
    }

    return updatedGuide; // Retorna o guia atualizado

  } catch (error: any) {
    console.error("Erro geral ao processar edição do guia:", error)
    throw createError({
      statusCode: error.statusCode || 500, // Mantém statusCode específico se já definido
      message: error.message || 'Erro desconhecido ao editar o guia.',
    })
  }
})
