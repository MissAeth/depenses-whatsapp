// Version cloud de l'AI processor pour Vercel
// Utilise Tesseract OCR + analyse de texte simple (pas Ollama)

// Types pour les données extraites (compatible avec l'ancien fichier)
export interface ExtractedExpenseData {
  amount: number
  date: string
  merchant: string
  description: string
  category: string
  confidence: number
  rawText: string
}

interface ExpenseData {
  amount: number;
  date: string;
  merchant: string;
  description: string;
  category: string;
}

// Fonction principale pour traiter une image sans Ollama
export async function processExpenseImageCloud(imageFile: File): Promise<ExpenseData | null> {
  try {
    console.log('🔄 Traitement cloud de l\'image:', imageFile.name);
    
    // 1. Convertir l'image en base64
    const imageData = await fileToBase64(imageFile);
    
    // 2. OCR avec Tesseract
    const ocrText = await performOCR(imageData);
    console.log('📝 Texte OCR extrait:', ocrText);
    
    // 3. Analyser le texte extrait
    const expenseData = analyzeReceiptText(ocrText);
    
    console.log('✅ Données extraites:', expenseData);
    return expenseData;
    
  } catch (error) {
    console.error('❌ Erreur traitement image:', error);
    return null;
  }
}

// Convertir un fichier en base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Enlever le préfixe data:image/...
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Effectuer l'OCR avec Tesseract
async function performOCR(base64Image: string): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  
  const worker = await createWorker(['fra', 'eng']);
  
  try {
    // Convertir base64 en blob pour Tesseract
    const imageBlob = base64ToBlob(base64Image);
    
    const { data: { text } } = await worker.recognize(imageBlob);
    await worker.terminate();
    
    console.log('✅ OCR Tesseract terminé');
    return text;
  } catch (error) {
    await worker.terminate();
    console.error('❌ Erreur OCR Tesseract:', error);
    throw error;
  }
}

// Convertir base64 en blob
function base64ToBlob(base64: string): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes]);
}

// Analyser le texte OCR pour extraire les données de dépense
function analyzeReceiptText(text: string): ExpenseData {
  console.log('🔍 Analyse du texte:', text);
  
  // Nettoyer le texte
  const cleanText = text.toLowerCase().replace(/[^\w\s€.,:/\-]/g, ' ');
  
  // Extraire le montant
  const amount = extractAmount(text);
  
  // Extraire la date
  const date = extractDate(text);
  
  // Extraire le marchand
  const merchant = extractMerchant(text);
  
  // Extraire la description
  const description = extractDescription(text);
  
  // Déterminer la catégorie
  const category = categorizeExpense(text);
  
  return {
    amount: amount || 0,
    date: date || new Date().toISOString().split('T')[0],
    merchant: merchant || 'Marchand inconnu',
    description: description || 'Description extraite automatiquement',
    category: category || 'Autres'
  };
}

// Extraire le montant du texte
function extractAmount(text: string): number | null {
  // Patterns pour les montants
  const patterns = [
    /(\d+[.,]\d{2})\s*€/g,           // 15.99€ ou 15,99€
    /€\s*(\d+[.,]\d{2})/g,           // €15.99
    /total[:\s]*(\d+[.,]\d{2})/gi,   // Total: 15.99
    /(\d+[.,]\d{2})\s*eur/gi,        // 15.99 EUR
    /(\d{1,3}[.,]\d{2})/g            // Pattern général pour montants
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const numberMatch = match.match(/(\d+[.,]\d{2})/);
        if (numberMatch) {
          const amount = parseFloat(numberMatch[1].replace(',', '.'));
          if (amount > 0 && amount < 10000) { // Filtre de réalisme
            return amount;
          }
        }
      }
    }
  }
  
  return null;
}

// Extraire la date du texte
function extractDate(text: string): string | null {
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,  // DD/MM/YYYY ou DD-MM-YY
    /(\d{1,2})\s+(jan|fév|mar|avr|mai|jun|jul|aoû|sep|oct|nov|déc)\w*\s+(\d{2,4})/gi,
    /(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g   // YYYY/MM/DD
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        // Essayer de parser la première date trouvée
        const dateStr = match[0];
        const date = new Date(dateStr.replace(/[\/\-]/g, '/'));
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  return null;
}

// Extraire le nom du marchand
function extractMerchant(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 2);
  
  // Le marchand est souvent dans les premières lignes
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Ignorer les lignes avec des montants ou dates
    if (line.match(/\d+[.,]\d{2}/) || line.match(/\d{1,2}[\/\-]\d{1,2}/)) {
      continue;
    }
    
    // Chercher des noms de marque connus
    if (line.length > 3 && line.length < 50) {
      return line.charAt(0).toUpperCase() + line.slice(1);
    }
  }
  
  return null;
}

