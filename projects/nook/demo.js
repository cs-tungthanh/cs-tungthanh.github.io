// Nook in the browser. A mock Mac screen with a working island: every tile works,
// but all data is made up and nothing leaves the page (no YouTube, no Bluetooth,
// no real shutdown). Layout, wording and sizes follow Nook.swift's ContentView.
(() => {
  const root = document.getElementById('nook-demo');
  if (!root) return;
  const stage = root.querySelector('.demo-stage');
  const W = 900, H = 940;

  // ---------- Helpers ----------
  const $ = (sel, el = stage) => el.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const split = sec => { sec = Math.max(0, Math.floor(sec)); return [Math.floor(sec / 3600), Math.floor(sec % 3600 / 60), sec % 60]; };
  // TimeRemaining.clockFormat and .longFormat
  const clock = sec => { const [h, m, s] = split(Math.ceil(sec)); return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`; };
  const long = sec => { const [h, m, s] = split(Math.ceil(sec)); return h ? `${h}h ${m}m ${s}s` : m ? `${m}m ${s}s` : `${s}s`; };
  const hhmm = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const grad = (a, b, deg = 135) => `linear-gradient(${deg}deg, ${a}, ${b})`;
  const bytes = gb => `${gb.toFixed(2)} GB`;
  const rate = kb => kb >= 1000 ? `${(kb / 1000).toFixed(2)} MB/s` : `${Math.round(kb)} KB/s`;

  // SF Symbols, drawn as small SVGs
  const P = {
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    infof: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 11v6M12 7.5v.5" stroke="#000"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    play: '<path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none"/>',
    back: '<path d="M11 6v12L3 12zM21 6v12l-8-6z" fill="currentColor" stroke="none"/>',
    fwd: '<path d="M3 6v12l8-6zM13 6v12l8-6z" fill="currentColor" stroke="none"/>',
    back10: '<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M7 2.5v3.5h3.5"/><text x="12" y="15.5" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="-apple-system,system-ui">10</text>',
    fwd10: '<path d="M20 12a8 8 0 1 1-3-6.2"/><path d="M17 2.5v3.5h-3.5"/><text x="12" y="15.5" font-size="8" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="-apple-system,system-ui">10</text>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    ext: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M10 14l5-5M10.5 9H15v4.5"/>',
    chev: '<path d="m7 10 5 5 5-5"/>',
    power: '<path d="M12 3v9"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>',
    powerf: '<mask id="dm-power"><rect width="24" height="24" fill="#fff"/><path d="M12 6.3v5.7M15.7 8.4a5.2 5.2 0 1 1-7.4 0" stroke="#000" stroke-width="2.2" stroke-linecap="round" fill="none"/></mask><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" mask="url(#dm-power)"/>',
    rec: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor"/>',
    recf: '<path fill-rule="evenodd" fill="currentColor" stroke="none" d="M12 2a10 10 0 1 1 0 20a10 10 0 1 1 0-20zM12 6.3a5.7 5.7 0 1 0 0 11.4a5.7 5.7 0 1 0 0-11.4zM12 8.2a3.8 3.8 0 1 1 0 7.6a3.8 3.8 0 1 1 0-7.6z"/>',
    pausef: '<path fill-rule="evenodd" fill="currentColor" stroke="none" d="M12 2a10 10 0 1 1 0 20a10 10 0 1 1 0-20zM8.8 7.5h2.2v9H8.8zM13 7.5h2.2v9H13z"/>',
    stopf: '<path fill-rule="evenodd" fill="currentColor" stroke="none" d="M12 2a10 10 0 1 1 0 20a10 10 0 1 1 0-20zM8.6 8.6h6.8v6.8H8.6z"/>',
    cupf: '<path d="M3.5 8.5h13v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z" fill="currentColor" stroke="none"/><path d="M16.5 10h1.7a2.6 2.6 0 0 1 0 5.2H16" fill="none"/><path d="M2.5 20.5h16" />',
    note1: '<path d="M10 18V5.5l8-2.2v4.2l-8 2.2" fill="none"/><circle cx="7" cy="18" r="3" fill="currentColor" stroke="none"/>',
    radio: '<circle cx="12" cy="12" r="1.2" fill="currentColor"/><path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9.2 9.2 0 0 0 0 13M18.5 5.5a9.2 9.2 0 0 1 0 13"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    display: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
    display2: '<rect x="2" y="6" width="12" height="9" rx="1.5"/><rect x="10" y="3" width="12" height="9" rx="1.5"/><path d="M6 19h4"/>',
    crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    bellslash: '<path d="M6 16V11a6 6 0 0 1 9.5-4.9M18 11v5l1.5 2H8"/><path d="M10 20.5a2 2 0 0 0 4 0M3 3l18 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17v.3"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/>',
    checkc: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4"/>',
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><rect x="9.5" y="10.5" width="5" height="4.5" rx="1"/><path d="M10.5 10.5V9a1.5 1.5 0 0 1 3 0v1.5"/>',
    mouse: '<rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 7v3"/>',
    airpods: '<path d="M7 4a3 3 0 0 1 3 3v3a2 2 0 0 1-2 2v7.5a1 1 0 0 1-2 0V12a3 3 0 0 1-2-3V7a3 3 0 0 1 3-3zM17 4a3 3 0 0 0-3 3v3a2 2 0 0 0 2 2v7.5a1 1 0 0 0 2 0V12a3 3 0 0 0 2-3V7a3 3 0 0 0-3-3z"/>',
    speaker: '<rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="14" r="3"/><path d="M12 7.5v.2"/>',
    tablet: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
    keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7.5 14h9"/>',
    network: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    battery: '<rect x="2.5" y="7" width="17" height="10" rx="2.5"/><rect x="4.5" y="9" width="13" height="6" rx="1" fill="currentColor" stroke="none"/><path d="M21.5 10.5v3"/>',
    drive: '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 12h.01M11 12h6"/>',
    plug: '<path d="M9 7V3M15 7V3M6 7h12v4a6 6 0 0 1-12 0zM12 17v4"/>',
    gpu: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    mem: '<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M7 17v2M11 17v2M15 17v2M19 17v2M7 10v4M11 10v4M15 10v4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    wave: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
    note: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="17.5" cy="16" r="2.5" fill="currentColor"/>',
    notelist: '<path d="M3 6h10M3 10h10M3 14h6"/><path d="M17 17V5l4-1"/><circle cx="15" cy="17" r="2" fill="currentColor"/>',
    spk0: '<path d="M4 9.5h4l5-4v13l-5-4H4z" fill="currentColor"/>',
    spk3: '<path d="M4 9.5h4l5-4v13l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    cup: '<path d="M4.5 7.5h12v4a6 6 0 0 1-6 6 6 6 0 0 1-6-6z" fill="currentColor" stroke="none"/><path d="M16.5 9h1.3a2.6 2.6 0 0 1 0 5.2h-1.6" fill="none" stroke-width="1.8"/><path d="M2.5 20h16" stroke-width="2.2"/>',
    moon: '<path d="M13.5 13.8A7 7 0 1 1 6.2 5a5.6 5.6 0 0 0 7.3 8.8z" fill="currentColor" stroke="none" transform="translate(1 4)"/><path d="M14 3h3.2L14 6.4h3.2M18.6 8.2h2.6l-2.6 2.8h2.6" fill="none" stroke-width="1.5"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor"/>',
    flame: '<path fill-rule="evenodd" fill="currentColor" stroke="none" d="M12 22c-4.4 0-7.5-3-7.5-7.2 0-3.2 1.7-5.6 3.6-7.6.5 1.6 1.4 2.7 2.6 3.2C10.6 7 12 4.2 14.6 2c-.2 3.4 1.4 5.2 2.8 7.2 1.3 1.8 2.1 3.4 2.1 5.6C19.5 19 16.4 22 12 22zM12 20.2c-1.9 0-3.2-1.3-3.2-3.1 0-1.7 1.1-2.7 2.1-4 .3.9.8 1.4 1.4 1.6.2-1.2.8-2.3 1.7-3.1 0 1.6 1.2 2.6 1.2 4.6 0 2.4-1.4 4-3.2 4z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    okc: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="m8 12.5 3 3 5-6" stroke="#000"/>',
    noc: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M9 9l6 6M15 9l-6 6" stroke="#000"/>',
    askc: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5M12 16.5v.3" stroke="#000"/>',
    history: '<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5M4 4v4.5h4.5"/><path d="M12 8v4l3 2"/>',
    slash: '<circle cx="12" cy="12" r="9"/><path d="m6 18 12-12"/>',
  };
  // NookGlyph, the template icon in the menu bar and the island's header
  const glyph = size => `<svg width="${size}" height="${size}" viewBox="0 0 18 18" aria-hidden="true"><path d="M2.5 16.5V8a6.5 6.5 0 0 1 13 0v8.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="9" cy="11" r="2.5" fill="currentColor"/></svg>`;
  const ic = (name, size = 12, sw = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>`;
  const APP_ICON = 'nook.png';

  // ---------- Mock data ----------
  // Stations as the app ships them: a live search per type, so the title is the stream's
  const STATIONS = [
    { id: 'study', name: 'Study', emoji: '📚', stream: 'lofi hip hop radio – beats to relax/study to', channel: 'Lofi Beats', art: grad('#3d2c5c', '#c47b4a'), artEmoji: '🎧' },
    { id: 'sleep', name: 'Sleep', emoji: '🌙', stream: 'Deep sleep music – soft rain and piano', channel: 'Night Sounds', art: grad('#0f1d3d', '#3b5ba8'), artEmoji: '🌧️' },
    { id: 'focus', name: 'Focus', emoji: '🎯', stream: 'Deep focus – ambient music for coding', channel: 'Flow State', art: grad('#0e3b3a', '#2bb3a3'), artEmoji: '🌊' },
    { id: 'jazz', name: 'Jazz', emoji: '🎷', stream: 'Coffee shop jazz – smooth morning radio', channel: 'Café Jazz', art: grad('#3a2414', '#d39a4f'), artEmoji: '☕' },
  ].map(s => ({ ...s, live: true, type: true }));
  const CATALOG = [
    { id: 'v1', title: 'Rainy night in Tokyo – 3 hour lofi mix', channel: 'Neon Tapes', kind: 'video', dur: 10800, art: grad('#1f2a5a', '#e0558f'), artEmoji: '🌃' },
    { id: 'v2', title: 'Piano for studying – calm and quiet', channel: 'Still Keys', kind: 'video', dur: 4520, art: grad('#2d2d38', '#9a8f86'), artEmoji: '🎹' },
    { id: 'v3', title: 'Synthwave drive – retro radio', channel: 'Night Drive FM', kind: 'live', art: grad('#3a0f5a', '#ff6a3d'), artEmoji: '🌅' },
    { id: 'v4', title: 'Forest sounds – birds and a stream', channel: 'Nature Loops', kind: 'video', dur: 7200, art: grad('#183d22', '#7cc46a'), artEmoji: '🌲' },
    { id: 'v5', title: 'Bossa nova café', channel: 'Café Jazz', kind: 'playlist', count: 24, art: grad('#5a3214', '#f0b35a'), artEmoji: '🎺' },
    { id: 'v6', title: 'Classical for focus – Bach, Chopin, Debussy', channel: 'Concert Hall', kind: 'video', dur: 5400, art: grad('#2a2418', '#c9a86a'), artEmoji: '🎻' },
    { id: 'v7', title: 'Brown noise – 10 hours', channel: 'Plain Noise', kind: 'video', dur: 36000, art: grad('#3b2a1e', '#7a5a42'), artEmoji: '🟫' },
    { id: 'v8', title: 'Chillhop essentials – summer', channel: 'Chill Garden', kind: 'playlist', count: 40, art: grad('#0f4a5a', '#f2c94c'), artEmoji: '🌴' },
    { id: 'v9', title: 'Ocean waves at night', channel: 'Nature Loops', kind: 'live', art: grad('#08243f', '#2e86c1'), artEmoji: '🌊' },
    { id: 'v10', title: 'Acoustic covers for a slow morning', channel: 'Wooden Room', kind: 'video', dur: 3780, art: grad('#4a2c1a', '#e8a87c'), artEmoji: '🎸' },
    { id: 'v11', title: 'Rain on a tent – sleep sounds', channel: 'Night Sounds', kind: 'video', dur: 28800, art: grad('#1c2833', '#5d6d7e'), artEmoji: '⛺' },
    { id: 'v12', title: 'Jazz piano for work', channel: 'Café Jazz', kind: 'video', dur: 6300, art: grad('#2b1d0e', '#b9770e'), artEmoji: '🎹' },
  ];
  // PermissionKind: title, purpose, symbol
  const PERMS = [
    { id: 'screen', title: 'Screen & System Audio Recording', sub: 'Record your screen and Mac sound', icon: 'rec', prompt: '“Nook” would like to record this computer\'s screen and audio.' },
    { id: 'mic', title: 'Microphone', sub: 'Include your voice in recordings', icon: 'mic', prompt: '“Nook” would like to access the microphone.' },
    { id: 'bt', title: 'Bluetooth', sub: 'List and connect your devices', icon: 'radio', prompt: '“Nook” would like to use Bluetooth.' },
    { id: 'notif', title: 'Notifications', sub: 'Shutdown and break reminders', icon: 'bell', prompt: '“Nook” would like to send you notifications.' },
    { id: 'auto', title: 'Automation › System Events', sub: 'Shut down at the scheduled time', icon: 'power', prompt: '“Nook” wants access to control “System Events”.' },
  ];
  const STATUS = { granted: ['Allowed', 'okc', '#32d74b'], denied: ['Not allowed', 'noc', '#ff453a'], notAsked: ['Not asked yet', 'askc', '#ff9f0a'] };

  const fresh = () => ({
    open: false, everOpened: false, page: 'utilities', fast: false,
    perms: { screen: 'notAsked', mic: 'notAsked', bt: 'granted', notif: 'granted', auto: 'notAsked' },
    pomo: { on: false, phase: 'focus', focus: 20, brk: 2, focusCustom: null, brkCustom: null, style: 'notification', left: 0, total: 0 },
    power: { min: 30, running: false, left: 0, needsPermission: false },
    music: { item: STATIONS[0], started: false, playing: false, pos: 0, vol: 0.55, quiet: 0, quietCustom: null, autoplay: true, saved: [], recent: [], menu: false, search: false, q: '', filter: 'all', sel: 0, queries: [] },
    rec: { source: 'screen', sys: true, mic: false, state: 'idle', t: 0 },
    bt: { all: false, busy: {}, list: [
      { id: 'm', n: 'MX Master 3S', t: 'mouse', c: true, b: '72%' },
      { id: 'a', n: 'AirPods Pro', t: 'airpods', c: true, b: 'L 81% · R 79%' },
      { id: 's', n: 'Studio Speaker', t: 'speaker', c: false },
      { id: 'i', n: 'iPad Air', t: 'tablet', c: false },
      { id: 'k', n: 'Magic Keyboard', t: 'keyboard', c: true, b: '64%' },
      { id: 'p', n: 'iPhone', t: 'phone', c: false },
    ] },
    sys: { cpu: 0.14, gpu: 0.07, mem: 11.57, net: 181, up: 3, watts: 12 },
    about: { state: 'idle', checked: false },
    overlay: null, alert: null, area: null, save: null,
  });
  let S = fresh();

  // ---------- Fit the fixed-size stage into the page ----------
  // Wide pages get a wider screen with the island at its real size; narrow ones scale it down
  const fit = () => {
    const w = root.clientWidth, s = Math.min(1, w / W);
    stage.style.width = `${Math.max(W, w)}px`;
    stage.style.transform = `scale(${s})`;
    root.style.height = `${H * s}px`;
  };
  new ResizeObserver(fit).observe(root);
  fit();

  // ---------- Notifications (macOS banners) ----------
  const toast = (title, body, actions = []) => {
    const box = $('.d-toasts');
    const el = document.createElement('div');
    el.className = 'd-toast';
    el.innerHTML = `<img src="${APP_ICON}" alt=""><div><div class="tt">${esc(title)}</div><div class="tb">${esc(body)}</div>${actions.length ? `<div class="ta">${actions.map((a, i) => `<button type="button" data-i="${i}">${esc(a[0])}</button>`).join('')}</div>` : ''}</div>`;
    el.addEventListener('click', e => {
      const b = e.target.closest('button[data-i]');
      if (b) actions[+b.dataset.i][1]();
      el.remove();
    });
    box.prepend(el);
    while (box.children.length > 3) box.lastChild.remove();
    setTimeout(() => el.remove(), actions.length ? 9000 : 4500);
  };
  const notify = (title, body, actions) => { if (S.perms.notif === 'granted') toast(title, body, actions); };

  // ---------- Permission prompt (a pretend macOS alert) ----------
  const ask = (perm, then, onDeny) => {
    if (S.perms[perm] === 'granted') { then && then(); return; }
    if (S.perms[perm] === 'denied') { onDeny && onDeny(); update(); return; }
    S.alert = { perm, text: PERMS.find(x => x.id === perm).prompt, then, onDeny };
    renderLayer();
  };

  // ---------- Pomodoro ----------
  const focusLen = () => S.pomo.focusCustom ?? S.pomo.focus;
  const brkLen = () => S.pomo.brkCustom ?? S.pomo.brk;
  const pomoStart = () => {
    const p = S.pomo;
    p.on = true; p.phase = 'focus'; p.total = p.left = focusLen() * 60;
    if (S.perms.notif === 'notAsked') ask('notif');
  };
  const startBreak = () => {
    const p = S.pomo;
    p.phase = 'break'; p.total = p.left = brkLen() * 60;
    if (p.style === 'overlay') { S.overlay = 'break'; renderLayer(); }
    else notify('Time for a break', `Take ${brkLen()} min. Look away, stretch, breathe.`, [['Start break', () => {}], ['Snooze', () => { snooze(); update(); }], ['Skip', () => { backToFocus(); update(); }]]);
  };
  const backToFocus = () => {
    const p = S.pomo;
    p.phase = 'focus'; p.total = p.left = focusLen() * 60;
    if (S.overlay === 'break') { S.overlay = null; renderLayer(); }
  };
  const snooze = () => {
    const p = S.pomo;
    if (p.phase === 'break') { p.phase = 'focus'; p.total = p.left = 5 * 60; if (S.overlay === 'break') { S.overlay = null; renderLayer(); } }
    else { p.left += 5 * 60; p.total += 5 * 60; }
  };
  // Changing the focus length keeps the time already focused
  const applyFocusLen = () => {
    const p = S.pomo;
    if (!p.on || p.phase !== 'focus') return;
    const done = p.total - p.left;
    p.total = focusLen() * 60; p.left = Math.max(1, p.total - done);
  };

  // ---------- Music ----------
  const allStations = () => [...STATIONS, ...S.music.saved];
  const isLive = item => item.live || item.kind === 'live';
  const dur = item => item.kind === 'playlist' ? 2400 : item.dur || 0;
  const isUnsaved = item => !item.type && !S.music.saved.some(s => s.id === item.id);
  const stationTitle = it => !S.music.started && it.type ? `${it.emoji}  ${it.name}` : `${it.emoji || '🎵'}  ${it.type ? it.stream : it.title}`;
  const play = (item, save = false) => {
    const m = S.music;
    if (save && isUnsaved(item)) m.saved.push({ ...item, emoji: '⭐' });
    m.item = item.type || !m.saved.some(s => s.id === item.id) ? item : m.saved.find(s => s.id === item.id);
    m.started = true; m.pos = 0; m.playing = true; m.menu = false; m.search = false;
    m.recent = [m.item, ...m.recent.filter(x => x.id !== m.item.id)].slice(0, 15);
  };
  const related = () => { const pool = CATALOG.filter(x => x.kind === 'video' && x.id !== S.music.item.id); return pool[Math.floor(Math.random() * pool.length)]; };
  const skip = dir => {
    const m = S.music;
    const list = allStations(), i = list.findIndex(x => x.id === m.item.id);
    if (i >= 0 || isLive(m.item)) play(list[(Math.max(i, 0) + dir + list.length) % list.length]);
    else if (dir > 0) play(related());
    else m.pos = 0;
  };
  const results = () => {
    const m = S.music, q = m.q.trim().toLowerCase();
    let list = q ? CATALOG.filter(x => (x.title + ' ' + x.channel).toLowerCase().includes(q))
      : CATALOG.filter(x => !m.recent.some(r => r.id === x.id) && !m.saved.some(s => s.id === x.id)).slice(0, 8);
    if (m.filter === 'live') list = list.filter(x => x.kind === 'live');
    if (m.filter === 'playlists') list = list.filter(x => x.kind === 'playlist');
    if (m.filter === 'long') list = list.filter(x => x.kind === 'video' && x.dur >= 3600);
    return list;
  };

  // ---------- Recording ----------
  // Close the island so it isn't in the way of what's being recorded, then start
  const record = () => {
    closeIsland();
    ask('screen', () => {
      if (S.rec.source === 'area') { S.area = { start: null, rect: null }; renderLayer(); return; }
      S.rec.state = 'recording'; S.rec.t = 0; update();
    });
  };
  const recordingName = () => { const d = new Date(); return `Nook Recording ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} at ${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}.mov`; };

  // ---------- Power Off ----------
  const powerStart = () => ask('auto', () => {
    const pw = S.power; pw.running = true; pw.needsPermission = false; pw.left = pw.min * 60;
    notify('Shutdown Scheduled', `Your Mac will shut down at ${hhmm(new Date(Date.now() + pw.min * 60000))}.`);
    update();
  }, () => { S.power.needsPermission = true; });

  // ---------- Island open/close ----------
  const openIsland = () => { S.open = true; S.everOpened = true; render(); };
  const closeIsland = () => { S.open = false; S.music.menu = false; render(); };

  // ---------- Shared views ----------
  const seg = (action, options, current) => `<div class="d-seg">${options.map(([v, label]) => `<button type="button" data-a="${action}" data-v="${v}" class="${String(v) === String(current) ? 'on' : ''}">${label}</button>`).join('')}</div>`;
  // PresetPicker: presets, then Custom, which turns into a − value + stepper
  const preset = (action, presets, value, custom, fmt) => `<div class="d-seg">${presets.map(v => `<button type="button" data-a="${action}" data-v="${v}" class="${custom == null && value === v ? 'on' : ''}">${fmt(v)}</button>`).join('')}${custom == null
    ? `<button type="button" data-a="${action}" data-v="custom" title="Choose your own">Custom</button>`
    : `<span class="d-stepper"><button type="button" data-a="${action}" data-v="dec" aria-label="Shorter">${ic('minus', 9, 3.5)}</button><span>${fmt(custom)}</span><button type="button" data-a="${action}" data-v="inc" aria-label="Longer">${ic('plus', 9, 3.5)}</button></span>`}</div>`;
  const stepCustom = (cur, dir, lo, hi) => { const step = 5; return clamp(dir > 0 ? cur + (cur >= step ? step : 1) : cur - (cur > step ? step : 1), lo, hi); };
  const section = (icon, title) => `<div class="d-section">${ic(icon, 15)}<span>${title}</span></div>`;
  const setting = (label, html) => `<div class="d-setting"><span class="lbl">${label}</span>${html}</div>`;
  // statusRow: icon, text, then accent buttons
  const status = (icon, text, actions = []) => `<div class="d-status-row">${ic(icon, 12)}<span class="txt">${esc(text)}</span>${actions.map(([t, a, v]) => `<button type="button" class="d-act ${actions.length > 1 ? 'tight' : ''}" data-a="${a}"${v != null ? ` data-v="${v}"` : ''}>${t}</button>`).join('')}</div>`;
  const progressRow = text => `<div class="d-status-row"><span class="d-spin" style="margin:0 2px"></span><span class="txt">${esc(text)}</span></div>`;

  // AppDelegate.updateStopRecordingItem: a red stop button and the time, left of Nook's icon
  const statusItems = () => S.rec.state === 'recording'
    ? `<button type="button" class="d-stop" data-a="rec-menubar-stop" title="Stop Recording"><span>${ic('stopf', 15)}</span>${clock(S.rec.t)}</button>` : '';
  // AppDelegate.updateStatusItem: one icon, recording first, then break, shutdown and music
  const nookIcon = () => {
    if (S.rec.state === 'recording') return [ic('recf', 16), 'Recording Screen'];
    if (S.rec.state === 'paused') return [ic('pausef', 16), 'Recording Stopped'];
    if (S.pomo.on && S.pomo.phase === 'break') return [ic('cupf', 16, 1.6), 'On Break'];
    if (S.power.running) return [ic('powerf', 16), 'Shutdown Scheduled'];
    if (S.music.playing) return [ic('note1', 16, 1.8), 'Playing Music'];
    return [glyph(18), 'Nook'];
  };

  const head = () => {
    const titles = { utilities: 'Nook', system: 'System', about: 'About Nook', permissions: 'Permissions' };
    const sys = S.page === 'system';
    return `<div class="d-head">
      <button type="button" class="home" data-a="home" title="Back to Nook">${glyph(20)}<span>${titles[S.page]}</span></button>
      <span class="sp"></span>
      <button type="button" class="d-chip ${sys ? 'on' : ''}" data-a="page" data-v="${sys ? 'utilities' : 'system'}">${ic(sys ? 'grid' : 'cpu', 11)} ${sys ? 'Utilities' : 'System'}</button>
      <button type="button" class="d-info ${S.page === 'about' ? 'on' : ''}" data-a="page" data-v="${S.page === 'about' ? 'utilities' : 'about'}" title="About Nook">${ic(S.page === 'about' ? 'infof' : 'info', 11)}</button>
      <button type="button" class="d-quit" data-a="quit">Quit</button>
    </div>`;
  };

  // ---------- Tiles ----------
  const pomoTile = () => {
    const p = S.pomo;
    const brk = p.on && p.phase === 'break';
    const colors = brk ? ['#129980', '#33b8d9'] : ['#ed453d', '#fa8c38'];
    let body;
    if (!p.on) {
      body = `<div><div class="idle-t">Focus in sprints, rest in between.</div><div class="idle-s">${focusLen()} min focus · ${brkLen()} min break</div></div>
        <div class="d-pills"><button type="button" class="d-pill strong" style="color:${colors[0]}" data-a="pomo-start">${ic('play', 11)} Start focusing</button></div>`;
    } else {
      const prog = p.total ? p.left / p.total : 0, C = 2 * Math.PI * 26;
      body = `<div class="body">
          <div class="d-ring"><svg width="58" height="58" viewBox="0 0 58 58"><circle cx="29" cy="29" r="26" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="5"/><circle cx="29" cy="29" r="26" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - prog)}"/></svg><div class="glyph">${ic(brk ? 'cup' : 'flame', 20)}</div></div>
          <div><div class="lbl">${brk ? 'BREAK' : 'FOCUS'}</div><div class="clock">${clock(p.left)}</div><div class="sub">${brk ? 'Look away, stretch, breathe' : `then a ${brkLen()} min break`}</div></div>
        </div>
        <div class="d-pills">
          <button type="button" class="d-pill" data-a="pomo-snooze">${ic('moon', 12)} Snooze 5m</button>
          <button type="button" class="d-pill strong" style="color:${colors[0]}" data-a="${brk ? 'pomo-focus' : 'pomo-break'}">${brk ? ic('bolt', 12) + ' Back to focus' : ic('cup', 14) + ' Break now'}</button>
        </div>`;
    }
    const warn = p.style === 'notification' && S.perms.notif !== 'granted'
      ? status('bellslash', "Notifications are off, so break reminders won't show", [['Permissions', 'page', 'permissions']]) : '';
    return `<div class="d-tile">
      <div class="d-pomo" style="background:${grad(colors[0], colors[1])};box-shadow:0 3px 16px ${colors[0]}59">
        <div class="d-card-head"><span>🍅</span><b>Pomodoro</b><span class="sp"></span>${p.on ? `<button type="button" class="d-x" data-a="pomo-off" title="Turn off Pomodoro">${ic('x', 10, 3.5)}</button>` : ''}</div>
        ${body}
      </div>
      ${setting('Focus', preset('pomo-focus-len', [20, 25, 50], p.focus, p.focusCustom, v => `${v}m`))}
      ${setting('Break', preset('pomo-brk-len', [2, 5, 10], p.brk, p.brkCustom, v => `${v}m`))}
      ${setting('Style', seg('pomo-style', [['notification', 'Notification'], ['overlay', 'Full screen']], p.style))}
      ${warn}
    </div>`;
  };

  const powerTile = () => {
    const pw = S.power;
    let body;
    if (pw.running) {
      body = status('powerf', pw.left > 0 ? `Shutting down in ${long(pw.left)}` : 'Shutting down…', [['Cancel', 'power-cancel']]);
    } else {
      const ticks = Array.from({ length: 24 }, (_, i) => (i + 1) * 5);
      const center = i => i * 8 + 1.5;
      const idx = pw.min / 5 - 1;
      body = `<div class="d-power">
          <div class="d-ruler" data-drag="ruler" role="slider" aria-label="Minutes until shutdown" aria-valuemin="5" aria-valuemax="120" aria-valuenow="${pw.min}" tabindex="0">
            <div class="nums">${[30, 60, 90, 120].map(n => `<span style="left:${center(n / 5 - 1)}px;opacity:${n <= pw.min ? 1 : .35}">${n}</span>`).join('')}</div>
            <div class="ticks">${ticks.map(t => `<i class="${t <= pw.min ? 'on' : ''}"></i>`).join('')}</div>
            <div class="ptr"><b style="left:${center(idx)}px"></b></div>
          </div>
          <div class="big">${clock(pw.min * 60)}</div>
        </div>
        ${pw.needsPermission && S.perms.auto !== 'granted' ? status('alert', 'Nook needs Automation access to shut down', [['Permissions', 'page', 'permissions']]) : ''}
        ${status('clock', `Shuts down at ${hhmm(new Date(Date.now() + pw.min * 60000))}`, [['Start', 'power-start']])}`;
    }
    return `<div class="d-tile">${section('power', 'Power Off')}${body}</div>`;
  };

  const musicTile = () => {
    const m = S.music, it = m.item, active = m.playing;
    const colors = active ? ['#7d4df2', '#ed549e'] : ['#4d427a', '#734775'];
    let statusRow;
    if (!m.started) statusRow = status('note', `Press play for ${it.name || 'music'}`);
    else if (isUnsaved(it)) statusRow = status('search', it.title, [['☆ Save', 'music-save']]);
    else statusRow = status(m.playing ? 'wave' : 'pausef', it.type ? `${it.name} · ${it.channel}` : it.title);
    let progress = '';
    if (m.started && isLive(it)) progress = `<div class="d-progress"><span class="d-live">LIVE</span><span class="d-time ell" style="text-align:left;min-width:0">Live stream · always plays the latest moment</span></div>`;
    else if (m.started) {
      const d = dur(it), f = d ? m.pos / d * 100 : 0;
      progress = `<div class="d-progress"><button type="button" class="d-skip pb" data-a="music-seekby" data-v="-10" aria-label="Back 10 seconds">${ic('back10', 15, 1.8)}</button><span class="d-time">${clock(m.pos)}</span><div class="d-seek" data-drag="seek"><span class="tr"></span><span class="fl" style="width:${f}%"></span><span class="kn" style="left:${f}%"></span></div><span class="d-time">${clock(d)}</span><button type="button" class="d-skip pb" data-a="music-seekby" data-v="10" aria-label="Forward 10 seconds">${ic('fwd10', 15, 1.8)}</button></div>`;
    }
    const art = m.started ? `background:${it.art}` : 'background:rgba(255,255,255,.15)';
    const menu = m.menu ? `<div class="d-menu" style="top:64px;left:120px">
        <button type="button" data-a="music-toggle"><span class="chk"></span>${m.playing ? 'Pause' : 'Play'}</button>
        <button type="button" data-a="music-open"><span class="chk"></span>Open in YouTube</button>
        <button type="button" data-a="music-autoplay"><span class="chk">${m.autoplay ? '✓' : ''}</span>Autoplay Related Videos</button>
        <hr>${allStations().map(s => `<button type="button" data-a="music-station" data-v="${s.id}"><span class="chk">${s.id === it.id ? '✓' : ''}</span>${s.emoji}&nbsp; ${esc(s.type ? s.name : s.title)}</button>`).join('')}
        <hr><div class="h">Recently Played</div>${m.recent.length ? m.recent.slice(0, 5).map(s => `<button type="button" data-a="music-recent" data-v="${s.id}"><span class="chk"></span>${esc(s.type ? s.name : (s.title.length > 34 ? s.title.slice(0, 33) + '…' : s.title))}</button>`).join('') : '<div class="h" style="padding-left:26px">Nothing yet</div>'}
        <hr><button type="button" data-a="search-open"><span class="chk"></span>Search YouTube…</button>
      </div>` : '';
    const vol = m.vol * 100;
    return `<div class="d-tile" style="position:relative">
      <div class="d-music" style="background:${grad(colors[0], colors[1])};box-shadow:0 3px 16px ${colors[0]}${active ? '73' : '33'}">
        <div class="d-card-head"><span>🎵</span><b>Music</b><span class="sp"></span><button type="button" class="d-ico-btn" data-a="music-open" ${m.started ? '' : 'disabled'} title="Open in YouTube">${ic('ext', 12, 2.4)}</button><button type="button" class="d-ico-btn" data-a="search-open" title="Search YouTube">${ic('search', 11, 3)}</button></div>
        <div class="mid">
          <button type="button" class="d-art" style="${art}" data-a="music-toggle" aria-label="${m.playing ? 'Pause' : 'Play'}">${m.started ? it.artEmoji : ''}<span class="pp">${ic(m.playing ? 'pause' : 'play', 18)}</span></button>
          <div class="meta">
            <div class="titlebar">
              <button type="button" class="d-station pb" data-a="music-menu"><span class="t">${esc(stationTitle(it))}</span>${ic('chev', 9, 3.5)}</button>
              <button type="button" class="d-mbtn pb" data-a="music-skip" data-v="-1" aria-label="Previous">${ic('back', 13)}</button>
              <button type="button" class="d-mbtn pb" data-a="music-skip" data-v="1" aria-label="Next">${ic('fwd', 13)}</button>
            </div>
            ${statusRow}
          </div>
        </div>
        ${progress}
      </div>
      <div class="d-vol">${ic('spk0', 11)}<div class="d-slider" data-drag="vol"><span class="tr"></span><span class="fl" style="width:${vol}%"></span><span class="kn" style="left:${vol}%"></span></div>${ic('spk3', 13)}</div>
      <div class="d-quiet"><span class="lbl" title="Starts the music again once your Mac has made no sound for this long">Resume when quiet</span>${preset('music-quiet', [0, 1, 5], m.quiet, m.quietCustom, v => v === 0 ? 'Off' : `${v}m`)}</div>
      ${menu}
    </div>`;
  };

  const recTile = () => {
    const r = S.rec;
    const src = { screen: ['display', 'Built-in Retina Display'], all: ['display2', 'Only one screen connected'], area: ['crop', 'Drag to pick the area after Record'] }[r.source];
    let row;
    if (r.state === 'recording') row = status('recf', `Recording · ${clock(r.t)}`, [['Stop', 'rec-stop']]);
    else if (r.state === 'paused') row = status('pausef', `Stopped · ${clock(r.t)}`, [['Resume', 'rec-resume'], ['Save', 'rec-save'], ['Discard', 'rec-discard']]);
    else row = status(src[0], src[1], [['Record', 'rec-start']]);
    const opts = r.state === 'idle' ? setting('Source', seg('rec-source', [['screen', 'Screen'], ['all', 'All screens'], ['area', 'Area']], r.source))
      + setting('Audio', `<div class="d-checks"><button type="button" class="d-check ${r.sys ? 'on' : ''}" data-a="rec-sys"><i>${r.sys ? ic('check', 9, 4) : ''}</i>System</button><button type="button" class="d-check ${r.mic ? 'on' : ''}" data-a="rec-mic"><i>${r.mic ? ic('check', 9, 4) : ''}</i>Microphone</button></div>`) : '';
    return `<div class="d-tile">${section('rec', 'Screen Recording')}${opts}${row}</div>`;
  };

  const btTile = () => {
    const b = S.bt;
    let body;
    if (S.perms.bt === 'notAsked') body = status('lock', 'Allow Bluetooth to list your devices', [['Allow', 'perm', 'bt']]);
    else if (S.perms.bt === 'denied') body = status('alert', "Nook isn't allowed to use Bluetooth", [['Permissions', 'page', 'permissions']]);
    else {
      const list = b.all ? b.list : b.list.slice(0, 4);
      body = `<div class="d-devs">${list.map(d => `<div class="d-dev ${d.c ? 'on' : ''}">
          <span class="ico">${ic(d.t, 14, 1.8)}</span>
          <span class="grow" style="flex:1;min-width:0"><div class="nm">${esc(d.n)}</div><div class="st">${!d.c ? 'Not connected' : d.b ? `Connected · ${d.b}` : 'Connected'}</div></span>
          ${b.busy[d.id] ? '<span class="d-spin"></span>' : `<button type="button" class="d-act" data-a="bt-toggle" data-v="${d.id}">${d.c ? 'Disconnect' : 'Connect'}</button>`}
        </div>`).join('')}
        <button type="button" class="d-more pb" data-a="bt-all">${b.all ? 'Show less' : `Show all ${b.list.length}`}</button></div>`;
    }
    return `<div class="d-tile">${section('radio', 'Bluetooth')}${body}</div>`;
  };

  // musicSearchView, shown in place of the tiles
  const searchPage = () => {
    const m = S.music, list = results(), q = m.q.trim();
    m.sel = clamp(m.sel, 0, Math.max(0, list.length - 1));
    const badge = x => x.kind === 'live' ? '<span class="d-badge live">LIVE</span>'
      : x.kind === 'playlist' ? `<span class="d-badge">${ic('notelist', 10)} ${x.count} videos</span>` : `<span class="d-badge">${clock(x.dur)}</span>`;
    const rows = list.length ? list.map((x, i) => `<div class="d-result ${i === m.sel ? 'sel' : ''}" data-a="search-play" data-v="${x.id}" data-i="${i}"><span class="th" style="background:${x.art}">${x.artEmoji}</span><span class="tx"><div>${esc(x.title)}</div><small>${esc(x.channel)}</small></span>${badge(x)}</div>`).join('')
      : status('search', `No results for “${q}”. Try “piano”, “rain” or “jazz”.`);
    let mid;
    if (q) mid = `<div class="d-results tall">${rows}</div>`;
    else {
      const chips = m.queries.length ? `<div class="d-chips"><div class="list">${m.queries.map(r => `<button type="button" data-a="search-query" data-v="${esc(r)}">${ic('history', 10)} ${esc(r)}</button>`).join('')}</div><button type="button" class="d-act" data-a="search-clear">Clear</button></div>` : '';
      const last = m.recent[0];
      mid = `${chips}<div class="d-rec-head"><b>Recommended</b>${last ? `<span>· Because you played ${esc(last.type ? last.name : last.title)}</span>` : ''}</div><div class="d-results">${rows}</div>`;
    }
    return `<div class="d-tile">
      <div class="d-sfield">${ic('search', 13)}<input id="d-q" type="text" placeholder="Search YouTube" value="${esc(m.q)}" autocomplete="off" spellcheck="false" aria-label="Search YouTube"><button type="button" class="esc pb" data-a="search-close">Esc</button></div>
      <div>${seg('search-filter', [['all', 'All'], ['live', 'Live'], ['playlists', 'Playlists'], ['long', 'Long (1h+)']], m.filter)}</div>
      ${mid}
      <div class="d-hint-row">↑↓ select · ⏎ play now · ⌘⏎ play and save · Esc back</div>
    </div>`;
  };

  const systemPage = () => {
    const s = S.sys, total = 17.18, disk = 494.38, avail = 267.69;
    const metric = (icon, k, v, sub, frac, highIsBad = true) => `<div class="d-metric"><div class="k">${ic(icon, 13, 1.8)} ${k}</div><div class="v">${v}</div>${sub ? `<div class="s">${sub}</div>` : ''}<span class="grow"></span>${frac == null ? '' : `<div class="d-bar"><b class="${highIsBad && frac > .85 ? 'hot' : ''}" style="width:${frac * 100}%"></b></div>`}</div>`;
    const pct = f => `${Math.round(f * 100)}%`;
    return `<div class="d-sys-row">${metric('cpu', 'CPU', pct(s.cpu), '', s.cpu)}${metric('gpu', 'GPU', pct(s.gpu), '', s.gpu)}${metric('mem', 'Memory', pct(s.mem / total), `${bytes(s.mem)} of ${bytes(total)}`, s.mem / total)}</div>
      <div class="d-sys-row">${metric('battery', 'Battery', '100%', 'On power, not charging', 1, false)}${metric('network', 'Network', `↓ ${rate(s.net)}`, `↑ ${rate(s.up)}`, null)}</div>
      <div class="d-sys-row">${metric('drive', 'Available', bytes(avail), `of ${bytes(disk)}`, 1 - avail / disk)}${metric('plug', 'Power', `${Math.round(s.watts)} W`, '60 W adapter', null)}</div>`;
  };

  const aboutPage = () => {
    const a = S.about;
    const row = a.state === 'checking' ? progressRow('Checking for updates…')
      : a.state === 'done' ? status('checkc', 'Nook is up to date', [['Check Again', 'about-check']])
      : status('refresh', 'Check whether a newer version is out', [['Check for Updates', 'about-check']]);
    return `<div class="d-tile p14" style="gap:12px">
      <div class="d-about"><img src="${APP_ICON}" alt=""><div><div class="n">Nook</div><div class="v">Version 1.5.0</div><div class="i">Installed with Homebrew</div></div></div>
      ${row}
      <div class="d-links">
        <a href="https://github.com/cs-tungthanh/nook" target="_blank" rel="noopener">${ic('code', 11)} GitHub</a>
        <a href="https://github.com/cs-tungthanh/nook/releases" target="_blank" rel="noopener">${ic('doc', 11)} Release notes</a>
        <button type="button" data-a="page" data-v="permissions">${ic('shield', 11)} Permissions</button>
        <span class="sp"></span><span class="m">Checked ${a.checked ? 'now' : '2 hours ago'}</span>
      </div>
    </div>`;
  };

  const permissionsPage = () => `<div class="d-tile p14" style="gap:8px">
      <div class="d-small">What Nook may use on this Mac. Changes made in System Settings show up here within a few seconds.</div>
      ${PERMS.map(p => {
        const st = S.perms[p.id], [label, sym, color] = STATUS[st];
        const action = st === 'notAsked' && p.id !== 'screen' ? 'Allow' : 'Settings';
        return `<div class="d-perm">${ic(p.icon, 14)}<span style="flex:1;min-width:0"><div class="t">${p.title}</div><div class="p">${p.sub}</div></span><span class="st"><span style="color:${color}">${ic(sym, 12)}</span>${label}</span><button type="button" class="d-act" data-a="perm" data-v="${p.id}">${action}</button></div>`;
      }).join('')}
      ${S.perms.screen !== 'granted' ? '<div class="d-small">Just allowed Screen Recording? macOS shows the change after you quit and reopen Nook.</div>' : ''}
    </div>`;

  const pageBody = () => {
    if (S.page === 'system') return systemPage();
    if (S.page === 'about') return aboutPage();
    if (S.page === 'permissions') return permissionsPage();
    if (S.music.search) return `<div id="t-search">${searchPage()}</div>`;
    return `<div class="d-grid">
      <div class="d-col"><div id="t-pomo">${pomoTile()}</div><div id="t-power">${powerTile()}</div></div>
      <div class="d-col"><div id="t-music">${musicTile()}</div><div id="t-rec">${recTile()}</div><div id="t-bt">${btTile()}</div></div>
    </div>`;
  };

  // ---------- Rendering ----------
  const renderStatus = () => {
    $('.d-status').innerHTML = statusItems();
    const btn = $('.d-nook-btn'), [icon, label] = nookIcon();
    if (btn.dataset.icon !== label) { btn.innerHTML = `${icon}<span class="ping"></span>`; btn.dataset.icon = label; btn.title = label; }
    btn.classList.toggle('on', S.open);
    const now = new Date();
    $('.d-clock').textContent = `${now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}  ${hhmm(now)}`;
    $('.d-hint').hidden = S.everOpened;
    $('.d-nook-btn .ping').hidden = S.everOpened;
    $('.d-desk-note').textContent = S.open || !S.everOpened ? '' : 'Timers and music keep running. Click the Nook icon to bring the island back.';
  };

  const renderLayer = () => {
    let h = '';
    if (S.overlay === 'break') {
      const p = S.pomo, C = 2 * Math.PI * 86, prog = p.total ? p.left / p.total : 0;
      h = `<div class="d-overlay break"><div class="d-break">
        ${ic('cup', 56)}
        <div><h3>Break Time</h3><p>Let's relax — look away from the screen, stretch, breathe.</p></div>
        <div class="ring"><svg width="180" height="180" viewBox="0 0 180 180"><circle cx="90" cy="90" r="86" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="8"/><circle class="arc" cx="90" cy="90" r="86" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - prog)}"/></svg><span>${clock(p.left)}</span></div>
        <div class="btns"><button type="button" data-a="pomo-snooze">${ic('moon', 14)} Snooze 5m</button><button type="button" data-a="pomo-focus">${ic('bolt', 14)} Back to focus</button></div>
        <small>Press Esc to get back to focus</small>
      </div></div>`;
    } else if (S.overlay === 'shutdown') {
      h = `<div class="d-overlay dark"><div><div style="display:grid;place-items:center;margin-bottom:12px">${ic('power', 44)}</div><h4>Your Mac would shut down now</h4><p class="note">This is a demo, so nothing happens. The real Nook asks macOS to shut down here.</p><button type="button" class="ok" data-a="overlay-ok">OK</button></div></div>`;
    }
    if (S.area) {
      const r = S.area.rect;
      h += `<div class="d-area" data-drag="area"><div class="tip">Drag to select an area · Esc to cancel</div>${r ? `<div class="sel" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px"></div>` : ''}</div>`;
    }
    if (S.save && !S.save.confirm) {
      h += `<div class="d-overlay dim"><div class="d-savepanel" role="dialog" aria-label="Save Recording">
        <div class="ttl">Save Recording</div>
        <label class="fld"><span>Name:</span><input id="d-save-name" type="text" value="${esc(S.save.name)}" spellcheck="false" autocomplete="off"></label>
        <div class="fld"><span>Where:</span><div class="where">🖥️ Desktop</div></div>
        <div class="b"><button type="button" data-a="save-cancel">Cancel</button><button type="button" class="y" data-a="save-ok">Save</button></div>
      </div></div>`;
    } else if (S.save) {
      h += `<div class="d-overlay dim"><div class="d-alert"><img src="${APP_ICON}" alt=""><div class="q">Delete this recording?</div><div class="w">It hasn't been saved yet. If you delete it, it can't be recovered.</div><div class="b"><button type="button" class="del" data-a="save-delete">Delete</button><button type="button" data-a="save-back">Back to Save</button></div></div></div>`;
    }
    if (S.alert) {
      h += `<div class="d-overlay dim"><div class="d-alert"><img src="${APP_ICON}" alt=""><div class="q">${esc(S.alert.text)}</div><div class="w">A pretend macOS prompt: your answer only changes the demo.</div><div class="b"><button type="button" data-a="alert-no">Don't Allow</button><button type="button" class="y" data-a="alert-yes">Allow</button></div></div></div>`;
    }
    $('.d-layer').innerHTML = h;
  };

  const render = () => {
    const island = $('.d-island');
    island.classList.toggle('closed', !S.open);
    island.setAttribute('aria-hidden', String(!S.open));
    island.innerHTML = `<div class="d-body">${head()}${pageBody()}</div>`;
    renderStatus();
    renderLayer();
  };

  // Re-renders only the parts named, so typing and menus aren't disturbed
  const update = (...parts) => {
    renderStatus();
    if (!S.open) return;
    if (S.page !== 'utilities' || S.music.search) {
      if (S.page === 'system' || parts.includes('page') || (!S.music.search && S.page !== 'utilities')) $('.d-body').innerHTML = head() + pageBody();
      return;
    }
    if (!$('#t-pomo')) { $('.d-body').innerHTML = head() + pageBody(); return; }
    const all = !parts.length;
    const put = (id, html) => { const el = $('#' + id); if (el) el.innerHTML = html; };
    if (all || parts.includes('pomo')) put('t-pomo', pomoTile());
    if (all || parts.includes('power')) put('t-power', powerTile());
    if (all || parts.includes('music')) put('t-music', musicTile());
    if (all || parts.includes('rec')) put('t-rec', recTile());
    if (all || parts.includes('bt')) put('t-bt', btTile());
  };
  const rerenderSearch = () => {
    const input = $('#d-q'), pos = input ? input.selectionStart : null, focused = document.activeElement === input;
    $('.d-body').innerHTML = head() + pageBody();
    const q = $('#d-q');
    if (q && (focused || pos != null)) { q.focus(); if (pos != null) q.setSelectionRange(pos, pos); }
    $('.d-result.sel')?.scrollIntoView({ block: 'nearest' });
  };

  // ---------- Clock ----------
  let sysCount = 0, pointerDown = false;
  stage.addEventListener('pointerdown', () => { pointerDown = true; });
  document.addEventListener('pointerup', () => { pointerDown = false; });
  document.addEventListener('pointercancel', () => { pointerDown = false; });
  setInterval(() => {
    const dt = S.fast ? 60 : 1;
    const p = S.pomo, m = S.music;
    if (p.on) {
      p.left -= dt;
      if (p.left <= 0) { if (p.phase === 'focus') startBreak(); else { backToFocus(); notify('Back to focus', `Next break in ${focusLen()} min.`); } }
    }
    if (S.power.running) {
      S.power.left -= dt;
      if (S.power.left <= 0) { S.power.running = false; S.overlay = 'shutdown'; renderLayer(); }
    }
    if (m.playing && !isLive(m.item)) {
      m.pos += dt;
      if (m.pos >= dur(m.item)) { if (m.autoplay) play(related()); else { m.playing = false; m.pos = 0; } }
    }
    if (S.rec.state === 'recording') S.rec.t += 1;
    if (S.overlay === 'break') {
      const ring = $('.d-break .ring');
      if (ring) { const C = 2 * Math.PI * 86; ring.querySelector('span').textContent = clock(p.left); ring.querySelector('.arc').setAttribute('stroke-dashoffset', C * (1 - (p.total ? p.left / p.total : 0))); }
    }
    if (++sysCount % 2 === 0) {
      const s = S.sys;
      s.cpu = clamp(s.cpu + rand(-0.06, 0.06), 0.04, 0.62); s.gpu = clamp(s.gpu + rand(-0.04, 0.04), 0.02, 0.4);
      s.mem = clamp(s.mem + rand(-0.12, 0.12), 9, 13); s.net = clamp(s.net * rand(0.6, 1.5) + rand(-20, 40), 8, 4200); s.up = clamp(s.up + rand(-3, 3), 1, 60);
      s.watts = clamp(s.watts + rand(-2, 2), 6, 24);
    }
    // Only redraw what moves, and never under a pressed pointer, or the click is lost
    if (pointerDown) { renderStatus(); return; }
    const parts = ['pomo', 'power', 'rec'];
    if (m.playing && !isLive(m.item)) parts.push('music');
    update(...parts);
  }, 1000);

  // ---------- Actions ----------
  const act = (a, v, ev) => {
    const p = S.pomo, m = S.music, r = S.rec;
    switch (a) {
      case 'toggle-island': S.open ? closeIsland() : openIsland(); return;
      case 'home': S.page = 'utilities'; m.search = false; m.menu = false; render(); return;
      case 'page': S.page = v; m.menu = false; if (v !== 'utilities') m.search = false; render(); return;
      case 'quit': closeIsland(); toast('Nook', 'Quit is turned off in the demo, so the island just closed.'); return;

      case 'pomo-start': pomoStart(); break;
      case 'pomo-off': p.on = false; if (S.overlay === 'break') S.overlay = null; renderLayer(); break;
      case 'pomo-break': startBreak(); break;
      case 'pomo-focus': backToFocus(); break;
      case 'pomo-snooze': snooze(); break;
      case 'pomo-focus-len':
        if (v === 'custom') p.focusCustom = 30;
        else if (v === 'inc' || v === 'dec') p.focusCustom = stepCustom(p.focusCustom, v === 'inc' ? 1 : -1, 1, 120);
        else { p.focusCustom = null; p.focus = +v; }
        applyFocusLen(); break;
      case 'pomo-brk-len':
        if (v === 'custom') p.brkCustom = 15;
        else if (v === 'inc' || v === 'dec') p.brkCustom = stepCustom(p.brkCustom, v === 'inc' ? 1 : -1, 1, 60);
        else { p.brkCustom = null; p.brk = +v; }
        break;
      case 'pomo-style': p.style = v; if (v === 'notification' && S.perms.notif === 'notAsked') ask('notif'); break;

      case 'power-start': powerStart(); return;
      case 'power-cancel': S.power.running = false; notify('Shutdown Cancelled', 'Your Mac will stay on.'); break;
      case 'overlay-ok': S.overlay = null; renderLayer(); break;

      case 'music-toggle': if (!m.started) play(m.item); else m.playing = !m.playing; m.menu = false; break;
      case 'music-skip': skip(+v); break;
      case 'music-seekby': m.pos = clamp(m.pos + +v, 0, dur(m.item)); break;
      case 'music-menu': m.menu = !m.menu; break;
      case 'music-autoplay': m.autoplay = !m.autoplay; m.menu = false; break;
      case 'music-station': play(allStations().find(s => s.id === v)); break;
      case 'music-recent': play(m.recent.find(s => s.id === v)); break;
      case 'music-save': if (isUnsaved(m.item)) { m.saved.push({ ...m.item, emoji: '⭐' }); m.item = m.saved[m.saved.length - 1]; } break;
      case 'music-quiet':
        if (v === 'custom') m.quietCustom = 15;
        else if (v === 'inc' || v === 'dec') m.quietCustom = stepCustom(m.quietCustom, v === 'inc' ? 1 : -1, 1, 60);
        else { m.quietCustom = null; m.quiet = +v; }
        break;
      case 'music-open': m.menu = false; if (m.playing) { m.playing = false; toast('Open in YouTube', `The real Nook opens youtube.com at ${clock(m.pos)} and pauses, so the two don't overlap.`); } break;

      case 'search-open': m.search = true; m.menu = false; m.sel = 0; render(); setTimeout(() => $('#d-q')?.focus()); return;
      case 'search-close': m.search = false; render(); return;
      case 'search-filter': m.filter = v; m.sel = 0; rerenderSearch(); $('#d-q')?.focus(); return;
      case 'search-query': m.q = v; m.sel = 0; rerenderSearch(); $('#d-q')?.focus(); return;
      case 'search-clear': m.queries = []; rerenderSearch(); return;
      case 'search-play': {
        const x = CATALOG.find(c => c.id === v);
        if (m.q.trim()) m.queries = [m.q.trim(), ...m.queries.filter(q => q !== m.q.trim())].slice(0, 10);
        play(x, ev && (ev.metaKey || ev.ctrlKey)); render(); return;
      }

      case 'rec-source': r.source = v; break;
      case 'rec-sys': r.sys = !r.sys; break;
      case 'rec-mic': if (r.mic) r.mic = false; else { ask('mic', () => { r.mic = true; update(); }); return; } break;
      case 'rec-start': record(); return;
      case 'rec-stop': r.state = 'paused'; break;
      // Stopping from the menu bar opens the island to resume, save or discard
      case 'rec-menubar-stop': r.state = 'paused'; if (!S.open) { openIsland(); return; } break;
      case 'rec-resume': r.state = 'recording'; closeIsland(); return;
      case 'rec-save': closeIsland(); S.save = { name: recordingName(), confirm: false }; renderLayer(); setTimeout(() => { const f = $('#d-save-name'); if (f) { f.focus(); f.setSelectionRange(0, f.value.length - 4); } }); return;
      case 'rec-discard': r.state = 'idle'; r.t = 0; closeIsland(); return;
      case 'save-ok': {
        const name = ($('#d-save-name')?.value.trim() || S.save.name).replace(/(\.mov)?$/i, '.mov');
        S.save = null; r.state = 'idle'; r.t = 0; renderLayer();
        notify('Recording saved', name);
        break;
      }
      case 'save-cancel': S.save.name = $('#d-save-name')?.value || S.save.name; S.save.confirm = true; renderLayer(); return;
      case 'save-back': S.save.confirm = false; renderLayer(); setTimeout(() => $('#d-save-name')?.focus()); return;
      case 'save-delete': S.save = null; r.state = 'idle'; r.t = 0; renderLayer(); break;

      case 'bt-all': S.bt.all = !S.bt.all; break;
      case 'bt-toggle': {
        const d = S.bt.list.find(x => x.id === v);
        S.bt.busy[v] = true;
        setTimeout(() => { d.c = !d.c; if (d.c && !d.b) d.b = d.t === 'speaker' ? '90%' : null; delete S.bt.busy[v]; update('bt'); }, 1100);
        break;
      }

      case 'about-check': S.about.state = 'checking'; update('page'); setTimeout(() => { S.about.state = 'done'; S.about.checked = true; update('page'); }, 1300); return;

      case 'perm': {
        const st = S.perms[v], perm = PERMS.find(x => x.id === v);
        if (st === 'notAsked') { ask(v, () => update('page')); return; }
        if (st === 'denied') { S.perms[v] = 'granted'; toast('System Settings', `The real Nook opens System Settings so you can turn on ${perm.title}. Done for you here.`); }
        else toast('System Settings', `Opens Privacy & Security › ${perm.title.split(' ›')[0]}.`);
        update('page'); return;
      }
      case 'alert-yes': case 'alert-no': {
        const al = S.alert; S.alert = null;
        S.perms[al.perm] = a === 'alert-yes' ? 'granted' : 'denied';
        renderLayer();
        if (a === 'alert-yes') al.then && al.then(); else al.onDeny && al.onDeny();
        S.page === 'permissions' ? update('page') : update();
        return;
      }
    }
    update();
  };

  stage.addEventListener('click', e => {
    const t = e.target.closest('[data-a]');
    if (t && stage.contains(t) && !t.disabled) {
      if (S.music.menu && !t.closest('.d-menu') && t.dataset.a !== 'music-menu') S.music.menu = false;
      act(t.dataset.a, t.dataset.v, e);
      return;
    }
    if (S.music.menu && !e.target.closest('.d-menu')) { S.music.menu = false; update('music'); return; }
    // Clicking the desktop folds the island away, like clicking another app
    if (S.open && !e.target.closest('.d-island') && !e.target.closest('.d-menubar') && !e.target.closest('.d-toasts') && !e.target.closest('.d-layer > *')) closeIsland();
  });
  stage.addEventListener('pointerover', e => {
    const row = e.target.closest('.d-result');
    if (!row || +row.dataset.i === S.music.sel) return;
    stage.querySelectorAll('.d-result.sel').forEach(x => x.classList.remove('sel'));
    row.classList.add('sel'); S.music.sel = +row.dataset.i;
  });

  // Search: type to filter, ↑↓ to choose, ⏎ to play, ⌘⏎ to play and save, Esc to go back
  stage.addEventListener('input', e => {
    if (e.target.id !== 'd-q') return;
    S.music.q = e.target.value; S.music.sel = 0;
    rerenderSearch();
  });
  stage.addEventListener('keydown', e => {
    if (e.target.id !== 'd-q') return;
    const list = results(), m = S.music;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); m.sel = clamp(m.sel + (e.key === 'ArrowDown' ? 1 : -1), 0, list.length - 1); rerenderSearch(); }
    else if (e.key === 'Enter' && list[m.sel]) { e.preventDefault(); act('search-play', list[m.sel].id, e); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); m.search = false; render(); }
  });

  // Esc works while the pointer or focus was last in the demo
  let active = false;
  document.addEventListener('pointerdown', e => { active = root.contains(e.target); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && S.save && !S.save.confirm && active) { e.preventDefault(); act('save-ok'); return; }
    if (e.key !== 'Escape' || !active || S.alert) return;
    if (S.area) { S.area = null; renderLayer(); return; }
    if (S.save) { act(S.save.confirm ? 'save-back' : 'save-cancel'); return; }
    if (S.overlay === 'break') { backToFocus(); update(); return; }
    if (S.overlay) { S.overlay = null; renderLayer(); return; }
    if (S.music.menu) { S.music.menu = false; update('music'); return; }
    if (S.open) closeIsland();
  });

  // ---------- Dragging: power ruler, volume, seek bar, area selection ----------
  let drag = null;
  const fraction = (el, x) => { const r = el.getBoundingClientRect(); return clamp((x - r.left) / r.width, 0, 1); };
  const applyDrag = e => {
    if (!drag) return;
    const el = stage.querySelector(`[data-drag="${drag}"]`);
    if (!el) return;
    if (drag === 'ruler') { const r = el.getBoundingClientRect(), s = r.width / 187; const i = clamp(Math.floor((e.clientX - r.left) / s / 8), 0, 23); if ((i + 1) * 5 !== S.power.min) { S.power.min = (i + 1) * 5; update('power'); } }
    if (drag === 'vol') { S.music.vol = fraction(el, e.clientX); update('music'); }
    if (drag === 'seek') { S.music.pos = Math.round(fraction(el, e.clientX) * dur(S.music.item)); update('music'); }
    if (drag === 'area' && S.area?.start) {
      const r = el.getBoundingClientRect(), s = r.width / stage.offsetWidth;
      const x = (e.clientX - r.left) / s, y = (e.clientY - r.top) / s, a = S.area.start;
      S.area.rect = { x: Math.min(a.x, x), y: Math.min(a.y, y), w: Math.abs(x - a.x), h: Math.abs(y - a.y) };
      renderLayer();
    }
  };
  stage.addEventListener('pointerdown', e => {
    const el = e.target.closest('[data-drag]');
    if (!el) return;
    drag = el.dataset.drag;
    if (drag === 'area') { const r = el.getBoundingClientRect(), s = r.width / stage.offsetWidth; S.area.start = { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }; }
    e.preventDefault();
    applyDrag(e);
  });
  document.addEventListener('pointermove', applyDrag);
  document.addEventListener('pointerup', () => {
    if (drag === 'area' && S.area) {
      const r = S.area.rect;
      S.area = null; renderLayer();
      if (r && r.w > 20 && r.h > 20) { S.rec.state = 'recording'; S.rec.t = 0; }
      update();
    }
    drag = null;
  });
  stage.addEventListener('keydown', e => {
    if (!e.target.matches('[data-drag="ruler"]')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') S.power.min = Math.min(120, S.power.min + 5);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') S.power.min = Math.max(5, S.power.min - 5);
    else return;
    e.preventDefault(); update('power'); $('[data-drag="ruler"]')?.focus();
  });

  // ---------- Controls under the demo ----------
  const fast = document.getElementById('demo-fast');
  if (fast) fast.addEventListener('change', () => { S.fast = fast.checked; update(); });
  const reset = document.getElementById('demo-reset');
  if (reset) reset.addEventListener('click', () => { S = fresh(); S.fast = !!fast?.checked; $('.d-toasts').innerHTML = ''; render(); });

  render();
})();
