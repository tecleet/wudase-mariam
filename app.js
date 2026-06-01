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
    currentSection: null,      // Deprecated in favor of leftSection/rightSection
    leftSection: null,         // Active prayer for left column
    rightSection: null,        // Active prayer for right column
    focusedSide: 'left',       // Focused panel: 'left' or 'right'
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
    screenDimmer: 0,           // Night overlay dim level (0-80)
    begenaEnabled: false,      // Begena loop active toggle
    zemaEnabled: false         // Daily chant player active toggle
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
    prayerList: document.getElementById('prayer-list'),
    
    layoutSingleBtn: document.getElementById('layout-single-btn'),
    layoutSplitBtn: document.getElementById('layout-split-btn'),
    
    settingsToggleBtn: document.getElementById('settings-toggle-btn'),
    settingsPanel: document.getElementById('settings-panel'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    
    fontSizeSlider: document.getElementById('font-size-slider'),
    fontSizeVal: document.getElementById('font-size-val'),
    
    begenaToggle: document.getElementById('begena-toggle'),
    zemaToggle: document.getElementById('zema-toggle'),
    zemaPlayerBar: document.getElementById('zema-player-bar'),
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

// Initialization trigger is placed at the bottom of this script to avoid Temporal Dead Zone (TDZ) ReferenceErrors.

function initializeApp() {
    if (typeof zemaPlayer !== 'undefined' && zemaPlayer.init) {
        zemaPlayer.init();
    }
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
    init3DGlobe();
    initScrollEndAnimations();
}

// ═══════════════════════════════════════════════════════════════
// 5. State Persistence
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'wudase_mariam_state';

function saveState() {
    const data = {
        leftSection: state.leftSection,
        rightSection: state.rightSection,
        focusedSide: state.focusedSide,
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
        screenDimmer: state.screenDimmer,
        begenaEnabled: state.begenaEnabled,
        zemaEnabled: state.zemaEnabled
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
            
            // Support migration from old currentSection key
            state.leftSection          = d.leftSection !== undefined ? d.leftSection : (d.currentSection !== undefined ? d.currentSection : null);
            state.rightSection         = d.rightSection !== undefined ? d.rightSection : (d.currentSection !== undefined ? d.currentSection : null);
            state.focusedSide          = d.focusedSide || 'left';
            
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
            state.begenaEnabled        = d.begenaEnabled !== undefined ? d.begenaEnabled : false;
            state.zemaEnabled          = d.zemaEnabled !== undefined ? d.zemaEnabled : false;
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
const ZEMA_CONFIG = {
    basePath: 'https://ethiopianorthodox.org/churchmusic/zema%20timehert%20bet/mahlet%20yared/7.%20meeraf/',
    prayers: {
        monday: {
            folder: '44%20wudase%20mariam%20ze%20senuy/',
            tracksCount: 11,
            title: 'ውዳሴ ማርያም ዘሰኑይ (ሰኞ)'
        },
        tuesday: {
            folder: '48%20zeselus%20wudase%20mariam/',
            tracksCount: 16,
            title: 'ውዳሴ ማርያም ዘሰሉስ (ማክሰኞ)'
        },
        wednesday: {
            folder: '51%20%20zerebuwudase%20mariam/',
            tracksCount: 9,
            title: 'ውዳሴ ማርያም ዘረቡዕ (ረቡዕ)'
        },
        thursday: {
            folder: '55%20wudase%20mariam%20zehamus/',
            tracksCount: 8,
            title: 'ውዳሴ ማርያም ዘሐሙስ (ሐሙስ)'
        },
        friday: {
            folder: '59%20wudase%20mariam%20zearb/',
            tracksCount: 7,
            title: 'ውዳሴ ማርያም ዘአርብ (አርብ)'
        },
        saturday: {
            folder: '63%20wudase%20mariam%20zeqedamit/',
            tracksCount: 12,
            title: 'ውዳሴ ማርያም ዘቀዳሚት (ቅዳሜ)'
        },
        sunday: {
            folder: '28%20wudase%20mariam%20zesenbet/',
            tracksCount: 13,
            title: 'ውዳሴ ማርያም ዘሰንበት (እሁድ)'
        },
        anqetse_birhan: {
            folder: '30%20anketse%20birhan/',
            tracksCount: 14,
            title: 'አንቀጸ ብርሃን (Anqetse Birhan)'
        }
    }
};

const zemaPlayer = {
    audio: null,
    currentDay: null,
    currentTrackIdx: 1,
    isPlaying: false,
    isMuted: false,
    
    init() {
        this.audio = new Audio();
        
        this.audio.addEventListener('ended', () => this.onTrackEnded());
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('play', () => this.onPlayStateChange(true));
        this.audio.addEventListener('pause', () => this.onPlayStateChange(false));
        this.audio.addEventListener('error', (e) => this.onAudioError(e));
        
        const prog = document.getElementById('zema-progress-container');
        if (prog) {
            prog.addEventListener('click', (e) => this.seek(e));
        }
        
        document.getElementById('zema-play-btn')?.addEventListener('click', () => this.togglePlay());
        document.getElementById('zema-prev-btn')?.addEventListener('click', () => this.playPrev());
        document.getElementById('zema-next-btn')?.addEventListener('click', () => this.playNext());
        document.getElementById('zema-mute-btn')?.addEventListener('click', () => this.toggleMute());
        document.getElementById('zema-close-btn')?.addEventListener('click', () => {
            this.pause();
            state.zemaEnabled = false;
            els.zemaToggle.checked = false;
            saveState();
            this.updatePlayerVisibility();
        });
    },
    
    updatePlayerVisibility() {
        if (state.zemaEnabled) {
            els.zemaPlayerBar.classList.remove('hidden');
            this.syncWithCurrentPrayer();
        } else {
            els.zemaPlayerBar.classList.add('hidden');
            this.pause();
            document.querySelectorAll('.stanza-paragraph').forEach(p => p.classList.remove('active-audio-playing'));
        }
    },
    
    syncWithCurrentPrayer() {
        if (!state.zemaEnabled) return;
        const activeSection = (state.layoutMode === 'split' && state.focusedSide === 'right') ? state.rightSection : state.leftSection;
        
        if (!activeSection || !ZEMA_CONFIG.prayers[activeSection]) {
            this.currentDay = null;
            this.updatePlayerUI(false, "ዜማ አልተዘጋጀም / No chanting audio available");
            return;
        }
        
        if (this.currentDay !== activeSection) {
            this.currentDay = activeSection;
            this.currentTrackIdx = 1;
            this.isPlaying = false;
            this.audio.src = '';
            this.updatePlayerUI(true, "ዝግጁ / Ready");
            this.highlightActiveStanza();
        }
    },
    
    updatePlayerUI(hasAudio, message) {
        const playBtn = document.getElementById('zema-play-btn');
        const prevBtn = document.getElementById('zema-prev-btn');
        const nextBtn = document.getElementById('zema-next-btn');
        const progress = document.getElementById('zema-progress-container');
        const titleEl = document.getElementById('zema-track-title');
        const statusEl = document.getElementById('zema-track-status');
        
        if (!playBtn || !prevBtn || !nextBtn || !progress || !titleEl || !statusEl) return;
        
        if (hasAudio) {
            const config = ZEMA_CONFIG.prayers[this.currentDay];
            titleEl.textContent = config.title;
            
            let trackName = `ክፍል ${this.currentTrackIdx} / Section ${this.currentTrackIdx}`;
            if (this.currentTrackIdx === 1) {
                trackName = "መቅድም (መግቢያ) / Introduction";
            } else if (this.currentTrackIdx === config.tracksCount) {
                if (this.currentDay === 'monday' || this.currentDay === 'tuesday') {
                    trackName = "ማጠቃለያ / Concluding Prayer";
                }
            }
            statusEl.textContent = message || trackName;
            
            playBtn.removeAttribute('disabled');
            prevBtn.removeAttribute('disabled');
            nextBtn.removeAttribute('disabled');
            progress.style.pointerEvents = 'auto';
            progress.style.opacity = '1';
        } else {
            titleEl.textContent = "ውዳሴ ማርያም ዜማ";
            statusEl.textContent = message;
            
            playBtn.setAttribute('disabled', 'true');
            prevBtn.setAttribute('disabled', 'true');
            nextBtn.setAttribute('disabled', 'true');
            progress.style.pointerEvents = 'none';
            progress.style.opacity = '0.3';
            
            const bar = document.getElementById('zema-progress-bar');
            if (bar) bar.style.width = '0%';
        }
        this.updatePlayBtnIcon();
    },
    
    updatePlayBtnIcon() {
        const playIcon = document.querySelector('.zema-btn-icon-play');
        const pauseIcon = document.querySelector('.zema-btn-icon-pause');
        if (!playIcon || !pauseIcon) return;
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    },
    
    playTrack(idx) {
        if (!this.currentDay) return;
        const config = ZEMA_CONFIG.prayers[this.currentDay];
        if (idx < 1 || idx > config.tracksCount) return;
        
        this.currentTrackIdx = idx;
        const url = `${ZEMA_CONFIG.basePath}${config.folder}${idx}.mp3`;
        
        this.audio.src = url;
        this.audio.volume = state.audioVolume / 100;
        
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.updatePlayerUI(true);
                this.highlightActiveStanza();
            })
            .catch(err => {
                console.error("Zema playback failed:", err);
                this.isPlaying = false;
                this.updatePlayerUI(true, "መጫወት አልተቻለም / Load failed (check network)");
            });
    },
    
    togglePlay() {
        if (!this.currentDay) return;
        if (this.isPlaying) {
            this.pause();
        } else {
            if (!this.audio.src || this.audio.src === window.location.href) {
                this.playTrack(this.currentTrackIdx);
            } else {
                this.audio.play()
                    .then(() => {
                        this.isPlaying = true;
                        this.updatePlayBtnIcon();
                        this.highlightActiveStanza();
                    })
                    .catch(err => {
                        console.error("Zema resume failed:", err);
                        this.playTrack(this.currentTrackIdx);
                    });
            }
        }
    },
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayBtnIcon();
    },
    
    playPrev() {
        if (!this.currentDay) return;
        if (this.currentTrackIdx > 1) {
            this.playTrack(this.currentTrackIdx - 1);
        } else {
            const config = ZEMA_CONFIG.prayers[this.currentDay];
            this.playTrack(config.tracksCount);
        }
    },
    
    playNext() {
        if (!this.currentDay) return;
        const config = ZEMA_CONFIG.prayers[this.currentDay];
        if (this.currentTrackIdx < config.tracksCount) {
            this.playTrack(this.currentTrackIdx + 1);
        } else {
            this.playTrack(1);
        }
    },
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        
        const volIcon = document.querySelector('.zema-volume-icon');
        const muteIcon = document.querySelector('.zema-mute-icon');
        if (volIcon && muteIcon) {
            if (this.isMuted) {
                volIcon.style.display = 'none';
                muteIcon.style.display = 'block';
            } else {
                volIcon.style.display = 'block';
                muteIcon.style.display = 'none';
            }
        }
    },
    
    seek(e) {
        if (!this.audio.duration) return;
        const prog = document.getElementById('zema-progress-container');
        if (!prog) return;
        const rect = prog.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        this.audio.currentTime = percentage * this.audio.duration;
    },
    
    onTrackEnded() {
        this.playNext();
    },
    
    onTimeUpdate() {
        if (!this.audio.duration) return;
        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        const progressEl = document.getElementById('zema-progress-bar');
        if (progressEl) {
            progressEl.style.width = pct + '%';
        }
    },
    
    onPlayStateChange(playing) {
        this.isPlaying = playing;
        this.updatePlayBtnIcon();
    },
    
    onAudioError(e) {
        console.error("Zema audio element error:", e);
        if (this.audio.src) {
            this.isPlaying = false;
            this.updatePlayerUI(true, "ስህተት ገጥሟል / Playback error");
        }
    },
    
    highlightActiveStanza() {
        document.querySelectorAll('.stanza-paragraph').forEach(p => p.classList.remove('active-audio-playing'));
        if (!this.currentDay) return;
        
        const activeStanzaIdx = this.currentTrackIdx - 1;
        if (activeStanzaIdx < 1) return;
        
        const activeStanzas = document.querySelectorAll(`.stanza-paragraph[data-stanza-idx="${activeStanzaIdx}"]`);
        activeStanzas.forEach(p => {
            p.classList.add('active-audio-playing');
            if (!state.autoScroll) {
                p.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
};

let begenaAudio = null;

function getBegenaAudio() {
    if (!begenaAudio) {
        begenaAudio = new Audio('begena.mp3');
        begenaAudio.loop = true;
    }
    return begenaAudio;
}

function updateAudioVolume(volume) {
    const audio = getBegenaAudio();
    if (audio) {
        audio.volume = volume / 100;
    }
    if (typeof zemaPlayer !== 'undefined' && zemaPlayer.audio) {
        zemaPlayer.audio.volume = volume / 100;
    }
}

async function startBegenaPlucks() {
    try {
        const audio = getBegenaAudio();
        audio.volume = state.audioVolume / 100;
        await audio.play();
    } catch (e) {
        console.log('Begena play deferred until user interaction:', e);
    }
}

function stopBegenaPlucks() {
    const audio = getBegenaAudio();
    if (audio) {
        audio.pause();
    }
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
    let stanzaCounter = 0;

    stanzas.forEach(stanza => {
        if (!stanza.trim()) return;
        stanzaCounter++;
        
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

        htmlContent += `<div class="stanza-paragraph" data-stanza-idx="${stanzaCounter}">${processedStanza}</div>`;
    });

    return htmlContent;
}

// ═══════════════════════════════════════════════════════════════
// 9. Main Rendering & Layout
// ═══════════════════════════════════════════════════════════════

function renderActivePrayer() {
    if (!state.prayers) return;
    
    // Left Column
    const leftSection = state.leftSection;
    if (leftSection === null) {
        els.coverPageLeft.classList.remove('hidden');
        els.prayerDisplayLeft.classList.add('hidden');
    } else {
        const leftPrayerData = state.prayers[leftSection];
        if (leftPrayerData) {
            els.coverPageLeft.classList.add('hidden');
            els.prayerDisplayLeft.classList.remove('hidden');
            
            let leftContent = leftPrayerData.content[state.leftLang] || '';
            let leftLangForFont = state.leftLang;
            
            // Fallback to Ge'ez if content is placeholder/missing (e.g. Melka Eyesus/Mariam)
            if (leftContent.length < 100 && leftPrayerData.content['ge'] && state.leftLang !== 'ge') {
                const note = state.leftLang === 'am' ? 
                    "\n\n*(ማሳሰቢያ፡ ይህ ጸሎት በአማርኛ ትርጉም ስለማይገኝ በግዕዝ ቀርቧል።)*" : 
                    "\n\n*(Note: Since this prayer is not available in English translation, it is presented in Ge'ez.)*";
                leftContent = leftPrayerData.content['ge'] + note;
                leftLangForFont = 'ge';
            }
            
            setReaderFontFamily(els.contentLeft, leftLangForFont);
            els.titleLeft.innerHTML = leftPrayerData.title[state.leftLang] || '';
            els.contentLeft.innerHTML = processTextContent(leftContent, leftLangForFont);
        }
    }
    
    // Right Column
    if (state.layoutMode === 'split') {
        const rightSection = state.rightSection;
        if (rightSection === null) {
            els.coverPageRight.classList.remove('hidden');
            els.prayerDisplayRight.classList.add('hidden');
        } else {
            const rightPrayerData = state.prayers[rightSection];
            if (rightPrayerData) {
                els.coverPageRight.classList.add('hidden');
                els.prayerDisplayRight.classList.remove('hidden');
                
                let rightContent = rightPrayerData.content[state.rightLang] || '';
                let rightLangForFont = state.rightLang;
                
                // Fallback to Ge'ez if content is placeholder/missing (e.g. Melka Eyesus/Mariam)
                if (rightContent.length < 100 && rightPrayerData.content['ge'] && state.rightLang !== 'ge') {
                    const note = state.rightLang === 'am' ? 
                        "\n\n*(ማሳሰቢያ፡ ይህ ጸሎት በአማርኛ ትርጉም ስለማይገኝ በግዕዝ ቀርቧል።)*" : 
                        "\n\n*(Note: Since this prayer is not available in English translation, it is presented in Ge'ez.)*";
                    rightContent = rightPrayerData.content['ge'] + note;
                    rightLangForFont = 'ge';
                }
                
                setReaderFontFamily(els.contentRight, rightLangForFont);
                els.titleRight.innerHTML = rightPrayerData.title[state.rightLang] || '';
                els.contentRight.innerHTML = processTextContent(rightContent, rightLangForFont);
            }
        }
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
        
        els.readerLeft.classList.remove('focused');
        els.readerRight.classList.remove('focused');
        
        updateNavigationHighlights(state.leftSection);
    } else {
        els.layoutSingleBtn.classList.remove('active');
        els.layoutSplitBtn.classList.add('active');
        els.readersContainer.classList.remove('mode-single');
        els.readersContainer.classList.add('mode-split');
        els.readerRight.classList.remove('hidden');
        
        setFocusedSide(state.focusedSide);
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
    
    // Retrigger active scroll-end animations to update theme colors
    ['left', 'right'].forEach(side => {
        const ind = document.getElementById(`scroll-end-${side}`);
        if (ind && ind.classList.contains('visible')) {
            startScrollEndAnimation(side);
        }
    });
    
    saveState();
}

function setFocusedSide(side) {
    if (state.layoutMode !== 'split') return;
    
    state.focusedSide = side;
    saveState();
    
    if (side === 'left') {
        els.readerLeft.classList.add('focused');
        els.readerRight.classList.remove('focused');
        updateNavigationHighlights(state.leftSection);
    } else {
        els.readerRight.classList.add('focused');
        els.readerLeft.classList.remove('focused');
        updateNavigationHighlights(state.rightSection);
    }
    
    if (typeof zemaPlayer !== 'undefined' && zemaPlayer.syncWithCurrentPrayer) {
        zemaPlayer.syncWithCurrentPrayer();
    }
}

function updateNavigationHighlights(sectionKey) {
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
}

function selectSection(sectionKey) {
    if (state.layoutMode === 'split') {
        if (state.focusedSide === 'left') {
            state.leftSection = sectionKey;
        } else {
            state.rightSection = sectionKey;
        }
    } else {
        state.leftSection = sectionKey;
    }
    saveState();
    
    updateNavigationHighlights(sectionKey);
    renderActivePrayer();
    
    const focusedReader = (state.layoutMode === 'split' && state.focusedSide === 'right') ? els.readerRight : els.readerLeft;
    focusedReader.querySelector('.book-page').scrollTop = 0;
    
    if (window.innerWidth <= 768) {
        els.sidebar.classList.add('collapsed');
    }
    showControlsTemp();
    
    if (typeof zemaPlayer !== 'undefined' && zemaPlayer.syncWithCurrentPrayer) {
        zemaPlayer.syncWithCurrentPrayer();
    }
}

function cycleGlobalLanguage() {
    if (state.layoutMode === 'split') {
        if (state.focusedSide === 'left') {
            state.leftLang = state.leftLang === 'ge' ? 'am' : state.leftLang === 'am' ? 'en' : 'ge';
        } else {
            state.rightLang = state.rightLang === 'ge' ? 'am' : state.rightLang === 'am' ? 'en' : 'ge';
        }
    } else {
        state.leftLang = state.leftLang === 'ge' ? 'am' : state.leftLang === 'am' ? 'en' : 'ge';
    }
    saveState();
    renderActivePrayer();
    
    if (typeof zemaPlayer !== 'undefined' && zemaPlayer.syncWithCurrentPrayer) {
        zemaPlayer.syncWithCurrentPrayer();
    }
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

    els.begenaToggle.addEventListener('change', async (e) => {
        state.begenaEnabled = e.target.checked;
        saveState();
        if (e.target.checked) {
            await startBegenaPlucks();
        } else {
            stopBegenaPlucks();
        }
    });

    els.zemaToggle.addEventListener('change', (e) => {
        state.zemaEnabled = e.target.checked;
        saveState();
        if (zemaPlayer) {
            zemaPlayer.updatePlayerVisibility();
            if (state.zemaEnabled && zemaPlayer.currentDay) {
                zemaPlayer.playTrack(zemaPlayer.currentTrackIdx);
            }
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
        if (begenaAudio && begenaAudio.paused && state.begenaEnabled) {
            begenaAudio.play().catch(err => console.log('Begena resume on click failed:', err));
        }
        if (zemaPlayer && zemaPlayer.audio && zemaPlayer.audio.paused && zemaPlayer.isPlaying && state.zemaEnabled) {
            zemaPlayer.audio.play().catch(err => console.log('Zema resume on click failed:', err));
        }
        if (els.settingsPanel && !els.settingsPanel.classList.contains('hidden') &&
            !els.settingsPanel.contains(e.target) &&
            !els.settingsToggleBtn.contains(e.target) &&
            (!els.langCycleFloatingBtn || !els.langCycleFloatingBtn.contains(e.target))) {
            els.settingsPanel.classList.add('hidden');
        }
        if (els.sidebar && !els.sidebar.classList.contains('collapsed') &&
            !els.sidebar.contains(e.target) &&
            !els.menuToggleBtn.contains(e.target)) {
            els.sidebar.classList.add('collapsed');
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
    
    // Column focus listeners for split-screen mode
    els.readerLeft.addEventListener('click', () => {
        if (state.layoutMode === 'split') {
            setFocusedSide('left');
        }
    });
    els.readerRight.addEventListener('click', () => {
        if (state.layoutMode === 'split') {
            setFocusedSide('right');
        }
    });
    
    const handleDoubleTapToPause = () => {
        if (!state.doubleTapPause) return;
        state.autoScroll = !state.autoScroll;
        els.autoScrollToggle.checked = state.autoScroll;
        els.autoScrollToggle.dispatchEvent(new Event('change'));
        saveState();
    };

    els.readerLeft.querySelector('.book-page').addEventListener('dblclick', handleDoubleTapToPause);
    els.readerRight.querySelector('.book-page').addEventListener('dblclick', handleDoubleTapToPause);

    const controlElements = [
        els.controlBar,
        els.toplineNav,
        els.settingsPanel,
        els.sidebar,
        els.settingsToggleBtn,
        els.langCycleFloatingBtn,
        els.zemaPlayerBar
    ];
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

    els.readersContainer.addEventListener('click', (e) => {
        const p = e.target.closest('.stanza-paragraph');
        if (p && state.zemaEnabled) {
            const idx = parseInt(p.getAttribute('data-stanza-idx'));
            if (!isNaN(idx)) {
                zemaPlayer.playTrack(idx + 1);
            }
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// 12. Auto Scroll & Zen scrolling
// ═══════════════════════════════════════════════════════════════

function setZenHidden(hidden) {
    if (hidden) {
        els.controlBar.classList.add('zen-hidden');
        els.toplineNav.classList.add('zen-hidden');
    } else {
        els.controlBar.classList.remove('zen-hidden');
        els.toplineNav.classList.remove('zen-hidden');
    }
}

function handleReaderScrollEvents(e) {
    const el = e.target;
    const currentScroll = el.scrollTop;
    
    // Check if user has scrolled to the bottom (within 10px threshold)
    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    
    if (reachedBottom) {
        setZenHidden(false);
    } else if (state.zenMode) {
        const lastScroll = el.id === 'reader-left' ? lastScrollTopLeft : lastScrollTopRight;
        
        if (!isProgrammaticScroll) {
            if (currentScroll > lastScroll && currentScroll > 60) {
                if (!state.autoScroll && els.settingsPanel.classList.contains('hidden') && !isHoveringControls) {
                    setZenHidden(true);
                    els.sidebar.classList.add('collapsed');
                }
            } else if (currentScroll < lastScroll) {
                setZenHidden(false);
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
    setZenHidden(false);
    
    if (controlsShowTimeout) clearTimeout(controlsShowTimeout);
    if (state.autoScroll) {
        controlsShowTimeout = setTimeout(() => {
            if (state.autoScroll && state.zenMode && els.settingsPanel.classList.contains('hidden') && !isHoveringControls) {
                setZenHidden(true);
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
                setZenHidden(true);
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
                setZenHidden(false);
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
    if (state.leftSection !== state.rightSection) return; // Only sync scrolls if both sides show the same prayer
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
    if (state.leftSection !== state.rightSection) return; // Only sync scrolls if both sides show the same prayer
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
    
    els.begenaToggle.checked = state.begenaEnabled;
    els.zemaToggle.checked = state.zemaEnabled;
    if (state.begenaEnabled) {
        startBegenaPlucks();
    }
    if (typeof zemaPlayer !== 'undefined' && zemaPlayer.updatePlayerVisibility) {
        zemaPlayer.updatePlayerVisibility();
    }
    
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
    
    if (state.layoutMode === 'split') {
        setFocusedSide(state.focusedSide);
    } else {
        updateNavigationHighlights(state.leftSection);
    }
    renderActivePrayer();
}

// ═══════════════════════════════════════════════════════════════
// 17. 3D Rotating Wireframe Globe Animation (Canvas)
// ═══════════════════════════════════════════════════════════════

function init3DGlobe() {
    const canvas = document.getElementById('globe-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Handle High-DPI / Retina screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 28 * dpr;
    canvas.height = 28 * dpr;
    ctx.scale(dpr, dpr);

    const cx = 14;
    const cy = 14;
    const R = 12; // Radius of the globe (leaving 2px margin)
    
    // Viewing geometry params
    const axialTilt = -23.4 * Math.PI / 180; // Sideways tilt (Z-axis rotation)
    const viewElevation = 15 * Math.PI / 180; // Looking down from above (X-axis rotation)
    
    let spinAngle = 0;
    
    // Define latitude and longitude lines in degrees
    const latitudes = [-60, -30, 0, 30, 60]; 
    const longitudes = [0, 30, 60, 90, 120, 150]; 

    // Number of segments to use for drawing a circle
    const steps = 60;

    function animate() {
        ctx.clearRect(0, 0, 28, 28);
        
        // Spin the globe over time (left-to-right rotation)
        spinAngle += 0.012; 
        if (spinAngle > 2 * Math.PI) {
            spinAngle -= 2 * Math.PI;
        }

        // Fetch style colors dynamically from button (white on hover, gold otherwise)
        const btn = document.getElementById('lang-cycle-floating-btn');
        let strokeColor = '#c59b27'; // fallback gold
        if (btn) {
            strokeColor = window.getComputedStyle(btn).color || strokeColor;
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // 1. Draw outer silhouette boundary circle
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, 2 * Math.PI);
        ctx.lineWidth = 1.3; // Slightly thicker boundary
        ctx.stroke();

        ctx.lineWidth = 0.8; // Thin wireframe interior lines

        // Helper to project 3D point (x, y, z) to 2D screen coordinates with tilts
        function project(x, y, z) {
            // Apply Y-rotation (spin)
            const cosS = Math.cos(spinAngle);
            const sinS = Math.sin(spinAngle);
            const xRot = x * cosS + z * sinS;
            const yRot = y;
            const zRot = -x * sinS + z * cosS;

            // Apply axial tilt around Z-axis
            const cosT = Math.cos(axialTilt);
            const sinT = Math.sin(axialTilt);
            const xTilted = xRot * cosT - yRot * sinT;
            const yTilted = xRot * sinT + yRot * cosT;
            const zTilted = zRot;

            // Apply viewing elevation tilt around X-axis
            const cosE = Math.cos(viewElevation);
            const sinE = Math.sin(viewElevation);
            const xProj = xTilted;
            const yProj = yTilted * cosE - zTilted * sinE;
            const zProj = yTilted * sinE + zTilted * cosE;

            return {
                x: cx + xProj,
                y: cy - yProj, // Canvas Y goes down
                z: zProj // depth (positive is front-facing)
            };
        }

        // Draw parallels (latitude lines)
        latitudes.forEach(latDeg => {
            const phi = latDeg * Math.PI / 180;
            const rLat = R * Math.cos(phi);
            const yLat = R * Math.sin(phi);

            ctx.beginPath();
            let lastFront = false;

            for (let i = 0; i <= steps; i++) {
                const theta = (i / steps) * 2 * Math.PI;
                const x = rLat * Math.sin(theta);
                const y = yLat;
                const z = rLat * Math.cos(theta);

                const proj = project(x, y, z);

                if (proj.z > 0) {
                    if (!lastFront) {
                        ctx.moveTo(proj.x, proj.y);
                    } else {
                        ctx.lineTo(proj.x, proj.y);
                    }
                    lastFront = true;
                } else {
                    lastFront = false;
                }
            }
            ctx.stroke();
        });

        // Draw meridians (longitude lines)
        longitudes.forEach(longDeg => {
            const lambda = longDeg * Math.PI / 180;

            ctx.beginPath();
            let lastFront = false;

            for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * 2 * Math.PI;
                const x = R * Math.cos(t) * Math.sin(lambda);
                const y = R * Math.sin(t);
                const z = R * Math.cos(t) * Math.cos(lambda);

                const proj = project(x, y, z);

                if (proj.z > 0) {
                    if (!lastFront) {
                        ctx.moveTo(proj.x, proj.y);
                    } else {
                        ctx.lineTo(proj.x, proj.y);
                    }
                    lastFront = true;
                } else {
                    lastFront = false;
                }
            }
            ctx.stroke();
        });

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

// ═══════════════════════════════════════════════════════════════
// 17. Scroll-End Mathematical Animations (Orthodox Cross)
// ═══════════════════════════════════════════════════════════════
const scrollEndAnimations = {
    left: {
        canvas: null,
        ctx: null,
        frame: 0,
        animationFrameId: null,
        isActive: false
    },
    right: {
        canvas: null,
        ctx: null,
        frame: 0,
        animationFrameId: null,
        isActive: false
    }
};

function startScrollEndAnimation(side) {
    const anim = scrollEndAnimations[side];
    if (!anim.canvas) {
        anim.canvas = document.getElementById(`scroll-end-canvas-${side}`);
        if (!anim.canvas) return;
        anim.ctx = anim.canvas.getContext('2d');
    }
    
    // Reset state
    anim.frame = 0;
    anim.isActive = true;
    
    // Clear canvas
    anim.ctx.clearRect(0, 0, anim.canvas.width, anim.canvas.height);
    
    // Setup stroke colors from styles
    const bodyStyles = getComputedStyle(document.body);
    anim.goldColor = bodyStyles.getPropertyValue('--color-gold').trim() || '#c59b27';
    anim.burgundyColor = bodyStyles.getPropertyValue('--color-burgundy').trim() || '#6c1a1c';
    
    if (anim.animationFrameId) {
        cancelAnimationFrame(anim.animationFrameId);
    }
    
    const ctx = anim.ctx;
    
    function drawTrefoil(ctx, x, y, r, color) {
        ctx.beginPath();
        // 3 overlapping circles at the tip to represent trefoil ends
        ctx.arc(x, y - r/1.5, r, 0, 2 * Math.PI);
        ctx.arc(x - r/1.5, y + r/3, r, 0, 2 * Math.PI);
        ctx.arc(x + r/1.5, y + r/3, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;
        ctx.fill();
    }
    
    function draw() {
        if (!anim.isActive) return;
        
        ctx.clearRect(0, 0, anim.canvas.width, anim.canvas.height);
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const f = anim.frame;
        
        // Stage 1: Vertical shaft from (150, 50) to (150, 250)
        if (f > 0) {
            const t = Math.min(1, f / 40);
            ctx.beginPath();
            ctx.moveTo(150, 50);
            ctx.lineTo(150, 50 + (250 - 50) * t);
            ctx.strokeStyle = anim.goldColor;
            ctx.shadowBlur = 6;
            ctx.shadowColor = anim.goldColor;
            ctx.stroke();
        }
        
        // Stage 2: Top crossbeam from (120, 90) to (180, 90)
        if (f > 40) {
            const t = Math.min(1, (f - 40) / 20);
            ctx.beginPath();
            ctx.moveTo(150 - 30 * t, 90);
            ctx.lineTo(150 + 30 * t, 90);
            ctx.strokeStyle = anim.goldColor;
            ctx.stroke();
        }
        
        // Stage 3: Middle crossbeam from (90, 135) to (210, 135)
        if (f > 60) {
            const t = Math.min(1, (f - 60) / 25);
            ctx.beginPath();
            ctx.moveTo(150 - 60 * t, 135);
            ctx.lineTo(150 + 60 * t, 135);
            ctx.strokeStyle = anim.goldColor;
            ctx.stroke();
        }
        
        // Stage 4: Slanted footrest from (125, 210) to (175, 194)
        if (f > 85) {
            const t = Math.min(1, (f - 85) / 20);
            ctx.beginPath();
            ctx.moveTo(150 - 25 * t, 202 + 8 * t);
            ctx.lineTo(150 + 25 * t, 202 - 8 * t);
            ctx.strokeStyle = anim.goldColor;
            ctx.stroke();
        }
        
        // Stage 5: Central halo circle around (150, 135) with radius 24
        if (f > 105) {
            const t = Math.min(1, (f - 105) / 35);
            ctx.beginPath();
            ctx.arc(150, 135, 24, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * t);
            ctx.strokeStyle = anim.burgundyColor;
            ctx.shadowColor = anim.burgundyColor;
            ctx.stroke();
        }
        
        // Stage 6: Central radiating rays from (150, 135)
        if (f > 140) {
            const t = Math.min(1, (f - 140) / 20);
            const rayLen = 13 * t;
            ctx.strokeStyle = anim.goldColor;
            ctx.shadowColor = anim.goldColor;
            ctx.lineWidth = 2.0;
            
            ctx.beginPath();
            ctx.moveTo(150, 135); ctx.lineTo(150 + rayLen, 135 - rayLen);
            ctx.moveTo(150, 135); ctx.lineTo(150 - rayLen, 135 - rayLen);
            ctx.moveTo(150, 135); ctx.lineTo(150 - rayLen, 135 + rayLen);
            ctx.moveTo(150, 135); ctx.lineTo(150 + rayLen, 135 + rayLen);
            ctx.stroke();
        }
        
        // Stage 7: Trefoil rosettes at the tips
        if (f > 160) {
            const t = Math.min(1, (f - 160) / 25);
            const r_t = 4 * t;
            
            drawTrefoil(ctx, 150, 50, r_t, anim.goldColor);
            drawTrefoil(ctx, 90, 135, r_t, anim.goldColor);
            drawTrefoil(ctx, 210, 135, r_t, anim.goldColor);
            drawTrefoil(ctx, 150, 250, r_t, anim.goldColor);
        }
        
        // Stage 8: Central cross dot at (150, 135)
        if (f > 185) {
            const t = Math.min(1, (f - 185) / 5);
            ctx.beginPath();
            ctx.arc(150, 135, 3.5 * t, 0, 2 * Math.PI);
            ctx.fillStyle = anim.burgundyColor;
            ctx.shadowColor = anim.burgundyColor;
            ctx.fill();
        }
        
        if (f < 195) {
            anim.frame += 1;
            anim.animationFrameId = requestAnimationFrame(draw);
        } else {
            anim.isActive = false;
        }
    }
    
    anim.animationFrameId = requestAnimationFrame(draw);
}

function stopScrollEndAnimation(side) {
    const anim = scrollEndAnimations[side];
    anim.isActive = false;
    if (anim.animationFrameId) {
        cancelAnimationFrame(anim.animationFrameId);
        anim.animationFrameId = null;
    }
}

function initScrollEndAnimations() {
    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // trigger when 10% visible
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const side = entry.target.id === 'scroll-end-left' ? 'left' : 'right';
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                startScrollEndAnimation(side);
            } else {
                entry.target.classList.remove('visible');
                stopScrollEndAnimation(side);
            }
        });
    }, observerOptions);
    
    const leftIndicator = document.getElementById('scroll-end-left');
    const rightIndicator = document.getElementById('scroll-end-right');
    
    if (leftIndicator) observer.observe(leftIndicator);
    if (rightIndicator) observer.observe(rightIndicator);
}

// ═══════════════════════════════════════════════════════════════
// 18. App Initialization Trigger
// ═══════════════════════════════════════════════════════════════
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
