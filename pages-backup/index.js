// Page d'accueil en Pages Router (plus fiable sur Vercel)
export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            💰 Gestion Dépenses WhatsApp
          </h1>
          <p style={{ color: '#6b7280' }}>
            Solution IA pour automatiser vos notes de frais
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            🎉 Application Déployée avec Succès !
          </h2>
          
          <div style={{ 
            backgroundColor: '#ecfdf5', 
            border: '1px solid #d1fae5', 
            padding: '1rem', 
            borderRadius: '6px',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontWeight: '600', color: '#065f46' }}>✅ Webhook WhatsApp Actif</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#047857' }}>
              URL: <code style={{ backgroundColor: '#d1fae5', padding: '0.25rem', borderRadius: '3px' }}>
                https://depense-whatsapp-vercel1.vercel.app/api/whatsapp
              </code>
            </p>
          </div>
          
          <div style={{ 
            backgroundColor: '#eff6ff', 
            border: '1px solid #dbeafe', 
            padding: '1rem', 
            borderRadius: '6px',
            marginBottom: '1rem'
          }}>
            <h3 style={{ fontWeight: '600', color: '#1e40af' }}>📊 Dashboard Dépenses</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#1d4ed8' }}>
              <a href="/whatsapp" style={{ textDecoration: 'underline' }}>
                Gérer vos dépenses →
              </a>
            </p>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '1rem', 
          borderRadius: '6px',
          fontSize: '0.875rem'
        }}>
          <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
            🧪 Test Webhook
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
            Envoyez un POST à /api/whatsapp avec :
          </p>
          <pre style={{ 
            backgroundColor: '#e5e7eb', 
            padding: '0.5rem', 
            borderRadius: '3px',
            overflow: 'auto',
            fontSize: '0.75rem'
          }}>
            {`{"from": "test", "text": "restaurant 25€"}`}
          </pre>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            🚀 Votre solution est maintenant <strong>EN PRODUCTION</strong> !
          </p>
        </div>
      </div>
    </div>
  )
}