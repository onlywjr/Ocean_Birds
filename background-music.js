(() => {
  const page = location.pathname.split('/').pop().replace(/\.html?$/i, '');
  const musicPages = new Set(['card', 'choice', 'game', 'guess', 'hit', 'main-page', 'movie']);
  if (!musicPages.has(page)) return;

  const audio = new Audio(new URL(`assets/sounds/${page}.mp3`, document.baseURI));
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = page === 'movie' ? 0.1 : 0.24;

  const startMusic = () => {
    audio.play().then(() => {
      document.removeEventListener('pointerdown', startMusic);
      document.removeEventListener('keydown', startMusic);
    }).catch(() => {
      // Browsers may block autoplay until the visitor interacts with the page.
    });
  };

  startMusic();
  document.addEventListener('pointerdown', startMusic);
  document.addEventListener('keydown', startMusic);
})();