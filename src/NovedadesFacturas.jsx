import { useState, useEffect } from 'react'
import { db } from './firebase'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore'
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Users, 
  Calendar, 
  MapPin, 
  Hash,
  Download,
  FileText,
  TrendingUp
} from 'lucide-react'

export default function NovedadesFacturas() {
  const [cajeras, setCajeras] = useState([])
  const [novedades, setNovedades] = useState([])
  const [showAddCajera, setShowAddCajera] = useState(false)
  
  // Form estados
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    cajeraId: '',
    sitio: '',
    cantidad: 0
  })

  // Cajera form estados
  const [cajeraForm, setCajeraForm] = useState({ nombre: '', apellido: '' })

  // Filtros
  const [filterCajera, setFilterCajera] = useState('')
  const [filterMes, setFilterMes] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM

  useEffect(() => {
    const unsubscribeCajeras = onSnapshot(collection(db, 'cajeras'), (snapshot) => {
      setCajeras(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    const q = query(collection(db, 'novedades_facturas'), orderBy('fecha', 'desc'))
    const unsubscribeNovedades = onSnapshot(q, (snapshot) => {
      setNovedades(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return () => {
      unsubscribeCajeras()
      unsubscribeNovedades()
    }
  }, [])

  // Eliminar el useEffect que calculaba la cantidad automáticamente
  
  const handleAddCajera = async (e) => {
    e.preventDefault()
    if (!cajeraForm.nombre || !cajeraForm.apellido) return alert('Complete los campos')
    try {
      await addDoc(collection(db, 'cajeras'), {
        nombre: cajeraForm.nombre,
        apellido: cajeraForm.apellido,
        nombreCompleto: `${cajeraForm.nombre} ${cajeraForm.apellido}`
      })
      setCajeraForm({ nombre: '', apellido: '' })
      setShowAddCajera(false)
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleSaveNovedad = async (e) => {
    e.preventDefault()
    if (!formData.cajeraId || !formData.sitio) return alert('Complete los campos')
    
    const cajera = cajeras.find(c => c.id === formData.cajeraId)
    
    try {
      if (editId) {
        await updateDoc(doc(db, 'novedades_facturas', editId), {
          ...formData,
          cajeraNombre: cajera.nombreCompleto,
          updatedAt: serverTimestamp()
        })
        setEditId(null)
      } else {
        await addDoc(collection(db, 'novedades_facturas'), {
          ...formData,
          cajeraNombre: cajera.nombreCompleto,
          createdAt: serverTimestamp()
        })
      }
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        cajeraId: '',
        sitio: '',
        cantidad: 0
      })
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (novedad) => {
    setEditId(novedad.id)
    setFormData({
      fecha: novedad.fecha,
      cajeraId: novedad.cajeraId,
      sitio: novedad.sitio,
      cantidad: novedad.cantidad
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta novedad?')) {
      await deleteDoc(doc(db, 'novedades_facturas', id))
    }
  }

  // Filtrado de novedades para la tabla
  const filteredNovedades = novedades.filter(n => {
    const matchCajera = filterCajera ? n.cajeraId === filterCajera : true
    const matchMes = filterMes ? n.fecha.startsWith(filterMes) : true
    return matchCajera && matchMes
  })

  const totalGeneral = novedades.reduce((sum, item) => sum + (item.cantidad || 0), 0)
  const totalMes = filteredNovedades.reduce((sum, item) => sum + (item.cantidad || 0), 0)

  const handlePrint = () => {
    const mesNombre = new Date(filterMes + '-02').toLocaleString('es-ES', { month: 'long', year: 'numeric' })
    const cajera = cajeras.find(c => c.id === filterCajera)
    const scope = cajera ? `de ${cajera.nombreCompleto}` : 'de todas las cajeras'
    
    if (!window.confirm(`¿Desea imprimir el reporte ${scope} para el mes de ${mesNombre}?`)) return

    // CREAR UN DOCUMENTO DE IMPRESIÓN LIMPIO EN UN IFRAME
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    
    const html = `
      <html>
        <head>
          <title>Reporte Novedades - ${mesNombre}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { margin: 0; color: #1e3a8a; font-size: 20pt; }
            .info { margin-bottom: 20px; font-size: 12pt; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 10pt; word-wrap: break-word; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
            .total-box { border: 2px solid #1e3a8a; padding: 10px; border-radius: 5px; font-weight: bold; width: 45%; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REPORTE DE NOVEDADES DE FACTURA</h1>
          </div>
          <div class="info">
            <strong>Mes:</strong> <span style="text-transform: capitalize;">${mesNombre}</span><br>
            ${cajera ? `<strong>Cajera:</strong> ${cajera.nombreCompleto}` : '<strong>Reporte:</strong> Todas las cajeras'}
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Fecha</th>
                <th style="width: 25%;">Cajera</th>
                <th style="width: 40%;">Sitio / Puesto</th>
                <th style="width: 20%; text-align: center;">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${filteredNovedades.map(n => `
                <tr>
                  <td>${n.fecha}</td>
                  <td>${n.cajeraNombre}</td>
                  <td>${n.sitio}</td>
                  <td style="text-align: center;">${n.cantidad}</td>
                </tr>
              `).join('')}
              ${filteredNovedades.length === 0 ? '<tr><td colspan="4" style="text-align: center;">No hay registros</td></tr>' : ''}
            </tbody>
          </table>
          <div class="footer">
            <div class="total-box">TOTAL MES: ${totalMes} Incidencias</div>
            <div class="total-box">TOTAL GENERAL: ${totalGeneral} Acumuladas</div>
          </div>
          <p style="text-align: center; font-size: 8pt; color: #666; margin-top: 50px;">
            Generado por Sistema Minuta Digital - ${new Date().toLocaleString()}
          </p>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="bg-slate-800/40 p-8 rounded-[2rem] border border-slate-700/50 backdrop-blur-md no-print">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <FileText className="text-blue-400" /> NOVEDADES <span className="text-blue-400">FACTURAS</span>
        </h1>
        <p className="text-slate-400 font-medium">Registro y control de incidencias en facturación</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        {/* FORMULARIO */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-slate-800/30 p-8 rounded-[2rem] border border-slate-700/50 shadow-xl backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center justify-between text-white">
              <span className="flex items-center gap-3">
                <Plus className="text-blue-400" /> {editId ? 'Editar Novedad' : 'Nueva Novedad'}
              </span>
              <button 
                onClick={() => setShowAddCajera(!showAddCajera)}
                className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all"
              >
                <Users size={14} /> Gestión Cajeras
              </button>
            </h2>

            {showAddCajera && (
              <form onSubmit={handleAddCajera} className="mb-8 p-4 bg-slate-900/50 rounded-2xl border border-blue-500/30 space-y-4">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Agregar Cajera</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Nombre"
                    value={cajeraForm.nombre}
                    onChange={(e) => setCajeraForm({...cajeraForm, nombre: e.target.value})}
                    className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 ring-blue-500"
                  />
                  <input
                    placeholder="Apellido"
                    value={cajeraForm.apellido}
                    onChange={(e) => setCajeraForm({...cajeraForm, apellido: e.target.value})}
                    className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-600 py-2 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all">Guardar</button>
                  <button type="button" onClick={() => setShowAddCajera(false)} className="px-4 bg-slate-700 py-2 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all">Cancelar</button>
                </div>
              </form>
            )}

            <form onSubmit={handleSaveNovedad} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Fecha</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-2xl focus:ring-2 ring-blue-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cajera</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <select
                    value={formData.cajeraId}
                    onChange={(e) => setFormData({...formData, cajeraId: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-2xl focus:ring-2 ring-blue-500/50 outline-none appearance-none"
                  >
                    <option value="">Seleccione Cajera...</option>
                    {cajeras.map(c => (
                      <option key={c.id} value={c.id}>{c.nombreCompleto}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Sitio / Puesto</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    placeholder="Ej: Caja 1, Recepción..."
                    value={formData.sitio}
                    onChange={(e) => setFormData({...formData, sitio: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-2xl focus:ring-2 ring-blue-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cantidad de Novedades</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value) || 0})}
                    placeholder="Ingrese cantidad..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-2xl focus:ring-2 ring-blue-500/50 outline-none font-bold text-blue-400"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all text-white shadow-lg active:scale-95"
                >
                  <Save size={20} />
                  {editId ? 'ACTUALIZAR' : 'GUARDAR NOVEDAD'}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null)
                      setFormData({ fecha: new Date().toISOString().split('T')[0], cajeraId: '', sitio: '', cantidad: 0 })
                    }}
                    className="px-6 bg-slate-700 hover:bg-slate-600 rounded-2xl transition-all"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>

        {/* TABLA Y FILTROS */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-slate-800/30 p-8 rounded-[2rem] border border-slate-700/50 shadow-xl backdrop-blur-sm overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                <Search className="text-blue-400" /> Historial & Búsqueda
              </h2>
              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={filterCajera}
                  onChange={(e) => setFilterCajera(e.target.value)}
                  className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 ring-blue-500"
                >
                  <option value="">Todas las Cajeras</option>
                  {cajeras.map(c => (
                    <option key={c.id} value={c.id}>{c.nombreCompleto}</option>
                  ))}
                </select>
                <input
                  type="month"
                  value={filterMes}
                  onChange={(e) => setFilterMes(e.target.value)}
                  className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Fecha</th>
                    <th className="pb-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Cajera</th>
                    <th className="pb-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Sitio</th>
                    <th className="pb-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-center">Cant. Ingresada</th>
                    <th className="pb-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-center">Acumulado Total</th>
                    <th className="pb-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredNovedades.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500 italic">No se encontraron registros</td>
                    </tr>
                  ) : (
                    filteredNovedades.map((n) => {
                      // Calcular el acumulado histórico de esta cajera hasta esta fecha (inclusive)
                      const acumuladoCajera = novedades
                        .filter(item => item.cajeraId === n.cajeraId && item.fecha <= n.fecha)
                        .reduce((sum, item) => sum + (item.cantidad || 0), 0)

                      return (
                        <tr key={n.id} className="group hover:bg-slate-700/20 transition-colors">
                          <td className="py-4 text-sm font-medium text-slate-300">{n.fecha}</td>
                          <td className="py-4 text-sm font-bold text-white">{n.cajeraNombre}</td>
                          <td className="py-4 text-sm text-slate-400">{n.sitio}</td>
                          <td className="py-4 text-center">
                            <span className="text-slate-300 font-medium">
                              {n.cantidad}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">
                              {acumuladoCajera}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleEdit(n)}
                                className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDelete(n.id)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* TOTALES */}
            <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <div className="bg-slate-900/80 px-6 py-3 rounded-2xl border border-slate-700 flex items-center gap-4">
                  <div className="bg-blue-500/20 p-2 rounded-xl">
                    <Calendar className="text-blue-400" size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total del Mes</span>
                    <span className="text-xl font-black text-white">{totalMes} <span className="text-sm font-medium text-slate-400 ml-1">Incidencias</span></span>
                  </div>
                </div>
                <div className="bg-slate-900/80 px-6 py-3 rounded-2xl border border-slate-700 flex items-center gap-4">
                  <div className="bg-emerald-500/20 p-2 rounded-xl">
                    <TrendingUp className="text-emerald-400" size={18} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total General</span>
                    <span className="text-xl font-black text-white">{totalGeneral} <span className="text-sm font-medium text-slate-400 ml-1">Acumuladas</span></span>
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                onClick={handlePrint}
              >
                <Download size={20} /> Imprimir Reporte
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
