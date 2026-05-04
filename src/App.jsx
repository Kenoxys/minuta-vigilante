import { useState, useEffect } from 'react'
import { Camera, MapPin, Save, ShieldCheck } from 'lucide-react'
import { db } from './firebase'
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore'
import SignatureCanvas from './SignatureCanvas'
import CameraLive from './CameraLive'
import PDFExport from './PDFExport'
import './App.css'

function App() {
  const [ubicacion, setUbicacion] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [firma, setFirma] = useState('')
  const [minutas, setMinutas] = useState([])
  const [stats, setStats] = useState({ total: 0, hoy: 0 })
  const [loading, setLoading] = useState(false)

  // GPS automático
  const getGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUbicacion(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
      () => alert('Por favor activa el GPS en tu dispositivo')
    )
  }

  // Realtime minutas con Firebase modular
  useEffect(() => {
    const q = query(collection(db, 'minutas'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMinutas(data)
      setStats({
        total: data.length,
        hoy: data.filter(m => {
          const d = m.timestamp?.toDate();
          return d && d.toDateString() === new Date().toDateString();
        }).length
      })
    })
    return unsubscribe
  }, [])

  // Guardar minuta
  const guardarMinuta = async () => {
    if (!observaciones.trim()) return alert('⚠️ Escribe las observaciones')
    if (!firma) return alert('⚠️ Falta la firma digital')
    
    setLoading(true)
    try {
      await addDoc(collection(db, 'minutas'), {
        ubicacion,
        observaciones,
        firma,
        timestamp: serverTimestamp(),
        dispositivo: /iPhone|Android|iPad/i.test(navigator.userAgent) ? 'Móvil' : 'PC'
      })
      setObservaciones('')
      setFirma('')
      alert('✅ Registro guardado exitosamente')
    } catch (error) {
      alert('❌ Error al guardar: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center justify-center gap-4">
            <ShieldCheck size={48} className="text-blue-400" />
            Minuta Digital
          </h1>
          <p className="text-slate-400 mt-2">Seguridad y Control en Tiempo Real</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-3xl border border-slate-700 shadow-2xl">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      placeholder="Ubicación o Puesto"
                      className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-700 rounded-2xl focus:ring-2 ring-blue-500 outline-none"
                    />
                  </div>
                  <button onClick={getGPS} className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl transition shadow-lg shadow-blue-900/20">
                    <MapPin size={20} />
                  </button>
                </div>
                
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalles de la novedad..."
                  rows="4"
                  className="w-full p-4 bg-slate-900 border border-slate-700 rounded-2xl focus:ring-2 ring-blue-500 outline-none resize-none"
                />

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={guardarMinuta}
                    disabled={loading}
                    className="col-span-2 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition text-lg"
                  >
                    <Save size={20} />
                    {loading ? 'Guardando...' : 'GUARDAR REGISTRO'}
                  </button>
                  <PDFExport minutas={minutas} />
                </div>
              </div>
            </div>

            {/* DASHBOARD STATS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <div className="text-3xl font-black text-blue-400">{stats.total}</div>
                <div className="text-slate-500 text-sm">Registros Totales</div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <div className="text-3xl font-black text-emerald-400">{stats.hoy}</div>
                <div className="text-slate-500 text-sm">Hoy</div>
              </div>
              <div className="hidden md:block bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
                <div className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  LIVE
                </div>
                <div className="text-slate-500 text-sm">Conectado</div>
              </div>
            </div>

            {/* LISTADO */}
            <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                📋 Registros Recientes
              </h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {minutas.length === 0 ? (
                  <p className="text-slate-500 text-center py-10">No hay registros aún</p>
                ) : (
                  minutas.map((minuta) => (
                    <MinutaCard key={minuta.id} minuta={minuta} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: CÁMARA Y FIRMA */}
          <div className="space-y-6">
            <CameraLive />
            <SignatureCanvas firma={firma} setFirma={setFirma} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MinutaCard({ minuta }) {
  const fecha = minuta.timestamp ? new Date(minuta.timestamp.toDate()).toLocaleString() : '...'
  return (
    <div className="bg-slate-900/50 p-5 rounded-2xl border-l-4 border-blue-500 hover:bg-slate-900 transition group">
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-blue-400">{minuta.ubicacion || 'Puesto General'}</span>
        <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase tracking-wider">
          {minuta.dispositivo}
        </span>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed mb-4">{minuta.observaciones}</p>
      {minuta.firma && (
        <div className="mb-4">
           <img src={minuta.firma} alt="Firma" className="h-16 w-auto object-contain bg-white/5 rounded-lg p-1" />
        </div>
      )}
      <div className="text-[10px] text-slate-500 flex items-center gap-1">
        <span>🕒</span> {fecha}
      </div>
    </div>
  )
}

export default App
