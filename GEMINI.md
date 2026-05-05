# 🛡️ Proyecto Minuta Vigilante Digital

Sistema moderno de gestión de novedades y control de vigilancia para oficiales de seguridad. Desarrollado con **React**, **Vite**, **Tailwind CSS v4** y **Firebase**.

## 🚀 Estado Actual del Proyecto

- **Firebase Firestore:** Conectado y operativo para guardar minutas en tiempo real.
- **Cámara Live:** Captura de evidencias fotográficas con compresión automática para optimizar el almacenamiento (<100KB).
- **Firma Digital:** Lienzo de firma calibrado con precisión de coordenadas y bloqueo de scroll para uso en móviles.
- **Exportación PDF:** Generación de reportes profesionales que incluyen texto, fotografía y firma.
- **Responsive Design:** Interfaz oscura (dark mode) optimizada para dispositivos móviles con soporte HTTPS.

---

## 🗺️ Plan de Expansión (Próximas Fases)

Para convertir esta herramienta en un sistema completo de gestión de seguridad privada, se proponen los siguientes cambios:

### 1. Sistema de Autenticación (Inicio de Sesión)
- **Tecnología:** Usar **Firebase Authentication**.
- **Función:** Cada oficial tendrá su propio usuario y contraseña (o código de empleado).
- **Seguridad:** Los registros guardarán automáticamente el nombre del oficial que inició la sesión, evitando suplantaciones.

### 2. Gestión de Turnos (Entrega y Recepción)
- **Botón "Recibir Guardia":**
  - Obligatorio al iniciar el turno.
  - Verifica el estado de los equipos (radios, linternas, llaves).
  - Foto del estado del puesto al recibir.
- **Botón "Entregar Guardia":**
  - Genera un resumen de las novedades del turno.
  - Requiere firma de quien entrega y quien recibe.
  - Genera un PDF automático de "Acta de Entrega".

### 3. Libro de Novedades Digital (Libro de Actas)
- **Categorización:** Botones rápidos para novedades comunes:
  - 🟢 **Ronda Realizada** (con GPS).
  - 🟡 **Visita Técnica.**
  - 🔴 **Incidente Crítico** (activa alerta inmediata).
- **Búsqueda:** Filtro por fechas o por tipo de novedad para auditorías rápidas.

### 4. Botón de Auxilio (Pánico / Ayuda)
- **Función:** Un botón rojo prominente que, al presionarlo:
  - Envía la ubicación GPS exacta al supervisor.
  - Activa una alerta visual en el dashboard de monitoreo.
  - Graba 10 segundos de audio automáticamente.

### 5. Inventario de Puesto
- Checklist digital de los elementos de seguridad presentes en el puesto de vigilancia.

---

## 🛠️ Instrucciones para el Desarrollador (Gemini CLI)

1. **Prioridad 1:** Implementar Firebase Auth para segregar los datos por usuario.
2. **Prioridad 2:** Crear la colección `turnos` en Firestore para registrar aperturas y cierres.
3. **Mantenimiento:** Mantener siempre la compresión de imágenes para no exceder los límites de Firestore (1MB).
4. **Validación:** No permitir guardar novedades si el oficial no ha "Recibido Guardia" previamente.

---

*Este documento sirve como guía oficial para la evolución del sistema MinutaVigilante.*
