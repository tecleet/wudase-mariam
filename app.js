/**
 * Wudase Mariam Book - App Controller Script
 * Consolidated, structured, and refactored code without CORS/HTTP dev-server requirement.
 * Can be opened directly from Finder (file:// protocol) or served via HTTP.
 */

// ═══════════════════════════════════════════════════════════════
// 1. Application State & Metadata
// ═══════════════════════════════════════════════════════════════

const state = {
    prayers: null,             // Raw prayer text database (loaded from window.prayersData)
    currentSection: null,      // Active prayer section (e.g., 'monday', 'daily')
    layoutMode: 'single',      // 'single' or 'split'
    fontSize: 24,              // Font size in pixels
    highlightRed: true,        // Toggle for traditional red-coloring
    activeTheme: 'theme-vellum',// 'theme-vellum', 'theme-light', 'theme-dark'
    leftLang: 'ge',            // Active language for left column
    rightLang: 'am',           // Active language for right column
    searchQuery: '',           // Current search query
    zenMode: true,             // Collapses headers when scrolling down
    autoScroll: false,         // Auto-scroll toggle
    scrollSpeed: 3,            // Auto-scroll speed (1-10)
    audioVolume: 80,           // Begena volume (0-100)
    lineHeight: 21,            // Line height spacing (15-30, mapping to 1.5x - 3.0x)
    fontFamily: 'noto',        // Font family option ('noto', 'sil', 'kefa')
    highlightPunctuation: true, // Punctuation coloring toggle
    wakeLock: true,            // Screen keep-awake preference
    doubleTapPause: false,     // Double tap text to pause scroll toggle
    numberConvert: false,      // Convert Ge'ez numerals to Arabic digits
    screenDimmer: 0            // Night overlay dim level (0-80)
};

// Sidebar display names (Bilingual labels)
const prayerLabels = {
    'daily':               { ge: 'የዘወትር ጸሎት',                en: 'Daily Prayer' },
    'monday':              { ge: 'ዘሠኑይ (ሰኞ)',               en: 'Monday' },
    'tuesday':             { ge: 'ዘሰሉስ (ማክሰኞ)',             en: 'Tuesday' },
    'wednesday':           { ge: 'ዘረቡዕ (ረቡዕ)',              en: 'Wednesday' },
    'thursday':            { ge: 'ዘሐሙስ (ሐሙስ)',              en: 'Thursday' },
    'friday':              { ge: 'ዘአርብ (አርብ)',              en: 'Friday' },
    'saturday':            { ge: 'ዘቀዳሚት (ቅዳሜ)',             en: 'Saturday' },
    'sunday':              { ge: 'ዘሰንበተ ክርስቲያን (እሁድ)',      en: 'Sunday' },
    'anqetse_birhan':      { ge: 'አንቀጸ ብርሃን',               en: 'Anqetse Birhan' },
    'yiwedsewa_melaekt':   { ge: 'ይዌድስዋ መላእክት',             en: 'Yiwedsewa Melaekt' },
    'melka_mariam':        { ge: 'መልክአ ማርያም',               en: 'Melka Mariam' },
    'melka_eyesus':        { ge: 'መልክአ ኢየሱስ',               en: 'Melka Eyesus' },
    'melka_edom':          { ge: 'መልክአ ኤዶም',                en: 'Melka Edom' }
};

// Highlight patterns for sacred names in Ge'ez and Amharic
const geHighlightPatterns = [
    /(?:ለ|ወ|በ|እ|ዘ)?ማርያም(?:ነ|ኒ|ሰ|ም)?/g,
    /(?:ለ|ወ|በ|እ|ዘ)?ኢየሱስ(?:ኒ|ሰ)?/g,
    /(?:ለ|ወ|በ|እ|ዘ)?ክርስቶስ(?:ኒ|ሰ|ም)?/g,
    /(?:ለ|ወ|በ|እ|ዘ)?እግዚአብሔር(?:ኒ|ሰ)?/g,
    /(?:ለ|ወ|በ|እ|ዘ)?አማኑኤል(?:ኒ|ሰ)?/g,
    /(?<=^|[\s፡])(?:ለ|ወ|በ|እ|ዘ)?አብ(?=[፡።\s]|$)/g,
    /(?<=^|[\s፡])(?:ለ|ወ|በ|እ|ዘ)?ወልድ(?:ኒ|ሰ)?(?=[፡።\s]|$)/g,
    /(?:ለ|ወ|በ|እ|ዘ)?መንፈስ\s+(?:ለ|ወ|በ|እ|ዘ)?ቅዱስ/g,
    /(?:ለ|ወ|በ|እ|ዘ)?ድንግል(?:ኒ|ሰ|ም)?/g,
    /(?:ለ|ወ|በ|እ|ዘ)?አምላክ(?:ነ|ክሙ|ሁ|ሃ|ኒ|ሰ)?/g,
    /(?:ሰአሊ\s+ለነ\s+ቅድስት[።፡]?)/g,
    /(?:ይዌድስዋ\s+መላእክት[።፡]?)/g,
    /(^[፩-፳፻]+[\.፡\s]+)/g
];

