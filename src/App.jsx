import { useState, useEffect } from 'react'
import { Camera, MapPin, Save, ShieldCheck, ClipboardList, TrendingUp } from 'lucide-react'
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
  const [foto, setFoto] = useState('') // ESTADO PARA LA FOTO
  const [minutas, setMinutas] = useState([])
  const [stats, setStats] = useState({ total: 0, hoy: 0 })
  const [loading, setLoading] = useState(false)

  const getGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUbicacion(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
      () => alert('Por favor activa el GPS en tu dispositivo')
    )
  }

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

  const guardarMinuta = async () => {
    if (!observaciones.trim()) return alert('⚠️ Escribe las observaciones')
    if (!firma) return alert('⚠️ Falta la firma digital')
    
    setLoading(true)
    try {
      await addDoc(collection(db, 'minutas'), {
        ubicacion,
        observaciones,
        firma,
        foto, // GUARDAR LA FOTO EN FIREBASE
        timestamp: serverTimestamp(),
        dispositivo: /iPhone|Android|iPad/i.test(navigator.userAgent) ? 'Móvil' : 'PC'
      })
      setObservaciones('')
      setFirma('')
      setFoto('')
      alert('✅ Registro guardado exitosamente')
    } catch (error) {
      alert('❌ Error al guardar: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
        
        {/* HEADER MODERNO */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-slate-800/40 p-8 rounded-[2rem] border border-slate-700/50 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                MINUTA <span className="text-blue-400">DIGITAL</span>
              </h1>
              <p className="text-slate-400 font-medium">Control de Vigilancia & Seguridad</p>
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700 text-center">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Registros</span>
              <span className="text-2xl font-black text-blue-400">{stats.total}</span>
            </div>
            <div className="flex-1 md:flex-none bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700 text-center">
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Registros Hoy</span>
              <span className="text-2xl font-black text-emerald-400">{stats.hoy}</span>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* PANEL IZQUIERDO: FORMULARIO (7 COLUMNAS) */}
          <section className="lg:col-span-7 space-y-8">
            <div className="bg-slate-800/30 p-8 rounded-[2rem] border border-slate-700/50 shadow-xl backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                <ClipboardList className="text-blue-400" /> Nueva Novedad
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="relative flex-1 group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                    <input
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      placeholder="Ubicación o Puesto"
                      className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl focus:ring-2 ring-blue-500/50 outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>
                  <button 
                    onClick={getGPS} 
                    title="Obtener ubicación real"
                    className="bg-slate-700 hover:bg-slate-600 p-4 rounded-2xl transition-all shadow-lg active:scale-95"
                  >
                    <MapPin size={24} />
                  </button>
                </div>
                
                <div className="relative group">
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Escriba los detalles de la novedad aquí..."
                    rows="5"
                    className="w-full p-6 bg-slate-950/50 border border-slate-700 rounded-3xl focus:ring-2 ring-blue-500/50 outline-none resize-none transition-all placeholder:text-slate-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={guardarMinuta}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                  >
                    <Save size={24} />
                    {loading ? 'PROCESANDO...' : 'GUARDAR REGISTRO'}
                  </button>
                  <PDFExport minutas={minutas} />
                </div>
              </div>
            </div>

            {/* LISTADO DE REGISTROS */}
            <div className="bg-slate-800/30 rounded-[2rem] p-8 border border-slate-700/50 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                  <TrendingUp className="text-blue-400" /> Historial Reciente
                </h2>
                <span className="text-xs font-bold text-slate-500 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700 uppercase tracking-widest">
                  Actualización en Vivo
                </span>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {minutas.length === 0 ? (
                  <div className="text-center py-20 bg-slate-950/20 rounded-3xl border border-dashed border-slate-700">
                    <p className="text-slate-500 font-medium">No se han encontrado registros en la base de datos</p>
                  </div>
                ) : (
                  minutas.map((minuta) => (
                    <MinutaCard key={minuta.id} minuta={minuta} />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* PANEL DERECHO: MULTIMEDIA (5 COLUMNAS) */}
          <aside className="lg:col-span-5 space-y-8">
            <CameraLive foto={foto} setFoto={setFoto} />
            <SignatureCanvas firma={firma} setFirma={setFirma} />
            
            {/* FOOTER / INFO */}
            <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10 text-center">
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">
                Sistema de Minuta Digital v2.0 <br/>
                Protección de Datos & Firma Encriptada
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}

function MinutaCard({ minuta }) {
  const fecha = minuta.timestamp ? new Date(minuta.timestamp.toDate()).toLocaleString() : '...'
  return (
    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-900/60 transition-all group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-black text-white tracking-wide uppercase text-xs">{minuta.ubicacion || 'PUESTO GENERAL'}</span>
        </div>
        <span className="text-[9px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 font-bold uppercase tracking-widest">
          {minuta.dispositivo || 'SISTEMA'}
        </span>
      </div>
      
      <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">{minuta.observaciones}</p>
      
      <div className="flex items-end justify-between gap-4">
        <div className="flex gap-2">
          {minuta.firma && (
            <div className="bg-white/95 p-2 rounded-xl shadow-inner border border-slate-200">
              <img src={minuta.firma} alt="Firma" className="h-10 w-auto object-contain grayscale contrast-125" />
            </div>
          )}
          {minuta.foto && (
            <div className="bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-700">
              <img src={minuta.foto} alt="Captura" className="h-10 w-auto object-cover rounded-lg" />
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Fecha de Registro</div>
          <div className="text-[11px] text-blue-400 font-mono">{fecha}</div>
        </div>
      </div>
    </div>
  )
}

export default App
