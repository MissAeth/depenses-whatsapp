#!/bin/bash

# Script de test pour WhatsApp Meta API
# Usage: ./test-whatsapp-meta.sh

echo "🧪 Test de l'intégration WhatsApp Meta"
echo "======================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de base
BASE_URL="${1:-http://localhost:3000}"
WEBHOOK_URL="${BASE_URL}/api/whatsapp"

echo "📍 URL du webhook: ${WEBHOOK_URL}"
echo ""

# Test 1: Vérifier que l'endpoint répond
echo "📋 Test 1: Vérification de l'endpoint GET..."
RESPONSE=$(curl -s -w "\n%{http_code}" "${WEBHOOK_URL}")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Endpoint accessible (HTTP ${HTTP_CODE})${NC}"
    echo "Réponse: $BODY"
else
    echo -e "${RED}❌ Erreur: HTTP ${HTTP_CODE}${NC}"
    echo "Réponse: $BODY"
fi
echo ""

# Test 2: Simuler un message texte Meta
echo "📋 Test 2: Simulation d'un message texte Meta..."
MESSAGE_BODY='{
  "entry": [{
    "id": "test_entry_id",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "33612345678",
          "phone_number_id": "927016477160571"
        },
        "messages": [{
          "from": "33612345678",
          "id": "wamid.test_'$(date +%s)'",
          "timestamp": "'$(date +%s)'",
          "type": "text",
          "text": {
            "body": "Restaurant Le Bistrot 23.50€"
          }
        }]
      },
      "field": "messages"
    }]
  }]
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${WEBHOOK_URL}" \
  -H "Content-Type: application/json" \
  -d "${MESSAGE_BODY}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Message traité avec succès (HTTP ${HTTP_CODE})${NC}"
    echo "Réponse: $BODY"
else
    echo -e "${RED}❌ Erreur: HTTP ${HTTP_CODE}${NC}"
    echo "Réponse: $BODY"
fi
echo ""

# Test 3: Vérifier la vérification du webhook Meta
echo "📋 Test 3: Test de vérification du webhook Meta..."
VERIFY_TOKEN="mon_token_secret_123"  # Remplacez par votre vrai token
CHALLENGE="test_challenge_123"

RESPONSE=$(curl -s -w "\n%{http_code}" "${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=${VERIFY_TOKEN}&hub.challenge=${CHALLENGE}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ] && [ "$BODY" = "$CHALLENGE" ]; then
    echo -e "${GREEN}✅ Vérification du webhook OK (HTTP ${HTTP_CODE})${NC}"
    echo "Challenge retourné: $BODY"
elif [ "$HTTP_CODE" = "403" ]; then
    echo -e "${YELLOW}⚠️  Token de vérification incorrect ou non configuré${NC}"
    echo "Assurez-vous que WHATSAPP_VERIFY_TOKEN est configuré dans .env.local"
else
    echo -e "${RED}❌ Erreur: HTTP ${HTTP_CODE}${NC}"
    echo "Réponse: $BODY"
fi
echo ""

echo "======================================"
echo "✅ Tests terminés"
echo ""
echo "💡 Pour tester avec un vrai message WhatsApp:"
echo "   1. Configurez le webhook dans Meta Dashboard"
echo "   2. Ajoutez votre numéro dans la liste de test"
echo "   3. Envoyez un message depuis WhatsApp"
echo "   4. Vérifiez le dashboard: ${BASE_URL}/whatsapp"

