import { useRef, useEffect, useState } from 'react'
import { Camera, Image as ImageIcon } from 'lucide-react'

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
      alert('Cámara no disponible')
    }
  }

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setHasPhoto(true)
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
    <div class="bg-white/10 p-4 rounded-2xl border-2 border-dashed border-white/30">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        📸 Cámara en Vivo
      </h3>
      
      {stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            class="w-full h-48 object-cover rounded-xl mb-4 bg-black"
          />
          <canvas ref={canvasRef} class="hidden" />
          <div class="flex gap-2">
            <button
              onClick={takePhoto}
              class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 p-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Camera size={18} />
              Tomar Foto
            </button>
            <button
              onClick={stopCamera}
              class="bg-gray-600/80 hover:bg-gray-600 p-3 rounded-xl"
            >
              ⏹️
            </button>
          </div>
          {hasPhoto && (
            <div class="text-xs text-green-400 mt-2 text-center">
              ✅ Foto lista para minuta
            </div>
          )}
        </>
      ) : (
        <button
          onClick={startCamera}
          class="w-full h-48 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl flex flex-col items-center justify-center gap-3 hover:from-gray-700 transition-all group"
        >
          <Camera size={48} class="text-gray-400 group-hover:text-white" />
          <span class="text-lg font-semibold text-gray-400 group-hover:text-white">
            Iniciar Cámara
          </span>
        </button>
      )}
    </div>
  )
}
