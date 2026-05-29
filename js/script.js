/* NAV */
const nav = document.getElementById('mainNav');
const onScroll = () => nav.classList.toggle('nav--scrolled', window.scrollY > 50);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* MOBILE MENU */
const mobileMenu = document.getElementById('mobileMenu');
const menuOpen   = document.getElementById('menuOpen');
const menuClose  = document.getElementById('menuClose');
const openMenu   = () => { mobileMenu.classList.add('is-open'); menuOpen.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; };
const closeMenu  = () => { mobileMenu.classList.remove('is-open'); menuOpen.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };
menuOpen.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

/* HERO PARALLAX — solo en dispositivos no táctiles para evitar jank en móvil */
const heroBg = document.getElementById('heroBg');
const heroEl = heroBg.parentElement;
let rafPending = false;
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
if (!isTouchDevice) {
    function applyParallax() {
        const sy = window.scrollY;
        if (sy < heroEl.offsetHeight + 200) heroBg.style.transform = `translateY(${sy * 0.32}px)`;
        rafPending = false;
    }
    window.addEventListener('scroll', () => { if (!rafPending) { rafPending = true; requestAnimationFrame(applyParallax); } }, { passive: true });
}

/* REVEAL */
const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* CAROUSEL */
const track = document.getElementById('carouselTrack');
const dots  = document.getElementById('carouselDots');
const cards = [...track.querySelectorAll('.service-card')];
let active = 0;
cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Ir al tratamiento ${i+1}`);
    d.setAttribute('aria-selected', i === 0);
    d.addEventListener('click', () => goTo(i));
    dots.appendChild(d);
});
function goTo(i) {
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    track.scrollTo({ left: cards[i].offsetLeft - pad, behavior: 'smooth' });
}
function syncDots() {
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    let nearest = 0, minD = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft - pad - track.scrollLeft); if (d < minD) { minD = d; nearest = i; } });
    if (nearest !== active) {
        dots.children[active].classList.remove('is-active');
        dots.children[active].setAttribute('aria-selected', 'false');
        dots.children[nearest].classList.add('is-active');
        dots.children[nearest].setAttribute('aria-selected', 'true');
        active = nearest;
    }
    document.getElementById('carouselPrev').disabled = active === 0;
    document.getElementById('carouselNext').disabled = active === cards.length - 1;
}
track.addEventListener('scroll', syncDots, { passive: true });
document.getElementById('carouselPrev').addEventListener('click', () => goTo(Math.max(0, active - 1)));
document.getElementById('carouselNext').addEventListener('click', () => goTo(Math.min(cards.length - 1, active + 1)));
syncDots();
let drag = false, startX, startSL;
track.addEventListener('mousedown', e => { drag = true; startX = e.pageX - track.offsetLeft; startSL = track.scrollLeft; track.classList.add('is-dragging'); e.preventDefault(); });
document.addEventListener('mousemove', e => { if (!drag) return; track.scrollLeft = startSL - (e.pageX - track.offsetLeft - startX) * 1.4; });
document.addEventListener('mouseup', () => { if (!drag) return; drag = false; track.classList.remove('is-dragging'); syncDots(); });

/* FORMULARIO */
const form    = document.getElementById('bookingForm');
const success = document.getElementById('formSuccess');
const dateInp = document.getElementById('date');
const btn     = form.querySelector('.form-submit');
const _today = new Date();
const _yyyy = _today.getFullYear();
const _mm = String(_today.getMonth() + 1).padStart(2, '0');
const _dd = String(_today.getDate()).padStart(2, '0');
dateInp.min = `${_yyyy}-${_mm}-${_dd}`;
const patterns = { email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ };
const errorMessages = {
    fname:   'Por favor ingresá tu nombre.',
    lname:   'Por favor ingresá tu apellido.',
    email:   'Ingresá un email válido (ej: nombre@email.com).',
    service: 'Seleccioná el tratamiento que te interesa.'
};
function setFieldError(field, msg) {
    const errEl = document.getElementById(field.id + '-error');
    field.style.borderColor = msg ? 'var(--terracotta)' : '';
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (errEl) errEl.textContent = msg || '';
}
function validateForm() {
    let isValid = true;
    form.querySelectorAll('[required]').forEach(field => {
        const empty = !field.value.trim();
        const emailInvalid = field.type === 'email' && field.value.trim() && !patterns.email.test(field.value);
        if (empty) {
            setFieldError(field, errorMessages[field.id] || 'Este campo es obligatorio.');
            isValid = false;
        } else if (emailInvalid) {
            setFieldError(field, errorMessages.email);
            isValid = false;
        } else {
            setFieldError(field, '');
        }
    });
    if (!isValid) form.querySelector('[aria-invalid="true"]')?.focus();
    return isValid;
}
form.querySelectorAll('input,select,textarea').forEach(field => {
    field.addEventListener('input', () => { if (field.value.trim()) setFieldError(field, ''); });
});
let isSubmitting = false;
form.addEventListener('submit', async e => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;
    isSubmitting = true;
    btn.textContent = 'Enviando…';
    btn.disabled = true;
    try {
        await new Promise(r => setTimeout(r, 800));
        form.style.display = 'none';
        success.classList.add('is-visible');
        success.focus();
        clearDraft();
    } catch {
        btn.textContent = 'Solicitar mi turno';
        btn.disabled = false;
        isSubmitting = false;
    }
});

/* ─── BACK TO TOP (#12) ──────────────────────────────────── */
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    backToTopBtn.classList.toggle('is-visible', window.scrollY > 400);
}, { passive: true });
backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ─── FORM DRAFT localStorage (#13) ─────────────────────── */
const DRAFT_KEY = 'bellebody_form_draft';
const draftFields = ['fname', 'lname', 'email', 'phone', 'service', 'date', 'message'];

function saveDraft() {
    const data = {};
    draftFields.forEach(id => { const el = document.getElementById(id); if (el) data[id] = el.value; });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}
function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
}
(function loadDraft() {
    try {
        const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
        if (!saved) return;
        draftFields.forEach(id => { const el = document.getElementById(id); if (el && saved[id]) el.value = saved[id]; });
    } catch { clearDraft(); }
})();
draftFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', saveDraft, { passive: true });
});

/* ─── LIGHTBOX GALERÍA (#14) ─────────────────────────────── */
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const galleryImgs     = [...document.querySelectorAll('.gallery-item img')];
let lbIndex = 0;

galleryImgs.forEach((img, i) => {
    const item = img.parentElement;
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Ver imagen: ${img.alt}`);
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
});

