# Kemet Royal

Landing page en español con estética egipcia, React, Vite y Three.js. Incluye las cinco secciones solicitadas, los cinco modelos originales optimizados y una construcción progresiva del templo al hacer scroll.

## Ejecutar

Requiere Node.js 22.12 o superior.

```bash
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://localhost:5173`.

```bash
npm run build    # Genera dist/ para un alojamiento estático
npm run preview  # Previsualiza la versión de producción
npm test         # Pruebas funcionales con Playwright
```

Para ejecutar las pruebas por primera vez: `npx playwright install chromium`.

## Experiencia

- Hero con el complejo arquitectónico 3D: arrastrar para girar, rotación automática opcional, restablecimiento y pantalla completa cuando el navegador la admite.
- Colección interactiva: estatua de Nefertiti, Ojo de Horus, pirámide y papiro.
- Arquitectura con tres etapas vinculadas al scroll y seleccionables por botones o teclado. El modelo original es una sola malla: la construcción se representa mediante un corte horizontal progresivo.
- Gastronomía de autor y los cuatro momentos del ritual de servicio.
- Menú móvil, navegación por teclado, movimiento reducido, carga diferida de modelos y vistas estáticas de respaldo cuando WebGL no está disponible.

## Reservas

El formulario valida y prepara los detalles de una visita. Permite descargar un recordatorio personal `.ics`; **no envía solicitudes ni confirma reservas**. Para recibir reservas reales falta conectar un servicio o el canal oficial del establecimiento. No se inventaron horarios de apertura, teléfono, dirección exacta ni disponibilidad. Los datos permanecen en memoria y se descartan al recargar la página.

## Recursos

- `Models3D/`: carpeta opcional para los archivos originales; no se distribuye en el repositorio. Solo es necesaria para regenerar los modelos optimizados.
- `public/models/`: cinco GLB estándar optimizados, unos 14 MB en total frente a 557 MB originales, y posters transparentes renderizados de esos mismos modelos. [Detalles](public/models/README.md).
- `scripts/optimize-models.mjs`: proceso reproducible de optimización; requiere colocar previamente los cinco archivos originales en `Models3D/`. La página funciona directamente con los modelos optimizados incluidos.
- `public/images/royal-banquet.webp`: fotografía gastronómica ilustrativa generada con la herramienta integrada de imágenes. [Prompt y procedencia](docs/image-assets.md).
- Fuentes Cormorant Garamond y Manrope alojadas localmente mediante Fontsource. Iconos Lucide y motivos SVG propios.

El contenido editorial procede de la descripción suministrada. La imagen gastronómica es ilustrativa; no representa una fotografía real del establecimiento.