const amHighlightPatterns = [
    /(?:ለ|ወ|በ|እ|ዘ)?ማርያም(?:ነ|ኒ|ሰ|ም)?/g,
    /(?:ለ|ወ|በ|እ|ዘ)?ኢየሱስ(?:ኒ|ሰ)?/g,
    /(?:ለ|ወ|በ|እ|ዘ)?ክርስቶስ(?:ኒ|ሰ|ም)?/g,
    /(?:ለ|ወ|በ|እ|ዘ)?እግዚአብሔር(?:ኒ|ሰ)?/g,
    /(?:ለ|ወ|በ|እ|ዘ)?አማኑኤል(?:ኒ|ሰ)?/g,
    /(?<=^|[\s፡])(?:ለ|ወ|በ|እ|ዘ)?አብ(?=[፡።\s]|$)/g,
    /(?<=^|[\s፡])(?:ለ|ወ|በ|እ|ዘ)?ወልድ(?:ኒ|ሰ)?(?=[፡።\s]|$)/g,
    /(?:ለ|ወ|በ|እ|ዘ)?መንፈስ\s+(?:ለ|ወ|በ|እ|ዘ)?ቅዱስ/g,
    /(?:ለ|ወ|በ|እ|ዘ)?ድንግል(?:ኒ|ሰ|ም)?/g,
    /(?:ለ|ወ|በ|እ|ዘ)?አምላክ(?:ነ|ክሙ|ሁ|ሃ|ኒ|ሰ)?/g,
    /(?:ቅድስት\s+ሆይ\s+ለምኝልን[።፡]?)/g,
    /(^[፩-፳፻]+[\.፡\s]+)/g
];

// ═══════════════════════════════════════════════════════════════
// 2. DOM Elements Selection
// ═══════════════════════════════════════════════════════════════

const els = {
    sidebar: document.getElementById('sidebar'),
    menuToggleBtn: document.getElementById('menu-toggle-btn'),
    closeSidebarBtn: document.getElementById('close-sidebar-btn'),
    prayerList: document.getElementById('prayer-list'),
    
    layoutSingleBtn: document.getElementById('layout-single-btn'),
    layoutSplitBtn: document.getElementById('layout-split-btn'),
    
    settingsToggleBtn: document.getElementById('settings-toggle-btn'),
    settingsPanel: document.getElementById('settings-panel'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    
    fontSizeSlider: document.getElementById('font-size-slider'),
    fontSizeVal: document.getElementById('font-size-val'),
    
    audioToggle: document.getElementById('audio-toggle'),
    audioVolumeSlider: document.getElementById('audio-volume-slider'),
    audioVolumeVal: document.getElementById('audio-volume-val'),
    
    searchInput: document.getElementById('search-input'),
    
    readersContainer: document.getElementById('readers-container'),
    controlBar: document.getElementById('control-bar'),
    toplineNav: document.getElementById('topline-nav'),
    screenDimmerOverlay: document.getElementById('screen-dimmer-overlay'),
    
    lineHeightSlider: document.getElementById('line-height-slider'),
    lineHeightVal: document.getElementById('line-height-val'),
    fontFamilySelect: document.getElementById('font-family-select'),
    doubleTapPauseToggle: document.getElementById('double-tap-pause-toggle'),
    screenDimmerSlider: document.getElementById('screen-dimmer-slider'),
    screenDimmerVal: document.getElementById('screen-dimmer-val'),
    autoScrollToggle: document.getElementById('auto-scroll-toggle'),
    scrollSpeedSlider: document.getElementById('scroll-speed-slider'),
    scrollSpeedVal: document.getElementById('scroll-speed-val'),
    
    readerLeft: document.getElementById('reader-left'),
    coverPageLeft: document.getElementById('cover-page-left'),
    prayerDisplayLeft: document.getElementById('prayer-display-left'),
    titleLeft: document.getElementById('title-left'),
    contentLeft: document.getElementById('content-left'),
    
    readerRight: document.getElementById('reader-right'),
    coverPageRight: document.getElementById('cover-page-right'),
    prayerDisplayRight: document.getElementById('prayer-display-right'),
    titleRight: document.getElementById('title-right'),
    contentRight: document.getElementById('content-right'),
    
    langCycleFloatingBtn: document.getElementById('lang-cycle-floating-btn')
};

// ═══════════════════════════════════════════════════════════════
// 3. Scroll Sync & Controls State Variables
// ═══════════════════════════════════════════════════════════════

let isProgrammaticScroll = false;
let isHoveringControls = false;
let controlsShowTimeout = null;
let isSyncingLeftScroll = false;
let isSyncingRightScroll = false;
let lastScrollTopLeft = 0;
let lastScrollTopRight = 0;
let autoScrollTimer = null;
let wakeLock = null;

// ═══════════════════════════════════════════════════════════════
// 4. Initialization
// ═══════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    setupEventListeners();
    initGlobalTooltips();
    
    // Load prayers from global prayersData file without fetch (avoids CORS over file://)
    state.prayers = window.prayersData || null;
    if (!state.prayers) {
        console.error("Prayers database not found. Ensure prayers.js is loaded before app.js");
    }
    
    renderSidebarMenu();
    renderToplineNav();
    applyStateToUI();
}

