// Lao Wang Tea Shop — Traditional Chinese Music Player (YouTube-backed)
(function () {
  'use strict';

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

  let ytPlayer   = null;
  let apiReady   = false;
  let currentIdx = 0;
  let isPlaying  = false;
  let isExpanded = false;
  let eqInterval = null;

  // ── Load YouTube IFrame API ──────────────────────────────────────────
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
      width: '1',
      videoId: PLAYLIST[currentIdx].id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: function (e) { e.target.setVolume(40); },
        onStateChange: function (e) {
          if (e.data === YT.PlayerState.ENDED)   { advanceTrack(1); }
          if (e.data === YT.PlayerState.PLAYING)  { setPlayState(true); }
          if (e.data === YT.PlayerState.PAUSED)   { setPlayState(false); }
        },
      },
    });
  };

  // ── Playback helpers ─────────────────────────────────────────────────
  function loadTrack(idx) {
    currentIdx = ((idx % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
    if (ytPlayer && apiReady) {
      ytPlayer.loadVideoById(PLAYLIST[currentIdx].id);
    }
    refreshTrackInfo();
  }

  function advanceTrack(dir) { loadTrack(currentIdx + dir); }

  function togglePlay() {
    if (!ytPlayer || !apiReady) return;
    if (isPlaying) { ytPlayer.pauseVideo(); }
    else           { ytPlayer.playVideo();  }
  }

  function setPlayState(playing) {
    isPlaying = playing;
    const btn = document.getElementById('mp-play-btn');
    const eq  = document.getElementById('mp-eq');
    if (!btn) return;
    btn.textContent = playing ? '⏸' : '▶';
    if (playing) {
      eq && eq.classList.remove('eq-paused');
      if (!eqInterval) eqInterval = setInterval(animateEq, 150);
    } else {
      eq && eq.classList.add('eq-paused');
      clearInterval(eqInterval);
      eqInterval = null;
    }
  }

  function refreshTrackInfo() {
    const t  = PLAYLIST[currentIdx];
    const el = (id) => document.getElementById(id);
    if (el('mp-title'))  el('mp-title').textContent  = t.title;
    if (el('mp-label'))  el('mp-label').textContent  = t.label;
    if (el('mp-num'))    el('mp-num').textContent    = (currentIdx + 1) + ' / ' + PLAYLIST.length;
  }

  function animateEq() {
    const bars = document.querySelectorAll('#mp-eq span');
    bars.forEach(b => { b.style.height = (4 + Math.random() * 18) + 'px'; });
  }

  // ── Build UI ─────────────────────────────────────────────────────────
  function buildUI() {
    // Styles
    const css = document.createElement('style');
    css.textContent = `
      #mp-wrap {
        position: fixed; bottom: 18px; right: 18px;
        z-index: 9999; font-family: Georgia, serif;
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
        box-shadow: 0 4px 20px rgba(0,0,0,0.55);
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
      #mp-num {
        font-size: 10px; color: #8b6040; text-align: center; margin-top: 4px;
      }
      #mp-fab {
        width: 48px; height: 48px; border-radius: 50%;
        background: #8b0000; border: 2px solid #ffd700;
        color: #ffd700; font-size: 22px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,.45);
        transition: background .15s;
      }
      #mp-fab:hover { background: #6b0000; }
    `;
    document.head.appendChild(css);

    // Hidden YT container (1×1, off-screen)
    const ytDiv = document.createElement('div');
    ytDiv.id = 'yt-hidden-player';
    ytDiv.style.cssText = 'position:fixed;bottom:-10px;right:-10px;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;';
    document.body.appendChild(ytDiv);

    // Floating wrap
    const wrap = document.createElement('div');
    wrap.id = 'mp-wrap';

    // Panel
    wrap.innerHTML = `
      <div id="mp-panel">
        <div id="mp-title">${PLAYLIST[0].title}</div>
        <div id="mp-label">${PLAYLIST[0].label}</div>
        <div id="mp-controls">
          <button class="mp-btn" id="mp-prev-btn" title="Previous track">◀◀</button>
          <button class="mp-btn" id="mp-play-btn" title="Play / Pause">▶</button>
          <button class="mp-btn" id="mp-next-btn" title="Next track">▶▶</button>
          <div id="mp-eq" class="eq-paused">
            <span style="height:8px"></span>
            <span style="height:14px"></span>
            <span style="height:5px"></span>
            <span style="height:18px"></span>
            <span style="height:9px"></span>
          </div>
        </div>
        <div id="mp-vol-row">🔊 <input type="range" id="mp-vol" min="0" max="100" value="40"></div>
        <div id="mp-num">1 / ${PLAYLIST.length}</div>
      </div>
      <button id="mp-fab" title="Traditional Chinese Music 🎵">🎵</button>
    `;
    document.body.appendChild(wrap);

    // Events
    document.getElementById('mp-fab').addEventListener('click', () => {
      isExpanded = !isExpanded;
      document.getElementById('mp-panel').classList.toggle('mp-open', isExpanded);
    });
    document.getElementById('mp-play-btn').addEventListener('click', togglePlay);
    document.getElementById('mp-prev-btn').addEventListener('click', () => advanceTrack(-1));
    document.getElementById('mp-next-btn').addEventListener('click', () => advanceTrack(1));
    document.getElementById('mp-vol').addEventListener('input', (e) => {
      if (ytPlayer && apiReady) ytPlayer.setVolume(parseInt(e.target.value));
    });
  }

  // ── Init ─────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    buildUI();
    loadYTAPI();
  }
})();
