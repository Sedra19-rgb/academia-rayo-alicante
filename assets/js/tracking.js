/* =====================================================================
   Academia Oficial Rayo Vallecano Provincia de Alicante
   tracking.js — consentimiento (RGPD) + Meta Pixel + UTMs + evento Lead
   Se carga ANTES de main.js. Expone window.ARVTracking.
   IMPORTANTE: el pixel NO se carga hasta que el usuario acepta cookies.
   ===================================================================== */
(function (w) {
  'use strict';

  var UTM_KEY = 'arv_utms';
  var CONSENT_KEY = 'arv_consent';
  var FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

  /* ---------- UTMs (sessionStorage: no contamina futuras visitas) ---------- */
  function captureUtms() {
    try {
      var q = new w.URLSearchParams(w.location.search);
      var found = {}, has = false;
      FIELDS.forEach(function (k) { var v = q.get(k); if (v) { found[k] = v; has = true; } });
      if (has) { w.sessionStorage.setItem(UTM_KEY, JSON.stringify(found)); }
    } catch (e) { /* sessionStorage bloqueado: no rompemos nada */ }
  }
  function getUtms() {
    try { var raw = w.sessionStorage.getItem(UTM_KEY); return raw ? (JSON.parse(raw) || {}) : {}; }
    catch (e) { return {}; }
  }

  /* ---------- Meta Pixel (se inyecta SOLO tras consentimiento) ---------- */
  function loadMetaPixel() {
    if (w.fbq || !w.ARV_PIXEL_ID) return; // ya cargado o sin ID configurado
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(w, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    w.fbq('init', w.ARV_PIXEL_ID);
    w.fbq('track', 'PageView');
  }

  /* Evento Lead. Guard: si fbq no existe (sin consentimiento / adblock) no hace nada. */
  function trackLead() {
    if (typeof w.fbq === 'function') { w.fbq('track', 'Lead'); }
  }

  /* ---------- Consentimiento de cookies (RGPD) ---------- */
  function getConsent() { try { return w.localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function setConsent(v) { try { w.localStorage.setItem(CONSENT_KEY, v); } catch (e) {} }

  function initConsent() {
    var consent = getConsent();
    if (consent === 'granted') { loadMetaPixel(); return; } // ya aceptó en una visita previa
    if (consent === 'denied') { return; }                   // ya rechazó: no cargamos pixel
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    var accept = document.getElementById('cookie-accept');
    var reject = document.getElementById('cookie-reject');
    if (accept) accept.addEventListener('click', function () { setConsent('granted'); loadMetaPixel(); banner.hidden = true; });
    if (reject) reject.addEventListener('click', function () { setConsent('denied'); banner.hidden = true; });
    banner.hidden = false; // mostrar solo si no hay decisión previa
  }

  w.ARVTracking = {
    captureUtms: captureUtms,
    getUtms: getUtms,
    trackLead: trackLead,
    initConsent: initConsent,
    loadMetaPixel: loadMetaPixel
  };
})(window);