// ═══════════════════════════════════════════════════════════════
// 5. State Persistence
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'wudase_mariam_state';

function saveState() {
    const data = {
        currentSection: state.currentSection,
        layoutMode: state.layoutMode,
        fontSize: state.fontSize,
        highlightRed: state.highlightRed,
        activeTheme: state.activeTheme,
        leftLang: state.leftLang,
        rightLang: state.rightLang,
        zenMode: state.zenMode,
        scrollSpeed: state.scrollSpeed,
        audioVolume: state.audioVolume,
        lineHeight: state.lineHeight,
        fontFamily: state.fontFamily,
        highlightPunctuation: state.highlightPunctuation,
        wakeLock: state.wakeLock,
        doubleTapPause: state.doubleTapPause,
        numberConvert: state.numberConvert,
        screenDimmer: state.screenDimmer
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const d = JSON.parse(saved);
            state.layoutMode           = d.layoutMode || 'single';
            state.fontSize             = d.fontSize || 24;
            state.highlightRed         = d.highlightRed !== undefined ? d.highlightRed : true;
            state.activeTheme          = d.activeTheme || 'theme-vellum';
            state.leftLang             = d.leftLang || 'ge';
            state.rightLang            = d.rightLang || 'am';
            state.currentSection       = d.currentSection;
            state.zenMode              = d.zenMode !== undefined ? d.zenMode : true;
            state.scrollSpeed          = d.scrollSpeed !== undefined ? d.scrollSpeed : 3;
            state.audioVolume          = d.audioVolume !== undefined ? d.audioVolume : 80;
            state.lineHeight           = d.lineHeight !== undefined ? d.lineHeight : 21;
            state.fontFamily           = d.fontFamily || 'noto';
            state.highlightPunctuation = d.highlightPunctuation !== undefined ? d.highlightPunctuation : true;
            state.wakeLock             = d.wakeLock !== undefined ? d.wakeLock : true;
            state.doubleTapPause       = d.doubleTapPause !== undefined ? d.doubleTapPause : false;
            state.numberConvert        = d.numberConvert !== undefined ? d.numberConvert : false;
            state.screenDimmer         = d.screenDimmer !== undefined ? d.screenDimmer : 0;
        }
    } catch (e) {
        console.error('Failed to load state from localStorage:', e);
    }

    // Force constant preferences (options removed from settings panel)
    state.wakeLock = true;
    state.zenMode = true;
    state.highlightPunctuation = true;
    state.highlightRed = true;
    state.numberConvert = false;
}

// ═══════════════════════════════════════════════════════════════
let audioCtx = null;
let begenaGain = null;
let begenaInterval = null;

async function ensureAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
    return audioCtx;
}

function updateAudioVolume(volume) {
    const t = audioCtx ? audioCtx.currentTime : 0;
    if (begenaGain && audioCtx) {
        begenaGain.gain.setValueAtTime((volume / 100) * 0.15, t);
    }
}

async function startBegenaPlucks() {
    try {
        const ctx = await ensureAudioCtx();
        stopBegenaPlucks();
        
        begenaGain = ctx.createGain();
        begenaGain.gain.setValueAtTime((state.audioVolume / 100) * 0.15, ctx.currentTime);
        begenaGain.connect(ctx.destination);
        
        const scale = [110, 130.81, 146.83, 164.81, 196.00, 220.00];
        let noteIndex = 0;
        
        function pluckNote() {
            const freq = scale[noteIndex % scale.length];
            noteIndex++;
            const now = ctx.currentTime;
            
            const osc1 = ctx.createOscillator();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(freq, now);
            
            const osc2 = ctx.createOscillator();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(freq * 2.01, now);
            
            const envGain = ctx.createGain();
            envGain.gain.setValueAtTime(0.35 + Math.random() * 0.15, now);
            envGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
            
            const lpf = ctx.createBiquadFilter();
            lpf.type = 'lowpass';
            lpf.frequency.setValueAtTime(800 + Math.random() * 400, now);
            lpf.Q.setValueAtTime(2.5, now);
            lpf.frequency.exponentialRampToValueAtTime(200, now + 2.0);
            
            const buzzGain = ctx.createGain();
            buzzGain.gain.setValueAtTime(0.06, now);
            buzzGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            
            osc1.connect(lpf);
            lpf.connect(envGain);
            osc2.connect(buzzGain);
            buzzGain.connect(envGain);
            envGain.connect(begenaGain);
            
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 3);
            osc2.stop(now + 2);
        }
        
        pluckNote();
        begenaInterval = setInterval(() => { pluckNote(); }, 2000 + Math.random() * 800);
    } catch (e) {
        console.error('Begena init failed:', e);
    }
}

function stopBegenaPlucks() {
    if (begenaInterval) { clearInterval(begenaInterval); begenaInterval = null; }
    if (begenaGain) { try { begenaGain.disconnect(); } catch (e) {} begenaGain = null; }
}

// ═══════════════════════════════════════════════════════════════
// 7. Typography Sizing & Dynamic Fonts
// ═══════════════════════════════════════════════════════════════

