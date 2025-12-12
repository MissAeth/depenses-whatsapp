-- Ajouter la colonne status à la table whatsapp_expenses
ALTER TABLE whatsapp_expenses 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'brouillon' 
CHECK (status IN ('brouillon', 'validee', 'rejetee'));

-- Mettre à jour les dépenses existantes
UPDATE whatsapp_expenses 
SET status = 'brouillon' 
WHERE status IS NULL;
