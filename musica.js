(function () {
    'use strict';

    const TRACKS = [
        'assets/audio-mp3/Bach - Badinerie+-+BWV+1067.mp3',
        'assets/audio-mp3/el-vuelo-del-moscardon-nikolai-rimsky-korsakov.mp3',
        'assets/audio-mp3/Antonio Vivaldi - Storm.mp3'
    ];
    const GAP_MS = 3000;
    const TURN_SRC = 'assets/audio-mp3/flipping-book-page.mp3';
    const KEY = 'maniatopiaMusicPlaylist';
    const FADE_KEY = 'maniatopiaFadeInPlaylist';
    const FADE_IN_MS = 900;
    const VOLUME = 0.6;
    const TURN_VOLUME = 0.7;

    let state = { playing: false, time: 0, savedAt: 0, track: 0, gapRemaining: 0, gapUntil: 0 };
    try {
        const raw = sessionStorage.getItem(KEY);
        if (raw) state = Object.assign(state, JSON.parse(raw));
    } catch (e) {}

    if (!Number.isInteger(state.track) || state.track < 0 || state.track >= TRACKS.length) state.track = 0;
    const audio = new Audio(TRACKS[state.track]);
    audio.volume = VOLUME;
    audio.preload = 'auto';
    let gapTimer = null;

    // No se guarda la posición hasta aplicar la guardada, para no pisarla con 0
    let synced = false;
    let leaving = false;

    function save() {
        if (!synced) return;
        if (!state.gapRemaining) state.time = audio.currentTime || 0;
        state.savedAt = Date.now();
        try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    }

    function notifyState() {
        window.dispatchEvent(new Event('maniatopia-music-state'));
    }

    function startGap() {
        state.gapUntil = Date.now() + state.gapRemaining;
        save();
        notifyState();
        gapTimer = setTimeout(() => {
            gapTimer = null;
            state.gapRemaining = 0;
            state.gapUntil = 0;
            state.time = 0;
            audio.src = TRACKS[state.track];
            save();
            audio.play().catch((err) => {
                state.playing = false;
                save();
                notifyState();
                console.error('No se pudo reproducir la siguiente canción:', err);
            });
        }, state.gapRemaining);
    }

    audio.addEventListener('play', () => { state.playing = true; save(); notifyState(); });
    audio.addEventListener('pause', () => {
        if (leaving || audio.ended || state.gapRemaining) return;
        state.playing = false;
        save();
        notifyState();
    });
    audio.addEventListener('ended', () => {
        state.track = (state.track + 1) % TRACKS.length;
        state.time = 0;
        state.playing = true;
        state.gapRemaining = GAP_MS;
        startGap();
    });
    audio.addEventListener('timeupdate', () => {
        if (!audio.paused) save();
    });
    window.addEventListener('pagehide', () => { leaving = true; save(); });
    window.addEventListener('beforeunload', () => { leaving = true; save(); });

    window.ManiatopiaMusic = {
        audio: audio,
        isPlaying() {
            return state.playing;
        },
        toggle() {
            if (state.gapRemaining) {
                if (state.playing) {
                    clearTimeout(gapTimer);
                    gapTimer = null;
                    state.gapRemaining = Math.max(1, state.gapUntil - Date.now());
                    state.gapUntil = 0;
                    state.playing = false;
                    save();
                    notifyState();
                } else {
                    state.playing = true;
                    startGap();
                }
                return Promise.resolve();
            }
            if (audio.paused) return audio.play();
            audio.pause();
            return Promise.resolve();
        }
    };

    // --- Fundidos ---
    let fadeTimer = null;
    function fadeTo(target, ms) {
        clearInterval(fadeTimer);
        const from = audio.volume;
        const t0 = performance.now();
        fadeTimer = setInterval(() => {
            const p = Math.min((performance.now() - t0) / ms, 1);
            audio.volume = from + (target - from) * p;
            if (p === 1) clearInterval(fadeTimer);
        }, 30);
    }

    let fadeIn = false;
    try {
        fadeIn = sessionStorage.getItem(FADE_KEY) === '1';
        sessionStorage.removeItem(FADE_KEY);
    } catch (e) {}
    if (fadeIn) {
        audio.volume = 0;
        audio.addEventListener('playing', () => fadeTo(VOLUME, FADE_IN_MS), { once: true });
    }

    // --- Sonido de pasar página entre páginas ---
    const turn = new Audio(TURN_SRC);
    turn.volume = TURN_VOLUME;
    turn.preload = 'auto';

    // --- Navegación sin recarga: la música vive en un documento que nunca se descarga ---
    const pageCache = new Map();
    const MIN_FADE_MS = 200;
    let navigating = false;
    let currentPath = location.pathname;

    function fetchPage(url) {
        const key = new URL(url, location.href).href.split('#')[0];
        if (!pageCache.has(key)) {
            const p = fetch(key).then((res) => {
                const type = res.headers.get('content-type') || '';
                if (!res.ok || type.indexOf('text/html') === -1) throw new Error('no-html');
                return res.text();
            });
            p.catch(() => pageCache.delete(key));
            pageCache.set(key, p);
        }
        return pageCache.get(key);
    }

    function preloadImages(html, base) {
        const urls = new Set();
        const re = /assets\/[^'")>]+?\.(?:png|jpe?g|gif|webp|svg)/gi;
        let m;
        while ((m = re.exec(html))) urls.add(new URL(m[0], base).href);
        const loads = Array.from(urls).map((u) => new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = resolve;
            img.src = u;
        }));
        return Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 2000))]);
    }

    function swapDocument(html, url) {
        const doc = new DOMParser().parseFromString(html, 'text/html');

        document.title = doc.title;
        doc.head.querySelectorAll('link[rel="preload"][as="font"]').forEach((link) => {
            const href = link.getAttribute('href');
            if (!document.head.querySelector('link[rel="preload"][as="font"][href="' + href + '"]')) {
                document.head.appendChild(document.importNode(link, true));
            }
        });
        doc.head.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
            const href = l.getAttribute('href');
            if (!document.head.querySelector('link[rel="stylesheet"][href="' + href + '"]')) {
                document.head.appendChild(document.importNode(l, true));
            }
        });
        document.head.querySelectorAll('style:not([data-persist])').forEach((s) => s.remove());
        doc.head.querySelectorAll('style').forEach((s) => document.head.appendChild(document.importNode(s, true)));

        const scripts = [];
        doc.body.querySelectorAll('script').forEach((s) => {
            if (!s.src && !/musica\.js/.test(s.getAttribute('src') || '')) scripts.push(s.textContent);
            s.remove();
        });
        Array.from(document.body.children).forEach((el) => {
            if (!el.classList.contains('dc-overlay') && !(el.tagName === 'SCRIPT' && /musica\.js/.test(el.getAttribute('src') || ''))) el.remove();
        });
        Array.from(doc.body.childNodes).forEach((n) => document.body.appendChild(document.importNode(n, true)));
        window.scrollTo(0, 0);

        // Cada script de página se ejecuta aislado; DOMContentLoaded se simula porque el documento ya está cargado
        const pendingReady = [];
        const origAdd = window.addEventListener;
        window.addEventListener = function (type, fn, opts) {
            if (type === 'DOMContentLoaded') { pendingReady.push(fn); return; }
            return origAdd.call(this, type, fn, opts);
        };
        try {
            scripts.forEach((code) => {
                try { new Function(code)(); } catch (err) { console.error(err); }
            });
        } finally {
            window.addEventListener = origAdd;
        }
        pendingReady.forEach((fn) => { try { fn.call(window, new Event('DOMContentLoaded')); } catch (err) { console.error(err); } });
    }

    function fallbackNavigate(url) {
        try { sessionStorage.setItem(FADE_KEY, '1'); } catch (err) {}
        if (!audio.paused) fadeTo(0, 300);
        setTimeout(() => { location.href = url; }, 320);
    }

    function playTurn() {
        try {
            turn.currentTime = 0;
            turn.play().catch(() => {});
        } catch (err) {}
    }

    function navigate(url, push) {
        navigating = true;
        const root = document.documentElement;
        const body = document.body;
        const backgroundProperties = ['background-color', 'background-image', 'background-position', 'background-size', 'background-repeat', 'background-attachment'];
        const savedRootStyles = backgroundProperties.map((property) => ({
            property,
            value: root.style.getPropertyValue(property),
            priority: root.style.getPropertyPriority(property)
        }));
        const savedBodyOpacity = body.style.getPropertyValue('opacity');
        const savedBodyOpacityPriority = body.style.getPropertyPriority('opacity');
        const savedBodyTransition = body.style.getPropertyValue('transition');
        const savedBodyTransitionPriority = body.style.getPropertyPriority('transition');
        const background = getComputedStyle(body);
        backgroundProperties.forEach((property) => root.style.setProperty(property, background.getPropertyValue(property)));
        body.style.transition = 'opacity ' + MIN_FADE_MS + 'ms ease';
        body.style.opacity = '0';
        const base = new URL(url, location.href).href;

        function restoreStyles() {
            savedRootStyles.forEach(({ property, value, priority }) => {
                if (value) root.style.setProperty(property, value, priority);
                else root.style.removeProperty(property);
            });
            if (savedBodyOpacity) body.style.setProperty('opacity', savedBodyOpacity, savedBodyOpacityPriority);
            else body.style.removeProperty('opacity');
            if (savedBodyTransition) body.style.setProperty('transition', savedBodyTransition, savedBodyTransitionPriority);
            else body.style.removeProperty('transition');
        }

        Promise.all([
            fetchPage(url).then((html) => preloadImages(html, base).then(() => html)),
            new Promise((r) => setTimeout(r, MIN_FADE_MS))
        ]).then(([html]) => {
            if (push) history.pushState({ spa: true }, '', url);
            currentPath = new URL(url, location.href).pathname;
            swapDocument(html, url);
            requestAnimationFrame(() => {
                body.style.opacity = '1';
                setTimeout(() => { restoreStyles(); navigating = false; }, MIN_FADE_MS + 20);
            });
        }).catch((err) => {
            console.error('No se pudo completar la transición de página:', err);
            restoreStyles();
            fallbackNavigate(url);
        });
    }

    window.addEventListener('click', (e) => {
        if (navigating || e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a || a.hasAttribute('download')) return;
        if (a.target && a.target !== '_self') return;
        if (a.protocol !== location.protocol || a.host !== location.host) return;
        if (a.pathname === location.pathname && a.search === location.search) return;

        e.preventDefault();
        playTurn();
        navigate(a.href, true);
    }, true);

    // Se adelanta la descarga de la página al pasar el ratón o tocar un enlace
    ['mouseover', 'touchstart'].forEach((ev) => {
        window.addEventListener(ev, (e) => {
            const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
            if (a && !a.hasAttribute('download') && a.host === location.host && a.protocol === location.protocol && a.pathname !== location.pathname) {
                fetchPage(a.href).catch(() => {});
            }
        }, { capture: true, passive: true });
    });

    window.addEventListener('popstate', () => {
        if (location.pathname === currentPath) return;
        navigate(location.href, false);
    });

    // --- Aviso emergente antes de ir a Discord ---
    let discordModal = null;
    function closeDiscordModal() {
        if (discordModal) discordModal.style.display = 'none';
        document.removeEventListener('keydown', onModalKey, true);
    }
    function onModalKey(e) { if (e.key === 'Escape') closeDiscordModal(); }
    function openDiscordModal(url) {
        if (!discordModal) {
            const style = document.createElement('style');
            style.setAttribute('data-persist', '1');
            style.textContent =
                '.dc-overlay{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);padding:16px}' +
                '.dc-box{max-width:420px;width:100%;box-sizing:border-box;padding:28px 24px;text-align:center;color:#f3e6c4;background:linear-gradient(160deg,#2a2114,#14100a);border:1px solid #c9a043;border-radius:10px;box-shadow:0 0 30px rgba(240,200,100,.35);font-family:Cinzel,Georgia,serif}' +
                '.dc-box h2{margin:0 0 22px;font-size:1.2rem;line-height:1.4;letter-spacing:1px;font-weight:700}' +
                '.dc-actions{display:flex;flex-direction:column;gap:12px}' +
                '.dc-btn{display:block;padding:12px 16px;border-radius:6px;font:inherit;font-size:1rem;cursor:pointer;text-decoration:none;border:1px solid #c9a043;box-sizing:border-box}' +
                '.dc-go{background:#c9a043;color:#1a1408;font-weight:700}' +
                '.dc-go:hover{background:#f3d98b}' +
                '.dc-no{background:transparent;color:#f3e6c4}' +
                '.dc-no:hover{background:rgba(201,160,67,.18)}';
            document.head.appendChild(style);

            discordModal = document.createElement('div');
            discordModal.className = 'dc-overlay';
            discordModal.setAttribute('role', 'dialog');
            discordModal.setAttribute('aria-modal', 'true');
            discordModal.innerHTML =
                '<div class="dc-box"><h2>Invitación a Symposion - Maniatopia - Discord</h2>' +
                '<div class="dc-actions">' +
                '<a class="dc-btn dc-go" target="_blank" rel="noopener noreferrer">Continuar al foro</a>' +
                '<button type="button" class="dc-btn dc-no">No quiero ir ahora</button></div></div>';
            document.body.appendChild(discordModal);
            discordModal.addEventListener('click', (e) => {
                if (e.target === discordModal || e.target.closest('.dc-no') || e.target.closest('.dc-go')) {
                    closeDiscordModal();
                }
            });
        }
        discordModal.querySelector('.dc-go').href = url;
        discordModal.style.display = 'flex';
        document.addEventListener('keydown', onModalKey, true);
        discordModal.querySelector('.dc-go').focus();
    }

    window.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0) return;
        const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
        if (!a || !/(^|\.)discord\.(gg|com)$/.test(a.hostname)) return;
        if (a.classList.contains('dc-go')) return;
        e.preventDefault();
        e.stopPropagation();
        openDiscordModal(a.href);
    }, true);

    // Al volver con el botón Atrás (caché de página) se restablece el estado
    window.addEventListener('pageshow', (e) => {
        if (!e.persisted) return;
        navigating = false;
        leaving = false;
        clearInterval(fadeTimer);
        audio.volume = VOLUME;
    });

    // --- Reanudar donde se quedó ---
    audio.addEventListener('loadedmetadata', () => {
        if (state.gapRemaining) {
            synced = true;
            return;
        }
        if (state.time > 0 && state.time < audio.duration) {
            const elapsed = state.playing ? (Date.now() - state.savedAt) / 1000 : 0;
            audio.addEventListener('seeked', () => { synced = true; }, { once: true });
            audio.currentTime = (state.time + elapsed) % audio.duration;
        } else {
            synced = true;
        }
    }, { once: true });

    if (state.gapRemaining) {
        synced = true;
        if (state.playing) {
            state.gapRemaining = Math.max(1, state.gapUntil - Date.now());
            startGap();
        }
        return;
    }

    if (!state.playing) return;

    function removeGestureListeners() {
        ['click', 'keydown', 'touchstart'].forEach(ev =>
            window.removeEventListener(ev, resumeOnGesture, true));
    }
    function resumeOnGesture() {
        audio.play().then(removeGestureListeners).catch(() => {});
    }

    audio.play().catch(() => {
        ['click', 'keydown', 'touchstart'].forEach(ev =>
            window.addEventListener(ev, resumeOnGesture, true));
    });
})();
