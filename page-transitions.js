(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  window.transitionPageContent = (update, imageSource) => {
    const updateWhenReady = () => {
      if (reducedMotion.matches || typeof document.startViewTransition !== 'function') {
        update();
        return;
      }
      document.startViewTransition(update);
    };

    if (!imageSource) {
      updateWhenReady();
      return;
    }

    const image = new Image();
    image.src = imageSource;
    if (image.complete) {
      Promise.resolve(image.decode?.()).catch(() => {}).finally(updateWhenReady);
    } else {
      image.onload = () => Promise.resolve(image.decode?.()).catch(() => {}).finally(updateWhenReady);
      image.onerror = updateWhenReady;
    }
  };
})();