function openLightbox(i) {
    lbIndex = i;
    lightboxImg.src = galleryImgs[i].src;
    lightboxImg.alt = galleryImgs[i].alt;
    lightboxCaption.textContent = galleryImgs[i].alt;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    updateLbNav();
    lightboxClose.focus();
}
function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
}
function updateLbNav() {
    lightboxPrev.disabled = lbIndex === 0;
    lightboxNext.disabled = lbIndex === galleryImgs.length - 1;
}
function lbNavigate(dir) {
    const next = lbIndex + dir;
    if (next >= 0 && next < galleryImgs.length) openLightbox(next);
}
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => lbNavigate(-1));
lightboxNext.addEventListener('click', () => lbNavigate(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbNavigate(-1);
    if (e.key === 'ArrowRight') lbNavigate(1);
});

/* ─── AVISO DE PRIVACIDAD (#15) ──────────────────────────── */
const cookieBanner  = document.getElementById('cookieBanner');
const cookieAccept  = document.getElementById('cookieAccept');
const cookieDismiss = document.getElementById('cookieDismiss');
if (!localStorage.getItem('bb_privacy_ok')) {
    setTimeout(() => cookieBanner.classList.add('is-visible'), 1500);
}
cookieAccept.addEventListener('click', () => {
    localStorage.setItem('bb_privacy_ok', '1');
    cookieBanner.classList.remove('is-visible');
});
cookieDismiss.addEventListener('click', () => cookieBanner.classList.remove('is-visible'));

/* ─── WHATSAPP: OCULTAR EN FORMULARIO (#16) ─────────────── */
const waBtnFAB = document.querySelector('.whatsapp-btn');
document.getElementById('bookingForm').querySelectorAll('input, select, textarea').forEach(f => {
    f.addEventListener('focus', () => waBtnFAB.classList.add('whatsapp-btn--hidden'), { passive: true });
    f.addEventListener('blur', () => {
        setTimeout(() => {
            if (!document.getElementById('bookingForm').contains(document.activeElement)) {
                waBtnFAB.classList.remove('whatsapp-btn--hidden');
            }
        }, 100);
    }, { passive: true });
});
