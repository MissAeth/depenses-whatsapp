# 🔄 Mise à jour Token WhatsApp

## 🔑 **Nouveau Token à configurer**

```
EAFif7arHaYMBQLQ1fLpJrf5Ev9dps8E4cZB1Dazn0EDbtDxigQfwEMhnMEY3U5lxvXmxulf4jqlUEx2v0pAkZADx6ik9Sk2loOwNdMlhHUtsJ6FRMfU5EDxFyTWEouc1Rlc44ljMx3JJOLlMqBQg2GIuqC2rMup8eld2KEz6YqnEk5i8aGwbgFBZBhPq1yCNWO1ZAyoA8HmD7pbnD56K8DIY31tLRNl6537ik2csrDFmNfSEzvNDUs9GLZBdmgkRMSrIWpkOPlNTSttpv0zRsGqoArwZDZD
```

## ⚙️ **Configuration Vercel (2 minutes)**

1. **Allez sur** : https://vercel.com/dashboard
2. **Votre projet** : sgdf-notes-de-frais
3. **Settings** → **Environment Variables**
4. **Trouvez** : `WHATSAPP_ACCESS_TOKEN`
5. **Cliquez** : Edit/Modifier
6. **Remplacez** par le token ci-dessus
7. **Save** → Redéploiement automatique

## 🧪 **Test après mise à jour**

Une fois le token mis à jour (2-3 minutes) :

**Test avec curl** :
```bash
curl -X POST https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "votre_numero",
            "type": "text",
            "text": {"body": "test nouveau token 50€"},
            "timestamp": "1640995200"
          }]
        }
      }]
    }]
  }'
```

**Ou envoyez directement depuis WhatsApp** :
```
"test nouveau token 50€"
```

## ✅ **Vérification**

Dashboard : https://sgdf-notes-de-frais-lovat.vercel.app/whatsapp

---
**Le token sera actif dès la mise à jour Vercel !**