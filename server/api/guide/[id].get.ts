import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '@/types/database'
import { getRouterParams } from 'h3'

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event)
  const guideId = params.id as string // Garante que id é string

  if (!guideId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID do guia não fornecido.',
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)

  // 1. Buscar o Guia Principal
  const { data: guide, error: guideError } = await supabase
    .from('guides')
    .select('*')
    .eq('id', guideId)
    .single()

  if (guideError || !guide) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Guia não encontrado.',
    })
  }

  // 2. Buscar Maindeck Cards
  const { data: maindeckCards, error: maindeckError } = await supabase
    .from('maindeck_cards')
    .select('*')
    .eq('guide_id', guideId)

  if (maindeckError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar maindeck cards.',
      data: maindeckError,
    })
  }

  // 3. Buscar Sideboard Cards
  const { data: sideboardCards, error: sideboardError } = await supabase
    .from('sideboard_cards')
    .select('*')
    .eq('guide_id', guideId)

  if (sideboardError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar sideboard cards.',
      data: sideboardError,
    })
  }

  // 4. Buscar Estratégias e seus Side In/Out Cards
  const { data: strategies, error: strategiesError } = await supabase
    .from('strategies')
    .select('*')
    .eq('guide_id', guideId)

  if (strategiesError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar estratégias.',
      data: strategiesError,
    })
  }

  // Buscar Side In/Out Cards para cada estratégia (paralelamente)
  const strategiesWithCards = await Promise.all(
    strategies.map(async (strategy) => {
      const [sideInResult, sideOutResult] = await Promise.all([
        supabase
          .from('side_in_cards')
          .select('*')
          .eq('strategy_id', strategy.id),
        supabase
          .from('side_out_cards')
          .select('*')
          .eq('strategy_id', strategy.id),
      ])

      return {
        ...strategy,
        side_in: sideInResult.data || [],
        side_out: sideOutResult.data || [],
      }
    })
  )

  return {
    ...guide,
    maindeck: maindeckCards || [],
    sideboard: sideboardCards || [],
    strategies: strategiesWithCards || [],
  };
})
