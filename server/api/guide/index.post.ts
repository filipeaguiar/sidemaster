import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('Body da Requisição Recebido:', body); // ⭐️ ADD LOG BACKEND BODY
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await supabase.auth.getUser()

  // Verificação de autenticação
  if (user.error || !user.data.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Não autenticado. Você precisa estar logado para criar um guia.',
    })
  }

  // 1. Criar o Guia Principal
  const { data: guide, error: guideError } = await supabase
    .from('guides')
    .insert({
      user_id: user.data.user.id,
      deck_archetype: body.deck_archetype,
      format: body.format,
      version: body.version,
      release_date: body.release_date,
      description: body.description, // ✅ Usando body.description (corrigido para consistência)
    })
    .select()
    .single()

  if (guideError || !guide) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao criar o guia principal',
      data: guideError,
    })
  }

  // 2. Inserir Maindeck Cards
  if (body.maindeck && body.maindeck.length > 0) {
    console.log('Inserindo maindeck cards...'); // ✅ Console log dentro do IF
    const { error: maindeckError } = await supabase
      .from('maindeck_cards')
      .insert(
        body.maindeck.map((card: any) => {
          const cardToInsert = {
            guide_id: guide.id,
            card_name: card.card, // ✅ Usando card.card (corrigido para corresponder ao frontend)
            quantity: card.quantity,
          };
          console.log('Card Maindeck para Inserir:', cardToInsert); // ⭐️ ADD LOG BACKEND CARD
          return cardToInsert;
        })
      )

    if (maindeckError) {
      // await supabase.from('guides').delete().eq('id', guide.id) // Rollback - Comentado temporariamente para debugging
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao salvar o maindeck',
        data: maindeckError,
      })
    }
  } else {
    console.log('Maindeck está vazio ou ausente, pulando inserção de maindeck cards.'); // ✅ Console log no ELSE
  }

  // 3. Inserir Sideboard Cards
  if (body.sideboard && body.sideboard.length > 0) {
    console.log('Inserindo sideboard cards...'); // ✅ Console log dentro do IF
    const { error: sideboardError } = await supabase
      .from('sideboard_cards')
      .insert(
        body.sideboard.map((card: any) => ({
          guide_id: guide.id,
          card_name: card.card, // ✅ Usando card.card (corrigido para corresponder ao frontend)
          quantity: card.quantity,
        }))
      )

    if (sideboardError) {
      // await supabase.from('guides').delete().eq('id', guide.id) // Rollback - Comentado temporariamente para debugging
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao salvar o sideboard',
        data: sideboardError,
      })
    }
  } else {
    console.log('Sideboard está vazio ou ausente, pulando inserção de sideboard cards.'); // ✅ Console log no ELSE
  }

  // 4. Inserir Estratégias + Side In/Out Cards
  if (body.strategies && body.strategies.length > 0) {
    console.log('Inserindo estratégias...'); // ✅ Console log dentro do IF
    for (const estrategia of body.strategies) {
      // Criar a estratégia
      const { data: strategy, error: strategyError } = await supabase
        .from('strategies')
        .insert({
          guide_id: guide.id,
          opponent_deck_archetype: estrategia.opponent_deck_archetype,
          general_strategy: estrategia.general_strategy,
        })
        .select()
        .single()

      if (strategyError || !strategy) {
        // await supabase.from('guides').delete().eq('id', guide.id) // Rollback - Comentado temporariamente para debugging
        throw createError({
          statusCode: 500,
          statusMessage: 'Erro ao criar estratégia',
          data: strategyError,
        })
      }

      // Inserir Side In Cards
      if (estrategia.side_in && estrategia.side_in.length > 0) {
        console.log('Inserindo side in cards para estratégia...', strategy.id); // ✅ Console log dentro do IF
        const { error: sideInError } = await supabase
          .from('side_in_cards')
          .insert(
            estrategia.side_in.map((card: any) => ({
              strategy_id: strategy.id,
              card_name: card.card, // ✅ Usando card.card (corrigido para corresponder ao frontend)
              quantity: card.quantity,
              reason: card.reason,
            }))
          )

        if (sideInError) {
          // await supabase.from('guides').delete().eq('id', guide.id) // Rollback - Comentado temporariamente para debugging
          throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao salvar side in cards',
            data: sideInError,
          })
        }
      } else {
        console.log('Side in cards está vazio ou ausente para estratégia, pulando inserção.'); // ✅ Console log no ELSE
      }


      // Inserir Side Out Cards
      if (estrategia.side_out && estrategia.side_out.length > 0) {
        console.log('Inserindo side out cards para estratégia...', strategy.id); // ✅ Console log dentro do IF
        const { error: sideOutError } = await supabase
          .from('side_out_cards')
          .insert(
            estrategia.side_out.map((card: any) => ({
              strategy_id: strategy.id,
              card_name: card.card, // ✅ Usando card.card (corrigido para corresponder ao frontend)
              quantity: card.quantity,
              reason: card.reason,
            }))
          )

        if (sideOutError) {
          // await supabase.from('guides').delete().eq('id', guide.id) // Rollback - Comentado temporariamente para debugging
          throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao salvar side out cards',
            data: sideOutError,
          })
        }
      } else {
        console.log('Side out cards está vazio ou ausente para estratégia, pulando inserção.'); // ✅ Console log no ELSE
      }
    }
  } else {
    console.log('Estratégias está vazio ou ausente, pulando inserção de estratégias e side cards.'); // ✅ Console log no ELSE
  }

  return { success: true, guide_id: guide.id }
})
