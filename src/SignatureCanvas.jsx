import { useRef, useEffect } from 'react'
import SignaturePad from 'react-signature-canvas'
import { Eraser, CheckCircle, PenTool } from 'lucide-react'

export default function SignatureCanvas({ firma, setFirma }) {
  const sigPadRef = useRef()
  const containerRef = useRef()

  const syncCanvasSize = () => {
    if (sigPadRef.current && containerRef.current) {
      const canvas = sigPadRef.current.getCanvas()
      const { width, height } = containerRef.current.getBoundingClientRect()
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        sigPadRef.current.clear()
      }
    }
  }

  useEffect(() => {
    syncCanvasSize()
    window.addEventListener('resize', syncCanvasSize)
    return () => window.removeEventListener('resize', syncCanvasSize)
  }, [])

  const clearSignature = () => {
    sigPadRef.current.clear()
    setFirma('')
  }

  const handleConfirm = () => {
    if (sigPadRef.current.isEmpty()) {
      return alert('⚠️ Por favor, dibuja tu firma')
    }
    const canvas = sigPadRef.current.getCanvas()
    const dataURL = canvas.toDataURL('image/png')
    setFirma(dataURL)
    alert('✅ Firma confirmada')
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-2xl">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-400 text-lg">
        <PenTool size={20} /> Firma de Responsabilidad
      </h3>
      
      <div 
        ref={containerRef}
        className="bg-white rounded-2xl overflow-hidden border-2 border-slate-600 h-48 touch-none relative"
      >
        <SignaturePad
          ref={sigPadRef}
          penColor="black"
          canvasProps={{
            className: 'absolute top-0 left-0 w-full h-full cursor-crosshair'
          }}
        />
        <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 pointer-events-none font-bold opacity-30">
          FIRME AQUÍ
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={clearSignature}
          type="button"
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-3 rounded-xl font-bold transition-all border border-slate-600 text-sm"
        >
          Borrar
        </button>
        <button
          onClick={handleConfirm}
          type="button"
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 text-sm"
        >
          Confirmar Firma
        </button>
      </div>

      {firma && (
        <div className="mt-4 p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex flex-col items-center">
          <span className="text-[10px] text-emerald-400 font-bold mb-2 uppercase tracking-tighter">Vista previa de seguridad:</span>
          <div className="bg-white p-2 rounded-lg">
            <img src={firma} alt="Firma" className="h-10 object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
