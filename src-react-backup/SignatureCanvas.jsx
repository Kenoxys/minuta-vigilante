import { useRef, useEffect } from 'react'
import SignaturePad from 'react-signature-canvas'

export default function SignatureCanvas({ firma, setFirma }) {
  const sigPadRef = useRef()

  const clearSignature = () => {
    sigPadRef.current.clear()
    setFirma('')
  }

  const saveSignature = () => {
    if (sigPadRef.current.isEmpty()) return
    setFirma(sigPadRef.current.toDataURL())
  }

  return (
    <div class="bg-white/10 p-4 rounded-2xl border-2 border-dashed border-white/30">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        ✍️ Firma Digital
      </h3>
      <SignaturePad
        ref={sigPadRef}
        canvasProps={{
          className: 'w-full h-40 bg-white rounded-xl border-2 border-gray-200'
        }}
      />
      <div class="flex gap-2 mt-4">
        <button
          onClick={clearSignature}
          class="flex-1 bg-red-600/80 hover:bg-red-600 p-3 rounded-xl text-sm font-semibold"
        >
          Borrar
        </button>
        <button
          onClick={saveSignature}
          class="flex-1 bg-green-600/80 hover:bg-green-600 p-3 rounded-xl text-sm font-semibold"
        >
          Guardar Firma
        </button>
      </div>
      {firma && (
        <div class="mt-2 text-xs text-green-400 text-center font-semibold">
          ✅ Firma guardada
        </div>
      )}
    </div>
  )
}
