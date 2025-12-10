/**
 * Service WhatsApp Bot Gratuit (100% gratuit pour concours)
 * Lancez ce fichier séparément: node whatsapp-bot-service.js
 * 
 * Ce service écoute les messages WhatsApp et les envoie à votre API
 */

const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const axios = require('axios')

// Configuration
// Détecter automatiquement le port (3000 ou 3001 si 3000 est occupé)
const API_URL = process.env.API_URL || 'http://localhost:3000'
const PORT = process.env.PORT || 3000

console.log('🔧 Configuration:')
console.log(`   API URL: ${API_URL}`)
console.log(`   Si l'app tourne sur le port 3001, changez API_URL dans .env.local\n`)

console.log('🚀 Démarrage du service WhatsApp Bot gratuit...')
console.log(`📡 API URL: ${API_URL}`)

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth'
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
})

// Afficher le QR code
client.on('qr', (qr) => {
  console.log('\n\n')
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║                                                           ║')
  console.log('║          📱 SCANNEZ CE QR CODE AVEC WHATSAPP 📱          ║')
  console.log('║                                                           ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log('\n')
  
  // Générer un QR code plus grand et plus lisible
  qrcode.generate(qr, { 
    small: false,
    width: 2
  })
  
  console.log('\n')
  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║  Instructions:                                            ║')
  console.log('║  1. Ouvrez WhatsApp sur votre téléphone                  ║')
  console.log('║  2. Menu (⋮) → Appareils liés                            ║')
  console.log('║  3. Lier un appareil                                      ║')
  console.log('║  4. Scannez le QR code ci-dessus                         ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log('\n')
  
  // Afficher aussi l'URL alternative
  console.log('💡 Alternative: Allez sur https://web.whatsapp.com')
  console.log('   et utilisez le QR code affiché sur le site\n')
})

// Connexion réussie
client.on('ready', async () => {
  console.log('✅ Bot WhatsApp connecté et prêt!')
  console.log('✅ Envoyez une photo de ticket pour traitement automatique\n')
  
  // Afficher des infos de debug
  try {
    const info = await client.info
    console.log('📱 Informations de connexion:')
    console.log(`   Nom: ${info.pushname || 'N/A'}`)
    console.log(`   Numéro: ${info.wid.user || 'N/A'}`)
    console.log(`   Plateforme: ${info.platform || 'N/A'}\n`)
  } catch (e) {
    console.log('   (Infos non disponibles)\n')
  }
})

// Erreur
client.on('auth_failure', (msg) => {
  console.error('❌ Erreur authentification:', msg)
})

// Déconnexion
client.on('disconnected', (reason) => {
  console.log('⚠️ Déconnecté:', reason)
})

// Écouter les messages
client.on('message', async (message) => {
  // TOUJOURS logger TOUS les messages pour debug
  console.log(`\n📨 Message reçu:`)
  console.log(`   De: ${message.from}`)
  console.log(`   Type: ${message.type}`)
  console.log(`   Texte: ${message.body || '(aucun)'}`)
  console.log(`   Média: ${message.hasMedia ? 'Oui' : 'Non'}`)
  console.log(`   Groupe: ${message.isGroupMsg ? 'Oui' : 'Non'}`)
  console.log(`   Statut: ${message.from === 'status@broadcast' ? 'Oui' : 'Non'}`)
  console.log(`   Timestamp: ${new Date(message.timestamp * 1000).toLocaleString()}`)
  
  // Ignorer les messages de groupes et les statuts
  if (message.from === 'status@broadcast') {
    console.log('   ⏭️ Ignoré: message de statut')
    return
  }
  
  if (message.isGroupMsg) {
    console.log('   ⏭️ Ignoré: message de groupe')
    return
  }
  
  // IMPORTANT: Les messages envoyés à soi-même peuvent avoir un format différent
  // Vérifier aussi les messages "fromMe" mais reçus
  console.log(`   FromMe: ${message.fromMe ? 'Oui' : 'Non'}`)

  const messageText = (message.body || '').toLowerCase()
  const hasMedia = message.hasMedia

  // Détecter si c'est une dépense - TOUJOURS traiter les images
  const isExpense = hasMedia || 
    messageText.includes('dépense') || 
    messageText.includes('ticket') || 
    messageText.includes('facture') ||
    messageText.includes('€') ||
    messageText.includes('euro') ||
    messageText.includes('restaurant') ||
    messageText.includes('taxi') ||
    messageText.includes('hotel') ||
    messageText.includes('carburant')

  console.log(`   Détecté comme dépense: ${isExpense ? 'OUI ✅' : 'NON ❌'}`)

  if (isExpense) {

    try {
      let imageBase64 = null

      // Télécharger l'image si présente
      if (hasMedia) {
        console.log('📥 Téléchargement de l\'image...')
        try {
          const media = await message.downloadMedia()
          if (media) {
            console.log(`   Type média: ${media.mimetype}`)
            console.log(`   Taille: ${media.data.length} caractères (base64)`)
            if (media.mimetype.startsWith('image/')) {
              imageBase64 = `data:${media.mimetype};base64,${media.data}`
              console.log('✅ Image téléchargée et convertie en base64')
            } else {
              console.log(`⚠️ Média non-image: ${media.mimetype}`)
            }
          } else {
            console.log('⚠️ Aucun média téléchargé')
          }
        } catch (mediaError) {
          console.error('❌ Erreur téléchargement média:', mediaError.message)
        }
      }

      // Envoyer à l'API
      console.log('🤖 Envoi à l\'API pour traitement avec Gemini...')
      console.log(`   URL: ${API_URL}/api/whatsapp`)
      
      // Préparer les données - si on a du base64, l'envoyer directement
      const requestData = {
        from: message.from,
        text: message.body || '',
        timestamp: new Date().toISOString()
      }
      
      // Si on a une image en base64, l'envoyer directement (pas comme URL)
      if (imageBase64) {
        // Envoyer l'image de deux façons pour être sûr que l'API la reçoive
        requestData.imageBase64 = imageBase64
        requestData.media = {
          type: 'image',
          url: imageBase64, // L'API va détecter que c'est du base64 (commence par "data:image/")
          caption: message.body || ''
        }
        console.log(`   ✅ Image base64 préparée: ${imageBase64.substring(0, 50)}... (${imageBase64.length} caractères)`)
        console.log(`   ✅ Type MIME: ${imageBase64.match(/data:([^;]+)/)?.[1] || 'inconnu'}`)
      } else if (hasMedia) {
        console.log('⚠️ hasMedia=true mais imageBase64 est null - problème de téléchargement')
      }
      
      console.log('   Envoi de la requête...')
      const response = await axios.post(`${API_URL}/api/whatsapp`, requestData, {
        timeout: 60000, // 60 secondes de timeout pour Gemini
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`   Réponse API: ${response.status} ${response.statusText}`)

      if (response.data.success) {
        console.log('✅ Dépense traitée avec succès!')
        console.log('   Données extraites:', JSON.stringify(response.data.extracted_data || response.data).substring(0, 200))
        try {
          await message.reply('✅ Dépense reçue et traitée avec succès! Vous pouvez la voir sur l\'application.')
        } catch (e) {
          console.log('   ⚠️ Impossible d\'envoyer la réponse WhatsApp (normal si message de soi-même)')
        }
      } else {
        console.log('❌ Erreur traitement:', response.data.error)
        console.log('   Détails:', response.data.details)
        try {
          await message.reply('❌ Erreur lors du traitement. Veuillez réessayer.')
        } catch (e) {
          console.log('   ⚠️ Impossible d\'envoyer la réponse WhatsApp')
        }
      }
    } catch (error) {
      console.error('❌ Erreur complète:', error.message)
      if (error.response) {
        console.error('   Réponse API:', error.response.status, error.response.data)
      }
      if (error.request) {
        console.error('   Pas de réponse de l\'API - vérifiez que Next.js tourne sur', API_URL)
      }
      try {
        await message.reply('❌ Erreur lors du traitement. Veuillez réessayer.')
      } catch (e) {
        console.log('   ⚠️ Impossible d\'envoyer la réponse WhatsApp')
      }
    }
  } else {
    console.log('   ⏭️ Message ignoré (pas détecté comme dépense)')
  }
})

// Démarrer le client
client.initialize().catch((error) => {
  console.error('❌ Erreur initialisation:', error)
  process.exit(1)
})

// Gérer l'arrêt propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du bot...')
  await client.destroy()
  process.exit(0)
})