// Extraire une description
function extractDescription(text: string): string | null {
  // Prendre les premières lignes significatives
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 5 && line.length < 100);
  
  if (lines.length > 0) {
    return lines.slice(0, 2).join(' - ');
  }
  
  return null;
}

// Catégoriser la dépense basé sur des mots-clés
function categorizeExpense(text: string): string {
  const lowerText = text.toLowerCase();
  
  const categories = {
    'Transport': ['train', 'sncf', 'metro', 'bus', 'taxi', 'uber', 'essence', 'carburant', 'parking'],
    'Restauration': ['restaurant', 'cafe', 'boulangerie', 'mcdo', 'kfc', 'pizza', 'repas', 'dejeuner'],
    'Hébergement': ['hotel', 'auberge', 'camping', 'gite', 'airbnb', 'booking'],
    'Matériel': ['materiel', 'equipement', 'fourniture', 'achat', 'magasin', 'store'],
    'Activités': ['activite', 'sortie', 'visite', 'musee', 'parc', 'attraction', 'loisir']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'Autres';
}

// Fonction pour vérifier si Ollama est disponible
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // Timeout de 2 secondes
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Fonction principale qui choisit automatiquement entre Ollama et cloud
export async function processExpenseImage(imageFile: File): Promise<ExpenseData | null> {
  console.log('🤖 Vérification de la disponibilité d\'Ollama...');
  
  // En production (Vercel), utiliser toujours la version cloud
  if (process.env.NODE_ENV === 'production') {
    console.log('🌐 Mode production détecté, utilisation OCR cloud');
    return processExpenseImageCloud(imageFile);
  }
  
  // En développement, essayer Ollama puis fallback
  const ollamaAvailable = await isOllamaAvailable();
  
  if (ollamaAvailable) {
    console.log('✅ Ollama disponible, utilisation de l\'IA locale');
    // Importer dynamiquement la version Ollama
    try {
      // Convertir File en base64 pour l'ancienne fonction
      const imageBase64 = await fileToBase64(imageFile);
      const { processExpenseContent } = await import('./ai-processor');
      const result = await processExpenseContent(`data:image/jpeg;base64,${imageBase64}`);
      
      // Convertir ExtractedExpenseData vers ExpenseData
      return {
        amount: result.amount,
        date: result.date,
        merchant: result.merchant,
        description: result.description,
        category: result.category
      };
    } catch (error) {
      console.log('⚠️ Erreur Ollama, fallback vers OCR cloud');
      return processExpenseImageCloud(imageFile);
    }
  } else {
    console.log('❌ Ollama non disponible, utilisation OCR cloud');
    return processExpenseImageCloud(imageFile);
  }
}

// Fonction pour traiter le contenu d'une dépense (compatible avec ExpenseForm)
export async function processExpenseContent(
  imageBase64?: string, 
  textContent?: string
): Promise<ExtractedExpenseData> {
  console.log('🔄 processExpenseContent appelé - mode cloud');
  
  let rawText = '';
  
  if (textContent) {
    rawText = textContent;
  } else if (imageBase64) {
    // Convertir imageBase64 en File pour utiliser l'OCR cloud
    try {
      const blob = base64ToBlob(imageBase64.replace(/^data:image\/[^;]+;base64,/, ''));
      const file = new File([blob], 'expense.jpg', { type: 'image/jpeg' });
      
      console.log('🔍 Début OCR cloud de l\'image...');
      const extractedData = await processExpenseImageCloud(file);
      
      if (extractedData) {
        // Convertir ExpenseData vers ExtractedExpenseData
        return {
          amount: extractedData.amount,
          date: extractedData.date,
          merchant: extractedData.merchant,
          description: extractedData.description,
          category: extractedData.category,
          confidence: 0.8, // Score de confiance par défaut pour OCR
          rawText: `${extractedData.merchant} - ${extractedData.description} - ${extractedData.amount}€`
        };
      } else {
        throw new Error('Échec de l\'extraction OCR');
      }
    } catch (error) {
      console.error('❌ Erreur traitement image cloud:', error);
      throw new Error("Erreur lors de l'analyse de l'image");
    }
  } else {
    throw new Error("Aucun contenu fourni (image ou texte)");
  }
  
  // Si on arrive ici, c'est qu'on a du texte à traiter
  if (!rawText.trim()) {
    throw new Error("Aucun texte extrait du contenu");
  }
  
  console.log('📝 Analyse du texte fourni...');
  const expenseData = analyzeReceiptText(rawText);
  
  return {
    amount: expenseData.amount,
    date: expenseData.date,
    merchant: expenseData.merchant,
    description: expenseData.description,
    category: expenseData.category,
    confidence: 0.7, // Score de confiance pour analyse de texte
    rawText: rawText
  };
}