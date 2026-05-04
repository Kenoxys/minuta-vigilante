import { FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function PDFExport({ minutas }) {
  const exportPDF = async () => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('Minuta Digital PRO - Reporte', 20, 30)
    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 20, 45)
    
    let y = 60
    minutas.slice(0, 20).forEach((minuta, i) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      
      doc.setFontSize(12)
      doc.text(`${i+1}. ${minuta.ubicacion}`, 20, y)
      doc.setFontSize(9)
      doc.text(minuta.observaciones.substring(0, 100) + '...', 20, y + 6)
      doc.text(new Date(minuta.timestamp?.toDate()).toLocaleString('es-MX'), 20, y + 12)
      y += 20
    })
    
    doc.save(`minutas-${Date.now()}.pdf`)
  }

  return (
    <button
      onClick={exportPDF}
      class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 p-4 rounded-2xl font-semibold shadow-xl transition-all flex items-center justify-center gap-2"
    >
      <FileText size={20} />
      Export PDF
    </button>
  )
}
