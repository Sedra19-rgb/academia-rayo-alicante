/* =====================================================================
   Academia Oficial Rayo Vallecano Provincia de Alicante
   PPDF® · Signature Experience — interacciones
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     CONFIG — cámbialo aquí
     ------------------------------------------------------------------
     WEBHOOK_URL: endpoint de n8n al que se envía el lead (POST JSON).
     La clasificación 🔥/🟡/⚪ y el guardado en CRM viven en n8n,
     NO en este front. Crea el webhook en tu instancia de n8n y pega
     aquí la URL definitiva.
  */
  var CONFIG = {
    WEBHOOK_URL: 'https://reformaspro.app.n8n.cloud/webhook/academia-rayo-signature',
    WHATSAPP_NUMBER: '34669773531',
    ORIGEN: 'landing-signature'
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Año dinámico ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Header sticky (sombra al hacer scroll) ---------- */
  var header = $('.header');
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  var burger = $('.burger');
  var menu = $('#mobile-menu');
  var toggleMenu = function (force) {
    if (!burger || !menu) return;
    var open = typeof force === 'boolean' ? force : !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  if (burger) burger.addEventListener('click', function () { toggleMenu(); });
  if (menu) $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { toggleMenu(false); }); });

  /* ---------- Reveal on scroll (con stagger por sección) ---------- */
  var reveals = $$('.reveal');
  // stagger: retraso incremental entre hermanos de un mismo contenedor
  var groups = new Map();
  reveals.forEach(function (el) {
    var p = el.parentElement;
    var arr = groups.get(p) || [];
    el.style.transitionDelay = Math.min(arr.length * 70, 420) + 'ms';
    arr.push(el);
    groups.set(p, arr);
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Formulario → n8n ---------- */
  var form = $('#lead-form');
  if (form) {
    var btn = $('#submit-btn');
    var msg = $('#form-msg');
    var card = form.parentElement;
    var success = $('#form-success');
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var showError = function (text) {
      if (!msg) return;
      msg.textContent = text;
      msg.classList.add('is-error');
    };
    var clearError = function () { if (msg) { msg.textContent = ''; msg.classList.remove('is-error'); } };

    var setLoading = function (on) {
      if (!btn) return;
      btn.classList.toggle('is-loading', on);
      btn.disabled = on;
      var label = $('.btn-label', btn);
      if (label) label.textContent = on ? 'Enviando…' : 'Reservar plaza';
    };

    var showSuccess = function (nombre) {
      var wa = $('#wa-btn');
      if (wa) {
        var txt = 'Hola, acabo de dejar mis datos para la Signature Experience de la Academia Rayo Vallecano Alicante' + (nombre ? ' (' + nombre + ')' : '') + '. Me gustaría reservar plaza.';
        wa.href = 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=' + encodeURIComponent(txt);
      }
      if (form) form.style.display = 'none';
      if (success) success.classList.add('is-on');
      if (success && success.scrollIntoView) success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      clearError();

      var data = {
        nombre: (form.nombre.value || '').trim(),
        telefono: (form.telefono.value || '').trim(),
        email: (form.email.value || '').trim(),
        edad_nino: form.edad_nino.value || '',
        horario: form.horario.value || '',
        cuando_empezar: form.cuando_empezar.value || '',
        modalidad: form.modalidad.value || '',
        consentimiento: !!form.consentimiento.checked,
        hp: (form.hp.value || '').trim()
      };

      // Honeypot: si está relleno, es un bot. Fingimos éxito y no enviamos.
      if (data.hp) { showSuccess(data.nombre); return; }

      // Validación mínima
      if (data.nombre.length < 2) { showError('Indícanos tu nombre, por favor.'); form.nombre.focus(); return; }
      if (data.telefono.replace(/\D/g, '').length < 9) { showError('Revisa el teléfono: necesitamos un número válido para llamarte.'); form.telefono.focus(); return; }
      if (!EMAIL_RE.test(data.email)) { showError('Revisa el email: no parece válido.'); form.email.focus(); return; }
      if (!data.edad_nino) { showError('Selecciona la edad del jugador/a.'); form.edad_nino.focus(); return; }
      if (!data.consentimiento) { showError('Necesitamos tu consentimiento para poder contactarte.'); form.consentimiento.focus(); return; }

      var payload = {
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email,
        edad_nino: data.edad_nino,
        horario: data.horario,
        cuando_empezar: data.cuando_empezar,
        modalidad: data.modalidad,
        consentimiento: true,
        origen: CONFIG.ORIGEN,
        tipo: 'Lead Academia',
        source: 'Landing · Signature Experience · Rayo Alicante',
        fuenteUrl: window.location.href,
        timestamp: new Date().toISOString()
      };

      setLoading(true);

      fetch(CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          // n8n responde 200 siempre; si devuelve {ok:false} lo tratamos como error.
          return res.json().catch(function () { return { ok: res.ok }; }).then(function (body) {
            return { ok: res.ok && body && body.ok !== false };
          });
        })
        .then(function (r) {
          setLoading(false);
          if (r.ok) {
            showSuccess(data.nombre);
          } else {
            showError('No hemos podido enviar tus datos. Inténtalo de nuevo o llámanos al +34 669 77 35 31.');
          }
        })
        .catch(function () {
          setLoading(false);
          showError('Ha habido un problema de conexión. Inténtalo de nuevo o llámanos al +34 669 77 35 31.');
        });
    });
  }
})();
