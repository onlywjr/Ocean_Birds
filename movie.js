(() => {
  const video = document.querySelector('#coast-video');
  const windowEl = document.querySelector('#lyrics-window');
  const track = document.querySelector('#lyrics-track');
  const progressBar = document.querySelector('#lyrics-progress');
  const currentLabel = document.querySelector('#movie-current');
  const durationLabel = document.querySelector('#movie-duration');
  if (!video || !windowEl || !track) return;

  let animationFrame;
  function timeLabel(seconds) {
    const value = Math.max(0, Math.floor(seconds || 0));
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  }
  function syncLyrics() {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const fraction = duration ? Math.min(1, Math.max(0, video.currentTime / duration)) : 0;
    const travel = track.scrollHeight + windowEl.clientHeight * .33;
    const y = windowEl.clientHeight * .68 - fraction * travel;
    track.style.transform = `translate3d(0, ${y}px, 0)`;
    progressBar.style.transform = `scaleX(${fraction})`;
    currentLabel.textContent = timeLabel(video.currentTime);
    if (duration) durationLabel.textContent = timeLabel(duration);
  }
  function animate() {
    syncLyrics();
    if (!video.paused && !video.ended) animationFrame = requestAnimationFrame(animate);
  }
  function stopAnimation() {
    cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
  }

  video.addEventListener('loadedmetadata', syncLyrics);
  video.addEventListener('durationchange', syncLyrics);
  video.addEventListener('timeupdate', syncLyrics);
  video.addEventListener('seeking', syncLyrics);
  video.addEventListener('seeked', syncLyrics);
  video.addEventListener('play', () => {
    if (video.ended || video.currentTime >= video.duration) video.currentTime = 0;
    stopAnimation();
    animationFrame = requestAnimationFrame(animate);
  });
  video.addEventListener('pause', stopAnimation);
  video.addEventListener('ended', () => { stopAnimation(); syncLyrics(); });
  window.addEventListener('resize', syncLyrics);
  syncLyrics();
})();