function updateFontFamily() {
    let fontStack = '';
    if (state.fontFamily === 'noto') {
        fontStack = "'Noto Sans Ethiopic', 'Nyala', sans-serif";
    } else if (state.fontFamily === 'sil') {
        fontStack = "'Abyssinica SIL', 'Noto Sans Ethiopic', sans-serif";
    } else if (state.fontFamily === 'kefa') {
        fontStack = "'Kefa', 'Noto Sans Ethiopic', sans-serif";
    }
    document.documentElement.style.setProperty('--font-body-am', fontStack);
}

function updateFontSizesInReaders() {
    if (els.contentLeft) els.contentLeft.style.fontSize = state.fontSize + 'px';
    if (els.contentRight) els.contentRight.style.fontSize = state.fontSize + 'px';
    if (els.titleLeft) els.titleLeft.style.fontSize = (state.fontSize + 4) + 'px';
    if (els.titleRight) els.titleRight.style.fontSize = (state.fontSize + 4) + 'px';
}

function updateLineHeightInReaders() {
    const lh = (state.lineHeight / 10).toFixed(1);
    if (els.contentLeft) els.contentLeft.style.lineHeight = lh;
    if (els.contentRight) els.contentRight.style.lineHeight = lh;
}

function setReaderFontFamily(element, lang) {
    if (!element) return;
    if (lang === 'ge' || lang === 'am') {
        element.style.fontFamily = 'var(--font-body-am)';
    } else {
        element.style.fontFamily = 'var(--font-body-en)';
    }
}

// ═══════════════════════════════════════════════════════════════
// 8. Text Processing & Numeral Conversions
// ═══════════════════════════════════════════════════════════════

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function geezToArabic(geezStr) {
    const map = {
        '፩': 1, '፪': 2, '፫': 3, '፬': 4, '፭': 5, '፮': 6, '፯': 7, '፰': 8, '፱': 9,
        '፲': 10, '፳': 20, '፴': 30, '፵': 40, '፶': 50, '፷': 60, '፸': 70, '፹': 80, '፺': 90,
        '፻': 100, '፼': 10000
    };
    
    const cleanStr = geezStr.replace(/[\.፡\s]+/g, '').trim();
    if (!cleanStr) return geezStr;
    
    let total = 0;
    let temp = 0;
    
    for (let i = 0; i < cleanStr.length; i++) {
        const char = cleanStr[i];
        const val = map[char];
        if (val === undefined) return geezStr;
        
        if (val === 100 || val === 10000) {
            if (temp === 0) temp = 1;
            total += temp * val;
            temp = 0;
        } else {
            temp += val;
        }
    }
    total += temp;
    
    const suffix = geezStr.match(/([\.፡\s]+)$/);
    return total + (suffix ? suffix[0] : '');
}

function processTextContent(text, lang) {
    if (!text) return '';

    // Clean up literal escapes
    text = text.replace(/\\t/g, ' ')
               .replace(/\\n/g, '\n')
               .replace(/\\N/g, '\n')
               .replace(/\t/g, ' ')
               .replace(/[ ]{2,}/g, ' ');

    const stanzas = text.split('\n\n');
    let htmlContent = '';

    stanzas.forEach(stanza => {
        if (!stanza.trim()) return;
        
        let processedStanza = stanza.replace(/\n/g, '<br>');
        
        if (state.highlightRed && (lang === 'ge' || lang === 'am')) {
            const patterns = lang === 'ge' ? geHighlightPatterns : amHighlightPatterns;
            
            patterns.forEach(pattern => {
                processedStanza = processedStanza.replace(pattern, (match) => {
                    if (match.startsWith('<span')) return match;
                    return `<span class="red-text">${match}</span>`;
                });
            });

            if (!state.highlightPunctuation) {
                processedStanza = processedStanza.replace(/<span class="red-text">([^<]*)([፡።፥፤\.]+)<\/span>/g, '$2<span class="red-text">$1</span>');
            }
        }
        
        if (state.highlightPunctuation && (lang === 'ge' || lang === 'am')) {
            processedStanza = processedStanza.replace(/([፡።፥፤])(?![^<>]*>)/g, '<span class="red-text">$1</span>');
            processedStanza = processedStanza.replace(/<\/span><span class="red-text">/g, '');
        }
        
        processedStanza = processedStanza.replace(/^(<span class="red-text">)?([፩-፳፻\d]+[\.፡\s]+)(<\/span>)?/g, (match, openSpan, num, closeSpan) => {
            const displayNum = state.numberConvert ? geezToArabic(num) : num;
            return `<span class="stanza-num">${displayNum}</span>`;
        });

        if (state.searchQuery) {
            try {
                const searchRegex = new RegExp(`(${escapeRegExp(state.searchQuery)})`, 'gi');
                processedStanza = processedStanza.replace(searchRegex, `<span class="highlight-found">$1</span>`);
            } catch (err) {}
        }

        htmlContent += `<div class="stanza-paragraph">${processedStanza}</div>`;
    });

    return htmlContent;
}

// ═══════════════════════════════════════════════════════════════
// 9. Main Rendering & Layout
// ═══════════════════════════════════════════════════════════════

