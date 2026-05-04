import { useRef, useEffect, useState } from 'react'
import { Camera, RefreshCw } from 'lucide-react'

export default function CameraLive() {
  const videoRef = useRef()
  const canvasRef = useRef()
  const [stream, setStream] = useState(null)
  const [hasPhoto, setHasPhoto] = useState(false)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      videoRef.current.srcObject = stream
      setStream(stream)
    } catch (err) {
      alert('Cámara no disponible o permiso denegado')
    }
  }

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setHasPhoto(true)
    alert('📸 Foto capturada')
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
        <Camera size={20} /> Cámara en Vivo
      </h3>
      
      {stream ? (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-600">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-2">
            <button
              onClick={takePhoto}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 p-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
            >
              <Camera size={18} /> Capturar
            </button>
            <button
              onClick={stopCamera}
              className="bg-slate-700 hover:bg-slate-600 p-3 rounded-xl transition"
              title="Apagar Cámara"
            >
              ⏹️
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startCamera}
          className="w-full aspect-video bg-slate-900 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all group"
        >
          <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
            <Camera size={32} className="text-slate-500 group-hover:text-blue-400" />
          </div>
          <span className="text-sm font-medium text-slate-500 group-hover:text-slate-300">
            Activar Cámara Trasera
          </span>
        </button>
      )}
    </div>
  )
}
