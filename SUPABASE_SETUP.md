# 🗄️ Configuration Supabase - Base de données SmartExpense

## ⚡ **Étapes de configuration (5 minutes)**

### **1. Créer le compte Supabase**
1. **Allez sur** : https://supabase.com
2. **Sign up** avec votre email (gratuit)
3. **Créez un nouveau projet** :
   - Nom : `SmartExpense DB`
   - Région : `West Europe (eu-west-1)`
   - Password : Générer un mot de passe fort

### **2. Récupérer les clés de connexion**

Une fois le projet créé (2-3 minutes) :

1. **Settings** → **API**
2. **Copiez ces 2 valeurs** :

```env
SUPABASE_URL = https://votre-projet-id.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **3. Configuration Vercel**

**Ajoutez dans Vercel Dashboard** → Environment Variables :

```
SUPABASE_URL = votre_url_supabase  
SUPABASE_ANON_KEY = votre_clé_anon
```

### **4. Création de la table**

Dans Supabase Dashboard → **SQL Editor** → **Nouveau query** :

```sql
-- Création table des dépenses WhatsApp
CREATE TABLE whatsapp_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  merchant TEXT NOT NULL,
  description TEXT,
  category TEXT,
  confidence DECIMAL(3,2),
  raw_text TEXT,
  whatsapp_from TEXT,
  source TEXT DEFAULT 'whatsapp',
  received_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_whatsapp_expenses_date ON whatsapp_expenses(created_at);
CREATE INDEX idx_whatsapp_expenses_amount ON whatsapp_expenses(amount);
```

## ✅ **Une fois configuré, les dépenses seront** :
- ✅ **Persistantes** : Jamais perdues
- ✅ **Temps réel** : Affichage immédiat 
- ✅ **Recherchables** : Par date, montant, marchand
- ✅ **Exportables** : CSV, Excel, PDF

---
**Temps total : 5-10 minutes maximum !**