export default function Upload() {
  return (
    <main className="min-h-screen p-4 bg-zinc-50">
      <div className="max-w-md mx-auto bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="bg-white p-6 border-b border-zinc-200">
          <h1 className="text-2xl font-semibold text-zinc-900">📤 Upload Ticket</h1>
          <p className="text-zinc-500 mt-2">Envoyez vos tickets de dépenses</p>
        </div>
        
        <div className="p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-gray-600 mb-4">Glissez votre ticket ici ou cliquez pour sélectionner</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Sélectionner un fichier
            </button>
          </div>
          
          <div className="mt-6">
            <a href="/" className="text-blue-600 hover:underline">← Retour à l'accueil</a>
          </div>
        </div>
      </div>
    </main>
  )
}