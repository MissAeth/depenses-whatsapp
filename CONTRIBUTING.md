# 🤝 Guide de contribution - SmartExpense

Merci de votre intérêt pour contribuer à SmartExpense ! Ce guide vous aidera à démarrer.

## 🚀 **Démarrage rapide**

### **1. Setup environnement**
```bash
# Fork le projet sur GitHub
git clone https://github.com/VOTRE-USERNAME/depense-whatsapp.git
cd depense-whatsapp
npm install
cp .env.example .env.local
# Configurer .env.local avec vos clés de test
npm run dev
```

### **2. Architecture du code**
```
src/
├── app/api/webhook-test/route.ts    # Webhook WhatsApp principal
├── app/whatsapp/page.tsx           # Dashboard React
├── lib/ai-processor-unified.ts     # Logique IA Gemini
├── lib/supabase.ts                 # Base de données
└── types/                          # Types TypeScript
```

## 📋 **Types de contributions**

### **🐛 Bug Reports**
- Utilisez les templates d'issues
- Incluez logs d'erreur et étapes de reproduction
- Testez sur la version latest

### **✨ Nouvelles fonctionnalités**
- Ouvrez d'abord une Discussion/Issue
- Décrivez le besoin utilisateur
- Proposez une solution technique

### **📚 Documentation**
- README, guides d'installation
- Commentaires dans le code
- Exemples d'usage API

### **🎨 UI/UX**
- Améliorations interface dashboard
- Responsive design
- Accessibilité

## 🔧 **Workflow de développement**

### **1. Créer une branche**
```bash
git checkout -b feature/nom-fonctionnalite
# ou
git checkout -b bugfix/description-bug
```

### **2. Convention de commits**
```bash
✨ feat: Ajoute export Excel avec images
🐛 fix: Corrige extraction montants avec virgules
📚 docs: Met à jour guide installation
🎨 style: Améliore responsive dashboard
♻️ refactor: Optimise logique IA
🧪 test: Ajoute tests webhook WhatsApp
```

### **3. Tests avant commit**
```bash
npm run lint          # Vérification code
npm run build         # Test build
npm run dev           # Test local
```

### **4. Pull Request**
- Titre clair et descriptif
- Description détaillée des changements
- Screenshots pour changements UI
- Tests effectués

## 🧪 **Tests**

### **Webhook WhatsApp**
```bash
# Test local
curl -X POST http://localhost:3000/api/webhook-test \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"from":"123","type":"text","text":{"body":"Restaurant 25€"},"timestamp":"1640995200"}]}}]}]}'
```

### **IA Gemini**
```bash
# Tester extraction
node -e "
const { processExpenseContent } = require('./src/lib/ai-processor-unified.ts');
processExpenseContent(null, 'Restaurant Le Bistrot 45€').then(console.log);
"
```

### **Base Supabase**
```bash
curl http://localhost:3000/api/test-supabase
```

## 📊 **Métriques de qualité**

### **Performance**
- Temps de réponse API < 2s
- Dashboard load < 1s
- Images < 5MB

### **Code Quality**
- TypeScript strict mode
- ESLint sans erreurs
- Commentaires pour logique complexe

### **Sécurité**
- Variables sensibles en .env
- Validation inputs utilisateur
- Rate limiting API

## 🎯 **Domaines de contribution**

### **🤖 IA & OCR** (Priorité haute)
- Améliorer précision extraction
- Support nouveaux formats tickets
- Optimisation performance Gemini

### **📱 WhatsApp** (Priorité haute)
- Token permanent automatique
- Support messages vocaux
- Gestion pièces jointes multiples

### **📊 Dashboard** (Priorité moyenne)
- Graphiques analytics
- Filtres avancés
- Export formats multiples

### **👥 Multi-users** (Priorité moyenne)
- Authentification
- Permissions équipes
- Workflows validation

### **📱 Mobile** (Priorité basse)
- PWA
- Notifications push
- Mode offline

## 🛠️ **Environnement de test**

### **Credentials de test**
```env
# Utilisez ces clés pour vos tests
GOOGLE_AI_API_KEY=AIzaSyA7LQMgjDMFk52rOHenGpOKHNFbuVVI5Bg
WHATSAPP_TEST_NUMBER=+1 555 612 5061
```

### **Base de données test**
```sql
-- Schema minimum pour tests
CREATE TABLE whatsapp_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10,2),
  merchant TEXT,
  raw_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📞 **Support**

- **💬 GitHub Discussions** : Questions générales
- **🐛 GitHub Issues** : Bugs et features
- **📧 Email** : vanessa.aloui@gmail.com (urgent)

## 🏆 **Reconnaissance**

Les contributeurs seront ajoutés au README avec leurs contributions :
- 🐛 Bug fixes
- ✨ Nouvelles features  
- 📚 Documentation
- 🎨 Design/UX
- 🧪 Tests

---

**Merci de contribuer à SmartExpense ! 🙏**