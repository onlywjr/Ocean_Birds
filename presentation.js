(() => {
  const scenes = [...document.querySelectorAll('[data-scene]')];
  if (!scenes.length) return;
  if (document.body.classList.contains('bird-guide')) return;
  const current = () => Math.max(0, scenes.findIndex(scene => !scene.hidden));
  const controls = document.createElement('nav');
  controls.className = 'deck-controls';
  controls.setAttribute('aria-label', '場景導覽');
  controls.innerHTML = '<button type="button" data-step="-1" aria-label="上一頁">←</button><span class="deck-count" aria-live="polite"></span><button type="button" data-step="1" aria-label="下一頁">→</button>';
  document.body.append(controls);
  const count = controls.querySelector('.deck-count');
  function show(index, direction = 1) {
    const next = Math.max(0, Math.min(scenes.length - 1, index));
    scenes.forEach((scene, i) => {
      scene.hidden = i !== next;
      scene.classList.toggle('scene-enter', i === next);
      scene.style.setProperty('--scene-direction', direction > 0 ? '1' : '-1');
    });
    count.textContent = `${String(next + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    controls.querySelector('[data-step="-1"]').disabled = next === 0;
    controls.querySelector('[data-step="1"]').disabled = next === scenes.length - 1;
    document.dispatchEvent(new CustomEvent('deckchange', { detail: { index: next } }));
  }
  const step = delta => show(current() + delta, delta);
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-step]');
    if (button) step(Number(button.dataset.step));
  });
  document.addEventListener('keydown', event => {
    if (/INPUT|TEXTAREA|SELECT|VIDEO|AUDIO|BUTTON/.test(event.target.tagName) || event.target.closest('a') || event.target.isContentEditable) return;
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); step(1); }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); step(-1); }
    if (event.key === 'Home') show(0, -1);
    if (event.key === 'End') show(scenes.length - 1, 1);
  });
  let startX = 0;
  document.addEventListener('touchstart', event => { startX = event.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', event => {
    const delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 70) step(delta < 0 ? 1 : -1);
  }, { passive: true });
  show(Math.max(0, scenes.findIndex(scene => !scene.hidden)));
  document.addEventListener('deckchange', event => {
    if (event.detail.index !== 0) document.querySelectorAll('video,audio').forEach(media => media.pause());
  });
})();
