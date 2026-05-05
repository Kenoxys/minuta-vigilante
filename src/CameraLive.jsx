import { useRef, useEffect, useState } from 'react'
import { Camera, RefreshCw, XCircle } from 'lucide-react'

export default function CameraLive({ foto, setFoto }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)

  const startCamera = async () => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 }, // Reducimos resolución para ahorrar espacio
          height: { ideal: 480 }
        },
        audio: false 
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error de cámara:", err)
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(e => console.error("Error al reproducir video:", e))
    }
  }, [stream])

  const takePhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    
    // Forzamos un tamaño máximo de 400px para que la foto no pese tanto
    const maxWidth = 400
    const scale = maxWidth / video.videoWidth
    canvas.width = maxWidth
    canvas.height = video.videoHeight * scale
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // COMPRESIÓN: Convertimos a JPEG con calidad 0.6 (60%)
    // Esto reduce el tamaño de ~2MB a menos de 50KB
    const dataURL = canvas.toDataURL('image/jpeg', 0.6)
    setFoto(dataURL)
    alert('📸 Foto capturada y comprimida')
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-xl">
      <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-400">
        <Camera size={20} /> Cámara de Vigilancia
      </h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-sm">
          <XCircle className="shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      {stream ? (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-600 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <button
              onClick={takePhoto}
              type="button"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 p-4 rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
            >
              <Camera size={20} /> Capturar Foto
            </button>
            <button
              onClick={stopCamera}
              type="button"
              className="bg-slate-700 hover:bg-slate-600 p-4 rounded-2xl transition"
              title="Apagar"
            >
              ⏹️
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startCamera}
          type="button"
          className="w-full aspect-video bg-slate-900 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group shadow-inner"
        >
          <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform shadow-lg">
            <Camera size={32} className="text-slate-500 group-hover:text-blue-400" />
          </div>
          <div className="text-center">
            <span className="block text-sm font-bold text-slate-300 group-hover:text-white">Activar Cámara</span>
            <span className="text-[10px] text-slate-500">Haz clic para encender</span>
          </div>
        </button>
      )}

      {foto && (
        <div className="mt-4 p-3 bg-blue-500/10 rounded-2xl border border-blue-500/30 flex flex-col items-center">
          <span className="text-[10px] text-blue-400 font-bold mb-2 uppercase tracking-tighter text-center">✓ Foto optimizada para base de datos</span>
          <img src={foto} alt="Vista previa" className="h-20 rounded-lg shadow-md border border-white/10" />
        </div>
      )}
    </div>
  )
}
