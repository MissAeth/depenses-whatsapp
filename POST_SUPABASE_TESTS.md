# 🧪 Tests Post-Supabase

## **Une fois les variables ajoutées dans Vercel :**

### **Test 1 : Connexion**
```bash
curl https://sgdf-notes-de-frais-lovat.vercel.app/api/test-supabase
```

### **Test 2 : Insertion**
```bash
curl -X POST https://sgdf-notes-de-frais-lovat.vercel.app/api/test-supabase
```

### **Test 3 : WhatsApp avec BDD**
```bash
curl -X POST https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "33615722037",
            "type": "text",
            "text": {"body": "Restaurant Supabase test 120€"},
            "timestamp": "1765377000"
          }]
        }
      }]
    }]
  }'
```

### **Test 4 : Récupération depuis BDD**
```bash
curl https://sgdf-notes-de-frais-lovat.vercel.app/api/whatsapp-expenses
```

---

**Résultat attendu : Dépenses persistantes dans Supabase !**