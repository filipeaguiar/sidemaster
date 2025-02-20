import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const guideId = getRouterParam(event, 'id')

    if (!guideId) {
        throw createError({
            statusCode: 400,
            message: 'ID do guia não fornecido.'
        })
    }

    const supabase = await serverSupabaseClient(event)

    // --- Autenticação Segura ---
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        console.error("Erro de autenticação ao editar guia:", userError)
        throw createError({
            statusCode: 401,
            message: 'Não autenticado ou erro ao verificar autenticação.',
            details: userError?.message,
        })
    }

    // --- Ler o Corpo da Requisição ---
    let requestBody;
    try {
        requestBody = await readBody(event)
    } catch (error: any) {
        console.error("Erro ao ler o corpo da requisição na edição do guia:", error)
        throw createError({
            statusCode: 400,
            message: 'Erro ao ler dados da requisição.',
            details: error.message
        })
    }

    // Remover decklist_input do payload
    if (requestBody && typeof requestBody === 'object' && requestBody.decklist_input) {
        delete requestBody.decklist_input;
    }

    try {
        // --- Chamar a função PostgreSQL 'update_guide_decklist' ---
        const { data, error: rpcError } = await supabase
            .rpc('update_guide_decklist', { // Nome da função PostgreSQL
                p_guide_id: guideId,
                p_deck_archetype: requestBody.deck_archetype,
                p_format: requestBody.format,
                p_version: requestBody.version,
                p_release_date: requestBody.release_date,
                p_description: requestBody.description,
                p_user_id: user.id,
                p_maindeck: requestBody.maindeck || [],
                p_sideboard: requestBody.sideboard || []
            })

        if (rpcError) {
            console.error("Erro ao chamar função PostgreSQL 'update_guide_decklist':", rpcError)
            throw createError({
                statusCode: 500,
                message: 'Erro ao atualizar guia e decklist (função PostgreSQL).',
                details: rpcError.message,
            })
        }

        if (!data) { // Se data for null ou undefined, mesmo sem rpcError, algo deu errado
            throw createError({
                statusCode: 500,
                message: 'Função PostgreSQL "update_guide_decklist" não retornou dados.',
            })
        }

        return { message: data }; // Retorna a mensagem de sucesso da função PostgreSQL

    } catch (error: any) {
        console.error("Erro geral ao processar edição do guia (função PostgreSQL):", error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Erro desconhecido ao editar o guia.',
        })
    }
})
