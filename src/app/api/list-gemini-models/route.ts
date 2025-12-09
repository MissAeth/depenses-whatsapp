import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY non configurée' },
      { status: 500 }
    )
  }

  try {
    // Tester différentes versions d'API et modèles
    const apiVersions = ['v1beta', 'v1']
    const modelsToTest = [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.5-pro',
      'gemini-2.5-flash'
    ]

    const results: Array<{
      apiVersion: string
      model: string
      available: boolean
      error?: string
    }> = []

    for (const apiVersion of apiVersions) {
      for (const model of modelsToTest) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`
          
          // Faire une requête de test simple
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'test' }] }]
            })
          })

          if (response.status === 404) {
            results.push({
              apiVersion,
              model,
              available: false,
              error: 'Model not found'
            })
          } else if (response.status === 400) {
            // 400 peut signifier que le modèle existe mais la requête est invalide
            const errorText = await response.text()
            results.push({
              apiVersion,
              model,
              available: true, // Le modèle existe
              error: errorText.substring(0, 100)
            })
          } else {
            results.push({
              apiVersion,
              model,
              available: true
            })
          }
        } catch (error: any) {
          results.push({
            apiVersion,
            model,
            available: false,
            error: error.message
          })
        }
      }
    }

    // Essayer aussi l'endpoint listModels pour voir les modèles disponibles
    let listModelsResult: any = null
    const apiVersionsForList = ['v1beta', 'v1']
    
    for (const apiVersion of apiVersionsForList) {
      try {
        const listUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${apiKey}`
        const listResponse = await fetch(listUrl)
        if (listResponse.ok) {
          listModelsResult = await listResponse.json()
          console.log(`✅ Modèles disponibles dans ${apiVersion}:`, listModelsResult?.models?.length || 0)
          break // Utiliser la première version qui fonctionne
        }
      } catch (error) {
        console.log(`❌ Erreur listModels avec ${apiVersion}:`, error)
      }
    }

    return NextResponse.json({
      apiKeyPreview: apiKey.substring(0, 10) + '...',
      testResults: results,
      availableModels: listModelsResult?.models || null,
      summary: {
        available: results.filter(r => r.available).map(r => `${r.apiVersion}/${r.model}`),
        notAvailable: results.filter(r => !r.available).map(r => `${r.apiVersion}/${r.model}`)
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

