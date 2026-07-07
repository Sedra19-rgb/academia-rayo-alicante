/* =====================================================================
   Academia Oficial Rayo Vallecano Provincia de Alicante
   tracking.js — captura de UTMs + evento Lead de Meta Pixel
   Se carga ANTES de main.js. Expone window.ARVTracking.
   ===================================================================== */
(function (w) {
  'use strict';

  var KEY = 'arv_utms';
  var FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

  /* Lee los UTMs/fbclid de la URL y los guarda en sessionStorage.
     Solo persiste si vienen en la URL: en navegaciones internas (sin query)
     NO sobrescribe lo ya guardado. sessionStorage a propósito (no localStorage):
     no contamina futuras visitas de otra campaña. */
  function captureUtms() {
    try {
      var q = new w.URLSearchParams(w.location.search);
      var found = {};
      var has = false;
      FIELDS.forEach(function (k) {
        var v = q.get(k);
        if (v) { found[k] = v; has = true; }
      });
      if (has) {
        w.sessionStorage.setItem(KEY, JSON.stringify(found));
      }
    } catch (e) { /* sessionStorage bloqueado (modo privado, etc.): no rompemos nada */ }
  }

  function getUtms() {
    try {
      var raw = w.sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) || {}) : {};
    } catch (e) { return {}; }
  }

  /* Dispara el evento Lead de Meta Pixel. Guard: si fbq no existe
     (adblock / pixel bloqueado / aún cargando) no hace nada y NO lanza error. */
  function trackLead() {
    if (typeof w.fbq === 'function') {
      w.fbq('track', 'Lead');
    }
  }

  w.ARVTracking = { captureUtms: captureUtms, getUtms: getUtms, trackLead: trackLead };
})(window);
