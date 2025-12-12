export default function StatusBadge({ status }: { status?: 'brouillon' | 'validee' | 'rejetee' }) {
  if (!status || status === 'brouillon') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        📝 Brouillon
      </span>
    )
  }
  
  if (status === 'validee') {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ Validée
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
      ✗ Rejetée
    </span>
  )
}
