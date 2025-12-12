// API WhatsApp en Pages Router (100% compatible Vercel)
export default function handler(req, res) {
  // Autoriser tous les domaines pour les tests
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    // Verification webhook (pour WhatsApp Business API)
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === 'webhook_verify_token_123') {
      console.log('Webhook verified!')
      res.status(200).send(challenge)
    } else {
      res.status(403).send('Forbidden')
    }
    return
  }

  if (req.method === 'POST') {
    try {
      const { from, text, entry } = req.body
      
      console.log('📱 Message WhatsApp reçu:', { from, text, entry })
      
      // Extraction simple du texte
      let messageText = text
      if (entry && entry[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body) {
        messageText = entry[0].changes[0].value.messages[0].text.body
      }
      
      // Détection de dépense avec patterns simples
      const expensePatterns = [
        /(\d+[,\.]\d{2})\s*€/,          // 25.50€
        /€\s*(\d+[,\.]\d{2})/,          // €25.50
        /(restaurant|taxi|hotel|essence)/i,  // Mots-clés
        /dépense|facture|ticket/i        // Contexte
      ]
      
      let isExpense = false
      let amount = 0
      let category = 'divers'
      
      if (messageText) {
        // Vérifier si c'est une dépense
        for (const pattern of expensePatterns) {
          const match = messageText.match(pattern)
          if (match) {
            isExpense = true
            if (match[1] && match[1].includes('€')) {
              amount = parseFloat(match[1].replace('€', '').replace(',', '.'))
            }
            break
          }
        }
        
        // Déterminer la catégorie
        if (messageText.toLowerCase().includes('restaurant') || messageText.toLowerCase().includes('resto')) {
          category = 'restauration'
        } else if (messageText.toLowerCase().includes('taxi') || messageText.toLowerCase().includes('uber')) {
          category = 'transport'
        } else if (messageText.toLowerCase().includes('hotel') || messageText.toLowerCase().includes('hébergement')) {
          category = 'hebergement'
        }
      }
      
      const timestamp = new Date().toISOString()
      const expenseId = Date.now()
      
      if (isExpense) {
        const expense = {
          id: expenseId,
          from: from || 'unknown',
          amount: amount,
          category: category,
          description: messageText,
          timestamp: timestamp,
          processed: true
        }
        
        console.log('💰 Dépense détectée:', expense)
        
        res.status(200).json({
          success: true,
          message: 'Dépense traitée avec succès',
          expense: expense,
          webhook_status: 'active'
        })
      } else {
        res.status(200).json({
          success: true,
          message: 'Message reçu mais pas de dépense détectée',
          text: messageText,
          webhook_status: 'active'
        })
      }
      
    } catch (error) {
      console.error('❌ Erreur traitement webhook:', error)
      res.status(500).json({
        success: false,
        error: 'Erreur serveur',
        details: error.message
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}