function renderActivePrayer() {
    if (!state.prayers) return;
    
    const section = state.currentSection;
    
    if (section === null) {
        els.coverPageLeft.classList.remove('hidden');
        els.prayerDisplayLeft.classList.add('hidden');
        
        els.coverPageRight.classList.remove('hidden');
        els.prayerDisplayRight.classList.add('hidden');
        return;
    }
    
    const prayerData = state.prayers[section];
    if (!prayerData) return;
    
    // Left Column
    els.coverPageLeft.classList.add('hidden');
    els.prayerDisplayLeft.classList.remove('hidden');
    
    setReaderFontFamily(els.contentLeft, state.leftLang);
    els.titleLeft.innerHTML = prayerData.title[state.leftLang] || '';
    els.contentLeft.innerHTML = processTextContent(prayerData.content[state.leftLang], state.leftLang);
    
    // Right Column
    if (state.layoutMode === 'split') {
        els.coverPageRight.classList.add('hidden');
        els.prayerDisplayRight.classList.remove('hidden');
        
        setReaderFontFamily(els.contentRight, state.rightLang);
        els.titleRight.innerHTML = prayerData.title[state.rightLang] || '';
        els.contentRight.innerHTML = processTextContent(prayerData.content[state.rightLang], state.rightLang);
    } else {
        els.coverPageRight.classList.remove('hidden');
        els.prayerDisplayRight.classList.add('hidden');
    }
    
    updateFontSizesInReaders();
    updateLineHeightInReaders();
}

function setLayoutMode(mode) {
    state.layoutMode = mode;
    saveState();
    
    if (mode === 'single') {
        els.layoutSingleBtn.classList.add('active');
        els.layoutSplitBtn.classList.remove('active');
        els.readersContainer.classList.remove('mode-split');
        els.readersContainer.classList.add('mode-single');
        els.readerRight.classList.add('hidden');
    } else {
        els.layoutSingleBtn.classList.remove('active');
        els.layoutSplitBtn.classList.add('active');
        els.readersContainer.classList.remove('mode-single');
        els.readersContainer.classList.add('mode-split');
        els.readerRight.classList.remove('hidden');
    }
    
    renderActivePrayer();
}

