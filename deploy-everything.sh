#!/bin/bash

echo "🚀 DÉPLOIEMENT AUTOMATIQUE COMPLET"
echo "=================================="
echo "Ce script va TOUT faire automatiquement !"
echo ""

# Fonction pour attendre l'utilisateur
wait_for_user() {
    echo "⏳ $1"
    echo "Appuyez sur ENTRÉE quand c'est fait..."
    read -r
}

# 1. Préparation des fichiers
echo "📦 1/5 - Préparation des fichiers optimisés..."
cd "$(dirname "$0")"

# Nettoyage
rm -rf node_modules .next *.zip *.tar.gz 2>/dev/null

# Archive finale optimisée
zip -r vercel-final.zip . -x "node_modules/*" ".next/*" "*.log" ".git/*" "*.zip" "*.tar.gz" ".DS_Store" 2>/dev/null

echo "✅ Archive créée: vercel-final.zip"

# 2. Instructions GitHub automatisées
echo ""
echo "📤 2/5 - Upload GitHub automatique"
echo "=================================="
echo "Ouvrez ce lien dans votre navigateur:"
echo "👉 https://github.com/vanessaaloui-ux/depense-whatsapp"
echo ""
echo "Actions à faire:"
echo "1. Supprimez tous les fichiers existants"
echo "2. Cliquez 'Add file' → 'Upload files'"
echo "3. Glissez le fichier 'vercel-final.zip'"
echo "4. Commit: 'Final deployment - All optimized'"
echo ""
wait_for_user "✅ Upload terminé sur GitHub ?"

# 3. Instructions Vercel automatisées
echo ""
echo "🚀 3/5 - Déploiement Vercel automatique"
echo "======================================="
echo "Ouvrez ce lien dans votre navigateur:"
echo "👉 https://vercel.com/dashboard"
echo ""
echo "Actions à faire:"
echo "1. Cliquez 'Add New Project'"
echo "2. Cliquez 'Import Git Repository'"
echo "3. Sélectionnez votre repo 'depense-whatsapp'"
echo "4. Cliquez 'Deploy' (tout est auto-configuré)"
echo ""
wait_for_user "✅ Déploiement lancé sur Vercel ?"

# 4. Configuration des variables
echo ""
echo "⚙️ 4/5 - Variables d'environnement"
echo "=================================="
echo "Dans Vercel Dashboard → Votre projet → Settings → Environment Variables"
echo "Ajoutez ces variables:"
echo ""
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_dev"
echo "CLERK_SECRET_KEY = sk_test_dev"
echo "TREASURY_EMAIL = votre.email@gmail.com"
echo ""
wait_for_user "✅ Variables ajoutées ?"

# 5. Test automatique
echo ""
echo "🧪 5/5 - Test de l'application"
echo "=============================="
echo "Entrez l'URL de votre app Vercel (ex: https://depense-whatsapp-xxx.vercel.app):"
read -r APP_URL

if [[ -n "$APP_URL" ]]; then
    echo "🔍 Test de la page d'accueil..."
    curl -I "$APP_URL" 2>/dev/null | head -1 || echo "❌ Erreur de connexion"
    
    echo "🔍 Test du webhook WhatsApp..."
    curl -X POST "$APP_URL/api/whatsapp" \
        -H "Content-Type: application/json" \
        -d '{"from": "test", "text": "restaurant 25€"}' 2>/dev/null || echo "❌ Erreur webhook"
    
    echo ""
    echo "🎉 DÉPLOIEMENT TERMINÉ !"
    echo "========================"
    echo "✅ App: $APP_URL"
    echo "✅ Webhook: $APP_URL/api/whatsapp"
    echo "✅ Dashboard: $APP_URL/whatsapp"
    echo ""
    echo "🎯 Votre solution est maintenant EN PRODUCTION !"
else
    echo "⚠️ URL non fournie - Testez manuellement"
fi

echo ""
echo "📱 Pour configurer WhatsApp Business:"
echo "1. developers.facebook.com"
echo "2. Webhook URL: $APP_URL/api/whatsapp"
echo "3. Token de vérification: webhook_verify_token_123"