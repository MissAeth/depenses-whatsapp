# 🔍 Comment Trouver les Webhooks WhatsApp dans Meta Dashboard

## 📍 Navigation depuis le Tableau de bord

### Étape 1: Accéder à la section WhatsApp

Depuis le **Tableau de bord** (où vous êtes actuellement) :

1. **Regardez le menu de gauche** (sidebar)
2. **Cherchez la section "WhatsApp"** dans la liste
   - Elle peut être sous un autre nom comme "WhatsApp Business" ou "Messaging"
   - Elle peut aussi être dans une section déroulante
3. **Cliquez sur "WhatsApp"** (ou "WhatsApp Business")

> 💡 **Astuce** : Si vous ne voyez pas "WhatsApp" dans le menu, essayez :
> - Cliquez sur le nom de votre app en haut à gauche ("Billz App")
> - Cherchez dans le menu déroulant qui s'affiche
> - Ou utilisez la barre de recherche en haut

### Étape 2: Aller dans Configuration

Une fois dans la section **WhatsApp** :

1. **Cherchez l'onglet "Configuration"** (ou "Setup" en anglais)
   - Il peut être en haut de la page
   - Ou dans le menu de gauche sous WhatsApp
2. **Cliquez sur "Configuration"**

### Étape 3: Trouver les Webhooks

Dans la page **Configuration** :

1. **Cherchez la section "Webhooks"**
   - Elle peut être au milieu de la page
   - Ou dans un onglet séparé
2. **Vous devriez voir** :
   - Un champ "Callback URL"
   - Un champ "Verify token"
   - Un bouton "Edit" ou "Configure"

## 🗺️ Chemin complet

```
Meta Dashboard
  └─ Mes applications
      └─ Billz App
          └─ WhatsApp (dans le menu de gauche)
              └─ Configuration (ou Setup)
                  └─ Webhooks
```

## 🔄 Alternative : Via "Getting Started"

Si vous ne trouvez pas "Configuration", essayez :

1. Dans le menu de gauche, cherchez **"Getting Started"** (ou "Démarrer")
2. Cliquez dessus
3. Cherchez une section **"Webhooks"** ou **"Configure Webhook"**
4. Cliquez sur **"Configure"** ou **"Edit"**

## 📸 À quoi ça ressemble

Une fois dans la section Webhooks, vous devriez voir :

```
┌─────────────────────────────────────┐
│ Webhooks                            │
├─────────────────────────────────────┤
│ Callback URL:                       │
│ [https://votre-app.vercel.app/...]  │
│                                     │
│ Verify token:                       │
│ [________________]                  │
│                                     │
│ [Edit] [Verify and Save]            │
└─────────────────────────────────────┘
```

## ❓ Si vous ne trouvez toujours pas

### Option 1: Utiliser la recherche

1. Cliquez sur la **barre de recherche** en haut (à côté de "Search...")
2. Tapez : **"webhook"** ou **"webhooks"**
3. Sélectionnez le résultat qui correspond à WhatsApp

### Option 2: Vérifier les permissions

- Assurez-vous d'être **administrateur** de l'application
- Vérifiez que l'application a bien accès à **WhatsApp Business API**

### Option 3: URL directe

Essayez d'accéder directement à :
```
https://developers.facebook.com/apps/[VOTRE_APP_ID]/whatsapp-business/wa-settings/
```

Remplacez `[VOTRE_APP_ID]` par l'ID de votre application (visible dans l'URL quand vous êtes sur le dashboard).

## ✅ Une fois que vous avez trouvé les Webhooks

1. **Cliquez sur "Edit"** ou **"Configure"**
2. **Remplissez** :
   - **Callback URL** : `https://votre-app.vercel.app/api/whatsapp`
   - **Verify token** : `sgdf_whatsapp_2024_secret`
3. **Cliquez sur "Verify and Save"**
4. **Dans "Manage"**, cochez **"messages"**
5. **Cliquez sur "Save"**

## 🎯 Résumé Rapide

1. Menu de gauche → **WhatsApp**
2. **Configuration** (ou Setup)
3. Section **Webhooks**
4. **Edit** → Remplir → **Verify and Save**

