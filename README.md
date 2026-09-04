# Academia Oficial Rayo Vallecano Provincia de Alicante — Landing PPDF® | Signature Experience

Landing de captación (one-page) para la **Signature Experience** de la Academia Oficial
Rayo Vallecano Provincia de Alicante. El formulario de cualificación envía los leads a
un webhook de **n8n**, que clasifica el calor (🔥/🟡/⚪) y escribe en el CRM.

> Del 6 al 31 de julio · Provincia de Alicante · 17:30–19:00 / 19:00–20:30 · L-V.

## Stack

- **HTML estático + CSS propio** (con design tokens, sin paso de build).
- **JS vanilla** (sin dependencias) para nav, animaciones y envío del form.
- Fuentes: **Anton** (titulares) + **Inter** (texto), vía Google Fonts.
- Deploy: **Vercel** (sitio estático, sin build command).

No usa React/Vite ni Tailwind: es deliberadamente ligero y autocontenido. Se previsualiza
abriendo `index.html` directamente o sirviendo la carpeta.

## Desarrollo local

```bash
npm run dev        # sirve en http://localhost:5173 (npx serve)
# o simplemente abre index.html en el navegador
```

## Configuración del formulario (n8n)

La URL del webhook y el teléfono están centralizados en `assets/js/main.js`:

```js
var CONFIG = {
  WEBHOOK_URL: 'https://reformaspro.app.n8n.cloud/webhook/rayo-signature', // ← cámbialo
  WHATSAPP_NUMBER: '34669773531',
  ORIGEN: 'landing-signature'
};
```

- El form hace `POST` JSON con todos los campos crudos (la lógica de scoring vive en n8n).
- Anti-spam: campo honeypot `hp` (debe llegar vacío; si viene relleno, n8n lo descarta).
- n8n debe responder **200** (idealmente `{ "ok": true }`). Si hay CORS, añade en el nodo
  "Respond to Webhook" la cabecera `Access-Control-Allow-Origin: *`. **No** usar `mode:'no-cors'`.

### Payload de ejemplo

```json
{
  "nombre": "Marcos López",
  "telefono": "+34 600 000 000",
  "email": "marcos@email.com",
  "edad_nino": "11-13",
  "horario": "19:00-20:30",
  "cuando_empezar": "Quiero reservar ya",
  "modalidad": "Membership (20 sesiones)",
  "consentimiento": true,
  "origen": "landing-signature",
  "tipo": "Lead Academia",
  "source": "Landing · Signature Experience · Rayo Alicante",
  "fuenteUrl": "https://.../",
  "timestamp": "2026-07-01T10:00:00.000Z"
}
```

### Scoring (lo ejecuta n8n, aquí solo de referencia)

- `cuando_empezar`: "Quiero reservar ya" = +3 · "Este julio" = +2 · "Solo busco información" = 0
- `modalidad`: "Membership (20 sesiones)" = +2 · "Sesión suelta" = +1 · "No lo sé todavía" = 0
- Resultado: ≥5 → 🔥 Caliente · 2–4 → 🟡 Templado · <2 → ⚪ Frío.

## Imágenes

- `assets/img/escudo-academia.png` — escudo completo (fondo transparente), para fondos claros.
- `assets/img/escudo-mark.png` — solo el escudo (sin texto), para fondos oscuros / watermark.
- `assets/img/favicon.svg` — favicon (rayo rojo).

**Para añadir fotos reales** de entrenamiento: déjalas en `assets/img/` y sustituye los
bloques `.split__media` (Family / Report) y el fondo del `.hero` por `<img>` o
`background-image`. Diseñado para verse premium con o sin fotos.

## Voz de marca

Todo el copy sigue la skill `academia-rayo-voz`: nombre oficial completo, vocabulario
aprobado (formación de máximo nivel, atención personalizada, número de participantes
estrictamente limitado) y términos prohibidos evitados (sin "alto rendimiento", sin
"escuela de verano", sin "plazas casi agotadas").

## Deploy en Vercel

```bash
npx vercel           # preview
npx vercel --prod    # producción
```

Sitio estático: Vercel sirve la raíz tal cual (`cleanUrls` activado en `vercel.json`).
