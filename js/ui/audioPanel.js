// Inspector tab: one narration track + one background-music track for the whole movie.

import { h, field, num, range, checkbox, button, fmtTime, round } from './dom.js';
import { totalDuration } from '../engine/renderer.js';

export function renderAudioPanel(app, root) {
  const p = app.project;
  const n = p.narration || (p.narration = { audioId: null, volume: 1, offset: 0 });
  const m = p.music || (p.music = { audioId: null, volume: 0.35, loop: true });
  const total = totalDuration(p);

  const pct = (v) => Math.round(v * 100) + '%';
  const volumeRow = (obj, key, setLive, max = 1) => {
    const lbl = h('span', { class: 'small muted', style: { minWidth: '40px', textAlign: 'right' } }, pct(obj[key] ?? 1));
    const slider = range(obj[key] ?? 1, (v) => { obj[key] = v; lbl.textContent = pct(v); setLive(v); app.commitLazy('volume'); }, { min: 0, max, step: 0.01 });
    return field('Volume', h('div', { class: 'row' }, slider, lbl));
  };
  const loadFile = async (file, obj, label) => {
    try {
      app.toast(`Loading ${label}…`);
      const clip = await app.store.add(file, file.name);
      obj.audioId = clip.id; app.pause(); app.commit(label);
      app.toast(`${label}: ${file.name} (${fmtTime(clip.duration)})`);
    } catch (err) { app.toast(`Could not decode that file: ${err.message}`, true); }
  };
  const filePicker = (obj, label) => h('input', { type: 'file', accept: 'audio/*,video/mp4', style: { fontSize: '12px' }, onChange: (e) => { const f = e.target.files[0]; if (f) loadFile(f, obj, label); e.target.value = ''; } });
  const preview = (obj) => button('▶ Preview', () => app.player.preview(obj.audioId), 'tiny');

  // ---------- narration ----------
  const ns = h('div', { class: 'section' }, h('h3', {}, '🎙 Narration (one file for the whole movie)'));
  ns.append(h('div', { class: 'small muted', style: { marginBottom: '6px' } }, 'Starts at the beginning of scene 1 (or at the offset below) and plays straight through all scenes.'));
  ns.append(field('Narration file (mp3, wav, m4a, ogg…)', filePicker(n, 'Narration')));
  if (n.audioId) {
    const clip = app.store.get(n.audioId);
    ns.append(h('div', { class: 'row' },
      h('span', { class: 'badge ' + (clip ? 'ok' : 'warn') }, clip ? `🎙 ${clip.name} · ${fmtTime(clip.duration)}` : '⚠ file missing – upload again'),
      clip ? preview(n) : null,
      button('remove', () => { n.audioId = null; app.pause(); app.commit('remove narration'); }, 'tiny fixed')));
    ns.append(volumeRow(n, 'volume', (v) => app.player.setNarrationVolume(v)));
    ns.append(field('Start offset (seconds)', num(n.offset || 0, (v) => { n.offset = Number.isFinite(v) ? v : 0; app.pause(); app.commit('narration offset'); }, { min: -600, max: 3600, step: 0.1, width: '90px' })));
    if (clip) {
      const end = (n.offset || 0) + clip.duration;
      if (end > total + 0.05) {
        ns.append(h('div', { class: 'note warn' }, `Narration ends at ${fmtTime(end)} but the movie is only ${fmtTime(total)} long – the end would be cut off. `,
          button('Extend last scene to fit', () => {
            const last = p.scenes[p.scenes.length - 1]; if (!last) return;
            last.duration = round(last.duration + (end - total) + 0.5, 1); app.commit('fit narration');
          }, 'tiny')));
      } else ns.append(h('div', { class: 'small muted' }, `Narration ends at ${fmtTime(end)} · movie length ${fmtTime(total)}`));
    }
  }
  root.append(ns);

  // ---------- background music ----------
  const ms = h('div', { class: 'section' }, h('h3', {}, '🎵 Background music (one file for the whole movie)'));
  ms.append(field('Music file (mp3, wav, m4a, ogg…)', filePicker(m, 'Music')));
  if (m.audioId) {
    const clip = app.store.get(m.audioId);
    ms.append(h('div', { class: 'row' },
      h('span', { class: 'badge ' + (clip ? 'ok' : 'warn') }, clip ? `🎵 ${clip.name} · ${fmtTime(clip.duration)}` : '⚠ file missing – upload again'),
      clip ? preview(m) : null,
      button('remove', () => { m.audioId = null; app.pause(); app.commit('remove music'); }, 'tiny fixed')));
    ms.append(volumeRow(m, 'volume', (v) => app.player.setMusicVolume(v)));
    ms.append(checkbox('Loop until the movie ends', m.loop !== false, (v) => { m.loop = v; app.pause(); app.commit('loop'); }));
    ms.append(checkbox('Fade music out at the end', p.fadeOut !== false, (v) => { p.fadeOut = v; app.commit('fade'); }));
  } else ms.append(h('div', { class: 'small muted' }, 'Tip: keep the music around 15–35% so it does not drown the voices.'));
  root.append(ms);

  root.append(h('div', { class: 'note' }, 'Narration, music and any recorded / uploaded dialog audio are mixed into every export (MP4 fast export, WebM, and live recording). Browser text-to-speech voices are the only audio that needs the live-recording method.'));
}
