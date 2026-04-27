// Lao Wang Tea Shop — Traditional Chinese Music Player (YouTube-backed)
// Persists track, position, and play state across page navigation via sessionStorage
(function () {
  'use strict';

  const STORAGE_KEY = 'lwts_music';

  const PLAYLIST = [
    { id: 'W8x4m-qpmJ8', title: '古筝琴音', label: 'Guzheng Classical' },
    { id: 'OjNpRbNdR7E', title: '中国传统音乐', label: 'Traditional Mix' },
    { id: 'aCgP8BFjrw4', title: '古典乐章', label: 'Classical Chinese' },
    { id: 'RennYd-q0jA', title: '茶道古筝', label: 'Tea Ceremony Guzheng' },
    { id: '-O94LSIswtk', title: '古茶馆', label: 'Ancient Teahouse Ambience' },
    { id: 'tIYu_mWBTkI', title: '古筝与竹笛', label: 'Guzheng & Bamboo Flute' },
    { id: 'ximY1AFvkrU', title: '传统乐器合奏', label: 'Traditional Ensemble' },
    { id: 'fWN4_Ik78bU', title: '山静风轻', label: 'Guzheng · Silent Mountains' },
    { id: 'UOpgS3JDs10', title: '蜀琴雅音', label: 'Guqin Tea Music' },
    { id: 'XySO6IRq2nU', title: '飞花点翠', label: 'Pipa Solo · Liu Fang' },
    { id: 'MjOBUoZqJlw', title: '古韵悠然', label: 'Ancient Chinese Ambient' },
  ];

  // ── State ─────────────────────────────────────────────────────────────
  let ytPlayer      = null;
  let apiReady      = false;
  let currentIdx    = 0;
  let isPlaying     = false;
  let isExpanded    = false;
  let eqInterval    = null;
  let posInterval   = null; // saves position every second while playing
  let resumeOnReady = false;
  let resumePos     = 0;    // seconds to seek to on resume

  // ── sessionStorage ────────────────────────────────────────────────────
  function saveState() {
    try {
      const pos = (ytPlayer && apiReady) ? (ytPlayer.getCurrentTime() || 0) : resumePos;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        idx:      currentIdx,
        playing:  isPlaying,
        open:     isExpanded,
        position: pos,
      }));
    } catch (e) {}
  }

  function loadState() {
    try {
      const s = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
      if (typeof s.idx === 'number')      currentIdx = s.idx;
      if (typeof s.position === 'number') resumePos  = s.position;
      if (s.open)    isExpanded = true;
      return s.playing === true;
    } catch (e) { return false; }
  }

  // Tick every second while playing to keep position fresh
  function startPosSave() {
    if (posInterval) return;
    posInterval = setInterval(saveState, 1000);
  }
  function stopPosSave() {
    clearInterval(posInterval);
    posInterval = null;
  }

  // ── YouTube IFrame API ────────────────────────────────────────────────
  function loadYTAPI() {
    if (document.getElementById('yt-api-script')) return;
    const s = document.createElement('script');
    s.id  = 'yt-api-script';
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  window.onYouTubeIframeAPIReady = function () {
    apiReady = true;
    ytPlayer = new YT.Player('yt-hidden-player', {
      height: '1',
      width:  '1',
      videoId: PLAYLIST[currentIdx].id,
      playerVars: {
        autoplay:       1,
        controls:       0,
        disablekb:      1,
        fs:             0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel:            0,
        origin:         window.location.origin,
      },
      events: {
        onReady: function (e) {
          e.target.setVolume(40);
          if (resumeOnReady) {
            if (resumePos > 0) {
              e.target.seekTo(resumePos, true);
            }
            setTimeout(function () { e.target.playVideo(); }, 300);
          }
        },
        onStateChange: function (e) {
          if (e.data === YT.PlayerState.ENDED)   { advanceTrack(1); }
          if (e.data === YT.PlayerState.PLAYING)  { setPlayState(true); }
          if (e.data === YT.PlayerState.PAUSED)   { setPlayState(false); }
        },
      },
    });
  };

  // ── Playback ──────────────────────────────────────────────────────────
  function loadTrack(idx) {
    currentIdx = ((idx % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
    resumePos  = 0; // new track = start from beginning
    if (ytPlayer && apiReady) {
      ytPlayer.loadVideoById(PLAYLIST[currentIdx].id);
    }
    refreshTrackInfo();
    saveState();
  }

  function advanceTrack(dir) { loadTrack(currentIdx + dir); }

  function togglePlay() {
    if (!ytPlayer || !apiReady) return;
    if (isPlaying) { ytPlayer.pauseVideo(); }
    else           { ytPlayer.playVideo();  }
  }

  function setPlayState(playing) {
    isPlaying = playing;
    const playBtn = document.getElementById('mp-play-btn');
    const fab     = document.getElementById('mp-fab');
    const eq      = document.getElementById('mp-eq');
    if (playBtn) playBtn.textContent = playing ? '⏸' : '▶';
    if (fab)     fab.textContent     = playing ? '⏸' : '▶';
    if (playing) {
      eq && eq.classList.remove('eq-paused');
      if (!eqInterval) eqInterval = setInterval(animateEq, 150);
      startPosSave();
    } else {
      eq && eq.classList.add('eq-paused');
      clearInterval(eqInterval); eqInterval = null;
      stopPosSave();
      saveState(); // save position at the moment of pause
    }
  }

  function refreshTrackInfo() {
    const t  = PLAYLIST[currentIdx];
    const el = function (id) { return document.getElementById(id); };
    if (el('mp-title')) el('mp-title').textContent = t.title;
    if (el('mp-label')) el('mp-label').textContent = t.label;
    if (el('mp-num'))   el('mp-num').textContent   = (currentIdx + 1) + ' / ' + PLAYLIST.length;
  }

  function animateEq() {
    document.querySelectorAll('#mp-eq span').forEach(function (b) {
      b.style.height = (4 + Math.random() * 18) + 'px';
    });
  }

  // ── Build UI ──────────────────────────────────────────────────────────
  function buildUI() {
    const css = document.createElement('style');
    css.textContent = `
      #mp-wrap {
        position: fixed; bottom: 18px; right: 18px;
        z-index: 99999; font-family: Georgia, serif;
        display: flex; flex-direction: column; align-items: flex-end;
      }
      #mp-panel {
        display: none;
        background: #3a0a00;
        border: 2px solid #ffd700;
        border-radius: 4px;
        padding: 14px 16px 10px;
        margin-bottom: 8px;
        width: 240px;
        box-shadow: 0 4px 20px rgba(0,0,0,.55);
        color: #ffd700;
      }
      #mp-panel.mp-open { display: block; }
      #mp-title {
        font-size: 13px; font-weight: bold; color: #ffd700;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        margin-bottom: 1px;
      }
      #mp-label {
        font-size: 10px; color: #c8a060; font-style: italic;
        margin-bottom: 12px;
      }
      #mp-controls {
        display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
      }
      .mp-btn {
        background: none; border: 1.5px solid #ffd700; color: #ffd700;
        border-radius: 50%; cursor: pointer; font-size: 13px;
        width: 30px; height: 30px;
        display: flex; align-items: center; justify-content: center;
        transition: background .15s;
      }
      .mp-btn:hover { background: rgba(255,215,0,.15); }
      #mp-play-btn { width: 38px; height: 38px; font-size: 18px; }
      #mp-eq {
        display: flex; align-items: flex-end; gap: 3px;
        height: 22px; margin-left: auto;
      }
      #mp-eq span {
        width: 4px; background: #ffd700; border-radius: 2px;
        transition: height .1s ease;
      }
      #mp-eq.eq-paused span { height: 4px !important; }
      #mp-vol-row {
        display: flex; align-items: center; gap: 8px;
        font-size: 11px; color: #c8a060; margin-bottom: 6px;
      }
      #mp-vol {
        -webkit-appearance: none; width: 130px;
        height: 4px; background: #6b2a00; border-radius: 2px; outline: none;
      }
      #mp-vol::-webkit-slider-thumb {
        -webkit-appearance: none; width: 12px; height: 12px;
        border-radius: 50%; background: #ffd700; cursor: pointer;
      }
      #mp-num { font-size: 10px; color: #8b6040; text-align: center; }
      #mp-fab-row {
        display: flex; align-items: center; gap: 8px;
      }
      #mp-fab {
        width: 56px; height: 56px; border-radius: 50%;
        background: #8b0000; border: 2px solid #ffd700;
        color: #ffd700; font-size: 26px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,.45);
        transition: background .15s;
        -webkit-tap-highlight-color: transparent;
      }
      #mp-fab:hover, #mp-fab:active { background: #6b0000; }
      #mp-expand-btn {
        width: 28px; height: 28px; border-radius: 50%;
        background: #3a0a00; border: 1.5px solid #ffd700;
        color: #ffd700; font-size: 13px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 1px 6px rgba(0,0,0,.4);
        transition: background .15s;
        -webkit-tap-highlight-color: transparent;
      }
      #mp-expand-btn:hover { background: #6b0000; }
    `;
    document.head.appendChild(css);

    // Tiny hidden YouTube container
    const ytDiv = document.createElement('div');
    ytDiv.id = 'yt-hidden-player';
    ytDiv.style.cssText = 'position:fixed;bottom:-5px;right:-5px;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;';
    document.body.appendChild(ytDiv);

    // Floating widget
    const wrap = document.createElement('div');
    wrap.id = 'mp-wrap';
    wrap.innerHTML =
      '<div id="mp-panel">' +
        '<div id="mp-title">' + PLAYLIST[currentIdx].title + '</div>' +
        '<div id="mp-label">' + PLAYLIST[currentIdx].label + '</div>' +
        '<div id="mp-controls">' +
          '<button class="mp-btn" id="mp-prev-btn" title="Previous">◀◀</button>' +
          '<button class="mp-btn" id="mp-play-btn" title="Play / Pause">▶</button>' +
          '<button class="mp-btn" id="mp-next-btn" title="Next">▶▶</button>' +
          '<div id="mp-eq" class="eq-paused">' +
            '<span style="height:8px"></span>' +
            '<span style="height:14px"></span>' +
            '<span style="height:5px"></span>' +
            '<span style="height:18px"></span>' +
            '<span style="height:9px"></span>' +
          '</div>' +
        '</div>' +
        '<div id="mp-vol-row">🔊 <input type="range" id="mp-vol" min="0" max="100" value="40"></div>' +
        '<div id="mp-num">' + (currentIdx + 1) + ' / ' + PLAYLIST.length + '</div>' +
      '</div>' +
      '<div id="mp-fab-row">' +
        '<button id="mp-expand-btn" title="Open / Close player">🎵</button>' +
        '<button id="mp-fab" title="Play / Pause">▶</button>' +
      '</div>';
    document.body.appendChild(wrap);

    if (isExpanded) document.getElementById('mp-panel').classList.add('mp-open');

    // Events — FAB = play/pause (the whole circle), expand btn = open panel
    document.getElementById('mp-fab').addEventListener('click', function () {
      if (!ytPlayer || !apiReady) {
        // API not ready yet — mark to autoplay when ready
        resumeOnReady = true;
        return;
      }
      togglePlay();
    });
    document.getElementById('mp-expand-btn').addEventListener('click', function () {
      isExpanded = !isExpanded;
      document.getElementById('mp-panel').classList.toggle('mp-open', isExpanded);
      saveState();
    });
    document.getElementById('mp-play-btn').addEventListener('click', togglePlay);
    document.getElementById('mp-prev-btn').addEventListener('click', function () { advanceTrack(-1); });
    document.getElementById('mp-next-btn').addEventListener('click', function () { advanceTrack(1); });
    document.getElementById('mp-vol').addEventListener('input', function (e) {
      if (ytPlayer && apiReady) ytPlayer.setVolume(parseInt(e.target.value));
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────
  function init() {
    const wasPlaying = loadState();
    // Auto-start: always play on load (browser allows autoplay after user
    // has interacted with the page via the auth flow)
    resumeOnReady = true;
    buildUI();
    loadYTAPI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
