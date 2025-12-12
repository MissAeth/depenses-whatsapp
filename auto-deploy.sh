#!/bin/bash

echo "🚀 DÉPLOIEMENT AUTOMATIQUE VERCEL"
echo "=================================="

# 1. Installation Vercel CLI si pas présent
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation Vercel CLI..."
    npm install -g vercel
fi

# 2. Login automatique (ouvrira le navigateur une seule fois)
echo "🔑 Connexion Vercel..."
vercel login

# 3. Configuration automatique du projet
echo "⚙️ Configuration du projet..."
cat > .vercel/project.json << EOF
{
  "orgId": "team_xxx",
  "projectId": "prj_xxx",
  "settings": {
    "framework": "nextjs",
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "installCommand": "npm install",
    "outputDirectory": ".next"
  }
}
EOF

# 4. Variables d'environnement
echo "🔧 Configuration des variables..."
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY pk_test_dev production
vercel env add CLERK_SECRET_KEY sk_test_dev production  
vercel env add TREASURY_EMAIL votre.email@gmail.com production
vercel env add NODE_ENV production production

# 5. Build local
echo "🏗️ Build de l'application..."
npm run build

# 6. Déploiement production
echo "🚀 Déploiement en production..."
vercel --prod --yes

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "Votre app est maintenant en ligne !"
echo ""
echo "Pour tester:"
echo "curl https://votre-url.vercel.app/api/whatsapp"