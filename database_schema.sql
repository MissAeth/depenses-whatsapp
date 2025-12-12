-- Table pour les dépenses WhatsApp SmartExpense
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
CREATE INDEX idx_whatsapp_expenses_merchant ON whatsapp_expenses(merchant);