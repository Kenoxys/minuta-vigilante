import { FileText, Download } from 'lucide-react'
import jsPDF from 'jspdf'

export default function PDFExport({ minutas }) {
  const exportPDF = () => {
    if (minutas.length === 0) return alert('No hay minutas para exportar');
    
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // HEADER ESTILO SEGURIDAD
    doc.setFillColor(15, 23, 42); // Navy oscuro
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('REPORTE DE MINUTAS DIGITALES', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(`SISTEMA DE SEGURIDAD V2.0 - GENERADO: ${new Date().toLocaleString()}`, 20, 35);
    
    let y = 60;

    minutas.forEach((minuta, i) => {
      // Verificar si necesitamos nueva página (altura mínima para un registro con fotos es ~80)
      if (y > 220) {
        doc.addPage();
        y = 30;
      }
      
      // Fondo sutil para cada registro
      doc.setFillColor(248, 250, 252); 
      doc.roundedRect(15, y - 5, 180, 75, 3, 3, 'F');

      // Título del Registro
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${i + 1}. PUESTO: ${minuta.ubicacion || 'GENERAL'}`, 20, y + 2);
      
      // Fecha
      doc.setFontSize(9);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(100, 116, 139);
      const fecha = minuta.timestamp?.toDate ? minuta.timestamp.toDate().toLocaleString() : 'N/A';
      doc.text(`Fecha/Hora: ${fecha}`, 20, y + 8);
      
      // Observaciones
      doc.setTextColor(51, 65, 85);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(`NOVEDAD: ${minuta.observaciones}`, 170);
      doc.text(lines, 20, y + 15);
      
      let nextY = y + 15 + (lines.length * 5);

      // INSERTAR IMÁGENES (FOTO Y FIRMA)
      try {
        // Foto de la cámara (si existe)
        if (minuta.foto) {
          doc.setFontSize(8);
          doc.text("EVIDENCIA FOTOGRÁFICA:", 20, nextY + 5);
          doc.addImage(minuta.foto, 'JPEG', 20, nextY + 7, 50, 35); // 50x35mm
        }

        // Firma (si existe)
        if (minuta.firma) {
          doc.setFontSize(8);
          doc.text("FIRMA DIGITAL:", 130, nextY + 5);
          doc.addImage(minuta.firma, 'PNG', 130, nextY + 7, 40, 25); // 40x25mm
          // Línea de firma
          doc.setDrawColor(203, 213, 225);
          doc.line(130, nextY + 33, 170, nextY + 33);
        }
      } catch (err) {
        console.error("Error al añadir imagen al PDF:", err);
      }

      y = nextY + 45; // Espacio para el siguiente registro
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Página ${i} de ${pageCount} - Documento Privado y Confidencial`, pageWidth / 2, 285, { align: 'center' });
    }

    doc.save(`Reporte-Minutas-Seguridad-${Date.now()}.pdf`);
    alert('✅ Reporte PDF generado con evidencias visuales');
  }

  return (
    <button
      onClick={exportPDF}
      className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 p-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 border border-slate-600"
    >
      <Download size={20} className="text-blue-400" /> GENERAR PDF
    </button>
  )
}
