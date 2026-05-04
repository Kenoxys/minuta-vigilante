import { FileText, Download } from 'lucide-react'
import jsPDF from 'jspdf'

export default function PDFExport({ minutas }) {
  const exportPDF = () => {
    if (minutas.length === 0) return alert('No hay minutas para exportar');
    
    const doc = new jsPDF()
    
    // Configuración estética
    doc.setFillColor(30, 41, 59); // Color Slate-800
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('REPORTE DE MINUTAS DIGITALES', 20, 25);
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 35);
    
    let y = 60;
    doc.setTextColor(0, 0, 0);

    minutas.forEach((minuta, i) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${i + 1}. Puesto: ${minuta.ubicacion || 'General'}`, 20, y);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Fecha: ${minuta.timestamp?.toDate().toLocaleString() || 'N/A'}`, 20, y + 7);
      
      const lines = doc.splitTextToSize(`Novedad: ${minuta.observaciones}`, 170);
      doc.text(lines, 20, y + 14);
      
      y += 20 + (lines.length * 5);
      
      // Línea divisoria
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y - 5, 190, y - 5);
    });
    
    doc.save(`Reporte-Minutas-${Date.now()}.pdf`);
    alert('✅ PDF Generado');
  }

  return (
    <button
      onClick={exportPDF}
      className="flex-1 bg-slate-700 hover:bg-slate-600 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition"
    >
      <Download size={20} /> PDF
    </button>
  )
}
