#!/bin/bash

echo "🔧 Configuration des variables d'environnement Vercel"
echo "===================================================="

# Variables essentielles pour le fonctionnement de base
echo "📧 Configuration de l'email de la trésorerie..."
vercel env add TREASURY_EMAIL production --value="tresorerie@sgdf.fr"

echo "🌐 Configuration de l'URL de base..."
vercel env add NEXT_PUBLIC_BASE_URL production --value="https://sgdf-notes-de-frais-ovnnk20q8-vanessas-projects-78fa410e.vercel.app"

echo "🔐 Configuration Clerk (valeurs temporaires)..."
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --value="pk_test_dev"
vercel env add CLERK_SECRET_KEY production --value="sk_test_dev"
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production --value="/sign-in"
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production --value="/sign-up"

echo "✅ Configuration terminée !"
echo "🚀 Redéployez avec: vercel --prod"