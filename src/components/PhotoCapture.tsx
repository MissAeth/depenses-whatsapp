'use client'

import { useState, useRef } from 'react'
import { CameraIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline'

// --- Utilitaires ---
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('FILE_READER_ERROR'))
    reader.readAsDataURL(blob)
  })
}

// Fallback createImageBitmap pour navigateurs anciens
async function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('IMAGE_ELEMENT_LOAD_FAILED'))
    }
    img.src = url
  })
}

async function downscaleImage(file: File, maxDim = 1600, quality = 0.75): Promise<Blob> {
  let width: number
  let height: number
  let drawSource: CanvasImageSource

  // Détection prudente de createImageBitmap (certains navigateurs anciens)
  const canUseCreateImageBitmap = typeof window !== 'undefined' && 'createImageBitmap' in window
  const bitmapOrImage = canUseCreateImageBitmap ? await createImageBitmap(file).catch(() => null) : null
  if (bitmapOrImage) {
    width = (bitmapOrImage as any).width
    height = (bitmapOrImage as any).height
    drawSource = bitmapOrImage
  } else {
    const imgEl = await loadImageElement(file)
    width = imgEl.width
    height = imgEl.height
    drawSource = imgEl
  }

  const largest = Math.max(width, height)
  const scale = Math.min(1, maxDim / largest)
  if (scale === 1 && file.type === 'image/jpeg') {
    // Pas besoin de redimensionner
    return file
  }

  const targetWidth = Math.round(width * scale)
  const targetHeight = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('CANVAS_CONTEXT_FAILED')
  ctx.drawImage(drawSource, 0, 0, targetWidth, targetHeight)
  if ('close' in drawSource && typeof (drawSource as any).close === 'function') {
    try { (drawSource as any).close() } catch {}
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('BLOB_CONVERSION_FAILED'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      quality
    )
  })
}

interface PhotoCaptureProps {
  readonly onImageCapture: (imageUrl: string) => void
}

export function PhotoCapture({ onImageCapture }: Readonly<PhotoCaptureProps>) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [compressedInfo, setCompressedInfo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileBrowseInputRef = useRef<HTMLInputElement>(null)
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setErrorMsg(null)
    setCompressedInfo(null)

    let processedBlob: Blob
    try {
      processedBlob = await downscaleImage(file)
      const originalKb = (file.size / 1024).toFixed(0)
      const newKb = (processedBlob.size / 1024).toFixed(0)
      setCompressedInfo(`${originalKb}KB → ${newKb}KB`)
    } catch (e) {
      console.error('Erreur compression image:', e)
      setErrorMsg("Impossible d'optimiser la photo. Essayez une image plus petite (moins de 8MP).")
      return
    }

    try {
      const dataUrl = await blobToDataUrl(processedBlob)
      onImageCapture(dataUrl)
    } catch (e) {
      console.error('Erreur conversion image en base64:', e)
      setErrorMsg('Erreur de lecture du fichier image.')
      return
    }
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileBrowse = () => {
    if (fileBrowseInputRef.current) {
      fileBrowseInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl flex items-center justify-center shadow-md">
          <CameraIcon className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Justificatif de dépense</h2>
          <p className="text-xs text-zinc-500">Capturez ou importez une photo de votre facture</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleCameraCapture}
          className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-xl hover:from-zinc-800 hover:to-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
            <CameraIcon className="w-6 h-6" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold">Prendre photo</span>
          <span className="text-xs text-zinc-300 mt-1">Appareil photo</span>
        </button>
        <button
          onClick={handleFileBrowse}
          className="group flex flex-col items-center justify-center p-6 bg-white text-zinc-900 rounded-xl border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-zinc-200 transition-colors">
            <ArrowUpOnSquareIcon className="w-6 h-6 text-zinc-700" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold">Importer fichier</span>
          <span className="text-xs text-zinc-500 mt-1">Galerie / Fichiers</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <input
        ref={fileBrowseInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {compressedInfo && !errorMsg && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-xs text-green-700 font-medium">
            ✓ Optimisation réussie: {compressedInfo}
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 animate-slide-up">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">{errorMsg}</p>
          </div>
        </div>
      )}
    </div>
  )
}