import { useState, useEffect, useRef } from 'react'
import { Camera, MapPin, Save, Image, FileText, User } from 'lucide-react'
import { initFirebase } from './firebase'
import SignatureCanvas from './SignatureCanvas'
import CameraLive from './CameraLive'
import PDFExport from './PDFExport'

function App() {
  const [ubicacion, setUbicacion] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [firma, setFirma] = useState('')
  const [minutas, setMinutas] = useState([])
  const [stats, setStats] = useState({ total: 0, hoy: 0 })
  const [loading, setLoading] = useState(false)
  const db = initFirebase()

  // GPS automático
  const getGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUbicacion(`GPS: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
      () => setUbicacion('GPS no disponible')
    )
  }

  // Realtime minutas
  useEffect(() => {
    const unsubscribe = db.collection('minutas')
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setMinutas(data)
        setStats({
          total: data.length,
          hoy: data.filter(m => 
            new Date(m.timestamp?.toDate()).toDateString() === new Date().toDateString()
          ).length
        })
      })
    return unsubscribe
  }, [])

  // Guardar minuta
  const guardarMinuta = async () => {
    if (!observaciones.trim()) return alert('⚠️ Observaciones requeridas')
    
    setLoading(true)
    try {
      await db.collection('minutas').add({
        ubicacion,
        observaciones,
        firma,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        dispositivo: navigator.userAgent.includes('Mobile') ? 'Móvil' : 'PC',
        geoloc: ubicacion.includes('GPS') ? ubicacion : null
      })
      setObservaciones('')
      setFirma('')
      alert('✅ Minuta guardada!')
    } catch (error) {
      alert('❌ Error: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div class="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      {/* HEADER */}
      <div class="text-center mb-12">
        <h1 class="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          🛡️ Minuta Digital PRO
        </h1>
        <p class="text-xl text-gray-300">Firma digital • Cámara en vivo • GPS • PDF</p>
      </div>

      {/* FORM PRINCIPAL */}
      <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* IZQUIERDA: FORM */}
          <div>
            <div class="space-y-4 mb-8">
              <div class="flex gap-3">
                <input
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="🏢 Ubicación"
                  class="flex-1 p-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 backdrop-blur-sm"
                />
                <button onClick={getGPS} class="p-4 bg-green-600/80 hover:bg-green-600 rounded-2xl">
                  <MapPin size={20} />
                </button>
              </div>
              
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="📝 Observaciones detalladas..."
                rows="4"
                class="w-full p-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 resize-vertical h-32"
              />
            </div>

            {/* BOTONES */}
            <div class="flex flex-wrap gap-3 mb-6">
              <button
                onClick={guardarMinuta}
                disabled={loading}
                class="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-4 rounded-2xl font-semibold shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {loading ? 'Guardando...' : '💾 Guardar Minuta'}
              </button>
              <PDFExport minutas={minutas} />
            </div>
          </div>

          {/* DERECHA: FIRMA + CÁMARA */}
          <div class="space-y-6">
            <CameraLive />
            <SignatureCanvas firma={firma} setFirma={setFirma} />
          </div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white/10 p-6 rounded-2xl text-center backdrop-blur-lg border border-white/20">
          <div class="text-3xl font-black text-blue-400">{stats.total}</div>
          <div class="text-gray-400">Total Minutas</div>
        </div>
        <div class="bg-white/10 p-6 rounded-2xl text-center backdrop-blur-lg border border-white/20">
          <div class="text-3xl font-black text-green-400">{stats.hoy}</div>
          <div class="text-gray-400">Hoy</div>
        </div>
        <div class="bg-white/10 p-6 rounded-2xl text-center backdrop-blur-lg border border-white/20">
          <div class="text-xl font-bold text-yellow-400">🔴 LIVE</div>
          <div class="text-gray-400">Realtime</div>
        </div>
      </div>

      {/* LISTA MINUTAS */}
      <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
        <h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
          📋 Últimas Minutas
        </h2>
        <div class="grid gap-4 max-h-96 overflow-y-auto">
          {minutas.map((minuta) => (
            <MinutaCard key={minuta.id} minuta={minuta} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MinutaCard({ minuta }) {
  const fecha = minuta.timestamp ? new Date(minuta.timestamp.toDate()).toLocaleString('es-MX') : 'Sin fecha'
  return (
    <div class="bg-white/5 hover:bg-white/10 p-6 rounded-2xl border-l-4 border-blue-400 transition-all group">
      <div class="font-semibold text-xl mb-2">{minuta.ubicacion || 'Sin ubicación'}</div>
      <p class="text-gray-300 mb-3 leading-relaxed">{minuta.observaciones}</p>
      {minuta.firma && (
        <img src={minuta.firma} alt="Firma" class="w-20 h-20 object-contain opacity-70 mb-3" />
      )}
      <div class="flex justify-between items-center text-xs text-gray-500">
        <span>{fecha}</span>
        <span class="px-2 py-1 bg-gray-700 rounded-full text-xs">{minuta.dispositivo}</span>
      </div>
    </div>
  )
}

export default App
