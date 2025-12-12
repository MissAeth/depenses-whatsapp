#!/bin/bash
# Script de test automatique - Administration SGDF
# Usage: bash tmp_rovodev_test_admin.sh

echo "🧪 Test Automatique - Administration SGDF"
echo "=========================================="
echo ""

# Configuration
BASE_URL="${BASE_URL:-https://sgdf-notes-de-frais-lovat.vercel.app}"
ADMIN_PHONE="+33615722037"
ADMIN_PASSWORD="admin123"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Fonction de test
test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="$3"
  local method="${4:-GET}"
  
  echo -n "Test: $name... "
  
  response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url")
  
  if [ "$response" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $response, attendu $expected_status)"
    ((FAILED++))
  fi
}

# Test API health check
test_api_health() {
  local url="$1"
  echo -n "Test: API Health Check... "
  
  response=$(curl -s "$url")
  
  if echo "$response" | grep -q "healthy"; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
    return 1
  fi
}

echo "📡 Tests API Endpoints"
echo "----------------------"

# Test 1: Health check (cherche "ok":true au lieu de "healthy")
echo -n "Test: API Health Check... "
response=$(curl -s "$BASE_URL/api/health")
if echo "$response" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC}"
  ((FAILED++))
fi

# Test 2: Admin login page
test_endpoint "Page Admin Login" "$BASE_URL/admin/login" 200

# Test 3: Admin dashboard (devrait rediriger si non authentifié)
test_endpoint "Admin Dashboard (non auth)" "$BASE_URL/admin/dashboard" 200

# Test 4: API Admin verify (sans session)
test_endpoint "API Admin Verify (sans auth)" "$BASE_URL/api/admin/verify" 401

# Test 5: API Admin users (sans session)
test_endpoint "API Admin Users (sans auth)" "$BASE_URL/api/admin/users" 401

# Test 6: API Login utilisateur
test_endpoint "API User Login" "$BASE_URL/api/auth/login" 405 "GET"

# Test 7: API Expenses check duplicates
test_endpoint "API Check Duplicates" "$BASE_URL/api/expenses/check-duplicates" 405 "GET"

# Test 8: Page WhatsApp
test_endpoint "Page WhatsApp" "$BASE_URL/whatsapp" 200

# Test 9: API WhatsApp expenses
test_endpoint "API WhatsApp Expenses" "$BASE_URL/api/whatsapp-expenses" 200

# Test 10: API WhatsApp export
test_endpoint "API WhatsApp Export" "$BASE_URL/api/whatsapp-expenses/export" 200

echo ""
echo "🔐 Test Authentification Admin"
echo "------------------------------"

# Test login admin
echo -n "Test: Login Admin avec identifiants... "

login_response=$(curl -s -X POST "$BASE_URL/api/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$ADMIN_PHONE\",\"password\":\"$ADMIN_PASSWORD\"}" \
  -c /tmp/admin_cookies.txt)

if echo "$login_response" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((PASSED++))
  
  # Test avec session
  echo -n "Test: API Admin Verify (avec session)... "
  verify_response=$(curl -s "$BASE_URL/api/admin/verify" -b /tmp/admin_cookies.txt)
  
  if echo "$verify_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
  fi
  
  # Test récupération utilisateurs
  echo -n "Test: Récupération liste utilisateurs... "
  users_response=$(curl -s "$BASE_URL/api/admin/users" -b /tmp/admin_cookies.txt)
  
  if echo "$users_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "   → $(echo "$users_response" | grep -o '"users":\[.*\]' | wc -c) caractères de données"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
  fi
  
else
  echo -e "${RED}✗ FAIL${NC}"
  echo "   Response: $login_response"
  ((FAILED++))
fi

# Nettoyage
rm -f /tmp/admin_cookies.txt

echo ""
echo "📊 Résumé"
echo "========="
echo -e "Tests réussis: ${GREEN}$PASSED${NC}"
echo -e "Tests échoués: ${RED}$FAILED${NC}"
echo "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✨ Tous les tests sont passés !${NC}"
  exit 0
else
  echo ""
  echo -e "${YELLOW}⚠️  Certains tests ont échoué. Consultez le guide de test pour plus de détails.${NC}"
  exit 1
fi
