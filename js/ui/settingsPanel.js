// Inspector tab: project settings, music, export shortcuts, help.

import { h, field, select, num, range, textInput, checkbox, button } from './dom.js';
import { ASPECTS } from './stage.js';

export function renderSettingsPanel(app, root) {
  const p = app.project;
  const sec = h('div', { class: 'section' }, h('h3', {}, 'Project'));
  sec.append(h('div', { class: 'grid2' },
    field('Aspect ratio', select(Object.keys(ASPECTS).map((k) => [k, k + (k === '9:16' ? ' (shorts / reels)' : k === '16:9' ? ' (YouTube)' : '')]), p.aspect, (v) => { p.aspect = v; app.commit('aspect'); app.stage.resize(); })),
    field('Speech bubble style', select([['rounded', 'Rounded'], ['box', 'Comic box'], ['thought', 'Thought cloud'], ['shout', 'Shout']], p.bubbleStyle, (v) => { p.bubbleStyle = v; app.commit('bubble'); }))));
  sec.append(h('div', { class: 'grid2' },
    field(' ', checkbox('Fade out at the end', p.fadeOut !== false, (v) => { p.fadeOut = v; app.commit('fade'); })),
    field('Watermark text', textInput(p.watermark || '', (v) => { p.watermark = v; app.commit('watermark'); }, { placeholder: 'optional' }))));
  root.append(sec);

  root.append(h('div', { class: 'note' }, 'Narration and background music now live in the ', h('b', {}, 'Audio'), ' tab.', ' ', button('Open Audio tab', () => { app.tab = 'audio'; app.rerenderPanels(); }, 'tiny')));

  const help = h('div', { class: 'section' }, h('h3', {}, 'How to use'));
  help.append(h('ol', { class: 'small', style: { paddingLeft: '18px', margin: 0, lineHeight: 1.6 } },
    h('li', {}, h('b', {}, 'Characters tab:'), ' add ready-made characters (farmer, police, pilot, air hostess…) or build your own.'),
    h('li', {}, h('b', {}, 'Scene tab:'), ' pick one of 50 backgrounds, duration, time of day, weather and camera.'),
    h('li', {}, h('b', {}, 'Actors tab:'), ' add up to 3 characters, drag them on the stage, set facing and add actions (walk to a point, dig, laugh…).'),
    h('li', {}, h('b', {}, 'Dialog tab:'), ' write lines, choose browser voice / record / upload, set the start time. Use Auto-sequence so they never overlap.'),
    h('li', {}, h('b', {}, 'Export:'), ' MP4 is rendered entirely in your browser.')));
  help.append(h('div', { class: 'small muted', style: { marginTop: '8px' } }, h('kbd', {}, 'Space'), ' play/pause · ', h('kbd', {}, '←'), h('kbd', {}, '→'), ' step 0.1 s · ', h('kbd', {}, 'Ctrl+Z'), ' undo · ', h('kbd', {}, 'Ctrl+wheel'), ' zoom timeline · double-click a timeline track to add'));
  root.append(help);
}
