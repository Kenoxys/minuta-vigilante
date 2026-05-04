import { useRef } from 'react'
import SignaturePad from 'react-signature-canvas'
import { Eraser, CheckCircle } from 'lucide-react'

export default function SignatureCanvas({ firma, setFirma }) {
  const sigPadRef = useRef()

  const clearSignature = () => {
    sigPadRef.current.clear()
    setFirma('')
  }

  const saveSignature = () => {
    if (sigPadRef.current.isEmpty()) return alert('Dibuja tu firma primero')
    setFirma(sigPadRef.current.getTrimmedCanvas().toDataURL('image/png'))
    alert('✅ Firma capturada')
  }

  return (
    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-xl">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-400">
        ✍️ Firma Digital
      </h3>
      <div className="bg-white rounded-2xl overflow-hidden border-2 border-slate-700">
        <SignaturePad
          ref={sigPadRef}
          penColor="black"
          canvasProps={{
            className: 'w-full h-40 cursor-crosshair'
          }}
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={clearSignature}
          className="flex-1 bg-slate-700 hover:bg-slate-600 p-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
        >
          <Eraser size={16} /> Limpiar
        </button>
        <button
          onClick={saveSignature}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} /> Confirmar
        </button>
      </div>
      {firma && (
        <div className="mt-3 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-[10px] text-emerald-400 text-center font-bold">
          ✓ FIRMA LISTA PARA GUARDAR
        </div>
      )}
    </div>
  )
}
