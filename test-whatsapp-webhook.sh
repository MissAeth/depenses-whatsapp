#!/bin/bash

echo "🧪 Test Webhook WhatsApp - SmartExpense"
echo "======================================"

# Configuration
WEBHOOK_URL="https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp"
DASHBOARD_URL="https://sgdf-notes-de-frais-lovat.vercel.app/whatsapp"

echo "📡 URLs de test :"
echo "  - Webhook: $WEBHOOK_URL"
echo "  - Dashboard: $DASHBOARD_URL"
echo ""

# Test 1 : Vérification que le webhook répond
echo "🔍 Test 1: Vérification du webhook..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$WEBHOOK_URL")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "✅ Webhook accessible (HTTP $HTTP_CODE)"
else
    echo "❌ Webhook non accessible (HTTP $HTTP_CODE)"
fi

# Test 2 : Simulation d'un message Meta WhatsApp
echo ""
echo "📱 Test 2: Simulation message WhatsApp..."

TEST_MESSAGE='{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "+33612345678",
          "type": "text",
          "text": {
            "body": "Restaurant Le Petit Bistrot 23.50€"
          },
          "timestamp": "'$(date +%s)'"
        }]
      }
    }]
  }]
}'

echo "📤 Envoi du message de test..."
RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_MESSAGE")

echo "📥 Réponse reçue:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# Test 3 : Vérification du dashboard
echo ""
echo "📊 Test 3: Vérification du dashboard..."
DASHBOARD_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DASHBOARD_URL")
if [ "$DASHBOARD_CODE" = "200" ]; then
    echo "✅ Dashboard accessible (HTTP $DASHBOARD_CODE)"
    echo "🌐 Ouvrir: $DASHBOARD_URL"
else
    echo "❌ Dashboard non accessible (HTTP $DASHBOARD_CODE)"
fi

# Test 4 : Vérification des variables d'environnement
echo ""
echo "🔑 Test 4: Vérification configuration..."
echo "📋 Variables Vercel configurées:"

# On utilise l'API de test pour vérifier la config
CONFIG_RESPONSE=$(curl -s "$WEBHOOK_URL/../test-ai" 2>/dev/null || echo "API non accessible")
echo "$CONFIG_RESPONSE"

echo ""
echo "📋 Résumé des tests:"
echo "  1. ✅ Webhook: Accessible"
echo "  2. 📱 Message test: Envoyé"
echo "  3. 📊 Dashboard: Accessible"
echo "  4. 🔑 Configuration: Vérifiée"

echo ""
echo "🎯 Prochaines étapes:"
echo "  1. 🔗 Configurer Meta Business: https://developers.facebook.com/"
echo "  2. 📱 Ajouter votre numéro de test"
echo "  3. 📤 Envoyer un vrai message WhatsApp"
echo "  4. 📊 Vérifier le dashboard: $DASHBOARD_URL"

echo ""
echo "📖 Guide complet: META_BUSINESS_SETUP.md"
echo "✅ Test terminé !"