function setTheme(theme) {
    document.body.classList.remove('theme-vellum', 'theme-light', 'theme-dark');
    document.body.classList.add(theme);
    state.activeTheme = theme;
    
    document.querySelectorAll('.s-theme-btn').forEach(btn => {
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    saveState();
}

function selectSection(sectionKey) {
    state.currentSection = sectionKey;
    saveState();
    
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    if (sectionKey) {
        const activeNav = document.getElementById(`nav-${sectionKey}`);
        if (activeNav) activeNav.parentElement.classList.add('active');
    } else {
        const coverNav = document.getElementById('nav-cover');
        if (coverNav) coverNav.parentElement.classList.add('active');
    }
    
    document.querySelectorAll('.topline-nav .nav-pill').forEach(pill => pill.classList.remove('active'));
    if (sectionKey) {
        const activePill = document.getElementById(`pill-${sectionKey}`);
        if (activePill) {
            activePill.classList.add('active');
            activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    } else {
        const coverPill = document.getElementById('pill-cover');
        if (coverPill) {
            coverPill.classList.add('active');
            coverPill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
    
    if (window.innerWidth <= 768) {
        els.sidebar.classList.add('collapsed');
    }
    
    renderActivePrayer();
    
    els.readerLeft.querySelector('.book-page').scrollTop = 0;
    els.readerRight.querySelector('.book-page').scrollTop = 0;
    showControlsTemp();
}

function cycleGlobalLanguage() {
    if (state.layoutMode === 'single') {
        state.leftLang = state.leftLang === 'ge' ? 'am' : state.leftLang === 'am' ? 'en' : 'ge';
    } else {
        if (state.leftLang === 'ge' && state.rightLang === 'am') {
            state.leftLang = 'am';
            state.rightLang = 'en';
        } else if (state.leftLang === 'am' && state.rightLang === 'en') {
            state.leftLang = 'ge';
            state.rightLang = 'en';
        } else {
            state.leftLang = 'ge';
            state.rightLang = 'am';
        }
    }
    saveState();
    renderActivePrayer();
}

// ═══════════════════════════════════════════════════════════════
// 10. Navigation Menu Building
// ═══════════════════════════════════════════════════════════════

function renderSidebarMenu() {
    els.prayerList.innerHTML = '';
    
    const coverLi = document.createElement('li');
    coverLi.innerHTML = `<a href="#" id="nav-cover" class="nav-item">መቅድም / Introduction</a>`;
    coverLi.addEventListener('click', (e) => {
        e.preventDefault();
        selectSection(null);
    });
    els.prayerList.appendChild(coverLi);
    
    Object.keys(prayerLabels).forEach(key => {
        const labels = prayerLabels[key];
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#" id="nav-${key}" class="nav-item">
                <span class="nav-ge">${labels.ge}</span>
                <span class="nav-en">${labels.en}</span>
            </a>
        `;
        li.addEventListener('click', (e) => {
            e.preventDefault();
            selectSection(key);
        });
        els.prayerList.appendChild(li);
    });
}

function renderToplineNav() {
    els.toplineNav.innerHTML = '';
    
    const coverPill = document.createElement('button');
    coverPill.id = 'pill-cover';
    coverPill.className = 'nav-pill';
    coverPill.textContent = 'መቅድም / Intro';
    coverPill.addEventListener('click', () => selectSection(null));
    els.toplineNav.appendChild(coverPill);
    
    Object.keys(prayerLabels).forEach(key => {
        const labels = prayerLabels[key];
        const pill = document.createElement('button');
        pill.id = `pill-${key}`;
        pill.className = 'nav-pill';
        
        let shortName = labels.ge;
        if (key === 'daily') shortName = 'ዘወትር';
        else if (key === 'monday') shortName = 'ሰኞ';
        else if (key === 'tuesday') shortName = 'ማክሰኞ';
        else if (key === 'wednesday') shortName = 'ረቡዕ';
        else if (key === 'thursday') shortName = 'ሐሙስ';
        else if (key === 'friday') shortName = 'አርብ';
        else if (key === 'saturday') shortName = 'ቅዳሜ';
        else if (key === 'sunday') shortName = 'እሁድ';
        else if (key === 'anqetse_birhan') shortName = 'አንቀጽ';
        else if (key === 'yiwedsewa_melaekt') shortName = 'ይዌድስዋ';
        else if (key === 'melka_mariam') shortName = 'መ. ማርያም';
        else if (key === 'melka_eyesus') shortName = 'መ. ኢየሱስ';
        else if (key === 'melka_edom') shortName = 'መ. ኤዶም';
        
        pill.textContent = shortName;
        pill.title = `${labels.ge} / ${labels.en}`;
        pill.addEventListener('click', () => selectSection(key));
        els.toplineNav.appendChild(pill);
    });
}

// ═══════════════════════════════════════════════════════════════
// 11. Interactive Toggles & Sliders setup
// ═══════════════════════════════════════════════════════════════

function setupEventListeners() {
    els.menuToggleBtn.addEventListener('click', () => els.sidebar.classList.toggle('collapsed'));
    els.closeSidebarBtn.addEventListener('click', () => els.sidebar.classList.add('collapsed'));
    
    els.layoutSingleBtn.addEventListener('click', () => setLayoutMode('single'));
    els.layoutSplitBtn.addEventListener('click', () => setLayoutMode('split'));
    
    els.settingsToggleBtn.addEventListener('click', () => els.settingsPanel.classList.toggle('hidden'));
    els.closeSettingsBtn.addEventListener('click', () => els.settingsPanel.classList.add('hidden'));
    
    if (els.langCycleFloatingBtn) {
        els.langCycleFloatingBtn.addEventListener('click', () => {
            cycleGlobalLanguage();
        });
    }

    els.fontSizeSlider.addEventListener('input', (e) => {
        state.fontSize = parseInt(e.target.value);
        els.fontSizeVal.textContent = state.fontSize;
        updateFontSizesInReaders();
        saveState();
    });
    
    els.audioVolumeSlider.addEventListener('input', (e) => {
        state.audioVolume = parseInt(e.target.value);
        els.audioVolumeVal.textContent = state.audioVolume;
        updateAudioVolume(state.audioVolume);
        saveState();
    });
    
    document.querySelectorAll('.s-theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
        });
    });

    els.audioToggle.addEventListener('change', async (e) => {
        if (e.target.checked) {
            await startBegenaPlucks();
        } else {
            stopBegenaPlucks();
        }
    });
    
    els.lineHeightSlider.addEventListener('input', (e) => {
        state.lineHeight = parseInt(e.target.value);
        els.lineHeightVal.textContent = (state.lineHeight / 10).toFixed(1);
        updateLineHeightInReaders();
        saveState();
    });
    
    els.fontFamilySelect.addEventListener('change', (e) => {
        state.fontFamily = e.target.value;
        updateFontFamily();
        saveState();
    });
    
    els.doubleTapPauseToggle.addEventListener('change', (e) => {
        state.doubleTapPause = e.target.checked;
        saveState();
    });

    els.screenDimmerSlider.addEventListener('input', (e) => {
        state.screenDimmer = parseInt(e.target.value);
        els.screenDimmerVal.textContent = state.screenDimmer;
        if (els.screenDimmerOverlay) {
            els.screenDimmerOverlay.style.opacity = state.screenDimmer / 100;
        }
        saveState();
    });

    els.autoScrollToggle.addEventListener('change', (e) => {
        state.autoScroll = e.target.checked;
        toggleAutoScroll();
    });
    
    els.scrollSpeedSlider.addEventListener('input', (e) => {
        state.scrollSpeed = parseInt(e.target.value);
        els.scrollSpeedVal.textContent = (state.scrollSpeed / 3).toFixed(1);
        saveState();
        if (state.autoScroll) {
            toggleAutoScroll();
        }
    });

    document.addEventListener('click', (e) => {
        if (audioCtx && audioCtx.state === 'suspended' && els.audioToggle.checked) {
            audioCtx.resume().catch(err => console.log('AudioContext resume failed:', err));
        }
        if (els.settingsPanel && !els.settingsPanel.classList.contains('hidden') &&
            !els.settingsPanel.contains(e.target) &&
            !els.settingsToggleBtn.contains(e.target) &&
            (!els.langCycleFloatingBtn || !els.langCycleFloatingBtn.contains(e.target))) {
            els.settingsPanel.classList.add('hidden');
        }
    });
    
    document.querySelectorAll('.start-reading-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectSection('daily');
        });
    });

    els.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        renderActivePrayer();
    });

    window.addEventListener('resize', handleResponsiveLayout);

    els.readerLeft.querySelector('.book-page').addEventListener('scroll', (e) => {
        handleReaderScrollEvents(e);
        syncRightScroll(e);
    });
    els.readerRight.querySelector('.book-page').addEventListener('scroll', (e) => {
        handleReaderScrollEvents(e);
        syncLeftScroll(e);
    });
    
    els.readerLeft.querySelector('.book-page').addEventListener('click', showControlsTemp);
    els.readerRight.querySelector('.book-page').addEventListener('click', showControlsTemp);
    
    const handleDoubleTapToPause = () => {
        if (!state.doubleTapPause) return;
        state.autoScroll = !state.autoScroll;
        els.autoScrollToggle.checked = state.autoScroll;
        els.autoScrollToggle.dispatchEvent(new Event('change'));
        saveState();
    };

    els.readerLeft.querySelector('.book-page').addEventListener('dblclick', handleDoubleTapToPause);
    els.readerRight.querySelector('.book-page').addEventListener('dblclick', handleDoubleTapToPause);

    const controlElements = [els.controlBar, els.toplineNav, els.settingsPanel, els.sidebar];
    controlElements.forEach(el => {
        if (el) {
            el.addEventListener('mouseenter', () => {
                isHoveringControls = true;
                if (controlsShowTimeout) clearTimeout(controlsShowTimeout);
            });
            el.addEventListener('mouseleave', () => {
                isHoveringControls = false;
                if (state.autoScroll) {
                    showControlsTemp();
                }
            });
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// 12. Auto Scroll & Zen scrolling
// ═══════════════════════════════════════════════════════════════

function handleReaderScrollEvents(e) {
    const el = e.target;
    const currentScroll = el.scrollTop;
    
    if (state.zenMode) {
        const lastScroll = el.id === 'reader-left' ? lastScrollTopLeft : lastScrollTopRight;
        
        if (!isProgrammaticScroll) {
            if (currentScroll > lastScroll && currentScroll > 60) {
                if (!state.autoScroll && els.settingsPanel.classList.contains('hidden') && !isHoveringControls) {
                    els.controlBar.classList.add('zen-hidden');
                    els.toplineNav.classList.add('zen-hidden');
                    els.sidebar.classList.add('collapsed');
                }
            } else if (currentScroll < lastScroll) {
                els.controlBar.classList.remove('zen-hidden');
                els.toplineNav.classList.remove('zen-hidden');
            }
        }
    }
    
    if (el.id === 'reader-left') {
        lastScrollTopLeft = currentScroll;
    } else {
        lastScrollTopRight = currentScroll;
    }
}

function showControlsTemp() {
    els.controlBar.classList.remove('zen-hidden');
    els.toplineNav.classList.remove('zen-hidden');
    
    if (controlsShowTimeout) clearTimeout(controlsShowTimeout);
    if (state.autoScroll) {
        controlsShowTimeout = setTimeout(() => {
            if (state.autoScroll && state.zenMode && els.settingsPanel.classList.contains('hidden') && !isHoveringControls) {
                els.controlBar.classList.add('zen-hidden');
                els.toplineNav.classList.add('zen-hidden');
            }
        }, 5000);
    }
}

function toggleAutoScroll() {
    if (autoScrollTimer) {
        clearInterval(autoScrollTimer);
        autoScrollTimer = null;
    }
    
    if (state.autoScroll) {
        setTimeout(() => {
            if (state.autoScroll && state.zenMode && els.settingsPanel.classList.contains('hidden') && !isHoveringControls) {
                els.controlBar.classList.add('zen-hidden');
                els.toplineNav.classList.add('zen-hidden');
            }
        }, 1500);

        autoScrollTimer = setInterval(() => {
            const leftColPage = els.readerLeft.querySelector('.book-page');
            const reachedBottom = leftColPage.scrollTop + leftColPage.clientHeight >= leftColPage.scrollHeight - 1;
            
            if (reachedBottom) {
                state.autoScroll = false;
                els.autoScrollToggle.checked = false;
                clearInterval(autoScrollTimer);
                autoScrollTimer = null;
                saveState();
                return;
            }
            
            isProgrammaticScroll = true;
            leftColPage.scrollTop += 1;
            setTimeout(() => { isProgrammaticScroll = false; }, 15);
            
        }, 130 - (state.scrollSpeed * 11));
    }
}

function handleResponsiveLayout() {
    if (window.innerWidth <= 768 && state.layoutMode === 'split') {
        setLayoutMode('single');
    }
}

// ═══════════════════════════════════════════════════════════════
// 13. Screen Wake Lock
// ═══════════════════════════════════════════════════════════════

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock is active');
        }
    } catch (err) {
        console.error('Failed to request screen Wake Lock:', err);
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
        console.log('Wake Lock released');
    }
}

document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible' && state.wakeLock) {
        await requestWakeLock();
    }
});

// ═══════════════════════════════════════════════════════════════
// 14. Event Sync scrolling
// ═══════════════════════════════════════════════════════════════

function syncRightScroll(e) {
    if (state.layoutMode !== 'split' || isSyncingRightScroll) return;
    isSyncingLeftScroll = true;
    isProgrammaticScroll = true;
    const leftEl = e.target;
    const rightEl = els.readerRight.querySelector('.book-page');
    const scrollPercentage = leftEl.scrollTop / (leftEl.scrollHeight - leftEl.clientHeight);
    rightEl.scrollTop = scrollPercentage * (rightEl.scrollHeight - rightEl.clientHeight);
    setTimeout(() => { 
        isSyncingLeftScroll = false; 
        isProgrammaticScroll = false;
    }, 50);
}

function syncLeftScroll(e) {
    if (state.layoutMode !== 'split' || isSyncingLeftScroll) return;
    isSyncingRightScroll = true;
    isProgrammaticScroll = true;
    const rightEl = e.target;
    const leftEl = els.readerLeft.querySelector('.book-page');
    const scrollPercentage = rightEl.scrollTop / (rightEl.scrollHeight - rightEl.clientHeight);
    leftEl.scrollTop = scrollPercentage * (leftEl.scrollHeight - leftEl.clientHeight);
    setTimeout(() => { 
        isSyncingRightScroll = false; 
        isProgrammaticScroll = false;
    }, 50);
}

// ═══════════════════════════════════════════════════════════════
// 15. Tooltips
// ═══════════════════════════════════════════════════════════════

function initGlobalTooltips() {
    const tooltip = document.getElementById('global-tooltip');
    if (!tooltip) return;
    
    let hideTimeout = null;
    let currentEl = null;
    
    function showTooltip(el) {
        if (currentEl === el) return;
        currentEl = el;
        
        const text = el.getAttribute('data-tooltip');
        if (!text) return;
        
        if (hideTimeout) { clearTimeout(hideTimeout); hideTimeout = null; }
        
        tooltip.textContent = text;
        tooltip.classList.add('visible');
        
        const rect = el.getBoundingClientRect();
        const tRect = tooltip.getBoundingClientRect();
        let left = rect.left + (rect.width / 2) - (tRect.width / 2);
        let top = rect.top - tRect.height - 8;
        
        left = Math.max(8, Math.min(window.innerWidth - tRect.width - 8, left));
        if (top < 8) top = rect.bottom + 8;
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    
    function hideTooltip() {
        if (hideTimeout) return;
        hideTimeout = setTimeout(() => {
            tooltip.classList.remove('visible');
            currentEl = null;
            hideTimeout = null;
        }, 80);
    }
    
    document.addEventListener('mouseover', (e) => {
        const el = e.target.closest('[data-tooltip]');
        if (el) {
            showTooltip(el);
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        const el = e.target.closest('[data-tooltip]');
        if (el) {
            const related = e.relatedTarget;
            if (!related || !el.contains(related)) {
                hideTooltip();
            }
        }
    });
    
    document.addEventListener('focusin', (e) => {
        const el = e.target.closest('[data-tooltip]');
        if (el) {
            showTooltip(el);
        }
    });
    
    document.addEventListener('focusout', (e) => {
        const el = e.target.closest('[data-tooltip]');
        if (el) {
            hideTooltip();
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// 16. UI Restoration
// ═══════════════════════════════════════════════════════════════

function applyStateToUI() {
    loadState();
    
    setLayoutMode(state.layoutMode);
    setTheme(state.activeTheme);

    els.fontSizeSlider.value = state.fontSize;
    els.fontSizeVal.textContent = state.fontSize;
    
    els.scrollSpeedSlider.value = state.scrollSpeed;
    els.scrollSpeedVal.textContent = (state.scrollSpeed / 3).toFixed(1);
    
    els.audioVolumeSlider.value = state.audioVolume;
    els.audioVolumeVal.textContent = state.audioVolume;
    updateAudioVolume(state.audioVolume);
    
    els.lineHeightSlider.value = state.lineHeight;
    els.lineHeightVal.textContent = (state.lineHeight / 10).toFixed(1);
    updateLineHeightInReaders();
    
    els.fontFamilySelect.value = state.fontFamily;
    updateFontFamily();
    
    if (state.wakeLock) {
        requestWakeLock();
    }
    
    els.doubleTapPauseToggle.checked = state.doubleTapPause;
    
    els.screenDimmerSlider.value = state.screenDimmer;
    els.screenDimmerVal.textContent = state.screenDimmer;
    if (els.screenDimmerOverlay) {
        els.screenDimmerOverlay.style.opacity = state.screenDimmer / 100;
    }
    
    selectSection(state.currentSection);
}
